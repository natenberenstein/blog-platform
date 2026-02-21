import { CartesianGrid } from 'recharts'
import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartOptions, ChartType, DataRow, SeriesDef } from '../chart-types'
import { buildConfig } from '../chart-utils'
import AreaRenderer from './AreaRenderer'
import BarRenderer from './BarRenderer'
import LineRenderer from './LineRenderer'
import PieRenderer from './PieRenderer'
import RadarRenderer from './RadarRenderer'
import RadialRenderer from './RadialRenderer'

interface ChartRendererProps {
  type: ChartType
  data: DataRow[]
  series: SeriesDef[]
  colors: string[]
  showLegend: boolean
  showGrid: boolean
  chartOptions: ChartOptions
}

export default function ChartRenderer({
  type,
  data,
  series,
  colors,
  showLegend,
  showGrid,
  chartOptions,
}: ChartRendererProps) {
  const config = buildConfig(type, series, data, colors)
  const gridEl = showGrid ? <CartesianGrid vertical={false} stroke="#E5E0D8" /> : null
  const tooltipEl = <ChartTooltip content={<ChartTooltipContent />} />
  const legendEl =
    showLegend && (type === 'bar' || type === 'line' || type === 'area' || type === 'radar') ? (
      <ChartLegend content={<ChartLegendContent />} />
    ) : null

  if (type === 'bar') {
    return (
      <BarRenderer
        data={data}
        series={series}
        colors={colors}
        chartOptions={chartOptions}
        showGrid={showGrid}
        config={config}
        tooltipEl={tooltipEl}
        legendEl={legendEl}
      />
    )
  }

  if (type === 'line') {
    return (
      <LineRenderer
        data={data}
        series={series}
        colors={colors}
        chartOptions={chartOptions}
        gridEl={gridEl}
        config={config}
        tooltipEl={tooltipEl}
        legendEl={legendEl}
      />
    )
  }

  if (type === 'area') {
    return (
      <AreaRenderer
        data={data}
        series={series}
        colors={colors}
        chartOptions={chartOptions}
        gridEl={gridEl}
        config={config}
        tooltipEl={tooltipEl}
        legendEl={legendEl}
      />
    )
  }

  if (type === 'pie') {
    return (
      <PieRenderer
        data={data}
        series={series}
        colors={colors}
        chartOptions={chartOptions}
        showLegend={showLegend}
        config={config}
        tooltipEl={tooltipEl}
      />
    )
  }

  if (type === 'radar') {
    return (
      <RadarRenderer
        data={data}
        series={series}
        colors={colors}
        chartOptions={chartOptions}
        showGrid={showGrid}
        config={config}
        tooltipEl={tooltipEl}
        legendEl={legendEl}
      />
    )
  }

  return (
    <RadialRenderer
      data={data}
      series={series}
      colors={colors}
      chartOptions={chartOptions}
      showLegend={showLegend}
      config={config}
      tooltipEl={tooltipEl}
    />
  )
}
