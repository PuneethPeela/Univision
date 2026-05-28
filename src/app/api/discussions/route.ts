export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const createSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  body: z.string().min(10, 'Body must be at least 10 characters').max(5000),
  collegeId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

const discussionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['recent', 'popular', 'unanswered']).default('recent'),
  q: z.string().max(100).optional().default(''),
  cursor: z.string().optional(),
  collegeId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paramsObj = {
      limit: url.searchParams.get('limit') || undefined,
      sort: url.searchParams.get('sort') || undefined,
      q: url.searchParams.get('q') || undefined,
      cursor: url.searchParams.get('cursor') || undefined,
      collegeId: url.searchParams.get('collegeId') || undefined,
    };

    const parsed = discussionsQuerySchema.safeParse(paramsObj);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { limit, sort, q, cursor, collegeId } = parsed.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { body: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
    }

    if (collegeId) {
      where.collegeId = collegeId;
    }

    // For "unanswered", add the filter to the query
    if (sort === 'unanswered') {
      where.answers = { none: {} };
    }

    const orderBy =
      sort === 'popular'
        ? { upvotes: 'desc' as const }
        : { createdAt: 'desc' as const };

    // Cursor-based pagination — efficient on large tables, no skip degradation
    const discussions = await prisma.discussion.findMany({
      where,
      orderBy,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { answers: true } },
      },
    });

    let nextCursor: string | null = null;
    if (discussions.length > limit) {
      const last = discussions.pop();
      nextCursor = last!.id;
    }

    // Total count for the current filter (for display purposes)
    const total = await prisma.discussion.count({ where });

    return NextResponse.json({ discussions, nextCursor, total });
  } catch (err) {
    console.error('Discussions list error:', err);
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
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Validate collegeId if provided
    if (parsed.data.collegeId) {
      const college = await prisma.college.findUnique({
        where: { id: parsed.data.collegeId },
        select: { id: true },
      });
      if (!college) {
        return NextResponse.json({ error: 'College not found' }, { status: 404 });
      }
    }

    const discussion = await prisma.discussion.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        userId: session.user.id,
        collegeId: parsed.data.collegeId || null,
        tags: parsed.data.tags || [],
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (err) {
    console.error('Discussion create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
