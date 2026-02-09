// LUMINEX Next.js - Database Seed
// Örnek veriler ile veritabanını doldurur

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // 1. CREATE USERS
  // ============================================

  console.log('Creating users...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@luminex.com' },
    update: {},
    create: {
      email: 'admin@luminex.com',
      password: adminPassword,
      firstName: 'Sistem',
      lastName: 'Yöneticisi',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Test patients
  const patientPassword = await bcrypt.hash('patient123', 10);

  const patient1 = await prisma.user.upsert({
    where: { email: 'ahmet.yilmaz@example.com' },
    update: {},
    create: {
      email: 'ahmet.yilmaz@example.com',
      password: patientPassword,
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      role: 'PATIENT',
      tcKimlikNo: '12345678901',
      phone: '+905551234567',
      gender: 'MALE',
      dateOfBirth: new Date('1985-05-15'),
      isActive: true,
    },
  });

  const patient2 = await prisma.user.upsert({
    where: { email: 'ayse.demir@example.com' },
    update: {},
    create: {
      email: 'ayse.demir@example.com',
      password: patientPassword,
      firstName: 'Ayşe',
      lastName: 'Demir',
      role: 'PATIENT',
      tcKimlikNo: '12345678902',
      phone: '+905551234568',
      gender: 'FEMALE',
      dateOfBirth: new Date('1990-08-22'),
      isActive: true,
    },
  });

  // Test doctors
  const doctorPassword = await bcrypt.hash('doctor123', 10);

  const doctor1User = await prisma.user.upsert({
    where: { email: 'dr.mehmet.kaya@example.com' },
    update: {},
    create: {
      email: 'dr.mehmet.kaya@example.com',
      password: doctorPassword,
      firstName: 'Mehmet',
      lastName: 'Kaya',
      role: 'DOCTOR',
      tcKimlikNo: '98765432101',
      phone: '+905551234569',
      gender: 'MALE',
      isActive: true,
    },
  });

  const doctor2User = await prisma.user.upsert({
    where: { email: 'dr.zeynep.aktas@example.com' },
    update: {},
    create: {
      email: 'dr.zeynep.aktas@example.com',
      password: doctorPassword,
      firstName: 'Zeynep',
      lastName: 'Aktaş',
      role: 'DOCTOR',
      tcKimlikNo: '98765432102',
      phone: '+905551234570',
      gender: 'FEMALE',
      isActive: true,
    },
  });

  const doctor3User = await prisma.user.upsert({
    where: { email: 'dr.can.ozturk@example.com' },
    update: {},
    create: {
      email: 'dr.can.ozturk@example.com',
      password: doctorPassword,
      firstName: 'Can',
      lastName: 'Öztürk',
      role: 'DOCTOR',
      tcKimlikNo: '98765432103',
      phone: '+905551234571',
      gender: 'MALE',
      isActive: true,
    },
  });

  // ============================================
  // 2. CREATE PATIENT PROFILES
  // ============================================

  console.log('Creating patient profiles...');

  await prisma.patientProfile.upsert({
    where: { userId: patient1.id },
    update: {},
    create: {
      userId: patient1.id,
      bloodType: 'A+',
      allergies: JSON.stringify(['Penisilin']),
      chronicDiseases: JSON.stringify(['Hipertansiyon']),
      emergencyContact: 'Fatma Yılmaz',
      emergencyPhone: '+905551234572',
      city: 'İstanbul',
      district: 'Kadıköy',
    },
  });

  await prisma.patientProfile.upsert({
    where: { userId: patient2.id },
    update: {},
    create: {
      userId: patient2.id,
      bloodType: 'O+',
      allergies: JSON.stringify([]),
      chronicDiseases: JSON.stringify([]),
      emergencyContact: 'Mehmet Demir',
      emergencyPhone: '+905551234573',
      city: 'İstanbul',
      district: 'Beşiktaş',
    },
  });

  // ============================================
  // 3. CREATE HOSPITALS
  // ============================================

  console.log('Creating hospitals...');

  const hospital1 = await prisma.hospital.upsert({
    where: { slug: 'acibadem-kadikoy' },
    update: {},
    create: {
      name: 'Acıbadem Kadıköy Hastanesi',
      slug: 'acibadem-kadikoy',
      address: 'Caferağa Mah. Dr.Şükrü Erdem Sok. No:23',
      city: 'İstanbul',
      district: 'Kadıköy',
      phone: '+9021634600000',
      email: 'kadikoy@acibadem.com.tr',
      website: 'https://www.acibadem.com.tr',
      description: 'Acıbadem Kadıköy Hastanesi, İstanbul\'ın en büyük özel hastanelerinden biridir. Modern tıbbi teknolojiler ve deneyimli hekim kadrosu ile hizmet vermektedir.',
      facilities: JSON.stringify([
        '7/24 Acil Servis',
        'MR',
        'BT',
        'Ultrason',
        'Endoskopi',
        'Kolonoskopi',
        'Laboratuvar',
        'Eczane',
        'Otopark',
        'Yemekhane',
        'Wi-Fi',
      ]),
      workingHours: JSON.stringify({
        'Pazartesi': '00:00 - 24:00',
        'Salı': '00:00 - 24:00',
        'Çarşamba': '00:00 - 24:00',
        'Perşembe': '00:00 - 24:00',
        'Cuma': '00:00 - 24:00',
        'Cumartesi': '00:00 - 24:00',
        'Pazar': '00:00 - 24:00',
      }),
      emergencyService: true,
      isActive: true,
      rating: 4.7,
      totalReviews: 1250,
    },
  });

  const hospital2 = await prisma.hospital.upsert({
    where: { slug: 'memorial-sisli' },
    update: {},
    create: {
      name: 'Memorial Şişli Hastanesi',
      slug: 'memorial-sisli',
      address: 'Halaskargazi Mah. Büyükdere Cad. No:185',
      city: 'İstanbul',
      district: 'Şişli',
      phone: '+9021233300000',
      email: 'sisli@memorial.com.tr',
      website: 'https://www.memorial.com.tr',
      description: 'Memorial Şişli Hastanesi, JCI akreditasyonuna sahip, uluslararası standartlarda sağlık hizmeti sunan bir kurumdur.',
      facilities: JSON.stringify([
        '7/24 Acil Servis',
        'MR',
        'BT',
        'PET-CT',
        'Laboratuvar',
        'Eczane',
        'Otopark',
        'VIP Odalar',
      ]),
      workingHours: JSON.stringify({
        'Pazartesi': '00:00 - 24:00',
        'Salı': '00:00 - 24:00',
        'Çarşamba': '00:00 - 24:00',
        'Perşembe': '00:00 - 24:00',
        'Cuma': '00:00 - 24:00',
        'Cumartesi': '00:00 - 24:00',
        'Pazar': '00:00 - 24:00',
      }),
      emergencyService: true,
      isActive: true,
      rating: 4.8,
      totalReviews: 2100,
    },
  });

  const hospital3 = await prisma.hospital.upsert({
    where: { slug: 'ankara-city-hospital' },
    update: {},
    create: {
      name: 'Ankara City Hospital',
      slug: 'ankara-city-hospital',
      address: 'Çankaya Mah. Tubitak Cad. No:12',
      city: 'Ankara',
      district: 'Çankaya',
      phone: '+903123000000',
      email: 'info@ankaracity.com',
      website: 'https://www.ankaracity.com',
      description: 'Ankara City Hospital, başkentimizin en modern sağlık komplekslerinden biridir.',
      facilities: JSON.stringify([
        '7/24 Acil Servis',
        'MR',
        'BT',
        'Laboratuvar',
        'Eczane',
        'Otopark',
      ]),
      workingHours: JSON.stringify({
        'Pazartesi': '08:00 - 20:00',
        'Salı': '08:00 - 20:00',
        'Çarşamba': '08:00 - 20:00',
        'Perşembe': '08:00 - 20:00',
        'Cuma': '08:00 - 20:00',
        'Cumartesi': '09:00 - 18:00',
        'Pazar': '10:00 - 16:00',
      }),
      emergencyService: true,
      isActive: true,
      rating: 4.5,
      totalReviews: 850,
    },
  });

  // ============================================
  // 4. CREATE DEPARTMENTS
  // ============================================

  console.log('Creating departments...');

  const departments = [
    { name: 'Kardiyoloji', slug: 'kardiyoloji', icon: '❤️' },
    { name: 'Dahiliye', slug: 'dahiliye', icon: '🩺' },
    { name: 'Çocuk Sağlığı', slug: 'cocuk-sagligi', icon: '👶' },
    { name: 'Kadın Doğum', slug: 'kadin-dogum', icon: '👩‍⚕️' },
    { name: 'Ortopedi', slug: 'ortopedi', icon: '🦴' },
    { name: 'Göz Hastalıkları', slug: 'goz', icon: '👁️' },
    { name: 'Kulak Burun Boğaz', slug: 'kbb', icon: '👂' },
    { name: 'Cildiye', slug: 'cildiye', icon: '🧴' },
    { name: 'Nöroloji', slug: 'noroloji', icon: '🧠' },
    { name: 'Üroloji', slug: 'uroloji', icon: '🏥' },
    { name: 'Diş Hekimliği', slug: 'dis', icon: '🦷' },
    { name: 'Psikiyatri', slug: 'psikiyatri', icon: '🧘' },
  ];

  const createdDepartments: any[] = [];

  for (const dept of departments) {
    const department = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: {},
      create: {
        name: dept.name,
        slug: dept.slug,
        icon: dept.icon,
        description: `${dept.name} bölümü, modern tıbbi teknolojiler ile hizmet vermektedir.`,
        isActive: true,
      },
    });
    createdDepartments.push(department);
  }

  // ============================================
  // 5. CREATE DOCTOR PROFILES
  // ============================================

  console.log('Creating doctor profiles...');

  const doctor1 = await prisma.doctorProfile.upsert({
    where: { userId: doctor1User.id },
    update: {},
    create: {
      userId: doctor1User.id,
      licenseNo: '12345',
      hospitalId: hospital1.id,
      departmentId: createdDepartments[0].id, // Kardiyoloji
      title: 'Prof. Dr.',
      experience: 20,
      education: JSON.stringify([
        { year: '1995', degree: 'Tıp Fakültesi', school: 'İstanbul Üniversitesi' },
        { year: '2000', degree: 'Kardiyoloji Uzmanlığı', school: 'Acıbadem' },
        { year: '2005', degree: 'Doçent', school: 'İstanbul Üniversitesi' },
        { year: '2010', degree: 'Profesör', school: 'İstanbul Üniversitesi' },
      ]),
      specializations: JSON.stringify([
        'İnterventrik Kardiyoloji',
        'Koroner Anjiografi',
        'Pacemaker',
        'EKO',
      ]),
      biography: 'Prof. Dr. Mehmet Kaya, 20 yıllık deneyimi ile kardiyoloji alanında uzmanlaşmıştır. İnterventrik kardiyoloji konusunda Türkiye\'nin önde gelen isimlerinden biridir.',
      consultationFee: 1500,
      isAvailable: true,
      rating: 4.9,
      totalReviews: 450,
      languages: JSON.stringify(['Türkçe', 'İngilizce', 'Almanca']),
      schedule: JSON.stringify({
        'Pazartesi': '09:00 - 17:00',
        'Salı': '09:00 - 17:00',
        'Çarşamba': '09:00 - 17:00',
        'Perşembe': '09:00 - 17:00',
        'Cuma': '09:00 - 15:00',
      }),
    },
  });

  const doctor2 = await prisma.doctorProfile.upsert({
    where: { userId: doctor2User.id },
    update: {},
    create: {
      userId: doctor2User.id,
      licenseNo: '12346',
      hospitalId: hospital1.id,
      departmentId: createdDepartments[4].id, // Ortopedi
      title: 'Doç. Dr.',
      experience: 12,
      education: JSON.stringify([
        { year: '2005', degree: 'Tıp Fakültesi', school: 'Hacettepe Üniversitesi' },
        { year: '2012', degree: 'Ortopedi Uzmanlığı', school: 'Ankara Üniversitesi' },
        { year: '2018', degree: 'Doçent', school: 'Hacettepe Üniversitesi' },
      ]),
      specializations: JSON.stringify([
        'Diz Cerrahisi',
        'Kalça Cerrahisi',
        'Sports Medicine',
      ]),
      biography: 'Doç. Dr. Zeynep Aktaş, özellikle diz ve kalça cerrahisi konusunda uzmanlaşmış deneyimli bir ortopedisttir.',
      consultationFee: 1200,
      isAvailable: true,
      rating: 4.8,
      totalReviews: 320,
      languages: JSON.stringify(['Türkçe', 'İngilizce']),
      schedule: JSON.stringify({
        'Pazartesi': '10:00 - 18:00',
        'Salı': '10:00 - 18:00',
        'Çarşamba': '10:00 - 18:00',
        'Perşembe': '10:00 - 18:00',
        'Cuma': '10:00 - 16:00',
      }),
    },
  });

  const doctor3 = await prisma.doctorProfile.upsert({
    where: { userId: doctor3User.id },
    update: {},
    create: {
      userId: doctor3User.id,
      licenseNo: '12347',
      hospitalId: hospital2.id,
      departmentId: createdDepartments[1].id, // Dahiliye
      title: 'Dr.',
      experience: 8,
      education: JSON.stringify([
        { year: '2008', degree: 'Tıp Fakültesi', school: 'İstanbul Üniversitesi' },
        { year: '2016', degree: 'Dahiliye Uzmanlığı', school: 'Memorial' },
      ]),
      specializations: JSON.stringify([
        'Endokrinoloji',
        'Diyabet',
        'Tiroid Hastalıkları',
      ]),
      biography: 'Dr. Can Öztürk, dahiliye ve endokrinoloji alanında hizmet vermektedir.',
      consultationFee: 800,
      isAvailable: true,
      rating: 4.6,
      totalReviews: 180,
      languages: JSON.stringify(['Türkçe', 'İngilizce', 'Arapça']),
      schedule: JSON.stringify({
        'Pazartesi': '09:00 - 17:00',
        'Salı': '09:00 - 17:00',
        'Çarşamba': '09:00 - 17:00',
        'Perşembe': '09:00 - 17:00',
        'Cuma': '09:00 - 17:00',
      }),
    },
  });

  // ============================================
  // 6. CREATE SAMPLE APPOINTMENTS
  // ============================================

  console.log('Creating appointments...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      appointmentNo: 'RNV2025001001',
      patientId: patient1.id,
      doctorId: doctor1.id,
      hospitalId: hospital1.id,
      departmentId: createdDepartments[0].id,
      appointmentDate: tomorrow,
      startTime: '10:00',
      endTime: '10:30',
      duration: 30,
      status: 'CONFIRMED',
      reason: 'Kontrol muayenesi',
      symptoms: 'Göğüs ağrısı, nefes darlığı',
      isOnline: false,
    },
  });

  await prisma.appointment.create({
    data: {
      appointmentNo: 'RNV2025001002',
      patientId: patient2.id,
      doctorId: doctor2.id,
      hospitalId: hospital1.id,
      departmentId: createdDepartments[4].id,
      appointmentDate: nextWeek,
      startTime: '14:00',
      endTime: '14:30',
      duration: 30,
      status: 'PENDING',
      reason: 'Diz ağrısı kontrolü',
      symptoms: 'Merdiven çıkarken ağrı',
      isOnline: false,
    },
  });

  // ============================================
  // 7. CREATE NOTIFICATIONS
  // ============================================

  console.log('Creating notifications...');

  await prisma.notification.create({
    data: {
      userId: patient1.id,
      type: 'APPOINTMENT',
      title: 'Randevu Hatırlatması',
      message: 'Yarın saat 10:00\'daki Prof. Dr. Mehmet Kaya randevunuz için hazırlanın.',
      link: `/appointments/RNV2025001001`,
    },
  });

  await prisma.notification.create({
    data: {
      userId: doctor1User.id,
      type: 'APPOINTMENT',
      title: 'Yeni Randevu Talebi',
      message: 'Ayşe Demir tarafından yeni randevu talebi var.',
      link: `/doctor/appointments`,
    },
  });

  // ============================================
  // 8. CREATE LICENSE
  // ============================================

  console.log('Creating license...');

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  await prisma.license.upsert({
    where: { key: 'LUMINEX-DEV-001' },
    update: {},
    create: {
      key: 'LUMINEX-DEV-001',
      domain: 'localhost',
      isActive: true,
      expiresAt: oneYearFromNow,
      companyName: 'LUMINEX Development',
      contactName: 'Developer',
      contactEmail: 'dev@luminex.com',
      licenseType: 'SELF_HOSTED',
      maxUsers: 100,
      maxDoctors: 50,
      notes: 'Development license for local testing',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Test Users:');
  console.log('====================');
  console.log('Admin: admin@luminex.com / admin123');
  console.log('Patient: ahmet.yilmaz@example.com / patient123');
  console.log('Patient: ayse.demir@example.com / patient123');
  console.log('Doctor: dr.mehmet.kaya@example.com / doctor123');
  console.log('Doctor: dr.zeynep.aktas@example.com / doctor123');
  console.log('Doctor: dr.can.ozturk@example.com / doctor123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
