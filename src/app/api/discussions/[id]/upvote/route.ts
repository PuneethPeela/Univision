export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
