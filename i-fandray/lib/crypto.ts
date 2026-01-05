// lib/crypto.ts - Bibliothèque de chiffrement bout en bout

// Types pour le chiffrement
export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt?: string;
  algorithm: string;
  keyId?: string;
}

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface SharedKey {
  key: CryptoKey;
  keyId: string;
  recipientId: string;
}

// Stockage des clés en mémoire (non persisté pour la sécurité)
let userKeyPair: KeyPair | null = null;
let sharedKeys: Map<string, SharedKey> = new Map();
let masterKey: CryptoKey | null = null;

/**
 * Génère une paire de clés ECDH pour l'utilisateur
 */
export async function generateUserKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  userKeyPair = {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };

  return userKeyPair;
}

/**
 * Exporte la clé publique pour partage
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Importe une clé publique depuis une chaîne base64
 */
export async function importPublicKey(publicKeyB64: string): Promise<CryptoKey> {
  const publicKeyData = Uint8Array.from(atob(publicKeyB64), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'spki',
    publicKeyData,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

/**
 * Génère une clé maître pour l'utilisateur (dérivée du mot de passe)
 */
export async function generateMasterKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  masterKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  return masterKey;
}

/**
 * Chiffre des données avec AES-GCM
 */
export async function encryptData(data: string, key?: CryptoKey): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Utilise la clé fournie ou génère une clé temporaire
  const encryptionKey = key || await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    encryptionKey,
    dataBuffer
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    algorithm: 'AES-GCM',
  };
}

/**
 * Déchiffre des données avec AES-GCM
 */
export async function decryptData(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
  const decoder = new TextDecoder();

  try {
    const ciphertext = Uint8Array.from(atob(encryptedData.ciphertext), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('Échec du déchiffrement - clé incorrecte ou données corrompues');
  }
}

/**
 * Dérive une clé partagée avec ECDH
 */
export async function deriveSharedKey(privateKey: CryptoKey, publicKey: CryptoKey, recipientId: string): Promise<SharedKey> {
  const sharedSecret = await crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    256
  );

  const sharedKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const keyId = btoa(String.fromCharCode(...new Uint8Array(sharedSecret.slice(0, 16))));

  const sharedKeyObj: SharedKey = {
    key: sharedKey,
    keyId,
    recipientId,
  };

  sharedKeys.set(recipientId, sharedKeyObj);
  return sharedKeyObj;
}

/**
 * Récupère une clé partagée pour un destinataire
 */
export function getSharedKey(recipientId: string): SharedKey | null {
  return sharedKeys.get(recipientId) || null;
}

/**
 * Chiffre un message pour un destinataire spécifique
 */
export async function encryptMessageForRecipient(message: string, recipientId: string): Promise<EncryptedData> {
  if (!userKeyPair) {
    throw new Error('Paire de clés utilisateur non initialisée');
  }

  let sharedKey = getSharedKey(recipientId);
  if (!sharedKey) {
    throw new Error('Clé partagée non trouvée pour ce destinataire');
  }

  const encrypted = await encryptData(message, sharedKey.key);
  encrypted.keyId = sharedKey.keyId;

  return encrypted;
}

/**
 * Déchiffre un message reçu
 */
export async function decryptMessageFromSender(encryptedData: EncryptedData, senderId: string): Promise<string> {
  if (!userKeyPair) {
    throw new Error('Paire de clés utilisateur non initialisée');
  }

  const sharedKey = getSharedKey(senderId);
  if (!sharedKey) {
    throw new Error('Clé partagée non trouvée pour cet expéditeur');
  }

  return await decryptData(encryptedData, sharedKey.key);
}

/**
 * Chiffre des données sensibles (posts privés, etc.)
 */
export async function encryptSensitiveData(data: string): Promise<EncryptedData> {
  if (!masterKey) {
    throw new Error('Clé maître non initialisée');
  }

  return await encryptData(data, masterKey);
}

/**
 * Déchiffre des données sensibles
 */
export async function decryptSensitiveData(encryptedData: EncryptedData): Promise<string> {
  if (!masterKey) {
    throw new Error('Clé maître non initialisée');
  }

  return await decryptData(encryptedData, masterKey);
}

/**
 * Initialise le système de chiffrement pour l'utilisateur
 */
export async function initializeEncryption(password?: string): Promise<void> {
  // Génère la paire de clés utilisateur si elle n'existe pas
  if (!userKeyPair) {
    await generateUserKeyPair();
  }

  // Génère la clé maître si un mot de passe est fourni
  if (password && !masterKey) {
    await generateMasterKey(password);
  }

  // TODO: Charger les clés partagées depuis le stockage sécurisé
  // Pour l'instant, elles sont stockées en mémoire uniquement
}

/**
 * Nettoie toutes les clés de la mémoire
 */
export function clearKeys(): void {
  userKeyPair = null;
  sharedKeys.clear();
  masterKey = null;
}

/**
 * Vérifie si Web Crypto API est disponible
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

/**
 * Génère un identifiant unique pour les clés
 */
export function generateKeyId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}