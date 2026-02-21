import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, XAxis, YAxis } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { ChartOptions, DataRow, SeriesDef } from '../chart-types'

interface BarRendererProps {
  data: DataRow[]
  series: SeriesDef[]
  colors: string[]
  chartOptions: ChartOptions
  showGrid: boolean
  config: ChartConfig
  tooltipEl: ReactNode
  legendEl: ReactNode
}

export default function BarRenderer({
  data,
  series,
  colors,
  chartOptions,
  showGrid,
  config,
  tooltipEl,
  legendEl,
}: BarRendererProps) {
  const {
    barLayout = 'vertical',
    barStacked = false,
    barLabels = false,
    barNegative = false,
  } = chartOptions
  const isHorizontal = barLayout === 'horizontal'
  // recharts uses layout="vertical" for horizontal bars (axes swap)
  const rechartsLayout = isHorizontal ? 'vertical' : 'horizontal'

  const barGridEl = showGrid ? (
    isHorizontal ? (
      <CartesianGrid horizontal={false} stroke="#E5E0D8" />
    ) : (
      <CartesianGrid vertical={false} stroke="#E5E0D8" />
    )
  ) : null

  const barXAxis = isHorizontal ? (
    <XAxis type="number" tickLine={false} axisLine={false} />
  ) : (
    <XAxis dataKey="label" tickLine={false} axisLine={false} />
  )

  const barYAxis = isHorizontal ? (
    <YAxis dataKey="label" type="category" width={50} tickLine={false} axisLine={false} />
  ) : (
    <YAxis tickLine={false} axisLine={false} />
  )

  const refLineEl = barNegative ? (
    isHorizontal ? (
      <ReferenceLine x={0} stroke="#A09A94" strokeDasharray="3 3" />
    ) : (
      <ReferenceLine y={0} stroke="#A09A94" strokeDasharray="3 3" />
    )
  ) : null

  function barRadius(i: number): [number, number, number, number] {
    if (!barStacked) {
      return isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]
    }
    const isLast = i === series.length - 1
    return isLast ? (isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]) : [0, 0, 0, 0]
  }

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} layout={rechartsLayout}>
        {barGridEl}
        {barXAxis}
        {barYAxis}
        {tooltipEl}
        {legendEl}
        {refLineEl}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={colors[i % colors.length]}
            radius={barRadius(i)}
            stackId={barStacked ? 'stack' : undefined}
          >
            {barLabels && (
              <LabelList
                dataKey={s.key}
                position={barStacked ? 'center' : isHorizontal ? 'right' : 'top'}
                style={{ fontSize: 10, fill: barStacked ? '#FFFFFF' : '#6B6560' }}
              />
            )}
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  )
}
