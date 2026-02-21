'use client'

import React, { useRef, useState } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Check, Copy } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Language list ────────────────────────────────────────────────────────────

const LANGUAGE_GROUPS: { group: string; languages: { id: string; label: string }[] }[] = [
  {
    group: 'Web',
    languages: [
      { id: 'html',       label: 'HTML'       },
      { id: 'css',        label: 'CSS'        },
      { id: 'javascript', label: 'JavaScript' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'json',       label: 'JSON'       },
    ],
  },
  {
    group: 'Systems',
    languages: [
      { id: 'rust',   label: 'Rust'   },
      { id: 'cpp',    label: 'C++'    },
      { id: 'c',      label: 'C'      },
      { id: 'go',     label: 'Go'     },
    ],
  },
  {
    group: 'General',
    languages: [
      { id: 'python',  label: 'Python'  },
      { id: 'java',    label: 'Java'    },
      { id: 'csharp',  label: 'C#'      },
      { id: 'ruby',    label: 'Ruby'    },
      { id: 'php',     label: 'PHP'     },
      { id: 'swift',   label: 'Swift'   },
      { id: 'kotlin',  label: 'Kotlin'  },
    ],
  },
  {
    group: 'Config & Scripts',
    languages: [
      { id: 'bash',     label: 'Bash'     },
      { id: 'yaml',     label: 'YAML'     },
      { id: 'sql',      label: 'SQL'      },
      { id: 'markdown', label: 'Markdown' },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function CodeBlockComponent({ node, updateAttributes }: NodeViewProps) {
  const language: string = node.attrs.language ?? ''
  const [copied, setCopied] = useState(false)
  // Read from the live contentDOM so the copy button always gets current text
  // even though the React component doesn't re-render on every keystroke.
  const preRef = useRef<HTMLPreElement>(null)

  function handleCopy() {
    const text = preRef.current?.textContent ?? node.textContent
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <NodeViewWrapper className="code-block-node my-4 font-sans">
      <div className="rounded-xl overflow-hidden border border-[#E5E0D8]">

        {/* ── Header ── */}
        <div
          contentEditable={false}
          className="flex items-center justify-between px-3 py-2 bg-[#EBE8E3] border-b border-[#E5E0D8]"
        >
          {/* Shadcn language selector */}
          <Select
            value={language || '__plain__'}
            onValueChange={(val) =>
              updateAttributes({ language: val === '__plain__' ? null : val })
            }
          >
            <SelectTrigger
              size="sm"
              className="h-7 w-auto min-w-[110px] border-0 bg-transparent shadow-none px-2 text-xs text-[#6B6560] hover:text-[#1C1917] hover:bg-[#E5E0D8] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            >
              <SelectValue placeholder="Plain text" />
            </SelectTrigger>
            <SelectContent className="font-sans">
              <SelectItem value="__plain__" className="text-xs">Plain text</SelectItem>
              <SelectSeparator />
              {LANGUAGE_GROUPS.map(({ group, languages }) => (
                <SelectGroup key={group}>
                  <SelectLabel className="text-[10px] tracking-wider uppercase">{group}</SelectLabel>
                  {languages.map(({ id, label }) => (
                    <SelectItem key={id} value={id} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all ${
              copied
                ? 'text-[#0F766E] bg-[#CCFBF1]'
                : 'text-[#A09A94] hover:text-[#1C1917] hover:bg-[#E5E0D8]'
            }`}
          >
            {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* ── Code area ── */}
        <pre ref={preRef} className="code-block-pre overflow-x-auto m-0 rounded-none bg-[#F5F3F0] px-5 py-4">
          <NodeViewContent as="code" className="hljs text-[#1C1917] text-sm leading-relaxed" />
        </pre>

      </div>
    </NodeViewWrapper>
  )
}
