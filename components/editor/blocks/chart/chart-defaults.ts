import type { DataRow, SeriesDef } from './chart-types'

export const DEFAULT_CHART_DATA: DataRow[] = [
  { label: 'Jan', value: 186 },
  { label: 'Feb', value: 305 },
  { label: 'Mar', value: 237 },
  { label: 'Apr', value: 273 },
  { label: 'May', value: 209 },
  { label: 'Jun', value: 314 },
]

export const DEFAULT_CHART_SERIES: SeriesDef[] = [{ key: 'value', name: 'Value' }]

export const DEFAULT_CHART_COLORS = [
  '#0F766E',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#10B981',
]

export function parseBooleanAttribute(value: string | null, fallback: boolean): boolean {
  if (value === null) return fallback
  return value === 'true'
}

function cloneFallback<T>(fallback: T): T {
  try {
    return structuredClone(fallback)
  } catch {
    return fallback
  }
}

export function parseJsonAttribute<T>(value: string | null, fallback: T): T {
  if (!value) return cloneFallback(fallback)
  try {
    return JSON.parse(value) as T
  } catch {
    return cloneFallback(fallback)
  }
}
