export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const predictSchema = z.object({
  exam: z.enum(['SAT', 'ACT', 'JEE_MAIN', 'JEE_ADVANCED', 'GRE']),
  score: z.number().min(0),
  gpa: z.number().min(0).max(4.0),
  major: z.string().min(1).max(100),
}).superRefine((val, ctx) => {
  if (val.exam === 'SAT' && val.score > 1600) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['score'], message: 'SAT score cannot exceed 1600' });
  }
  if (val.exam === 'ACT' && val.score > 36) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['score'], message: 'ACT score cannot exceed 36' });
  }
  if (val.exam === 'GRE' && val.score > 340) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['score'], message: 'GRE score cannot exceed 340' });
  }
  if (val.exam === 'JEE_MAIN' && val.score > 300) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['score'], message: 'JEE Main score cannot exceed 300' });
  }
  if (val.exam === 'JEE_ADVANCED' && val.score > 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['score'], message: 'JEE Advanced score cannot exceed 100' });
  }
});

function actToSat(act: number): number {
  return Math.round(act * 40 - 80);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = predictSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { exam, score, gpa, major } = parsed.data;

    // Normalise score to SAT scale
    let satScore = score;
    if (exam === 'ACT') satScore = actToSat(score);
    if (exam === 'GRE') satScore = Math.round((score / 340) * 1600);
    if (exam === 'JEE_MAIN') satScore = Math.round(1600 - (score / 300) * 400);
    if (exam === 'JEE_ADVANCED') satScore = Math.round(1600 - (score / 100) * 200);

    // Lean select — only the 11 fields the algorithm needs, not all 30+ DB columns
    const colleges = await prisma.college.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        type: true,
        sat: true,
        gpa: true,
        majors: true,
        acceptanceRate: true,
        fees: true,
        rating: true,
      },
    });

    const results = colleges
      .map((c) => {
        const satDist = c.sat ? Math.abs(satScore - c.sat) / 1600 : 0.5;
        const gpaDist = c.gpa ? Math.abs(gpa - c.gpa) / 4.0 : 0.5;
        const majorBonus = c.majors.some((m) =>
          m.toLowerCase().includes(major.toLowerCase())
        )
          ? 0.15
          : 0;

        const rawScore = 1 - 0.5 * satDist - 0.3 * gpaDist + majorBonus;
        const matchPct = Math.min(99, Math.max(10, Math.round(rawScore * 100)));

        let tier: 'REACH' | 'TARGET' | 'SAFETY';
        if (satDist > 0.12 || gpaDist > 0.2) tier = 'REACH';
        else if (satDist < 0.05 && gpaDist < 0.1) tier = 'SAFETY';
        else tier = 'TARGET';

        let reason: string;
        if (tier === 'REACH')
          reason = `Your profile is competitive but this college's median stats are higher.`;
        else if (tier === 'SAFETY')
          reason = `Your scores exceed this college's median—strong safety pick.`;
        else
          reason = `Your profile aligns well with this college's admissions range.`;

        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          location: c.location,
          matchPct,
          tier,
          acceptanceRate: c.acceptanceRate,
          reason,
          fees: c.fees,
          rating: c.rating,
        };
      })
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 15);

    const reach = results.filter((r) => r.tier === 'REACH');
    const target = results.filter((r) => r.tier === 'TARGET');
    const safety = results.filter((r) => r.tier === 'SAFETY');

    return NextResponse.json({ reach, target, safety });
  } catch (err) {
    console.error('Predict error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
