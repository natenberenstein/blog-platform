'use client'

import React, { useEffect, useRef } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { ChevronRight } from 'lucide-react'

export default function ToggleBlock({ node, updateAttributes }: NodeViewProps) {
  const { title, open } = node.attrs as { title: string; open: boolean }
  const inputRef = useRef<HTMLInputElement>(null)

  // Native listeners so keystrokes in the title input don't bubble to ProseMirror.
  // React's synthetic onKeyDown fires at the root container (after ProseMirror's
  // native listener on the editor div), so we must intercept at the DOM level.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    const stop = (e: Event) => e.stopPropagation()
    el.addEventListener('keydown', stop)
    el.addEventListener('keyup', stop)
    return () => {
      el.removeEventListener('keydown', stop)
      el.removeEventListener('keyup', stop)
    }
  }, [])

  return (
    <NodeViewWrapper className="my-1">
      {/* ── Header ── */}
      <div contentEditable={false} className="flex items-center gap-1.5 py-0.5">
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            updateAttributes({ open: !open })
          }}
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[#A09A94] transition-colors hover:bg-[#F0EDE8] hover:text-[#1C1917]"
        >
          <ChevronRight
            size={14}
            strokeWidth={2}
            style={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          />
        </button>

        <input
          ref={inputRef}
          value={title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder="Toggle"
          className="flex-1 cursor-text bg-transparent font-sans text-[0.9375rem] font-medium text-[#1C1917] outline-none placeholder-[#C4BFBA]"
        />
      </div>

      {/* ── Collapsible body ── */}
      {/* Keep NodeViewContent always in the DOM so Tiptap's content mount never breaks. */}
      <div
        className="ml-[1.375rem] mt-0.5 border-l-2 border-[#E5E0D8] pl-4"
        style={{ display: open ? 'block' : 'none' }}
      >
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  )
}
