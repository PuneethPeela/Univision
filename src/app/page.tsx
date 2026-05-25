"use client";

import { useEffect, useState } from 'react';
import CollegeCard from '@/components/CollegeCard';
import InfiniteCarousel from '@/components/InfiniteCarousel';
import StatsCard from '@/components/StatsCard';
import Link from 'next/link';

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

const insights = [
  '🎯 Students with a 3.8+ GPA and 1500+ SAT have a 3x higher chance at Top-20 schools.',
  '📊 Computer Science remains the most sought-after major with 23% growth in applications.',
  '💡 Early Decision applicants see a 2-3x higher acceptance rate at selective schools.',
  '🌍 Schools with strong diversity scores tend to have 15% higher student satisfaction.',
  '🏆 Research-focused universities place 40% more graduates in STEM careers.',
  '📈 Average starting salaries for CS graduates increased 12% year-over-year.',
];

export default function HomePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [insightIdx, setInsightIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/colleges?limit=12&sort=match')
      .then((r) => r.json())
      .then((data) => {
        setColleges(data.colleges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Rotate insights
  useEffect(() => {
    const t = setInterval(() => setInsightIdx((i) => (i + 1) % insights.length), 5000);
    return () => clearInterval(t);
  }, []);

  const topMatches = colleges.slice(0, 6);
  const carouselColleges = colleges.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto pt-24 space-y-16">
      {/* ── Hero ── */}
      <section className="text-center space-y-6 animate-fadeUp">
        <h1 className="text-4xl md:text-6xl font-geist font-bold leading-tight">
          Your Future,{' '}
          <span className="text-cyan neon-text">Mathematically</span> Curated.
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto">
          Stop searching. Start discovering. AI-powered college matching that understands your unique profile.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/explore"
            className="px-6 py-3 bg-cyan text-surface-900 font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,244,254,0.3)] transition-all duration-300"
          >
            Explore Matches →
          </Link>
          <Link
            href="/compare"
            className="px-6 py-3 border border-white/15 text-onSurface rounded-lg hover:border-cyan/40 hover:text-cyan transition-all duration-300"
          >
            Compare Colleges
          </Link>
        </div>
      </section>

      {/* ── Infinite Carousel ── */}
      {carouselColleges.length > 0 && (
        <section>
          <h2 className="text-xl font-geist font-semibold mb-4 text-onSurface">
            Featured Colleges
          </h2>
          <InfiniteCarousel speed={35}>
            {carouselColleges.map((c) => (
              <div key={c.id} className="glass p-4 hover:border-cyan/30 transition-all group">
                <h3 className="font-geist font-bold text-sm text-onSurface group-hover:text-cyan transition-colors truncate">
                  {c.name}
                </h3>
                <p className="text-muted text-xs mt-1">{c.location}</p>
                {c.matchScore != null && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan/60 to-cyan rounded-full"
                        style={{ width: `${c.matchScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-cyan font-bold">{c.matchScore}%</span>
                  </div>
                )}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {c.tags?.slice(0, 2).map((t) => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-lavender">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </InfiniteCarousel>
        </section>
      )}

      {/* ── Stats Bento Grid ── */}
      <section>
        <h2 className="text-xl font-geist font-semibold mb-4 text-onSurface">
          Your Profile Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="GPA" value="3.9" subtitle="Weighted" accent />
          <StatsCard label="SAT Score" value="1520" subtitle="Composite" accent />
          <StatsCard label="Interest" value="CS" subtitle="Computer Science" />
          <StatsCard label="Matches" value={String(colleges.length || '—')} subtitle="Colleges Found" accent />
        </div>
      </section>

      {/* ── AI Insight ── */}
      <section className="glass-cyan p-6 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0">
            <span className="text-cyan text-sm">✦</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cyan mb-1">AI Insight</h3>
            <p className="text-onSurface text-sm leading-relaxed transition-all duration-500">
              {insights[insightIdx]}
            </p>
          </div>
        </div>
      </section>

      {/* ── Top Matches Grid ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-geist font-semibold text-onSurface">
            Top Matches
          </h2>
          <Link
            href="/explore"
            className="text-sm text-cyan hover:underline"
          >
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMatches.map((c) => (
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
        )}
      </section>

      {/* ── Quick Links ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
        <Link href="/predict" className="glass p-6 hover:border-cyan/30 transition-all group">
          <h3 className="text-lg font-geist font-semibold text-onSurface group-hover:text-cyan transition-colors">
            🎯 College Predictor
          </h3>
          <p className="text-muted text-sm mt-1">Enter your scores and get personalized recommendations.</p>
        </Link>
        <Link href="/compare" className="glass p-6 hover:border-cyan/30 transition-all group">
          <h3 className="text-lg font-geist font-semibold text-onSurface group-hover:text-cyan transition-colors">
            ⚖️ Compare Colleges
          </h3>
          <p className="text-muted text-sm mt-1">Side-by-side comparison with radar charts.</p>
        </Link>
        <Link href="/discussions" className="glass p-6 hover:border-cyan/30 transition-all group">
          <h3 className="text-lg font-geist font-semibold text-onSurface group-hover:text-cyan transition-colors">
            💬 Join Discussions
          </h3>
          <p className="text-muted text-sm mt-1">Ask questions and connect with the community.</p>
        </Link>
      </section>
    </div>
  );
}
