// LUMINEX Next.js - Prescriptions Page
// Reçeteler sayfası

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

async function getPrescriptions(userId: string, role: string) {
  const where: any = {};

  if (role === 'PATIENT') {
    where.patient = { userId };
  } else if (role === 'DOCTOR') {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId },
    });
    if (doctor) {
      where.doctorId = doctor.id;
    }
  }

  const prescriptions = await prisma.prescription.findMany({
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
      doctor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: { issuedAt: 'desc' },
    take: 50,
  });

  return prescriptions;
}

export default async function PrescriptionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/prescriptions');
  }

  const prescriptions = await getPrescriptions(session.user.id, session.user.role);

  const isValid = (prescription: any) => {
    return new Date(prescription.validUntil) >= new Date();
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Reçetelerim</h1>
            <p className="page-subtitle">
              {prescriptions.length} reçeteniz bulunuyor
            </p>
          </div>
        </div>

        {/* Prescriptions List */}
        {prescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>Reçeteniz Yok</h3>
            <p>Doktorunuzun yazdığı reçeteler burada görüntülenecek.</p>
          </div>
        ) : (
          <div className="prescriptions-grid">
            {prescriptions.map((prescription) => {
              const active = isValid(prescription);
              const medications = JSON.parse(prescription.medications);

              return (
                <div
                  key={prescription.id}
                  className={`prescription-card ${active ? 'active' : 'expired'}`}
                >
                  <div className="prescription-header">
                    <div className="prescription-no">{prescription.prescriptionNo}</div>
                    <div className={`prescription-status ${active ? 'active' : 'expired'}`}>
                      {active ? 'Geçerli' : 'Süresi Dolmuş'}
                    </div>
                  </div>

                  <div className="prescription-body">
                    <div className="prescription-doctor">
                      <span className="label">Doktor:</span>
                      <span className="value">
                        {prescription.doctor.user.title} {prescription.doctor.user.firstName}{' '}
                        {prescription.doctor.user.lastName}
                      </span>
                    </div>

                    {session.user.role === 'DOCTOR' && (
                      <div className="prescription-patient">
                        <span className="label">Hasta:</span>
                        <span className="value">
                          {prescription.patient.user.firstName} {prescription.patient.user.lastName}
                        </span>
                      </div>
                    )}

                    <div className="prescription-date">
                      <span className="label">Düzenlenme Tarihi:</span>
                      <span className="value">
                        {format(prescription.issuedAt, 'd MMMM yyyy', { locale: tr })}
                      </span>
                    </div>

                    <div className="prescription-validity">
                      <span className="label">Geçerlilik:</span>
                      <span className="value">
                        {format(prescription.validUntil, 'd MMMM yyyy', { locale: tr })}
                      </span>
                    </div>

                    <div className="prescription-diagnosis">
                      <span className="label">Tanı:</span>
                      <span className="value">{prescription.diagnosis}</span>
                    </div>

                    <div className="prescription-medications">
                      <span className="label">İlaçlar:</span>
                      <ul className="medications-list">
                        {medications.map((med: any, index: number) => (
                          <li key={index}>
                            <span className="med-name">{med.name}</span>
                            {med.dosage && <span className="med-dosage"> - {med.dosage}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {prescription.usage && (
                      <div className="prescription-usage">
                        <span className="label">Kullanım:</span>
                        <span className="value">{prescription.usage}</span>
                      </div>
                    )}

                    {prescription.notes && (
                      <div className="prescription-notes">
                        <span className="label">Not:</span>
                        <span className="value">{prescription.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="prescription-footer">
                    <button className="btn btn-outline btn-sm">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Yazdır
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
