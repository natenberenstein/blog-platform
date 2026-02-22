'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Papa from 'papaparse'
import type { ChartType, DataRow, SeriesDef, ChartOptionMap, ChartOptions } from './chart-types'
import { buildChartDataFromCsv, buildChartDataFromJson } from './chart-utils'
import { CHART_TYPE_OPTIONS } from './chart-type-options'
import ChartRenderer from './renderers/ChartRenderer'
import SectionHeader from './panels/SectionHeader'
import DataPanel from './panels/DataPanel'
import CustomizePanel from './panels/CustomizePanel'

interface ChartBlockProps {
  chartType: string
  title: string
  data: DataRow[]
  series: SeriesDef[]
  showLegend: boolean
  showGrid: boolean
  colors: string[]
  chartOptions: ChartOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateAttributes: (attrs: Record<string, any>) => void
  deleteNode: () => void
}

export default function ChartBlock({
  chartType,
  title,
  data,
  series,
  showLegend,
  showGrid,
  colors,
  chartOptions,
  updateAttributes,
  deleteNode,
}: ChartBlockProps) {
  function updateChartOption<K extends keyof ChartOptionMap>(key: K, value: ChartOptionMap[K]) {
    updateAttributes({ chartOptions: { ...chartOptions, [key]: value } })
  }

  const [dataOpen, setDataOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  function handleJsonUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = buildChartDataFromJson(JSON.parse(ev.target?.result as string))
        if (imported) updateAttributes(imported)
      } catch {
        // Invalid JSON.
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
      const imported = buildChartDataFromCsv(result.data)
      if (imported) updateAttributes(imported)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div
      contentEditable={false}
      onKeyDown={(e) => e.stopPropagation()}
      className="my-3 rounded-xl border bg-white font-sans transition-all border-[#E5E0D8] shadow-sm"
    >
      {/* Chart type tabs */}
      <div className="flex gap-1 px-4 pt-4 pb-2 flex-wrap">
        {CHART_TYPE_OPTIONS.map(({ type, label, Icon }) => (
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
          type={chartType as ChartType}
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
        <DataPanel
          chartType={chartType as ChartType}
          data={data}
          series={series}
          onDataChange={(nextData) => updateAttributes({ data: nextData })}
          onSeriesChange={(nextSeries) => updateAttributes({ series: nextSeries })}
          onJsonUpload={handleJsonUpload}
          onCsvUpload={handleCsvUpload}
        />
      )}

      {/* Customize section */}
      <SectionHeader
        label="Customize"
        open={customizeOpen}
        onToggle={() => setCustomizeOpen((o) => !o)}
      />
      {customizeOpen && (
        <CustomizePanel
          chartType={chartType as ChartType}
          showLegend={showLegend}
          showGrid={showGrid}
          chartOptions={chartOptions}
          onShowLegendChange={(value) => updateAttributes({ showLegend: value })}
          onShowGridChange={(value) => updateAttributes({ showGrid: value })}
          onChartOptionChange={updateChartOption}
        />
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
  )
}
