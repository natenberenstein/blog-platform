import React, { useRef } from 'react'
import { Upload } from 'lucide-react'
import type { ChartType, DataRow, SeriesDef } from '../chart-types'
import DataTable from './DataTable'

interface DataPanelProps {
  chartType: ChartType
  data: DataRow[]
  series: SeriesDef[]
  onDataChange: (data: DataRow[]) => void
  onSeriesChange: (series: SeriesDef[]) => void
  onJsonUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function DataPanel({
  chartType,
  data,
  series,
  onDataChange,
  onSeriesChange,
  onJsonUpload,
  onCsvUpload,
}: DataPanelProps) {
  const jsonRef = useRef<HTMLInputElement>(null)
  const csvRef = useRef<HTMLInputElement>(null)

  return (
    <div className="px-4 py-3">
      <DataTable
        data={data}
        series={series}
        onDataChange={onDataChange}
        onSeriesChange={onSeriesChange}
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
        <input
          ref={jsonRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={onJsonUpload}
        />
        <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={onCsvUpload} />
      </div>
    </div>
  )
}
