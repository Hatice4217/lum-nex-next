// LUMINEX Next.js - Hospital Profile Page
// Hastane profil sayfası

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getHospital(id: string) {
  const hospital = await prisma.hospital.findUnique({
    where: { id },
    include: {
      departments: {
        where: { isActive: true },
        include: {
          _count: {
            select: {
              doctors: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      },
      doctors: {
        where: {
          user: {
            isActive: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          department: true,
        },
        take: 10,
        orderBy: {
          rating: 'desc',
        },
      },
    },
  });

  if (!hospital) return null;

  // Parse JSON fields
  const facilities = hospital.facilities ? JSON.parse(hospital.facilities) : [];
  const workingHours = hospital.workingHours ? JSON.parse(hospital.workingHours) : null;

  return {
    ...hospital,
    facilities,
    workingHours,
    doctorsCount: hospital.doctors.length,
    departmentsCount: hospital.departments.length,
  };
}

export default async function HospitalProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hospital = await getHospital(id);

  if (!hospital) {
    notFound();
  }

  const {
    name,
    slug,
    address,
    city,
    district,
    phone,
    email,
    website,
    logo,
    image,
    description,
    facilities,
    workingHours,
    emergencyService,
    rating,
    totalReviews,
    departments,
    doctors,
    doctorsCount,
    departmentsCount,
  } = hospital;

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/hospitals">Hastaneler</Link>
          <span>/</span>
          <span>{name}</span>
        </div>

        {/* Hospital Header */}
        <div className="hospital-profile-header">
          <div className="hospital-header-content">
            <div className="hospital-logo-large">
              {logo ? (
                <img src={logo} alt={name} />
              ) : (
                <span className="logo-placeholder">🏥</span>
              )}
            </div>

            <div className="hospital-header-info">
              <h1 className="hospital-name-large">{name}</h1>

              <div className="hospital-location-large">
                <span className="location-icon">📍</span>
                <span>
                  {address && `${address}, `}
                  {district && `${district}, `}
                  {city}
                </span>
              </div>

              <div className="hospital-stats">
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <div>
                    <span className="stat-value">{rating.toFixed(1)}</span>
                    <span className="stat-label">({totalReviews} değerlendirme)</span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">👨‍⚕️</span>
                  <div>
                    <span className="stat-value">{doctorsCount}</span>
                    <span className="stat-label">doktor</span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🏥</span>
                  <div>
                    <span className="stat-value">{departmentsCount}</span>
                    <span className="stat-label">bölüm</span>
                  </div>
                </div>
              </div>

              {emergencyService && (
                <div className="emergency-badge">
                  <span className="emergency-icon">🚨</span>
                  <span>Acil Servis Mevcut</span>
                </div>
              )}
            </div>
          </div>

          {/* Hospital Image */}
          {image && (
            <div className="hospital-image-large">
              <img src={image} alt={name} />
            </div>
          )}
        </div>

        {/* Hospital Content */}
        <div className="hospital-profile-content">
          {/* Left Column */}
          <div className="hospital-main-info">
            {/* About */}
            {description && (
              <section className="hospital-section">
                <h2 className="section-title">Hakkında</h2>
                <p className="hospital-description">{description}</p>
              </section>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <section className="hospital-section">
                <h2 className="section-title">Olanaklar</h2>
                <div className="facilities-grid">
                  {facilities.map((facility: string, index: number) => (
                    <div key={index} className="facility-item">
                      <span className="facility-icon">✓</span>
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Departments */}
            {departments.length > 0 && (
              <section className="hospital-section">
                <h2 className="section-title">Bölümler</h2>
                <div className="departments-grid">
                  {departments.map((dept: any) => (
                    <Link
                      key={dept.id}
                      href={`/doctors?hospital=${slug}&department=${dept.slug}`}
                      className="department-card"
                    >
                      {dept.icon && <span className="department-icon">{dept.icon}</span>}
                      <span className="department-name">{dept.name}</span>
                      <span className="department-count">{dept._count.doctors} doktor</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Doctors */}
            {doctors.length > 0 && (
              <section className="hospital-section">
                <div className="section-header">
                  <h2 className="section-title">Doktorlar</h2>
                  <Link href={`/doctors?hospital=${slug}`} className="link-view-all">
                    Tümünü Gör →
                  </Link>
                </div>
                <div className="doctors-grid-preview">
                  {doctors.map((doctor: any) => (
                    <Link
                      key={doctor.id}
                      href={`/doctors/${doctor.id}`}
                      className="doctor-card-preview"
                    >
                      <div className="doctor-avatar-small">
                        {doctor.user.avatar ? (
                          <img src={doctor.user.avatar} alt={doctor.user.firstName} />
                        ) : (
                          <span className="avatar-placeholder">
                            {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="doctor-info-preview">
                        <h4 className="doctor-name-preview">
                          {doctor.title} {doctor.user.firstName} {doctor.user.lastName}
                        </h4>
                        {doctor.department && (
                          <span className="doctor-department-preview">{doctor.department.name}</span>
                        )}
                        <div className="doctor-rating-preview">
                          ⭐ {doctor.rating.toFixed(1)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Contact & Info */}
          <div className="hospital-sidebar">
            {/* Contact Card */}
            <div className="contact-card">
              <h3>İletişim</h3>
              <div className="contact-info">
                {phone && (
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <a href={`tel:${phone}`} className="contact-link">
                      {phone}
                    </a>
                  </div>
                )}
                {email && (
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <a href={`mailto:${email}`} className="contact-link">
                      {email}
                    </a>
                  </div>
                )}
                {address && (
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <span className="contact-text">{address}</span>
                  </div>
                )}
                {website && (
                  <div className="contact-item">
                    <span className="contact-icon">🌐</span>
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      Web Sitesi
                    </a>
                  </div>
                )}
              </div>

              <Link href="/appointment" className="btn btn-primary btn-block">
                Randevu Al
              </Link>
            </div>

            {/* Working Hours */}
            {workingHours && (
              <div className="working-hours-card">
                <h3>Çalışma Saatleri</h3>
                <ul className="working-hours-list">
                  {Object.entries(workingHours).map(([day, hours]: [string, any]) => (
                    <li key={day} className="working-hours-item">
                      <span className="hours-day">{day}</span>
                      <span className="hours-time">{hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Map Placeholder */}
            <div className="map-card">
              <h3>Konum</h3>
              <div className="map-placeholder">
                <p>
                  {address && `${address}, `}
                  {district && `${district}, `}
                  {city}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${name} ${city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-map"
                >
                  Haritada Göster →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
