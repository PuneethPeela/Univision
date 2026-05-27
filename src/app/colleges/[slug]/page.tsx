"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TabNav from '@/components/TabNav';
import SpiderChart from '@/components/SpiderChart';
import StatsCard from '@/components/StatsCard';
import { useSession } from 'next-auth/react';

interface Course {
  name: string;
  fee: number;
  duration: string;
}

interface Placements {
  avgSalary: number;
  placementRate: number;
  topRecruiters: string[];
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface College {
  id: string;
  name: string;
  slug: string;
  location: string;
  state: string | null;
  type: string;
  description: string | null;
  overview: string | null;
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
  courses: Course[] | null;
  placements: Placements | null;
  majors: string[];
  tags: string[];
  reviews: Review[];
}

const tabs = ['Overview', 'Courses', 'Placements', 'Reviews'];

export default function CollegeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const [college, setCollege] = useState<College | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ title: '', body: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/colleges/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCollege(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const submitReview = async () => {
    if (!college || !session) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId: college.id, ...reviewForm }),
      });
      if (res.ok) {
        const review = await res.json();
        setCollege((prev) => prev ? { ...prev, reviews: [review, ...prev.reviews] } : prev);
        setReviewForm({ title: '', body: '', rating: 5 });
      }
    } catch {}
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pt-24 space-y-6">
        <div className="glass p-8 animate-pulse h-64 rounded-xl" />
        <div className="glass p-8 animate-pulse h-96 rounded-xl" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="max-w-5xl mx-auto pt-24 text-center">
        <p className="text-muted text-lg">College not found.</p>
        <Link href="/explore" className="text-cyan hover:underline mt-4 inline-block">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  const typeColor =
    college.type === 'REACH'
      ? 'text-red-400 border-red-400/30 bg-red-400/10'
      : college.type === 'TARGET'
        ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
        : 'text-green-400 border-green-400/30 bg-green-400/10';

  const dimensions = [
    college.research ?? 0,
    college.campus ?? 0,
    college.social ?? 0,
    college.financial ?? 0,
    college.innovation ?? 0,
    college.diversity ?? 0,
  ];

  const courses = (college.courses || []) as Course[];
  const placements = college.placements as Placements | null;

  return (
    <div className="max-w-5xl mx-auto pt-24 px-4 md:px-8 space-y-8">
      {/* Back */}
      <Link href="/explore" className="text-sm text-muted hover:text-cyan transition-colors">
        ← Back to Explore
      </Link>

      {/* Header */}
      <div className="glass p-6 md:p-8 animate-fadeUp">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-geist font-bold text-onSurface">
              {college.name}
            </h1>
            <p className="text-muted mt-1">{college.location}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${typeColor}`}>
                {college.type}
              </span>
              {college.rating && (
                <span className="text-xs text-muted flex items-center gap-1">
                  ⭐ {college.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          {/* Match Ring */}
          {college.matchScore != null && (
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle
                    cx="22" cy="22" r="18" fill="none" stroke="#00f4fe" strokeWidth="3"
                    strokeDasharray={`${(college.matchScore / 100) * 113} 113`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-cyan">
                  {college.matchScore}%
                </span>
              </div>
              <p className="text-center text-[10px] text-muted mt-1 uppercase tracking-wider">Match</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* ── Overview ── */}
      {activeTab === 'Overview' && (
        <div className="space-y-8 animate-fadeUp">
          {college.overview && (
            <div className="glass p-6">
              <h2 className="text-lg font-geist font-semibold text-onSurface mb-3">About</h2>
              <p className="text-muted text-sm leading-relaxed">{college.overview}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Acceptance Rate" value={`${college.acceptanceRate ?? '—'}%`} accent />
            <StatsCard label="Avg. Aid" value={college.avgAid ? `$${(college.avgAid / 1000).toFixed(0)}k` : '—'} />
            <StatsCard label="Median GPA" value={college.gpa?.toFixed(2) ?? '—'} accent />
            <StatsCard label="Median SAT" value={String(college.sat ?? '—')} />
          </div>

          <div className="glass p-6 flex flex-col items-center">
            <h2 className="text-lg font-geist font-semibold text-onSurface mb-4">Compatibility Profile</h2>
            <SpiderChart
              axes={['Research', 'Campus', 'Social', 'Financial', 'Innovation', 'Diversity']}
              datasets={[
                { label: college.name, values: dimensions, color: 'rgb(0, 244, 254)' },
              ]}
              size={300}
            />
          </div>

          {college.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {college.tags.map((t) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 text-lavender border border-white/5">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Courses ── */}
      {activeTab === 'Courses' && (
        <div className="space-y-4 animate-fadeUp">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c, i) => (
                <div key={i} className="glass p-5">
                  <h3 className="font-geist font-semibold text-onSurface">{c.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                    <span>${(c.fee / 1000).toFixed(0)}k/yr</span>
                    <span>{c.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No course data available.</p>
          )}
        </div>
      )}

      {/* ── Placements ── */}
      {activeTab === 'Placements' && (
        <div className="space-y-6 animate-fadeUp">
          {placements ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard label="Avg. Starting Salary" value={`$${(placements.avgSalary / 1000).toFixed(0)}k`} accent />
                <StatsCard label="Placement Rate" value={`${placements.placementRate}%`} accent />
              </div>
              <div className="glass p-6">
                <h3 className="font-geist font-semibold text-onSurface mb-3">Top Recruiters</h3>
                <div className="flex flex-wrap gap-2">
                  {placements.topRecruiters.map((r) => (
                    <span key={r} className="text-sm px-3 py-1.5 rounded-lg bg-cyan/10 text-cyan border border-cyan/20">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted text-sm">No placement data available.</p>
          )}
        </div>
      )}

      {/* ── Reviews ── */}
      {activeTab === 'Reviews' && (
        <div className="space-y-6 animate-fadeUp">
          {/* Write review */}
          {session ? (
            <div className="glass p-6 space-y-4">
              <h3 className="font-geist font-semibold text-onSurface">Write a Review</h3>
              <div className="flex items-center gap-2">
                <label htmlFor="review-rating" className="text-sm text-muted">Rating:</label>
                <select
                  id="review-rating"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: parseInt(e.target.value) }))}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-onSurface text-sm"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r} className="bg-surface-800">
                      {'⭐'.repeat(r)}
                    </option>
                  ))}
                </select>
              </div>
              <input
                id="review-title"
                aria-label="Review title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Review title…"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/40"
              />
              <textarea
                id="review-body"
                aria-label="Review body"
                value={reviewForm.body}
                onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Share your experience…"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/40 resize-none"
              />
              <button
                onClick={submitReview}
                disabled={submitting || !reviewForm.body}
                className="px-5 py-2 bg-cyan text-surface-900 font-semibold text-sm rounded-lg hover:shadow-[0_0_16px_rgba(0,244,254,0.3)] transition disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          ) : (
            <div className="glass p-6 text-center">
              <p className="text-muted text-sm">
                <a href="/auth" className="text-cyan hover:underline">Sign in</a> to write a review.
              </p>
            </div>
          )}

          {/* Review list */}
          {college.reviews.length > 0 ? (
            college.reviews.map((r) => (
              <div key={r.id} className="glass p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-xs font-bold">
                      {r.user.name?.[0] || '?'}
                    </div>
                    <span className="text-sm font-medium text-onSurface">{r.user.name || 'Anonymous'}</span>
                  </div>
                  <span className="text-xs text-muted">{'⭐'.repeat(r.rating)}</span>
                </div>
                {r.title && <h4 className="text-sm font-semibold text-onSurface mb-1">{r.title}</h4>}
                {r.body && <p className="text-muted text-sm">{r.body}</p>}
              </div>
            ))
          ) : (
            <p className="text-muted text-sm text-center py-8">No reviews yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  );
}
