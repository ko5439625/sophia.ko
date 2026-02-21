"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

const ADMIN_ID = "sophia.ko"
const ADMIN_PW = "aaaa1111"

interface AdminContextType {
  isAdmin: boolean
  setIsAdmin: (v: boolean) => void
  isLoggedIn: boolean
  login: (id: string, password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  setIsAdmin: () => {},
  isLoggedIn: false,
  login: () => false,
  logout: () => {},
})

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_logged_in")
    if (saved === "true") {
      setIsLoggedIn(true)
      setIsAdmin(true)
    }
  }, [])

  const login = (id: string, password: string) => {
    if (id === ADMIN_ID && password === ADMIN_PW) {
      setIsLoggedIn(true)
      setIsAdmin(true)
      sessionStorage.setItem("admin_logged_in", "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
    sessionStorage.removeItem("admin_logged_in")
  }

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin, isLoggedIn, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
