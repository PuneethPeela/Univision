import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'match';
    const cursor = searchParams.get('cursor');
    const rawLimit = parseInt(searchParams.get('limit') || '12', 10);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 12 : rawLimit), 50); // Clamp 1-50

    const where: Prisma.CollegeWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { state: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (type) {
      const upperType = type.toUpperCase();
      if (['REACH', 'TARGET', 'SAFETY'].includes(upperType)) {
        where.type = upperType as Prisma.EnumCollegeTypeFilter;
      }
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const orderBy: Prisma.CollegeOrderByWithRelationInput =
      sort === 'name'
        ? { name: 'asc' }
        : sort === 'rating'
          ? { rating: 'desc' }
          : { matchScore: 'desc' };

    const colleges = await prisma.college.findMany({
      where,
      orderBy,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    let nextCursor: string | null = null;
    if (colleges.length > limit) {
      const last = colleges.pop();
      nextCursor = last!.id;
    }

    return NextResponse.json({ colleges, nextCursor });
  } catch (err) {
    console.error('Colleges list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
