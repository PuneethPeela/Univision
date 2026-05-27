export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const comparisonSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  collegeIds: z.array(z.string()).min(2, 'At least 2 colleges are required').max(3, 'At most 3 colleges are allowed'),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const saved = await prisma.savedComparison.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ saved });
  } catch (err) {
    console.error('Fetch comparisons error:', err);
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
    const parsed = comparisonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, collegeIds } = parsed.data;

    const created = await prisma.savedComparison.create({
      data: {
        userId: session.user.id,
        name,
        collegeIds,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('Create comparison error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing comparison ID parameter' }, { status: 400 });
    }

    const existing = await prisma.savedComparison.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.savedComparison.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comparison removed successfully' });
  } catch (err) {
    console.error('Delete comparison error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
