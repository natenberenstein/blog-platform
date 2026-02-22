'use client'

import { createReactBlockSpec } from '@blocknote/react'
import ChartBlock from './ChartBlock'
import {
  DEFAULT_CHART_COLORS,
  DEFAULT_CHART_DATA,
  DEFAULT_CHART_SERIES,
} from './chart-defaults'

export const ChartBlockSpec = createReactBlockSpec(
  {
    type: 'chart',
    propSchema: {
      chartType: { default: 'bar' },
      title: { default: '' },
      data: { default: JSON.stringify(DEFAULT_CHART_DATA) },
      series: { default: JSON.stringify(DEFAULT_CHART_SERIES) },
      showLegend: { default: 'true' },
      showGrid: { default: 'true' },
      colors: { default: JSON.stringify(DEFAULT_CHART_COLORS) },
      chartOptions: { default: '{}' },
    },
    content: 'none',
  },
  {
    render: (props) => {
      const blockProps = props.block.props

      const parsedData = (() => {
        try {
          return JSON.parse(blockProps.data)
        } catch {
          return DEFAULT_CHART_DATA
        }
      })()

      const parsedSeries = (() => {
        try {
          return JSON.parse(blockProps.series)
        } catch {
          return DEFAULT_CHART_SERIES
        }
      })()

      const parsedColors = (() => {
        try {
          return JSON.parse(blockProps.colors)
        } catch {
          return DEFAULT_CHART_COLORS
        }
      })()

      const parsedChartOptions = (() => {
        try {
          return JSON.parse(blockProps.chartOptions)
        } catch {
          return {}
        }
      })()

      function updateProps(updates: Record<string, unknown>) {
        const serialized: Record<string, string> = {}
        for (const [key, value] of Object.entries(updates)) {
          if (typeof value === 'string') {
            serialized[key] = value
          } else if (typeof value === 'boolean') {
            serialized[key] = String(value)
          } else {
            serialized[key] = JSON.stringify(value)
          }
        }
        props.editor.updateBlock(props.block, {
          type: 'chart',
          props: serialized,
        })
      }

      return (
        <ChartBlock
          chartType={blockProps.chartType}
          title={blockProps.title}
          data={parsedData}
          series={parsedSeries}
          showLegend={blockProps.showLegend === 'true'}
          showGrid={blockProps.showGrid === 'true'}
          colors={parsedColors}
          chartOptions={parsedChartOptions}
          updateAttributes={updateProps}
          deleteNode={() => props.editor.removeBlocks([props.block])}
        />
      )
    },
  },
)
