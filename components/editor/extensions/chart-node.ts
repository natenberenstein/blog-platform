import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ChartBlock from '../ChartBlock'

const DEFAULT_DATA = [
  { label: 'Jan', value: 186 },
  { label: 'Feb', value: 305 },
  { label: 'Mar', value: 237 },
  { label: 'Apr', value: 273 },
  { label: 'May', value: 209 },
  { label: 'Jun', value: 314 },
]

const DEFAULT_SERIES = [{ key: 'value', name: 'Value' }]

const DEFAULT_COLORS = ['#0F766E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981']

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
        default: DEFAULT_DATA,
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute('data-chart-data') ?? '')
          } catch {
            return DEFAULT_DATA
          }
        },
        renderHTML: (attrs) => ({ 'data-chart-data': JSON.stringify(attrs.data) }),
      },
      series: {
        default: DEFAULT_SERIES,
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute('data-chart-series') ?? '')
          } catch {
            return DEFAULT_SERIES
          }
        },
        renderHTML: (attrs) => ({ 'data-chart-series': JSON.stringify(attrs.series) }),
      },
      showLegend: {
        default: true,
        parseHTML: (el) => el.getAttribute('data-chart-legend') === 'true',
        renderHTML: (attrs) => ({ 'data-chart-legend': String(attrs.showLegend) }),
      },
      showGrid: {
        default: true,
        parseHTML: (el) => el.getAttribute('data-chart-grid') === 'true',
        renderHTML: (attrs) => ({ 'data-chart-grid': String(attrs.showGrid) }),
      },
      colors: {
        default: DEFAULT_COLORS,
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute('data-chart-colors') ?? '')
          } catch {
            return DEFAULT_COLORS
          }
        },
        renderHTML: (attrs) => ({ 'data-chart-colors': JSON.stringify(attrs.colors) }),
      },
      chartOptions: {
        default: {},
        parseHTML: (el) => {
          try { return JSON.parse(el.getAttribute('data-chart-options') ?? '{}') }
          catch { return {} }
        },
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
