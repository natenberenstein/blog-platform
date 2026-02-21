import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, NodeSelection } from '@tiptap/pm/state'
import { Fragment, Slice } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PosAtCoords = NonNullable<ReturnType<EditorView['posAtCoords']>>

/**
 * Return the position of the best draggable node under the cursor:
 * - a listItem, when the cursor is inside one (so individual items can be
 *   reordered independently of the surrounding list)
 * - otherwise the top-level (depth-1) block
 */
function getDraggablePos(view: EditorView, coords: PosAtCoords): number | null {
  if (coords.pos < 0) return null
  try {
    const $pos = view.state.doc.resolve(coords.pos)
    if ($pos.depth === 0) return null

    // Walk from innermost → outermost; stop at the first listItem we find.
    for (let d = $pos.depth; d >= 1; d--) {
      if ($pos.node(d).type.name === 'listItem') {
        return $pos.before(d)
      }
    }

    // Not inside a list item — use the direct child of the document.
    return $pos.before(1)
  } catch {
    return null
  }
}

const GRIP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
  viewBox="0 0 24 24" fill="currentColor">
  <circle cx="9"  cy="5"  r="1.5"/>
  <circle cx="9"  cy="12" r="1.5"/>
  <circle cx="9"  cy="19" r="1.5"/>
  <circle cx="15" cy="5"  r="1.5"/>
  <circle cx="15" cy="12" r="1.5"/>
  <circle cx="15" cy="19" r="1.5"/>
</svg>`

// ─── Plugin ───────────────────────────────────────────────────────────────────

const DragHandleKey = new PluginKey('dragHandle')

function createDragHandlePlugin() {
  return new Plugin({
    key: DragHandleKey,

    view(editorView) {
      // The handle lives in <body> so it can float outside the editor container.
      const handle = document.createElement('div')
      handle.className = 'tiptap-drag-handle'
      handle.setAttribute('contenteditable', 'false')
      handle.setAttribute('draggable', 'true')
      handle.innerHTML = GRIP_SVG
      document.body.appendChild(handle)

      let currentNodePos = -1
      let hideTimer: ReturnType<typeof setTimeout> | null = null

      function show() {
        if (hideTimer) {
          clearTimeout(hideTimer)
          hideTimer = null
        }
        handle.classList.add('is-visible')
      }

      function scheduleHide() {
        if (hideTimer) return
        hideTimer = setTimeout(() => {
          handle.classList.remove('is-visible')
          hideTimer = null
        }, 300)
      }

      // ── Track which block the cursor is over ──
      function onMouseMove(e: MouseEvent) {
        const coords = editorView.posAtCoords({ left: e.clientX, top: e.clientY })
        if (!coords) {
          scheduleHide()
          return
        }

        const pos = getDraggablePos(editorView, coords)
        if (pos === null) {
          scheduleHide()
          return
        }

        currentNodePos = pos

        const dom = editorView.nodeDOM(pos)
        if (!(dom instanceof HTMLElement)) {
          scheduleHide()
          return
        }

        const rect = dom.getBoundingClientRect()

        // For list items the bullet marker sits in the <ul>/<ol>'s padding-left
        // area, between the list's left edge and the <li>'s left edge. Anchoring
        // to li.left - 28 puts the handle right on top of the marker. Instead,
        // use the parent list's left edge so the handle clears the bullet.
        const node = editorView.state.doc.nodeAt(pos)
        const isListItem = node?.type.name === 'listItem'
        const leftAnchor = isListItem
          ? (dom.parentElement?.getBoundingClientRect().left ?? rect.left)
          : rect.left

        // position: fixed so top/left are viewport-relative — same as getBCR()
        handle.style.top = `${rect.top}px`
        handle.style.left = `${leftAnchor - 28}px` // 20px handle + 8px gap
        handle.style.height = `${rect.height}px`
        show()
      }

      // ── Drag setup ────────────────────────────────────────────────────────
      function onDragStart(e: DragEvent) {
        if (currentNodePos < 0 || !e.dataTransfer) return
        const node = editorView.state.doc.nodeAt(currentNodePos)
        if (!node) return

        // ProseMirror's drop handler removes the original by calling
        // tr.deleteSelection(). For that to delete the right block we must
        // set a NodeSelection covering the entire block BEFORE the drag.
        const sel = NodeSelection.create(editorView.state.doc, currentNodePos)
        editorView.dispatch(editorView.state.tr.setSelection(sel))

        // Tell ProseMirror what is being dragged and that it's a move.
        const slice = new Slice(Fragment.from(node), 0, 0)
        ;(
          editorView as EditorView & {
            dragging: { slice: Slice; move: boolean } | null
          }
        ).dragging = { slice, move: true }

        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', ' ')

        // Use the block's own DOM as the ghost so the user sees what's moving.
        const nodeDom = editorView.nodeDOM(currentNodePos)
        if (nodeDom instanceof HTMLElement) {
          e.dataTransfer.setDragImage(nodeDom, 0, 16)
        }
      }

      // ── Wire up listeners ─────────────────────────────────────────────────
      editorView.dom.addEventListener('mousemove', onMouseMove)
      editorView.dom.addEventListener('mouseleave', scheduleHide)
      handle.addEventListener('mouseenter', show)
      handle.addEventListener('mouseleave', scheduleHide)
      handle.addEventListener('dragstart', onDragStart)
      handle.addEventListener('dragend', scheduleHide)

      return {
        destroy() {
          if (hideTimer) clearTimeout(hideTimer)
          editorView.dom.removeEventListener('mousemove', onMouseMove)
          editorView.dom.removeEventListener('mouseleave', scheduleHide)
          handle.remove()
        },
      }
    },
  })
}

// ─── Extension ────────────────────────────────────────────────────────────────

const DragHandle = Extension.create({
  name: 'dragHandle',
  addProseMirrorPlugins() {
    return [createDragHandlePlugin()]
  },
})

export default DragHandle
