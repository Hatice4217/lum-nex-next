// LUMINEX Next.js - Appointment Card Component
// Randevu kartı

'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AppointmentCardProps {
  id: string;
  doctorName: string;
  doctorTitle?: string;
  hospitalName?: string;
  departmentName?: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  isOnline?: boolean;
}

const statusConfig = {
  PENDING: { label: 'Bekliyor', class: 'status-pending' },
  CONFIRMED: { label: 'Onaylandı', class: 'status-confirmed' },
  CANCELLED: { label: 'İptal', class: 'status-cancelled' },
  COMPLETED: { label: 'Tamamlandı', class: 'status-completed' },
};

export function AppointmentCard({
  id,
  doctorName,
  doctorTitle,
  hospitalName,
  departmentName,
  appointmentDate,
  startTime,
  endTime,
  status,
  isOnline,
}: AppointmentCardProps) {
  const config = statusConfig[status];

  return (
    <div className="appointment-card">
      <div className="appointment-card-header">
        <div className="appointment-doctor">
          <h4 className="appointment-doctor-name">
            {doctorTitle} {doctorName}
          </h4>
          {departmentName && (
            <span className="appointment-department">{departmentName}</span>
          )}
        </div>
        <span className={`appointment-status ${config.class}`}>
          {config.label}
        </span>
      </div>

      <div className="appointment-card-body">
        <div className="appointment-info">
          <div className="appointment-info-item">
            <span className="info-icon">📅</span>
            <span>{format(appointmentDate, 'd MMMM yyyy', { locale: tr })}</span>
          </div>
          <div className="appointment-info-item">
            <span className="info-icon">🕐</span>
            <span>{startTime} - {endTime}</span>
          </div>
          {isOnline && (
            <div className="appointment-info-item">
              <span className="info-icon">💬</span>
              <span>Online Görüşme</span>
            </div>
          )}
          {hospitalName && (
            <div className="appointment-info-item">
              <span className="info-icon">🏥</span>
              <span>{hospitalName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="appointment-card-footer">
        <Link href={`/appointments/${id}`} className="btn btn-outline btn-sm">
          Detayları Gör
        </Link>
        {status === 'CONFIRMED' && (
          <Link
            href={isOnline ? `/appointments/${id}/video` : ''}
            className="btn btn-primary btn-sm"
          >
            {isOnline ? 'Görüşmeye Katıl' : 'Randevuya Git'}
          </Link>
        )}
      </div>
    </div>
  );
}
