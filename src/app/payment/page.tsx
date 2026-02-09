// LUMINEX Next.js - Payment Page
// Ödeme sayfası

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

async function getPayments(userId: string, role: string) {
  const where: any = {};

  if (role === 'PATIENT') {
    where.patient = { userId };
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      appointment: {
        include: {
          doctor: {
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
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return payments;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'info',
  };
  return colors[status] || 'default';
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    PENDING: 'Bekliyor',
    COMPLETED: 'Tamamlandı',
    FAILED: 'Başarısız',
    REFUNDED: 'İade Edildi',
  };
  return texts[status] || status;
}

function getMethodText(method: string): string {
  const texts: Record<string, string> = {
    CREDIT_CARD: 'Kredi Kartı',
    BANK_TRANSFER: 'Banka Havalesi',
    CASH: 'Nakit',
    ONLINE: 'Online Ödeme',
  };
  return texts[method] || method;
}

export default async function PaymentPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/payment');
  }

  if (session.user.role !== 'PATIENT') {
    redirect('/dashboard');
  }

  const payments = await getPayments(session.user.id, session.user.role);

  // Bekleyen ödemeleri ve tamamlanan ödemeleri ayır
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const completedPayments = payments.filter((p) => p.status === 'COMPLETED');

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Ödemelerim</h1>
            <p className="page-subtitle">
              {pendingPayments.length > 0
                ? `${pendingPayments.length} bekleyen ödemeniz var`
                : 'Bekleyen ödemeniz bulunmuyor'}
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <section className="payment-section">
            <h2 className="section-title">Bekleyen Ödemeler</h2>
            <div className="payments-list">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="payment-card pending">
                  <div className="payment-header">
                    <div className="payment-amount">
                      {payment.amount.toLocaleString('tr-TR')} TL
                    </div>
                    <div className="payment-status pending">
                      <span className="status-dot"></span>
                      {getStatusText(payment.status)}
                    </div>
                  </div>

                  <div className="payment-body">
                    {payment.appointment && (
                      <div className="payment-appointment">
                        <span className="label">Randevu:</span>
                        <span className="value">{payment.appointment.appointmentNo}</span>
                      </div>
                    )}

                    <div className="payment-doctor">
                      <span className="label">Doktor:</span>
                      <span className="value">
                        {payment.appointment?.doctor.user.firstName}{' '}
                        {payment.appointment?.doctor.user.lastName}
                      </span>
                    </div>

                    <div className="payment-date">
                      <span className="label">Oluşturulma:</span>
                      <span className="value">
                        {format(payment.createdAt, 'd MMMM yyyy, HH:mm', { locale: tr })}
                      </span>
                    </div>

                    <div className="payment-method">
                      <span className="label">Yöntem:</span>
                      <span className="value">{getMethodText(payment.method)}</span>
                    </div>
                  </div>

                  <div className="payment-footer">
                    <form method="POST" action={`/api/payments/${payment.id}`}>
                      <button type="submit" className="btn btn-primary">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        Ödeme Yap
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed Payments */}
        {completedPayments.length > 0 && (
          <section className="payment-section">
            <h2 className="section-title">Geçmiş Ödemeler</h2>
            <div className="payments-list">
              {completedPayments.map((payment) => (
                <div key={payment.id} className="payment-card completed">
                  <div className="payment-header">
                    <div className="payment-amount">
                      {payment.amount.toLocaleString('tr-TR')} TL
                    </div>
                    <div className="payment-status completed">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getStatusText(payment.status)}
                    </div>
                  </div>

                  <div className="payment-body">
                    {payment.transactionId && (
                      <div className="payment-transaction">
                        <span className="label">İşlem No:</span>
                        <span className="value">{payment.transactionId}</span>
                      </div>
                    )}

                    {payment.appointment && (
                      <div className="payment-appointment">
                        <span className="label">Randevu:</span>
                        <span className="value">{payment.appointment.appointmentNo}</span>
                      </div>
                    )}

                    <div className="payment-doctor">
                      <span className="label">Doktor:</span>
                      <span className="value">
                        {payment.appointment?.doctor.user.firstName}{' '}
                        {payment.appointment?.doctor.user.lastName}
                      </span>
                    </div>

                    <div className="payment-date">
                      <span className="label">Ödeme Tarihi:</span>
                      <span className="value">
                        {payment.paidAt
                          ? format(payment.paidAt, 'd MMMM yyyy, HH:mm', { locale: tr })
                          : format(payment.createdAt, 'd MMMM yyyy, HH:mm', { locale: tr })}
                      </span>
                    </div>

                    <div className="payment-method">
                      <span className="label">Yöntem:</span>
                      <span className="value">{getMethodText(payment.method)}</span>
                    </div>
                  </div>

                  <div className="payment-footer">
                    <button className="btn btn-outline btn-sm">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Fiş İndir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {payments.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>Ödemeleriniz Yok</h3>
            <p>Randevu ödemeleriniz burada görüntülenecek.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
