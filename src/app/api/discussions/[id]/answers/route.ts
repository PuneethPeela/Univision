export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const answerSchema = z.object({
  body: z.string().min(5).max(5000),
});

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
    const body = await req.json();
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Verify discussion exists
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    const answer = await prisma.answer.create({
      data: {
        body: parsed.data.body,
        discussionId: id,
        userId: session.user.id,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (err) {
    console.error('Answer create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
