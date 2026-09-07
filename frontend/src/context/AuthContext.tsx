import { createContext, useState, type ReactNode } from "react"

// Mismo union de roles que usa el backend (req.user.role) — el sistema de
// permisos por bitmask existe en el backend pero no está en uso para
// control de acceso real, así que no se replica aquí.
export type Role = "student" | "intern" | "graduate" | "company" | "admin"

export interface AuthUser {
  id: number
  email: string
  role: Role
}

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (user: AuthUser, token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Stub por ahora: login/logout solo actualizan el estado local. La llamada
// real al backend (POST /api/auth/login) llega con la pantalla de login.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading] = useState(false)

  function login(nextUser: AuthUser, nextToken: string) {
    setUser(nextUser)
    setToken(nextToken)
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
