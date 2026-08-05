import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const problemId = searchParams.get('problemId');

  if (!problemId) {
    return NextResponse.json({ error: 'problemId is required' }, { status: 400 });
  }

  try {
    const solutions = await prisma.solutionPost.findMany({
      where: { problemId: Number(problemId) },
      include: {
        user: {
          select: { name: true, image: true }
        },
        submission: {
          select: { code: true, language: true, executionTime: true, memoryKb: true }
        },
        _count: {
          select: { upvotes: true }
        }
      },
      orderBy: {
        upvotes: {
          _count: 'desc'
        }
      }
    });

    return NextResponse.json({ solutions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  try {
    const { problemId, submissionId, title, description } = await request.json();

    if (!problemId || !submissionId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if submission exists and belongs to user and is Accepted
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId }
    });

    if (!submission || submission.userId !== userId || submission.status !== 'Accepted') {
      return NextResponse.json({ error: 'Invalid or unauthorized submission' }, { status: 400 });
    }

    // Check if already posted
    const existing = await prisma.solutionPost.findUnique({
      where: { submissionId }
    });

    if (existing) {
      return NextResponse.json({ error: 'Solution already posted for this submission' }, { status: 400 });
    }

    const post = await prisma.solutionPost.create({
      data: {
        title,
        description,
        problemId: Number(problemId),
        submissionId,
        userId
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create solution post' }, { status: 500 });
  }
}
