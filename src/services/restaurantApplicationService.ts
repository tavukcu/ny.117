import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RestaurantService } from './restaurantService';
import type { RestaurantInfo } from '@/types';

export interface SimpleRestaurantApplication {
  id: string;
  restaurantName: string;
  contactName: string;
  phone: string;
  fullAddress: string;
  city: string;
  district: string;
  cuisineType: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
  restaurantId?: string;
  source: 'public_form' | 'admin';
}

const COLLECTION = 'restaurantApplications';

const defaultWorkingHours = {
  monday: { open: '09:00', close: '22:00', isOpen: true },
  tuesday: { open: '09:00', close: '22:00', isOpen: true },
  wednesday: { open: '09:00', close: '22:00', isOpen: true },
  thursday: { open: '09:00', close: '22:00', isOpen: true },
  friday: { open: '09:00', close: '23:00', isOpen: true },
  saturday: { open: '09:00', close: '23:00', isOpen: true },
  sunday: { open: '10:00', close: '21:00', isOpen: true },
};

export class RestaurantApplicationService {
  static async createApplication(
    data: Omit<SimpleRestaurantApplication, 'id' | 'status' | 'createdAt' | 'source'>
  ) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      source: 'public_form',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getApplications(): Promise<SimpleRestaurantApplication[]> {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        restaurantName: data.restaurantName,
        contactName: data.contactName,
        phone: data.phone,
        fullAddress: data.fullAddress,
        city: data.city,
        district: data.district,
        cuisineType: data.cuisineType,
        note: data.note,
        status: data.status,
        restaurantId: data.restaurantId,
        source: data.source || 'public_form',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as SimpleRestaurantApplication;
    });
  }

  static async approveApplication(applicationId: string) {
    const applicationRef = doc(db, COLLECTION, applicationId);
    const applicationSnap = await getDoc(applicationRef);
    if (!applicationSnap.exists()) {
      throw new Error('Başvuru bulunamadı');
    }

    const application = applicationSnap.data() as SimpleRestaurantApplication;
    const normalizedCity = application.city?.trim() || 'Belirtilmedi';
    const normalizedDistrict = application.district?.trim() || 'Belirtilmedi';
    const normalizedAddress =
      application.fullAddress?.trim() ||
      `${normalizedDistrict}, ${normalizedCity}`.trim() ||
      'Adres belirtilmedi';
    const normalizedPhone = application.phone?.trim() || '';

    const restaurantPayload: Omit<RestaurantInfo, 'id' | 'createdAt' | 'updatedAt'> = {
      name: application.restaurantName,
      description: application.note || 'Neyisek restoranı',
      categoryIds: application.cuisineType ? [application.cuisineType] : [],
      address: {
        street: normalizedAddress,
        city: normalizedCity,
        district: normalizedDistrict,
        zipCode: '',
        country: 'Türkiye',
        coordinates: { lat: 0, lng: 0 },
      },
      phone: normalizedPhone,
      email: '',
      website: '',
      coverImageUrl: '',
      workingHours: defaultWorkingHours,
      deliveryRadius: 5,
      minimumOrderAmount: 100,
      deliveryFee: 0,
      estimatedDeliveryTime: 30,
      isOpen: false,
      isActive: false,
      rating: 0,
      reviewCount: 0,
      commissionRate: 0.09,
      notifications: {
        telegram: { isEnabled: false },
        whatsapp: { isEnabled: false },
        email: { isEnabled: true },
      },
    };

    const restaurantId = await RestaurantService.createRestaurant(restaurantPayload);

    await updateDoc(applicationRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
      restaurantId,
      approvedAt: serverTimestamp(),
    });

    return restaurantId;
  }

  static async rejectApplication(applicationId: string) {
    await updateDoc(doc(db, COLLECTION, applicationId), {
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteApplication(applicationId: string) {
    await deleteDoc(doc(db, COLLECTION, applicationId));
  }
}

