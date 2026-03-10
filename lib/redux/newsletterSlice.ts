import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import { NEWSLETTER_ENDPOINTS } from "@/lib/api/endpoints"
import { refreshAccessToken } from "./authSlice"

// ─── Types ───────────────────────────────────────────────
export type Subscription = {
  _id: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Campaign = {
  _id: string
  name: string
  subject: string
  content: string
  recipients: string[]
  status?: string
  sentAt?: string
  totalRecipients?: number
  createdAt: string
  updatedAt: string
}

export type NewsletterStats = {
  total: number
  active: number
  inactive: number
  recentSubscriptions: number
}

export type MarketingStats = {
  campaigns: { total: number; sent: number; draft: number }
  emails: { total: number; sent: number }
}

type NewsletterState = {
  subscriptions: Subscription[]
  campaigns: Campaign[]
  stats: NewsletterStats | null
  marketingStats: MarketingStats | null
  loading: boolean
  campaignsLoading: boolean
  error: string | null
  subscribing: boolean
  creating: boolean
  sending: boolean
  unsubscribing: boolean
}

type ErrorResponse = {
  success: boolean
  message: string
  errors?: { msg: string; path?: string }[]
}

// ─── Helper ──────────────────────────────────────────────
const getAccessToken = () => Cookies.get("access_token") || null

const parseErrorResponse = (json: ErrorResponse): string => {
  if (json.errors && json.errors.length > 0) {
    return json.errors.map((e) => e.msg).join(", ")
  }
  return json.message ?? "Something went wrong."
}

// ─── Async Thunks ────────────────────────────────────────

/** GET /api/newsletter?page=1&limit=500 */
export const fetchSubscriptions = createAsyncThunk<
  { subscriptions: Subscription[]; stats: NewsletterStats },
  void,
  { rejectValue: string }
>("newsletter/fetchSubscriptions", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(`${NEWSLETTER_ENDPOINTS.LIST}?page=1&limit=100`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(`${NEWSLETTER_ENDPOINTS.LIST}?page=1&limit=100`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch subscriptions.")
    }
    return { subscriptions: json.data.subscriptions, stats: json.data.stats }
  } catch {
    return rejectWithValue("Network error. Could not fetch subscriptions.")
  }
})

/** GET /api/newsletter/stats */
export const fetchNewsletterStats = createAsyncThunk<
  NewsletterStats,
  void,
  { rejectValue: string }
>("newsletter/fetchStats", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.STATS, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.STATS, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch stats.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not fetch stats.")
  }
})

/** DELETE /api/newsletter/:id */
export const deleteSubscription = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("newsletter/deleteSubscription", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.DELETE(id), {
      method: "DELETE",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.DELETE(id), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to delete subscription.")
    }
    return id
  } catch {
    return rejectWithValue("Network error. Could not delete subscription.")
  }
})

/** POST /api/newsletter/bulk-delete */
export const bulkDeleteSubscriptions = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>("newsletter/bulkDeleteSubscriptions", async (ids, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.BULK_DELETE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ ids }),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.BULK_DELETE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ ids }),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to bulk delete.")
    }
    return ids
  } catch {
    return rejectWithValue("Network error. Could not bulk delete.")
  }
})

/** GET /api/newsletter/campaigns */
export const fetchCampaigns = createAsyncThunk<
  Campaign[],
  void,
  { rejectValue: string }
>("newsletter/fetchCampaigns", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(`${NEWSLETTER_ENDPOINTS.CAMPAIGNS}?page=1&limit=100`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(`${NEWSLETTER_ENDPOINTS.CAMPAIGNS}?page=1&limit=100`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch campaigns.")
    }
    return json.data.campaigns
  } catch {
    return rejectWithValue("Network error. Could not fetch campaigns.")
  }
})

/** POST /api/newsletter/campaigns */
export const createCampaign = createAsyncThunk<
  Campaign,
  { name: string; subject: string; content: string; recipients: string[] },
  { rejectValue: string }
>("newsletter/createCampaign", async (payload, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.CAMPAIGNS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.CAMPAIGNS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(parseErrorResponse(json))
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not create campaign.")
  }
})

/** POST /api/newsletter/campaigns/:id/send */
export const sendCampaign = createAsyncThunk<
  { campaignId: string; totalRecipients: number },
  string,
  { rejectValue: string }
>("newsletter/sendCampaign", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.CAMPAIGN_SEND(id), {
      method: "POST",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.CAMPAIGN_SEND(id), {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to send campaign.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not send campaign.")
  }
})

/** DELETE /api/newsletter/campaigns/:id */
export const deleteCampaign = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("newsletter/deleteCampaign", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.CAMPAIGN_DELETE(id), {
      method: "DELETE",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.CAMPAIGN_DELETE(id), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to delete campaign.")
    }
    return id
  } catch {
    return rejectWithValue("Network error. Could not delete campaign.")
  }
})

