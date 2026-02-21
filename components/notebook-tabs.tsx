"use client"

import { Button } from "@/components/ui/button"
import { Home, User, Briefcase, Target } from "lucide-react"

interface NotebookTabsProps {
  activeTab: "about" | "experience" | "vision"
}

export default function NotebookTabs({ activeTab }: NotebookTabsProps) {
  const tabs = [
    { id: "about", label: "About", icon: <User className="w-4 h-4" />, href: "/about" },
    { id: "experience", label: "Exp.", icon: <Briefcase className="w-4 h-4" />, href: "/experience" },
    { id: "vision", label: "Vision", icon: <Target className="w-4 h-4" />, href: "/experience?tab=vision" },
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" />, href: "/" },
  ]

  const handleTabClick = (href: string) => {
    window.location.href = href
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 pt-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`
                relative px-4 py-2 rounded-t-lg border-2 border-b-0 transition-all duration-300
                ${
                  activeTab === tab.id
                    ? "bg-white border-gray-300 shadow-sm -mb-0.5 z-10"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 mb-1 hover:-mb-0.5"
                }
              `}
              onClick={() => handleTabClick(tab.href)}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">
                  {tab.id === "about" ? "📋" : tab.id === "experience" ? "💻" : tab.id === "vision" ? "🚀" : "🏠"}
                </span>
                <span className="text-xs font-medium">{tab.label}</span>
              </div>
            </Button>
          ))}
        </div>
        <div className="h-0.5 bg-gray-200 -mt-0.5"></div>
      </div>
    </div>
  )
}
