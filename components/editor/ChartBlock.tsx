'use client'

import React, { useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import {
  BarChart2,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  Disc,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  RadialBarChart,
  RadialBar,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  ReferenceLine,
  Sector,
  Legend,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import Papa from 'papaparse'

// ─── Types ────────────────────────────────────────────────────────────────────

type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'radial'

interface DataRow {
  label: string
  [key: string]: string | number
}

interface SeriesDef {
  key: string
  name: string
}

interface BarOptions {
  barLayout: 'vertical' | 'horizontal'
  barStacked: boolean
  barLabels: boolean
  barNegative: boolean
}

interface LineOptions {
  lineCurve: 'monotone' | 'linear' | 'step'
  lineDots: boolean
  lineLabels: boolean
}

interface AreaOptions {
  areaCurve: 'monotone' | 'linear' | 'step'
  areaGradient: boolean
}

interface PieOptions {
  pieLabel: 'none' | 'inside' | 'outside'
  pieDonut: boolean
  pieNested: boolean
  pieInteractive: boolean
}

interface RadarOptions {
  radarDots: boolean       // show dots at data points (default: false)
  radarFill: boolean       // show filled area (default: true); false = lines only
  radarLabels: boolean     // show axis labels (default: true)
  radarCircleGrid: boolean // circular grid lines vs polygon (default: false)
}

interface RadialOptions {
  radialLabels: boolean                            // value labels on bars
  radialGrid: boolean                              // polar grid overlay
  radialCenterText: string                         // text displayed in the center
  radialShape: 'full' | 'semi' | 'three-quarter'  // arc angle preset
  radialStacked: boolean                           // multi-series stacked bars
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeKey(name: string): string {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
}

function buildConfig(
  type: ChartType,
  series: SeriesDef[],
  data: DataRow[],
  colors: string[],
): ChartConfig {
  if (type === 'pie' || type === 'radial') {
    const config: ChartConfig = {}
    data.forEach((row, i) => {
      const key = sanitizeKey(String(row.label))
      config[key] = { label: String(row.label), color: colors[i % colors.length] }
    })
    return config
  }
  const config: ChartConfig = {}
  series.forEach((s, i) => {
    config[s.key] = { label: s.name, color: colors[i % colors.length] }
  })
  return config
}

// ─── ChartRenderer ────────────────────────────────────────────────────────────

interface ChartRendererProps {
  type: ChartType
  data: DataRow[]
  series: SeriesDef[]
  colors: string[]
  showLegend: boolean
  showGrid: boolean
  chartOptions: Partial<BarOptions & LineOptions & AreaOptions & PieOptions & RadarOptions & RadialOptions>
}

function ChartRenderer({ type, data, series, colors, showLegend, showGrid, chartOptions }: ChartRendererProps) {
  const config = buildConfig(type, series, data, colors)

  // Pie interaction state (always called; only used in pie branch)
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | undefined>(undefined)
  const [clickedPieIndex, setClickedPieIndex] = useState<number | undefined>(undefined)


  const gridEl = showGrid ? (
    <CartesianGrid vertical={false} stroke="#E5E0D8" />
  ) : null

  const tooltipEl = <ChartTooltip content={<ChartTooltipContent />} />

  const legendEl =
    showLegend && (type === 'bar' || type === 'line' || type === 'area' || type === 'radar') ? (
      <ChartLegend content={<ChartLegendContent />} />
    ) : null

  if (type === 'bar') {
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
      isHorizontal
        ? <CartesianGrid horizontal={false} stroke="#E5E0D8" />
        : <CartesianGrid vertical={false} stroke="#E5E0D8" />
    ) : null

    const barXAxis = isHorizontal
      ? <XAxis type="number" tickLine={false} axisLine={false} />
      : <XAxis dataKey="label" tickLine={false} axisLine={false} />

    const barYAxis = isHorizontal
      ? <YAxis dataKey="label" type="category" width={50} tickLine={false} axisLine={false} />
      : <YAxis tickLine={false} axisLine={false} />

    const refLineEl = barNegative
      ? isHorizontal
        ? <ReferenceLine x={0} stroke="#A09A94" strokeDasharray="3 3" />
        : <ReferenceLine y={0} stroke="#A09A94" strokeDasharray="3 3" />
      : null

    function barRadius(i: number): [number, number, number, number] {
      if (!barStacked) {
        return isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]
      }
      const isLast = i === series.length - 1
      return isLast
        ? isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]
        : [0, 0, 0, 0]
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

  if (type === 'line') {
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
                <LabelList
                  dataKey={s.key}
                  position="top"
                  style={{ fontSize: 10, fill: '#6B6560' }}
                />
              )}
            </Line>
          ))}
        </LineChart>
      </ChartContainer>
    )
  }

  if (type === 'area') {
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

  if (type === 'pie') {
    const {
      pieLabel = 'none',
      pieDonut = false,
      pieNested = false,
      pieInteractive = false,
    } = chartOptions

    const activePieIndex = hoveredPieIndex ?? clickedPieIndex

    // Expands the active sector outward on hover/click
    const renderActiveShape = (props: {
      cx: number; cy: number; innerRadius: number; outerRadius: number
      startAngle: number; endAngle: number; fill: string
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

    // Inside label: renders the numeric value at each slice's centroid
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insideLabelRenderer = (props: any) => {
      const { cx, cy, midAngle, innerRadius, outerRadius, value } = props
      const RADIAN = Math.PI / 180
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + radius * Math.sin(-midAngle * RADIAN)
      return (
        <text
          x={x} y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 11, pointerEvents: 'none' }}
        >
          {value}
        </text>
      )
    }

    const labelProp = pieLabel === 'inside' ? insideLabelRenderer
      : pieLabel === 'outside' ? true
      : undefined

    const interactionProps = pieInteractive ? {
      activeIndex: activePieIndex,
      activeShape: renderActiveShape as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      onMouseEnter: (_: unknown, idx: number) => setHoveredPieIndex(idx),
      onMouseLeave: () => setHoveredPieIndex(undefined),
      onClick: (_: unknown, idx: number) =>
        setClickedPieIndex((prev) => (prev === idx ? undefined : idx)),
    } : {}

    // Compute ring radii for nested (multi-series concentric) mode
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
                  cx="50%" cy="50%"
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

    // Standard single-series pie / donut
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
            cx="50%" cy="50%"
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

  if (type === 'radar') {
    const {
      radarDots = false,
      radarFill = true,
      radarLabels = true,
      radarCircleGrid = false,
    } = chartOptions
    return (
      <ChartContainer config={config} className="h-64 w-full">
        <RadarChart data={data}>
          {showGrid && <PolarGrid gridType={radarCircleGrid ? 'circle' : 'polygon'} stroke="#E5E0D8" />}
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

  // radial
  const {
    radialLabels = false,
    radialGrid = false,
    radialCenterText = '',
    radialShape = 'full',
    radialStacked = false,
  } = chartOptions

  const RADIAL_SHAPE_ANGLES = {
    full: { startAngle: 90, endAngle: -270 },
    semi: { startAngle: 180, endAngle: 0 },
    'three-quarter': { startAngle: 135, endAngle: -225 },
  }
  const { startAngle, endAngle } = RADIAL_SHAPE_ANGLES[radialShape] ?? RADIAL_SHAPE_ANGLES.full

  // Widen the hollow center when center text is present so the text has room
  const innerRadius = radialCenterText ? '50%' : '20%'
  // No background track when grid is visible (it would obscure the grid lines);
  // otherwise use a soft warm gray instead of Recharts' default black
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const backgroundProp: any = radialGrid ? false : { fill: '#F0EDE8' }

  const centerTextOverlay = radialCenterText ? (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="text-sm font-semibold text-[#1C1917]">{radialCenterText}</span>
    </div>
  ) : null

  if (radialStacked && series.length > 1) {
    const multiRadialData = data.map((row) => ({
      name: row.label,
      ...series.reduce((acc, s) => {
        acc[s.key] = Number(row[s.key] ?? 0)
        return acc
      }, {} as Record<string, number>),
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={radialLabels ? ({ position: 'insideStart', fill: 'white', fontSize: 10 } as any) : undefined}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={radialLabels ? ({ position: 'insideStart', fill: 'white', fontSize: 10 } as any) : undefined}
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

// ─── DataTable ────────────────────────────────────────────────────────────────

interface DataTableProps {
  data: DataRow[]
  series: SeriesDef[]
  onDataChange: (data: DataRow[]) => void
  onSeriesChange: (series: SeriesDef[]) => void
  maxSeries?: number
}

function DataTable({ data, series, onDataChange, onSeriesChange, maxSeries }: DataTableProps) {
  function updateCell(rowIdx: number, key: string, value: string) {
    const next = data.map((row, i) =>
      i === rowIdx ? { ...row, [key]: key === 'label' ? value : Number(value) || 0 } : row,
    )
    onDataChange(next)
  }

  function updateSeriesName(seriesIdx: number, name: string) {
    const oldKey = series[seriesIdx].key
    const newKey = sanitizeKey(name) || oldKey
    const nextSeries = series.map((s, i) =>
      i === seriesIdx ? { key: newKey, name } : s,
    )
    // rename key in data rows if key changed
    const nextData =
      newKey !== oldKey
        ? data.map((row) => {
            const { [oldKey]: val, ...rest } = row as Record<string, unknown>
            return { ...rest, [newKey]: val } as DataRow
          })
        : data
    onSeriesChange(nextSeries)
    onDataChange(nextData)
  }

  function addSeries() {
    if (maxSeries !== undefined && series.length >= maxSeries) return
    const key = `series_${series.length + 1}`
    onSeriesChange([...series, { key, name: `Series ${series.length + 1}` }])
    onDataChange(data.map((row) => ({ ...row, [key]: 0 })))
  }

  function removeSeries(seriesIdx: number) {
    if (series.length <= 1) return
    const key = series[seriesIdx].key
    const nextSeries = series.filter((_, i) => i !== seriesIdx)
    const nextData = data.map((row) => {
      const { [key]: _removed, ...rest } = row as Record<string, unknown>
      return rest as DataRow
    })
    onSeriesChange(nextSeries)
    onDataChange(nextData)
  }

  function addRow() {
    const emptyRow: DataRow = { label: '' }
    series.forEach((s) => { emptyRow[s.key] = 0 })
    onDataChange([...data, emptyRow])
  }

  function removeRow(rowIdx: number) {
    onDataChange(data.filter((_, i) => i !== rowIdx))
  }

  const cellCls =
    'border border-[#E5E0D8] rounded px-2 py-1 text-xs text-[#1C1917] bg-white focus:outline-none focus:border-[#0F766E] w-full'

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1.5 text-left text-[#6B6560] font-medium">Label</th>
            {series.map((s, i) => (
              <th key={s.key} className="px-2 py-1.5 text-left">
                <div className="flex items-center gap-1">
                  <input
                    className={cellCls}
                    defaultValue={s.name}
                    onBlur={(e) => updateSeriesName(i, e.target.value)}
                  />
                  {series.length > 1 && (
                    <button
                      onClick={() => removeSeries(i)}
                      className="text-[#A09A94] hover:text-[#EF4444] shrink-0"
                      title="Remove series"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </th>
            ))}
            <th className="px-2 py-1.5">
              {series.length < (maxSeries ?? Infinity) && (
                <button
                  onClick={addSeries}
                  className="flex items-center gap-1 text-[#0F766E] hover:text-[#0D5F58] text-xs"
                  title="Add series"
                >
                  <Plus size={12} />
                </button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="group">
              <td className="px-2 py-1">
                <input
                  className={cellCls}
                  value={String(row.label)}
                  onChange={(e) => updateCell(rowIdx, 'label', e.target.value)}
                />
              </td>
              {series.map((s) => (
                <td key={s.key} className="px-2 py-1">
                  <input
                    className={cellCls}
                    type="number"
                    value={String(row[s.key] ?? 0)}
                    onChange={(e) => updateCell(rowIdx, s.key, e.target.value)}
                  />
                </td>
              ))}
              <td className="px-2 py-1">
                <button
                  onClick={() => removeRow(rowIdx)}
                  className="text-[#C4BFBA] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove row"
                >
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="mt-2 flex items-center gap-1 px-2 py-1 text-xs text-[#6B6560] hover:text-[#0F766E] hover:bg-[#F0FDF9] rounded transition-colors"
      >
        <Plus size={12} /> Add row
      </button>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

interface ToggleProps {
  label: string
  value: boolean
  onChange: (val: boolean) => void
}

function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-2 text-xs text-[#1C1917]"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
          value ? 'bg-[#0F766E]' : 'bg-[#E5E0D8]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
      {label}
    </button>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  label: string
  open: boolean
  onToggle: () => void
}

function SectionHeader({ label, open, onToggle }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-[#F0EDE8] hover:bg-[#FAFAF8] transition-colors text-left"
    >
      <ChevronRight
        size={13}
        className={`text-[#A09A94] transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
      />
      <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#A09A94]">
        {label}
      </span>
    </button>
  )
}

// ─── Chart type definitions ───────────────────────────────────────────────────

const CHART_TYPES: { type: ChartType; label: string; Icon: React.ElementType }[] = [
  { type: 'bar', label: 'Bar', Icon: BarChart2 },
  { type: 'line', label: 'Line', Icon: TrendingUp },
  { type: 'area', label: 'Area', Icon: Activity },
  { type: 'pie', label: 'Pie', Icon: PieChartIcon },
  { type: 'radar', label: 'Radar', Icon: RadarIcon },
  { type: 'radial', label: 'Radial', Icon: Disc },
]

// ─── ChartBlock (main NodeView component) ─────────────────────────────────────

export default function ChartBlock({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const { chartType, title, data, series, showLegend, showGrid, colors, chartOptions: rawChartOptions } = node.attrs as {
    chartType: ChartType
    title: string
    data: DataRow[]
    series: SeriesDef[]
    showLegend: boolean
    showGrid: boolean
    colors: string[]
    chartOptions: Partial<BarOptions & LineOptions & AreaOptions & PieOptions & RadarOptions & RadialOptions>
  }

  const chartOptions = (rawChartOptions ?? {}) as Partial<BarOptions & LineOptions & AreaOptions & PieOptions & RadarOptions & RadialOptions>
  const { barLayout = 'vertical', barStacked = false, barLabels = false, barNegative = false } = chartOptions
  const { lineCurve = 'monotone', lineDots = false, lineLabels = false } = chartOptions
  const { areaCurve = 'monotone', areaGradient = false } = chartOptions
  const { pieLabel = 'none', pieDonut = false, pieNested = false, pieInteractive = false } = chartOptions
  const { radarDots = false, radarFill = true, radarLabels = true, radarCircleGrid = false } = chartOptions
  const { radialLabels = false, radialGrid = false, radialCenterText = '', radialShape = 'full', radialStacked = false } = chartOptions

  function updateChartOption<K extends keyof (BarOptions & LineOptions & AreaOptions & PieOptions & RadarOptions & RadialOptions)>(key: K, value: (BarOptions & LineOptions & AreaOptions & PieOptions & RadarOptions & RadialOptions)[K]) {
    updateAttributes({ chartOptions: { ...chartOptions, [key]: value } })
  }

  const [dataOpen, setDataOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const jsonRef = useRef<HTMLInputElement>(null)
  const csvRef = useRef<HTMLInputElement>(null)

  function handleJsonUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as DataRow[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          const keys = Object.keys(parsed[0]).filter((k) => k !== 'label')
          const newSeries = keys.map((k) => ({ key: sanitizeKey(k), name: k }))
          const newData = parsed.map((row) => {
            const out: DataRow = { label: String(row.label ?? '') }
            keys.forEach((k) => { out[sanitizeKey(k)] = Number(row[k]) || 0 })
            return out
          })
          updateAttributes({ data: newData, series: newSeries })
        }
      } catch {
        // invalid JSON — ignore
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = Papa.parse<Record<string, string>>(ev.target?.result as string, {
        header: true,
        skipEmptyLines: true,
      })
      if (result.data.length > 0) {
        const headers = Object.keys(result.data[0])
        const labelKey = headers[0]
        const valueKeys = headers.slice(1)
        const newSeries = valueKeys.map((k) => ({ key: sanitizeKey(k), name: k }))
        const newData = result.data.map((row) => {
          const out: DataRow = { label: String(row[labelKey] ?? '') }
          valueKeys.forEach((k) => { out[sanitizeKey(k)] = Number(row[k]) || 0 })
          return out
        })
        updateAttributes({ data: newData, series: newSeries })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        onKeyDown={(e) => e.stopPropagation()}
        className={`my-3 rounded-xl border bg-white font-sans transition-all ${
          selected
            ? 'border-[#0F766E] ring-2 ring-[#0F766E]/15 shadow-sm'
            : 'border-[#E5E0D8] shadow-sm'
        }`}
      >
        {/* Chart type tabs */}
        <div className="flex gap-1 px-4 pt-4 pb-2 flex-wrap">
          {CHART_TYPES.map(({ type, label, Icon }) => (
            <button
              key={type}
              onClick={() => updateAttributes({ chartType: type })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                chartType === type
                  ? 'bg-[#CCFBF1] text-[#0F766E]'
                  : 'bg-[#F5F3F0] text-[#6B6560] hover:bg-[#EBE8E3]'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Title input */}
        <div className="px-4 pb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Chart title…"
            className="w-full text-center text-base italic text-[#1C1917] placeholder-[#C4BFBA] bg-transparent border-none outline-none font-[Lora,Georgia,serif]"
          />
        </div>

        {/* Chart */}
        <div className="px-4 pb-2">
          <ChartRenderer
            type={chartType}
            data={data}
            series={series}
            colors={colors}
            showLegend={showLegend}
            showGrid={showGrid}
            chartOptions={chartOptions}
          />
        </div>

        {/* Data section */}
        <SectionHeader label="Data" open={dataOpen} onToggle={() => setDataOpen((o) => !o)} />
        {dataOpen && (
          <div className="px-4 py-3">
            <DataTable
              data={data}
              series={series}
              onDataChange={(d) => updateAttributes({ data: d })}
              onSeriesChange={(s) => updateAttributes({ series: s })}
              maxSeries={chartType === 'bar' ? 2 : undefined}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => jsonRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#E5E0D8] rounded-lg text-[#6B6560] hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
              >
                <Upload size={12} /> Upload JSON
              </button>
              <button
                onClick={() => csvRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#E5E0D8] rounded-lg text-[#6B6560] hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
              >
                <Upload size={12} /> Upload CSV
              </button>
              <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
              <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
            </div>
          </div>
        )}

        {/* Customize section */}
        <SectionHeader
          label="Customize"
          open={customizeOpen}
          onToggle={() => setCustomizeOpen((o) => !o)}
        />
        {customizeOpen && (
          <div className="px-4 py-3">
            <div className="flex gap-6">
              <Toggle
                label="Legend"
                value={showLegend}
                onChange={(v) => updateAttributes({ showLegend: v })}
              />
              <Toggle
                label="Grid"
                value={showGrid}
                onChange={(v) => updateAttributes({ showGrid: v })}
              />
            </div>
            {chartType === 'line' && (
              <div className="mt-4 pt-4 border-t border-[#F0EDE8]">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0F766E] mb-3">
                  Line Options
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#6B6560] mr-1">Curve</span>
                  {([
                    { value: 'monotone', label: 'Smooth' },
                    { value: 'linear', label: 'Linear' },
                    { value: 'step', label: 'Step' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateChartOption('lineCurve', value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        lineCurve === value
                          ? 'bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/30'
                          : 'bg-white text-[#6B6560] border-[#E5E0D8] hover:border-[#0F766E] hover:text-[#0F766E]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-6">
                  <Toggle
                    label="Dots"
                    value={lineDots}
                    onChange={(v) => updateChartOption('lineDots', v)}
                  />
                  <Toggle
                    label="Labels"
                    value={lineLabels}
                    onChange={(v) => updateChartOption('lineLabels', v)}
                  />
                </div>
              </div>
            )}
            {chartType === 'area' && (
              <div className="mt-4 pt-4 border-t border-[#F0EDE8]">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0F766E] mb-3">
                  Area Options
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#6B6560] mr-1">Curve</span>
                  {([
                    { value: 'monotone', label: 'Smooth' },
                    { value: 'linear', label: 'Linear' },
                    { value: 'step', label: 'Step' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateChartOption('areaCurve', value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        areaCurve === value
                          ? 'bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/30'
                          : 'bg-white text-[#6B6560] border-[#E5E0D8] hover:border-[#0F766E] hover:text-[#0F766E]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-6">
                  <Toggle
                    label="Gradient"
                    value={areaGradient}
                    onChange={(v) => updateChartOption('areaGradient', v)}
                  />
                </div>
              </div>
            )}
            {chartType === 'bar' && (
              <div className="mt-4 pt-4 border-t border-[#F0EDE8]">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0F766E] mb-3">
                  Bar Options
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#6B6560] mr-1">Layout</span>
                  {(['vertical', 'horizontal'] as const).map((layout) => (
                    <button
                      key={layout}
                      onClick={() => updateChartOption('barLayout', layout)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
                        barLayout === layout
                          ? 'bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/30'
                          : 'bg-white text-[#6B6560] border-[#E5E0D8] hover:border-[#0F766E] hover:text-[#0F766E]'
                      }`}
                    >
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-6">
                  <Toggle
                    label="Stacked"
                    value={barStacked}
                    onChange={(v) => updateChartOption('barStacked', v)}
                  />
                  <Toggle
                    label="Labels"
                    value={barLabels}
                    onChange={(v) => updateChartOption('barLabels', v)}
                  />
                  <Toggle
                    label="Zero line"
                    value={barNegative}
                    onChange={(v) => updateChartOption('barNegative', v)}
                  />
                </div>
              </div>
            )}
            {chartType === 'radar' && (
              <div className="mt-4 pt-4 border-t border-[#F0EDE8]">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0F766E] mb-3">
                  Radar Options
                </p>
                <div className="flex flex-wrap gap-6">
                  <Toggle
                    label="Dots"
                    value={radarDots}
                    onChange={(v) => updateChartOption('radarDots', v)}
                  />
                  <Toggle
                    label="Fill"
                    value={radarFill}
                    onChange={(v) => updateChartOption('radarFill', v)}
                  />
                  <Toggle
                    label="Labels"
                    value={radarLabels}
                    onChange={(v) => updateChartOption('radarLabels', v)}
                  />
                  <Toggle
                    label="Circle grid"
                    value={radarCircleGrid}
                    onChange={(v) => updateChartOption('radarCircleGrid', v)}
                  />
                </div>
              </div>
            )}
            {chartType === 'radial' && (
              <div className="mt-4 pt-4 border-t border-[#F0EDE8]">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0F766E] mb-3">
                  Radial Options
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#6B6560] mr-1">Shape</span>
                  {([
                    { value: 'full', label: 'Full' },
                    { value: 'semi', label: 'Semi' },
                    { value: 'three-quarter', label: '¾ Turn' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateChartOption('radialShape', value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        radialShape === value
                          ? 'bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/30'
                          : 'bg-white text-[#6B6560] border-[#E5E0D8] hover:border-[#0F766E] hover:text-[#0F766E]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#6B6560] mr-1">Center text</span>
                  <input
                    type="text"
                    value={radialCenterText}
                    onChange={(e) => updateChartOption('radialCenterText', e.target.value)}
                    placeholder="e.g. Total"
                    className="px-2 py-1 text-xs border border-[#E5E0D8] rounded-lg text-[#1C1917] bg-white focus:outline-none focus:border-[#0F766E] w-32"
                  />
                </div>
                <div className="flex flex-wrap gap-6">
                  <Toggle
                    label="Labels"
                    value={radialLabels}
                    onChange={(v) => updateChartOption('radialLabels', v)}
                  />
                  <Toggle
                    label="Grid"
                    value={radialGrid}
                    onChange={(v) => updateChartOption('radialGrid', v)}
                  />
                  <Toggle
                    label="Stacked"
                    value={radialStacked}
                    onChange={(v) => updateChartOption('radialStacked', v)}
                  />
                </div>
              </div>
            )}
            {chartType === 'pie' && (
              <div className="mt-4 pt-4 border-t border-[#F0EDE8]">
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0F766E] mb-3">
                  Pie Options
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#6B6560] mr-1">Labels</span>
                  {([
                    { value: 'none', label: 'None' },
                    { value: 'inside', label: 'Inside' },
                    { value: 'outside', label: 'Outside' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateChartOption('pieLabel', value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        pieLabel === value
                          ? 'bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/30'
                          : 'bg-white text-[#6B6560] border-[#E5E0D8] hover:border-[#0F766E] hover:text-[#0F766E]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-6">
                  <Toggle
                    label="Donut"
                    value={pieDonut}
                    onChange={(v) => updateChartOption('pieDonut', v)}
                  />
                  <Toggle
                    label="Nested"
                    value={pieNested}
                    onChange={(v) => updateChartOption('pieNested', v)}
                  />
                  <Toggle
                    label="Interactive"
                    value={pieInteractive}
                    onChange={(v) => updateChartOption('pieInteractive', v)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#F0EDE8] flex justify-end">
          <button
            onClick={deleteNode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A09A94] rounded-lg hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-colors"
          >
            <Trash2 size={12} /> Remove block
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