/** POST /api/newsletter/quick-email */
export const sendQuickEmail = createAsyncThunk<
  { totalRecipients: number },
  { subject: string; content: string; selectedEmails: string[] },
  { rejectValue: string }
>("newsletter/sendQuickEmail", async (payload, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.QUICK_EMAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.QUICK_EMAIL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to send email.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not send email.")
  }
})

/** POST /api/newsletter/test-email */
export const sendTestEmail = createAsyncThunk<
  { email: string },
  string,
  { rejectValue: string }
>("newsletter/sendTestEmail", async (email, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.TEST_EMAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ email }),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.TEST_EMAIL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email }),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to send test email.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not send test email.")
  }
})

/** POST /api/newsletter/unsubscribe */
export const unsubscribeEmail = createAsyncThunk<
  { email: string; message: string },
  string,
  { rejectValue: string }
>("newsletter/unsubscribeEmail", async (email, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.UNSUBSCRIBE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ email }),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.UNSUBSCRIBE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email }),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to unsubscribe email.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not unsubscribe email.")
  }
})

/** GET /api/newsletter/marketing-stats */
export const fetchMarketingStats = createAsyncThunk<
  MarketingStats,
  void,
  { rejectValue: string }
>("newsletter/fetchMarketingStats", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(NEWSLETTER_ENDPOINTS.MARKETING_STATS, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(NEWSLETTER_ENDPOINTS.MARKETING_STATS, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch marketing stats.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not fetch marketing stats.")
  }
})

// ─── Initial State ───────────────────────────────────────
const initialState: NewsletterState = {
  subscriptions: [],
  campaigns: [],
  stats: null,
  marketingStats: null,
  loading: false,
  campaignsLoading: false,
  error: null,
  subscribing: false,
  creating: false,
  sending: false,
  unsubscribing: false,
}

// ─── Slice ───────────────────────────────────────────────
const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    clearNewsletterError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchSubscriptions
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.subscriptions = action.payload.subscriptions
        state.stats = action.payload.stats
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to fetch subscriptions."
      })

    // fetchNewsletterStats
    builder
      .addCase(fetchNewsletterStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })

    // deleteSubscription
    builder
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.subscriptions = state.subscriptions.filter((s) => s._id !== action.payload)
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete subscription."
      })

    // bulkDeleteSubscriptions
    builder
      .addCase(bulkDeleteSubscriptions.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload)
        state.subscriptions = state.subscriptions.filter((s) => !deletedIds.has(s._id))
      })
      .addCase(bulkDeleteSubscriptions.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to bulk delete."
      })

    // fetchCampaigns
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.campaignsLoading = true
        state.error = null
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.campaignsLoading = false
        state.campaigns = action.payload
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.campaignsLoading = false
        state.error = action.payload ?? "Failed to fetch campaigns."
      })

    // createCampaign
    builder
      .addCase(createCampaign.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.creating = false
        state.campaigns.unshift(action.payload)
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? "Failed to create campaign."
      })

    // sendCampaign
    builder
      .addCase(sendCampaign.pending, (state) => {
        state.sending = true
      })
      .addCase(sendCampaign.fulfilled, (state) => {
        state.sending = false
      })
      .addCase(sendCampaign.rejected, (state, action) => {
        state.sending = false
        state.error = action.payload ?? "Failed to send campaign."
      })

    // deleteCampaign
    builder
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((c) => c._id !== action.payload)
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete campaign."
      })

    // sendQuickEmail
    builder
      .addCase(sendQuickEmail.pending, (state) => {
        state.sending = true
      })
      .addCase(sendQuickEmail.fulfilled, (state) => {
        state.sending = false
      })
      .addCase(sendQuickEmail.rejected, (state, action) => {
        state.sending = false
        state.error = action.payload ?? "Failed to send quick email."
      })

    // sendTestEmail
    builder
      .addCase(sendTestEmail.pending, (state) => {
        state.sending = true
      })
      .addCase(sendTestEmail.fulfilled, (state) => {
        state.sending = false
      })
      .addCase(sendTestEmail.rejected, (state, action) => {
        state.sending = false
        state.error = action.payload ?? "Failed to send test email."
      })

    // fetchMarketingStats
    builder
      .addCase(fetchMarketingStats.fulfilled, (state, action) => {
        state.marketingStats = action.payload
      })

    // unsubscribeEmail
    builder
      .addCase(unsubscribeEmail.pending, (state) => {
        state.unsubscribing = true
        state.error = null
      })
      .addCase(unsubscribeEmail.fulfilled, (state, action) => {
        state.unsubscribing = false
        // Update the subscription status in the local state
        const subscription = state.subscriptions.find(s => s.email === action.payload.email)
        if (subscription) {
          subscription.isActive = false
        }
      })
      .addCase(unsubscribeEmail.rejected, (state, action) => {
        state.unsubscribing = false
        state.error = action.payload ?? "Failed to unsubscribe email."
      })
  },
})

export const { clearNewsletterError } = newsletterSlice.actions
export default newsletterSlice.reducer
