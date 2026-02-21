"use client"

import { useEffect } from "react"

export default function VisionPage() {
  useEffect(() => {
    window.location.href = "/experience?tab=vision"
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  )
}
