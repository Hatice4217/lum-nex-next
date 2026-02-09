// LUMINEX Next.js - Doctor Availability Page
// Doktor müsaitlik yönetimi sayfası

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { format, addDays, startOfWeek } from 'date-fns';
import { tr } from 'date-fns/locale';

async function getDoctorAvailability(userId: string) {
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

  // Bugünden itibaren 30 günün bloklanmış slotları
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      doctorId: doctor.id,
      date: {
        gte: today.toISOString(),
        lte: thirtyDaysLater.toISOString(),
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  // Yaklaşan randevular
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      appointmentDate: {
        gte: today.toISOString(),
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
    take: 20,
  });

  return { doctor, blockedSlots, upcomingAppointments };
}

export default async function DoctorAvailabilityPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'DOCTOR') {
    redirect('/login?callbackUrl=/doctor/availability');
  }

  const data = await getDoctorAvailability(session.user.id);

  if (!data) {
    redirect('/doctor/profile');
  }

  const { doctor, blockedSlots, upcomingAppointments } = data;

  // Bugünden itibaren 14 günlük takvim
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Müsaitlik Yönetimi</h1>
            <p className="page-subtitle">
              Dr. {doctor.user.firstName} {doctor.user.lastName}
            </p>
          </div>
        </div>

        <div className="availability-container">
          {/* Calendar */}
          <section className="availability-calendar">
            <h2 className="section-title">Takvim</h2>

            <div className="calendar-grid">
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayBlockedSlots = blockedSlots.filter((slot) => slot.date === dateStr);
                const dayAppointments = upcomingAppointments.filter(
                  (apt) => format(new Date(apt.appointmentDate), 'yyyy-MM-dd') === dateStr
                );

                const isFullyBlocked = dayBlockedSlots.some(
                  (slot) => slot.startTime === '00:00' && slot.endTime === '23:59'
                );

                return (
                  <div
                    key={dateStr}
                    className={`calendar-day ${isFullyBlocked ? 'blocked' : ''} ${
                      dayAppointments.length > 0 ? 'has-appointments' : ''
                    }`}
                  >
                    <div className="day-header">
                      <div className="day-name">{format(day, 'EEEE', { locale: tr })}</div>
                      <div className="day-date">{format(day, 'd MMM', { locale: tr })}</div>
                    </div>

                    <div className="day-slots">
                      {isFullyBlocked ? (
                        <div className="day-fully-blocked">Tüm Gün Bloklandı</div>
                      ) : (
                        <>
                          {dayAppointments.map((apt) => (
                            <div key={apt.id} className="day-appointment">
                              <div className="appointment-time">
                                {apt.startTime} - {apt.endTime}
                              </div>
                              <div className="appointment-patient">
                                {apt.patient.user.firstName} {apt.patient.user.lastName}
                              </div>
                            </div>
                          ))}

                          {dayBlockedSlots.map((slot) => (
                            <div key={slot.id} className="day-blocked">
                              <div className="blocked-time">
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <div className="blocked-reason">{slot.reason || 'Müsait değil'}</div>
                            </div>
                          ))}

                          {dayAppointments.length === 0 && dayBlockedSlots.length === 0 && (
                            <div className="day-empty">Müsait</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Blocked Slots List */}
          <section className="blocked-slots-section">
            <h2 className="section-title">Bloklanmış Saatler</h2>

            <form className="block-slot-form" method="POST" action="/api/availability/block">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Tarih</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    min={format(today, 'yyyy-MM-dd')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startTime">Başlangıç</label>
                  <input type="time" id="startTime" name="startTime" required />
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">Bitiş</label>
                  <input type="time" id="endTime" name="endTime" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reason">Sebep (opsiyonel)</label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  placeholder="Örn: Toplantı, Tatil, vb."
                  maxLength={200}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="allDay" />
                  Tüm günü blokla
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                Saat Ekle
              </button>
            </form>

            {blockedSlots.length > 0 ? (
              <div className="blocked-slots-list">
                {blockedSlots.map((slot) => (
                  <div key={slot.id} className="blocked-slot-item">
                    <div className="slot-date">
                      {format(new Date(slot.date), 'd MMMM yyyy EEEE', { locale: tr })}
                    </div>
                    <div className="slot-time">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    {slot.reason && <div className="slot-reason">{slot.reason}</div>}
                    <form method="POST" action={`/api/availability/${slot.id}/unblock`}>
                      <button type="submit" className="btn btn-sm btn-danger">
                        Kaldır
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state small">
                <p>Bloklanmış saat bulunmuyor</p>
              </div>
            )}
          </section>
        </div>

        {/* Schedule Display */}
        <section className="schedule-section">
          <h2 className="section-title">Haftalık Program</h2>

          {doctor.schedule ? (
            <div className="schedule-display">
              {Object.entries(JSON.parse(doctor.schedule)).map(([day, hours]: [string, any]) => (
                <div key={day} className="schedule-day">
                  <div className="schedule-day-name">{day}</div>
                  <div className="schedule-hours">{hours}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state small">
              <p>Haftalık program tanımlanmadı</p>
              <a href="/doctor/profile" className="btn btn-outline">
                Profili Düzenle
              </a>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
