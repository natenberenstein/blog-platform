'use client'

import { createReactBlockSpec } from '@blocknote/react'
import MathBlock from './MathBlock'

export const MathBlockSpec = createReactBlockSpec(
  {
    type: 'math',
    propSchema: {
      content: { default: '' },
    },
    content: 'none',
  },
  {
    render: (props) => {
      return (
        <MathBlock
          content={props.block.props.content}
          updateAttributes={(attrs) =>
            props.editor.updateBlock(props.block, {
              type: 'math',
              props: attrs,
            })
          }
          deleteNode={() => props.editor.removeBlocks([props.block])}
        />
      )
    },
  },
)
