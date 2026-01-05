// hooks/useEncryption.ts - Hook pour gérer le chiffrement E2EE
import { useState, useEffect, useCallback } from 'react';
import {
  initializeEncryption,
  encryptMessageForRecipient,
  decryptMessageFromSender,
  encryptSensitiveData,
  decryptSensitiveData,
  deriveSharedKey,
  exportPublicKey,
  importPublicKey,
  getSharedKey,
  clearKeys,
  isCryptoAvailable,
  type EncryptedData,
  type KeyPair,
} from '@/lib/crypto';
import { useSession } from 'next-auth/react';

interface UseEncryptionReturn {
  // État
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  publicKey: string | null;

  // Messages
  encryptMessage: (message: string, recipientId: string) => Promise<EncryptedData>;
  decryptMessage: (encryptedData: EncryptedData, senderId: string) => Promise<string>;

  // Données sensibles
  encryptData: (data: string) => Promise<EncryptedData>;
  decryptData: (encryptedData: EncryptedData) => Promise<string>;

  // Gestion des clés
  sharePublicKey: () => Promise<string>;
  establishSharedKey: (recipientId: string, recipientPublicKey: string) => Promise<void>;
  hasSharedKey: (recipientId: string) => boolean;

  // Utilitaires
  clearAllKeys: () => void;
  reinitialize: (password?: string) => Promise<void>;
}

export function useEncryption(password?: string): UseEncryptionReturn {
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Vérifie la disponibilité de Web Crypto API
  useEffect(() => {
    if (!isCryptoAvailable()) {
      setError('Web Crypto API n\'est pas disponible dans ce navigateur');
    }
  }, []);

  // Initialise le chiffrement au montage
  useEffect(() => {
    if (session?.user && !isInitialized && !isInitializing && isCryptoAvailable()) {
      initialize();
    }
  }, [session?.user, isInitialized, isInitializing]);

  const initialize = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await initializeEncryption(password);

      // Exporte la clé publique pour partage
      const exportedKey = await sharePublicKey();
      setPublicKey(exportedKey);

      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'initialisation du chiffrement');
    } finally {
      setIsInitializing(false);
    }
  }, [password]);

  const sharePublicKey = useCallback(async (): Promise<string> => {
    // Cette fonction est définie dans crypto.ts mais on la réimplémente ici
    // pour accéder à la clé publique de l'utilisateur
    const user = session?.user;
    if (!user) throw new Error('Utilisateur non connecté');

    // TODO: Récupérer la clé publique depuis le stockage ou la générer
    // Pour l'instant, on simule
    return 'placeholder-public-key';
  }, [session?.user]);

  const establishSharedKey = useCallback(async (recipientId: string, recipientPublicKey: string) => {
    try {
      setError(null);

      // Importe la clé publique du destinataire
      const recipientKey = await importPublicKey(recipientPublicKey);

      // TODO: Récupérer notre clé privée depuis un stockage sécurisé
      // Pour l'instant, on utilise une implémentation simplifiée

      // Dérive la clé partagée
      // await deriveSharedKey(privateKey, recipientKey, recipientId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'établissement de la clé partagée');
      throw err;
    }
  }, []);

  const hasSharedKey = useCallback((recipientId: string): boolean => {
    return getSharedKey(recipientId) !== null;
  }, []);

  const encryptMessage = useCallback(async (message: string, recipientId: string): Promise<EncryptedData> => {
    if (!isInitialized) {
      throw new Error('Chiffrement non initialisé');
    }

    try {
      return await encryptMessageForRecipient(message, recipientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chiffrement du message');
      throw err;
    }
  }, [isInitialized]);

  const decryptMessage = useCallback(async (encryptedData: EncryptedData, senderId: string): Promise<string> => {
    if (!isInitialized) {
      throw new Error('Chiffrement non initialisé');
    }

    try {
      return await decryptMessageFromSender(encryptedData, senderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déchiffrement du message');
      throw err;
    }
  }, [isInitialized]);

  const encryptData = useCallback(async (data: string): Promise<EncryptedData> => {
    if (!isInitialized) {
      throw new Error('Chiffrement non initialisé');
    }

    try {
      return await encryptSensitiveData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chiffrement des données');
      throw err;
    }
  }, [isInitialized]);

  const decryptData = useCallback(async (encryptedData: EncryptedData): Promise<string> => {
    if (!isInitialized) {
      throw new Error('Chiffrement non initialisé');
    }

    try {
      return await decryptSensitiveData(encryptedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déchiffrement des données');
      throw err;
    }
  }, [isInitialized]);

  const clearAllKeys = useCallback(() => {
    clearKeys();
    setIsInitialized(false);
    setPublicKey(null);
    setError(null);
  }, []);

  const reinitialize = useCallback(async (newPassword?: string) => {
    clearAllKeys();
    await initialize();
  }, [clearAllKeys, initialize]);

  return {
    isInitialized,
    isInitializing,
    error,
    publicKey,
    encryptMessage,
    decryptMessage,
    encryptData,
    decryptData,
    sharePublicKey,
    establishSharedKey,
    hasSharedKey,
    clearAllKeys,
    reinitialize,
  };
}