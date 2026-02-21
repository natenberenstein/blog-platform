# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Next.js dev server
npm run build    # production build
npm run lint     # ESLint via next lint
```

No test suite is configured.

## Architecture

A Next.js 15 / React 19 app. The only page (`app/page.tsx`) renders a plain `contentEditable` title div and a dynamically-imported `<Editor>` (SSR disabled — Tiptap requires browser APIs).

### Editor (`components/editor/`)

The core is a **Tiptap v2** rich-text editor. All logic lives under `components/editor/`:

- **`Editor.tsx`** — mounts `useEditor`, registers all extensions, and renders the `BubbleMenu` (inline formatting toolbar) and `EditorContent`. This is the single file to touch when adding or removing an extension.
- **`extensions/`** — one file per Tiptap extension. Each file creates a `Node.create()` (or `Extension.create()`) and wires it to a React component via `ReactNodeViewRenderer`.
- **`SlashCommandList.tsx`** — the rendered dropdown for the `/` command palette. Icons must be added to both the `ICON_MAP` here and the `COMMANDS` array in `extensions/slash-command.ts`.

### Node view pattern

Every custom block follows the same two-file pattern:

| File | Role |
|---|---|
| `extensions/foo-node.ts` | Declares the ProseMirror node (name, group, content, attrs, parseHTML/renderHTML, addNodeView) |
| `FooBlock.tsx` | The React component rendered by `ReactNodeViewRenderer` |

**Atom nodes** (`atom: true`, e.g. ChartBlock, MathBlock): the entire block is a single ProseMirror leaf. No `NodeViewContent`. All state lives in node attributes.

**Content nodes** (e.g. CalloutBlock, ToggleBlock): have editable ProseMirror content inside. Use `<NodeViewContent />` for the editable region, and `contentEditable={false}` on a wrapper `<div>` (not on `<NodeViewWrapper>`) for non-editable chrome (buttons, inputs).

### Keyboard events inside NodeViews

React's synthetic `onKeyDown` fires at the React root container **after** ProseMirror's native listener on the editor div — so `e.stopPropagation()` in a React handler is too late to block ProseMirror. Any `<input>` or `<textarea>` inside a NodeView must use **native DOM listeners** added in a `useEffect`:

```ts
useEffect(() => {
  const el = ref.current
  if (!el) return
  const stop = (e: Event) => e.stopPropagation()
  el.addEventListener('keydown', stop)
  return () => el.removeEventListener('keydown', stop)
}, [])
```

### Drag handle (`extensions/drag-handle.ts`)

A single global ProseMirror plugin (not per-block). On `mousemove` it resolves the cursor's document position to the nearest draggable unit — a `listItem` when inside a list, otherwise the depth-1 block — then positions a `position: fixed` grip icon to the left of that element. On `dragstart` it dispatches a `NodeSelection` and sets `view.dragging = { slice, move: true }` so ProseMirror's built-in drop handler performs the move. The `NodeSelection` is essential: without it, `tr.deleteSelection()` in the drop handler has nothing to delete and the block is duplicated.

### Slash command

Defined in `extensions/slash-command.ts` (`COMMANDS` array). Uses Tiptap's `Suggestion` extension with a Tippy.js popup. To add a command: add an entry to `COMMANDS` and add the icon to `ICON_MAP` in `SlashCommandList.tsx`.

### Styling

- **Design tokens** — raw CSS custom properties in `app/globals.css` (`:root` block at the top): `--bg`, `--surface`, `--border`, `--text`, `--muted`, `--placeholder`, `--teal`, `--teal-light`.
- **shadcn/ui tokens** — HSL variables in `@layer base` in the same file. The un-layered `:root` block has higher specificity than `@layer base`, so shadcn token names must not conflict with design token names (historical issue: `--accent` was renamed to `--teal` to avoid overriding shadcn's `--accent`).
- **ProseMirror styles** — `.ProseMirror` rules in `globals.css` style all editor content (headings, lists, blockquote, code, etc.).
- Components use **Tailwind** for layout and **inline styles** for design-token colors that can't be expressed as Tailwind classes. Tailwind's `font-sans` maps to DM Sans; `font-lora` / the `lora` family is used for body prose. shadcn is configured with the `new-york` style.
- The shadcn CLI fails due to peer dependency conflicts; install Radix primitives with `--legacy-peer-deps` and write the component manually.

### Code block highlighting

`extensions/code-block.ts` extends `CodeBlockLowlight` with a debounced ProseMirror plugin to avoid re-running `lowlight.highlight()` on every keystroke. The plugin maps existing decorations in `apply()` (cheap) and defers `buildDecorations()` 300 ms via `setTimeout` + `setMeta`. A custom `update` callback on `ReactNodeViewRenderer` skips React re-renders unless the `language` attribute changes.
