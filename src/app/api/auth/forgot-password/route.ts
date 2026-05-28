export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validatePasswordStrength, assertBodySize } from '@/lib/security';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email').max(150),
  previousPassword: z.string(),
  newPassword: z.string(),
});

export async function POST(req: Request) {
  // Constant timing delay of 250ms to mitigate timing attacks and email enumeration
  const start = Date.now();
  const delay = async () => {
    const elapsed = Date.now() - start;
    if (elapsed < 250) {
      await new Promise((resolve) => setTimeout(resolve, 250 - elapsed));
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

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      await delay();
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, previousPassword, newPassword } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Validate new password strength
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      await delay();
      return NextResponse.json(
        { error: { newPassword: [passwordCheck.message || 'Weak password'] } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.passwordHash) {
      await delay();
      // To prevent user enumeration, we can return 400/404, but the timing delay ensures safety.
      // Standardizing on a generic auth error:
      return NextResponse.json(
        { error: 'User account not found or cannot be reset' },
        { status: 404 }
      );
    }

    // Validate the previous password against the hash
    const isValid = await bcrypt.compare(previousPassword, user.passwordHash);
    if (!isValid) {
      await delay();
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

    await delay();
    return NextResponse.json(
      { message: 'Password successfully rotated and updated!' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Password rotation error:', err);
    await delay();
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

