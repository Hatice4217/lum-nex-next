// LUMINEX Next.js - Admin Dashboard Page
// Yönetici paneli - kullanıcı yönetimi, istatistikler, sistem durumu

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

async function getAdminDashboardData() {
  // Get overall stats
  const [
    totalUsers,
    totalDoctors,
    totalPatients,
    totalAdmins,
    totalAppointments,
    totalHospitals,
    totalDepartments,
    pendingDoctors,
    activeAppointments,
    completedToday,
    revenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'DOCTOR' } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.appointment.count(),
    prisma.hospital.count(),
    prisma.department.count(),
    prisma.doctorProfile.count({ where: { isAvailable: true } }),
    prisma.appointment.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        appointmentDate: { gte: new Date() },
      },
    }),
    prisma.appointment.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    }),
  ]);

  // Recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Recent audit logs
  const recentLogs = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // License info
  const license = await prisma.license.findFirst({
    where: {
      isActive: true,
      expiresAt: { gte: new Date() },
    },
  });

  return {
    stats: {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAdmins,
      totalAppointments,
      totalHospitals,
      totalDepartments,
      pendingDoctors,
      activeAppointments,
      completedToday,
      revenue: revenue._sum.amount ? Number(revenue._sum.amount) : 0,
    },
    recentUsers,
    recentLogs,
    license,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const data = await getAdminDashboardData();

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                Admin Paneli 🔧
              </h1>
              <p className="dashboard-subtitle">
                Sistem yönetimi ve istatistikler
              </p>
            </div>
            <div className="dashboard-actions">
              <Link href="/admin/users" className="btn btn-primary">
                👥 Kullanıcılar
              </Link>
              <Link href="/admin/hospitals" className="btn btn-outline">
                🏥 Hastaneler
              </Link>
              <Link href="/admin/settings" className="btn btn-outline">
                ⚙️ Ayarlar
              </Link>
            </div>
          </div>

          {/* License Status */}
          {data.license && (
            <div className="license-card">
              <div className="license-info">
                <span className={`license-status ${data.license.isActive ? 'active' : 'inactive'}`}>
                  {data.license.isActive ? '✅ Aktif' : '❌ Pasif'}
                </span>
                <span className="license-domain">
                  Domain: {data.license.domain}
                </span>
                <span className="license-expiry">
                  Bitiş: {new Date(data.license.expiresAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card stat-card-blue">
              <div className="stat-card-icon">👥</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Toplam Kullanıcı</h3>
                <p className="stat-card-value">{data.stats.totalUsers}</p>
              </div>
            </div>

            <div className="stat-card stat-card-green">
              <div className="stat-card-icon">👨‍⚕️</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Doktorlar</h3>
                <p className="stat-card-value">{data.stats.totalDoctors}</p>
              </div>
            </div>

            <div className="stat-card stat-card-purple">
              <div className="stat-card-icon">🤒</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Hastalar</h3>
                <p className="stat-card-value">{data.stats.totalPatients}</p>
              </div>
            </div>

            <div className="stat-card stat-card-orange">
              <div className="stat-card-icon">📅</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Randevular</h3>
                <p className="stat-card-value">{data.stats.totalAppointments}</p>
              </div>
            </div>

            <div className="stat-card stat-card-blue">
              <div className="stat-card-icon">🏥</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Hastaneler</h3>
                <p className="stat-card-value">{data.stats.totalHospitals}</p>
              </div>
            </div>

            <div className="stat-card stat-card-purple">
              <div className="stat-card-icon">💰</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Toplam Gelir</h3>
                <p className="stat-card-value">
                  {new Intl.NumberFormat('tr-TR').format(data.stats.revenue)} ₺
                </p>
              </div>
            </div>

            <div className="stat-card stat-card-green">
              <div className="stat-card-icon">⏳</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Aktif Randevu</h3>
                <p className="stat-card-value">{data.stats.activeAppointments}</p>
              </div>
            </div>

            <div className="stat-card stat-card-orange">
              <div className="stat-card-icon">✅</div>
              <div className="stat-card-content">
                <h3 className="stat-card-title">Bugün Tamamlanan</h3>
                <p className="stat-card-value">{data.stats.completedToday}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="dashboard-grid">
            {/* Recent Users */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Son Kayıtlar</h2>
                <Link href="/admin/users" className="link-view-all">
                  Tümünü Gör →
                </Link>
              </div>

              <div className="users-list">
                {data.recentUsers.map((user) => (
                  <div key={user.id} className="user-card-mini">
                    <div className="user-avatar-mini">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="user-info-mini">
                      <h4 className="user-name-mini">
                        {user.firstName} {user.lastName}
                      </h4>
                      <span className={`user-role-badge user-role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </div>
                    <span className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Son İşlemler</h2>
              </div>

              <div className="audit-logs-list">
                {data.recentLogs.map((log) => (
                  <div key={log.id} className="audit-log-card">
                    <div className="log-header">
                      <span className={`log-action log-action-${log.action.toLowerCase()}`}>
                        {log.action}
                      </span>
                      <span className="log-time">
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <p className="log-description">{log.description}</p>
                    {log.user && (
                      <span className="log-user">
                        {log.user.firstName} {log.user.lastName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2 className="section-title">Yönetim Paneli</h2>
            <div className="admin-actions">
              <Link href="/admin/users/create" className="action-card">
                <span className="action-icon">👤</span>
                <span className="action-title">Kullanıcı Ekle</span>
              </Link>
              <Link href="/admin/hospitals/create" className="action-card">
                <span className="action-icon">🏥</span>
                <span className="action-title">Hastane Ekle</span>
              </Link>
              <Link href="/admin/departments/create" className="action-card">
                <span className="action-icon">🏛️</span>
                <span className="action-title">Departman Ekle</span>
              </Link>
              <Link href="/admin/licenses" className="action-card">
                <span className="action-icon">🔑</span>
                <span className="action-title">Lisanslar</span>
              </Link>
              <Link href="/admin/logs" className="action-card">
                <span className="action-icon">📋</span>
                <span className="action-title">Denetim Logları</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
