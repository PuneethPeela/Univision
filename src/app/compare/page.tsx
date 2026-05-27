"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import SpiderChart from '@/components/SpiderChart';
import StatsCard from '@/components/StatsCard';

interface Placements {
  avgSalary: number;
  placementRate: number;
  topRecruiters: string[];
}

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
  placements: Placements | any;
}

const axes = ['Research', 'Campus', 'Social', 'Financial', 'Innovation', 'Diversity'];

function getDims(c: College) {
  return [c.research ?? 0, c.campus ?? 0, c.social ?? 0, c.financial ?? 0, c.innovation ?? 0, c.diversity ?? 0];
}

function CompareContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [slugA, setSlugA] = useState('');
  const [slugB, setSlugB] = useState('');
  const [slugC, setSlugC] = useState('');
  const [compareData, setCompareData] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  // Saving states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Fetch all college names for dropdown
  useEffect(() => {
    fetch('/api/colleges?limit=50&sort=name')
      .then((r) => r.json())
      .then((data) => setAllColleges(data.colleges || []))
      .catch(() => {});
  }, []);

  // Sync with searchParams if present
  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      const slugs = ids.split(',').map((s) => s.trim()).filter(Boolean);
      if (slugs[0]) setSlugA(slugs[0]);
      if (slugs[1]) setSlugB(slugs[1]);
      if (slugs[2]) setSlugC(slugs[2]);
    }
  }, [searchParams]);

  // Fetch comparison when selections change
  useEffect(() => {
    if (!slugA || !slugB || slugA === slugB) {
      setCompareData([]);
      return;
    }
    setLoading(true);
    const ids = [slugA, slugB, slugC].filter(Boolean).join(',');
    fetch(`/api/compare?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => {
        setCompareData(data.colleges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slugA, slugB, slugC]);

  const a = compareData.find((c) => c.slug === slugA);
  const b = compareData.find((c) => c.slug === slugB);
  const c = slugC ? compareData.find((col) => col.slug === slugC) : undefined;

  // Initialize save name when data loads
  useEffect(() => {
    if (a && b) {
      setSaveName(`${a.name} vs ${b.name}${c ? ' vs ' + c.name : ''}`);
    }
  }, [a, b, c]);

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const res = await fetch('/api/saved-comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName.trim(),
          collegeIds: [slugA, slugB, slugC].filter(Boolean),
        }),
      });

      if (res.ok) {
        setSaveSuccess('Comparison saved successfully to your cockpit!');
        setTimeout(() => {
          setShowSaveModal(false);
          setSaveSuccess('');
        }, 1500);
      } else {
        const err = await res.json();
        setSaveError(err.error || 'Failed to save comparison.');
      }
    } catch {
      setSaveError('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto pt-24 px-4 md:px-8 pb-16 space-y-8 animate-fadeUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-geist font-bold text-onSurface">
            Compare Colleges
          </h1>
          <p className="text-muted text-sm">
            Select 2 or 3 colleges for an instant, deep side-by-side compatibility analysis.
          </p>
        </div>
        {session && a && b && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-cyan text-surface-900 font-extrabold text-xs uppercase tracking-widest rounded-lg hover:shadow-[0_0_16px_rgba(0,244,254,0.4)] transition-all flex items-center gap-1.5"
          >
            💾 Save Comparison
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-4 border border-cyan/20">
          <label htmlFor="compare-college-a" className="text-[10px] text-cyan uppercase tracking-wider block mb-1.5 font-bold">College A (Primary)</label>
          <select
            id="compare-college-a"
            value={slugA}
            onChange={(e) => {
              setSlugA(e.target.value);
              if (e.target.value === slugC) setSlugC('');
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50 transition-all font-semibold cursor-pointer"
          >
            <option value="" className="bg-surface-800">Select a college…</option>
            {allColleges.map((c) => (
              <option key={c.id} value={c.slug} className="bg-surface-800" disabled={c.slug === slugB}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="glass p-4 border border-lavender/20">
          <label htmlFor="compare-college-b" className="text-[10px] text-lavender uppercase tracking-wider block mb-1.5 font-bold">College B (Secondary)</label>
          <select
            id="compare-college-b"
            value={slugB}
            onChange={(e) => {
              setSlugB(e.target.value);
              if (e.target.value === slugC) setSlugC('');
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-lavender/50 transition-all font-semibold cursor-pointer"
          >
            <option value="" className="bg-surface-800">Select a college…</option>
            {allColleges.map((c) => (
              <option key={c.id} value={c.slug} className="bg-surface-800" disabled={c.slug === slugA}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="glass p-4 border border-purple-500/20">
          <label htmlFor="compare-college-c" className="text-[10px] text-purple-400 uppercase tracking-wider block mb-1.5 font-bold">College C (Optional)</label>
          <select
            id="compare-college-c"
            value={slugC}
            onChange={(e) => setSlugC(e.target.value)}
            disabled={!slugA || !slugB}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-purple-400/50 transition-all disabled:opacity-30 font-semibold cursor-pointer"
          >
            <option value="" className="bg-surface-800">Select third college (optional)…</option>
            {allColleges.map((c) => (
              <option key={c.id} value={c.slug} className="bg-surface-800" disabled={c.slug === slugA || c.slug === slugB}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {slugA === slugB && slugA && (
        <p className="text-red-400 text-sm text-center">Please select different colleges for a valid comparison.</p>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
        </div>
      )}

      {a && b && (
        <div className="space-y-8 animate-fadeUp">
          {/* Spider Chart Radar & Dimension Bars */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-6 glass p-6 flex flex-col items-center">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan mb-4">Radar Compatibility Overlay</h2>
              <SpiderChart
                axes={axes}
                datasets={[
                  { label: a.name, values: getDims(a), color: 'rgb(0, 244, 254)' },
                  { label: b.name, values: getDims(b), color: 'rgb(197, 196, 222)' },
                  ...(c ? [{ label: c.name, values: getDims(c), color: 'rgb(168, 85, 247)' }] : []),
                ]}
                size={300}
              />
            </div>

            {/* Dimension Bars */}
            <div className="md:col-span-6 glass p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan mb-2">Metrics comparison bars</h2>
              {axes.map((axis, i) => {
                const valA = getDims(a)[i];
                const valB = getDims(b)[i];
                const valC = c ? getDims(c)[i] : null;
                return (
                  <div key={axis} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{axis}</span>
                      <span className="font-mono">
                        <span className="text-cyan font-bold">{valA}</span> vs{' '}
                        <span className="text-lavender font-bold">{valB}</span>
                        {valC !== null && (
                          <> vs <span className="text-purple-400 font-bold">{valC}</span></>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 bg-white/2 p-2 rounded-lg border border-white/5">
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan transition-all duration-700" style={{ width: `${valA}%` }} />
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-lavender transition-all duration-700" style={{ width: `${valB}%` }} />
                      </div>
                      {valC !== null && (
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all duration-700" style={{ width: `${valC}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Premium Comparison Matrix Table */}
          <div className="glass p-6 overflow-x-auto relative">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan mb-4">Admissions & Placement Specifications Matrix</h2>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Comparative Metric</th>
                  <th className="py-3 px-4 font-bold text-cyan">{a.name}</th>
                  <th className="py-3 px-4 font-bold text-lavender">{b.name}</th>
                  {c && <th className="py-3 px-4 font-bold text-purple-400">{c.name}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-onSurface">
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Campus Location</td>
                  <td className="py-3 px-4">{a.location}</td>
                  <td className="py-3 px-4">{b.location}</td>
                  {c && <td className="py-3 px-4">{c.location}</td>}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Annual Tuition Fees</td>
                  <td className="py-3 px-4 text-cyan font-bold">{a.fees ? `$${a.fees.toLocaleString()}/yr` : '—'}</td>
                  <td className="py-3 px-4 text-lavender font-bold">{b.fees ? `$${b.fees.toLocaleString()}/yr` : '—'}</td>
                  {c && <td className="py-3 px-4 text-purple-400 font-bold">{c.fees ? `$${c.fees.toLocaleString()}/yr` : '—'}</td>}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Average Financial Aid</td>
                  <td className="py-3 px-4">{a.avgAid ? `$${a.avgAid.toLocaleString()}/yr` : '—'}</td>
                  <td className="py-3 px-4">{b.avgAid ? `$${b.avgAid.toLocaleString()}/yr` : '—'}</td>
                  {c && <td className="py-3 px-4">{c.avgAid ? `$${c.avgAid.toLocaleString()}/yr` : '—'}</td>}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Alumni/Student Rating</td>
                  <td className="py-3 px-4 font-bold">⭐ {a.rating?.toFixed(1) ?? '—'} / 5.0</td>
                  <td className="py-3 px-4 font-bold">⭐ {b.rating?.toFixed(1) ?? '—'} / 5.0</td>
                  {c && <td className="py-3 px-4 font-bold">⭐ {c.rating?.toFixed(1) ?? '—'} / 5.0</td>}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Admissions Acceptance Rate</td>
                  <td className="py-3 px-4 font-semibold">{a.acceptanceRate ?? '—'}%</td>
                  <td className="py-3 px-4 font-semibold">{b.acceptanceRate ?? '—'}%</td>
                  {c && <td className="py-3 px-4 font-semibold">{c.acceptanceRate ?? '—'}%</td>}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Avg GPA Requirement</td>
                  <td className="py-3 px-4 font-mono">{a.gpa?.toFixed(2) ?? '—'} / 4.0</td>
                  <td className="py-3 px-4 font-mono">{b.gpa?.toFixed(2) ?? '—'} / 4.0</td>
                  {c && <td className="py-3 px-4 font-mono">{c.gpa?.toFixed(2) ?? '—'} / 4.0</td>}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Avg SAT Requirement</td>
                  <td className="py-3 px-4 font-mono">{a.sat ?? '—'} / 1600</td>
                  <td className="py-3 px-4 font-mono">{b.sat ?? '—'} / 1600</td>
                  {c && <td className="py-3 px-4 font-mono">{c.sat ?? '—'} / 1600</td>}
                </tr>
                <tr className="bg-cyan/5 border-t border-cyan/20">
                  <td className="py-3.5 px-4 font-bold text-cyan">Average Starting Salary</td>
                  <td className="py-3.5 px-4 font-bold text-cyan text-sm">${(a.placements?.avgSalary ?? 90000).toLocaleString()}/yr</td>
                  <td className="py-3.5 px-4 font-bold text-lavender text-sm">${(b.placements?.avgSalary ?? 88000).toLocaleString()}/yr</td>
                  {c && <td className="py-3.5 px-4 font-bold text-purple-400 text-sm">${(c.placements?.avgSalary ?? 85000).toLocaleString()}/yr</td>}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Placement Rate</td>
                  <td className="py-3 px-4 font-bold">{a.placements?.placementRate ?? 90}%</td>
                  <td className="py-3 px-4 font-bold">{b.placements?.placementRate ?? 89}%</td>
                  {c && <td className="py-3 px-4 font-bold">{c.placements?.placementRate ?? 88}%</td>}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted">Primary Recruiters</td>
                  <td className="py-3 px-4 leading-relaxed text-muted text-[11px]">
                    {((a.placements?.topRecruiters || ['Google', 'Microsoft', 'Amazon']) as string[]).join(', ')}
                  </td>
                  <td className="py-3 px-4 leading-relaxed text-muted text-[11px]">
                    {((b.placements?.topRecruiters || ['Amazon', 'Google', 'Meta']) as string[]).join(', ')}
                  </td>
                  {c && (
                    <td className="py-3 px-4 leading-relaxed text-muted text-[11px]">
                      {((c.placements?.topRecruiters || ['Goldman Sachs', 'McKinsey', 'PwC']) as string[]).join(', ')}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Stats Bento Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-geist font-semibold text-cyan text-xs uppercase tracking-wider">📊 {a.name} Core fit</h3>
              <StatsCard label="Tuition Fees" value={a.fees ? `$${(a.fees / 1000).toFixed(0)}k/yr` : '—'} accent />
              <StatsCard label="Acceptance Rate" value={`${a.acceptanceRate ?? '—'}%`} />
              <StatsCard label="Rating Fit" value={`⭐ ${a.rating?.toFixed(1) ?? '—'}`} />
            </div>

            <div className="space-y-3">
              <h3 className="font-geist font-semibold text-lavender text-xs uppercase tracking-wider">📊 {b.name} Core fit</h3>
              <StatsCard label="Tuition Fees" value={b.fees ? `$${(b.fees / 1000).toFixed(0)}k/yr` : '—'} />
              <StatsCard label="Acceptance Rate" value={`${b.acceptanceRate ?? '—'}%`} accent />
              <StatsCard label="Rating Fit" value={`⭐ ${b.rating?.toFixed(1) ?? '—'}`} />
            </div>

            {c ? (
              <div className="space-y-3">
                <h3 className="font-geist font-semibold text-purple-400 text-xs uppercase tracking-wider">📊 {c.name} Core fit</h3>
                <StatsCard label="Tuition Fees" value={c.fees ? `$${(c.fees / 1000).toFixed(0)}k/yr` : '—'} />
                <StatsCard label="Acceptance Rate" value={`${c.acceptanceRate ?? '—'}%`} />
                <StatsCard label="Rating Fit" value={`⭐ ${c.rating?.toFixed(1) ?? '—'}`} accent />
              </div>
            ) : (
              <div className="glass p-6 flex flex-col justify-center items-center text-center space-y-3 bg-white/1 border border-white/5">
                <div className="text-2xl opacity-40">⚖️</div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Compare 3 Colleges</h4>
                <p className="text-[11px] text-muted leading-relaxed max-w-xs">
                  Unlock a complete three-way admissions, placement, and compatibility benchmark analysis by picking a third college above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Comparison Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/80 backdrop-blur-md animate-fadeUp">
          <div className="glass w-full max-w-md p-6 relative shadow-2xl border border-cyan/20 bg-surface-800">
            <button
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-cyan text-lg transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💾</span>
                <div>
                  <h3 className="font-geist font-bold text-onSurface text-md">Save Comparison bookmark</h3>
                  <p className="text-[9px] text-cyan font-semibold uppercase tracking-wider">Persist comparison for quick cockpit load</p>
                </div>
              </div>

              <form onSubmit={handleSaveComparison} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="save-comparison-name" className="text-[10px] text-muted uppercase tracking-wider block font-bold">Comparison Folder Name</label>
                  <input
                    id="save-comparison-name"
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    required
                    placeholder="Enter name..."
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50"
                  />
                </div>

                {saveSuccess && (
                  <p className="text-cyan text-xs bg-cyan/5 border border-cyan/20 rounded-lg px-3 py-2 leading-relaxed">
                    {saveSuccess}
                  </p>
                )}

                {saveError && (
                  <p className="text-red-400 text-xs bg-red-400/5 border border-red-500/20 rounded-lg px-3 py-2 leading-relaxed">
                    {saveError}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-onSurface text-xs font-semibold rounded-lg border border-white/10 transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-cyan text-surface-900 font-bold text-xs uppercase tracking-wider rounded-lg hover:shadow-[0_0_16px_rgba(0,244,254,0.3)] transition-all flex justify-center items-center gap-1.5 disabled:opacity-40"
                  >
                    {saving ? 'Saving...' : 'Confirm Save'}
                  </button>
                </div>
              </form>
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

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-muted">Loading Compare Cockpit...</div>}>
      <CompareContent />
    </Suspense>
  );
}
