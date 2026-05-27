export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
  previousPassword: z.string().min(1, 'Previous password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, previousPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'User account not found or cannot be reset' },
        { status: 404 }
      );
    }

    // Validate the previous password against the hash
    const isValid = await bcrypt.compare(previousPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect previous password. Authentication failed.' },
        { status: 401 }
      );
    }

    // Update with new password hash
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json(
      { message: 'Password successfully rotated and updated!' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Password rotation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
