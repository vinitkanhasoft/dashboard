"use client"

import { useEffect, useRef } from "react"
import { Provider } from "react-redux"
import { useRouter, usePathname } from "next/navigation"
import { store } from "@/lib/redux/store"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { hydrate, refreshAccessToken, fetchProfile } from "@/lib/redux/authSlice"

const PUBLIC_ROUTES = ["/login"]

function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isHydrated, accessToken, refreshToken, user } =
    useAppSelector((s) => s.auth)
  const router = useRouter()
  const pathname = usePathname()
  const refreshAttempted = useRef(false)

  // Hydrate from cookies on mount
  useEffect(() => {
    dispatch(hydrate())
  }, [dispatch])

  // After hydration, if we have refreshToken but no accessToken, refresh proactively
  useEffect(() => {
    if (!isHydrated || refreshAttempted.current) return

    if (isAuthenticated && refreshToken && !accessToken) {
      refreshAttempted.current = true
      dispatch(refreshAccessToken()).then((result) => {
        if (refreshAccessToken.fulfilled.match(result)) {
          // Access token refreshed — fetch profile if user data is missing
          if (!user) {
            dispatch(fetchProfile())
          }
        }
      })
    }
  }, [isHydrated, isAuthenticated, accessToken, refreshToken, user, dispatch])

  // Redirect logic
  useEffect(() => {
    if (!isHydrated) return

    const isPublic = PUBLIC_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    )

    if (!isAuthenticated && !isPublic && pathname !== "/") {
      router.replace("/login")
    }

    if (isAuthenticated && isPublic) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isHydrated, pathname, router])

  return <>{children}</>
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthGate>{children}</AuthGate>
    </Provider>
  )
}
