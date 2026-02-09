// LUMINEX Next.js - Patient Dashboard Page
// Hasta paneli

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { StatCard } from '@/components/dashboard/StatCard';
import { AppointmentCard } from '@/components/dashboard/AppointmentCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

async function getDashboardData(userId: string) {
  // Get user's appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: userId,
      appointmentDate: {
        gte: new Date(),
      },
    },
    include: {
      doctor: {
        include: {
          user: true,
          hospital: true,
          department: true,
        },
      },
    },
    orderBy: {
      appointmentDate: 'asc',
    },
    take: 5,
  });

  // Get stats
  const [
    upcomingCount,
    completedCount,
    prescriptionsCount,
    unreadNotificationsCount,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        patientId: userId,
        appointmentDate: {
          gte: new Date(),
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
    prisma.appointment.count({
      where: {
        patientId: userId,
        status: 'COMPLETED',
      },
    }),
    prisma.prescription.count({
      where: {
        patientId: userId,
        validUntil: {
          gte: new Date(),
        },
      },
    }),
    prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    }),
  ]);

  return {
    appointments,
    stats: {
      upcoming: upcomingCount,
      completed: completedCount,
      prescriptions: prescriptionsCount,
      notifications: unreadNotificationsCount,
    },
  };
}

export default async function PatientDashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  if (session.user.role !== 'PATIENT') {
    if (session.user.role === 'DOCTOR') {
      redirect('/doctor/dashboard');
    } else if (session.user.role === 'ADMIN') {
      redirect('/admin/dashboard');
    }
  }

  const { appointments, stats } = await getDashboardData(session.user.id);

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                Merhaba, {session.user.firstName}! 👋
              </h1>
              <p className="dashboard-subtitle">
                Randevularınızı ve sağlık bilgilerinizi buradan yönetebilirsiniz.
              </p>
            </div>
            <Link href="/appointment" className="btn btn-primary">
              + Yeni Randevu Al
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Yaklaşan Randevular"
              value={stats.upcoming}
              icon="📅"
              color="blue"
              href="/appointments?status=upcoming"
            />
            <StatCard
              title="Tamamlanan"
              value={stats.completed}
              icon="✅"
              color="green"
              href="/appointments?status=completed"
            />
            <StatCard
              title="Reçeteler"
              value={stats.prescriptions}
              icon="💊"
              color="orange"
              href="/prescriptions"
            />
            <StatCard
              title="Bildirimler"
              value={stats.notifications}
              icon="🔔"
              color="purple"
              href="/notifications"
            />
          </div>

          {/* Main Content */}
          <div className="dashboard-content">
            {/* Upcoming Appointments */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Yaklaşan Randevular</h2>
                <Link href="/appointments" className="link-view-all">
                  Tümünü Gör →
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>Randevunuz Bulunmuyor</h3>
                  <p>
                    Henüz yaklaşan bir randevunuz yok. Hemen yeni bir randevu oluşturun.
                  </p>
                  <Link href="/appointment" className="btn btn-primary">
                    Randevu Al
                  </Link>
                </div>
              ) : (
                <div className="appointments-list">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      id={appointment.id}
                      doctorName={`${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`}
                      doctorTitle={appointment.doctor.title || undefined}
                      hospitalName={appointment.doctor.hospital?.name}
                      departmentName={appointment.doctor.department?.name}
                      appointmentDate={appointment.appointmentDate}
                      startTime={appointment.startTime}
                      endTime={appointment.endTime}
                      status={appointment.status as any}
                      isOnline={appointment.isOnline}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
              <h2 className="section-title">Hızlı İşlemler</h2>
              <div className="quick-actions">
                <Link href="/doctors" className="quick-action-card">
                  <span className="quick-action-icon">👨‍⚕️</span>
                  <span className="quick-action-title">Doktor Bul</span>
                </Link>
                <Link href="/test-results" className="quick-action-card">
                  <span className="quick-action-icon">🔬</span>
                  <span className="quick-action-title">Tahlil Sonuçları</span>
                </Link>
                <Link href="/prescriptions" className="quick-action-card">
                  <span className="quick-action-icon">💊</span>
                  <span className="quick-action-title">Reçetelerim</span>
                </Link>
                <Link href="/messages" className="quick-action-card">
                  <span className="quick-action-icon">💬</span>
                  <span className="quick-action-title">Mesajlar</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
