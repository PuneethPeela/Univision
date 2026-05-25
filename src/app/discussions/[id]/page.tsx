"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Answer {
  id: string;
  body: string;
  upvotes: number;
  isAccepted: boolean;
  createdAt: string;
  user: { id: string; name: string | null };
}

interface Discussion {
  id: string;
  title: string;
  body: string;
  upvotes: number;
  tags: string[];
  createdAt: string;
  user: { id: string; name: string | null };
  answers: Answer[];
  _count: { answers: number };
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/discussions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setDiscussion(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleUpvote = async () => {
    if (!discussion) return;
    await fetch(`/api/discussions/${id}/upvote`, { method: 'POST' });
    setDiscussion((d) => d ? { ...d, upvotes: d.upvotes + 1 } : d);
  };

  const handleAnswer = async () => {
    if (!answerBody || !session) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: answerBody }),
      });
      if (res.ok) {
        const answer = await res.json();
        setDiscussion((d) =>
          d ? { ...d, answers: [...d.answers, answer], _count: { answers: d._count.answers + 1 } } : d
        );
        setAnswerBody('');
      }
    } catch {}
    setSubmitting(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto pt-24 space-y-4">
        <div className="glass p-8 animate-pulse h-40 rounded-xl" />
        <div className="glass p-8 animate-pulse h-64 rounded-xl" />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="max-w-3xl mx-auto pt-24 text-center">
        <p className="text-muted">Discussion not found.</p>
        <Link href="/discussions" className="text-cyan hover:underline mt-2 inline-block">
          ← Back to Discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-24 space-y-6">
      <Link href="/discussions" className="text-sm text-muted hover:text-cyan transition-colors">
        ← Back to Discussions
      </Link>

      {/* Question */}
      <div className="glass p-6 animate-fadeUp">
        <div className="flex gap-4">
          {/* Votes */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleUpvote}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-cyan hover:border-cyan/30 transition-all"
            >
              ▲
            </button>
            <span className="text-lg font-bold text-onSurface">{discussion.upvotes}</span>
          </div>
          {/* Content */}
          <div className="flex-1">
            <h1 className="text-xl font-geist font-bold text-onSurface">{discussion.title}</h1>
            <p className="text-muted text-sm mt-3 leading-relaxed whitespace-pre-wrap">{discussion.body}</p>
            <div className="flex items-center gap-3 mt-4 text-xs text-muted">
              <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-[10px] font-bold">
                {discussion.user.name?.[0] || '?'}
              </div>
              <span>{discussion.user.name || 'Anonymous'}</span>
              <span>•</span>
              <span>{timeAgo(discussion.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-1">
        <h2 className="text-lg font-geist font-semibold text-onSurface">
          {discussion._count.answers} Answer{discussion._count.answers !== 1 ? 's' : ''}
        </h2>
      </div>

      {discussion.answers.length > 0 ? (
        discussion.answers.map((a) => (
          <div key={a.id} className="glass p-5">
            <p className="text-onSurface text-sm leading-relaxed whitespace-pre-wrap">{a.body}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted">
              <div className="w-5 h-5 rounded-full bg-lavender/20 flex items-center justify-center text-lavender text-[9px] font-bold">
                {a.user.name?.[0] || '?'}
              </div>
              <span>{a.user.name || 'Anonymous'}</span>
              <span>•</span>
              <span>{timeAgo(a.createdAt)}</span>
              {a.isAccepted && (
                <span className="text-green-400 font-semibold">✓ Accepted</span>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted text-sm py-4">No answers yet. Be the first to help!</p>
      )}

      {/* Post answer */}
      {session ? (
        <div className="glass p-6 space-y-4">
          <h3 className="font-geist font-semibold text-onSurface">Your Answer</h3>
          <textarea
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            placeholder="Write your answer…"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/40 resize-none"
          />
          <button
            onClick={handleAnswer}
            disabled={submitting || !answerBody}
            className="px-5 py-2 bg-cyan text-surface-900 font-semibold text-sm rounded-lg disabled:opacity-50"
          >
            {submitting ? 'Posting…' : 'Post Answer'}
          </button>
        </div>
      ) : (
        <div className="glass p-6 text-center">
          <p className="text-muted text-sm">
            <a href="/auth" className="text-cyan hover:underline">Sign in</a> to post an answer.
          </p>
        </div>
      )}
    </div>
  );
}
