// LUMINEX Next.js - Messages API Routes
// GET /api/messages - Mesaj listesi
// POST /api/messages - Yeni mesaj gönder

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const messageSchema = z.object({
  receiverId: z.string().cuid(),
  subject: z.string().min(2, 'Konu en az 2 karakter olmalı').max(200, 'Konu en fazla 200 karakter olabilir'),
  content: z.string().min(1, 'Mesaj içeriği boş olamaz').max(5000, 'Mesaj en fazla 5000 karakter olabilir'),
  appointmentId: z.string().cuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder') || 'inbox'; // inbox, sent, archived
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');

    const where: any = {};

    if (folder === 'inbox') {
      where.receiverId = session.user.id;
    } else if (folder === 'sent') {
      where.senderId = session.user.id;
    } else if (folder === 'archived') {
      where.OR = [
        { senderId: session.user.id, isSenderArchived: true },
        { receiverId: session.user.id, isReceiverArchived: true },
      ];
    }

    const [messages, total, unreadCount] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.message.count({ where }),
      folder === 'inbox'
        ? prisma.message.count({
            where: {
              receiverId: session.user.id,
              isRead: false,
            },
          })
        : Promise.resolve(0),
    ]);

    return NextResponse.json({
      success: true,
      data: messages,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = messageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: result.error } },
        { status: 400 }
      );
    }

    const data = result.data;

    // Alıcı kontrol
    const receiver = await prisma.user.findUnique({
      where: { id: data.receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { success: false, error: { code: 'RECEIVER_NOT_FOUND', message: 'Alıcı bulunamadı' } },
        { status: 404 }
      );
    }

    // Kendine gönderme kontrolü
    if (data.receiverId === session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'CANNOT_SEND_TO_SELF', message: 'Kendinize mesaj gönderemezsiniz' } },
        { status: 400 }
      );
    }

    // Mesaj oluştur
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: data.receiverId,
        subject: data.subject,
        content: data.content,
        appointmentId: data.appointmentId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Bildirim oluştur
    await prisma.notification.create({
      data: {
        userId: data.receiverId,
        type: 'MESSAGE',
        title: 'Yeni Mesajınız Var',
        message: `${message.sender.firstName} ${message.sender.lastName} size bir mesaj gönderdi: ${data.subject}`,
        link: `/messages/${message.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Mesaj başarıyla gönderildi',
    }, { status: 201 });
  } catch (error) {
    console.error('Message POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
