// components/EncryptionManager.tsx - Gestionnaire de chiffrement E2EE
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useEncryption } from '@/hooks/useEncryption';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldX, Key, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EncryptionManagerProps {
  onEncryptionChange?: (enabled: boolean) => void;
}

export function EncryptionManager({ onEncryptionChange }: EncryptionManagerProps) {
  const { data: session } = useSession();
  const {
    isInitialized,
    isInitializing,
    error,
    publicKey,
    sharePublicKey,
    establishSharedKey,
    hasSharedKey,
    clearAllKeys,
    reinitialize,
  } = useEncryption();

  const [isEnabled, setIsEnabled] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [password, setPassword] = useState('');

  // Active le chiffrement par défaut si disponible
  useEffect(() => {
    if (isInitialized && !isEnabled) {
      setIsEnabled(true);
      onEncryptionChange?.(true);
    }
  }, [isInitialized, isEnabled, onEncryptionChange]);

  const handleToggleEncryption = async () => {
    if (!isInitialized) {
      toast.error('Chiffrement non disponible');
      return;
    }

    const newState = !isEnabled;
    setIsEnabled(newState);
    onEncryptionChange?.(newState);

    toast.success(
      newState
        ? 'Chiffrement bout en bout activé'
        : 'Chiffrement bout en bout désactivé'
    );
  };

  const handleSharePublicKey = async () => {
    try {
      const key = await sharePublicKey();
      await navigator.clipboard.writeText(key);
      toast.success('Clé publique copiée dans le presse-papiers');
    } catch (err) {
      toast.error('Erreur lors du partage de la clé publique');
    }
  };

  const handleReinitialize = async () => {
    if (!password.trim()) {
      toast.error('Veuillez saisir un mot de passe');
      return;
    }

    try {
      await reinitialize(password);
      toast.success('Chiffrement réinitialisé avec succès');
      setPassword('');
    } catch (err) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const handleClearKeys = () => {
    clearAllKeys();
    setIsEnabled(false);
    onEncryptionChange?.(false);
    toast.success('Toutes les clés ont été effacées');
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Chiffrement Bout en Bout
        </CardTitle>
        <CardDescription>
          Sécurisez vos messages et données avec un chiffrement de bout en bout
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* État du chiffrement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isInitializing ? (
              <Shield className="h-4 w-4 animate-pulse text-yellow-500" />
            ) : isInitialized ? (
              <ShieldCheck className="h-4 w-4 text-green-500" />
            ) : (
              <ShieldX className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isInitializing
                ? 'Initialisation...'
                : isInitialized
                ? 'Prêt'
                : 'Non disponible'}
            </span>
          </div>

          <Badge variant={isEnabled ? 'default' : 'secondary'}>
            {isEnabled ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Activé
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-1" />
                Désactivé
              </>
            )}
          </Badge>
        </div>

        {/* Bouton d'activation/désactivation */}
        <Button
          onClick={handleToggleEncryption}
          disabled={!isInitialized || isInitializing}
          variant={isEnabled ? 'destructive' : 'default'}
          className="w-full"
        >
          {isEnabled ? 'Désactiver le chiffrement' : 'Activer le chiffrement'}
        </Button>

        {/* Erreurs */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Informations avancées */}
        {isInitialized && (
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Masquer' : 'Afficher'} les options avancées
            </Button>

            {showAdvanced && (
              <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                {/* Partage de clé publique */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clé publique</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSharePublicKey}
                      className="flex-1"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Copier la clé
                    </Button>
                  </div>
                  {publicKey && (
                    <p className="text-xs text-muted-foreground break-all">
                      {publicKey.substring(0, 32)}...
                    </p>
                  )}
                </div>

                {/* Réinitialisation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Réinitialiser le chiffrement</label>
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReinitialize}
                    disabled={!password.trim()}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>

                {/* Actions dangereuses */}
                <div className="pt-2 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearKeys}
                    className="w-full"
                  >
                    Effacer toutes les clés
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚠️ Cette action est irréversible
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informations sur la sécurité */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Le chiffrement utilise AES-GCM 256 bits</p>
          <p>• Les clés sont générées localement et ne quittent jamais votre appareil</p>
          <p>• Seuls les destinataires peuvent lire vos messages chiffrés</p>
        </div>
      </CardContent>
    </Card>
  );
}