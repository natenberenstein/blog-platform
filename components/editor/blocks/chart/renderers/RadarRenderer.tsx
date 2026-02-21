import type { ReactNode } from 'react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { ChartOptions, DataRow, SeriesDef } from '../chart-types'

interface RadarRendererProps {
  data: DataRow[]
  series: SeriesDef[]
  colors: string[]
  chartOptions: ChartOptions
  showGrid: boolean
  config: ChartConfig
  tooltipEl: ReactNode
  legendEl: ReactNode
}

export default function RadarRenderer({
  data,
  series,
  colors,
  chartOptions,
  showGrid,
  config,
  tooltipEl,
  legendEl,
}: RadarRendererProps) {
  const {
    radarDots = false,
    radarFill = true,
    radarLabels = true,
    radarCircleGrid = false,
  } = chartOptions

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <RadarChart data={data}>
        {showGrid && (
          <PolarGrid gridType={radarCircleGrid ? 'circle' : 'polygon'} stroke="#E5E0D8" />
        )}
        <PolarAngleAxis dataKey="label" tick={radarLabels ? undefined : false} />
        {tooltipEl}
        {legendEl}
        {series.map((s, i) => (
          <Radar
            key={s.key}
            dataKey={s.key}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={radarFill ? 0.15 : 0}
            dot={radarDots}
          />
        ))}
      </RadarChart>
    </ChartContainer>
  )
}
