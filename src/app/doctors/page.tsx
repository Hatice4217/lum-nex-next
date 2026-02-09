// LUMINEX Next.js - Doctors Page
// Doktorlar listesi sayfası

import { DoctorsList } from '@/components/doctors/DoctorsList';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { prisma } from '@/lib/db';

async function getDoctors() {
  const doctors = await prisma.doctorProfile.findMany({
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
      hospital: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [
      { rating: 'desc' },
      { totalReviews: 'desc' },
    ],
    take: 12,
  });

  return doctors.map((doctor) => ({
    id: doctor.id,
    userId: doctor.user.id,
    firstName: doctor.user.firstName,
    lastName: doctor.user.lastName,
    fullName: `${doctor.user.firstName} ${doctor.user.lastName}`,
    title: doctor.title || undefined,
    avatar: doctor.user.avatar,
    hospital: doctor.hospital,
    department: doctor.department,
    rating: doctor.rating,
    totalReviews: doctor.totalReviews,
    consultationFee: doctor.consultationFee,
    isAvailable: doctor.isAvailable,
    experience: doctor.experience,
  }));
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: { department?: string; hospital?: string; city?: string };
}) {
  const doctors = await getDoctors();

  const initialFilters = {
    department: searchParams.department,
    hospital: searchParams.hospital,
    city: searchParams.city,
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Doktorlar</h1>
          <p className="page-subtitle">
            Türkiye\'nin en iyi doktorlarına ulaşın, randevunuzu oluşturun.
          </p>
        </div>

        <DoctorsList initialDoctors={doctors} initialFilters={initialFilters} />
      </main>
      <Footer />
    </>
  );
}
