"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  type LucideIcon,
} from "lucide-react";
import { type SuggestionKeyDownProps } from "@tiptap/suggestion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { type CommandItem as SlashItem } from "./extensions/slash-command";

const ICON_MAP: Record<string, LucideIcon> = {
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
};

interface SlashCommandListProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashCommandListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const prevIndexRef = useRef(0);

    useEffect(() => {
      setSelectedIndex(0);
      prevIndexRef.current = 0;
    }, [items]);

    // Scroll with 2-item lookahead in the direction of travel.
    useEffect(() => {
      const list = listRef.current;
      if (!list) return;

      const direction = selectedIndex >= prevIndexRef.current ? 1 : -1;
      prevIndexRef.current = selectedIndex;

      const lookahead =
        direction > 0
          ? Math.min(selectedIndex + 2, items.length - 1)
          : Math.max(selectedIndex - 2, 0);

      const allItems = list.querySelectorAll("[cmdk-item]");
      allItems[lookahead]?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex, items.length]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          if (items[selectedIndex]) command(items[selectedIndex]);
          return true;
        }
        return false;
      },
    }));

    const groups = items.reduce<Record<string, SlashItem[]>>((acc, item) => {
      acc[item.category] = acc[item.category] ?? [];
      acc[item.category].push(item);
      return acc;
    }, {});

    // Sync our selectedIndex with cmdk's value prop so it drives
    // data-[selected=true] on the correct CommandItem.
    const selectedValue = items[selectedIndex]?.title ?? "";

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Command
            value={selectedValue}
            onValueChange={(val) => {
              const idx = items.findIndex((i) => i.title === val);
              if (idx !== -1) setSelectedIndex(idx);
            }}
            shouldFilter={false}
            className="w-[290px] overflow-hidden rounded-xl border-0 bg-white font-sans shadow-[0_8px_30px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)]"
          >
            <CommandList
              ref={listRef}
              className="max-h-[380px] overflow-y-auto p-1.5"
            >
              <CommandEmpty className="py-8 text-center text-sm text-[#C4BFBA]">
                No results
              </CommandEmpty>

              {Object.entries(groups).map(
                ([category, groupItems], groupIdx) => (
                  <CommandGroup
                    key={category}
                    heading={category}
                    className={cn(
                      // Category label styling
                      "[&_[cmdk-group-heading]]:px-2",
                      "[&_[cmdk-group-heading]]:py-1.5",
                      "[&_[cmdk-group-heading]]:text-[10px]",
                      "[&_[cmdk-group-heading]]:font-semibold",
                      "[&_[cmdk-group-heading]]:tracking-[0.1em]",
                      "[&_[cmdk-group-heading]]:uppercase",
                      "[&_[cmdk-group-heading]]:text-[#C4BFBA]",
                      // Divider between groups (not before the first)
                      groupIdx > 0 && "mt-1 border-t border-[#F0EDE8] pt-1",
                    )}
                  >
                    {groupItems.map((item) => {
                      const Icon = ICON_MAP[item.icon];
                      return (
                        <CommandItem
                          key={item.title}
                          value={item.title}
                          onSelect={() => command(item)}
                          // group class lets children react to data-[selected=true]
                          className={cn(
                            "group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5",
                            "text-[#1C1917]",
                            // Selected state (driven by cmdk via value prop above)
                            "data-[selected=true]:bg-[#F0FDF9]",
                            "data-[selected=true]:text-[#0F766E]",
                          )}
                        >
                          {/* Icon box */}
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                              // Default
                              "bg-[#F5F3F0] text-[#6B6560]",
                              // When parent CommandItem is selected
                              "group-data-[selected=true]:bg-[#CCFBF1]",
                              "group-data-[selected=true]:text-[#0F766E]",
                            )}
                          >
                            {Icon && <Icon size={15} strokeWidth={1.75} />}
                          </span>

                          {/* Text */}
                          <span className="flex min-w-0 flex-col">
                            <span className="text-[13px] font-medium leading-snug">
                              {item.title}
                            </span>
                            <span
                              className={cn(
                                "mt-px truncate text-[11px] leading-snug text-[#A09A94]",
                                "group-data-[selected=true]:text-[#0F766E]/60",
                              )}
                            >
                              {item.description}
                            </span>
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ),
              )}
            </CommandList>
          </Command>
        </motion.div>
      </AnimatePresence>
    );
  },
);

SlashCommandList.displayName = "SlashCommandList";
export default SlashCommandList;
