import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const collegesQuerySchema = z.object({
  q: z.string().max(200).optional().default(''),
  type: z.enum(['REACH', 'TARGET', 'SAFETY']).optional(),
  tag: z.string().max(50).optional(),
  state: z.string().max(100).optional(),
  sort: z.enum(['match', 'name', 'rating', 'fees_asc', 'fees_desc']).default('match'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  minFees: z.coerce.number().min(0).optional(),
  maxFees: z.coerce.number().max(200000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paramsObj = {
      q: url.searchParams.get('q') || undefined,
      type: url.searchParams.get('type') || undefined,
      tag: url.searchParams.get('tag') || undefined,
      state: url.searchParams.get('state') || undefined,
      sort: url.searchParams.get('sort') || undefined,
      cursor: url.searchParams.get('cursor') || undefined,
      limit: url.searchParams.get('limit') || undefined,
      minFees: url.searchParams.get('minFees') || undefined,
      maxFees: url.searchParams.get('maxFees') || undefined,
    };

    const parsed = collegesQuerySchema.safeParse(paramsObj);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { q, type, tag, state, sort, cursor, limit, minFees, maxFees } = parsed.data;

    const where: Prisma.CollegeWhereInput = {};

    // Extended full-text search: name, location, state, description, majors, tags
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { state: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { majors: { has: q } },
        { tags: { has: q } },
      ];
    }

    if (type) where.type = type;
    if (tag) where.tags = { has: tag };
    if (state) where.state = { contains: state, mode: 'insensitive' };

    // Fee range filtering
    if (minFees !== undefined || maxFees !== undefined) {
      where.fees = {
        ...(minFees !== undefined ? { gte: minFees } : {}),
        ...(maxFees !== undefined ? { lte: maxFees } : {}),
      };
    }

    const orderBy: Prisma.CollegeOrderByWithRelationInput =
      sort === 'name'
        ? { name: 'asc' }
        : sort === 'rating'
          ? { rating: 'desc' }
          : sort === 'fees_asc'
            ? { fees: 'asc' }
            : sort === 'fees_desc'
              ? { fees: 'desc' }
              : { matchScore: 'desc' };

    const colleges = await prisma.college.findMany({
      where,
      orderBy,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        state: true,
        type: true,
        description: true,
        fees: true,
        rating: true,
        acceptanceRate: true,
        avgAid: true,
        gpa: true,
        sat: true,
        matchScore: true,
        research: true,
        campus: true,
        social: true,
        financial: true,
        innovation: true,
        diversity: true,
        majors: true,
        tags: true,
        imageUrl: true,
        createdAt: true,
      },
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
