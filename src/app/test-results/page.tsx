// LUMINEX Next.js - Test Results Page
// Tahlil sonuçları sayfası

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

async function getTestResults(userId: string, role: string) {
  const where: any = {};

  if (role === 'PATIENT') {
    where.patient = { userId };
  } else if (role === 'DOCTOR') {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId },
    });
    if (doctor) {
      // Doktorun randevularindeki hastaların sonuçları
      const appointmentIds = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        select: { id: true },
      });
      where.appointmentId = {
        in: appointmentIds.map((a) => a.id),
      };
    }
  }

  const testResults = await prisma.testResult.findMany({
    where,
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
      appointment: {
        select: {
          id: true,
          appointmentNo: true,
          appointmentDate: true,
        },
      },
    },
    orderBy: { testDate: 'desc' },
    take: 50,
  });

  return testResults;
}

function getTestTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    BLOOD: '🩸',
    URINE: '💧',
    XRAY: '📷',
    MRI: '🧠',
    CT: '💿',
    ULTRASOUND: '🔊',
    BIOPSY: '🔬',
    OTHER: '📋',
  };
  return icons[type] || '📋';
}

function getTestTypeName(type: string): string {
  const names: Record<string, string> = {
    BLOOD: 'Kan Tahlili',
    URINE: 'İdrar Tahlili',
    XRAY: 'Röntgen',
    MRI: 'MR',
    CT: 'BT',
    ULTRASOUND: 'Ultrason',
    BIOPSY: 'Biyopsi',
    OTHER: 'Diğer',
  };
  return names[type] || 'Diğer';
}

export default async function TestResultsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/test-results');
  }

  const testResults = await getTestResults(session.user.id, session.user.role);

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Tahlil Sonuçları</h1>
            <p className="page-subtitle">
              {testResults.length} tahlil sonucunuz bulunuyor
              {testResults.some((r) => r.isAbnormal) && ' ⚠️ Dikkat: Anormal sonuçlar mevcut'}
            </p>
          </div>
        </div>

        {/* Test Results List */}
        {testResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔬</div>
            <h3>Tahlil Sonucu Yok</h3>
            <p>Tahlil sonuçlarınız hazır olduğunda burada görüntülenecek.</p>
          </div>
        ) : (
          <div className="test-results-grid">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`test-result-card ${result.isAbnormal ? 'abnormal' : 'normal'}`}
              >
                <div className="test-result-header">
                  <div className="test-result-icon">{getTestTypeIcon(result.testType)}</div>
                  <div className="test-result-info">
                    <div className="test-result-no">{result.resultNo}</div>
                    <div className="test-result-type">{getTestTypeName(result.testType)}</div>
                  </div>
                  <div className={`test-result-status ${result.isAbnormal ? 'abnormal' : 'normal'}`}>
                    {result.isAbnormal ? 'Anormal' : 'Normal'}
                  </div>
                </div>

                <div className="test-result-body">
                  <div className="test-result-name">{result.testName}</div>

                  {session.user.role === 'DOCTOR' && (
                    <div className="test-result-patient">
                      <span className="label">Hasta:</span>
                      <span className="value">
                        {result.patient.user.firstName} {result.patient.user.lastName}
                      </span>
                    </div>
                  )}

                  <div className="test-result-date">
                    <span className="label">Tarih:</span>
                    <span className="value">
                      {format(result.testDate, 'd MMMM yyyy', { locale: tr })}
                    </span>
                  </div>

                  {result.appointment && (
                    <div className="test-result-appointment">
                      <span className="label">Randevu:</span>
                      <span className="value">{result.appointment.appointmentNo}</span>
                    </div>
                  )}

                  <div className="test-result-result">
                    <span className="label">Sonuç:</span>
                    <span className="value">{result.result}</span>
                  </div>

                  {result.normalRange && (
                    <div className="test-result-range">
                      <span className="label">Normal Değer Aralığı:</span>
                      <span className="value">{result.normalRange}</span>
                    </div>
                  )}

                  {result.isAbnormal && (
                    <div className="test-result-warning">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Normal değer aralığının dışında. Lütfen doktorunuzla görüşün.</span>
                    </div>
                  )}

                  {result.notes && (
                    <div className="test-result-notes">
                      <span className="label">Not:</span>
                      <span className="value">{result.notes}</span>
                    </div>
                  )}
                </div>

                <div className="test-result-footer">
                  <button className="btn btn-outline btn-sm">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    İndir
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Detaylar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
