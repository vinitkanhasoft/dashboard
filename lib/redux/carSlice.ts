import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import { CAR_ENDPOINTS } from "@/lib/api/endpoints"
import { refreshAccessToken } from "./authSlice"

// ─── Types ───────────────────────────────────────────────
export type CarImage = {
  url: string
  publicId: string
  alt?: string
}

export type CarFeatureItem = {
  name: string
  available: boolean
  _id?: string
}

export type CarFeaturesData = {
  _id?: string
  carId?: string
  features: {
    [key: string]: boolean
  }
  createdAt?: string
  updatedAt?: string
  id?: string
}

export type CarSpecificationsData = {
  _id?: string
  carId?: string
  specifications: {
    [key: string]: boolean
  }
  createdAt?: string
  updatedAt?: string
  id?: string
}

export type Car = {
  _id: string
  id: string
  title: string
  slug: string
  regularPrice: number
  salePrice: number
  onRoadPrice: number
  year: number
  km: number
  fuelType: string
  transmission: string
  ownership?: number
  bodyType: string
  color: string
  registrationCity?: string
  registrationState?: string
  insurance?: string
  driveType?: string
  sellerType?: string
  primaryImage: CarImage
  images?: CarImage[]
  isFeatured: boolean
  listedAt?: string
  description?: string
  engine?: string
  mileage?: string
  seats?: number
  variant?: string
  inspectionReportUrl?: string
  emiStartingFrom?: number
  status: string
  brand: string
  carModel: string
  sellerId?: string | null
  createdAt: string
  updatedAt: string
  discountPercentage?: number
  features?: CarFeaturesData[]
  specifications?: CarSpecificationsData[]
  reviews?: unknown[]
  similarCars?: unknown[]
}

type CarState = {
  cars: Car[]
  currentCar: Car | null
  loading: boolean
  searching: boolean
  fetchingCar: boolean
  error: string | null
  creating: boolean
  updating: boolean
  pagination: PaginationData | null
  counts: {
    total: number
    available: number
    sold: number
    reserved: number
  } | null
}

type PaginationData = {
  currentPage: number
  totalPages: number
  totalCars: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  hasNext: boolean
  hasPrevious: boolean
}

type CarListResponse = {
  success: boolean
  message: string
  data: { 
    cars: Car[]
    pagination: PaginationData
    counts: {
      total: number
      available: number
      sold: number
      reserved: number
    }
  }
}

type CarSingleResponse = {
  success: boolean
  message: string
  data: { car: Car }
}

// ─── Helper ──────────────────────────────────────────────
const getAccessToken = () => Cookies.get("access_token") || null

// ─── Async Thunks ────────────────────────────────────────

/** GET all cars */
export const fetchCars = createAsyncThunk<
  { cars: Car[]; pagination: PaginationData; counts: { total: number; available: number; sold: number; reserved: number } },
  {
    page?: number
    limit?: number
    brand?: string
    fuelType?: string
    transmission?: string
    bodyType?: string
    minPrice?: string
    maxPrice?: string
    minYear?: string
    maxYear?: string
    sortBy?: string
    sortOrder?: string
    status?: string
    isFeatured?: boolean
  } | void,
  { rejectValue: string }
>("car/fetchCars", async (params, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()

    // Build URL with query parameters
    const url = new URL(CAR_ENDPOINTS.LIST)
    
    if (params) {
      if (params.page) url.searchParams.set("page", String(params.page))
      if (params.limit) url.searchParams.set("limit", String(params.limit))
      if (params.brand) url.searchParams.set("brand", params.brand)
      if (params.fuelType) url.searchParams.set("fuelType", params.fuelType)
      if (params.transmission) url.searchParams.set("transmission", params.transmission)
      if (params.bodyType) url.searchParams.set("bodyType", params.bodyType)
      if (params.minPrice) url.searchParams.set("minPrice", params.minPrice)
      if (params.maxPrice) url.searchParams.set("maxPrice", params.maxPrice)
      if (params.minYear) url.searchParams.set("minYear", params.minYear)
      if (params.maxYear) url.searchParams.set("maxYear", params.maxYear)
      if (params.sortBy) url.searchParams.set("sortBy", params.sortBy)
      if (params.sortOrder) url.searchParams.set("sortOrder", params.sortOrder)
      if (params.status) url.searchParams.set("status", params.status)
      if (params.isFeatured !== undefined) url.searchParams.set("isFeatured", String(params.isFeatured))
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

    const json: CarListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch cars.")
    }
    return { cars: json.data.cars, pagination: json.data.pagination, counts: json.data.counts }
  } catch {
    return rejectWithValue("Network error. Could not fetch cars.")
  }
})

