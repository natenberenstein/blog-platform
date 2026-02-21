import type { ChartConfig } from '@/components/ui/chart'
import type { ChartType, DataRow, SeriesDef } from './chart-types'

export interface ImportedChartData {
  data: DataRow[]
  series: SeriesDef[]
}

export function sanitizeKey(name: string): string {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
}

function makeUniqueKey(baseName: string, usedKeys: Set<string>, fallbackIndex: number): string {
  const sanitized = sanitizeKey(baseName)
  const baseKey = sanitized || `series_${fallbackIndex + 1}`
  let key = baseKey
  let suffix = 2
  while (usedKeys.has(key)) {
    key = `${baseKey}_${suffix}`
    suffix += 1
  }
  usedKeys.add(key)
  return key
}

export function createSeriesDefinitions(sourceKeys: string[]): SeriesDef[] {
  const usedKeys = new Set<string>()
  return sourceKeys.map((sourceKey, index) => ({
    key: makeUniqueKey(sourceKey, usedKeys, index),
    name: sourceKey,
  }))
}

export function buildConfig(
  type: ChartType,
  series: SeriesDef[],
  data: DataRow[],
  colors: string[],
): ChartConfig {
  if (type === 'pie' || type === 'radial') {
    const config: ChartConfig = {}
    data.forEach((row, index) => {
      const key = sanitizeKey(String(row.label)) || `row_${index + 1}`
      config[key] = { label: String(row.label), color: colors[index % colors.length] }
    })
    return config
  }

  const config: ChartConfig = {}
  series.forEach((item, index) => {
    config[item.key] = { label: item.name, color: colors[index % colors.length] }
  })
  return config
}

function isRowRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function buildChartDataFromJson(input: unknown): ImportedChartData | null {
  if (!Array.isArray(input) || input.length === 0) return null

  const rows = input.filter(isRowRecord)
  if (rows.length === 0) return null

  const seriesSourceKeys = Object.keys(rows[0]).filter((key) => key !== 'label')
  if (seriesSourceKeys.length === 0) return null

  const series = createSeriesDefinitions(seriesSourceKeys)
  const sourceToSeriesKey = Object.fromEntries(
    series.map((item, index) => [seriesSourceKeys[index], item.key]),
  )

  const data = rows.map((row) => {
    const out: DataRow = { label: String(row.label ?? '') }
    seriesSourceKeys.forEach((sourceKey) => {
      const targetKey = sourceToSeriesKey[sourceKey]
      out[targetKey] = Number(row[sourceKey]) || 0
    })
    return out
  })

  return { data, series }
}

export function buildChartDataFromCsv(rows: Record<string, string>[]): ImportedChartData | null {
  if (rows.length === 0) return null

  const headers = Object.keys(rows[0] ?? {})
  if (headers.length < 2) return null

  const labelKey = headers[0]
  const valueHeaders = headers.slice(1)
  const series = createSeriesDefinitions(valueHeaders)
  const sourceToSeriesKey = Object.fromEntries(
    series.map((item, index) => [valueHeaders[index], item.key]),
  )

  const data = rows.map((row) => {
    const out: DataRow = { label: String(row[labelKey] ?? '') }
    valueHeaders.forEach((sourceKey) => {
      const targetKey = sourceToSeriesKey[sourceKey]
      out[targetKey] = Number(row[sourceKey]) || 0
    })
    return out
  })

  return { data, series }
}
