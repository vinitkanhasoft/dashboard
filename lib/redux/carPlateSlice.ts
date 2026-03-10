import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import { CAR_PLATE_ENDPOINTS } from "@/lib/api/endpoints"
import { refreshAccessToken } from "./authSlice"

// ─── Types ───────────────────────────────────────────────
export type CarPlate = {
  _id: string
  plateNumber: string
  state: string
  district: string
  rtoCode: string
  vehicleType: string
  registrationDate?: string
  ownerName?: string
  isValid: boolean
  isValidFormat?: boolean
  createdAt: string
  updatedAt: string
}

type CarPlateState = {
  carPlates: CarPlate[]
  loading: boolean
  error: string | null
  creating: boolean
  updating: boolean
  validating: boolean
  validationResult: {
    plateNumber: string
    isValidFormat: boolean
    rtoCode: string
    state?: string
  } | null
}

type CarPlateListResponse = {
  success: boolean
  message: string
  data: {
    carPlates: CarPlate[]
    pagination?: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

type CarPlateSingleResponse = {
  success: boolean
  message: string
  data: CarPlate
}

// ─── Helper ──────────────────────────────────────────────
const getAccessToken = () => Cookies.get("access_token") || null

// ─── Async Thunks ────────────────────────────────────────

/** POST /api/car-plates/validate */
export const validateCarPlate = createAsyncThunk<
  { plateNumber: string; isValidFormat: boolean; rtoCode: string; state?: string },
  string,
  { rejectValue: string }
>("carPlate/validateCarPlate", async (plateNumber, { rejectWithValue }) => {
  try {
    const res = await fetch(CAR_PLATE_ENDPOINTS.VALIDATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plateNumber }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to validate plate number.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not validate plate number.")
  }
})

/** GET /api/car-plates */
export const fetchCarPlates = createAsyncThunk<
  CarPlate[],
  void,
  { rejectValue: string }
>("carPlate/fetchCarPlates", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    const url = `${CAR_PLATE_ENDPOINTS.LIST}?page=1&limit=100`
    let res = await fetch(url, {
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
        res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: CarPlateListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch car plates.")
    }
    return json.data.carPlates
  } catch {
    return rejectWithValue("Network error. Could not fetch car plates.")
  }
})

/** POST /api/car-plates */
export const createCarPlate = createAsyncThunk<
  CarPlate,
  {
    plateNumber: string
    state: string
    district: string
    rtoCode: string
    vehicleType: string
    registrationDate?: string
    ownerName?: string
    isValid?: boolean
  },
  { rejectValue: string }
>("carPlate/createCarPlate", async (data, { getState, dispatch, rejectWithValue }) => {
  try {
    const st = getState() as { auth: { accessToken: string | null } }
    let accessToken = st.auth.accessToken || getAccessToken()
    let res = await fetch(CAR_PLATE_ENDPOINTS.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(CAR_PLATE_ENDPOINTS.CREATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: CarPlateSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to create car plate.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not create car plate.")
  }
})

/** PUT /api/car-plates/:id */
export const updateCarPlate = createAsyncThunk<
  CarPlate,
  { id: string; data: Record<string, unknown> },
  { rejectValue: string }
>("carPlate/updateCarPlate", async ({ id, data }, { getState, dispatch, rejectWithValue }) => {
  try {
    const st = getState() as { auth: { accessToken: string | null } }
    let accessToken = st.auth.accessToken || getAccessToken()
    let res = await fetch(CAR_PLATE_ENDPOINTS.UPDATE(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(CAR_PLATE_ENDPOINTS.UPDATE(id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: CarPlateSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to update car plate.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not update car plate.")
  }
})

/** DELETE /api/car-plates/:id */
export const deleteCarPlate = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("carPlate/deleteCarPlate", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const st = getState() as { auth: { accessToken: string | null } }
    let accessToken = st.auth.accessToken || getAccessToken()
    let res = await fetch(CAR_PLATE_ENDPOINTS.DELETE(id), {
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
        res = await fetch(CAR_PLATE_ENDPOINTS.DELETE(id), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to delete car plate.")
    }
    return id
  } catch {
    return rejectWithValue("Network error. Could not delete car plate.")
  }
})

/** GET /api/car-plates/rto/:rtoCode */
export const fetchCarPlatesByRto = createAsyncThunk<
  CarPlate[],
  string,
  { rejectValue: string }
>("carPlate/fetchCarPlatesByRto", async (rtoCode, { getState, dispatch, rejectWithValue }) => {
  try {
    const st = getState() as { auth: { accessToken: string | null } }
    let accessToken = st.auth.accessToken || getAccessToken()
    const url = `${CAR_PLATE_ENDPOINTS.BY_RTO(rtoCode)}?page=1&limit=100`
    let res = await fetch(url, {
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
        res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: CarPlateListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch car plates by RTO.")
    }
    return json.data.carPlates
  } catch {
    return rejectWithValue("Network error. Could not fetch car plates by RTO.")
  }
})

// ─── Initial State ───────────────────────────────────────
const initialState: CarPlateState = {
  carPlates: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  validating: false,
  validationResult: null,
}

// ─── Slice ───────────────────────────────────────────────
const carPlateSlice = createSlice({
  name: "carPlate",
  initialState,
  reducers: {
    clearCarPlateError(state) {
      state.error = null
    },
    clearValidationResult(state) {
      state.validationResult = null
    },
  },
  extraReducers: (builder) => {
    // validateCarPlate
    builder
      .addCase(validateCarPlate.pending, (state) => {
        state.validating = true
        state.error = null
      })
      .addCase(validateCarPlate.fulfilled, (state, action) => {
        state.validating = false
        state.validationResult = action.payload
      })
      .addCase(validateCarPlate.rejected, (state, action) => {
        state.validating = false
        state.error = action.payload ?? "Failed to validate."
      })

    // fetchCarPlates
    builder
      .addCase(fetchCarPlates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCarPlates.fulfilled, (state, action) => {
        state.loading = false
        state.carPlates = action.payload
      })
      .addCase(fetchCarPlates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to fetch car plates."
      })

    // createCarPlate
    builder
      .addCase(createCarPlate.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createCarPlate.fulfilled, (state, action) => {
        state.creating = false
        state.carPlates.unshift(action.payload)
      })
      .addCase(createCarPlate.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? "Failed to create car plate."
      })

    // updateCarPlate
    builder
      .addCase(updateCarPlate.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateCarPlate.fulfilled, (state, action) => {
        state.updating = false
        const idx = state.carPlates.findIndex((p) => p._id === action.payload._id)
        if (idx !== -1) state.carPlates[idx] = action.payload
      })
      .addCase(updateCarPlate.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload ?? "Failed to update car plate."
      })

    // deleteCarPlate
    builder
      .addCase(deleteCarPlate.fulfilled, (state, action) => {
        state.carPlates = state.carPlates.filter((p) => p._id !== action.payload)
      })
      .addCase(deleteCarPlate.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete car plate."
      })

    // fetchCarPlatesByRto
    builder
      .addCase(fetchCarPlatesByRto.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCarPlatesByRto.fulfilled, (state, action) => {
        state.loading = false
        state.carPlates = action.payload
      })
      .addCase(fetchCarPlatesByRto.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to fetch car plates by RTO."
      })
  },
})

export const { clearCarPlateError, clearValidationResult } = carPlateSlice.actions
export default carPlateSlice.reducer
