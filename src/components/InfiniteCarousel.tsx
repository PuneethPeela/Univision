import { ReactNode, useRef, useState } from 'react';

interface InfiniteCarouselProps {
  children: ReactNode[];
  speed?: number; // seconds for full loop
}

export default function InfiniteCarousel({
  children,
  speed = 30,
}: InfiniteCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="overflow-hidden relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-surface-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-surface-900 to-transparent" />

      <div
        ref={trackRef}
        className="flex gap-4 w-max"
        style={{
          animation: `carouselSlide ${speed}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {/* Duplicate items for seamless loop */}
        {children.map((child, i) => (
          <div key={`a-${i}`} className="flex-shrink-0 w-72">
            {child}
          </div>
        ))}
        {children.map((child, i) => (
          <div key={`b-${i}`} className="flex-shrink-0 w-72">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
