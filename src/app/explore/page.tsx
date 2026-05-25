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
  const [cursor, setCursor] = useState<string | null>(null);
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
        setCursor(data.nextCursor || null);
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
    setCursor(null);
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
          // Use functional state getter to access latest cursor
          setCursor((currentCursor) => {
            if (currentCursor) {
              fetchColleges(currentCursor, false);
            }
            return currentCursor;
          });
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
            <div key={i} className="glass p-5 animate-pulse h-52 rounded-xl" />
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
