'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUserPresence } from '@/hooks/useUserPresence';
import { useCart } from '@/hooks/useCart';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Home,
  UtensilsCrossed,
  Phone,
  MapPin,
  LogOut,
  Settings,
  ChefHat,
  ChevronDown
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const NotificationCenter = dynamic(() => import('./NotificationCenter'), {
  ssr: false,
  loading: () => <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
});

// Header komponenti
export default function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { totalItems: cartItemsCount } = useCart();
  const [guestUser, setGuestUser] = useState<any>(null);
  const [guestDataTrigger, setGuestDataTrigger] = useState(0);

  // Kullanıcı presence sistemini başlat
  useCurrentUserPresence();

  // localStorage'dan misafir kullanıcı bilgilerini yükle
  useEffect(() => {
    console.log('Header useEffect çalıştı. user:', user, 'guestDataTrigger:', guestDataTrigger);
    
    if (!user) {
      // Son sipariş verilen misafir kullanıcı bilgilerini al
      const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
      console.log('localStorage guestOrders:', guestOrders);
      
      if (guestOrders.length > 0) {
        // En son siparişin bilgilerini al
        const lastOrder = guestOrders[guestOrders.length - 1];
        const newGuestUser = {
          name: lastOrder.customerName || 'Misafir Kullanıcı',
          phone: lastOrder.phone,
          ordersCount: guestOrders.length
        };
        console.log('Yeni guestUser set ediliyor:', newGuestUser);
        setGuestUser(newGuestUser);
      } else {
        console.log('guestOrders boş, guestUser null yapılıyor');
        setGuestUser(null);
      }
    } else {
      console.log('Kayıtlı kullanıcı var, guestUser null yapılıyor');
      setGuestUser(null);
    }
  }, [user, guestDataTrigger]);

  // Bildirim merkezinin gösterilip gösterilmeyeceğini belirle
  const shouldShowNotifications = user && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/restaurant') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/profile') ||
    pathname === '/'
  );

  // Mobil menüyü açma/kapama fonksiyonu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Çıkış yapma fonksiyonu
  const handleLogout = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Misafir oturumunu sonlandırma
  const handleGuestLogout = () => {
    try {
      console.log('Misafir çıkış işlemi başlatılıyor...');
      console.log('Mevcut guestUser:', guestUser);
      
      // localStorage'ı temizle
      localStorage.removeItem('guestOrders');
      console.log('localStorage temizlendi');
      
      // Misafir kullanıcı state'ini sıfırla
      setGuestUser(null);
      console.log('guestUser state sıfırlandı');
      
      // Menüleri kapat
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      
      // useEffect'i tetikle
      setGuestDataTrigger(prev => prev + 1);
      console.log('guestDataTrigger güncellendi');
      
      // Ana sayfaya yönlendir
      router.push('/');
      
      // Toast mesajı
      toast.success('Misafir oturumu sonlandırıldı');
    } catch (error) {
      console.error('Misafir oturumu sonlandırma hatası:', error);
      toast.error('Oturum sonlandırılırken bir hata oluştu');
    }
  };

  // Kullanıcı avatarı render fonksiyonu
  const renderUserAvatar = (size: 'small' | 'default' | 'large' = 'default') => {
    const sizeClasses = {
      small: 'w-7 h-7 sm:w-8 sm:h-8',
      default: 'w-10 h-10',
      large: 'w-12 h-12'
    };

    const textSizeClasses = {
      small: 'text-xs sm:text-sm',
      default: 'text-base',
      large: 'text-lg'
    };

    if (user?.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt={user.displayName || 'Profil resmi'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
          onError={(e) => {
            // Resim yüklenemezse fallback'e geç
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList?.remove('hidden');
          }}
        />
      );
    }

    // Fallback avatar (gradient background with initials)
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center shadow-sm`}>
        <span className={`text-white font-bold ${textSizeClasses[size]}`}>
          {user?.displayName?.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>
    );
  };

  // User display info - kayıtlı veya misafir kullanıcı için
  const getUserDisplayInfo = () => {
    if (user) {
      return {
        name: user.displayName,
        email: user.email,
        role: user.role === 'restaurant' ? 'Restoran' : user.isAdmin ? 'Admin' : 'Müşteri',
        isGuest: false
      };
    } else if (guestUser) {
      return {
        name: guestUser.name,
        email: `${guestUser.ordersCount || 0} sipariş`,
        role: 'Misafir',
        isGuest: true
      };
    }
    return null;
  };

  const userInfo = getUserDisplayInfo();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-md sticky top-0">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 xl:h-20">
          {/* Logo Section */}
          <Link href="/" className="group flex items-center space-x-1 sm:space-x-1 transition-all duration-300 hover:scale-105">
            
            {/* NeYisek Logo */}
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="NeYisek Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 object-contain rounded-lg drop-shadow-sm group-hover:rotate-6 transition-transform duration-300" 
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { href: '/', icon: Home, label: 'Ana Sayfa' },
              { href: '/menu', icon: UtensilsCrossed, label: 'Menü' },
              { href: '/menu', icon: ChefHat, label: 'Kategoriler' },
              { href: '/contact', icon: Phone, label: 'İletişim' },
              { href: '/delivery-areas', icon: MapPin, label: 'Teslimat' },
              // Misafir kullanıcı için siparişlerim
              ...(guestUser && !user ? [{ href: '/guest-profile', icon: ShoppingCart, label: 'Siparişlerim' }] : [])
            ].map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="group relative px-4 py-2 rounded-xl transition-all duration-200 hover:bg-green-50"
              >
                <div className="flex items-center space-x-2 text-gray-700 group-hover:text-green-600 transition-colors duration-200">
                  {typeof item.icon === 'string' ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : (
                    <item.icon className="h-4 w-4" />
                  )}
                  <span className="font-medium">{item.label}</span>
                </div>
                
                {/* Simple underline */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-green-500 group-hover:w-3/4 transition-all duration-200 rounded-full"></div>
              </Link>
            ))}
            
            {/* Admin/Restaurant Panel Links */}
            {user && user.isAdmin && (
              <Link 
                href="/admin" 
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ml-6"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Admin Panel</span>
                </div>
              </Link>
            )}
            
            {user && user.role === 'restaurant' && (
              <Link 
                href="/restaurant" 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ml-6"
              >
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-4 w-4" />
                  <span>Restoran Panel</span>
                </div>
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Free Delivery CTA Button - sadece giriş yapmamış kullanıcılar için */}
            {!user && !guestUser && (
              <Link 
                href="/register"
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-pulse"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-bounce"
                >
                  <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"></path>
                  <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"></path>
                  <circle cx="7" cy="18" r="2"></circle>
                  <path d="M15 18H9"></path>
                  <circle cx="17" cy="18" r="2"></circle>
                </svg>
                <span className="text-sm">Ücretsiz Teslimat</span>
              </Link>
            )}
            
            {/* Cart Icon */}
            <Link 
              href="/cart" 
              className="relative p-1.5 sm:p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 hover:text-green-600 transition-colors duration-300" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Section */}
            {user || guestUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notification Center - sadece kayıtlı kullanıcılar için */}
                {shouldShowNotifications && user && <NotificationCenter />}
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                  >
                    {/* User Avatar */}
                    <div className="relative">
                      {user ? renderUserAvatar('small') : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">
                            {guestUser?.name?.charAt(0).toUpperCase() || 'M'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user ? user.displayName : guestUser?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user ? (user.role === 'admin' ? 'Yönetici' : user.role === 'restaurant' ? 'Restoran' : 'Müşteri') : 'Misafir'}
                      </div>
                    </div>
                    
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 transition-transform duration-300" style={{
                      transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {user ? renderUserAvatar('default') : (
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {guestUser?.name?.charAt(0).toUpperCase() || 'M'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user ? user.displayName : guestUser?.name}</div>
                            <div className="text-sm text-gray-500">
                              {user ? user.email : `${guestUser?.ordersCount || 0} sipariş`}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        {/* Kayıtlı kullanıcı menüleri */}
                        {user && (
                          <>
                            <Link 
                              href="/profile" 
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>Profilim</span>
                            </Link>
                            <Link 
                              href="/orders" 
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Siparişlerim</span>
                            </Link>
                        
                        {/* Misafir kullanıcı menüleri */}
                        {!user && guestUser && (
                          <>
                            <Link 
                              href="/guest-profile" 
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>Profilim</span>
                            </Link>
                            <Link 
                              href="/guest-profile" 
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Siparişlerim</span>
                            </Link>
                            <Link 
                              href="/orders/track" 
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <MapPin className="h-4 w-4" />
                              <span>Sipariş Takip</span>
                            </Link>
                            <Link 
                              href="/register" 
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>Hesap Oluştur</span>
                            </Link>
                            <button 
                              onClick={() => {
                                handleGuestLogout();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Oturumu Sonlandır</span>
                            </button>
                          </>
                        )}
                            
                            {user.role === 'restaurant' && (
                              <Link 
                                href="/restaurant" 
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium transition-colors duration-200"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <ChefHat className="h-4 w-4" />
                                <span>Restoran Paneli</span>
                              </Link>
                            )}
                            
                            {user.isAdmin && (
                              <Link 
                                href="/admin" 
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium transition-colors duration-200"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Settings className="h-4 w-4" />
                                <span>Admin Paneli</span>
                              </Link>
                            )}
                          </>
                        )}
                        
                        {/* Misafir kullanıcı için özel menü */}
                        {guestUser && (
                          <Link 
                            href="/account" 
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Hesap Oluştur</span>
                          </Link>
                        )}
                        
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button 
                            onClick={() => {
                              if (guestUser) {
                                handleGuestLogout();
                              } else {
                                handleLogout();
                              }
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>{guestUser ? 'Oturumu Sonlandır' : 'Çıkış Yap'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link 
                href="/account" 
                className="p-1.5 sm:p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 hover:text-green-600 transition-colors duration-300" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {/* Navigation Links */}
              {[
                { href: '/', icon: Home, label: 'Ana Sayfa' },
                { href: '/menu', icon: UtensilsCrossed, label: 'Menü' },
                { href: '/contact', icon: Phone, label: 'İletişim' },
                { href: '/delivery-areas', icon: MapPin, label: 'Teslimat Alanları' }
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {typeof item.icon === 'string' ? (
                    <span className="text-xl">{item.icon}</span>
                  ) : (
                    <item.icon className="h-5 w-5" />
                  )}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* User Section */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                      <div className="relative">
                        {renderUserAvatar('default')}
                        {/* Fallback için gizli div */}
                        {user?.profileImage && (
                          <div className="hidden w-10 h-10 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user.displayName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    
                    <Link 
                      href="/profile" 
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profilim</span>
                    </Link>
                    
                    <Link 
                      href="/orders" 
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Siparişlerim</span>
                    </Link>
                    
                    {user.role === 'restaurant' && (
                      <Link 
                        href="/restaurant" 
                        className="flex items-center space-x-3 p-3 rounded-lg text-green-600 hover:bg-green-50 font-medium transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ChefHat className="h-5 w-5" />
                        <span>Restoran Paneli</span>
                      </Link>
                    )}
                    
                    {user.isAdmin && (
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-3 p-3 rounded-lg text-purple-600 hover:bg-purple-50 font-medium transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Admin Paneli</span>
                      </Link>
                    )}
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 mt-2"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Çıkış Yap</span>
                    </button>
                  </>
                ) : guestUser ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{guestUser.name}</div>
                        <div className="text-sm text-orange-600">Misafir Kullanıcı</div>
                      </div>
                    </div>
                    
                    <Link 
                      href="/guest-profile" 
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profilim</span>
                    </Link>
                    
                    <Link 
                      href="/guest-profile" 
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Siparişlerim</span>
                    </Link>
                    
                    <Link 
                      href="/orders/track" 
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Sipariş Takip</span>
                    </Link>
                    
                    <Link 
                      href="/register" 
                      className="flex items-center space-x-3 p-3 rounded-lg text-green-600 hover:bg-green-50 font-medium transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Hesap Oluştur</span>
                    </Link>
                    
                    <button 
                      onClick={() => {
                        handleGuestLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 mt-2"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Oturumu Sonlandır</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/account" 
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Müşteri Girişi</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 