export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const userCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gpa: z.number().min(0).max(4.0).nullable().optional(),
  sat: z.number().min(400).max(1600).nullable().optional(),
  major: z.string().min(1).max(100).nullable().optional(),
  role: z.enum(['USER', 'SUB_ADMIN', 'ADMIN']).optional().default('USER'),
});

async function getRole(email: string | null | undefined): Promise<string> {
  if (!email) return 'USER';
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  return user?.role || 'USER';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = await getRole(session.user.email);
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Admin fetch users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = await getRole(session.user.email);
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, gpa, sat, major, role: targetRole } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        gpa: gpa ?? 3.8,
        sat: sat ?? 1450,
        major: major ?? 'Computer Science',
        role: targetRole,
      },
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

    // Auto-seed demo college tracking for the new user for immediate guided onboarding
    const mit = await prisma.college.findUnique({ where: { slug: 'mit' } });
    const stanford = await prisma.college.findUnique({ where: { slug: 'stanford' } });
    const caltech = await prisma.college.findUnique({ where: { slug: 'caltech' } });

    if (mit && stanford && caltech) {
      await prisma.savedCollege.createMany({
        data: [
          { userId: user.id, collegeId: mit.id, status: 'RESEARCHING' },
          { userId: user.id, collegeId: stanford.id, status: 'IN_PROGRESS' },
          { userId: user.id, collegeId: caltech.id, status: 'SUBMITTED' },
        ],
      });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error('Admin create user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
