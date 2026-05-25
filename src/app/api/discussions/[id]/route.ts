export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
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
