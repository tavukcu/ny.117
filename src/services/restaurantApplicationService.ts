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
  cuisineType: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
  restaurantId?: string;
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
  static async createApplication(data: Omit<SimpleRestaurantApplication, 'id' | 'status' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
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
        cuisineType: data.cuisineType,
        note: data.note,
        status: data.status,
        restaurantId: data.restaurantId,
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

    const application = applicationSnap.data() as any;

    const restaurantPayload: Omit<RestaurantInfo, 'id' | 'createdAt' | 'updatedAt'> = {
      name: application.restaurantName,
      description: application.note || 'Neyisek restoranı',
      categoryIds: application.cuisineType ? [application.cuisineType] : [],
      address: {
        street: application.fullAddress,
        city: 'İstanbul',
        district: '',
        zipCode: '',
        country: 'Türkiye',
        coordinates: { lat: 0, lng: 0 },
      },
      phone: application.phone,
      email: '',
      website: '',
      coverImageUrl: '',
      workingHours: defaultWorkingHours,
      deliveryRadius: 5,
      minimumOrderAmount: 100,
      deliveryFee: 0,
      estimatedDeliveryTime: 30,
      isOpen: false,
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

  static async deleteApplication(applicationId: string) {
    await deleteDoc(doc(db, COLLECTION, applicationId));
  }
}