/** GET single car by ID */
export const fetchCarById = createAsyncThunk<
  Car,
  string,
  { rejectValue: string }
>("car/fetchCarById", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(CAR_ENDPOINTS.GET(id), {
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
        res = await fetch(CAR_ENDPOINTS.GET(id), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: CarSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch car.")
    }
    return json.data.car
  } catch {
    return rejectWithValue("Network error. Could not fetch car.")
  }
})

/** POST create car (FormData with images) */
export const createCar = createAsyncThunk<
  Car,
  FormData,
  { rejectValue: string }
>("car/createCar", async (formData, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(CAR_ENDPOINTS.CREATE, {
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
        res = await fetch(CAR_ENDPOINTS.CREATE, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: CarSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to create car.")
    }
    return json.data.car
  } catch {
    return rejectWithValue("Network error. Could not create car.")
  }
})

/** PUT update car */
export const updateCar = createAsyncThunk<
  Car,
  { id: string; formData: FormData },
  { rejectValue: string }
>("car/updateCar", async ({ id, formData }, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(CAR_ENDPOINTS.UPDATE(id), {
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
        res = await fetch(CAR_ENDPOINTS.UPDATE(id), {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: CarSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to update car.")
    }
    return json.data.car
  } catch {
    return rejectWithValue("Network error. Could not update car.")
  }
})

/** DELETE car */
export const deleteCar = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("car/deleteCar", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(CAR_ENDPOINTS.DELETE(id), {
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
        res = await fetch(CAR_ENDPOINTS.DELETE(id), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to delete car.")
    }
    return id
  } catch {
    return rejectWithValue("Network error. Could not delete car.")
  }
})

/** BULK DELETE cars: POST /api/cars/bulk-delete */
export const bulkDeleteCars = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>("car/bulkDeleteCars", async (carIds, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(CAR_ENDPOINTS.BULK_DELETE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ carIds }),
    })

    if (res.status === 401) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshResult = await (dispatch as any)(refreshAccessToken())
      if (refreshAccessToken.fulfilled.match(refreshResult)) {
        accessToken = refreshResult.payload.accessToken
        res = await fetch(CAR_ENDPOINTS.BULK_DELETE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ carIds }),
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return rejectWithValue(json.message ?? "Failed to bulk delete cars.")
    }
    return carIds
  } catch {
    return rejectWithValue("Network error. Could not bulk delete cars.")
  }
})

/** SEARCH cars by status: GET /api/cars/search-status?status=... */
export const searchCarsByStatus = createAsyncThunk<
  { cars: Car[]; pagination: PaginationData; counts: { total: number; available: number; sold: number; reserved: number } },
  {
    status?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  },
  { rejectValue: string }
>("car/searchCarsByStatus", async (params, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()

    const url = new URL(CAR_ENDPOINTS.SEARCH_STATUS)
    if (params.status) url.searchParams.set("status", params.status)
    if (params.page) url.searchParams.set("page", String(params.page))
    if (params.limit) url.searchParams.set("limit", String(params.limit))
    if (params.sortBy) url.searchParams.set("sortBy", params.sortBy)
    if (params.sortOrder) url.searchParams.set("sortOrder", params.sortOrder)

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

    const json: CarListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to search cars by status.")
    }
    return { cars: json.data.cars, pagination: json.data.pagination, counts: json.data.counts }
  } catch {
    return rejectWithValue("Network error. Could not search cars by status.")
  }
})

/** SEARCH cars: GET /api/cars/search?q=...&fuelType=...&minPrice=...&maxPrice=...&transmission=...&bodyType=...&seats=...&page=...&limit=...&sortBy=...&sortOrder=... */
export const searchCars = createAsyncThunk<
  { cars: Car[]; pagination: { total: number; page: number; limit: number; pages: number } },
  {
    q?: string
    fuelType?: string
    transmission?: string
    bodyType?: string
    seats?: string
    minPrice?: string
    maxPrice?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  },
  { rejectValue: string }
>("car/searchCars", async (params, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()

    const url = new URL(CAR_ENDPOINTS.SEARCH)
    if (params.q) url.searchParams.set("q", params.q)
    if (params.fuelType) url.searchParams.set("fuelType", params.fuelType)
    if (params.transmission) url.searchParams.set("transmission", params.transmission)
    if (params.bodyType) url.searchParams.set("bodyType", params.bodyType)
    if (params.seats) url.searchParams.set("seats", params.seats)
    if (params.minPrice) url.searchParams.set("minPrice", params.minPrice)
    if (params.maxPrice) url.searchParams.set("maxPrice", params.maxPrice)
    if (params.page) url.searchParams.set("page", String(params.page))
    if (params.limit) url.searchParams.set("limit", String(params.limit))
    if (params.sortBy) url.searchParams.set("sortBy", params.sortBy)
    if (params.sortOrder) url.searchParams.set("sortOrder", params.sortOrder)

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
      return rejectWithValue(json.message ?? "Failed to search cars.")
    }
    return { cars: json.data.cars, pagination: json.data.pagination }
  } catch {
    return rejectWithValue("Network error. Could not search cars.")
  }
})

