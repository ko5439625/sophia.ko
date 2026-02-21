"use client"

import { useState, useRef, useEffect } from "react"
import { useAdmin } from "@/lib/admin-context"

interface EditableFieldProps {
  value: string
  onSave: (newValue: string) => void
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div"
  className?: string
  multiline?: boolean
}

export default function EditableField({ value, onSave, as: Tag = "span", className = "", multiline = false }: EditableFieldProps) {
  const { isAdmin, isLoggedIn } = useAdmin()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => { setText(value) }, [value])
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus() }, [editing])

  const canEdit = isAdmin && isLoggedIn

  if (!canEdit) return <Tag className={className}>{value}</Tag>

  if (editing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={() => { setEditing(false); onSave(text) }}
        onKeyDown={e => { if (e.key === "Escape") { setEditing(false); setText(value) } }}
        className={`${className} w-full bg-blue-50 border-2 border-blue-400 rounded-lg p-3 outline-none resize-y min-h-[80px] text-gray-900`}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={() => { setEditing(false); onSave(text) }}
        onKeyDown={e => {
          if (e.key === "Enter") { setEditing(false); onSave(text) }
          if (e.key === "Escape") { setEditing(false); setText(value) }
        }}
        className={`${className} w-full bg-blue-50 border-2 border-blue-400 rounded-lg px-3 py-1.5 outline-none text-gray-900`}
      />
    )
  }

  return (
    <Tag
      className={`${className} cursor-pointer relative group`}
      onClick={() => setEditing(true)}
    >
      {value}
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
    </Tag>
  )
}
