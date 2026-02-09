// LUMINEX Next.js - Single Message API Route
// GET /api/messages/[id] - Mesaj detayı
// PUT /api/messages/[id] - Mesaj güncelleme (okundu, arşivle)
// DELETE /api/messages/[id] - Mesaj silme

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
            phone: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
            phone: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentNo: true,
            appointmentDate: true,
            doctor: {
              select: {
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
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Mesaj bulunamadı' } },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (
      message.senderId !== session.user.id &&
      message.receiverId !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu mesajı okuma yetkiniz yok' } },
        { status: 403 }
      );
    }

    // Okunmamışsa ve alıcıysa okundu işaretle
    if (!message.isRead && message.receiverId === session.user.id) {
      await prisma.message.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      message.isRead = true;
      message.readAt = new Date();
    }

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Message GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Mesaj bulunamadı' } },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (
      message.senderId !== session.user.id &&
      message.receiverId !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu mesajı düzenleme yetkiniz yok' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    const updateData: any = {};

    if (action === 'archive') {
      // Gönderen mi alıcı mı?
      if (message.senderId === session.user.id) {
        updateData.isSenderArchived = true;
      } else {
        updateData.isReceiverArchived = true;
      }
    } else if (action === 'unarchive') {
      if (message.senderId === session.user.id) {
        updateData.isSenderArchived = false;
      } else {
        updateData.isReceiverArchived = false;
      }
    } else if (action === 'markRead' && message.receiverId === session.user.id) {
      updateData.isRead = true;
      updateData.readAt = new Date();
    } else if (action === 'markUnread' && message.receiverId === session.user.id) {
      updateData.isRead = false;
      updateData.readAt = null;
    }

    const updated = await prisma.message.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Mesaj güncellendi',
    });
  } catch (error) {
    console.error('Message PUT error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Mesaj bulunamadı' } },
        { status: 404 }
      );
    }

    // Yetki kontrolü - sadece gönderen silebilir
    if (message.senderId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu mesajı silme yetkiniz yok' } },
        { status: 403 }
      );
    }

    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Mesaj silindi',
    });
  } catch (error) {
    console.error('Message DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
