export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
