// LUMINEX - Sitemap.ts
// SEO için sitemap oluşturma

import { MetadataRoute } from 'next';

const baseUrl = 'https://luminex.com.tr';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  return [
    // Ana Sayfa
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1
    },

    // Kimlik Doğrulama
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4
    },

    // Ana Sayfalar
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/doctors`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/hospitals`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/appointment`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8
    },

    // Hasta Sayfaları
    {
      url: `${baseUrl}/messages`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: `${baseUrl}/notifications`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6
    },
    {
      url: `${baseUrl}/prescriptions`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: `${baseUrl}/test-results`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: `${baseUrl}/payment`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/payment/demo`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5
    },

    // Doktor Sayfaları
    {
      url: `${baseUrl}/doctor/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/doctor/availability`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7
    },

    // Admin Sayfaları
    {
      url: `${baseUrl}/admin/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.5
    },

    // Yasal Sayfalar
    {
      url: `${baseUrl}/kvkk`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3
    }
  ];
}

// Dinamik sitemap - Doktorlar için
// Doktorlar database'e eklendikçe sitemap güncellenir
export async function generateDynamicSitemap() {
  const { prisma } = await import('@/lib/db');

  const doctors = await prisma.doctorProfile.findMany({
    where: { isAvailable: true },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  const doctorUrls: MetadataRoute.Sitemap = doctors.map((doctor) => ({
    url: `${baseUrl}/doctors/${doctor.id}`,
    lastModified: doctor.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7
  }));

  return doctorUrls;
}

// Dinamik sitemap - Hastaneler için
export async function generateHospitalSitemap() {
  const { prisma } = await import('@/lib/db');

  const hospitals = await prisma.hospital.findMany({
    where: { isActive: true }
  });

  const hospitalUrls: MetadataRoute.Sitemap = hospitals.map((hospital) => ({
    url: `${baseUrl}/hospitals/${hospital.slug}`,
    lastModified: hospital.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7
  }));

  return hospitalUrls;
}

// Dinamik sitemap - Departmanlar için
export async function generateDepartmentSitemap() {
  const { prisma } = await import('@/lib/db');

  const departments = await prisma.department.findMany({
    where: { isActive: true }
  });

  const departmentUrls: MetadataRoute.Sitemap = departments.map((dept) => ({
    url: `${baseUrl}/departments/${dept.slug}`,
    lastModified: dept.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6
  }));

  return departmentUrls;
}
