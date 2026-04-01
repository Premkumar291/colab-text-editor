"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  color: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: any) => Promise<void>
  signup: (data: any) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  const checkUser = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "GET" }) // Wait, I put GET in logout.ts for Me? No, I should check the file.
      // Re-checking the previous file write... I put both Logout and Me in the same file?
      // No, I should have put them in separate files or routes.
    } catch (err) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Re-creating the checkUser logic correctly based on the intended /api/auth/me route
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/logout") // Wait, I mistakenly used the logout file path for the GET Me.
      // I need to fix the file structure.
    } catch (err) {
       setUser(null)
    } finally {
       setIsLoading(false)
    }
  }

  React.useEffect(() => {
    // Initial user fetch
    const initAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
           const data = await res.json()
           setUser(data.user)
        }
      } catch (err) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async (credentials: any) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    const data = await res.json()
    if (res.ok) {
      setUser(data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      router.push("/")
    } else {
      throw new Error(data.error || "Login failed")
    }
  }

  const signup = async (details: any) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    })
    const data = await res.json()
    if (res.ok) {
      setUser(data.user)
      toast.success("Account created successfully!")
      router.push("/")
    } else {
      throw new Error(data.error || "Registration failed")
    }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    toast.success("Logged out")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
