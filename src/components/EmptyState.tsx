interface EmptyStateProps {
  icon?: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({ icon = '🔍', message, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-muted text-sm max-w-xs">{message}</p>
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="mt-4 px-5 py-2 bg-cyan/15 text-cyan border border-cyan/30 rounded-lg text-sm hover:bg-cyan/25 transition"
        >
          {ctaLabel}
        </a>
      )}
    </div>
  );
}
