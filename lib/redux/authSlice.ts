import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints"

// ─── Types ───────────────────────────────────────────────
type User = {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  phoneCountryCode?: string
  address?: string
  profileImage?: string
  twoFactorEnabled: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  joinDate: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  sessionId: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  loading: boolean
  error: string | null
  profileUpdating: boolean
  profileUpdateError: string | null
  sessions: Session[]
  sessionsLoading: boolean
  imageUploading: boolean
}

// API response shapes
type LoginResponse = {
  success: boolean
  message: string
  data: {
    user: User
    accessToken: string
    refreshToken: string
    sessionId: string
  }
}

type ProfileResponse = {
  success: boolean
  message: string
  data: {
    user: User
  }
}

type Session = {
  sessionId: string
  loginDate: string
  loginTime: string
  device: string
  ip: string
  browser: string
  os: string
  location: string
  lastActive: string
  active: boolean
  _id: string
}

type SessionsResponse = {
  success: boolean
  message: string
  data: {
    sessions: Session[]
  }
}

type RefreshTokenResponse = {
  success: boolean
  message: string
  data: {
    accessToken: string
  }
}

// ─── Cookie config ───────────────────────────────────────
const COOKIE_BASE: Cookies.CookieAttributes = {
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

// Access token cookie — short-lived (1 day buffer, JWT itself expires in 5 min)
const ACCESS_COOKIE_OPTIONS: Cookies.CookieAttributes = {
  ...COOKIE_BASE,
  expires: 1,
}

// Refresh token cookie — matches backend expiry
const REFRESH_COOKIE_OPTIONS: Cookies.CookieAttributes = {
  ...COOKIE_BASE,
  expires: 7,
}

// General cookie (user data, session id)
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  ...COOKIE_BASE,
  expires: 7,
}

// ─── Async Thunks ────────────────────────────────────────

/** POST /api/auth/login */
export const loginUser = createAsyncThunk<
  LoginResponse["data"],
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    const json: LoginResponse = await res.json()

    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Invalid email or password.")
    }

    return json.data
  } catch {
    return rejectWithValue("Network error. Please try again.")
  }
})

