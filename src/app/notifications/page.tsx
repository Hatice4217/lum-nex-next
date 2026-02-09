// LUMINEX Next.js - Notifications Page
// Bildirimler sayfası

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

async function getNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: [
      { isRead: 'asc' },
      { createdAt: 'desc' },
    ],
    take: 50,
  });

  // Okunmamamayan sayı
  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return { notifications, unreadCount };
}

async function markAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/notifications');
  }

  const { notifications, unreadCount } = await getNotifications(session.user.id);

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Bildirimler</h1>
            <p className="page-subtitle">
              {unreadCount} okunmamamış bildiriminiz var
            </p>
          </div>
          {unreadCount > 0 && (
            <form action="/api/notifications/mark-all-read" method="POST">
              <button type="submit" className="btn btn-outline">
                Tümünü Okundu Say
              </button>
            </form>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>Bildiriminiz Yok</h3>
            <p>Sistem tarafından gönderilen bildirimler burada görüntülenir.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
              >
                <div className={`notification-icon ${getNotificationIconClass(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">
                      {format(notification.createdAt, 'd MMMM yyyy, HH:mm', { locale: tr })}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.link && (
                    <Link href={notification.link} className="notification-link">
                      İlgili Sayfaya Git →
                    </Link>
                  )}
                </div>

                {!notification.isRead && (
                  <form
                    action={`/api/notifications/${notification.id}/mark-read`}
                    method="POST"
                    className="notification-action"
                  >
                    <button type="submit" className="btn btn-sm btn-outline">
                      Okundu Say
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    APPOINTMENT: '📅',
    MESSAGE: '💬',
    PRESCRIPTION: '💊',
    TEST_RESULT: '🔬',
    SYSTEM: '⚙️',
    REMINDER: '🔔',
  };
  return icons[type] || '📬';
}

function getNotificationIconClass(type: string): string {
  const classes: Record<string, string> = {
    APPOINTMENT: 'icon-appointment',
    MESSAGE: 'icon-message',
    PRESCRIPTION: 'icon-prescription',
    TEST_RESULT: 'icon-test-result',
    SYSTEM: 'icon-system',
    REMINDER: 'icon-reminder',
  };
  return classes[type] || 'icon-default';
}
