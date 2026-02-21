export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'radial'

export interface DataRow {
  label: string
  [key: string]: string | number
}

export interface SeriesDef {
  key: string
  name: string
}

export interface BarOptions {
  barLayout: 'vertical' | 'horizontal'
  barStacked: boolean
  barLabels: boolean
  barNegative: boolean
}

export interface LineOptions {
  lineCurve: 'monotone' | 'linear' | 'step'
  lineDots: boolean
  lineLabels: boolean
}

export interface AreaOptions {
  areaCurve: 'monotone' | 'linear' | 'step'
  areaGradient: boolean
}

export interface PieOptions {
  pieLabel: 'none' | 'inside' | 'outside'
  pieDonut: boolean
  pieNested: boolean
  pieInteractive: boolean
}

export interface RadarOptions {
  radarDots: boolean
  radarFill: boolean
  radarLabels: boolean
  radarCircleGrid: boolean
}

export interface RadialOptions {
  radialLabels: boolean
  radialGrid: boolean
  radialCenterText: string
  radialShape: 'full' | 'semi' | 'three-quarter'
  radialStacked: boolean
}

export type ChartOptionMap = BarOptions &
  LineOptions &
  AreaOptions &
  PieOptions &
  RadarOptions &
  RadialOptions

export type ChartOptions = Partial<ChartOptionMap>

export interface ChartNodeAttributes {
  chartType: ChartType
  title: string
  data: DataRow[]
  series: SeriesDef[]
  showLegend: boolean
  showGrid: boolean
  colors: string[]
  chartOptions: ChartOptions
}
