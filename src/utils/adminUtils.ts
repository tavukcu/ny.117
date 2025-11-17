// Admin kullanıcı kontrolü için yardımcı fonksiyonlar

export const ADMIN_EMAILS = [
  'kaniyedincer@gmail.com'
];

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const checkAdminAccess = async (user: any): Promise<boolean> => {
  if (!user || !user.email) return false;
  return isAdminEmail(user.email);
};

export const getAdminEmail = (): string => {
  return ADMIN_EMAILS[0];
}; 