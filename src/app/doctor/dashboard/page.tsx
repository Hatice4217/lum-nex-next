// LUMINEX Next.js - Doctor Dashboard Page
// Doktor paneli - randevular, hasta görüntüleme, müsaitlik ayarlama

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

async function getDoctorDashboardData(userId: string) {
  // Get doctor profile
  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      hospital: true,
      department: true,
    },
  });

  if (!doctor) {
    return null;
  }

  // Get upcoming appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      appointmentDate: {
        gte: new Date(),
      },
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: [
      { appointmentDate: 'asc' },
      { startTime: 'asc' },
    ],
    take: 10,
  });

  // Get stats
  const [
    upcomingCount,
    todayCount,
    completedCount,
    totalPatients,
    pendingRequests,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: new Date(),
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
    prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: new Date(),
          lte: new Date(),
        },
      },
    }),
    prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        status: 'COMPLETED',
      },
    }),
    prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        doctorId: doctor.id,
      },
    }),
    prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        status: 'PENDING',
      },
    }),
  ]);

  return {
    doctor,
    appointments,
    stats: {
      upcoming: upcomingCount,
      today: todayCount,
      completed: completedCount,
      totalPatients,
      pendingRequests,
    },
  };
}

export default async function DoctorDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/doctor/dashboard');
  }

  if (session.user.role !== 'DOCTOR') {
    redirect('/dashboard');
  }

  const data = await getDoctorDashboardData(session.user.id);

  if (!data) {
    redirect('/profile'); // Doktor profili yoksa oluştur
  }

  const { doctor, appointments, stats } = data;

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                Merhaba, {doctor.user.firstName}! 👨‍⚕️
              </h1>
              <p className="dashboard-subtitle">
                {doctor.title || 'Doktor'} Paneli
              </p>
            </div>
            <div className="dashboard-actions">
              <Link href="/doctor/availability" className="btn btn-outline">
                📅 Müsaitlik
              </Link>
              <Link href="/doctor/profile" className="btn btn-outline">
                ⚙️ Profil
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card stat-card-blue">
              <div className="stat-card-icon">📅</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Yaklaşan Randevular</h3>
                <p className="stat-card-value">{stats.upcoming}</p>
              </div>
            </div>

            <div className="stat-card stat-card-green">
              <div className="stat-card-icon">📆</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Bugün</h3>
                <p className="stat-card-value">{stats.today}</p>
              </div>
            </div>

            <div className="stat-card stat-card-orange">
              <div className="stat-card-icon">✅</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Tamamlanan</h3>
                <p className="stat-card-value">{stats.completed}</p>
              </div>
            </div>

            <div className="stat-card stat-card-purple">
              <div className="stat-card-icon">👥</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Toplam Hasta</h3>
                <p className="stat-card-value">{stats.totalPatients}</p>
              </div>
            </div>

            {stats.pendingRequests > 0 && (
              <div className="stat-card stat-card-red">
                <div className="stat-card-icon">🔔</div>
                <div className="stat-card-content">
                  <h3 className="stat-card-title">Bekleyen</h3>
                  <p className="stat-card-value">{stats.pendingRequests}</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="dashboard-content">
            {/* Upcoming Appointments */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Yaklaşan Randevular</h2>
                <Link href="/doctor/appointments" className="link-view-all">
                  Tümünü Gör →
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>Yaklaşan Randevu Yok</h3>
                  <p>Müsaitlik ayarlarınızdan randevu taleplerini yönetebilirsiniz.</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {appointments.map((appointment) => {
                    const statusConfig = {
                      PENDING: { label: 'Beklemede', class: 'status-pending' },
                      CONFIRMED: { label: 'Onaylandı', class: 'status-confirmed' },
                      COMPLETED: { label: 'Tamamlandı', class: 'status-completed' },
                      CANCELLED: { label: 'İptal', class: 'status-cancelled' },
                    };

                    const config = statusConfig[appointment.status as keyof typeof statusConfig];

                    return (
                      <div key={appointment.id} className="appointment-card">
                        <div className="appointment-card-header">
                          <div className="appointment-patient">
                            <h4 className="appointment-patient-name">
                              {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                            </h4>
                            <div className="patient-contact">
                              <span className="contact-icon">📞</span>
                              <span>{appointment.patient.user.phone}</span>
                              {appointment.patient.user.email && (
                                <span className="contact-icon">✉️</span>
                              )}
                            </div>
                          </div>
                          <span className={`appointment-status ${config.class}`}>
                            {config.label}
                          </span>
                        </div>

                        <div className="appointment-card-body">
                          <div className="appointment-info">
                            <div className="appointment-info-item">
                              <span className="info-icon">📅</span>
                              <span>
                                {format(appointment.appointmentDate, 'd MMMM yyyy EEEE', { locale: tr })}
                              </span>
                            </div>
                            <div className="appointment-info-item">
                              <span className="info-icon">🕐</span>
                              <span>{appointment.startTime} - {appointment.endTime}</span>
                            </div>
                            {appointment.reason && (
                              <div className="appointment-info-item">
                                <span className="info-icon">📋</span>
                                <span>{appointment.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="appointment-card-footer">
                          {appointment.status === 'PENDING' ? (
                            <>
                              <Link
                                href={`/api/appointments/${appointment.id}/confirm`}
                                className="btn btn-primary btn-sm"
                              >
                                Onayla
                              </Link>
                              <Link
                                href={`/api/appointments/${appointment.id}/cancel`}
                                className="btn btn-outline btn-sm"
                              >
                                İptal
                              </Link>
                            </>
                          ) : appointment.status === 'CONFIRMED' ? (
                            <button className="btn btn-primary btn-sm" disabled>
                              Tamamlandı
                            </button>
                          ) : null}
                          <Link
                            href={`/doctor/patients/${appointment.patientId}`}
                            className="btn btn-outline btn-sm"
                          >
                            Hasta Detayı
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
              <h2 className="section-title">Hızlı İşlemler</h2>
              <div className="quick-actions">
                <Link href="/doctor/availability" className="quick-action-card">
                  <span className="quick-action-icon">📅</span>
                  <span className="quick-action-title">Müsaitlik Ayarla</span>
                </Link>
                <Link href="/doctor/patients" className="quick-action-card">
                  <span className="quick-action-icon">👥</span>
                  <span className="quick-action-title">Hastalarım</span>
                </Link>
                <Link href="/doctor/prescriptions" className="quick-action-card">
                  <span className="quick-action-icon">💊</span>
                  <span className="quick-action-title">Reçeteler</span>
                </Link>
                <Link href="/doctor/profile" className="quick-action-card">
                  <span className="quick-action-icon">⚙️</span>
                  <span className="quick-action-title">Profil Düzenle</span>
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
