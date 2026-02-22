'use client'

import { createReactBlockSpec } from '@blocknote/react'
import CalloutBlock from './CalloutBlock'

export const CalloutBlockSpec = createReactBlockSpec(
  {
    type: 'callout',
    propSchema: {
      emoji: { default: '💡' },
      variant: {
        default: 'info' as const,
        values: ['info', 'warning', 'success', 'danger', 'neutral'] as const,
      },
    },
    content: 'inline',
  },
  {
    render: (props) => {
      return (
        <CalloutBlock
          emoji={props.block.props.emoji}
          variant={props.block.props.variant}
          contentRef={props.contentRef}
          updateAttributes={(attrs) =>
            props.editor.updateBlock(props.block, {
              type: 'callout',
              props: attrs,
            })
          }
          deleteNode={() => props.editor.removeBlocks([props.block])}
        />
      )
    },
  },
)
