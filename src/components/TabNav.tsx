"use client";

interface TabNavProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export default function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <div className="flex gap-1 border-b border-white/10 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 relative ${
            active === tab
              ? 'text-cyan'
              : 'text-muted hover:text-lavender'
          }`}
        >
          {tab}
          {active === tab && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
