import type { ReactNode } from 'react'
import { Line, LineChart, XAxis, YAxis, LabelList } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { ChartOptions, DataRow, SeriesDef } from '../chart-types'

interface LineRendererProps {
  data: DataRow[]
  series: SeriesDef[]
  colors: string[]
  chartOptions: ChartOptions
  gridEl: ReactNode
  config: ChartConfig
  tooltipEl: ReactNode
  legendEl: ReactNode
}

export default function LineRenderer({
  data,
  series,
  colors,
  chartOptions,
  gridEl,
  config,
  tooltipEl,
  legendEl,
}: LineRendererProps) {
  const { lineCurve = 'monotone', lineDots = false, lineLabels = false } = chartOptions

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <LineChart data={data}>
        {gridEl}
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        {tooltipEl}
        {legendEl}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type={lineCurve}
            dataKey={s.key}
            stroke={colors[i % colors.length]}
            dot={lineDots}
            strokeWidth={2}
          >
            {lineLabels && (
              <LabelList dataKey={s.key} position="top" style={{ fontSize: 10, fill: '#6B6560' }} />
            )}
          </Line>
        ))}
      </LineChart>
    </ChartContainer>
  )
}
