import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if discussion exists
    const existing = await prisma.discussion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    const discussion = await prisma.discussion.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
    });
    return NextResponse.json({ upvotes: discussion.upvotes });
  } catch (err) {
    console.error('Upvote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
