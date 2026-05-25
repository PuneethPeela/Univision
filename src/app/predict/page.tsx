"use client";

import { useState } from 'react';

interface PredictResult {
  id: string;
  name: string;
  slug: string;
  location: string;
  matchPct: number;
  tier: string;
  acceptanceRate: number | null;
  reason: string;
  fees: number | null;
  rating: number | null;
}

const exams = ['SAT', 'ACT', 'JEE_MAIN', 'JEE_ADVANCED', 'GRE'];
const majors = [
  'Computer Science',
  'Engineering',
  'Business',
  'Biology',
  'Economics',
  'Physics',
  'Mathematics',
  'Pre-Med',
  'Psychology',
  'Data Science',
  'AI/ML',
  'Film',
  'Architecture',
  'Political Science',
];

export default function PredictPage() {
  const [exam, setExam] = useState('SAT');
  const [score, setScore] = useState('');
  const [gpa, setGpa] = useState('');
  const [major, setMajor] = useState('Computer Science');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    reach: PredictResult[];
    target: PredictResult[];
    safety: PredictResult[];
  } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!score || !gpa) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam,
          score: parseFloat(score),
          gpa: parseFloat(gpa),
          major,
        }),
      });
      if (!res.ok) {
        setError('Prediction failed. Check your inputs.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setResults(data);
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const renderTier = (label: string, items: PredictResult[], color: string, borderColor: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className={`font-geist font-semibold text-lg ${color}`}>{label} ({items.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((r) => (
            <a
              key={r.id}
              href={`/colleges/${r.slug}`}
              className={`glass p-4 hover:border-cyan/30 transition-all group border-l-2 ${borderColor}`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-geist font-semibold text-sm text-onSurface group-hover:text-cyan transition-colors truncate">
                  {r.name}
                </h4>
                <span className="text-xs font-bold text-cyan">{r.matchPct}%</span>
              </div>
              <p className="text-muted text-xs">{r.location}</p>
              {r.acceptanceRate != null && (
                <p className="text-muted text-[10px] mt-1">
                  Acceptance: {r.acceptanceRate}% · {r.fees ? `$${(r.fees / 1000).toFixed(0)}k/yr` : ''}
                </p>
              )}
              <p className="text-xs text-lavender mt-2 italic">{r.reason}</p>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pt-24 space-y-8">
      {/* Header */}
      <div className="space-y-2 animate-fadeUp">
        <h1 className="text-3xl md:text-4xl font-geist font-bold text-onSurface">
          College Predictor
        </h1>
        <p className="text-muted">
          Enter your academic profile and get personalized college recommendations.
        </p>
      </div>

      {/* Form */}
      <div className="glass p-6 md:p-8 space-y-6 animate-fadeUp">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exam */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Exam</label>
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50 transition-all"
            >
              {exams.map((e) => (
                <option key={e} value={e} className="bg-surface-800">
                  {e.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Score */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">
              Score / Rank
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder={exam === 'SAT' ? '400-1600' : exam === 'ACT' ? '1-36' : '0-1000'}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 transition-all"
            />
          </div>

          {/* GPA */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">GPA (0-4.0)</label>
            <input
              type="number"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="3.85"
              step="0.01"
              min="0"
              max="4.0"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 transition-all"
            />
          </div>

          {/* Major */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Preferred Major</label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50 transition-all"
            >
              {majors.map((m) => (
                <option key={m} value={m} className="bg-surface-800">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-cyan text-surface-900 font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,244,254,0.3)] transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
              Analyzing…
            </span>
          ) : (
            'Predict My Matches'
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-8 animate-fadeUp">
          <h2 className="text-xl font-geist font-semibold text-onSurface">
            Your Predictions
          </h2>
          {renderTier('🎯 Reach', results.reach, 'text-red-400', 'border-red-400/40')}
          {renderTier('🎯 Target', results.target, 'text-yellow-400', 'border-yellow-400/40')}
          {renderTier('✅ Safety', results.safety, 'text-green-400', 'border-green-400/40')}
          {results.reach.length === 0 && results.target.length === 0 && results.safety.length === 0 && (
            <p className="text-muted text-sm text-center py-8">
              No matches found. Try adjusting your inputs.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
