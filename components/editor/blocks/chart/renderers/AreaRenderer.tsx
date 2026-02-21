import type { ReactNode } from 'react'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { ChartOptions, DataRow, SeriesDef } from '../chart-types'

interface AreaRendererProps {
  data: DataRow[]
  series: SeriesDef[]
  colors: string[]
  chartOptions: ChartOptions
  gridEl: ReactNode
  config: ChartConfig
  tooltipEl: ReactNode
  legendEl: ReactNode
}

export default function AreaRenderer({
  data,
  series,
  colors,
  chartOptions,
  gridEl,
  config,
  tooltipEl,
  legendEl,
}: AreaRendererProps) {
  const { areaCurve = 'monotone', areaGradient = false } = chartOptions

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <AreaChart data={data}>
        {areaGradient && (
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`areaGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.4} />
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
        )}
        {gridEl}
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        {tooltipEl}
        {legendEl}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type={areaCurve}
            dataKey={s.key}
            stroke={colors[i % colors.length]}
            fill={areaGradient ? `url(#areaGrad-${i})` : colors[i % colors.length]}
            fillOpacity={areaGradient ? 1 : 0.15}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}
