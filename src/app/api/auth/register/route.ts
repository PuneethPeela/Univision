export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validatePasswordStrength, sanitizeText, assertBodySize } from '@/lib/security';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email').max(150),
  password: z.string(),
});

export async function POST(req: Request) {
  // Enforce small timing delay (200ms) to mitigate timing attacks
  const start = Date.now();
  const delay = async () => {
    const elapsed = Date.now() - start;
    if (elapsed < 200) {
      await new Promise((resolve) => setTimeout(resolve, 200 - elapsed));
    }
  };

  try {
    const body = await req.json();
    
    // Assert maximum payload body size (5KB)
    try {
      assertBodySize(body, 5120);
    } catch (sizeErr: any) {
      await delay();
      return NextResponse.json({ error: sizeErr.message }, { status: 413 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      await delay();
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      await delay();
      return NextResponse.json(
        { error: { password: [passwordCheck.message || 'Weak password'] } },
        { status: 400 }
      );
    }

    // Sanitize and normalize inputs
    const sanitizedName = sanitizeText(name);
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      await delay();
      // Use 409 status but generic wording, or return success mockup to prevent email enumeration,
      // but returning 409 Conflict is standard as long as we add the timing delay to prevent timing verification.
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: normalizedEmail,
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

    await delay();
    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    await delay();
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

