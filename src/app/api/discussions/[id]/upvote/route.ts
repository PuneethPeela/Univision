import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check if discussion exists
    const existingDiscussion = await prisma.discussion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existingDiscussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Check if user has already upvoted this discussion
    const existingUpvote = await prisma.userDiscussionUpvote.findUnique({
      where: {
        userId_discussionId: {
          userId,
          discussionId: id,
        },
      },
    });

    let hasUpvoted = false;

    if (existingUpvote) {
      // Toggle OFF: Decrement upvote and remove the relation record in an atomic transaction
      await prisma.$transaction([
        prisma.userDiscussionUpvote.delete({
          where: {
            userId_discussionId: {
              userId,
              discussionId: id,
            },
          },
        }),
        prisma.discussion.update({
          where: { id },
          data: { upvotes: { decrement: 1 } },
        }),
      ]);
      hasUpvoted = false;
    } else {
      // Toggle ON: Increment upvote and create the relation record in an atomic transaction
      await prisma.$transaction([
        prisma.userDiscussionUpvote.create({
          data: {
            userId,
            discussionId: id,
          },
        }),
        prisma.discussion.update({
          where: { id },
          data: { upvotes: { increment: 1 } },
        }),
      ]);
      hasUpvoted = true;
    }

    // Retrieve final upvotes count safely
    const updated = await prisma.discussion.findUnique({
      where: { id },
      select: { upvotes: true },
    });

    return NextResponse.json({
      upvotes: updated?.upvotes || 0,
      hasUpvoted,
    });
  } catch (err) {
    console.error('Upvote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

