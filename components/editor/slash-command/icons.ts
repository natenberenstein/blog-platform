import {
  BarChart2,
  ChevronRight,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Lightbulb,
  List,
  ListOrdered,
  Minus,
  Quote,
  Sigma,
  Type,
  type LucideIcon,
} from 'lucide-react'

export const SLASH_COMMAND_ICON_MAP = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  BarChart2,
  Sigma,
  Lightbulb,
  ChevronRight,
} satisfies Record<string, LucideIcon>

export type SlashCommandIconName = keyof typeof SLASH_COMMAND_ICON_MAP
