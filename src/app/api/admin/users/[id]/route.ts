export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
  gpa: z.number().min(0).max(4.0).nullable().optional(),
  sat: z.number().min(400).max(1600).nullable().optional(),
  major: z.string().min(1).max(100).nullable().optional(),
  role: z.enum(['USER', 'SUB_ADMIN', 'ADMIN']).optional(),
});

async function getRole(email: string | null | undefined): Promise<string> {
  if (!email) return 'USER';
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  return user?.role || 'USER';
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = await getRole(session.user.email);
    if (currentRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data: any = { ...parsed.data };
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    } else {
      delete data.password;
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
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

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Admin update user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = await getRole(session.user.email);
    if (currentRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Do not allow deleting yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete the currently logged in admin account' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Secure database transactional manual cascade delete
    await prisma.$transaction([
      prisma.savedCollege.deleteMany({ where: { userId: id } }),
      prisma.savedComparison.deleteMany({ where: { userId: id } }),
      prisma.review.deleteMany({ where: { userId: id } }),
      prisma.answer.deleteMany({ where: { userId: id } }),
      prisma.discussion.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'User and all associated records deleted successfully' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
