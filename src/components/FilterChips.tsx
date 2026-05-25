"use client";

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
            selected === opt
              ? 'bg-cyan/15 border-cyan/40 text-cyan shadow-[0_0_8px_rgba(0,244,254,0.15)]'
              : 'bg-white/5 border-white/10 text-muted hover:border-lavender/40 hover:text-lavender'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
