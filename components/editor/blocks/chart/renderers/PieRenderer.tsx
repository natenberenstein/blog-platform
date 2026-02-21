import type { ReactNode } from 'react'
import { useState } from 'react'
import { Cell, Legend, Pie, PieChart, Sector } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { ChartOptions, DataRow, SeriesDef } from '../chart-types'

interface PieRendererProps {
  data: DataRow[]
  series: SeriesDef[]
  colors: string[]
  chartOptions: ChartOptions
  showLegend: boolean
  config: ChartConfig
  tooltipEl: ReactNode
}

export default function PieRenderer({
  data,
  series,
  colors,
  chartOptions,
  showLegend,
  config,
  tooltipEl,
}: PieRendererProps) {
  const {
    pieLabel = 'none',
    pieDonut = false,
    pieNested = false,
    pieInteractive = false,
  } = chartOptions

  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | undefined>(undefined)
  const [clickedPieIndex, setClickedPieIndex] = useState<number | undefined>(undefined)

  const activePieIndex = hoveredPieIndex ?? clickedPieIndex

  // Expands the active sector outward on hover/click.
  const renderActiveShape = (props: {
    cx: number
    cy: number
    innerRadius: number
    outerRadius: number
    startAngle: number
    endAngle: number
    fill: string
  }) => (
    <Sector
      cx={props.cx}
      cy={props.cy}
      innerRadius={props.innerRadius}
      outerRadius={props.outerRadius + 8}
      startAngle={props.startAngle}
      endAngle={props.endAngle}
      fill={props.fill}
    />
  )

  // Inside label: renders the numeric value at each slice's centroid.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insideLabelRenderer = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = props
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 11, pointerEvents: 'none' }}
      >
        {value}
      </text>
    )
  }

  const labelProp =
    pieLabel === 'inside' ? insideLabelRenderer : pieLabel === 'outside' ? true : undefined

  const interactionProps = pieInteractive
    ? {
        activeIndex: activePieIndex,
        activeShape: renderActiveShape as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        onMouseEnter: (_: unknown, idx: number) => setHoveredPieIndex(idx),
        onMouseLeave: () => setHoveredPieIndex(undefined),
        onClick: (_: unknown, idx: number) =>
          setClickedPieIndex((prev) => (prev === idx ? undefined : idx)),
      }
    : {}

  // Compute ring radii for nested (multi-series concentric) mode.
  function getRingRadii(i: number, n: number) {
    const available = 70
    const bandH = Math.floor((available - 5 * (n - 1)) / n)
    const outerPct = 80 - i * (bandH + 5)
    const innerPct = Math.max(outerPct - bandH, 5)
    return { inner: `${innerPct}%`, outer: `${outerPct}%` }
  }

  if (pieNested && series.length > 1) {
    return (
      <ChartContainer config={config} className="h-64 w-full">
        <PieChart>
          {tooltipEl}
          {showLegend && <Legend />}
          {series.map((s, si) => {
            const { inner, outer } = getRingRadii(si, series.length)
            const ringData = data.map((row, di) => ({
              name: row.label,
              value: Number(row[s.key] ?? 0),
              fill: colors[di % colors.length],
            }))
            return (
              <Pie
                key={s.key}
                data={ringData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={inner}
                outerRadius={outer}
                label={labelProp as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                labelLine={pieLabel === 'outside'}
                {...interactionProps}
              >
                {ringData.map((entry, di) => (
                  <Cell key={di} fill={entry.fill} />
                ))}
              </Pie>
            )
          })}
        </PieChart>
      </ChartContainer>
    )
  }

  // Standard single-series pie / donut.
  const pieData = data.map((row, i) => ({
    name: row.label,
    value: Number(row[series[0]?.key ?? 'value'] ?? 0),
    fill: colors[i % colors.length],
  }))

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <PieChart>
        {tooltipEl}
        {showLegend && <Legend />}
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={pieDonut ? '40%' : 0}
          outerRadius="80%"
          label={labelProp as any} // eslint-disable-line @typescript-eslint/no-explicit-any
          labelLine={pieLabel === 'outside'}
          {...interactionProps}
        >
          {pieData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
