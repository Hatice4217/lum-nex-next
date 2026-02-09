// LUMINEX Next.js - Appointment Page
// Randevu oluşturma sayfası

import { AppointmentForm } from '@/components/appointment/AppointmentForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AppointmentPage({
  searchParams,
}: {
  searchParams: { doctor?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/appointment');
  }

  if (session.user.role !== 'PATIENT') {
    redirect('/dashboard');
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Randevu Al</h1>
          <p className="page-subtitle">
            Size en uygun doktoru seçin, randevunuzu kolayca oluşturun.
          </p>
        </div>

        <AppointmentForm doctorId={searchParams.doctor} />
      </main>
      <Footer />
    </>
  );
}
