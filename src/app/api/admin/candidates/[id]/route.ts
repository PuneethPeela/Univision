export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const candidateUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  gpa: z.number().min(0).max(4.0).nullable().optional(),
  sat: z.number().min(400).max(1600).nullable().optional(),
  major: z.string().min(1).nullable().optional(),
  // For updating a saved college status
  savedCollegeId: z.string().optional(),
  status: z.string().optional(),
});

async function getRole(email: string | null | undefined): Promise<string> {
  if (!email) return 'USER';
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  return user?.role || 'USER';
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = await getRole(session.user.email);
    if (currentRole !== 'ADMIN' && currentRole !== 'SUB_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin or Sub-Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing candidate ID' }, { status: 400 });
    }

    const candidate = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        gpa: true,
        sat: true,
        major: true,
        role: true,
        createdAt: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Fetch candidate's saved colleges with college details
    const savedColleges = await prisma.savedCollege.findMany({
      where: { userId: id },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            fees: true,
            rating: true,
            acceptanceRate: true,
            placements: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch candidate's saved comparisons
    const savedComparisons = await prisma.savedComparison.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      candidate,
      savedColleges,
      savedComparisons,
    });
  } catch (err) {
    console.error('Fetch candidate detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = await getRole(session.user.email);
    if (currentRole !== 'ADMIN' && currentRole !== 'SUB_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin or Sub-Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing candidate ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = candidateUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, gpa, sat, major, savedCollegeId, status } = parsed.data;

    // Handle application tracker status update
    if (savedCollegeId && status) {
      const savedCollege = await prisma.savedCollege.findUnique({
        where: { id: savedCollegeId },
      });

      if (!savedCollege || savedCollege.userId !== id) {
        return NextResponse.json({ error: 'Saved college record not found or unauthorized' }, { status: 404 });
      }

      const updatedSaved = await prisma.savedCollege.update({
        where: { id: savedCollegeId },
        data: { status },
      });

      return NextResponse.json({ success: true, updatedSaved });
    }

    // Handle candidate academic profile update
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (gpa !== undefined) updateData.gpa = gpa;
    if (sat !== undefined) updateData.sat = sat;
    if (major !== undefined) updateData.major = major;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        gpa: true,
        sat: true,
        major: true,
      },
    });

    return NextResponse.json({ success: true, candidate: updatedUser });
  } catch (err) {
    console.error('Update candidate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
