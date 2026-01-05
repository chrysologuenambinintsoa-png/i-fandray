// app/api/encryption/keys/[userId]/route.ts - Récupération des clés publiques
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe et est accessible
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer la clé publique active
    const encryptionKey = await prisma.encryptionKey.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        keyVersion: 'desc',
      },
    });

    if (!encryptionKey) {
      return NextResponse.json({ error: 'Aucune clé de chiffrement trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      userId,
      publicKey: encryptionKey.publicKey,
      keyVersion: encryptionKey.keyVersion,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé publique:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}