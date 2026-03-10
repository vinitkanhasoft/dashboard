import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import { TESTIMONIAL_ENDPOINTS } from "@/lib/api/endpoints"
import { refreshAccessToken } from "./authSlice"

// ─── Types ───────────────────────────────────────────────
export type Testimonial = {
  _id: string
  userName: string
  userType: string
  location: string
  description: string
  rating: number
  carName: string
  isApproved: boolean
  isFeatured: boolean
  isVisible: boolean
  userProfileImage?: {
    url: string
    publicId: string
    alt: string
  }
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

type TestimonialState = {
  testimonials: Testimonial[]
  loading: boolean
  searching: boolean
  error: string | null
  creating: boolean
  updating: boolean
}

type TestimonialListResponse = {
  success: boolean
  message: string
  data: {
    testimonials: Testimonial[]
    pagination?: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

type TestimonialSingleResponse = {
  success: boolean
  message: string
  data: Testimonial
}

// ─── Helper ──────────────────────────────────────────────
const getAccessToken = () => Cookies.get("access_token") || null

// ─── Async Thunks ────────────────────────────────────────

/** GET /api/testimonials */
export const fetchTestimonials = createAsyncThunk<
  Testimonial[],
  void,
  { rejectValue: string }
>("testimonial/fetchTestimonials", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(TESTIMONIAL_ENDPOINTS.LIST, {
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
        res = await fetch(TESTIMONIAL_ENDPOINTS.LIST, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: TestimonialListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch testimonials.")
    }
    return json.data.testimonials
  } catch {
    return rejectWithValue("Network error. Could not fetch testimonials.")
  }
})

/** POST /api/testimonials (FormData with profileImage) */
export const createTestimonial = createAsyncThunk<
  Testimonial,
  FormData,
  { rejectValue: string }
>("testimonial/createTestimonial", async (formData, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(TESTIMONIAL_ENDPOINTS.CREATE, {
      method: "POST",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(TESTIMONIAL_ENDPOINTS.CREATE, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: TestimonialSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to create testimonial.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not create testimonial.")
  }
})

/** PUT /api/testimonials/:id (FormData with optional profileImage) */
export const updateTestimonial = createAsyncThunk<
  Testimonial,
  { id: string; formData: FormData },
  { rejectValue: string }
>("testimonial/updateTestimonial", async ({ id, formData }, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(TESTIMONIAL_ENDPOINTS.UPDATE(id), {
      method: "PUT",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(TESTIMONIAL_ENDPOINTS.UPDATE(id), {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: TestimonialSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to update testimonial.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not update testimonial.")
  }
})

/** DELETE /api/testimonials/:id */
export const deleteTestimonial = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("testimonial/deleteTestimonial", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(TESTIMONIAL_ENDPOINTS.DELETE(id), {
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
        res = await fetch(TESTIMONIAL_ENDPOINTS.DELETE(id), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to delete testimonial.")
    }
    return id
  } catch {
    return rejectWithValue("Network error. Could not delete testimonial.")
  }
})

/** BULK DELETE: POST /api/testimonials/bulk-delete */
export const bulkDeleteTestimonials = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>("testimonial/bulkDeleteTestimonials", async (testimonialIds, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(TESTIMONIAL_ENDPOINTS.BULK_DELETE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ testimonialIds }),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(TESTIMONIAL_ENDPOINTS.BULK_DELETE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ testimonialIds }),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to bulk delete testimonials.")
    }
    return testimonialIds
  } catch {
    return rejectWithValue("Network error. Could not bulk delete testimonials.")
  }
})

/** PATCH /api/testimonials/:id/approve */
export const approveTestimonial = createAsyncThunk<
  Testimonial,
  string,
  { rejectValue: string }
>("testimonial/approveTestimonial", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(TESTIMONIAL_ENDPOINTS.APPROVE(id), {
      method: "PATCH",
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
        res = await fetch(TESTIMONIAL_ENDPOINTS.APPROVE(id), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: TestimonialSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to approve testimonial.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not approve testimonial.")
  }
})

/** GET /api/testimonials?search=... (search via query params) */
export const searchTestimonials = createAsyncThunk<
  Testimonial[],
  {
    search: string
    userType?: string
    isApproved?: string
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  },
  { rejectValue: string }
>("testimonial/searchTestimonials", async (params, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()

    const url = new URL(TESTIMONIAL_ENDPOINTS.LIST)
    url.searchParams.set("search", params.search)
    if (params.userType) url.searchParams.set("userType", params.userType)
    if (params.isApproved) url.searchParams.set("isApproved", params.isApproved)
    if (params.sortBy) url.searchParams.set("sortBy", params.sortBy)
    if (params.sortOrder) url.searchParams.set("sortOrder", params.sortOrder)
    if (params.page) url.searchParams.set("page", String(params.page))
    if (params.limit) url.searchParams.set("limit", String(params.limit))

    let res = await fetch(url.toString(), {
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
        res = await fetch(url.toString(), {
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
      return rejectWithValue(json.message ?? "Failed to search testimonials.")
    }
    return json.data.testimonials
  } catch {
    return rejectWithValue("Network error. Could not search testimonials.")
  }
})

// ─── Initial State ───────────────────────────────────────
const initialState: TestimonialState = {
  testimonials: [],
  loading: false,
  searching: false,
  error: null,
  creating: false,
  updating: false,
}

// ─── Slice ───────────────────────────────────────────────
const testimonialSlice = createSlice({
  name: "testimonial",
  initialState,
  reducers: {
    clearTestimonialError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchTestimonials
    builder
      .addCase(fetchTestimonials.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false
        state.testimonials = action.payload
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to fetch testimonials."
      })

    // createTestimonial
    builder
      .addCase(createTestimonial.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createTestimonial.fulfilled, (state, action) => {
        state.creating = false
        state.testimonials.unshift(action.payload)
      })
      .addCase(createTestimonial.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? "Failed to create testimonial."
      })

    // updateTestimonial
    builder
      .addCase(updateTestimonial.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        state.updating = false
        if (!action.payload || !action.payload._id) return
        state.testimonials = state.testimonials.filter(t => t && t._id)
        const idx = state.testimonials.findIndex((t) => t._id === action.payload._id)
        if (idx !== -1) state.testimonials[idx] = action.payload
      })
      .addCase(updateTestimonial.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload ?? "Failed to update testimonial."
      })

    // deleteTestimonial
    builder
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.testimonials = state.testimonials.filter((t) => t._id !== action.payload)
      })
      .addCase(deleteTestimonial.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete testimonial."
      })

    // bulkDeleteTestimonials
    builder
      .addCase(bulkDeleteTestimonials.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload)
        state.testimonials = state.testimonials.filter((t) => !deletedIds.has(t._id))
      })
      .addCase(bulkDeleteTestimonials.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to bulk delete testimonials."
      })

    // approveTestimonial
    builder
      .addCase(approveTestimonial.fulfilled, (state, action) => {
        if (!action.payload || !action.payload._id) return
        const idx = state.testimonials.findIndex((t) => t._id === action.payload._id)
        if (idx !== -1) state.testimonials[idx] = action.payload
      })
      .addCase(approveTestimonial.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to approve testimonial."
      })

    // searchTestimonials
    builder
      .addCase(searchTestimonials.pending, (state) => {
        state.searching = true
        state.error = null
      })
      .addCase(searchTestimonials.fulfilled, (state, action) => {
        state.searching = false
        state.testimonials = action.payload
      })
      .addCase(searchTestimonials.rejected, (state, action) => {
        state.searching = false
        state.error = action.payload ?? "Failed to search testimonials."
      })
  },
})

export const { clearTestimonialError } = testimonialSlice.actions
export default testimonialSlice.reducer
