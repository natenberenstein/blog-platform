'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Trash2, Check } from 'lucide-react'

// ─── KaTeX render helper ──────────────────────────────────────────────────────

function renderLatex(src: string): { html: string; error: string | null } {
  try {
    return {
      html: katex.renderToString(src, { displayMode: true, throwOnError: true }),
      error: null,
    }
  } catch (e) {
    return { html: '', error: (e as Error).message }
  }
}

// ─── Rendered view ────────────────────────────────────────────────────────────

function RenderedFormula({
  content,
  onEdit,
}: {
  content: string
  onEdit: () => void
}) {
  const { html, error } = renderLatex(content)

  return (
    <div
      onClick={onEdit}
      className="group relative my-1 flex min-h-[3rem] cursor-pointer items-center justify-center rounded-xl border px-6 py-5 transition-all border-[#E5E0D8] hover:border-[#0F766E]/40"
    >
      {error ? (
        <span className="font-mono text-sm text-[#EF4444]">{error}</span>
      ) : (
        <div className="math-rendered overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
      )}
      {/* Edit hint */}
      <span className="absolute right-3 top-2 text-[10px] text-[#C4BFBA] opacity-0 transition-opacity group-hover:opacity-100">
        click to edit
      </span>
    </div>
  )
}

// ─── Editor view ──────────────────────────────────────────────────────────────

function FormulaEditor({
  initialValue,
  onConfirm,
  onCancel,
  onDelete,
}: {
  initialValue: string
  onConfirm: (value: string) => void
  onCancel: () => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState(initialValue)
  // Keep a ref so the native keydown listener always reads the latest draft
  const draftRef = useRef(draft)
  draftRef.current = draft

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { html: previewHtml, error: previewError } = renderLatex(draft)

  // Auto-grow textarea
  const autoGrow = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    autoGrow()
  }, [draft, autoGrow])

  // Focus + native keydown listener.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation()
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onConfirm(draftRef.current)
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        setDraft((d) => d + '  ')
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, onConfirm])

  return (
    <div className="my-1 overflow-hidden rounded-xl border border-[#0F766E] ring-2 ring-[#0F766E]/15">
      {/* Input area */}
      <div className="bg-[#F5F3F0] px-4 pt-3 pb-2">
        <p className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-[#A09A94]">
          LaTeX
        </p>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            autoGrow()
          }}
          placeholder="e.g. E = mc^2"
          rows={1}
          className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-[#1C1917] placeholder-[#C4BFBA] outline-none"
        />
      </div>

      {/* Live preview */}
      <div className="border-t border-[#E5E0D8] bg-white px-4 py-4">
        {draft.trim() === '' ? (
          <p className="text-center font-sans text-sm text-[#C4BFBA]">Preview will appear here</p>
        ) : previewError ? (
          <p className="font-mono text-xs text-[#EF4444]">{previewError}</p>
        ) : (
          <div
            className="math-rendered flex justify-center overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-[#E5E0D8] bg-white px-4 py-2">
        <p className="font-sans text-[10px] text-[#A09A94]">
          <kbd className="rounded bg-[#F0EDE8] px-1 py-0.5 font-mono text-[10px]">⌘↵</kbd> to
          confirm &ensp;·&ensp;
          <kbd className="rounded bg-[#F0EDE8] px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to
          cancel
        </p>
        <div className="flex items-center gap-2">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              onDelete()
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1 font-sans text-xs text-[#A09A94] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
          >
            <Trash2 size={11} /> Remove
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              onConfirm(draft)
            }}
            className="flex items-center gap-1 rounded-md bg-[#0F766E] px-3 py-1 font-sans text-xs text-white transition-colors hover:bg-[#0D5F58]"
          >
            <Check size={11} /> Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main block ───────────────────────────────────────────────────────────────

interface MathBlockProps {
  content: string
  updateAttributes: (attrs: Record<string, string>) => void
  deleteNode: () => void
}

export default function MathBlock({ content, updateAttributes, deleteNode }: MathBlockProps) {
  const saved = content ?? ''
  const [isEditing, setIsEditing] = useState(saved === '')

  function confirm(value: string) {
    updateAttributes({ content: value.trim() })
    setIsEditing(false)
  }

  function cancel() {
    if (saved === '') {
      deleteNode()
      return
    }
    setIsEditing(false)
  }

  return (
    <div contentEditable={false} onKeyDown={(e) => e.stopPropagation()}>
      {isEditing ? (
        <FormulaEditor
          initialValue={saved}
          onConfirm={confirm}
          onCancel={cancel}
          onDelete={deleteNode}
        />
      ) : (
        <RenderedFormula content={saved} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  )
}
