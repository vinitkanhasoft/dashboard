import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import Cookies from "js-cookie"
import { INSURANCE_FINANCE_ENDPOINTS } from "@/lib/api/endpoints"
import { refreshAccessToken } from "./authSlice"

// ─── Types ───────────────────────────────────────────────
export type InsuranceCompany = {
  _id: string
  name: string
  description: string
  contactNumber: string
  email: string
  website: string
  coverageTypes: string[]
  insuranceTypes: string[]
  emiStartPrice: number
  minCoverageAmount: number
  maxCoverageAmount: number
  isPremiumPartner: boolean
  logo?: { url: string; publicId: string; alt: string }
  createdAt: string
  updatedAt: string
}

export type FinanceOption = {
  _id: string
  bankName: string
  description: string
  financeType: string
  interestRate: number
  processingFee: number
  minLoanAmount: number
  maxLoanAmount: number
  minTenure: number
  maxTenure: number
  emiStartPrice: number
  isPopular: boolean
  contactNumber: string
  email: string
  website: string
  preApprovalAvailable: boolean
  instantDisbursement: boolean
  logo?: { url: string; publicId: string; alt: string }
  createdAt: string
  updatedAt: string
}

type InsuranceFinanceState = {
  insuranceCompanies: InsuranceCompany[]
  financeOptions: FinanceOption[]
  loading: boolean
  financeLoading: boolean
  error: string | null
  creating: boolean
  updating: boolean
  deleting: boolean
}

type DeleteResponse = {
  success: boolean
  message: string
}

type InsuranceListResponse = {
  success: boolean
  message: string
  data: {
    companies: InsuranceCompany[]
    pagination?: { total: number; page: number; limit: number; pages: number }
  }
}

type InsuranceSingleResponse = {
  success: boolean
  message: string
  data: InsuranceCompany
}

type FinanceListResponse = {
  success: boolean
  message: string
  data: {
    options: FinanceOption[]
    pagination?: { total: number; page: number; limit: number; pages: number }
  }
}

type FinanceSingleResponse = {
  success: boolean
  message: string
  data: FinanceOption
}

// ─── Helper ──────────────────────────────────────────────
const getAccessToken = () => Cookies.get("access_token") || null

// ─── Insurance Thunks ────────────────────────────────────

/** GET /api/insurance-finance/insurance */
export const fetchInsuranceCompanies = createAsyncThunk<
  InsuranceCompany[],
  void,
  { rejectValue: string }
>("insuranceFinance/fetchInsuranceCompanies", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    const url = `${INSURANCE_FINANCE_ENDPOINTS.INSURANCE_LIST}?page=1&limit=100`
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

    const json: InsuranceListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch insurance companies.")
    }
    return json.data.companies
  } catch {
    return rejectWithValue("Network error. Could not fetch insurance companies.")
  }
})

/** POST /api/insurance-finance/insurance (FormData with logo) */
export const createInsuranceCompany = createAsyncThunk<
  InsuranceCompany,
  FormData,
  { rejectValue: string }
>("insuranceFinance/createInsuranceCompany", async (formData, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(INSURANCE_FINANCE_ENDPOINTS.INSURANCE_CREATE, {
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
        res = await fetch(INSURANCE_FINANCE_ENDPOINTS.INSURANCE_CREATE, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: InsuranceSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to create insurance company.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not create insurance company.")
  }
})

/** GET /api/insurance-finance/insurance/coverage/:type */
export const fetchInsuranceByCoverage = createAsyncThunk<
  InsuranceCompany[],
  string,
  { rejectValue: string }
>("insuranceFinance/fetchInsuranceByCoverage", async (coverageType, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    const url = `${INSURANCE_FINANCE_ENDPOINTS.INSURANCE_BY_COVERAGE(coverageType)}?page=1&limit=100`
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

    const json: InsuranceListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch insurance by coverage.")
    }
    return json.data.companies
  } catch {
    return rejectWithValue("Network error. Could not fetch insurance by coverage.")
  }
})

// ─── Finance Thunks ──────────────────────────────────────

/** GET /api/insurance-finance/finance */
export const fetchFinanceOptions = createAsyncThunk<
  FinanceOption[],
  void,
  { rejectValue: string }
