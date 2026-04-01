import { http, HttpResponse, delay } from 'msw'
import {
  mockUser,
  mockSubscription,
  mockCategories,
  mockCourses,
  mockCourseDetail,
  mockCargoServices,
  mockFactories,
  mockWholesaleSellers,
  mockChinaGuideItems,
  mockJobs,
  mockDesignServices,
  mockDocuments,
  mockExchangeRates,
  mockEvents,
  mockNews,
  mockUserProfile,
  mockFavorites,
  mockBalance,
  mockTransactions,
  mockReferralStats,
} from './fixtures'
import type {
  ApiResponse,
  ExchangeRatesResponse,
  FavoriteItem,
  AuthResponse,
} from '../api/types'

const API = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000'

function ok<T>(
  data: T,
  meta?: { page: number; perPage: number; total: number; totalPages: number }
): ApiResponse<T> {
  return { data, ...(meta ? { meta } : {}) }
}

async function simulateLatency() {
  // Simulate realistic network delay (100–400ms)
  await delay(100 + Math.random() * 300)
}

// In-memory favorites for the session
let sessionFavorites = [...mockFavorites]

export const handlers = [
  // ── Auth ─────────────────────────────────────────────────
  http.post(`${API}/api/auth/telegram`, async () => {
    await simulateLatency()
    const response: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: mockUser,
      subscription: mockSubscription,
    }
    return HttpResponse.json(ok(response))
  }),

  // ── User ─────────────────────────────────────────────────
  http.get(`${API}/api/user/me`, async () => {
    await simulateLatency()
    return HttpResponse.json(ok(mockUserProfile))
  }),

  http.put(`${API}/api/user/me`, async ({ request }) => {
    await simulateLatency()
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(ok({ ...mockUserProfile, ...body }))
  }),

  http.get(`${API}/api/subscription`, async () => {
    await simulateLatency()
    return HttpResponse.json(ok(mockSubscription))
  }),

  // ── Categories ────────────────────────────────────────────
  http.get(`${API}/api/categories`, async () => {
    await simulateLatency()
    return HttpResponse.json(ok(mockCategories))
  }),

  // ── Courses ───────────────────────────────────────────────
  http.get(`${API}/api/courses`, async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const marketplace = url.searchParams.get('marketplace')
    const filtered = marketplace
      ? mockCourses.filter((c) => c.marketplace === marketplace)
      : mockCourses
    return HttpResponse.json(
      ok(filtered, { page: 1, perPage: 20, total: filtered.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/courses/:id`, async ({ params }) => {
    await simulateLatency()
    const course = params['id'] === mockCourseDetail.id ? mockCourseDetail : null
    if (!course) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Course not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(course))
  }),

  // ── Cargo ─────────────────────────────────────────────────
  http.get(`${API}/api/cargo`, async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const filtered = type
      ? mockCargoServices.filter((c) => c.type === type)
      : mockCargoServices
    return HttpResponse.json(
      ok(filtered, { page: 1, perPage: 20, total: filtered.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/cargo/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockCargoServices.find((c) => c.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── Factories ────────────────────────────────────────────
  http.get(`${API}/api/factories`, async () => {
    await simulateLatency()
    return HttpResponse.json(
      ok(mockFactories, { page: 1, perPage: 20, total: mockFactories.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/factories/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockFactories.find((f) => f.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── Wholesale ────────────────────────────────────────────
  http.get(`${API}/api/wholesale`, async () => {
    await simulateLatency()
    return HttpResponse.json(
      ok(mockWholesaleSellers, {
        page: 1,
        perPage: 20,
        total: mockWholesaleSellers.length,
        totalPages: 1,
      })
    )
  }),

  http.get(`${API}/api/wholesale/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockWholesaleSellers.find((w) => w.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── China Guide ──────────────────────────────────────────
  http.get(`${API}/api/china-guide/:type`, async ({ params, request }) => {
    await simulateLatency()
    const type = params['type'] as string
    const filtered = mockChinaGuideItems.filter((item) => item.type === type)
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    return HttpResponse.json(
      ok(filtered, { page, perPage: 20, total: filtered.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/china-guide/:type/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockChinaGuideItems.find((i) => i.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── Jobs ─────────────────────────────────────────────────
  http.get(`${API}/api/jobs`, async () => {
    await simulateLatency()
    return HttpResponse.json(
      ok(mockJobs, { page: 1, perPage: 20, total: mockJobs.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/jobs/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockJobs.find((j) => j.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── Design Services ──────────────────────────────────────
  http.get(`${API}/api/design-services`, async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const filtered = type
      ? mockDesignServices.filter((d) => d.type === type)
      : mockDesignServices
    return HttpResponse.json(
      ok(filtered, { page: 1, perPage: 20, total: filtered.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/design-services/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockDesignServices.find((d) => d.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── Documents ────────────────────────────────────────────
  http.get(`${API}/api/documents`, async () => {
    await simulateLatency()
    return HttpResponse.json(
      ok(mockDocuments, { page: 1, perPage: 20, total: mockDocuments.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/documents/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockDocuments.find((d) => d.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── Exchange ─────────────────────────────────────────────
  http.get(`${API}/api/exchange/rates`, async () => {
    await simulateLatency()
    const response: ExchangeRatesResponse = {
      rates: mockExchangeRates,
      baseCurrency: 'UZS',
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(ok(response))
  }),

  // ── Events ───────────────────────────────────────────────
  http.get(`${API}/api/events`, async () => {
    await simulateLatency()
    return HttpResponse.json(
      ok(mockEvents, { page: 1, perPage: 20, total: mockEvents.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/events/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockEvents.find((e) => e.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── News ─────────────────────────────────────────────────
  http.get(`${API}/api/news`, async () => {
    await simulateLatency()
    return HttpResponse.json(
      ok(mockNews, { page: 1, perPage: 20, total: mockNews.length, totalPages: 1 })
    )
  }),

  http.get(`${API}/api/news/:id`, async ({ params }) => {
    await simulateLatency()
    const item = mockNews.find((n) => n.id === params['id'])
    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }
    return HttpResponse.json(ok(item))
  }),

  // ── Favorites ────────────────────────────────────────────
  http.get(`${API}/api/favorites`, async () => {
    await simulateLatency()
    return HttpResponse.json(ok(sessionFavorites))
  }),

  http.post(`${API}/api/favorites`, async ({ request }) => {
    await simulateLatency()
    const body = (await request.json()) as { itemId: string; itemType: string }
    const newFav: FavoriteItem = {
      id: 'fav-' + Date.now(),
      itemId: body.itemId,
      itemType: body.itemType as FavoriteItem['itemType'],
      title: 'Item ' + body.itemId,
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      addedAt: new Date().toISOString(),
    }
    sessionFavorites = [...sessionFavorites, newFav]
    return HttpResponse.json(ok(newFav), { status: 201 })
  }),

  http.delete(`${API}/api/favorites/:id`, async ({ params }) => {
    await simulateLatency()
    sessionFavorites = sessionFavorites.filter((f) => f.id !== params['id'])
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Money ────────────────────────────────────────────────
  http.get(`${API}/api/money/balance`, async () => {
    await simulateLatency()
    return HttpResponse.json(ok(mockBalance))
  }),

  http.get(`${API}/api/money/transactions`, async () => {
    await simulateLatency()
    return HttpResponse.json(
      ok(mockTransactions, {
        page: 1,
        perPage: 20,
        total: mockTransactions.length,
        totalPages: 1,
      })
    )
  }),

  http.post(`${API}/api/money/withdraw`, async () => {
    await simulateLatency()
    return HttpResponse.json(
      ok({
        transactionId: 'tx-' + Date.now(),
        status: 'pending' as const,
        message: 'Заявка на вывод принята',
      })
    )
  }),

  http.get(`${API}/api/money/referral`, async () => {
    await simulateLatency()
    return HttpResponse.json(ok(mockReferralStats))
  }),
]
