import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CalloutBlock from '../blocks/callout/CalloutBlock'

const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'paragraph+',

  addAttributes() {
    return {
      emoji: { default: '💡' },
      variant: { default: 'info' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutBlock)
  },
})

export default CalloutNode
