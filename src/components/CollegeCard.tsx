"use client";

import Link from 'next/link';

interface CollegeCardProps {
  slug: string;
  name: string;
  location: string;
  matchScore?: number | null;
  type?: string;
  rating?: number | null;
  fees?: number | null;
  tags?: string[];
  description?: string | null;
  onSave?: () => void;
  saved?: boolean;
}

export default function CollegeCard({
  slug,
  name,
  location,
  matchScore,
  type,
  rating,
  fees,
  tags = [],
  description,
  onSave,
  saved = false,
}: CollegeCardProps) {
  const typeColor =
    type === 'REACH'
      ? 'text-red-400 border-red-400/30 bg-red-400/10'
      : type === 'TARGET'
        ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
        : 'text-green-400 border-green-400/30 bg-green-400/10';

  return (
    <Link
      href={`/colleges/${slug}`}
      className="group block glass hover:border-cyan/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,244,254,0.1)] p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-geist font-bold text-lg text-onSurface group-hover:text-cyan transition-colors truncate">
            {name}
          </h3>
          <p className="text-muted text-sm mt-0.5">{location}</p>
        </div>
        {matchScore != null && (
          <div className="flex-shrink-0 ml-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="3"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#00f4fe"
                  strokeWidth="3"
                  strokeDasharray={`${(matchScore / 100) * 113} 113`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-cyan">
                {matchScore}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Match bar */}
      {matchScore != null && (
        <div className="w-full h-1.5 rounded-full bg-white/5 mb-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan/60 to-cyan transition-all duration-700"
            style={{ width: `${matchScore}%` }}
          />
        </div>
      )}

      {/* Type badge + rating */}
      <div className="flex items-center gap-2 mb-3">
        {type && (
          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${typeColor}`}>
            {type}
          </span>
        )}
        {rating != null && (
          <span className="text-[10px] uppercase tracking-wider text-muted flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating.toFixed(1)}
          </span>
        )}
        {fees != null && (
          <span className="text-[10px] text-muted">
            ${(fees / 1000).toFixed(0)}k/yr
          </span>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-lavender border border-white/5"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="text-[10px] text-muted">+{tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-muted text-xs line-clamp-2 mb-3">{description}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <span className="text-[11px] text-cyan group-hover:underline">
          View Details →
        </span>
        {onSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave();
            }}
            className={`text-xs px-3 py-1 rounded-md transition-all ${
              saved
                ? 'bg-cyan/20 text-cyan border border-cyan/30'
                : 'bg-white/5 text-muted hover:text-cyan hover:bg-cyan/10 border border-white/5'
            }`}
          >
            {saved ? '✓ Saved' : '+ Save'}
          </button>
        )}
      </div>
    </Link>
  );
}