/** GET /api/auth/profile */
export const fetchProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string; state: { auth: AuthState } }
>("auth/fetchProfile", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    let { accessToken } = getState().auth
    let res = await fetch(AUTH_ENDPOINTS.PROFILE, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    // Auto-refresh on 401
    if (res.status === 401) {
      const refreshResult = await dispatch(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(AUTH_ENDPOINTS.PROFILE, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: ProfileResponse = await res.json()

    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch profile.")
    }

    return json.data.user
  } catch {
    return rejectWithValue("Network error. Could not fetch profile.")
  }
})

/** PUT /api/auth/profile */
export const updateProfile = createAsyncThunk<
  User,
  Partial<Pick<User, "firstName" | "lastName" | "email" | "phone" | "phoneCountryCode" | "address" | "profileImage">>,
  { rejectValue: string; state: { auth: AuthState } }
>("auth/updateProfile", async (updates, { getState, dispatch, rejectWithValue }) => {
  try {
    let { accessToken } = getState().auth
    let res = await fetch(AUTH_ENDPOINTS.PROFILE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(updates),
    })

    // Auto-refresh on 401
    if (res.status === 401) {
      const refreshResult = await dispatch(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(AUTH_ENDPOINTS.PROFILE, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: ProfileResponse = await res.json()

    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to update profile.")
    }

    return json.data.user
  } catch {
    return rejectWithValue("Network error. Could not update profile.")
  }
})

/** POST /api/auth/refresh-token */
export const refreshAccessToken = createAsyncThunk<
  { accessToken: string },
  void,
  { rejectValue: string; state: { auth: AuthState } }
>("auth/refreshAccessToken", async (_, { getState, rejectWithValue }) => {
  try {
    const { refreshToken } = getState().auth
    if (!refreshToken) {
      return rejectWithValue("No refresh token available.")
    }

    const res = await fetch(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    const json: RefreshTokenResponse = await res.json()

    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to refresh token.")
    }

    return { accessToken: json.data.accessToken }
  } catch {
    return rejectWithValue("Network error. Could not refresh token.")
  }
})

/** GET /api/auth/sessions */
export const fetchSessions = createAsyncThunk<
  Session[],
  void,
  { rejectValue: string; state: { auth: AuthState } }
>("auth/fetchSessions", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    let { accessToken } = getState().auth
    let res = await fetch(AUTH_ENDPOINTS.SESSIONS, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    // Auto-refresh on 401
    if (res.status === 401) {
      const refreshResult = await dispatch(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(AUTH_ENDPOINTS.SESSIONS, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: SessionsResponse = await res.json()

    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch sessions.")
    }

    return json.data.sessions
  } catch {
    return rejectWithValue("Network error. Could not fetch sessions.")
  }
})

/** POST /api/auth/upload-profile-image */
export const uploadProfileImage = createAsyncThunk<
  User,
  File,
  { rejectValue: string; state: { auth: AuthState } }
>("auth/uploadProfileImage", async (file, { getState, dispatch, rejectWithValue }) => {
  try {
    let { accessToken } = getState().auth
    const formData = new FormData()
    formData.append("profileImage", file)

    let res = await fetch(AUTH_ENDPOINTS.UPLOAD_PROFILE_IMAGE, {
      method: "POST",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    })

    // Auto-refresh on 401
    if (res.status === 401) {
      const refreshResult = await dispatch(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(AUTH_ENDPOINTS.UPLOAD_PROFILE_IMAGE, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: ProfileResponse = await res.json()

    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to upload profile image.")
    }

    return json.data.user
  } catch {
    return rejectWithValue("Network error. Could not upload image.")
  }
})

// ─── Initial state ───────────────────────────────────────

/** POST /api/auth/logout */
export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: { auth: AuthState } }
>("auth/logoutUser", async (_, { getState, rejectWithValue }) => {
  try {
    const { accessToken, refreshToken } = getState().auth
    await fetch(AUTH_ENDPOINTS.LOGOUT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    })
    // Always clear local state regardless of API response
  } catch {
    return rejectWithValue("Network error during logout.")
  }
})

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  sessionId: null,
  isAuthenticated: false,
  isHydrated: false,
  loading: false,
  error: null,
  profileUpdating: false,
  profileUpdateError: null,
  sessions: [],
  sessionsLoading: false,
  imageUploading: false,
}

// ─── Slice ───────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.sessionId = null
      state.isAuthenticated = false
      state.error = null
      Cookies.remove("access_token", { path: "/" })
      Cookies.remove("refresh_token", { path: "/" })
      Cookies.remove("session_id", { path: "/" })
      Cookies.remove("auth_user", { path: "/" })
    },
    hydrate(state) {
      const accessToken = Cookies.get("access_token")
      const refreshToken = Cookies.get("refresh_token")
      const sessionId = Cookies.get("session_id")
      const userStr = Cookies.get("auth_user")

      if (refreshToken) {
        // We have a refresh token — restore session
        state.refreshToken = refreshToken
        state.sessionId = sessionId ?? null

        if (accessToken) {
          state.accessToken = accessToken
        }

        if (userStr) {
          try {
            state.user = JSON.parse(userStr)
          } catch {
            Cookies.remove("auth_user", { path: "/" })
          }
        }

        // Mark authenticated if we have refresh token (access token can be refreshed)
        state.isAuthenticated = true
      } else {
        // No refresh token — clear everything
        Cookies.remove("access_token", { path: "/" })
        Cookies.remove("refresh_token", { path: "/" })
        Cookies.remove("session_id", { path: "/" })
        Cookies.remove("auth_user", { path: "/" })
      }

      state.isHydrated = true
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.sessionId = action.payload.sessionId
        state.isAuthenticated = true
        state.error = null
        // Persist to cookies
        Cookies.set("access_token", action.payload.accessToken, ACCESS_COOKIE_OPTIONS)
        Cookies.set("refresh_token", action.payload.refreshToken, REFRESH_COOKIE_OPTIONS)
        Cookies.set("session_id", action.payload.sessionId, COOKIE_OPTIONS)
        Cookies.set(
          "auth_user",
          JSON.stringify(action.payload.user),
          COOKIE_OPTIONS
        )
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Login failed."
      })
      // ── fetchProfile ──
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload
        Cookies.set("auth_user", JSON.stringify(action.payload), COOKIE_OPTIONS)
      })
      // ── updateProfile ──
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdating = true
        state.profileUpdateError = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileUpdating = false
        state.user = action.payload
        state.profileUpdateError = null
        Cookies.set("auth_user", JSON.stringify(action.payload), COOKIE_OPTIONS)
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdating = false
        state.profileUpdateError = action.payload ?? "Update failed."
      })
      // ── refreshAccessToken ──
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        Cookies.set("access_token", action.payload.accessToken, ACCESS_COOKIE_OPTIONS)
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Refresh failed — force logout
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.sessionId = null
        state.isAuthenticated = false
        Cookies.remove("access_token", { path: "/" })
        Cookies.remove("refresh_token", { path: "/" })
        Cookies.remove("session_id", { path: "/" })
        Cookies.remove("auth_user", { path: "/" })
      })
      // ── fetchSessions ──
      .addCase(fetchSessions.pending, (state) => {
        state.sessionsLoading = true
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessionsLoading = false
        state.sessions = action.payload
      })
      .addCase(fetchSessions.rejected, (state) => {
        state.sessionsLoading = false
      })
      // ── uploadProfileImage ──
      .addCase(uploadProfileImage.pending, (state) => {
        state.imageUploading = true
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.imageUploading = false
        state.user = action.payload
        Cookies.set("auth_user", JSON.stringify(action.payload), COOKIE_OPTIONS)
      })
      .addCase(uploadProfileImage.rejected, (state) => {
        state.imageUploading = false
      })
      // ── logoutUser ──
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.sessionId = null
        state.isAuthenticated = false
        state.error = null
        Cookies.remove("access_token", { path: "/" })
        Cookies.remove("refresh_token", { path: "/" })
        Cookies.remove("session_id", { path: "/" })
        Cookies.remove("auth_user", { path: "/" })
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear local state even if API call failed
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.sessionId = null
        state.isAuthenticated = false
        state.error = null
        Cookies.remove("access_token", { path: "/" })
        Cookies.remove("refresh_token", { path: "/" })
        Cookies.remove("session_id", { path: "/" })
        Cookies.remove("auth_user", { path: "/" })
      })
  },
})

export type { User, Session }
export const { logout, hydrate, clearError } = authSlice.actions
export default authSlice.reducer
