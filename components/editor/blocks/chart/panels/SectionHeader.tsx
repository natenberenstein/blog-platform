import { ChevronRight } from 'lucide-react'

interface SectionHeaderProps {
  label: string
  open: boolean
  onToggle: () => void
}

export default function SectionHeader({ label, open, onToggle }: SectionHeaderProps) {
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
