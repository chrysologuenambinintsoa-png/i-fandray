// components/EncryptedMessageDisplay.tsx - Affichage des messages chiffrés
'use client';

import { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { useEncryption } from '@/hooks/useEncryption';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { EncryptedData } from '@/lib/crypto';

interface EncryptedMessageDisplayProps {
  content: string;
  encryptedData?: EncryptedData;
  senderId: string;
  timestamp?: Date;
  className?: string;
}

export function EncryptedMessageDisplay({
  content,
  encryptedData,
  senderId,
  timestamp,
  className,
}: EncryptedMessageDisplayProps) {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isInitialized, decryptMessage } = useEncryption();

  const isEncrypted = !!encryptedData;

  useEffect(() => {
    // Si le message n'est pas chiffré, afficher le contenu directement
    if (!isEncrypted) {
      setDecryptedContent(content);
      setIsDecrypted(true);
    }
  }, [content, isEncrypted]);

  const handleDecrypt = async () => {
    if (!isInitialized || !encryptedData) return;

    setIsDecrypting(true);
    setError(null);

    try {
      const decrypted = await decryptMessage(encryptedData, senderId);
      setDecryptedContent(decrypted);
      setIsDecrypted(true);
      toast.success('Message déchiffré');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de déchiffrement';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleHide = () => {
    setIsDecrypted(false);
    setDecryptedContent(null);
    setError(null);
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Indicateur de chiffrement */}
      {isEncrypted && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-input bg-background">
            <Lock className="h-3 w-3 mr-1" />
            Message chiffré
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Contenu du message */}
      <div className="relative">
        {isDecrypted && decryptedContent ? (
          // Message déchiffré
          <div className="space-y-2">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                    {decryptedContent}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton pour masquer */}
            <button
              onClick={handleHide}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs bg-transparent"
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Masquer
            </button>
          </div>
        ) : isEncrypted ? (
          // Message chiffré non déchiffré
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  [Message chiffré de bout en bout]
                </span>
              </div>
            </div>

            {/* Bouton de déchiffrement */}
            <button
              onClick={handleDecrypt}
              disabled={!isInitialized || isDecrypting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-6 px-2 text-xs"
            >
              {isDecrypting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent mr-1" />
                  Déchiffrement...
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Afficher
                </>
              )}
            </button>

            {/* Erreur de déchiffrement */}
            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
          </div>
        ) : (
          // Message non chiffré
          <div className="whitespace-pre-wrap text-sm">
            {content}
          </div>
        )}
      </div>

      {/* Informations de sécurité */}
      {isEncrypted && isDecrypted && (
        <div className="mt-2 text-xs text-muted-foreground">
          <p>🔒 Chiffré avec AES-GCM 256 bits • Vérifié de bout en bout</p>
        </div>
      )}
    </div>
  );
}