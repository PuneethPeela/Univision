"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = useSession();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const fetchDetail = useCallback(() => {
    fetch(`/api/discussions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setDiscussion(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpvote = async () => {
    if (!discussion) return;
    await fetch(`/api/discussions/${id}/upvote`, { method: 'POST' });
    setDiscussion((d) => d ? { ...d, upvotes: d.upvotes + 1 } : d);
  };

  const handleAnswer = async () => {
    if (!answerBody.trim() || !session) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: answerBody.trim() }),
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

  const handleEditInit = () => {
    if (!discussion) return;
    setEditTitle(discussion.title);
    setEditBody(discussion.body);
    setEditError(null);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editBody.trim() || updating) return;
    setUpdating(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/discussions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), body: editBody.trim() }),
      });
      if (res.ok) {
        const updatedDiscussion = await res.json();
        setDiscussion((d) => d ? { ...d, title: updatedDiscussion.title, body: updatedDiscussion.body } : d);
        setIsEditing(false);
      } else {
        const data = await res.json();
        setEditError(data.error ? JSON.stringify(data.error) : 'Failed to update question.');
      }
    } catch {
      setEditError('An error occurred while saving changes.');
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (!discussion || deleting) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question? This will permanently remove all answers."
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/discussions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/discussions');
        router.refresh();
      } else {
        alert('Failed to delete question.');
        setDeleting(false);
      }
    } catch {
      alert('An error occurred while deleting.');
      setDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto pt-24 px-4 space-y-4">
        <div className="glass p-8 animate-pulse h-40 rounded-xl" />
        <div className="glass p-8 animate-pulse h-64 rounded-xl" />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="max-w-3xl mx-auto pt-24 text-center px-4">
        <p className="text-muted">Discussion not found.</p>
        <Link href="/discussions" className="text-cyan hover:underline mt-2 inline-block">
          ← Back to Discussions
        </Link>
      </div>
    );
  }

  const isAuthor = session?.user?.id === discussion.user.id;

  return (
    <div className="max-w-3xl mx-auto pt-24 px-4 space-y-6">
      <Link href="/discussions" className="text-sm text-muted hover:text-cyan transition-colors">
        ← Back to Discussions
      </Link>

      {/* Question */}
      <div className="glass p-6 animate-fadeUp relative">
        {isEditing ? (
          /* Editing Form */
          <div className="space-y-4">
            <h3 className="font-geist font-semibold text-cyan">Edit Question</h3>
            {editError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                {editError}
              </div>
            )}
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Question title…"
              maxLength={200}
              aria-label="Edit title"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/40"
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              placeholder="Describe your question in detail…"
              rows={6}
              maxLength={5000}
              aria-label="Edit body"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/40 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={updating || editTitle.trim().length < 5 || editBody.trim().length < 10}
                className="px-4 py-2 bg-cyan text-surface-900 font-semibold text-xs rounded-lg disabled:opacity-50 transition"
              >
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-white/10 text-xs text-muted rounded-lg hover:text-onSurface transition"
              >
                Cancel
              </button>
              <span className="text-xs text-muted ml-auto mt-2">
                {editTitle.length}/200 · {editBody.length}/5000
              </span>
            </div>
          </div>
        ) : (
          /* Regular View */
          <div className="flex gap-4">
            {/* Votes */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleUpvote}
                aria-label="Upvote this question"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-cyan hover:border-cyan/30 transition-all"
              >
                ▲
              </button>
              <span className="text-lg font-bold text-onSurface">{discussion.upvotes}</span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-xl font-geist font-bold text-onSurface break-words">{discussion.title}</h1>
                {isAuthor && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEditInit}
                      className="text-xs px-3 py-1.5 rounded-lg border border-cyan/20 bg-cyan/5 text-cyan hover:bg-cyan/10 transition whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
              <p className="text-muted text-sm mt-3 leading-relaxed whitespace-pre-wrap break-words">{discussion.body}</p>
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
        )}
      </div>

      {/* Answers header */}
      <div className="space-y-1">
        <h2 className="text-lg font-geist font-semibold text-onSurface">
          {discussion._count.answers} Answer{discussion._count.answers !== 1 ? 's' : ''}
        </h2>
      </div>

      {/* Answers list */}
      {discussion.answers.length > 0 ? (
        <div className="space-y-3">
          {discussion.answers.map((a) => (
            <div key={a.id} className="glass p-5">
              <p className="text-onSurface text-sm leading-relaxed whitespace-pre-wrap break-words">{a.body}</p>
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
          ))}
        </div>
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
            aria-label="Write your answer"
            rows={4}
            maxLength={2000}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/40 resize-none"
          />
          <button
            onClick={handleAnswer}
            disabled={submitting || !answerBody.trim()}
            className="px-5 py-2 bg-cyan text-surface-900 font-semibold text-sm rounded-lg disabled:opacity-50"
          >
            {submitting ? 'Posting…' : 'Post Answer'}
          </button>
        </div>
      ) : (
        <div className="glass p-6 text-center">
          <p className="text-muted text-sm">
            <Link href="/auth" className="text-cyan hover:underline">Sign in</Link> to post an answer.
          </p>
        </div>
      )}
    </div>
  );
}
