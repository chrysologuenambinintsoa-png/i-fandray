// app/api/encryption/keys/route.ts - Gestion des clés de chiffrement
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer la clé publique de l'utilisateur
    const encryptionKey = await prisma.encryptionKey.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        keyVersion: 'desc',
      },
    });

    if (!encryptionKey) {
      return NextResponse.json({ error: 'Aucune clé trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      publicKey: encryptionKey.publicKey,
      keyVersion: encryptionKey.keyVersion,
    });
  } catch (error) {
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { publicKey } = await request.json();

    if (!publicKey || typeof publicKey !== 'string') {
      return NextResponse.json({ error: 'Clé publique requise' }, { status: 400 });
    }

    // Désactiver les anciennes clés
    await prisma.encryptionKey.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });

    // Créer la nouvelle clé
    const newKey = await prisma.encryptionKey.create({
      data: {
        userId: session.user.id,
        publicKey,
        keyVersion: 1, // Incrémenter si nécessaire
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      keyId: newKey.id,
      keyVersion: newKey.keyVersion,
    });
  } catch (error) {
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { publicKey } = await request.json();

    if (!publicKey || typeof publicKey !== 'string') {
      return NextResponse.json({ error: 'Clé publique requise' }, { status: 400 });
    }

    // Récupérer la version actuelle
    const currentKey = await prisma.encryptionKey.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        keyVersion: 'desc',
      },
    });

    const nextVersion = (currentKey?.keyVersion ?? 0) + 1;

    // Désactiver les anciennes clés
    await prisma.encryptionKey.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });

    // Créer la nouvelle clé
    const newKey = await prisma.encryptionKey.create({
      data: {
        userId: session.user.id,
        publicKey,
        keyVersion: nextVersion,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      keyId: newKey.id,
      keyVersion: newKey.keyVersion,
    });
  } catch (error) {
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
