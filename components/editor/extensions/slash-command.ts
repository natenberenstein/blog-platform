import { Extension, type Editor, type Range } from '@tiptap/core'
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import SlashCommandList from '../slash-command/SlashCommandList'
import type { SlashCommandIconName } from '../slash-command/icons'

export interface CommandItem {
  title: string
  description: string
  icon: SlashCommandIconName
  category: string
  command: (editor: Editor, range: { from: number; to: number }) => void
}

const COMMANDS: CommandItem[] = [
  // Basic Blocks
  {
    title: 'Text',
    description: 'Start writing with plain text',
    icon: 'Type',
    category: 'Basic Blocks',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'Heading1',
    category: 'Basic Blocks',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'Heading2',
    category: 'Basic Blocks',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'Heading3',
    category: 'Basic Blocks',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    },
  },
  // Lists
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    icon: 'List',
    category: 'Lists',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: 'ListOrdered',
    category: 'Lists',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  // Inserts
  {
    title: 'Blockquote',
    description: 'Capture a quote or callout',
    icon: 'Quote',
    category: 'Inserts',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run()
    },
  },
  {
    title: 'Code Block',
    description: 'Display code with syntax highlighting',
    icon: 'Code2',
    category: 'Inserts',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCodeBlock({ language: '' }).run()
    },
  },
  {
    title: 'Divider',
    description: 'Visually divide sections',
    icon: 'Minus',
    category: 'Inserts',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: 'Math',
    description: 'Write a LaTeX formula or equation',
    icon: 'Sigma',
    category: 'Inserts',
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: 'mathBlock', attrs: { content: '' } })
        .run()
    },
  },
  {
    title: 'Callout',
    description: 'Highlight a tip, warning, or important note',
    icon: 'Lightbulb',
    category: 'Inserts',
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'callout',
          attrs: { emoji: '💡', variant: 'info' },
          content: [{ type: 'paragraph' }],
        })
        .run()
    },
  },
  {
    title: 'Toggle',
    description: 'A collapsible section with a title',
    icon: 'ChevronRight',
    category: 'Inserts',
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'toggleBlock',
          attrs: { title: '', open: true },
          content: [{ type: 'paragraph' }],
        })
        .run()
    },
  },
  {
    title: 'Chart',
    description: 'Insert an interactive data chart',
    icon: 'BarChart2',
    category: 'Inserts',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertContent({ type: 'chartBlock' }).run()
    },
  },
]

const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: CommandItem
        }) => {
          props.command(editor, range)
        },
        items: ({ query }: { query: string }) => {
          if (!query) return COMMANDS
          const lower = query.toLowerCase()
          return COMMANDS.filter(
            (item) =>
              item.title.toLowerCase().includes(lower) ||
              item.description.toLowerCase().includes(lower) ||
              item.category.toLowerCase().includes(lower),
          )
        },
        render: () => {
          let component: ReactRenderer<{ onKeyDown: (props: SuggestionKeyDownProps) => boolean }>
          let popup: TippyInstance[] = []

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) return

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                offset: [0, 8],
              })
            },

            onUpdate(props: SuggestionProps) {
              component.updateProps(props)

              if (!props.clientRect) return
              if (popup.length === 0) return

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              })
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === 'Escape') {
                popup[0]?.hide()
                return true
              }
              return component.ref?.onKeyDown(props) ?? false
            },

            onExit() {
              popup[0]?.destroy()
              component.destroy()
            },
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export default SlashCommand
