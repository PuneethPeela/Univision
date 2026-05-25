export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const { collegeId } = await req.json();
    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId required' }, { status: 400 });
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
