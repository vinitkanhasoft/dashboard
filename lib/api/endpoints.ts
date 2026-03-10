const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000"

// ─── Auth Endpoints ──────────────────────────────────────
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  LOGOUT: `${BASE_URL}/api/auth/logout`,
  PROFILE: `${BASE_URL}/api/auth/profile`,
  REFRESH_TOKEN: `${BASE_URL}/api/auth/refresh-token`,
  SESSIONS: `${BASE_URL}/api/auth/sessions`,
  UPLOAD_PROFILE_IMAGE: `${BASE_URL}/api/auth/upload-profile-image`,
} as const

// ─── Banner Endpoints ────────────────────────────────────
export const BANNER_ENDPOINTS = {
  LIST: `${BASE_URL}/api/banners`,
  CREATE: `${BASE_URL}/api/banners`,
  SEARCH: `${BASE_URL}/api/banners/search`,
  BULK_DELETE: `${BASE_URL}/api/banners/bulk-delete`,
  UPDATE: (id: string) => `${BASE_URL}/api/banners/${id}`,
  GET: (id: string) => `${BASE_URL}/api/banners/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/banners/${id}`,
} as const

// ─── Car Endpoints ───────────────────────────────────────
export const CAR_ENDPOINTS = {
  BASE: `${BASE_URL}/api/cars`,
  LIST: `${BASE_URL}/api/cars`,
  CREATE: `${BASE_URL}/api/cars`,
  SEARCH: `${BASE_URL}/api/cars/search`,
  SEARCH_STATUS: `${BASE_URL}/api/cars/search-status`,
  FEATURED: `${BASE_URL}/api/cars/featured`,
  BULK_DELETE: `${BASE_URL}/api/cars/bulk-delete`,
  UPDATE: (id: string) => `${BASE_URL}/api/cars/${id}`,
  GET: (id: string) => `${BASE_URL}/api/cars/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/cars/${id}`,
} as const

// ─── Testimonial Endpoints ──────────────────────────────
export const TESTIMONIAL_ENDPOINTS = {
  LIST: `${BASE_URL}/api/testimonials`,
  CREATE: `${BASE_URL}/api/testimonials`,
  BULK_DELETE: `${BASE_URL}/api/testimonials/bulk-delete`,
  UPDATE: (id: string) => `${BASE_URL}/api/testimonials/${id}`,
  GET: (id: string) => `${BASE_URL}/api/testimonials/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/testimonials/${id}`,
  APPROVE: (id: string) => `${BASE_URL}/api/testimonials/${id}/approve`,
} as const

// ─── Newsletter Endpoints ────────────────────────────────
export const NEWSLETTER_ENDPOINTS = {
  LIST: `${BASE_URL}/api/newsletter`,
  SUBSCRIBE: `${BASE_URL}/api/newsletter/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/api/newsletter/unsubscribe`,
  STATS: `${BASE_URL}/api/newsletter/stats`,
  BULK_DELETE: `${BASE_URL}/api/newsletter/bulk-delete`,
  DELETE: (id: string) => `${BASE_URL}/api/newsletter/${id}`,
  CAMPAIGNS: `${BASE_URL}/api/newsletter/campaigns`,
  CAMPAIGN_SEND: (id: string) => `${BASE_URL}/api/newsletter/campaigns/${id}/send`,
  CAMPAIGN_DELETE: (id: string) => `${BASE_URL}/api/newsletter/campaigns/${id}`,
  QUICK_EMAIL: `${BASE_URL}/api/newsletter/quick-email`,
  TEST_EMAIL: `${BASE_URL}/api/newsletter/test-email`,
  MARKETING_STATS: `${BASE_URL}/api/newsletter/marketing-stats`,
} as const

// ─── Team Endpoints ─────────────────────────────────────
export const TEAM_ENDPOINTS = {
  LIST: `${BASE_URL}/api/team`,
  CREATE: `${BASE_URL}/api/team`,
  STATS: `${BASE_URL}/api/team/stats`,
  FEATURED: `${BASE_URL}/api/team/featured`,
  BULK_DELETE: `${BASE_URL}/api/team/bulk-delete`,
  BY_POSITION: (position: string) => `${BASE_URL}/api/team/position/${position}`,
  GET: (id: string) => `${BASE_URL}/api/team/${id}`,
  UPDATE: (id: string) => `${BASE_URL}/api/team/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/team/${id}`,
  TOGGLE_STATUS: (id: string) => `${BASE_URL}/api/team/${id}/toggle-status`,
} as const

// ─── Blog Endpoints ─────────────────────────────────────
export const BLOG_ENDPOINTS = {
  LIST: `${BASE_URL}/api/blogs`,
  CREATE: `${BASE_URL}/api/blogs`,
  SEARCH: `${BASE_URL}/api/blogs/search`,
  FEATURED: `${BASE_URL}/api/blogs/featured`,
  CATEGORIES: `${BASE_URL}/api/blogs/categories`,
  BULK_DELETE: `${BASE_URL}/api/blogs/bulk-delete`,
  SLUG: (slug: string) => `${BASE_URL}/api/blogs/slug/${slug}`,
  UPDATE: (id: string) => `${BASE_URL}/api/blogs/${id}`,
  GET: (id: string) => `${BASE_URL}/api/blogs/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/blogs/${id}`,
} as const

// ─── Car Plate Endpoints ────────────────────────────────
export const CAR_PLATE_ENDPOINTS = {
  LIST: `${BASE_URL}/api/car-plates`,
  CREATE: `${BASE_URL}/api/car-plates`,
  VALIDATE: `${BASE_URL}/api/car-plates/validate`,
  BY_RTO: (rtoCode: string) => `${BASE_URL}/api/car-plates/rto/${rtoCode}`,
  GET: (id: string) => `${BASE_URL}/api/car-plates/${id}`,
  UPDATE: (id: string) => `${BASE_URL}/api/car-plates/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/car-plates/${id}`,
} as const

// ─── Insurance & Finance Endpoints ──────────────────────
export const INSURANCE_FINANCE_ENDPOINTS = {
  // Insurance
  INSURANCE_LIST: `${BASE_URL}/api/insurance-finance/insurance`,
  INSURANCE_CREATE: `${BASE_URL}/api/insurance-finance/insurance`,
  INSURANCE_GET: (id: string) => `${BASE_URL}/api/insurance-finance/insurance/${id}`,
  INSURANCE_UPDATE: (id: string) => `${BASE_URL}/api/insurance-finance/insurance/${id}`,
  INSURANCE_DELETE: (id: string) => `${BASE_URL}/api/insurance-finance/insurance/${id}`,
  INSURANCE_BY_COVERAGE: (type: string) => `${BASE_URL}/api/insurance-finance/insurance/coverage/${type}`,
  // Finance
  FINANCE_LIST: `${BASE_URL}/api/insurance-finance/finance`,
  FINANCE_CREATE: `${BASE_URL}/api/insurance-finance/finance`,
  FINANCE_GET: (id: string) => `${BASE_URL}/api/insurance-finance/finance/${id}`,
  FINANCE_UPDATE: (id: string) => `${BASE_URL}/api/insurance-finance/finance/${id}`,
  FINANCE_DELETE: (id: string) => `${BASE_URL}/api/insurance-finance/finance/${id}`,
  FINANCE_BY_TYPE: (type: string) => `${BASE_URL}/api/insurance-finance/finance/type/${type}`,
} as const

export { BASE_URL }
