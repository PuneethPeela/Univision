import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const savedCreateSchema = z.object({
  collegeId: z.string().min(1, 'collegeId required').max(50),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const saved = await prisma.savedCollege.findMany({
      where: { userId: session.user.id },
      include: { college: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ saved });
  } catch (err) {
    console.error('Saved list error:', err);
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
    const parsed = savedCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { collegeId } = parsed.data;

    // Verify college exists before attempting to save
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true },
    });
    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    const existing = await prisma.savedCollege.findUnique({
      where: { userId_collegeId: { userId: session.user.id, collegeId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already saved' }, { status: 409 });
    }

    const saved = await prisma.savedCollege.create({
      data: { userId: session.user.id, collegeId },
      include: { college: true },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error('Save college error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
