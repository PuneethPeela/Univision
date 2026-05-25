export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const essaySchema = z.object({
  essay: z.string().min(50, 'Essay draft must be at least 50 characters').max(20000),
  collegeSlug: z.string().min(1),
  major: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = essaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { essay, collegeSlug, major } = parsed.data;

    // Fetch target college name for custom fit comments
    const college = await prisma.college.findUnique({
      where: { slug: collegeSlug },
      select: { name: true },
    });

    const collegeName = college?.name || 'your target college';

    // Simple analytical rule-based engine to generate realistic scores & feedback
    const wordCount = essay.split(/\s+/).filter(Boolean).length;
    
    // 1. Authenticity check: looks for overly generic cliches or high-impact personal voice
    const cliches = ['since I was a child', 'passion for learning', 'always dreamed of', 'world-class education'];
    let clicheCount = 0;
    cliches.forEach(c => {
      if (essay.toLowerCase().includes(c)) clicheCount++;
    });

    // 2. Specificity check: mentions of numbers, projects, or concrete details
    const specificDetails = ['project', 'research', 'built', 'coded', 'launched', 'founded', 'internship', 'lab', 'competition'];
    let specificCount = 0;
    specificDetails.forEach(s => {
      if (essay.toLowerCase().includes(s)) specificCount++;
    });

    // 3. Fit check: mentions of specific college name, location, or classes
    const fitMentions = [collegeSlug.toLowerCase(), collegeName.toLowerCase(), 'campus', 'professor', 'curriculum', 'major'];
    let fitCount = 0;
    fitMentions.forEach(f => {
      if (essay.toLowerCase().includes(f)) fitCount++;
    });

    // Scoring math
    let authenticity = Math.min(98, Math.max(50, 85 - clicheCount * 8 + (wordCount > 300 ? 5 : 0)));
    let specificity = Math.min(98, Math.max(45, 60 + specificCount * 6));
    let fit = Math.min(98, Math.max(40, 50 + fitCount * 12 + (essay.toLowerCase().includes(major.toLowerCase()) ? 10 : 0)));
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
        lineText: essay.slice(0, 80) + '...',
        message: 'Your draft is extremely brief. Core college essays are usually between 250-650 words. Expand your personal story and elaborate on your motivations.',
      });
    } else if (wordCount > 700) {
      feedbacks.push({
        type: 'warning',
        category: 'clarity',
        lineText: essay.slice(-100),
        message: `Your essay is quite long (${wordCount} words). Most college prompts have strict 650-word limits. Cut down repetitive phrases and tighten your prose.`,
      });
    }

    // Feedback 2: Intro / Cliché Check
    if (clicheCount > 0) {
      feedbacks.push({
        type: 'warning',
        category: 'authenticity',
        lineText: essay.slice(0, 150) + '...',
        message: `Your draft contains common admission cliches. Avoid generic phrases like "since I was a child." Admissions officers want to hear your unique voice right away.`,
      });
    } else {
      feedbacks.push({
        type: 'success',
        category: 'authenticity',
        lineText: essay.slice(0, 100) + '...',
        message: `Strong, authentic opening hook! It avoids generic cliches and jumps straight into your personal perspective.`,
      });
    }

    // Feedback 3: Fit Check
    if (fitCount === 0) {
      feedbacks.push({
        type: 'critical',
        category: 'fit',
        lineText: essay.slice(Math.floor(essay.length / 2), Math.floor(essay.length / 2) + 120) + '...',
        message: `No specific references to ${collegeName} found. Make sure to reference unique courses, professors, labs, or campus culture to prove why this school is your top choice.`,
      });
    } else {
      feedbacks.push({
        type: 'success',
        category: 'fit',
        lineText: `"...${collegeName}..."`,
        message: `Excellent job explicitly mentioning your interest in ${collegeName}. Ensure you link this interest directly to your intended major (${major}).`,
      });
    }

    // Feedback 4: Major & Specificity Check
    if (specificCount < 2) {
      feedbacks.push({
        type: 'warning',
        category: 'specificity',
        lineText: essay.slice(-150),
        message: `The conclusion is a bit generic. Add concrete achievements, projects, or lessons you learned from your extracurricular activities to ground your ambitions.`,
      });
    } else {
      feedbacks.push({
        type: 'success',
        category: 'specificity',
        lineText: '"...projects and research..."',
        message: `Your reference to specific hands-on experiences provides solid evidence of your active interest in ${major}.`,
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
