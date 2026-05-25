"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface College {
  id: string;
  slug: string;
  name: string;
}

interface Feedback {
  type: 'success' | 'warning' | 'critical';
  category: string;
  lineText: string;
  message: string;
}

interface Dimensions {
  authenticity: number;
  specificity: number;
  fit: number;
  narrative: number;
  clarity: number;
}

interface AnalysisResults {
  overallScore: number;
  dimensions: Dimensions;
  feedbacks: Feedback[];
}

export default function EssayPredictorPage() {
  const { data: session } = useSession();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  
  const [essayText, setEssayText] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [major, setMajor] = useState('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load all actual colleges from our database to select
    fetch('/api/colleges?limit=50')
      .then((res) => res.json())
      .then((data) => {
        setColleges(data.colleges || []);
        if (data.colleges?.length > 0) {
          setSelectedCollege(data.colleges[0].slug);
        }
        setLoadingColleges(false);
      })
      .catch(() => setLoadingColleges(false));
  }, []);

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayText.trim() || !selectedCollege || !major.trim()) return;

    setAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/essay/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay: essayText,
          collegeSlug: selectedCollege,
          major,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ? JSON.stringify(data.error) : 'Analysis failed.');
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis.');
    }
    setAnalyzing(false);
  };

  const getDimensionLabel = (key: string) => {
    switch (key) {
      case 'authenticity': return 'Voice & Authenticity';
      case 'specificity': return 'Specificity & Examples';
      case 'fit': return 'College Fit';
      case 'narrative': return 'Narrative Flow';
      case 'clarity': return 'Clarity & Prose';
      default: return key;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-24 px-4 pb-16 space-y-8">
      {/* Header */}
      <div className="space-y-2 animate-fadeUp text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/15 text-cyan text-xs font-semibold uppercase tracking-wider mb-2">
          ✨ Premium Admissions Intelligence
        </div>
        <h1 className="text-3xl md:text-4xl font-geist font-bold text-onSurface">
          AI Essay Score Predictor
        </h1>
        <p className="text-muted max-w-2xl">
          Get real-time feedback on your college application drafts scored on 5 key dimensions: authenticity, specificity, college fit, narrative, and clarity.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-7 glass p-6 space-y-6">
          <h2 className="font-geist font-semibold text-onSurface text-lg">Input Your Draft</h2>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Target College</label>
                {loadingColleges ? (
                  <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
                ) : (
                  <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.slug} className="bg-surface-800 text-onSurface">
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Intended Major</label>
                <input
                  type="text"
                  required
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-muted uppercase tracking-wider block">Essay Draft</label>
                <span className={`text-xs ${wordCount > 650 ? 'text-yellow-400' : 'text-muted'}`}>
                  {wordCount} words
                </span>
              </div>
              <textarea
                required
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Paste your essay draft here (minimum 50 characters)..."
                rows={14}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 resize-none font-sans leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={analyzing || wordCount < 10}
              className="w-full py-3 bg-cyan text-surface-900 font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,244,254,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                  Analyzing Essay Draft…
                </>
              ) : (
                'Predict Essay Score'
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          {results ? (
            /* Score Summary */
            <div className="space-y-6 animate-fadeUp">
              <div className="glass p-6 text-center space-y-4">
                <h2 className="font-geist font-semibold text-muted text-sm uppercase tracking-wider">Overall Prediction Score</h2>
                <div className="relative inline-flex items-center justify-center">
                  {/* Large score display */}
                  <div className="w-36 h-36 rounded-full border-4 border-cyan/10 flex flex-col items-center justify-center bg-cyan/5">
                    <span className="text-4xl font-bold font-geist text-cyan">{results.overallScore}</span>
                    <span className="text-[10px] text-muted uppercase tracking-widest font-semibold mt-1">out of 100</span>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Your essay shows solid potential. Focus on addressing the line-level comments below to increase specificity and fit!
                </p>
              </div>

              {/* Dimension scores */}
              <div className="glass p-6 space-y-4">
                <h3 className="font-geist font-semibold text-onSurface text-sm uppercase tracking-wider mb-2">Dimension Breakdown</h3>
                {Object.entries(results.dimensions).map(([key, val]) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-onSurface">{getDimensionLabel(key)}</span>
                      <span className="text-cyan">{val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan/40 to-cyan rounded-full transition-all duration-1000"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Line Feedback */}
              <div className="glass p-6 space-y-4">
                <h3 className="font-geist font-semibold text-onSurface text-sm uppercase tracking-wider">Line-Level Comments</h3>
                {results.feedbacks.length > 0 ? (
                  <div className="space-y-3">
                    {results.feedbacks.map((f, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          f.type === 'success'
                            ? 'bg-green-500/5 border-green-500/20 text-green-400'
                            : f.type === 'warning'
                              ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/5 border-red-500/20 text-red-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded bg-white/5">
                            {getDimensionLabel(f.category)}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest">
                            {f.type}
                          </span>
                        </div>
                        {f.lineText && (
                          <div className="italic text-muted border-l-2 border-white/10 pl-2 py-0.5 break-words">
                            {f.lineText}
                          </div>
                        )}
                        <p className="text-onSurface leading-relaxed">{f.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-xs">No improvements suggested. Excellent work!</p>
                )}
              </div>
            </div>
          ) : !analyzing ? (
            /* Empty state results */
            <div className="glass p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
              <span className="text-4xl mb-4">✍️</span>
              <h3 className="font-geist font-semibold text-onSurface mb-2">No Analysis Yet</h3>
              <p className="text-muted text-xs max-w-xs leading-relaxed">
                Paste your admission essay draft and target college specs in the panel, then click &quot;Predict Essay Score&quot; to fetch real-time intelligence.
              </p>
            </div>
          ) : (
            /* Loading Analysis */
            <div className="glass p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px] animate-pulse">
              <span className="text-4xl mb-4 animate-bounce">🧬</span>
              <h3 className="font-geist font-semibold text-cyan mb-2">Analyzing Draft...</h3>
              <p className="text-muted text-xs max-w-xs leading-relaxed">
                Computing voice authenticity metrics, specificity coefficients, and target college fit indicators...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
