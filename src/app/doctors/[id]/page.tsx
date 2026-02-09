// LUMINEX Next.js - Doctor Profile Page
// Doktor profil sayfası

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppointmentCard } from '@/components/dashboard/AppointmentCard';
import { auth } from '@/lib/auth';

async function getDoctor(id: string) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          gender: true,
          phone: true,
        },
      },
      hospital: true,
      department: true,
      blockedSlots: {
        where: {
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: 'asc',
        },
        take: 30,
      },
    },
  });

  if (!doctor) return null;

  // Get upcoming appointments
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      appointmentDate: {
        gte: new Date(),
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    include: {
      patient: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: [
      { appointmentDate: 'asc' },
      { startTime: 'asc' },
    ],
    take: 5,
  });

  // Get total appointments count
  const totalAppointments = await prisma.appointment.count({
    where: {
      doctorId: doctor.id,
      status: 'COMPLETED',
    },
  });

  // Parse JSON fields
  const education = doctor.education ? JSON.parse(doctor.education) : [];
  const specializations = doctor.specializations ? JSON.parse(doctor.specializations) : [];
  const languages = doctor.languages ? JSON.parse(doctor.languages) : [];
  const schedule = doctor.schedule ? JSON.parse(doctor.schedule) : null;

  return {
    ...doctor,
    education,
    specializations,
    languages,
    schedule,
    upcomingAppointments,
    totalAppointments,
  };
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const doctor = await getDoctor(id);

  if (!doctor) {
    notFound();
  }

  const {
    user,
    hospital,
    department,
    education,
    specializations,
    languages,
    rating,
    totalReviews,
    consultationFee,
    isAvailable,
    biography,
    experience,
  } = doctor;

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/doctors">Doktorlar</Link>
          <span>/</span>
          <span>{user.firstName} {user.lastName}</span>
        </div>

        {/* Doctor Header */}
        <div className="doctor-profile-header">
          <div className="doctor-avatar-large">
            {user.avatar ? (
              <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <span className="avatar-placeholder-large">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            )}
          </div>

          <div className="doctor-header-info">
            <h1 className="doctor-name-large">
              {doctor.title} {user.firstName} {user.lastName}
            </h1>

            <div className="doctor-badges">
              {department && (
                <span className="badge badge-department">{department.name}</span>
              )}
              <span className={`badge badge-status ${isAvailable ? 'available' : 'busy'}`}>
                {isAvailable ? 'Müsait' : 'Müsait Değil'}
              </span>
            </div>

            <div className="doctor-stats-large">
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <div>
                  <span className="stat-value">{rating.toFixed(1)}</span>
                  <span className="stat-label">({totalReviews} değerlendirme)</span>
                </div>
              </div>
              {experience && (
                <div className="stat-item">
                  <span className="stat-icon">💼</span>
                  <div>
                    <span className="stat-value">{experience}</span>
                    <span className="stat-label">yıl deneyim</span>
                  </div>
                </div>
              )}
              {doctor.totalAppointments > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">✅</span>
                  <div>
                    <span className="stat-value">{doctor.totalAppointments}</span>
                    <span className="stat-label">randevu</span>
                  </div>
                </div>
              )}
            </div>

            {hospital && (
              <div className="doctor-hospital-large">
                <span className="hospital-icon">🏥</span>
                <div>
                  <span className="hospital-name">{hospital.name}</span>
                  {hospital.city && (
                    <span className="hospital-location">
                      {hospital.district && `${hospital.district}, `} {hospital.city}
                    </span>
                  )}
                </div>
              </div>
            )}

            {consultationFee && (
              <div className="doctor-fee-large">
                <span className="fee-label">Danışmanlık Ücreti:</span>
                <span className="fee-value">{consultationFee} ₺</span>
              </div>
            )}

            <div className="doctor-actions">
              <Link
                href={session ? `/appointment?doctor=${doctor.id}` : '/login'}
                className="btn btn-primary btn-lg"
              >
                Randevu Al
              </Link>
            </div>
          </div>
        </div>

        {/* Doctor Content */}
        <div className="doctor-profile-content">
          {/* Left Column */}
          <div className="doctor-main-info">
            {/* About */}
            {biography && (
              <section className="doctor-section">
                <h2 className="section-title">Hakkında</h2>
                <p className="doctor-biography">{biography}</p>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section className="doctor-section">
                <h2 className="section-title">Eğitim</h2>
                <ul className="education-list">
                  {education.map((edu: any, index: number) => (
                    <li key={index} className="education-item">
                      <span className="education-year">{edu.year}</span>
                      <span className="education-text">{edu.degree} - {edu.school}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Specializations */}
            {specializations.length > 0 && (
              <section className="doctor-section">
                <h2 className="section-title">Uzmanlıklar</h2>
                <div className="specializations-list">
                  {specializations.map((spec: string, index: number) => (
                    <span key={index} className="specialization-tag">
                      {spec}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <section className="doctor-section">
                <h2 className="section-title">Diller</h2>
                <div className="languages-list">
                  {languages.map((lang: string, index: number) => (
                    <span key={index} className="language-tag">
                      {lang}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section Placeholder */}
            <section className="doctor-section">
              <h2 className="section-title">Değerlendirmeler</h2>
              <p className="text-muted">Henüz değerlendirme yapılmamış.</p>
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="doctor-sidebar">
            <div className="booking-card">
              <h3>Randevu Al</h3>
              <p className="booking-subtitle">
                {doctor.title} {user.firstName} {user.lastName}
              </p>

              {session ? (
                <Link
                  href={`/appointment?doctor=${doctor.id}`}
                  className="btn btn-primary btn-block"
                >
                  Randevu Oluştur
                </Link>
              ) : (
                <div className="booking-auth-notice">
                  <p>Randevu oluşturmak için giriş yapmalısınız.</p>
                  <div className="booking-actions">
                    <Link href="/login" className="btn btn-primary btn-block">
                      Giriş Yap
                    </Link>
                    <Link href="/register" className="btn btn-outline btn-block">
                      Kayıt Ol
                    </Link>
                  </div>
                </div>
              )}

              <div className="booking-info">
                <div className="info-item">
                  <span className="info-icon">⏱️</span>
                  <span>Randevu süresi: 30 dakika</span>
                </div>
                {consultationFee && (
                  <div className="info-item">
                    <span className="info-icon">💰</span>
                    <span>Ücret: {consultationFee} ₺</span>
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {doctor.schedule && (
              <div className="schedule-card">
                <h3>Çalışma Saatleri</h3>
                <ul className="schedule-list">
                  {Object.entries(doctor.schedule).map(([day, hours]: [string, any]) => (
                    <li key={day} className="schedule-item">
                      <span className="schedule-day">{day}</span>
                      <span className="schedule-hours">{hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
