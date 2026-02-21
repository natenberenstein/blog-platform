import {
  Activity,
  BarChart2,
  Disc,
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  TrendingUp,
} from 'lucide-react'
import type React from 'react'
import type { ChartType } from './chart-types'

export interface ChartTypeOption {
  type: ChartType
  label: string
  Icon: React.ElementType
}

export const CHART_TYPE_OPTIONS: ChartTypeOption[] = [
  { type: 'bar', label: 'Bar', Icon: BarChart2 },
  { type: 'line', label: 'Line', Icon: TrendingUp },
  { type: 'area', label: 'Area', Icon: Activity },
  { type: 'pie', label: 'Pie', Icon: PieChartIcon },
  { type: 'radar', label: 'Radar', Icon: RadarIcon },
  { type: 'radial', label: 'Radial', Icon: Disc },
]
