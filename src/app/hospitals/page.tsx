// LUMINEX Next.js - Hospitals Page
// Hastaneler listesi sayfası

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getHospitals() {
  const hospitals = await prisma.hospital.findMany({
    where: {
      isActive: true,
    },
    include: {
      _count: {
        select: {
          doctors: true,
          departments: true,
        },
      },
    },
    orderBy: [
      { rating: 'desc' },
      { name: 'asc' },
    ],
  });

  return hospitals.map((hospital) => ({
    id: hospital.id,
    name: hospital.name,
    slug: hospital.slug,
    city: hospital.city,
    district: hospital.district,
    logo: hospital.logo,
    image: hospital.image,
    address: hospital.address,
    description: hospital.description,
    emergencyService: hospital.emergencyService,
    rating: hospital.rating,
    totalReviews: hospital.totalReviews,
    doctorsCount: hospital._count.doctors,
    departmentsCount: hospital._count.departments,
  }));
}

export default async function HospitalsPage({
  searchParams,
}: {
  searchParams: { city?: string };
}) {
  const hospitals = await getHospitals();

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Hastaneler</h1>
          <p className="page-subtitle">
            Türkiye\'nin en iyi hastanelerini keşfedin, randevunuzu oluşturun.
          </p>
        </div>

        {/* City Filter */}
        <div className="page-filters">
          <div className="filter-group">
            <label className="filter-label">Şehir:</label>
            <div className="filter-buttons">
              <Link href="/hospitals" className={`filter-btn ${!searchParams.city ? 'active' : ''}`}>
                Tümü
              </Link>
              <Link href="/hospitals?city=İstanbul" className={`filter-btn ${searchParams.city === 'İstanbul' ? 'active' : ''}`}>
                İstanbul
              </Link>
              <Link href="/hospitals?city=Ankara" className={`filter-btn ${searchParams.city === 'Ankara' ? 'active' : ''}`}>
                Ankara
              </Link>
              <Link href="/hospitals?city=İzmir" className={`filter-btn ${searchParams.city === 'İzmir' ? 'active' : ''}`}>
                İzmir
              </Link>
              <Link href="/hospitals?city=Bursa" className={`filter-btn ${searchParams.city === 'Bursa' ? 'active' : ''}`}>
                Bursa
              </Link>
              <Link href="/hospitals?city=Antalya" className={`filter-btn ${searchParams.city === 'Antalya' ? 'active' : ''}`}>
                Antalya
              </Link>
            </div>
          </div>
        </div>

        {/* Hospitals Grid */}
        {hospitals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏥</div>
            <h3>Hastane Bulunamadı</h3>
            <p>Filtrelerinizi değiştirerek tekrar deneyin.</p>
          </div>
        ) : (
          <div className="hospitals-grid">
            {hospitals.map((hospital) => (
              <Link key={hospital.id} href={`/hospitals/${hospital.id}`} className="hospital-card">
                <div className="hospital-card-header">
                  <div className="hospital-logo">
                    {hospital.logo ? (
                      <img src={hospital.logo} alt={hospital.name} />
                    ) : (
                      <span className="logo-placeholder">🏥</span>
                    )}
                  </div>
                  <div className="hospital-info">
                    <h3 className="hospital-name">{hospital.name}</h3>
                    <p className="hospital-location">
                      {hospital.city && `${hospital.city}, `}
                      {hospital.district}
                    </p>
                  </div>
                  {hospital.emergencyService && (
                    <span className="emergency-badge">🚨 Acil</span>
                  )}
                </div>

                {hospital.description && (
                  <p className="hospital-description-preview">
                    {hospital.description.slice(0, 120)}
                    {hospital.description.length > 120 && '...'}
                  </p>
                )}

                <div className="hospital-card-stats">
                  <div className="stat">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-value">{hospital.rating.toFixed(1)}</span>
                    <span className="stat-label">({hospital.totalReviews})</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">👨‍⚕️</span>
                    <span className="stat-value">{hospital.doctorsCount}</span>
                    <span className="stat-label">doktor</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🏥</span>
                    <span className="stat-value">{hospital.departmentsCount}</span>
                    <span className="stat-label">bölüm</span>
                  </div>
                </div>

                <div className="hospital-card-footer">
                  <span className="hospital-action">Detayları Gör →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
