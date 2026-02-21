'use client'

import { useEditor, EditorContent, BubbleMenu, type Editor as TiptapEditor } from '@tiptap/react'
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
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SlashCommand from './extensions/slash-command'
import ChartNode from './extensions/chart-node'
import CalloutNode from './extensions/callout-node'
import CodeBlock from './extensions/code-block'
import MathBlockNode from './extensions/math-block'
import ToggleNode from './extensions/toggle-node'
import DragHandle from './extensions/drag-handle'

interface ToolbarAction {
  title: string
  icon: LucideIcon
  run: (editor: TiptapEditor) => void
  isActive: (editor: TiptapEditor) => boolean
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  title: string
  icon: LucideIcon
}

const INLINE_ACTIONS: ToolbarAction[] = [
  {
    title: 'Bold (⌘B)',
    icon: Bold,
    run: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
  },
  {
    title: 'Italic (⌘I)',
    icon: Italic,
    run: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
  },
  {
    title: 'Strikethrough',
    icon: Strikethrough,
    run: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive('strike'),
  },
  {
    title: 'Inline Code',
    icon: Code,
    run: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive('code'),
  },
]

const HEADING_ACTIONS: ToolbarAction[] = [
  {
    title: 'Heading 1',
    icon: Heading1,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
  },
  {
    title: 'Heading 2',
    icon: Heading2,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
  },
  {
    title: 'Heading 3',
    icon: Heading3,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
  },
]

function ToolbarButton({ onClick, isActive, title, icon: Icon }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-[5px] border-none bg-transparent font-sans transition-colors',
        isActive
          ? 'bg-[#CCFBF1] text-[#0F766E]'
          : 'text-[#6B6560] hover:bg-[#F5F3F0] hover:text-[#1C1917]',
      )}
    >
      <Icon size={13} strokeWidth={2.5} />
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
              {INLINE_ACTIONS.map((action) => (
                <ToolbarButton
                  key={action.title}
                  onClick={() => action.run(editor)}
                  isActive={action.isActive(editor)}
                  title={action.title}
                  icon={action.icon}
                />
              ))}

              {/* Separator */}
              <div
                style={{
                  width: '1px',
                  height: '16px',
                  background: '#E5E0D8',
                  margin: '0 2px',
                }}
              />

              {HEADING_ACTIONS.map((action) => (
                <ToolbarButton
                  key={action.title}
                  onClick={() => action.run(editor)}
                  isActive={action.isActive(editor)}
                  title={action.title}
                  icon={action.icon}
                />
              ))}
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
