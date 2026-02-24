import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AdminProvider } from "@/lib/admin-context"
import AdminBar from "@/components/admin-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "고아현 - QA 포트폴리오",
  description: "QA 전문가 고아현의 포트폴리오",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AdminProvider>
          <AdminBar />
          {children}
        </AdminProvider>
      </body>
    </html>
  )
}
