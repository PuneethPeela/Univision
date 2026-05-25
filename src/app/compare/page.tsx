"use client";

import { useEffect, useState } from 'react';
import SpiderChart from '@/components/SpiderChart';
import StatsCard from '@/components/StatsCard';

interface College {
  id: string;
  name: string;
  slug: string;
  location: string;
  fees: number | null;
  rating: number | null;
  acceptanceRate: number | null;
  avgAid: number | null;
  gpa: number | null;
  sat: number | null;
  matchScore: number | null;
  research: number | null;
  campus: number | null;
  social: number | null;
  financial: number | null;
  innovation: number | null;
  diversity: number | null;
}

const axes = ['Research', 'Campus', 'Social', 'Financial', 'Innovation', 'Diversity'];

function getDims(c: College) {
  return [c.research ?? 0, c.campus ?? 0, c.social ?? 0, c.financial ?? 0, c.innovation ?? 0, c.diversity ?? 0];
}

export default function ComparePage() {
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [slugA, setSlugA] = useState('');
  const [slugB, setSlugB] = useState('');
  const [compareData, setCompareData] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all college names for dropdown
  useEffect(() => {
    fetch('/api/colleges?limit=50&sort=name')
      .then((r) => r.json())
      .then((data) => setAllColleges(data.colleges || []))
      .catch(() => {});
  }, []);

  // Fetch comparison when both selected
  useEffect(() => {
    if (!slugA || !slugB || slugA === slugB) {
      setCompareData([]);
      return;
    }
    setLoading(true);
    fetch(`/api/compare?ids=${slugA},${slugB}`)
      .then((r) => r.json())
      .then((data) => {
        setCompareData(data.colleges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slugA, slugB]);

  const a = compareData.find((c) => c.slug === slugA);
  const b = compareData.find((c) => c.slug === slugB);

  return (
    <div className="max-w-5xl mx-auto pt-24 space-y-8">
      {/* Header */}
      <div className="space-y-2 animate-fadeUp">
        <h1 className="text-3xl md:text-4xl font-geist font-bold text-onSurface">
          Compare Colleges
        </h1>
        <p className="text-muted">
          Select two colleges for a side-by-side analysis.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-4">
          <label className="text-xs text-muted uppercase tracking-wider block mb-2">College A</label>
          <select
            value={slugA}
            onChange={(e) => setSlugA(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-cyan/30 text-onSurface text-sm focus:outline-none focus:border-cyan/50 transition-all"
          >
            <option value="" className="bg-surface-800">Select a college…</option>
            {allColleges.map((c) => (
              <option key={c.id} value={c.slug} className="bg-surface-800">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="glass p-4">
          <label className="text-xs text-muted uppercase tracking-wider block mb-2">College B</label>
          <select
            value={slugB}
            onChange={(e) => setSlugB(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-lavender/30 text-onSurface text-sm focus:outline-none focus:border-lavender/50 transition-all"
          >
            <option value="" className="bg-surface-800">Select a college…</option>
            {allColleges.map((c) => (
              <option key={c.id} value={c.slug} className="bg-surface-800">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {slugA === slugB && slugA && (
        <p className="text-red-400 text-sm text-center">Please select two different colleges.</p>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
        </div>
      )}

      {a && b && (
        <div className="space-y-8 animate-fadeUp">
          {/* Spider Chart */}
          <div className="glass p-6 flex flex-col items-center">
            <h2 className="text-lg font-geist font-semibold text-onSurface mb-4">Radar Comparison</h2>
            <SpiderChart
              axes={axes}
              datasets={[
                { label: a.name, values: getDims(a), color: 'rgb(0, 244, 254)' },
                { label: b.name, values: getDims(b), color: 'rgb(197, 196, 222)' },
              ]}
              size={320}
            />
          </div>

          {/* Dimension Bars */}
          <div className="glass p-6 space-y-4">
            <h2 className="text-lg font-geist font-semibold text-onSurface mb-2">Dimension Comparison</h2>
            {axes.map((axis, i) => {
              const valA = getDims(a)[i];
              const valB = getDims(b)[i];
              return (
                <div key={axis}>
                  <div className="flex items-center justify-between text-xs text-muted mb-1">
                    <span>{axis}</span>
                    <span>
                      <span className="text-cyan">{valA}</span> vs{' '}
                      <span className="text-lavender">{valB}</span>
                    </span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div className="flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan rounded-full transition-all duration-700"
                        style={{ width: `${valA}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lavender rounded-full transition-all duration-700"
                        style={{ width: `${valB}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-side Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* College A */}
            <div className="space-y-3">
              <h3 className="font-geist font-semibold text-cyan text-sm">{a.name}</h3>
              <StatsCard label="Acceptance" value={`${a.acceptanceRate ?? '—'}%`} accent />
              <StatsCard label="Avg. Aid" value={a.avgAid ? `$${(a.avgAid / 1000).toFixed(0)}k` : '—'} />
              <StatsCard label="Fees" value={a.fees ? `$${(a.fees / 1000).toFixed(0)}k/yr` : '—'} />
              <StatsCard label="SAT" value={String(a.sat ?? '—')} />
              <StatsCard label="GPA" value={a.gpa?.toFixed(2) ?? '—'} />
              <StatsCard label="Rating" value={a.rating?.toFixed(1) ?? '—'} accent />
            </div>
            {/* College B */}
            <div className="space-y-3">
              <h3 className="font-geist font-semibold text-lavender text-sm">{b.name}</h3>
              <StatsCard label="Acceptance" value={`${b.acceptanceRate ?? '—'}%`} />
              <StatsCard label="Avg. Aid" value={b.avgAid ? `$${(b.avgAid / 1000).toFixed(0)}k` : '—'} />
              <StatsCard label="Fees" value={b.fees ? `$${(b.fees / 1000).toFixed(0)}k/yr` : '—'} />
              <StatsCard label="SAT" value={String(b.sat ?? '—')} />
              <StatsCard label="GPA" value={b.gpa?.toFixed(2) ?? '—'} />
              <StatsCard label="Rating" value={b.rating?.toFixed(1) ?? '—'} />
            </div>
          </div>
        </div>
      )}

      {!a && !b && !loading && slugA && slugB && slugA !== slugB && (
        <p className="text-muted text-sm text-center py-8">No comparison data found.</p>
      )}
    </div>
  );
}
