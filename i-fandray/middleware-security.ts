// middleware.ts - Sécurité et protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Liste des IPs bloquées (exemple)
const BLOCKED_IPS = [
  '192.168.1.1', // Exemple d'IP à bloquer
];

// Liste des User-Agents suspects
const SUSPICIOUS_USER_AGENTS = [
  'curl',
  'wget',
  'python-requests',
  'bot',
  'spider',
  'crawler',
];

// Rate limiting basique (en production, utiliser Redis ou un service dédié)
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requêtes par fenêtre
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Bloquer les IPs suspectes
  if (BLOCKED_IPS.includes(ip)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 2. Détecter les User-Agents suspects
  if (SUSPICIOUS_USER_AGENTS.some(agent => userAgent.toLowerCase().includes(agent))) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 3. Rate limiting basique
  const now = Date.now();
  const clientKey = `${ip}-${pathname}`;

  if (!requestCounts.has(clientKey)) {
    requestCounts.set(clientKey, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
  } else {
    const clientData = requestCounts.get(clientKey)!;

    if (now > clientData.resetTime) {
      // Reset la fenêtre
      clientData.count = 1;
      clientData.resetTime = now + RATE_LIMIT.windowMs;
    } else if (clientData.count >= RATE_LIMIT.maxRequests) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString(),
        },
      });
    } else {
      clientData.count++;
    }
  }

  // 4. Protection contre les attaques XSS dans les paramètres
  const url = request.nextUrl.clone();
  const searchParams = url.searchParams;

  for (const [key, value] of searchParams) {
    // Détecter les patterns XSS basiques
    if (/<script|javascript:|on\w+=/i.test(value)) {
      return new NextResponse('Invalid Request', { status: 400 });
    }
  }

  // 5. Headers de sécurité supplémentaires
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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};