// LUMINEX Next.js - Doctors List Component
// Doktor listesi - filtreleme ve arama

'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/language-provider';
import { StatCard } from '@/components/dashboard/StatCard';
import Link from 'next/link';

interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  avatar?: string | null;
  hospital?: {
    id: string;
    name: string;
    slug: string;
    city: string;
  } | null;
  department?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  rating: number;
  totalReviews: number;
  consultationFee?: number | null;
  isAvailable: boolean;
  experience?: number | null;
}

interface DoctorsListProps {
  initialDoctors: Doctor[];
  initialFilters?: {
    department?: string;
    hospital?: string;
    city?: string;
    minRating?: number;
    maxFee?: number;
    isOnlineAvailable?: boolean;
  };
}

export function DoctorsList({ initialDoctors, initialFilters = {} }: DoctorsListProps) {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.hospital) params.append('hospital', filters.hospital);
      if (filters.city) params.append('city', filters.city);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.maxFee) params.append('maxFee', filters.maxFee.toString());
      if (filters.isOnlineAvailable) params.append('isOnlineAvailable', 'true');

      try {
        const res = await fetch(`/api/doctors?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setDoctors(data.data);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [filters]);

  return (
    <div className="doctors-page">
      {/* Filters Sidebar */}
      <aside className="doctors-filters">
        <h3 className="filters-title">Filtreler</h3>

        {/* City Filter */}
        <div className="filter-group">
          <label className="filter-label">Şehir</label>
          <select
            className="filter-select"
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
          >
            <option value="">Tümü</option>
            <option value="İstanbul">İstanbul</option>
            <option value="Ankara">Ankara</option>
            <option value="İzmir">İzmir</option>
            <option value="Bursa">Bursa</option>
            <option value="Antalya">Antalya</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="filter-group">
          <label className="filter-label">Bölüm</label>
          <select
            className="filter-select"
            value={filters.department || ''}
            onChange={(e) => setFilters({ ...filters, department: e.target.value || undefined })}
          >
            <option value="">Tümü</option>
            <option value="kardiyoloji">Kardiyoloji</option>
            <option value="dahiliye">Dahiliye</option>
            <option value="cocuk-sagligi">Çocuk Sağlığı</option>
            <option value="kadin-dogum">Kadın Doğum</option>
            <option value="ortopedi">Ortopedi</option>
            <option value="goz">Göz Hastalıkları</option>
            <option value="kbb">Kulak Burun Boğaz</option>
            <option value="cildiye">Cildiye</option>
            <option value="noroloji">Nöroloji</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="filter-group">
          <label className="filter-label">Minimum Değerlendirme</label>
          <select
            className="filter-select"
            value={filters.minRating || ''}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value ? parseFloat(e.target.value) : undefined })}
          >
            <option value="">Tümü</option>
            <option value="4.5">4.5+ ⭐</option>
            <option value="4">4+ ⭐</option>
            <option value="3.5">3.5+ ⭐</option>
            <option value="3">3+ ⭐</option>
          </select>
        </div>

        {/* Fee Filter */}
        <div className="filter-group">
          <label className="filter-label">Max Ücret (₺)</label>
          <select
            className="filter-select"
            value={filters.maxFee || ''}
            onChange={(e) => setFilters({ ...filters, maxFee: e.target.value ? parseFloat(e.target.value) : undefined })}
          >
            <option value="">Tümü</option>
            <option value="500">500 ₺</option>
            <option value="1000">1000 ₺</option>
            <option value="2000">2000 ₺</option>
            <option value="5000">5000 ₺</option>
          </select>
        </div>

        {/* Online Available Filter */}
        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.isOnlineAvailable || false}
              onChange={(e) => setFilters({ ...filters, isOnlineAvailable: e.target.checked || undefined })}
            />
            <span>Sadece Online</span>
          </label>
        </div>

        <button
          className="btn btn-outline btn-block"
          onClick={() => setFilters({})}
        >
          Filtreleri Temizle
        </button>
      </aside>

      {/* Doctors Grid */}
      <div className="doctors-content">
        <div className="doctors-header">
          <h1 className="doctors-title">Doktorlar</h1>
          <p className="doctors-subtitle">
            {doctors.length} doktor bulundu
          </p>
        </div>

        {isLoading ? (
          <div className="doctors-loading">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍⚕️</div>
            <h3>Doktor Bulunamadı</h3>
            <p>Filtrelerinizi değiştirerek tekrar deneyin.</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/doctors/${doctor.id}`}
                className="doctor-card"
              >
                <div className="doctor-card-header">
                  <div className="doctor-avatar">
                    {doctor.avatar ? (
                      <img src={doctor.avatar} alt={doctor.fullName} />
                    ) : (
                      <span className="avatar-placeholder">
                        {doctor.firstName[0]}{doctor.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div className="doctor-info">
                    <h3 className="doctor-name">
                      {doctor.title} {doctor.firstName} {doctor.lastName}
                    </h3>
                    {doctor.department && (
                      <span className="doctor-department">{doctor.department.name}</span>
                    )}
                  </div>
                  <span className={`doctor-status ${doctor.isAvailable ? 'available' : 'busy'}`}>
                    {doctor.isAvailable ? 'Müsait' : 'Müsait Değil'}
                  </span>
                </div>

                <div className="doctor-card-body">
                  {doctor.hospital && (
                    <div className="doctor-hospital">
                      <span className="hospital-icon">🏥</span>
                      <span>{doctor.hospital.name}</span>
                      {doctor.hospital.city && (
                        <span className="hospital-city">, {doctor.hospital.city}</span>
                      )}
                    </div>
                  )}

                  <div className="doctor-stats">
                    <div className="stat">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-value">{doctor.rating.toFixed(1)}</span>
                      <span className="stat-label">({doctor.totalReviews})</span>
                    </div>
                    {doctor.experience && (
                      <div className="stat">
                        <span className="stat-icon">💼</span>
                        <span className="stat-value">{doctor.experience}</span>
                        <span className="stat-label">yıl</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="doctor-card-footer">
                  {doctor.consultationFee && (
                    <span className="doctor-fee">
                      {doctor.consultationFee} ₺
                    </span>
                  )}
                  <span className="doctor-action">Randevu Al →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
