export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['RESEARCHING', 'IN_PROGRESS', 'SUBMITTED', 'ACCEPTED', 'REJECTED']),
});

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

    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const saved = await prisma.savedCollege.findUnique({
      where: { id },
    });

    if (!saved || saved.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.savedCollege.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { college: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Update application status error:', err);
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
    const saved = await prisma.savedCollege.findUnique({
      where: { id },
    });

    if (!saved || saved.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.savedCollege.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unsave error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
