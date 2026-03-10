import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import { TEAM_ENDPOINTS } from "@/lib/api/endpoints"
import { refreshAccessToken } from "./authSlice"

// ─── Types ───────────────────────────────────────────────
export type TeamMember = {
  _id: string
  name: string
  position: string
  tagline: string
  yearsOfExperience: number
  email: string
  contactNumber?: { countryCode: string; number: string }
  whatsappNumber?: { countryCode: string; number: string }
  tags: string[]
  bio: string
  image?: { url: string; publicId: string; alt?: string }
  isActive: boolean
  isFeatured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type TeamStats = {
  total: number
  active: number
  featured: number
  positionStats: { position: string; count: number }[]
}

type TeamState = {
  members: TeamMember[]
  stats: TeamStats | null
  loading: boolean
  error: string | null
  creating: boolean
  updating: boolean
}

// ─── Helper ──────────────────────────────────────────────
const getAccessToken = () => Cookies.get("access_token") || null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withRefresh = async (dispatch: any, getState: any, request: (token: string | null) => Promise<Response>) => {
  const state = getState() as { auth: { accessToken: string | null } }
  let accessToken = state.auth.accessToken || getAccessToken()
  let res = await request(accessToken)

  if (res.status === 401) {
    const refreshResult = await dispatch(refreshAccessToken())
    if (refreshAccessToken.fulfilled.match(refreshResult)) {
      accessToken = refreshResult.payload.accessToken
      res = await request(accessToken)
    } else {
      throw new Error("Session expired. Please log in again.")
    }
  }
  return res
}

// ─── Async Thunks ────────────────────────────────────────

/** GET /api/team?page=1&limit=100 */
export const fetchTeamMembers = createAsyncThunk<
  TeamMember[],
  void,
  { rejectValue: string }
>("team/fetchMembers", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const res = await withRefresh(dispatch, getState, (token) =>
      fetch(`${TEAM_ENDPOINTS.LIST}?page=1&limit=100`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    )
    const json = await res.json()
    if (!res.ok || !json.success) return rejectWithValue(json.message ?? "Failed to fetch team members.")
    return json.data.teamMembers
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Network error. Could not fetch team members.")
  }
})

/** GET /api/team/stats */
export const fetchTeamStats = createAsyncThunk<
  TeamStats,
  void,
  { rejectValue: string }
>("team/fetchStats", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const res = await withRefresh(dispatch, getState, (token) =>
      fetch(TEAM_ENDPOINTS.STATS, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    )
    const json = await res.json()
    if (!res.ok || !json.success) return rejectWithValue(json.message ?? "Failed to fetch stats.")
    return json.data
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Network error. Could not fetch stats.")
  }
})

/** POST /api/team (FormData) */
export const createTeamMember = createAsyncThunk<
  TeamMember,
  FormData,
  { rejectValue: string }
>("team/createMember", async (formData, { getState, dispatch, rejectWithValue }) => {
  try {
    const res = await withRefresh(dispatch, getState, (token) =>
      fetch(TEAM_ENDPOINTS.CREATE, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      })
    )
    const json = await res.json()
    if (!res.ok || !json.success) return rejectWithValue(json.message ?? "Failed to create team member.")
    return json.data
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Network error. Could not create team member.")
  }
})

/** PUT /api/team/:id (FormData) */
export const updateTeamMember = createAsyncThunk<
  TeamMember,
  { id: string; formData: FormData },
  { rejectValue: string }
>("team/updateMember", async ({ id, formData }, { getState, dispatch, rejectWithValue }) => {
  try {
    const res = await withRefresh(dispatch, getState, (token) =>
      fetch(TEAM_ENDPOINTS.UPDATE(id), {
        method: "PUT",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      })
    )
    const json = await res.json()
    if (!res.ok || !json.success) return rejectWithValue(json.message ?? "Failed to update team member.")
    return json.data
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Network error. Could not update team member.")
  }
})

