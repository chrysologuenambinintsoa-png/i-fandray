import '@testing-library/jest-dom'
import React from 'react'

// Mock Web APIs for Next.js
global.Request = class Request {
  url: string
  method: string
  headers: Headers
  body: any
  cache: RequestCache
  credentials: RequestCredentials
  destination: RequestDestination
  integrity: string
  keepalive: boolean
  mode: RequestMode
  redirect: RequestRedirect
  referrer: string
  referrerPolicy: ReferrerPolicy
  signal: AbortSignal
  bodyUsed: boolean

  constructor(input: string | URL | Request, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    this.url = url
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.body = init?.body
    this.cache = init?.cache || 'default'
    this.credentials = init?.credentials || 'same-origin'
    this.destination = ''
    this.integrity = ''
    this.keepalive = init?.keepalive || false
    this.mode = init?.mode || 'cors'
    this.redirect = init?.redirect || 'follow'
    this.referrer = ''
    this.referrerPolicy = ''
    this.signal = init?.signal || new AbortController().signal
    this.bodyUsed = false
  }

  clone() {
    return new (global.Request as any)(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
    })
  }

  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)) }
  blob() { return Promise.resolve(new Blob()) }
  bytes() { return Promise.resolve(new Uint8Array()) }
  formData() { return Promise.resolve(new FormData()) }
  json() { return Promise.resolve(null) }
  text() { return Promise.resolve('') }
}

global.Response = class Response {
  body: any
  status: number
  statusText: string
  headers: Headers
  ok: boolean
  redirected: boolean
  type: ResponseType
  url: string
  bodyUsed: boolean

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
    this.ok = this.status >= 200 && this.status < 300
    this.redirected = false
    this.type = 'default'
    this.url = ''
    this.bodyUsed = false
  }

  clone() {
    return new (global.Response as any)(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    })
  }

  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)) }
  blob() { return Promise.resolve(new Blob()) }
  bytes() { return Promise.resolve(new Uint8Array()) }
  formData() { return Promise.resolve(new FormData()) }
  json() { return Promise.resolve(this.body) }
  text() { return Promise.resolve(JSON.stringify(this.body)) }

  static error() {
    const response = new Response(null, { status: 0, statusText: 'error' })
    response.type = 'error'
    return response
  }

  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers }
    })
  }

  static redirect(url: string | URL, status = 302) {
    return new Response(null, {
      status,
      headers: { Location: typeof url === 'string' ? url : url.href }
    })
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(null)),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock next/server for API route testing
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string
    nextUrl: { searchParams: URLSearchParams }
    constructor(url: string) {
      this.url = url
      const urlObj = new URL(url)
      this.nextUrl = {
        searchParams: urlObj.searchParams,
      }
    }
  },
  NextResponse: {
    json: (data: any, options?: any) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    }),
  },
}))

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'file:./test.db'

// Global test utilities
global.fetch = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null
  rootMargin: string
  thresholds: ReadonlyArray<number>

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.root = (options?.root instanceof Element) ? options.root : null
    this.rootMargin = options?.rootMargin || '0px'
    this.thresholds = Array.isArray(options?.threshold) ? options.threshold : (options?.threshold !== undefined ? [options.threshold] : [0])
  }

  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
  takeRecords() {
    return []
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock EventSource for SSE
global.EventSource = class MockEventSource {
  url: string
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: any) => void) | null = null
  onerror: ((error: any) => void) | null = null
  readyState = 1 // OPEN
  withCredentials: boolean = false

  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSED = 2

  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 2

  constructor(url: string | URL) {
    this.url = typeof url === 'string' ? url : url.href
  }

  close() {
    this.readyState = 2 // CLOSED
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

// Mock timers
jest.useFakeTimers()

// Mock fetch for API calls
global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url

  if (url.includes('/api/friends/online')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ friends: [] }),
      status: 200,
      statusText: 'OK',
    } as Response)
  }
  if (url.includes('/api/conversations/unread-count')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ unreadCount: 2 }),
      status: 200,
      statusText: 'OK',
    } as Response)
  }
  if (url.includes('/api/friends/requests-count')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ count: 1 }),
      status: 200,
      statusText: 'OK',
    } as Response)
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
    statusText: 'OK',
  } as Response)
})

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: '/avatar.jpg',
    },
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }),
}))

jest.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    language: 'en',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: 'public',
      messageRequests: true,
      showOnlineStatus: true,
    },
    setLanguage: jest.fn(),
    setTheme: jest.fn(),
    setNotification: jest.fn(),
    setPrivacy: jest.fn(),
    resetSettings: jest.fn(),
  }),
}))

jest.mock('@/components/TranslationProvider', () => ({
  TranslationProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
  }),
}))

jest.mock('@/hooks/useNotificationsWithFetch', () => ({
  useNotificationsWithFetch: () => ({
    unreadCount: 3,
  }),
}))

jest.mock('@/hooks/useUnreadMessagesCount', () => ({
  useUnreadMessagesCount: () => ({
    unreadCount: 2,
    loading: false,
  }),
}))

jest.mock('@/hooks/useFriendRequestsCount', () => ({
  useFriendRequestsCount: () => ({
    count: 1,
    loading: false,
  }),
}))

jest.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => ({
    isOnline: true,
    setOnlineStatus: jest.fn(),
  }),
}))

jest.mock('@/hooks/useRealtimeNotifications', () => ({
  useRealtimeNotifications: () => ({
    // Mock implementation
  }),
}))