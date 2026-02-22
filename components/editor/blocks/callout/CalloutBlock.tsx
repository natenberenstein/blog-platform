'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

// ─── Types & constants ────────────────────────────────────────────────────────

type CalloutVariant = 'info' | 'warning' | 'success' | 'danger' | 'neutral'

const VARIANT_STYLES: Record<
  CalloutVariant,
  { bg: string; border: string; swatch: string; label: string }
> = {
  info: { bg: 'bg-[#F0FDFA]', border: 'border-[#5EEAD4]', swatch: '#0D9488', label: 'Teal' },
  warning: { bg: 'bg-[#FFFBEB]', border: 'border-[#FCD34D]', swatch: '#D97706', label: 'Amber' },
  success: { bg: 'bg-[#F0FDF4]', border: 'border-[#86EFAC]', swatch: '#16A34A', label: 'Green' },
  danger: { bg: 'bg-[#FEF2F2]', border: 'border-[#FCA5A5]', swatch: '#DC2626', label: 'Red' },
  neutral: { bg: 'bg-[#FAFAF8]', border: 'border-[#E5E0D8]', swatch: '#78716C', label: 'Neutral' },
}

const EMOJI_OPTIONS = [
  '💡', '✅', '⚠️', '❌', '📌', '🔥', '💬', '📝', '🎯',
  'ℹ️', '🚀', '💭', '🌟', '🔑', '📊', '🧠', '👉', '✨',
]

// ─── Component ────────────────────────────────────────────────────────────────

interface CalloutBlockProps {
  emoji: string
  variant: string
  contentRef: (el: HTMLElement | null) => void
  updateAttributes: (attrs: Record<string, string>) => void
  deleteNode: () => void
}

export default function CalloutBlock({
  emoji,
  variant,
  contentRef,
  updateAttributes,
  deleteNode,
}: CalloutBlockProps) {
  const styles = VARIANT_STYLES[(variant as CalloutVariant) ?? 'info'] ?? VARIANT_STYLES.info

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const emojiRef = useRef<HTMLDivElement>(null)

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return
    function onMouseDown(e: MouseEvent) {
      if (!emojiRef.current?.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [showEmojiPicker])

  const showControls = isHovered || showEmojiPicker

  return (
    <div
      className="my-3 font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating controls — variant swatches + delete */}
      <div
        contentEditable={false}
        className={`flex items-center gap-1.5 mb-1.5 justify-end transition-opacity duration-150 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {(
          Object.entries(VARIANT_STYLES) as [
            CalloutVariant,
            (typeof VARIANT_STYLES)[CalloutVariant],
          ][]
        ).map(([key, val]) => (
          <button
            key={key}
            onMouseDown={(e) => {
              e.preventDefault()
              updateAttributes({ variant: key })
            }}
            title={val.label}
            className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 ${
              variant === key ? 'ring-2 ring-offset-1 ring-[#0F766E]' : ''
            }`}
            style={{ backgroundColor: val.swatch }}
          />
        ))}
        <div className="w-px h-3.5 bg-[#E5E0D8]" />
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            deleteNode()
          }}
          className="text-[#C4BFBA] hover:text-[#EF4444] transition-colors"
          title="Remove callout"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Callout box */}
      <div
        className={`flex gap-3 rounded-xl border px-4 py-3 transition-all ${styles.bg} ${styles.border}`}
      >
        {/* Emoji — click to open picker */}
        <div contentEditable={false} className="relative shrink-0 mt-0.5" ref={emojiRef}>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              setShowEmojiPicker((v) => !v)
            }}
            className="text-xl leading-none select-none hover:scale-110 transition-transform cursor-pointer"
            title="Change icon"
          >
            {emoji}
          </button>

          {/* Emoji picker popover */}
          {showEmojiPicker && (
            <div className="absolute top-8 left-0 z-50 bg-white border border-[#E5E0D8] rounded-xl p-2 shadow-lg grid grid-cols-6 gap-0.5 w-max">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onMouseDown={(ev) => {
                    ev.preventDefault()
                    updateAttributes({ emoji: e })
                    setShowEmojiPicker(false)
                  }}
                  className="text-base leading-none p-1.5 rounded-lg hover:bg-[#F5F3F0] transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editable rich-text content */}
        <div
          className="flex-1 min-w-0 text-sm leading-relaxed text-[#1C1917] [&>p]:my-0 [&>p+p]:mt-2"
          ref={contentRef}
        />
      </div>
    </div>
  )
}
