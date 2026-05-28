interface EmptyStateProps {
  icon?: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({ icon = '🔍', message, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 glass rounded-2xl border border-cyan/15 max-w-md mx-auto text-center animate-fadeUp my-10 shadow-lg">
      <span className="text-5xl mb-4 p-4 rounded-full bg-cyan/5 border border-cyan/10 animate-bounce">
        {icon}
      </span>
      <h3 className="text-xs font-bold text-onSurface uppercase tracking-widest mb-2 font-geist">No Records Found</h3>
      <p className="text-muted text-xs leading-relaxed max-w-xs">{message}</p>
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-cyan/10 to-cyan/20 text-cyan border border-cyan/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:from-cyan/20 hover:to-cyan/30 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          {ctaLabel}
        </a>
      )}
    </div>
  );
}

