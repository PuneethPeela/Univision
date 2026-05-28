export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { resolveRole, validatePasswordStrength, sanitizeText } from '@/lib/security';

const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email').max(150).optional(),
  password: z.string().optional().nullable(),
  gpa: z.number().min(0).max(4.0).nullable().optional(),
  sat: z.number().min(400).max(1600).nullable().optional(),
  major: z.string().min(1).max(100).nullable().optional(),
  role: z.enum(['USER', 'SUB_ADMIN', 'ADMIN']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = await resolveRole(session.user.email);
    if (currentRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, gpa, sat, major, role } = parsed.data;

    // Enforce password strength if password is being modified
    if (password) {
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.valid) {
        return NextResponse.json(
          { error: { password: [passwordCheck.message || 'Weak password'] } },
          { status: 400 }
        );
      }
    }

    // Construct fully type-safe update payload without using 'any'
    const updateData: Parameters<typeof prisma.user.update>[0]['data'] = {};
    if (name !== undefined) updateData.name = sanitizeText(name);
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (password !== undefined) {
      if (password === null) {
        updateData.passwordHash = null;
      } else {
        updateData.passwordHash = await bcrypt.hash(password, 12);
      }
    }
    if (gpa !== undefined) updateData.gpa = gpa;
    if (sat !== undefined) updateData.sat = sat;
    if (major !== undefined) updateData.major = major !== null ? sanitizeText(major) : null;
    if (role !== undefined) updateData.role = role;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = await resolveRole(session.user.email);
    if (currentRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 });
    }

    const { id } = await params;

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

    // Fetch discussions created by target user
    const userDiscussions = await prisma.discussion.findMany({
      where: { userId: id },
      select: { id: true },
    });
    const userDiscussionIds = userDiscussions.map((d) => d.id);

    // Secure database transactional manual cascade delete with child upvotes and answers cleanups
    await prisma.$transaction(async (tx) => {
      // 1. Delete all answers belonging to discussions created by this user
      if (userDiscussionIds.length > 0) {
        await tx.answer.deleteMany({
          where: { discussionId: { in: userDiscussionIds } },
        });
      }

      // 2. Clean up discussion upvotes written by this user or belonging to their discussions
      await tx.userDiscussionUpvote.deleteMany({
        where: {
          OR: [
            { userId: id },
            { discussionId: { in: userDiscussionIds } },
          ],
        },
      });

      // 3. Delete all other dependent records
      await tx.savedCollege.deleteMany({ where: { userId: id } });
      await tx.savedComparison.deleteMany({ where: { userId: id } });
      await tx.review.deleteMany({ where: { userId: id } });
      await tx.answer.deleteMany({ where: { userId: id } }); // answers written by this user on other threads
      await tx.discussion.deleteMany({ where: { userId: id } });
      
      // 4. Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ message: 'User and all associated records deleted successfully' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

