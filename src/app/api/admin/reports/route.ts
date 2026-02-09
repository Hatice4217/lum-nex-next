// LUMINEX - Admin Reports API
// GET /api/admin/reports - Get system statistics and reports

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get report statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch all statistics in parallel
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalPayments,
      appointmentsByMonth,
      departmentStats,
      recentActivities
    ] = await Promise.all([
      // Total users count
      prisma.user.count({
        where: { isActive: true }
      }),

      // Total doctors count
      prisma.doctorProfile.count({
        where: { isAvailable: true }
      }),

      // Total patients count
      prisma.patientProfile.count(),

      // Total appointments count in range
      prisma.appointment.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Total revenue in range
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: startDate },
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),

      // Appointments by month
      prisma.$queryRaw`
        SELECT
          strftime('%Y-%m', appointmentDate) as month,
          COUNT(*) as count
        FROM Appointment
        WHERE appointmentDate >= ${startDate.toISOString()}
        GROUP BY strftime('%Y-%m', appointmentDate)
        ORDER BY month
      `,

      // Department distribution
      prisma.department.findMany({
        include: {
          _count: {
            select: {
              doctors: true,
              appointments: {
                where: {
                  appointmentDate: { gte: startDate }
                }
              }
            }
          }
        }
      }),

      // Recent activities
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    ]);

    // Format monthly appointments data
    const monthlyAppointments = (appointmentsByMonth as any[]).map(item => ({
      month: item.month,
      count: Number(item.count)
    }));

    // Format department distribution
    const departmentDistribution = departmentStats.map((dept, index) => ({
      name: dept.name,
      value: dept._count.appointments,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'][index % 7]
    }));

    // Format recent activities
    const recentActivity = recentActivities.map(log => ({
      id: log.id,
      type: log.action,
      description: log.description,
      timestamp: log.createdAt
    }));

    const stats = {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalRevenue: totalPayments._sum.amount || 0,
      monthlyAppointments,
      departmentDistribution,
      recentActivity
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Reports GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Raporlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// GET /api/admin/reports/export - Export reports as Excel/CSV
export async function generateExportReport(req: NextRequest) {
  // This would be implemented with a library like xlsx or csv-writer
  // For now, return a placeholder
  return NextResponse.json({
    success: false,
    error: 'Export özelliği yakında eklenecek'
  }, { status: 501 });
}
