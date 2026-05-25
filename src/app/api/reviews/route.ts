export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const reviewSchema = z.object({
  collegeId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(200),
  body: z.string().min(10).max(2000),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');
    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { collegeId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error('Reviews list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Verify college exists
    const college = await prisma.college.findUnique({
      where: { id: parsed.data.collegeId },
      select: { id: true },
    });
    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // Prevent duplicate reviews from same user
    const existing = await prisma.review.findFirst({
      where: {
        collegeId: parsed.data.collegeId,
        userId: session.user.id,
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this college' }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: { ...parsed.data, userId: session.user.id },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error('Review create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