>("insuranceFinance/fetchFinanceOptions", async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    const url = `${INSURANCE_FINANCE_ENDPOINTS.FINANCE_LIST}?page=1&limit=100`
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

    const json: FinanceListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch finance options.")
    }
    return json.data.options
  } catch {
    return rejectWithValue("Network error. Could not fetch finance options.")
  }
})

/** POST /api/insurance-finance/finance (FormData with logo) */
export const createFinanceOption = createAsyncThunk<
  FinanceOption,
  FormData,
  { rejectValue: string }
>("insuranceFinance/createFinanceOption", async (formData, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(INSURANCE_FINANCE_ENDPOINTS.FINANCE_CREATE, {
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
        res = await fetch(INSURANCE_FINANCE_ENDPOINTS.FINANCE_CREATE, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: FinanceSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to create finance option.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not create finance option.")
  }
})

/** GET /api/insurance-finance/finance/type/:type */
export const fetchFinanceByType = createAsyncThunk<
  FinanceOption[],
  string,
  { rejectValue: string }
>("insuranceFinance/fetchFinanceByType", async (financeType, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    const url = `${INSURANCE_FINANCE_ENDPOINTS.FINANCE_BY_TYPE(financeType)}?page=1&limit=100`
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

    const json: FinanceListResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to fetch finance by type.")
    }
    return json.data.options
  } catch {
    return rejectWithValue("Network error. Could not fetch finance by type.")
  }
})

/** PUT /api/insurance-finance/insurance/:id (FormData with logo) */
export const updateInsuranceCompany = createAsyncThunk<
  InsuranceCompany,
  { id: string; formData: FormData },
  { rejectValue: string }
