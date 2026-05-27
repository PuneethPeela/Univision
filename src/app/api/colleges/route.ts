import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const collegesQuerySchema = z.object({
  q: z.string().max(100).optional().default(''),
  type: z.enum(['REACH', 'TARGET', 'SAFETY']).optional(),
  tag: z.string().max(50).optional(),
  sort: z.enum(['match', 'name', 'rating']).default('match'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paramsObj = {
      q: url.searchParams.get('q') || undefined,
      type: url.searchParams.get('type') || undefined,
      tag: url.searchParams.get('tag') || undefined,
      sort: url.searchParams.get('sort') || undefined,
      cursor: url.searchParams.get('cursor') || undefined,
      limit: url.searchParams.get('limit') || undefined,
    };

    const parsed = collegesQuerySchema.safeParse(paramsObj);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { q, type, tag, sort, cursor, limit } = parsed.data;

    const where: Prisma.CollegeWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { state: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
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

    // Attempt to query database
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