/** DELETE /api/team/:id */
export const deleteTeamMember = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("team/deleteMember", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const res = await withRefresh(dispatch, getState, (token) =>
      fetch(TEAM_ENDPOINTS.DELETE(id), {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
    )
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to delete team member.")
    }
    return id
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Network error. Could not delete team member.")
  }
})

/** POST /api/team/bulk-delete */
export const bulkDeleteTeamMembers = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>("team/bulkDelete", async (ids, { getState, dispatch, rejectWithValue }) => {
  try {
    const res = await withRefresh(dispatch, getState, (token) =>
      fetch(TEAM_ENDPOINTS.BULK_DELETE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids }),
      })
    )
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to bulk delete.")
    }
    return ids
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Network error. Could not bulk delete.")
  }
})

/** PATCH /api/team/:id/toggle-status */
export const toggleTeamMemberStatus = createAsyncThunk<
  TeamMember,
  string,
  { rejectValue: string }
>("team/toggleStatus", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const res = await withRefresh(dispatch, getState, (token) =>
      fetch(TEAM_ENDPOINTS.TOGGLE_STATUS(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    )
    const json = await res.json()
    if (!res.ok || !json.success) return rejectWithValue(json.message ?? "Failed to toggle status.")
    return json.data
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Network error. Could not toggle status.")
  }
})

// ─── Initial State ───────────────────────────────────────
const initialState: TeamState = {
  members: [],
  stats: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
}

// ─── Slice ───────────────────────────────────────────────
const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    clearTeamError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => { state.loading = false; state.members = action.payload })
      .addCase(fetchTeamMembers.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? "Failed." })

    builder
      .addCase(fetchTeamStats.fulfilled, (state, action) => { state.stats = action.payload })

    builder
      .addCase(createTeamMember.pending, (state) => { 
        state.creating = true; 
        state.error = null 
      })
      .addCase(createTeamMember.fulfilled, (state, action) => { 
        state.creating = false; 
        state.members.unshift(action.payload) 
      })
      .addCase(createTeamMember.rejected, (state, action) => { 
        state.creating = false; 
        state.error = action.payload ?? "Failed." 
      })

    builder
      .addCase(updateTeamMember.pending, (state) => { 
        state.updating = true; 
        state.error = null 
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        state.updating = false
        const idx = state.members.findIndex((m) => m._id === action.payload._id)
        if (idx !== -1) state.members[idx] = action.payload
      })
      .addCase(updateTeamMember.rejected, (state, action) => { 
        state.updating = false; 
        state.error = action.payload ?? "Failed." 
      })

    builder
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m._id !== action.payload)
      })

    builder
      .addCase(bulkDeleteTeamMembers.fulfilled, (state, action) => {
        const deleted = new Set(action.payload)
        state.members = state.members.filter((m) => !deleted.has(m._id))
      })

    builder
      .addCase(toggleTeamMemberStatus.pending, (state, action) => {
        // Optimistic update - toggle status immediately
        const idx = state.members.findIndex((m) => m._id === action.meta.arg)
        if (idx !== -1) {
          state.members[idx] = { ...state.members[idx], isActive: !state.members[idx].isActive }
        }
      })
      .addCase(toggleTeamMemberStatus.fulfilled, (state, action) => {
        // Update with actual response from server
        const idx = state.members.findIndex((m) => m._id === action.payload._id)
        if (idx !== -1) state.members[idx] = action.payload
      })
      .addCase(toggleTeamMemberStatus.rejected, (state, action) => {
        // Revert optimistic update on error
        const idx = state.members.findIndex((m) => m._id === action.meta.arg)
        if (idx !== -1) {
          state.members[idx] = { ...state.members[idx], isActive: !state.members[idx].isActive }
        }
        state.error = action.payload ?? "Failed to toggle status."
      })
  },
})

export const { clearTeamError } = teamSlice.actions
export default teamSlice.reducer
