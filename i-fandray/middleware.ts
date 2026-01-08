import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting avancé
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Liste des IPs bloquées (à configurer selon vos besoins)
const BLOCKED_IPS: string[] = [
  // '192.168.1.1', // Exemple d'IP à bloquer
];

// Liste des User-Agents suspects
const SUSPICIOUS_USER_AGENTS = [
  'curl',
  'wget',
  'python-requests',
  'bot',
  'spider',
  'crawler',
  'sqlmap',
  'nikto',
  'dirbuster',
  'gobuster',
  'masscan',
  'zmap',
];

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return true;
  }

  userLimit.count++;
  return false;
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  // Vérifier les IPs bloquées
  if (BLOCKED_IPS.includes(ip)) {
    return true;
  }

  // Vérifier les User-Agents suspects
  if (SUSPICIOUS_USER_AGENTS.some(agent => userAgent.toLowerCase().includes(agent))) {
    return true;
  }

  // Vérifier les patterns d'attaque dans l'URL
  const url = request.url;
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS
    /javascript:/i,  // JavaScript injection
    /on\w+=/i,  // Event handlers
    /union.*select/i,  // SQL injection
    /eval\(/i,  // Code injection
    /base64/i,  // Encoded attacks
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const { pathname } = request.nextUrl;

  // 1. Détection des requêtes suspectes
  if (isSuspiciousRequest(request)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 2. Rate limiting pour les routes API
  if (pathname.startsWith('/api/')) {
    // Allow specific API routes to bypass rate limiting in development
    const WHITELISTED_API_PATHS = ['/api/users/register'];
    const isWhitelisted = WHITELISTED_API_PATHS.some((p) => pathname.startsWith(p));

    // In production: always enforce rate limiting
    if (process.env.NODE_ENV === 'production') {
      if (isRateLimited(ip)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': '900', // 15 minutes en secondes
            },
          }
        );
      }
    } else {
      // In non-production, skip rate limiting only for whitelisted routes
      if (!isWhitelisted) {
        if (isRateLimited(ip)) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
              status: 429,
              headers: {
                'Retry-After': '900',
              },
            }
          );
        }
      }
    }
  }

  // 3. Vérifications d'authentification pour les routes protégées
  if (pathname.startsWith('/api/auth/') && !pathname.includes('/callback')) {
    // Autoriser les routes d'authentification
  } else if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    // Pour les autres routes API, NextAuth gère l'authentification
    // Ajouter des vérifications supplémentaires si nécessaire
  }

  // 4. Headers de sécurité
  const response = NextResponse.next();

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Protection contre le clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Protection contre le MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Protection XSS
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // HSTS (HTTP Strict Transport Security) - seulement en HTTPS
  if (request.url.startsWith('https://')) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

// Configuration des routes à protéger
export const config = {
  matcher: [
    /*
     * Protéger toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     * - public/
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};