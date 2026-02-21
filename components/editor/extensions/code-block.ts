import { findChildren } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { common, createLowlight } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CodeBlockComponent from '../CodeBlockComponent'

const lowlight = createLowlight(common)
const pluginKey = new PluginKey('lowlight-debounced')

// ─── AST → flat token list ────────────────────────────────────────────────────

type HastNode = {
  type: string
  value?: string
  children?: HastNode[]
  properties?: { className?: string[] }
}

function parseNodes(nodes: HastNode[], inherited: string[] = []): { text: string; classes: string[] }[] {
  return nodes.flatMap((node) => {
    const classes = [
      ...inherited,
      ...(node.properties?.className ?? []),
    ]
    if (node.children) return parseNodes(node.children, classes)
    return [{ text: node.value ?? '', classes }]
  })
}

// ─── Build a full DecorationSet for all code blocks in the doc ───────────────

function buildDecorations(
  doc: ReturnType<typeof Object>,
  name: string,
  defaultLanguage: string | null | undefined,
): DecorationSet {
  const decorations: Decoration[] = []

  findChildren(doc as never, (node) => node.type.name === name).forEach((block) => {
    const language: string = block.node.attrs.language || defaultLanguage || ''
    if (!language) return

    let pos = block.pos + 1
    try {
      const result = lowlight.highlight(language, block.node.textContent)
      parseNodes((result as unknown as { children: HastNode[] }).children).forEach(({ text, classes }) => {
        if (classes.length) {
          decorations.push(Decoration.inline(pos, pos + text.length, { class: classes.join(' ') }))
        }
        pos += text.length
      })
    } catch {
      // unknown language — leave plain
    }
  })

  return DecorationSet.create(doc as never, decorations)
}

// ─── Debounced plugin ─────────────────────────────────────────────────────────
//
// On every transaction that touches a code block, the plugin immediately maps
// the existing decorations to the new positions (cheap, zero parsing) so the
// displayed tokens don't shift. The actual lowlight.highlight() call is
// deferred 300 ms; once the user stops typing it dispatches a meta-transaction
// that swaps in the fresh DecorationSet.

function createDebouncedPlugin(
  name: string,
  defaultLanguage: string | null | undefined,
  debounceMs = 300,
): Plugin {
  let timer: ReturnType<typeof setTimeout> | null = null

  return new Plugin({
    key: pluginKey,

    state: {
      init(_, { doc }) {
        return buildDecorations(doc, name, defaultLanguage)
      },
      apply(tr, decorationSet) {
        // If this transaction carries fresh decorations, apply them.
        const fresh = tr.getMeta(pluginKey) as DecorationSet | undefined
        if (fresh) return fresh
        // Otherwise just remap positions; no parsing.
        if (!tr.docChanged) return decorationSet
        return decorationSet.map(tr.mapping, tr.doc)
      },
    },

    view(view) {
      return {
        update(view, prevState) {
          if (view.state.doc.eq(prevState.doc)) return
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            const decorations = buildDecorations(view.state.doc, name, defaultLanguage)
            view.dispatch(view.state.tr.setMeta(pluginKey, decorations))
          }, debounceMs)
        },
        destroy() {
          if (timer) clearTimeout(timer)
        },
      }
    },

    props: {
      decorations(state) {
        return pluginKey.getState(state)
      },
    },
  })
}

// ─── Extension ────────────────────────────────────────────────────────────────

const CodeBlock = CodeBlockLowlight
  .extend({
    addKeyboardShortcuts() {
      return {
        Tab: () => {
          if (!this.editor.isActive('codeBlock')) return false
          this.editor.commands.insertContent('    ')
          return true
        },
      }
    },

    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent, {
        // Only re-render the React component when the language attribute changes.
        // Content changes (typing) are written directly to the contentDOM by
        // ProseMirror; decoration updates (from our debounced plugin) also don't
        // need to re-render the header UI. This eliminates the per-keystroke lag.
        update: ({ oldNode, newNode, updateProps }) => {
          if (oldNode.attrs.language !== newNode.attrs.language) updateProps()
          return true
        },
      })
    },
    // Override the synchronous lowlight plugin with our debounced version.
    addProseMirrorPlugins() {
      return [
        createDebouncedPlugin(this.name, this.options.defaultLanguage, 300),
      ]
    },
  })
  .configure({ lowlight })

export default CodeBlock
