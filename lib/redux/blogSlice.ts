import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import { BLOG_ENDPOINTS } from "@/lib/api/endpoints"
import { refreshAccessToken } from "./authSlice"

// ─── Types ───────────────────────────────────────────────
export type Blog = {
  _id: string
  title: string
  slug: string
  tagline: string
  content: string
  postDate: string
  status: "draft" | "published" | "archived"
  isFeatured: boolean
  category: string
  tags: string[]
  views: number
  readingTime?: number
  featuredImage?: {
    url: string
    publicId: string
  }
  createdAt: string
  updatedAt: string
}

type BlogState = {
  blogs: Blog[]
  loading: boolean
  searching: boolean
  error: string | null
  creating: boolean
  updating: boolean
}

type BlogListResponse = {
  success: boolean
  message: string
  data: {
    blogs: Blog[]
    pagination?: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

type BlogSingleResponse = {
  success: boolean
  message: string
  data: Blog
}

type BlogErrorResponse = {
  success: boolean
  message: string
  errors?: { msg: string; path?: string }[]
}

// ─── Helper ──────────────────────────────────────────────
const getAccessToken = () => Cookies.get("access_token") || null

const parseErrorResponse = (json: BlogErrorResponse): string => {
  if (json.errors && json.errors.length > 0) {
    return json.errors.map((e) => e.msg).join(", ")
  }
  return json.message ?? "Something went wrong."
}

// ─── Async Thunks ────────────────────────────────────────

/** GET /api/blogs */
export const fetchBlogs = createAsyncThunk<
  Blog[],
  {
    page?: number
    limit?: number
    category?: string
    status?: string
    isFeatured?: boolean
    sortBy?: string
    sortOrder?: string
    author?: string
  } | void,
  { rejectValue: string }
>("blog/fetchBlogs", async (params, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()

    // Build URL with query parameters
    const url = new URL(BLOG_ENDPOINTS.LIST)
    
    if (params) {
      if (params.page) url.searchParams.set("page", String(params.page))
      if (params.limit) url.searchParams.set("limit", String(params.limit))
      if (params.category) url.searchParams.set("category", params.category)
      if (params.status) url.searchParams.set("status", params.status)
      if (params.isFeatured !== undefined) url.searchParams.set("isFeatured", String(params.isFeatured))
      if (params.sortBy) url.searchParams.set("sortBy", params.sortBy)
      if (params.sortOrder) url.searchParams.set("sortOrder", params.sortOrder)
      if (params.author) url.searchParams.set("author", params.author)
    }

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

    const json: BlogListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch blogs.")
    }
    return json.data.blogs
  } catch {
    return rejectWithValue("Network error. Could not fetch blogs.")
  }
})

/** POST /api/blogs (FormData with image) */
export const createBlog = createAsyncThunk<
  Blog,
  FormData,
  { rejectValue: string }
>("blog/createBlog", async (formData, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(BLOG_ENDPOINTS.CREATE, {
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
        res = await fetch(BLOG_ENDPOINTS.CREATE, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(parseErrorResponse(json))
    }
    return (json as BlogSingleResponse).data
  } catch {
    return rejectWithValue("Network error. Could not create blog.")
  }
})

/** PUT /api/blogs/:id */
export const updateBlog = createAsyncThunk<
  Blog,
  { id: string; formData: FormData },
  { rejectValue: string }
>("blog/updateBlog", async ({ id, formData }, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(BLOG_ENDPOINTS.UPDATE(id), {
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
        res = await fetch(BLOG_ENDPOINTS.UPDATE(id), {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(parseErrorResponse(json))
    }
    return (json as BlogSingleResponse).data
  } catch {
    return rejectWithValue("Network error. Could not update blog.")
  }
})

/** DELETE /api/blogs/:id */
export const deleteBlog = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("blog/deleteBlog", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(BLOG_ENDPOINTS.DELETE(id), {
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
        res = await fetch(BLOG_ENDPOINTS.DELETE(id), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to delete blog.")
    }
    return id
  } catch {
    return rejectWithValue("Network error. Could not delete blog.")
  }
})

/** BULK DELETE: POST /api/blogs/bulk-delete */
export const bulkDeleteBlogs = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>("blog/bulkDeleteBlogs", async (ids, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(BLOG_ENDPOINTS.BULK_DELETE, {
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
        res = await fetch(BLOG_ENDPOINTS.BULK_DELETE, {
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
      return rejectWithValue(json.message ?? "Failed to bulk delete blogs.")
    }
    return ids
  } catch {
    return rejectWithValue("Network error. Could not bulk delete blogs.")
  }
})

/** GET /api/blogs/search?q=... */
export const searchBlogs = createAsyncThunk<
  Blog[],
  {
    q: string
    category?: string
    status?: string
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  },
  { rejectValue: string }
>("blog/searchBlogs", async (params, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()

    const url = new URL(BLOG_ENDPOINTS.SEARCH)
    url.searchParams.set("q", params.q)
    if (params.category) url.searchParams.set("category", params.category)
    if (params.status) url.searchParams.set("status", params.status)
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
      return rejectWithValue(json.message ?? "Failed to search blogs.")
    }
    return json.data.blogs
  } catch {
    return rejectWithValue("Network error. Could not search blogs.")
  }
})

// ─── Initial State ───────────────────────────────────────
const initialState: BlogState = {
  blogs: [],
  loading: false,
  searching: false,
  error: null,
  creating: false,
  updating: false,
}

// ─── Slice ───────────────────────────────────────────────
const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchBlogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false
        state.blogs = action.payload
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to fetch blogs."
      })

    // createBlog
    builder
      .addCase(createBlog.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.creating = false
        state.blogs.unshift(action.payload)
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? "Failed to create blog."
      })

    // updateBlog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.updating = false
        if (!action.payload || !action.payload._id) return
        state.blogs = state.blogs.filter(b => b && b._id)
        const idx = state.blogs.findIndex((b) => b._id === action.payload._id)
        if (idx !== -1) state.blogs[idx] = action.payload
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload ?? "Failed to update blog."
      })

    // deleteBlog
    builder
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b._id !== action.payload)
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete blog."
      })

    // bulkDeleteBlogs
    builder
      .addCase(bulkDeleteBlogs.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload)
        state.blogs = state.blogs.filter((b) => !deletedIds.has(b._id))
      })
      .addCase(bulkDeleteBlogs.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to bulk delete blogs."
      })

    // searchBlogs
    builder
      .addCase(searchBlogs.pending, (state) => {
        state.searching = true
        state.error = null
      })
      .addCase(searchBlogs.fulfilled, (state, action) => {
        state.searching = false
        state.blogs = action.payload
      })
      .addCase(searchBlogs.rejected, (state, action) => {
        state.searching = false
        state.error = action.payload ?? "Failed to search blogs."
      })
  },
})

export const { clearBlogError } = blogSlice.actions
export default blogSlice.reducer
