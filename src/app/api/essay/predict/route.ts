export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assertBodySize, sanitizeText } from '@/lib/security';

const essaySchema = z.object({
  essay: z.string().min(50, 'Essay draft must be at least 50 characters').max(20000),
  collegeSlug: z.string().min(1).max(100),
  major: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Session check — require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // 2. Assert maximum body size (25KB)
    try {
      assertBodySize(body, 25600);
    } catch (sizeErr: any) {
      return NextResponse.json({ error: sizeErr.message }, { status: 413 });
    }

    const parsed = essaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { essay, collegeSlug, major } = parsed.data;

    // 3. Sanitize inputs
    const sanitizedEssay = sanitizeText(essay);
    const sanitizedCollegeSlug = sanitizeText(collegeSlug);
    const sanitizedMajor = sanitizeText(major);

    // Fetch target college name for custom fit comments
    const college = await prisma.college.findUnique({
      where: { slug: sanitizedCollegeSlug },
      select: { name: true },
    });

    const collegeName = college?.name || 'your target college';

    // Simple analytical rule-based engine to generate realistic scores & feedback
    const wordCount = sanitizedEssay.split(/\s+/).filter(Boolean).length;
    
    // 1. Authenticity check: looks for overly generic cliches or high-impact personal voice
    const cliches = ['since I was a child', 'passion for learning', 'always dreamed of', 'world-class education'];
    let clicheCount = 0;
    cliches.forEach(c => {
      if (sanitizedEssay.toLowerCase().includes(c)) clicheCount++;
    });

    // 2. Specificity check: mentions of numbers, projects, or concrete details
    const specificDetails = ['project', 'research', 'built', 'coded', 'launched', 'founded', 'internship', 'lab', 'competition'];
    let specificCount = 0;
    specificDetails.forEach(s => {
      if (sanitizedEssay.toLowerCase().includes(s)) specificCount++;
    });

    // 3. Fit check: mentions of specific college name, location, or classes
    const fitMentions = [sanitizedCollegeSlug.toLowerCase(), collegeName.toLowerCase(), 'campus', 'professor', 'curriculum', 'major'];
    let fitCount = 0;
    fitMentions.forEach(f => {
      if (sanitizedEssay.toLowerCase().includes(f)) fitCount++;
    });

    // Scoring math
    let authenticity = Math.min(98, Math.max(50, 85 - clicheCount * 8 + (wordCount > 300 ? 5 : 0)));
    let specificity = Math.min(98, Math.max(45, 60 + specificCount * 6));
    let fit = Math.min(98, Math.max(40, 50 + fitCount * 12 + (sanitizedEssay.toLowerCase().includes(sanitizedMajor.toLowerCase()) ? 10 : 0)));
    let narrative = Math.min(98, Math.max(50, 70 + (wordCount > 250 && wordCount < 650 ? 12 : -5))); // sweet spot for essays
    let clarity = Math.min(99, Math.max(60, 80 - clicheCount * 4 + (wordCount > 800 ? -8 : 5)));

    const overallScore = Math.round((authenticity + specificity + fit + narrative + clarity) / 5);

    // Dynamic line feedback generation
    const feedbacks = [];

    // Feedback 1: Word Count
    if (wordCount < 150) {
      feedbacks.push({
        type: 'warning',
        category: 'narrative',
        lineText: sanitizedEssay.slice(0, 80) + '...',
        message: 'Your draft is extremely brief. Core college essays are usually between 250-650 words. Expand your personal story and elaborate on your motivations.',
      });
    } else if (wordCount > 700) {
      feedbacks.push({
        type: 'warning',
        category: 'clarity',
        lineText: sanitizedEssay.slice(-100),
        message: `Your essay is quite long (${wordCount} words). Most college prompts have strict 650-word limits. Cut down repetitive phrases and tighten your prose.`,
      });
    }

    // Feedback 2: Intro / Cliché Check
    if (clicheCount > 0) {
      feedbacks.push({
        type: 'warning',
        category: 'authenticity',
        lineText: sanitizedEssay.slice(0, 150) + '...',
        message: `Your draft contains common admission cliches. Avoid generic phrases like "since I was a child." Admissions officers want to hear your unique voice right away.`,
      });
    } else {
      feedbacks.push({
        type: 'success',
        category: 'authenticity',
        lineText: sanitizedEssay.slice(0, 100) + '...',
        message: `Strong, authentic opening hook! It avoids generic cliches and jumps straight into your personal perspective.`,
      });
    }

    // Feedback 3: Fit Check
    if (fitCount === 0) {
      feedbacks.push({
        type: 'critical',
        category: 'fit',
        lineText: sanitizedEssay.slice(Math.floor(sanitizedEssay.length / 2), Math.floor(sanitizedEssay.length / 2) + 120) + '...',
        message: `No specific references to ${collegeName} found. Make sure to reference unique courses, professors, labs, or campus culture to prove why this school is your top choice.`,
      });
    } else {
      feedbacks.push({
        type: 'success',
        category: 'fit',
        lineText: `"...${collegeName}..."`,
        message: `Excellent job explicitly mentioning your interest in ${collegeName}. Ensure you link this interest directly to your intended major (${sanitizedMajor}).`,
      });
    }

    // Feedback 4: Major & Specificity Check
    if (specificCount < 2) {
      feedbacks.push({
        type: 'warning',
        category: 'specificity',
        lineText: sanitizedEssay.slice(-150),
        message: `The conclusion is a bit generic. Add concrete achievements, projects, or lessons you learned from your extracurricular activities to ground your ambitions.`,
      });
    } else {
      feedbacks.push({
        type: 'success',
        category: 'specificity',
        lineText: '"...projects and research..."',
        message: `Your reference to specific hands-on experiences provides solid evidence of your active interest in ${sanitizedMajor}.`,
      });
    }

    return NextResponse.json({
      overallScore,
      dimensions: {
        authenticity,
        specificity,
        fit,
        narrative,
        clarity,
      },
      feedbacks,
    });
  } catch (err) {
    console.error('Essay predictor error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

