// components/EncryptedMessageInput.tsx - Saisie de messages avec chiffrement E2EE
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Shield, ShieldOff } from 'lucide-react';
import { useEncryption } from '@/hooks/useEncryption';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface EncryptedMessageInputProps {
  conversationId: string;
  recipientId: string;
  onMessageSent: (message: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function EncryptedMessageInput({
  conversationId,
  recipientId,
  onMessageSent,
  placeholder = "Tapez votre message...",
  disabled = false,
  className,
}: EncryptedMessageInputProps) {
  const [message, setMessage] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isInitialized,
    encryptMessage,
    hasSharedKey,
  } = useEncryption();

  // Vérifie si le chiffrement est disponible pour ce destinataire
  useEffect(() => {
    if (isInitialized && recipientId) {
      setIsEncrypted(hasSharedKey(recipientId));
    }
  }, [isInitialized, recipientId, hasSharedKey]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);

    try {
      let contentToSend = message.trim();
      let encryptedData = null;
      let encryptionKeyId = null;

      // Chiffre le message si possible
      if (isInitialized && isEncrypted && recipientId) {
        try {
          const result = await encryptMessage(contentToSend, recipientId);
          encryptedData = result;
          encryptionKeyId = result.keyId;
          contentToSend = ''; // Le contenu réel est chiffré
        } catch (error) {
          console.error('Erreur de chiffrement:', error);
          toast.error('Erreur de chiffrement - message envoyé en clair');
        }
      }

      // Envoie le message à l'API
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToSend,
          encryptedData,
          isEncrypted: !!encryptedData,
          encryptionKeyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      onMessageSent(sentMessage);
      setMessage('');

      // Auto-focus
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleEncryption = () => {
    if (!isInitialized) {
      toast.error('Chiffrement non disponible');
      return;
    }

    if (!hasSharedKey(recipientId)) {
      toast.error('Clé partagée non disponible pour ce destinataire');
      return;
    }

    setIsEncrypted(!isEncrypted);
  };

  const canEncrypt = isInitialized && hasSharedKey(recipientId);

  return (
    <div className={cn("flex flex-col gap-2 p-3 border rounded-lg bg-background", className)}>
      {/* Indicateur de chiffrement */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canEncrypt ? (
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-primary/80",
                isEncrypted
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
              onClick={toggleEncryption}
            >
              {isEncrypted ? (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  Chiffré
                </>
              ) : (
                <>
                  <ShieldOff className="h-3 w-3 mr-1" />
                  Non chiffré
                </>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground opacity-50">
              <Lock className="h-3 w-3 mr-1" />
              Chiffrement indisponible
            </span>
          )}
        </div>

        {isEncrypted && (
          <span className="text-xs text-muted-foreground">
            🔒 Ce message sera chiffré de bout en bout
          </span>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className={cn(
            "flex-1 min-h-[60px] resize-none px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isEncrypted && "border-green-500 focus:border-green-600"
          )}
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 shrink-0",
            isEncrypted
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isSending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Informations sur le chiffrement */}
      {isEncrypted && (
        <div className="text-xs text-muted-foreground">
          <p>• Ce message sera chiffré avec AES-GCM 256 bits</p>
          <p>• Seule la personne destinataire pourra le lire</p>
          <p>• Le serveur ne peut pas accéder au contenu</p>
        </div>
      )}
    </div>
  );
}