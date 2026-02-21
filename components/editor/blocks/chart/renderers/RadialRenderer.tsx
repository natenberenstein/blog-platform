import type { ReactNode } from 'react'
import { Cell, Legend, PolarGrid, RadialBar, RadialBarChart } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { ChartOptions, DataRow, SeriesDef } from '../chart-types'

interface RadialRendererProps {
  data: DataRow[]
  series: SeriesDef[]
  colors: string[]
  chartOptions: ChartOptions
  showLegend: boolean
  config: ChartConfig
  tooltipEl: ReactNode
}

const RADIAL_SHAPE_ANGLES = {
  full: { startAngle: 90, endAngle: -270 },
  semi: { startAngle: 180, endAngle: 0 },
  'three-quarter': { startAngle: 135, endAngle: -225 },
}

export default function RadialRenderer({
  data,
  series,
  colors,
  chartOptions,
  showLegend,
  config,
  tooltipEl,
}: RadialRendererProps) {
  const {
    radialLabels = false,
    radialGrid = false,
    radialCenterText = '',
    radialShape = 'full',
    radialStacked = false,
  } = chartOptions
  const { startAngle, endAngle } = RADIAL_SHAPE_ANGLES[radialShape] ?? RADIAL_SHAPE_ANGLES.full

  // Widen the hollow center when center text is present so the text has room.
  const innerRadius = radialCenterText ? '50%' : '20%'
  // No background track when grid is visible (it would obscure the grid lines);
  // otherwise use a soft warm gray instead of Recharts' default black.
  const backgroundProp: false | { fill: string } = radialGrid ? false : { fill: '#F0EDE8' }

  const centerTextOverlay = radialCenterText ? (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="text-sm font-semibold text-[#1C1917]">{radialCenterText}</span>
    </div>
  ) : null
  const radialBarLabel = { position: 'insideStart' as const, fill: 'white', fontSize: 10 }

  if (radialStacked && series.length > 1) {
    const multiRadialData = data.map((row) => ({
      name: row.label,
      ...series.reduce(
        (acc, s) => {
          acc[s.key] = Number(row[s.key] ?? 0)
          return acc
        },
        {} as Record<string, number>,
      ),
    }))
    return (
      <div className="relative">
        <ChartContainer config={config} className="h-64 w-full">
          <RadialBarChart
            data={multiRadialData}
            innerRadius={innerRadius}
            outerRadius="90%"
            startAngle={startAngle}
            endAngle={endAngle}
          >
            {radialGrid && <PolarGrid gridType="circle" stroke="#E5E0D8" />}
            {tooltipEl}
            {series.map((s, i) => (
              <RadialBar
                key={s.key}
                dataKey={s.key}
                stackId="stack"
                fill={colors[i % colors.length]}
                background={i === 0 ? backgroundProp : false}
                label={radialLabels ? radialBarLabel : undefined}
              />
            ))}
            {showLegend && <Legend />}
          </RadialBarChart>
        </ChartContainer>
        {centerTextOverlay}
      </div>
    )
  }

  const radialData = data.map((row, i) => ({
    name: row.label,
    value: Number(row[series[0]?.key ?? 'value'] ?? 0),
    fill: colors[i % colors.length],
  }))
  return (
    <div className="relative">
      <ChartContainer config={config} className="h-64 w-full">
        <RadialBarChart
          data={radialData}
          innerRadius={innerRadius}
          outerRadius="90%"
          startAngle={startAngle}
          endAngle={endAngle}
        >
          {radialGrid && <PolarGrid gridType="circle" stroke="#E5E0D8" />}
          {tooltipEl}
          <RadialBar
            dataKey="value"
            background={backgroundProp}
            label={radialLabels ? radialBarLabel : undefined}
          >
            {radialData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </RadialBar>
          {showLegend && <Legend />}
        </RadialBarChart>
      </ChartContainer>
      {centerTextOverlay}
    </div>
  )
}
