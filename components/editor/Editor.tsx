'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react'
import SlashCommand from './extensions/slash-command'
import ChartNode from './extensions/chart-node'
import CalloutNode from './extensions/callout-node'
import CodeBlock from './extensions/code-block'
import MathBlockNode from './extensions/math-block'
import ToggleNode from './extensions/toggle-node'
import DragHandle from './extensions/drag-handle'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        background: isActive ? '#CCFBF1' : 'transparent',
        color: isActive ? '#0F766E' : '#6B6560',
        transition: 'background 0.1s, color 0.1s',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = '#F5F3F0'
          e.currentTarget.style.color = '#1C1917'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#6B6560'
        }
      }}
    >
      {children}
    </button>
  )
}

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: "Type '/' for commands…",
      }),
      SlashCommand,
      ChartNode,
      CalloutNode,
      CodeBlock,
      MathBlockNode,
      ToggleNode,
      DragHandle,
    ],
    editorProps: {
      attributes: {
        class: 'editor-content',
        spellcheck: 'true',
      },
    },
    immediatelyRender: false,
  })

  const wordCount = editor
    ? editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length
    : 0

  return (
    <div style={{ position: 'relative' }}>
      {/* BubbleMenu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150, placement: 'top' }}
          shouldShow={({ editor, state }) => {
            const { from, to } = state.selection
            return from !== to && !editor.isActive('codeBlock')
          }}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 4 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 6px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (⌘B)"
              >
                <Bold size={13} strokeWidth={2.5} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (⌘I)"
              >
                <Italic size={13} strokeWidth={2.5} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
              >
                <Strikethrough size={13} strokeWidth={2.5} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
              >
                <Code size={13} strokeWidth={2.5} />
              </ToolbarButton>

              {/* Separator */}
              <div
                style={{
                  width: '1px',
                  height: '16px',
                  background: '#E5E0D8',
                  margin: '0 2px',
                }}
              />

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <Heading1 size={13} strokeWidth={2.5} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 size={13} strokeWidth={2.5} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <Heading3 size={13} strokeWidth={2.5} />
              </ToolbarButton>
            </motion.div>
          </AnimatePresence>
        </BubbleMenu>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Word count */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '32px',
          fontSize: '0.75rem',
          color: '#C4BFBA',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          userSelect: 'none',
        }}
      >
        {wordCount} {wordCount === 1 ? 'word' : 'words'}
      </div>
    </div>
  )
}
