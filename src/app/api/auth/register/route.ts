export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        gpa: 3.8,
        sat: 1450,
        major: 'Computer Science',
      },
    });

    // Auto-seed demo college tracking for a new user so they have a guided onboarding experience
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

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
