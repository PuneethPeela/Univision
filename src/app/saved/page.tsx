"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CollegeCard from '@/components/CollegeCard';
import EmptyState from '@/components/EmptyState';

interface SavedItem {
  id: string;
  college: {
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
  };
}

export default function SavedPage() {
  const { status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/saved')
        .then((r) => r.json())
        .then((data) => {
          setSaved(data.saved || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const handleRemove = async (savedId: string) => {
    try {
      await fetch(`/api/saved/${savedId}`, { method: 'DELETE' });
      setSaved((prev) => prev.filter((s) => s.id !== savedId));
    } catch {}
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-5xl mx-auto pt-24 px-4 md:px-8 space-y-4">
        <div className="glass p-8 animate-pulse h-20 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass p-5 animate-pulse h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-24 px-4 md:px-8 space-y-8">
      <div className="animate-fadeUp">
        <h1 className="text-3xl md:text-4xl font-geist font-bold text-onSurface">
          Saved Colleges
        </h1>
        <p className="text-muted mt-1">Your curated college shortlist.</p>
      </div>

      {saved.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((s) => (
            <div key={s.id} className="relative">
              <CollegeCard
                slug={s.college.slug}
                name={s.college.name}
                location={s.college.location}
                matchScore={s.college.matchScore}
                type={s.college.type}
                rating={s.college.rating}
                fees={s.college.fees}
                tags={s.college.tags}
                description={s.college.description}
              />
              <button
                onClick={() => handleRemove(s.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400 text-xs hover:bg-red-400/20 transition-all z-10"
                title="Remove"
                aria-label={`Remove ${s.college.name} from shortlist`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📌"
          message="No saved colleges yet. Explore and save colleges you're interested in."
          ctaLabel="Explore Colleges"
          ctaHref="/explore"
        />
      )}
    </div>
  );
}
