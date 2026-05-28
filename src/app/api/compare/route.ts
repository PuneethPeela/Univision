export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // 1. Session check — require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');
    if (!ids) {
      return NextResponse.json({ error: 'ids query param required' }, { status: 400 });
    }

    const slugs = ids.split(',').map((s) => s.trim()).filter(Boolean);
    if (slugs.length < 2 || slugs.length > 3) {
      return NextResponse.json({ error: 'Provide 2-3 college slugs' }, { status: 400 });
    }

    // 2. Validate college slugs for security (prevent injection, only permit standard alphanumeric + hyphen slugs)
    const slugRegex = /^[a-z0-9-]+$/i;
    const allSlugsValid = slugs.every((s) => slugRegex.test(s));
    if (!allSlugsValid) {
      return NextResponse.json({ error: 'Invalid characters in college slugs' }, { status: 400 });
    }

    const colleges = await prisma.college.findMany({
      where: { slug: { in: slugs } },
    });

    return NextResponse.json({ colleges });
  } catch (err) {
    console.error('Compare error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

