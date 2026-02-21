import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ChartBlock from '../blocks/chart/ChartBlock'
import {
  DEFAULT_CHART_COLORS,
  DEFAULT_CHART_DATA,
  DEFAULT_CHART_SERIES,
  parseBooleanAttribute,
  parseJsonAttribute,
} from '../blocks/chart/chart-defaults'

const ChartNode = Node.create({
  name: 'chartBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      chartType: {
        default: 'bar',
        parseHTML: (el) => el.getAttribute('data-chart-type') ?? 'bar',
        renderHTML: (attrs) => ({ 'data-chart-type': attrs.chartType }),
      },
      title: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-chart-title') ?? '',
        renderHTML: (attrs) => ({ 'data-chart-title': attrs.title }),
      },
      data: {
        default: DEFAULT_CHART_DATA,
        parseHTML: (el) =>
          parseJsonAttribute(el.getAttribute('data-chart-data'), DEFAULT_CHART_DATA),
        renderHTML: (attrs) => ({ 'data-chart-data': JSON.stringify(attrs.data) }),
      },
      series: {
        default: DEFAULT_CHART_SERIES,
        parseHTML: (el) =>
          parseJsonAttribute(el.getAttribute('data-chart-series'), DEFAULT_CHART_SERIES),
        renderHTML: (attrs) => ({ 'data-chart-series': JSON.stringify(attrs.series) }),
      },
      showLegend: {
        default: true,
        parseHTML: (el) => parseBooleanAttribute(el.getAttribute('data-chart-legend'), true),
        renderHTML: (attrs) => ({ 'data-chart-legend': String(attrs.showLegend) }),
      },
      showGrid: {
        default: true,
        parseHTML: (el) => parseBooleanAttribute(el.getAttribute('data-chart-grid'), true),
        renderHTML: (attrs) => ({ 'data-chart-grid': String(attrs.showGrid) }),
      },
      colors: {
        default: DEFAULT_CHART_COLORS,
        parseHTML: (el) =>
          parseJsonAttribute(el.getAttribute('data-chart-colors'), DEFAULT_CHART_COLORS),
        renderHTML: (attrs) => ({ 'data-chart-colors': JSON.stringify(attrs.colors) }),
      },
      chartOptions: {
        default: {},
        parseHTML: (el) => parseJsonAttribute(el.getAttribute('data-chart-options'), {}),
        renderHTML: (attrs) => ({ 'data-chart-options': JSON.stringify(attrs.chartOptions) }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chart-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'chart-block' }, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartBlock)
  },
})

export default ChartNode
