interface ToggleSwitchProps {
  label: string
  value: boolean
  onChange: (val: boolean) => void
}

export default function ToggleSwitch({ label, value, onChange }: ToggleSwitchProps) {
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
