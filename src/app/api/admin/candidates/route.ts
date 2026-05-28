export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { resolveRole } from '@/lib/security';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = await resolveRole(session.user.email);
    if (currentRole !== 'ADMIN' && currentRole !== 'SUB_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin or Sub-Admin access required' }, { status: 403 });
    }

    // Fetch all users who are not super-admins (role !== 'ADMIN') so they can be inspected
    const candidates = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        gpa: true,
        sat: true,
        major: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ candidates });
  } catch (err) {
    console.error('Fetch candidates error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

