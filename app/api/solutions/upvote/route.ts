import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { solutionPostId } = await request.json();

    if (!solutionPostId) {
      return NextResponse.json({ error: 'solutionPostId is required' }, { status: 400 });
    }

    // Toggle upvote
    const existing = await prisma.upvote.findUnique({
      where: {
        userId_solutionPostId: {
          userId,
          solutionPostId
        }
      }
    });

    if (existing) {
      // Remove upvote
      await prisma.upvote.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add upvote
      await prisma.upvote.create({
        data: {
          userId,
          solutionPostId
        }
      });
      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process upvote' }, { status: 500 });
  }
}
