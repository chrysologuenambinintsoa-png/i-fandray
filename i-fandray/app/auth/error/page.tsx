'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Home, LogIn, RefreshCw } from 'lucide-react';

// Composant pour éviter les erreurs d'hydratation
function ClientOnly({ children, fallback = 'N/A' }: { children: () => string; fallback?: string }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <span>{fallback}</span>;
  }

  return <span>{children()}</span>;
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Accès refusé',
          message: 'Vous avez refusé l\'autorisation ou annulé le processus d\'authentification.',
          suggestion: 'Essayez de vous connecter à nouveau avec une méthode différente.'
        };
      case 'Configuration':
        return {
          title: 'Erreur de configuration',
          message: 'Il y a un problème avec la configuration de l\'authentification.',
          suggestion: 'Contactez l\'administrateur du site.'
        };
      case 'OAuthCallback':
        return {
          title: 'Erreur OAuth',
          message: 'Une erreur s\'est produite lors de la connexion avec le fournisseur OAuth.',
          suggestion: 'Vérifiez que votre compte OAuth est correctement configuré.'
        };
      case 'OAuthCreateAccount':
        return {
          title: 'Erreur de création de compte',
          message: 'Impossible de créer votre compte avec les informations OAuth.',
          suggestion: 'Essayez de vous inscrire manuellement.'
        };
      case 'EmailCreateAccount':
        return {
          title: 'Erreur de création de compte',
          message: 'Impossible de créer votre compte avec cette adresse email.',
          suggestion: 'Essayez avec une autre adresse email.'
        };
      case 'Callback':
        return {
          title: 'Erreur de callback',
          message: 'Une erreur s\'est produite lors du retour du fournisseur d\'authentification.',
          suggestion: 'Réessayez le processus de connexion.'
        };
      case 'OAuthAccountNotLinked':
        return {
          title: 'Compte OAuth déjà utilisé',
          message: 'Un compte avec cette adresse email existe déjà.',
          suggestion: 'Connectez-vous avec votre email et mot de passe, puis allez dans Paramètres > Compte pour lier votre compte OAuth.'
        };
      case 'EmailSignin':
        return {
          title: 'Erreur d\'email',
          message: 'Une erreur s\'est produite avec l\'envoi de l\'email.',
          suggestion: 'Vérifiez votre connexion internet et réessayez.'
        };
      case 'CredentialsSignin':
        return {
          title: 'Identifiants incorrects',
          message: 'L\'email ou le mot de passe est incorrect.',
          suggestion: 'Vérifiez vos identifiants et réessayez.'
        };
      case 'SessionRequired':
        return {
          title: 'Session requise',
          message: 'Vous devez être connecté pour accéder à cette page.',
          suggestion: 'Connectez-vous pour continuer.'
        };
      default:
        return {
          title: 'Erreur d\'authentification',
          message: 'Une erreur inattendue s\'est produite lors de l\'authentification.',
          suggestion: 'Réessayez ou contactez le support.'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {errorInfo.title}
        </h1>

        {/* Error code */}
        {error && (
          <p className="text-sm text-gray-500 mb-4">
            Code d&apos;erreur: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{error}</code>
          </p>
        )}

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {errorInfo.message}
        </p>

        {/* Suggestion */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 <strong>Conseil:</strong> {errorInfo.suggestion}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </button>

          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Aller à la connexion
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Home className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Informations de debug (développement)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
              <p><strong>Error:</strong> {error}</p>
              <p><strong>URL:</strong> <ClientOnly>{() => window.location.href}</ClientOnly></p>
              <p><strong>User Agent:</strong> <ClientOnly>{() => navigator.userAgent}</ClientOnly></p>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}