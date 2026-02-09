// LUMINEX Next.js - Appointment Form Component
// Randevu oluşturma formu

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/language-provider';
import { appointmentSchema } from '@/lib/validations';

interface Doctor {
  id: string;
  fullName: string;
  title?: string;
  department?: string;
  hospital?: string;
  consultationFee?: number | null;
}

interface Hospital {
  id: string;
  name: string;
  city: string;
}

interface Department {
  id: string;
  name: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function AppointmentForm({ doctorId }: { doctorId?: string }) {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors?isOnlineAvailable=false');
        const data = await res.json();
        if (data.success) {
          setDoctors(data.data);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  // If doctorId is provided, select that doctor
  useEffect(() => {
    if (doctorId && doctors.length > 0) {
      const doctor = doctors.find((d) => d.id === doctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
        setStep(2);
      }
    }
  }, [doctorId, doctors]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchAvailableSlots = async () => {
    setIsLoading(true);
    try {
      // Generate time slots from 9:00 to 17:00
      const slots: TimeSlot[] = [];
      const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

      for (const time of times) {
        // TODO: Check against doctor's appointments and blocked slots
        slots.push({
          time,
          available: Math.random() > 0.3, // Simulate availability
        });
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      return;
    }

    const formData = {
      doctorId: selectedDoctor.id,
      appointmentDate: selectedDate,
      startTime: selectedTime,
      endTime: getEndTime(selectedTime),
      duration: 30,
    };

    // Validate
    const result = appointmentSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        formattedErrors[path] = error.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error?.message || t('errorOccurred') });
        setIsLoading(false);
        return;
      }

      // Success
      router.push(`/appointments/${data.data.id}`);
    } catch (error) {
      setErrors({ submit: t('errorOccurred') });
      setIsLoading(false);
    }
  };

  const getEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + 30);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getTomorrow = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNext30Days = (): string[] => {
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <div className="appointment-form-container">
      {/* Progress */}
      <div className="appointment-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Doktor Seçimi</span>
        </div>
        <div className={`progress-line ${step > 1 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Tarih & Saat</span>
        </div>
        <div className={`progress-line ${step > 2 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Onay</span>
        </div>
      </div>

      {/* Step 1: Doctor Selection */}
      {step === 1 && (
        <div className="appointment-step">
          <h2 className="step-title">Doktor Seçin</h2>
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`doctor-select-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setStep(2);
                }}
              >
                <div className="doctor-select-header">
                  <h3>{doctor.title} {doctor.fullName}</h3>
                  {doctor.department && <span className="doctor-department-badge">{doctor.department}</span>}
                </div>
                <div className="doctor-select-body">
                  {doctor.hospital && <p className="hospital-name">🏥 {doctor.hospital}</p>}
                  {doctor.consultationFee && <p className="consultation-fee">{doctor.consultationFee} ₺</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {step === 2 && selectedDoctor && (
        <div className="appointment-step">
          <button className="btn-back" onClick={() => setStep(1)}>
            ← Doktor Değiştir
          </button>

          <h2 className="step-title">Tarih ve Saat Seçin</h2>
          <p className="step-subtitle">
            {selectedDoctor.title} {selectedDoctor.fullName}
          </p>

          <div className="datetime-selection">
            {/* Date Selection */}
            <div className="date-selection">
              <h3>Tarih</h3>
              <div className="dates-grid">
                {getNext30Days().slice(0, 14).map((date) => {
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' });
                  return (
                    <button
                      key={date}
                      type="button"
                      className={`date-btn ${selectedDate === date ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {dayName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="time-selection">
                <h3>Saat</h3>
                {isLoading ? (
                  <div className="time-slots-loading">Yükleniyor...</div>
                ) : (
                  <div className="time-slots-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`time-slot ${!slot.available ? 'disabled' : ''} ${selectedTime === slot.time ? 'selected' : ''}`}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedDate && selectedTime && (
            <div className="step-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(3)}
              >
                Devam Et
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && selectedDoctor && selectedDate && selectedTime && (
        <div className="appointment-step">
          <button className="btn-back" onClick={() => setStep(2)}>
            ← Dön
          </button>

          <h2 className="step-title">Randevu Özeti</h2>

          <div className="appointment-summary">
            <div className="summary-item">
              <span className="summary-label">Doktor:</span>
              <span className="summary-value">
                {selectedDoctor.title} {selectedDoctor.fullName}
              </span>
            </div>
            {selectedDoctor.department && (
              <div className="summary-item">
                <span className="summary-label">Bölüm:</span>
                <span className="summary-value">{selectedDoctor.department}</span>
              </div>
            )}
            {selectedDoctor.hospital && (
              <div className="summary-item">
                <span className="summary-label">Hastane:</span>
                <span className="summary-value">{selectedDoctor.hospital}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">Tarih:</span>
              <span className="summary-value">
                {new Date(selectedDate).toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Saat:</span>
              <span className="summary-value">
                {selectedTime} - {getEndTime(selectedTime)}
              </span>
            </div>
            {selectedDoctor.consultationFee && (
              <div className="summary-item total">
                <span className="summary-label">Ücret:</span>
                <span className="summary-value">{selectedDoctor.consultationFee} ₺</span>
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="alert alert-error">{errors.submit}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Şikayet / Konu</label>
              <textarea
                name="reason"
                className="form-textarea"
                placeholder="Randevu sebebini kısaca yazın..."
                rows={3}
              />
            </div>

            <div className="step-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isLoading}
              >
                {isLoading ? 'İşleniyor...' : 'Randevuyu Onayla'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
