"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import CollegeCard from '@/components/CollegeCard';
import FilterChips from '@/components/FilterChips';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';

interface College {
  id: string;
  slug: string;
  name: string;
  location: string;
  matchScore: number | null;
  type: string;
  rating: number | null;
  fees: number | null;
  tags: string[];
  description: string | null;
}

const filters = ['All', 'Reach', 'Target', 'Safety', 'STEM', 'Ivy League', 'Liberal Arts'];
const sortOptions = [
  { label: 'Match Score', value: 'match' },
  { label: 'Name', value: 'name' },
  { label: 'Rating', value: 'rating' },
];

export default function ExplorePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('match');
  const cursorRef = useRef<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchColleges = useCallback(
    async (resetCursor: string | null, isReset: boolean) => {
      if (isReset) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (filter === 'Reach' || filter === 'Target' || filter === 'Safety')
        params.set('type', filter);
      if (filter === 'STEM' || filter === 'Ivy League' || filter === 'Liberal Arts')
        params.set('tag', filter);
      params.set('sort', sort);
      params.set('limit', '12');
      if (!isReset && resetCursor) params.set('cursor', resetCursor);

      try {
        const res = await fetch(`/api/colleges?${params}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const newColleges: College[] = data.colleges || [];
        setColleges((prev) => (isReset ? newColleges : [...prev, ...newColleges]));
        cursorRef.current = data.nextCursor || null;
        setHasMore(!!data.nextCursor);
      } catch {
        setHasMore(false);
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [query, filter, sort]
  );

  // Reset on filter/search/sort change
  useEffect(() => {
    cursorRef.current = null;
    setHasMore(true);
    fetchColleges(null, true);
  }, [fetchColleges]);

  // Infinite scroll observer
  useEffect(() => {
    const el = observerRef.current;
    if (!el || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          if (cursorRef.current) {
            fetchColleges(cursorRef.current, false);
          }
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchColleges]);

  return (
    <div className="max-w-7xl mx-auto pt-24 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2 animate-fadeUp">
        <h1 className="text-3xl md:text-4xl font-geist font-bold text-onSurface">
          Explore Colleges
        </h1>
        <p className="text-muted">
          Discover your perfect match from our curated database.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <SearchBar onSearch={setQuery} placeholder="Search by name, location, state…" />
        <label className="sr-only" htmlFor="sort-select">Sort colleges</label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50 transition-all"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface-800">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <FilterChips options={filters} selected={filter} onSelect={setFilter} />

      {/* Grid */}
      {colleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges.map((c) => (
            <CollegeCard
              key={c.id}
              slug={c.slug}
              name={c.name}
              location={c.location}
              matchScore={c.matchScore}
              type={c.type}
              rating={c.rating}
              fees={c.fees}
              tags={c.tags}
              description={c.description}
            />
          ))}
        </div>
      ) : !loading ? (
        <EmptyState
          icon="🔍"
          message="No colleges match your current filters. Try adjusting your search."
        />
      ) : null}

      {/* Loading skeletons */}
      {(loading || loadingMore) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(loading ? 6 : 3)].map((_, i) => (
            <div key={i} className="glass p-5 flex flex-col gap-4 animate-pulse rounded-xl h-52">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-white/10 rounded w-2/3" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
                <div className="w-12 h-12 rounded-full bg-white/10" />
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5" />
              <div className="flex gap-2">
                <div className="h-4 bg-white/10 rounded w-16" />
                <div className="h-4 bg-white/5 rounded w-10" />
                <div className="h-4 bg-white/5 rounded w-12" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Infinite scroll trigger */}
      <div ref={observerRef} className="h-4" />

      {!hasMore && colleges.length > 0 && (
        <p className="text-center text-muted text-sm pb-8">
          You&apos;ve reached the end — {colleges.length} colleges shown.
        </p>
      )}
    </div>
  );
}
