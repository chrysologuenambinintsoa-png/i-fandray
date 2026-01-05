import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { newsService } from '@/lib/newsService';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin (you might want to add role checking)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = await request.json();

    // Start the sync process asynchronously
    newsService.syncNewsToDatabase(category).catch(error => {
      console.error('Background news sync failed:', error);
    });

    return NextResponse.json({
      message: 'News synchronization started',
      category: category || 'all'
    });

  } catch (error) {
    console.error('Error starting news sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}