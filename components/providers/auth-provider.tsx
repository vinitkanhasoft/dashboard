"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useRouter, usePathname } from "next/navigation"

type User = {
  name: string
  email: string
  avatar: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ["/login"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem("auth_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("auth_user")
      }
    }
    setIsLoading(false)
  }, [])

  // Redirect logic
  useEffect(() => {
    if (isLoading) return

    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )

    if (!user && !isPublicRoute && pathname !== "/") {
      router.replace("/login")
    }

    if (user && isPublicRoute) {
      router.replace("/dashboard")
    }
  }, [user, isLoading, pathname, router])

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      // Simulate API call — replace with real auth
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (email === "admin@example.com" && password === "password") {
        const userData: User = {
          name: "Admin",
          email: "admin@example.com",
          avatar: "",
        }
        setUser(userData)
        localStorage.setItem("auth_user", JSON.stringify(userData))
        return true
      }

      return false
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("auth_user")
    router.replace("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
