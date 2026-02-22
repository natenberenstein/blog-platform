'use client'

import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from '@blocknote/core/extensions'
import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  type DefaultReactSuggestionItem,
} from '@blocknote/react'
import {
  withMultiColumn,
  multiColumnDropCursor,
  getMultiColumnSlashMenuItems,
  locales as multiColumnLocales,
} from '@blocknote/xl-multi-column'
import { BarChart2, Lightbulb, Sigma } from 'lucide-react'

import { ChartBlockSpec } from './blocks/chart/ChartBlockSpec'
import { CalloutBlockSpec } from './blocks/callout/CalloutBlockSpec'
import { MathBlockSpec } from './blocks/math/MathBlockSpec'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = withMultiColumn(
  BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      chart: ChartBlockSpec(),
      callout: CalloutBlockSpec(),
      math: MathBlockSpec(),
    },
  }),
)

type EditorType = typeof schema.BlockNoteEditor

// ─── Custom slash menu items ──────────────────────────────────────────────────

function getCustomSlashMenuItems(editor: EditorType): DefaultReactSuggestionItem[] {
  return [
    ...getDefaultReactSlashMenuItems(editor),
    ...getMultiColumnSlashMenuItems(editor),
    {
      title: 'Chart',
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: 'chart' }),
      aliases: ['chart', 'graph', 'visualization'],
      group: 'Inserts',
      icon: <BarChart2 size={18} />,
      subtext: 'Insert an interactive chart',
    },
    {
      title: 'Callout',
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: 'callout' }),
      aliases: ['callout', 'alert', 'note', 'tip'],
      group: 'Inserts',
      icon: <Lightbulb size={18} />,
      subtext: 'Insert a callout block',
    },
    {
      title: 'Math',
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: 'math' }),
      aliases: ['math', 'latex', 'equation', 'formula'],
      group: 'Inserts',
      icon: <Sigma size={18} />,
      subtext: 'Insert a math equation',
    },
  ]
}

// ─── Editor component ─────────────────────────────────────────────────────────

export default function Editor() {
  const editor = useCreateBlockNote({
    schema,
    dropCursor: multiColumnDropCursor,
  })

  // Register multi-column dictionary (required by getMultiColumnSlashMenuItems)
  if (!editor.dictionary.multi_column) {
    editor.dictionary.multi_column = multiColumnLocales.en
  }

  return (
    <div style={{ position: 'relative' }}>
      <BlockNoteView editor={editor} slashMenu={false} theme="light">
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(getCustomSlashMenuItems(editor), query)
          }
        />
      </BlockNoteView>
    </div>
  )
}