>("insuranceFinance/updateInsuranceCompany", async ({ id, formData }, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(INSURANCE_FINANCE_ENDPOINTS.INSURANCE_UPDATE(id), {
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
        res = await fetch(INSURANCE_FINANCE_ENDPOINTS.INSURANCE_UPDATE(id), {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: InsuranceSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to update insurance company.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not update insurance company.")
  }
})

/** DELETE /api/insurance-finance/insurance/:id */
export const deleteInsuranceCompany = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("insuranceFinance/deleteInsuranceCompany", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(INSURANCE_FINANCE_ENDPOINTS.INSURANCE_DELETE(id), {
      method: "DELETE",
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
        res = await fetch(INSURANCE_FINANCE_ENDPOINTS.INSURANCE_DELETE(id), {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: DeleteResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to delete insurance company.")
    }
    return id
  } catch {
    return rejectWithValue("Network error. Could not delete insurance company.")
  }
})

/** PUT /api/insurance-finance/finance/:id (FormData with logo) */
export const updateFinanceOption = createAsyncThunk<
  FinanceOption,
  { id: string; formData: FormData },
  { rejectValue: string }
>("insuranceFinance/updateFinanceOption", async ({ id, formData }, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(INSURANCE_FINANCE_ENDPOINTS.FINANCE_UPDATE(id), {
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
        res = await fetch(INSURANCE_FINANCE_ENDPOINTS.FINANCE_UPDATE(id), {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: FinanceSingleResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to update finance option.")
    }
    return json.data
  } catch {
    return rejectWithValue("Network error. Could not update finance option.")
  }
})

/** DELETE /api/insurance-finance/finance/:id */
export const deleteFinanceOption = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("insuranceFinance/deleteFinanceOption", async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState() as { auth: { accessToken: string | null } }
    let accessToken = state.auth.accessToken || getAccessToken()
    let res = await fetch(INSURANCE_FINANCE_ENDPOINTS.FINANCE_DELETE(id), {
      method: "DELETE",
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
        res = await fetch(INSURANCE_FINANCE_ENDPOINTS.FINANCE_DELETE(id), {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } else {
        return rejectWithValue("Session expired. Please log in again.")
      }
    }

    const json: DeleteResponse = await res.json()
    if (!res.ok || !json.success) {
      return rejectWithValue(json.message ?? "Failed to delete finance option.")
    }
    return id
  } catch {
    return rejectWithValue("Network error. Could not delete finance option.")
  }
})

// ─── Initial State ───────────────────────────────────────
const initialState: InsuranceFinanceState = {
  insuranceCompanies: [],
  financeOptions: [],
  loading: false,
  financeLoading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
}

// ─── Slice ───────────────────────────────────────────────
const insuranceFinanceSlice = createSlice({
  name: "insuranceFinance",
  initialState,
  reducers: {
    clearInsuranceFinanceError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchInsuranceCompanies
    builder
      .addCase(fetchInsuranceCompanies.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInsuranceCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.insuranceCompanies = action.payload
      })
      .addCase(fetchInsuranceCompanies.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to fetch insurance companies."
      })

    // createInsuranceCompany
    builder
      .addCase(createInsuranceCompany.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createInsuranceCompany.fulfilled, (state, action) => {
        state.creating = false
        state.insuranceCompanies.unshift(action.payload)
      })
      .addCase(createInsuranceCompany.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? "Failed to create insurance company."
      })

    // fetchInsuranceByCoverage
    builder
      .addCase(fetchInsuranceByCoverage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInsuranceByCoverage.fulfilled, (state, action) => {
        state.loading = false
        state.insuranceCompanies = action.payload
      })
      .addCase(fetchInsuranceByCoverage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to fetch insurance by coverage."
      })

    // fetchFinanceOptions
    builder
      .addCase(fetchFinanceOptions.pending, (state) => {
        state.financeLoading = true
        state.error = null
      })
      .addCase(fetchFinanceOptions.fulfilled, (state, action) => {
        state.financeLoading = false
        state.financeOptions = action.payload
      })
      .addCase(fetchFinanceOptions.rejected, (state, action) => {
        state.financeLoading = false
        state.error = action.payload ?? "Failed to fetch finance options."
      })

    // createFinanceOption
    builder
      .addCase(createFinanceOption.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createFinanceOption.fulfilled, (state, action) => {
        state.creating = false
        state.financeOptions.unshift(action.payload)
      })
      .addCase(createFinanceOption.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? "Failed to create finance option."
      })

    // fetchFinanceByType
    builder
      .addCase(fetchFinanceByType.pending, (state) => {
        state.financeLoading = true
        state.error = null
      })
      .addCase(fetchFinanceByType.fulfilled, (state, action) => {
        state.financeLoading = false
        state.financeOptions = action.payload
      })
      .addCase(fetchFinanceByType.rejected, (state, action) => {
        state.financeLoading = false
        state.error = action.payload ?? "Failed to fetch finance by type."
      })

    // updateInsuranceCompany
    builder
      .addCase(updateInsuranceCompany.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateInsuranceCompany.fulfilled, (state, action) => {
        state.updating = false
        const idx = state.insuranceCompanies.findIndex((c) => c._id === action.payload._id)
        if (idx !== -1) state.insuranceCompanies[idx] = action.payload
      })
      .addCase(updateInsuranceCompany.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload ?? "Failed to update insurance company."
      })

    // deleteInsuranceCompany
    builder
      .addCase(deleteInsuranceCompany.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteInsuranceCompany.fulfilled, (state, action) => {
        state.deleting = false
        state.insuranceCompanies = state.insuranceCompanies.filter((c) => c._id !== action.payload)
      })
      .addCase(deleteInsuranceCompany.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload ?? "Failed to delete insurance company."
      })

    // updateFinanceOption
    builder
      .addCase(updateFinanceOption.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateFinanceOption.fulfilled, (state, action) => {
        state.updating = false
        const idx = state.financeOptions.findIndex((o) => o._id === action.payload._id)
        if (idx !== -1) state.financeOptions[idx] = action.payload
      })
      .addCase(updateFinanceOption.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload ?? "Failed to update finance option."
      })

    // deleteFinanceOption
    builder
      .addCase(deleteFinanceOption.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteFinanceOption.fulfilled, (state, action) => {
        state.deleting = false
        state.financeOptions = state.financeOptions.filter((o) => o._id !== action.payload)
      })
      .addCase(deleteFinanceOption.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload ?? "Failed to delete finance option."
      })
  },
})

export const { clearInsuranceFinanceError } = insuranceFinanceSlice.actions
export default insuranceFinanceSlice.reducer
