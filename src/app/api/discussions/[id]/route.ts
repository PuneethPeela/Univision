export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  body: z.string().min(10, 'Body must be at least 10 characters').max(5000),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        answers: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { answers: true } },
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    return NextResponse.json(discussion);
  } catch (err) {
    console.error('Discussion detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Verify ownership
    if (discussion.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own questions' }, { status: 403 });
    }

    const updated = await prisma.discussion.update({
      where: { id },
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Discussion update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Verify ownership
    if (discussion.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own questions' }, { status: 403 });
    }

    // Manual cascade delete inside a transaction to prevent constraint errors
    await prisma.$transaction([
      prisma.answer.deleteMany({
        where: { discussionId: id },
      }),
      prisma.discussion.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: 'Discussion deleted successfully' });
  } catch (err) {
    console.error('Discussion delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
