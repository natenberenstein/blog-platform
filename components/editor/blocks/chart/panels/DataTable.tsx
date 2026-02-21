import { Plus, Trash2 } from 'lucide-react'
import type { DataRow, SeriesDef } from '../chart-types'
import { sanitizeKey } from '../chart-utils'

interface DataTableProps {
  data: DataRow[]
  series: SeriesDef[]
  onDataChange: (data: DataRow[]) => void
  onSeriesChange: (series: SeriesDef[]) => void
  maxSeries?: number
}

export default function DataTable({
  data,
  series,
  onDataChange,
  onSeriesChange,
  maxSeries,
}: DataTableProps) {
  function updateCell(rowIdx: number, key: string, value: string) {
    const next = data.map((row, i) =>
      i === rowIdx ? { ...row, [key]: key === 'label' ? value : Number(value) || 0 } : row,
    )
    onDataChange(next)
  }

  function updateSeriesName(seriesIdx: number, name: string) {
    const oldKey = series[seriesIdx].key
    const newKey = sanitizeKey(name) || oldKey
    const nextSeries = series.map((s, i) => (i === seriesIdx ? { key: newKey, name } : s))
    // Rename key in data rows if key changed.
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
    series.forEach((s) => {
      emptyRow[s.key] = 0
    })
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
