import { prisma } from './db';

/**
 * Resolves a user's role from the database.
 */
export async function resolveRole(email: string | null | undefined): Promise<'USER' | 'SUB_ADMIN' | 'ADMIN'> {
  if (!email) return 'USER';
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { role: true },
  });
  const role = user?.role;
  if (role === 'ADMIN' || role === 'SUB_ADMIN' || role === 'USER') {
    return role;
  }
  return 'USER';
}

/**
 * Strips HTML tags and common exploit vectors (like inline javascript: URIs)
 * to sanitize user-supplied text inputs.
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Block javascript URIs
    .trim();
}

/**
 * Validates password strength: >= 8 characters, at least one letter and one number.
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain at least one letter and one number.' };
  }
  return { valid: true };
}

/**
 * Asserts the request body JSON size does not exceed the maximum allowed bytes.
 */
export function assertBodySize(json: unknown, maxBytes: number): void {
  const size = Buffer.byteLength(JSON.stringify(json));
  if (size > maxBytes) {
    throw new Error(`Payload size of ${size} bytes exceeded limit of ${maxBytes} bytes.`);
  }
}
