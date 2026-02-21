import type { ChartOptionMap, ChartOptions, ChartType } from '../chart-types'
import ToggleSwitch from './ToggleSwitch'

interface CustomizePanelProps {
  chartType: ChartType
  showLegend: boolean
  showGrid: boolean
  chartOptions: ChartOptions
  onShowLegendChange: (value: boolean) => void
  onShowGridChange: (value: boolean) => void
  onChartOptionChange: <K extends keyof ChartOptionMap>(key: K, value: ChartOptionMap[K]) => void
}

export default function CustomizePanel({
  chartType,
  showLegend,
  showGrid,
  chartOptions,
  onShowLegendChange,
  onShowGridChange,
  onChartOptionChange,
}: CustomizePanelProps) {
  const {
    barLayout = 'vertical',
    barStacked = false,
    barLabels = false,
    barNegative = false,
    lineCurve = 'monotone',
    lineDots = false,
    lineLabels = false,
    areaCurve = 'monotone',
    areaGradient = false,
    pieLabel = 'none',
    pieDonut = false,
    pieNested = false,
    pieInteractive = false,
    radarDots = false,
    radarFill = true,
    radarLabels = true,
    radarCircleGrid = false,
    radialLabels = false,
    radialGrid = false,
    radialCenterText = '',
    radialShape = 'full',
    radialStacked = false,
  } = chartOptions

  return (
    <div className="px-4 py-3">
      <div className="flex gap-6">
        <ToggleSwitch label="Legend" value={showLegend} onChange={onShowLegendChange} />
        <ToggleSwitch label="Grid" value={showGrid} onChange={onShowGridChange} />
      </div>

      {chartType === 'line' && (
        <div className="mt-4 pt-4 border-t border-[#F0EDE8]">
          <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0F766E] mb-3">
            Line Options
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[#6B6560] mr-1">Curve</span>
            {(
              [
                { value: 'monotone', label: 'Smooth' },
                { value: 'linear', label: 'Linear' },
                { value: 'step', label: 'Step' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onChartOptionChange('lineCurve', value)}
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
            <ToggleSwitch
              label="Dots"
              value={lineDots}
              onChange={(v) => onChartOptionChange('lineDots', v)}
            />
            <ToggleSwitch
              label="Labels"
              value={lineLabels}
              onChange={(v) => onChartOptionChange('lineLabels', v)}
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
            {(
              [
                { value: 'monotone', label: 'Smooth' },
                { value: 'linear', label: 'Linear' },
                { value: 'step', label: 'Step' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onChartOptionChange('areaCurve', value)}
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
            <ToggleSwitch
              label="Gradient"
              value={areaGradient}
              onChange={(v) => onChartOptionChange('areaGradient', v)}
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
                onClick={() => onChartOptionChange('barLayout', layout)}
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
            <ToggleSwitch
              label="Stacked"
              value={barStacked}
              onChange={(v) => onChartOptionChange('barStacked', v)}
            />
            <ToggleSwitch
              label="Labels"
              value={barLabels}
              onChange={(v) => onChartOptionChange('barLabels', v)}
            />
            <ToggleSwitch
              label="Zero line"
              value={barNegative}
              onChange={(v) => onChartOptionChange('barNegative', v)}
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
            <ToggleSwitch
              label="Dots"
              value={radarDots}
              onChange={(v) => onChartOptionChange('radarDots', v)}
            />
            <ToggleSwitch
              label="Fill"
              value={radarFill}
              onChange={(v) => onChartOptionChange('radarFill', v)}
            />
            <ToggleSwitch
              label="Labels"
              value={radarLabels}
              onChange={(v) => onChartOptionChange('radarLabels', v)}
            />
            <ToggleSwitch
              label="Circle grid"
              value={radarCircleGrid}
              onChange={(v) => onChartOptionChange('radarCircleGrid', v)}
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
            {(
              [
                { value: 'full', label: 'Full' },
                { value: 'semi', label: 'Semi' },
                { value: 'three-quarter', label: '¾ Turn' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onChartOptionChange('radialShape', value)}
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
              onChange={(e) => onChartOptionChange('radialCenterText', e.target.value)}
              placeholder="e.g. Total"
              className="px-2 py-1 text-xs border border-[#E5E0D8] rounded-lg text-[#1C1917] bg-white focus:outline-none focus:border-[#0F766E] w-32"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <ToggleSwitch
              label="Labels"
              value={radialLabels}
              onChange={(v) => onChartOptionChange('radialLabels', v)}
            />
            <ToggleSwitch
              label="Grid"
              value={radialGrid}
              onChange={(v) => onChartOptionChange('radialGrid', v)}
            />
            <ToggleSwitch
              label="Stacked"
              value={radialStacked}
              onChange={(v) => onChartOptionChange('radialStacked', v)}
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
            {(
              [
                { value: 'none', label: 'None' },
                { value: 'inside', label: 'Inside' },
                { value: 'outside', label: 'Outside' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onChartOptionChange('pieLabel', value)}
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
            <ToggleSwitch
              label="Donut"
              value={pieDonut}
              onChange={(v) => onChartOptionChange('pieDonut', v)}
            />
            <ToggleSwitch
              label="Nested"
              value={pieNested}
              onChange={(v) => onChartOptionChange('pieNested', v)}
            />
            <ToggleSwitch
              label="Interactive"
              value={pieInteractive}
              onChange={(v) => onChartOptionChange('pieInteractive', v)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