/** GET featured cars: GET /api/cars/featured?limit=... */
export const fetchFeaturedCars = createAsyncThunk<
  Car[],
  { limit?: number } | void,
  { rejectValue: string }
>("car/fetchFeaturedCars", async (params, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()

    const url = new URL(CAR_ENDPOINTS.FEATURED)
    if (params && params.limit) url.searchParams.set("limit", String(params.limit))

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
      return rejectWithValue(json.message ?? "Failed to fetch featured cars.")
    }
    return json.data.cars
  } catch {
    return rejectWithValue("Network error. Could not fetch featured cars.")
  }
})

// ─── Initial State ───────────────────────────────────────
const initialState: CarState = {
  cars: [],
  currentCar: null,
  loading: false,
  searching: false,
  fetchingCar: false,
  error: null,
  creating: false,
  updating: false,
  pagination: null,
  counts: null,
}

// ─── Slice ───────────────────────────────────────────────
const carSlice = createSlice({
  name: "car",
  initialState,
  reducers: {
    clearCarError(state) {
      state.error = null
    },
    clearCurrentCar(state) {
      state.currentCar = null
    },
  },
  extraReducers: (builder) => {
    // fetchCars
    builder
      .addCase(fetchCars.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loading = false
        state.cars = action.payload.cars
        state.pagination = action.payload.pagination
        state.counts = action.payload.counts
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to fetch cars."
      })

    // fetchCarById
    builder
      .addCase(fetchCarById.pending, (state) => {
        state.fetchingCar = true
        state.error = null
        state.currentCar = null
      })
      .addCase(fetchCarById.fulfilled, (state, action) => {
        state.fetchingCar = false
        state.currentCar = action.payload
      })
      .addCase(fetchCarById.rejected, (state, action) => {
        state.fetchingCar = false
        state.error = action.payload ?? "Failed to fetch car."
      })

    // createCar
    builder
      .addCase(createCar.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createCar.fulfilled, (state, action) => {
        state.creating = false
        state.cars.unshift(action.payload)
      })
      .addCase(createCar.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? "Failed to create car."
      })

    // updateCar
    builder
      .addCase(updateCar.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateCar.fulfilled, (state, action) => {
        state.updating = false
        if (!action.payload || !action.payload._id) return
        state.cars = state.cars.filter(c => c && c._id)
        const idx = state.cars.findIndex((c) => c._id === action.payload._id)
        if (idx !== -1) state.cars[idx] = action.payload
      })
      .addCase(updateCar.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload ?? "Failed to update car."
      })

    // deleteCar
    builder
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.cars = state.cars.filter((c) => c._id !== action.payload)
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete car."
      })

    // bulkDeleteCars
    builder
      .addCase(bulkDeleteCars.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload)
        state.cars = state.cars.filter((c) => !deletedIds.has(c._id))
      })
      .addCase(bulkDeleteCars.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to bulk delete cars."
      })

    // searchCars
    builder
      .addCase(searchCars.pending, (state) => {
        state.searching = true
        state.error = null
      })
      .addCase(searchCars.fulfilled, (state, action) => {
        state.searching = false
        state.cars = action.payload.cars
      })
      .addCase(searchCars.rejected, (state, action) => {
        state.searching = false
        state.error = action.payload ?? "Failed to search cars."
      })

    // searchCarsByStatus
    builder
      .addCase(searchCarsByStatus.pending, (state) => {
        state.searching = true
        state.error = null
      })
      .addCase(searchCarsByStatus.fulfilled, (state, action) => {
        state.searching = false
        state.cars = action.payload.cars
        state.pagination = action.payload.pagination
        state.counts = action.payload.counts
      })
      .addCase(searchCarsByStatus.rejected, (state, action) => {
        state.searching = false
        state.error = action.payload ?? "Failed to search cars by status."
      })

    // fetchFeaturedCars
    builder
      .addCase(fetchFeaturedCars.fulfilled, (state, action) => {
        state.cars = action.payload
      })
      .addCase(fetchFeaturedCars.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to fetch featured cars."
      })
  },
})

export const { clearCarError, clearCurrentCar } = carSlice.actions
export default carSlice.reducer
