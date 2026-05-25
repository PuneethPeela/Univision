"use client";

interface StatsCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
}

export default function StatsCard({ label, value, subtitle, accent = false }: StatsCardProps) {
  return (
    <div className="glass p-5 flex flex-col gap-1 hover:border-cyan/20 transition-all duration-200">
      <span className="text-[10px] uppercase tracking-widest text-muted font-medium">
        {label}
      </span>
      <span className={`text-2xl font-geist font-bold ${accent ? 'text-cyan' : 'text-onSurface'}`}>
        {value}
      </span>
      {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
    </div>
  );
}
