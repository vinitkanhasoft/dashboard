import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import bannerReducer from "./bannerSlice"
import carReducer from "./carSlice"
import testimonialReducer from "./testimonialSlice"
import blogReducer from "./blogSlice"
import newsletterReducer from "./newsletterSlice"
import teamReducer from "./teamSlice"
import carPlateReducer from "./carPlateSlice"
import insuranceFinanceReducer from "./insuranceFinanceSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    banner: bannerReducer,
    car: carReducer,
    testimonial: testimonialReducer,
    blog: blogReducer,
    newsletter: newsletterReducer,
    team: teamReducer,
    carPlate: carPlateReducer,
    insuranceFinance: insuranceFinanceReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
