import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, externalUrl, placement, sponsorName, campaignStart, campaignEnd } = body;

    if (!title || !content || !externalUrl || !placement || !sponsorName || !campaignStart || !campaignEnd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['feed', 'story', 'group'].includes(placement)) {
      return NextResponse.json({ error: 'Invalid placement' }, { status: 400 });
    }

    // TODO: SponsoredContent model not in schema
    // const sponsoredContent = await prisma.sponsoredContent.create({
    //   data: {
    //     title,
    //     content,
    //     image,
    //     externalUrl,
    //     placement,
    //     sponsorName,
    //     campaignStart: new Date(campaignStart),
    //     campaignEnd: new Date(campaignEnd),
    //   },
    // });

    return NextResponse.json({ message: 'Sponsored content creation not implemented' });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');

    if (!placement || !['feed', 'story', 'group'].includes(placement)) {
      return NextResponse.json({ error: 'Invalid or missing placement' }, { status: 400 });
    }

    // TODO: SponsoredContent model not in schema
    // const sponsoredContents = await prisma.sponsoredContent.findMany({
    //   where: {
    //     placement,
    //     isActive: true,
    //     campaignStart: { lte: now },
    //     campaignEnd: { gte: now },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json([]);
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
