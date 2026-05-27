"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';

interface Discussion {
  id: string;
  title: string;
  body: string;
  upvotes: number;
  tags: string[];
  createdAt: string;
  user: { id: string; name: string | null };
  _count: { answers: number };
}

const sortTabs = ['Recent', 'Popular', 'Unanswered'];

export default function DiscussionsPage() {
  const { data: session } = useSession();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortTab, setSortTab] = useState('Recent');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscussions = useCallback(async (pageNum: number, isReset: boolean) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: '10',
      sort: sortTab.toLowerCase(),
    });
    if (query) params.set('q', query);

    try {
      const res = await fetch(`/api/discussions?${params}`);
      if (!res.ok) throw new Error('Failed to load discussions');
      const data = await res.json();
      setDiscussions((prev) => isReset ? data.discussions : [...prev, ...data.discussions]);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setLoading(false);
  }, [query, sortTab]);

  // Fetch when page or query/sortTab changes
  useEffect(() => {
    fetchDiscussions(page, page === 1);
  }, [page, fetchDiscussions]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscussions(nextPage, false);
  };

  const handleSortTabChange = (tab: string) => {
    setSortTab(tab);
    setPage(1);
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !formBody.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle.trim(), body: formBody.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ? JSON.stringify(data.error) : 'Failed to post');
      }
      const d = await res.json();
      setDiscussions((prev) => [d, ...prev]);
      setTotal((t) => t + 1);
      setFormTitle('');
      setFormBody('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post question');
    }
    setSubmitting(false);
  };

  const [now] = useState(() => Date.now());

  const timeAgo = (date: string) => {
    const diff = now - new Date(date).getTime();
    if (diff < 0) return 'just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="max-w-4xl mx-auto pt-24 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeUp">
        <div>
          <h1 className="text-3xl md:text-4xl font-geist font-bold text-onSurface">
            Community Discussions
          </h1>
          <p className="text-muted mt-1">Ask questions, share insights, help others.</p>
        </div>
        <button
          onClick={() => {
            if (!session) {
              window.location.href = '/auth';
              return;
            }
            setShowForm(!showForm);
          }}
          className="px-5 py-2.5 bg-cyan text-surface-900 font-semibold text-sm rounded-lg hover:shadow-[0_0_16px_rgba(0,244,254,0.3)] transition-all whitespace-nowrap"
        >
          Ask a Question
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="glass-cyan p-4 text-sm text-red-400 border-red-400/30">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-muted hover:text-onSurface">✕</button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="glass p-6 space-y-4 animate-fadeUp">
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Question title…"
            maxLength={200}
            aria-label="Question title"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/40"
          />
          <textarea
            value={formBody}
            onChange={(e) => setFormBody(e.target.value)}
            placeholder="Describe your question in detail…"
            rows={4}
            maxLength={5000}
            aria-label="Question body"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/40 resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={submitting || formTitle.trim().length < 5 || formBody.trim().length < 10}
              className="px-5 py-2 bg-cyan text-surface-900 font-semibold text-sm rounded-lg disabled:opacity-50 transition-opacity"
            >
              {submitting ? 'Posting…' : 'Post Question'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-white/10 text-muted rounded-lg hover:text-onSurface transition"
            >
              Cancel
            </button>
            <span className="text-xs text-muted ml-auto">
              {formTitle.length}/200 · {formBody.length}/5000
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <SearchBar onSearch={handleSearch} placeholder="Search discussions…" />
        <div className="flex gap-1 bg-white/5 rounded-lg p-1" role="tablist" aria-label="Sort discussions">
          {sortTabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={sortTab === tab}
              onClick={() => handleSortTabChange(tab)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                sortTab === tab
                  ? 'bg-cyan/15 text-cyan'
                  : 'text-muted hover:text-onSurface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Discussions list */}
      {discussions.length > 0 ? (
        <div className="space-y-3">
          {discussions.map((d) => (
            <Link
              key={d.id}
              href={`/discussions/${d.id}`}
              className="glass p-5 block hover:border-cyan/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Upvotes */}
                <div className="flex flex-col items-center text-muted text-xs min-w-[40px]">
                  <span className="text-lg font-bold text-onSurface">{d.upvotes}</span>
                  <span>votes</span>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-geist font-semibold text-onSurface group-hover:text-cyan transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-muted text-sm mt-1 line-clamp-2">{d.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span>{d.user.name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{timeAgo(d.createdAt)}</span>
                    <span>•</span>
                    <span>{d._count.answers} answer{d._count.answers !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : !loading ? (
        <EmptyState icon="💬" message="No discussions yet. Be the first to ask!" />
      ) : null}

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass p-5 animate-pulse h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && discussions.length < total && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="px-6 py-2 border border-white/10 text-muted rounded-lg hover:border-cyan/30 hover:text-cyan transition-all text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
