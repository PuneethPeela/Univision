export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');
    if (!ids) {
      return NextResponse.json({ error: 'ids query param required' }, { status: 400 });
    }

    const slugs = ids.split(',').map((s) => s.trim()).filter(Boolean);
    if (slugs.length < 2 || slugs.length > 3) {
      return NextResponse.json({ error: 'Provide 2-3 college slugs' }, { status: 400 });
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
