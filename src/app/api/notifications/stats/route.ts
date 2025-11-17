import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  NotificationStatus,
  type NotificationRecord,
  type NotificationStats
} from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'day' | 'week' | 'month' || 'day';

    const stats = await getNotificationStats(period);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in notification stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getNotificationStats(period: 'day' | 'week' | 'month' = 'day'): Promise<NotificationStats> {
  const startDate = getStartDate(period);
  
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('createdAt', '>=', startDate)
  );
  
  const snapshot = await getDocs(notificationsQuery);
  const notifications = snapshot.docs.map(doc => doc.data() as NotificationRecord);

  return calculateStats(notifications);
}

function getStartDate(period: 'day' | 'week' | 'month'): Date {
  const now = new Date();
  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function calculateStats(notifications: NotificationRecord[]): NotificationStats {
  const stats: NotificationStats = {
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0,
    deliveryRate: 0,
    readRate: 0,
    failureRate: 0,
    averageDeliveryTime: 0,
    byType: {} as any,
    byChannel: {} as any,
    byHour: {},
    byDay: {}
  };

  let totalDeliveryTime = 0;
  let deliveredCount = 0;

  notifications.forEach(notification => {
    // Genel sayılar
    if (notification.status === NotificationStatus.SENT || 
        notification.status === NotificationStatus.DELIVERED || 
        notification.status === NotificationStatus.READ) {
      stats.totalSent++;
    }
    if (notification.status === NotificationStatus.DELIVERED || 
        notification.status === NotificationStatus.READ) {
      stats.totalDelivered++;
      if (notification.sentAt && notification.deliveredAt) {
        totalDeliveryTime += notification.deliveredAt.getTime() - notification.sentAt.getTime();
        deliveredCount++;
      }
    }
    if (notification.status === NotificationStatus.READ) {
      stats.totalRead++;
    }
    if (notification.status === NotificationStatus.FAILED) {
      stats.totalFailed++;
    }

    // Tür bazında
    if (!stats.byType[notification.type]) {
      stats.byType[notification.type] = { sent: 0, delivered: 0, read: 0, failed: 0 };
    }
    if (notification.status === NotificationStatus.SENT || 
        notification.status === NotificationStatus.DELIVERED || 
        notification.status === NotificationStatus.READ) {
      stats.byType[notification.type].sent++;
    }
    if (notification.status === NotificationStatus.DELIVERED || 
        notification.status === NotificationStatus.READ) {
      stats.byType[notification.type].delivered++;
    }
    if (notification.status === NotificationStatus.READ) {
      stats.byType[notification.type].read++;
    }
    if (notification.status === NotificationStatus.FAILED) {
      stats.byType[notification.type].failed++;
    }

    // Kanal bazında
    if (!stats.byChannel[notification.channel]) {
      stats.byChannel[notification.channel] = { sent: 0, delivered: 0, read: 0, failed: 0 };
    }
    if (notification.status === NotificationStatus.SENT || 
        notification.status === NotificationStatus.DELIVERED || 
        notification.status === NotificationStatus.READ) {
      stats.byChannel[notification.channel].sent++;
    }
    if (notification.status === NotificationStatus.DELIVERED || 
        notification.status === NotificationStatus.READ) {
      stats.byChannel[notification.channel].delivered++;
    }
    if (notification.status === NotificationStatus.READ) {
      stats.byChannel[notification.channel].read++;
    }
    if (notification.status === NotificationStatus.FAILED) {
      stats.byChannel[notification.channel].failed++;
    }

    // Saat bazında
    const hour = notification.createdAt.getHours();
    stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;

    // Gün bazında
    const day = notification.createdAt.toLocaleDateString('tr-TR');
    stats.byDay[day] = (stats.byDay[day] || 0) + 1;
  });

  // Oranları hesapla
  if (stats.totalSent > 0) {
    stats.deliveryRate = (stats.totalDelivered / stats.totalSent) * 100;
    stats.readRate = (stats.totalRead / stats.totalSent) * 100;
    stats.failureRate = (stats.totalFailed / stats.totalSent) * 100;
  }

  if (deliveredCount > 0) {
    stats.averageDeliveryTime = totalDeliveryTime / deliveredCount;
  }

  return stats;
} 