"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatsCard from '@/components/StatsCard';
import EmptyState from '@/components/EmptyState';
import SpiderChart from '@/components/SpiderChart';

interface College {
  id: string;
  slug: string;
  name: string;
  location: string;
  matchScore: number | null;
  type: string;
  fees: number | null;
  research: number | null;
  campus: number | null;
  social: number | null;
  financial: number | null;
  innovation: number | null;
  diversity: number | null;
}

interface SavedCollege {
  id: string;
  collegeId: string;
  status: 'RESEARCHING' | 'IN_PROGRESS' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  college: College;
}

interface Milestones {
  essays: boolean;
  transcripts: boolean;
  recs: boolean;
  scores: boolean;
  feesPaid: boolean;
}

const defaultMilestones: Milestones = {
  essays: false,
  transcripts: false,
  recs: false,
  scores: false,
  feesPaid: false,
};

const getCollegeDeadline = (slug: string) => {
  const deadlines: Record<string, string> = {
    mit: 'Nov 1',
    stanford: 'Nov 1',
    caltech: 'Jan 1',
    princeton: 'Jan 1',
    cornell: 'Jan 2',
    ucla: 'Nov 30',
    gatech: 'Mar 15',
    utaustin: 'Apr 1',
    'uc-berkeley': 'Nov 30',
    cmu: 'Jan 1',
  };
  return deadlines[slug] || 'Jan 1';
};

function DashboardContent() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab
  const activeTab = searchParams.get('tab') || 'overview';

  const [applications, setApplications] = useState<SavedCollege[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Profile fields
  const [profileName, setProfileName] = useState('');
  const [gpa, setGpa] = useState('3.8');
  const [sat, setSat] = useState('1450');
  const [major, setMajor] = useState('Computer Science');
  const [userRole, setUserRole] = useState<'USER' | 'SUB_ADMIN' | 'ADMIN'>('USER');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Candidate Inspector states (For Admins and Sub-Admins)
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [loadingCandidate, setLoadingCandidate] = useState(false);

  // Password rotation fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [rotatingPassword, setRotatingPassword] = useState(false);

  // Settings states
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // Expanded Kanban cards
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [milestones, setMilestones] = useState<Record<string, Milestones>>({});

  // Saved Comparisons list
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loadingComparisons, setLoadingComparisons] = useState(false);

  // Admin User Console CRUD states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    gpa: '3.8',
    sat: '1450',
    major: 'Computer Science',
    role: 'USER' as 'USER' | 'SUB_ADMIN' | 'ADMIN',
  });
  const [userModalError, setUserModalError] = useState('');
  const [userModalSuccess, setUserModalSuccess] = useState('');

  const isAdminUser = userRole === 'ADMIN';
  const isSubAdmin = userRole === 'SUB_ADMIN';

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/saved');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.saved || []);
      }
    } catch {}
    setLoadingApps(false);
  }, []);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfileName(data.name || '');
        setGpa(data.gpa != null ? String(data.gpa) : '');
        setSat(data.sat != null ? String(data.sat) : '');
        setMajor(data.major || '');
        setUserRole((data.role || 'USER') as any);
      }
    } catch {}
    setLoadingProfile(false);
  }, []);

  // Fetch saved comparisons
  const fetchComparisons = useCallback(async () => {
    setLoadingComparisons(true);
    try {
      const res = await fetch('/api/saved-comparisons');
      if (res.ok) {
        const data = await res.json();
        setComparisons(data.saved || []);
      }
    } catch {}
    setLoadingComparisons(false);
  }, []);

  // Fetch registered users (Admin only)
  const fetchAdminUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
      }
    } catch {}
    setLoadingUsers(false);
  }, []);

  // Fetch Candidates list (Admins & Sub-Admins only)
  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/candidates');
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch {}
  }, []);

  // Fetch specific candidate's entire data model
  const loadCandidateData = useCallback(async (candidateId: string) => {
    if (!candidateId) return;
    setLoadingCandidate(true);
    try {
      const res = await fetch(`/api/admin/candidates/${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.savedColleges || []);
        setProfileName(data.candidate.name || '');
        setGpa(data.candidate.gpa != null ? String(data.candidate.gpa) : '');
        setSat(data.candidate.sat != null ? String(data.candidate.sat) : '');
        setMajor(data.candidate.major || '');
        setComparisons(data.savedComparisons || []);
      }
    } catch {}
    setLoadingCandidate(false);
  }, []);

  // Client-side guard for protected tabs and loading orchestrations
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (status === 'authenticated') {
      fetchProfile();
      fetchApplications();

      const localMfa = localStorage.getItem('settings_mfa') === 'true';
      const localAlerts = localStorage.getItem('settings_alerts') !== 'false';
      const localDigest = localStorage.getItem('settings_digest') === 'true';
      setMfaEnabled(localMfa);
      setAlertsEnabled(localAlerts);
      setDigestEnabled(localDigest);
    }
  }, [status, router, fetchProfile, fetchApplications]);

  // Load contextual active tab details & check candidate inspection permission triggers
  useEffect(() => {
    if (status === 'authenticated' && !loadingProfile) {
      // Guard tabs
      if (activeTab === 'admin' && userRole !== 'ADMIN') {
        router.push('/dashboard?tab=overview');
        return;
      }
      if (activeTab === 'settings' && userRole === 'SUB_ADMIN') {
        router.push('/dashboard?tab=overview');
        return;
      }

      // Load dropdown selection candidates list
      if (userRole === 'ADMIN' || userRole === 'SUB_ADMIN') {
        fetchCandidates();
      }

      // Load tabs data
      if (activeTab === 'comparisons' && !selectedCandidateId) {
        fetchComparisons();
      } else if (activeTab === 'admin' && userRole === 'ADMIN') {
        fetchAdminUsers();
      }
    }
  }, [status, loadingProfile, activeTab, userRole, selectedCandidateId, fetchCandidates, fetchComparisons, fetchAdminUsers, router]);

  // Milestones loading
  useEffect(() => {
    if (applications.length > 0) {
      const loaded: Record<string, Milestones> = {};
      applications.forEach((app) => {
        const saved = localStorage.getItem(`milestones_${app.id}`);
        loaded[app.id] = saved ? JSON.parse(saved) : { ...defaultMilestones };
      });
      setMilestones(loaded);
    }
  }, [applications]);

  const handleMilestoneToggle = (appId: string, key: keyof Milestones) => {
    const current = milestones[appId] || { ...defaultMilestones };
    const updated = { ...current, [key]: !current[key] };
    setMilestones((prev) => ({ ...prev, [appId]: updated }));
    localStorage.setItem(`milestones_${appId}`, JSON.stringify(updated));
  };

  const toggleCard = (appId: string) => {
    setExpandedCards((prev) => ({ ...prev, [appId]: !prev[appId] }));
  };

  const handleStatusChange = async (id: string, newStatus: SavedCollege['status']) => {
    try {
      if (selectedCandidateId) {
        // Update candidate application status
        const res = await fetch(`/api/admin/candidates/${selectedCandidateId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ savedCollegeId: id, status: newStatus }),
        });
        if (res.ok) {
          setApplications((prev) =>
            prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
          );
        }
      } else {
        // Update own status
        const res = await fetch(`/api/saved/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          const updated = await res.json();
          setApplications((prev) =>
            prev.map((app) => (app.id === id ? { ...app, status: updated.status } : app))
          );
        }
      }
    } catch {}
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this college from your application tracker?')) return;
    try {
      const res = await fetch(`/api/saved/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
        localStorage.removeItem(`milestones_${id}`);
      }
    } catch {}
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    try {
      if (selectedCandidateId) {
        // Update selected candidate academic profile
        const res = await fetch(`/api/admin/candidates/${selectedCandidateId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileName || null,
            gpa: gpa ? parseFloat(gpa) : null,
            sat: sat ? parseInt(sat, 10) : null,
            major: major || null,
          }),
        });
        if (res.ok) {
          setProfileSuccess("Candidate's Academic Profile updated successfully!");
        } else {
          const err = await res.json();
          setProfileSuccess(err.error || 'Failed to update candidate profile.');
        }
      } else {
        // Update own profile
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileName || null,
            gpa: gpa ? parseFloat(gpa) : null,
            sat: sat ? parseInt(sat, 10) : null,
            major: major || null,
          }),
        });

        if (res.ok) {
          setProfileSuccess('Academic Profile updated successfully.');
          await updateSession();
          router.refresh();
        } else {
          const err = await res.json();
          setProfileSuccess(err.error || 'Failed to update academic profile.');
        }
      }
    } catch {
      setProfileSuccess('Error saving profile changes.');
    }
    setSavingProfile(false);
  };

  // Password Rotation
  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setRotatingPassword(true);

    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Account security updated. Password rotated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        if (data.error && typeof data.error === 'object') {
          const messages = Object.entries(data.error)
            .map(([field, msgs]) => `${field.toUpperCase()}: ${(msgs as string[]).join(', ')}`)
            .join(' | ');
          setPasswordError(messages);
        } else {
          setPasswordError(data.error || 'Failed to rotate password.');
        }
      }
    } catch {
      setPasswordError('Error sending password rotation request.');
    }
    setRotatingPassword(false);
  };

  const handleSettingsToggle = (setting: string, val: boolean) => {
    setSavedSettingsSuccess(true);
    if (setting === 'mfa') {
      setMfaEnabled(val);
      localStorage.setItem('settings_mfa', String(val));
    } else if (setting === 'alerts') {
      setAlertsEnabled(val);
      localStorage.setItem('settings_alerts', String(val));
    } else if (setting === 'digest') {
      setDigestEnabled(val);
      localStorage.setItem('settings_digest', String(val));
    }
    setTimeout(() => setSavedSettingsSuccess(false), 2000);
  };

  const handleDeleteComparison = async (id: string) => {
    if (!window.confirm('Delete this saved comparison bookmark?')) return;
    try {
      const res = await fetch(`/api/saved-comparisons?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComparisons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {}
  };

  // Admin User CRUD callbacks
  const handleOpenCreateUser = () => {
    setModalMode('create');
    setUserForm({
      name: '',
      email: '',
      password: '',
      gpa: '3.8',
      sat: '1450',
      major: 'Computer Science',
      role: 'USER',
    });
    setUserModalError('');
    setUserModalSuccess('');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: any) => {
    setModalMode('edit');
    setSelectedUserId(u.id);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      password: '', // blank during edit
      gpa: u.gpa != null ? String(u.gpa) : '',
      sat: u.sat != null ? String(u.sat) : '',
      major: u.major || '',
      role: u.role || 'USER',
    });
    setUserModalError('');
    setUserModalSuccess('');
    setShowUserModal(true);
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');
    setUserModalSuccess('');
    const payload = {
      name: userForm.name,
      email: userForm.email,
      gpa: userForm.gpa ? parseFloat(userForm.gpa) : null,
      sat: userForm.sat ? parseInt(userForm.sat, 10) : null,
      major: userForm.major || null,
      password: userForm.password || undefined,
      role: userForm.role,
    };

    try {
      let res;
      if (modalMode === 'create') {
        res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/users/${selectedUserId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setUserModalSuccess(modalMode === 'create' ? 'User registered successfully!' : 'User metrics updated!');
        fetchAdminUsers();
        setTimeout(() => {
          setShowUserModal(false);
          setUserModalSuccess('');
        }, 1200);
      } else {
        const data = await res.json();
        setUserModalError(data.error || 'Failed to save user changes.');
      }
    } catch {
      setUserModalError('Error executing admin CRUD action.');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete user ${name}? This will permanently wipe all their college tracking lists, discussions, and reviews! Do you want to continue?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAdminUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        let errorMessage = 'Failed to delete user.';
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `Server returned error status ${res.status}: ${res.statusText || 'Not Found'}`;
        }
        alert(errorMessage);
      }
    } catch (err) {
      alert(`Network error occurred during user deletion: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const getFilteredApps = (statusVal: SavedCollege['status']) => {
    return applications.filter((app) => app.status === statusVal);
  };

  // Helper stats
  const reachCount = applications.filter((app) => app.college.type === 'REACH').length;
  const targetCount = applications.filter((app) => app.college.type === 'TARGET').length;
  const safetyCount = applications.filter((app) => app.college.type === 'SAFETY').length;
  const submittedCount = applications.filter((app) => app.status === 'SUBMITTED' || app.status === 'ACCEPTED' || app.status === 'REJECTED').length;

  const averageMatchScore = () => {
    const scores = applications.map((app) => app.college.matchScore).filter((s) => s != null) as number[];
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const averageDimensions = () => {
    if (applications.length === 0) {
      return [75, 70, 80, 85, 75, 80];
    }
    const sum = { research: 0, campus: 0, social: 0, financial: 0, innovation: 0, diversity: 0 };
    applications.forEach((app) => {
      sum.research += app.college.research || 50;
      sum.campus += app.college.campus || 50;
      sum.social += app.college.social || 50;
      sum.financial += app.college.financial || 50;
      sum.innovation += app.college.innovation || 50;
      sum.diversity += app.college.diversity || 50;
    });
    const len = applications.length;
    return [
      Math.round(sum.research / len),
      Math.round(sum.campus / len),
      Math.round(sum.social / len),
      Math.round(sum.financial / len),
      Math.round(sum.innovation / len),
      Math.round(sum.diversity / len),
    ];
  };

  const userStrengthProfile = () => {
    const gpaNum = parseFloat(gpa) || 3.5;
    const satNum = parseInt(sat, 10) || 1400;

    const gpaStrength = Math.min(100, Math.max(30, Math.round((gpaNum / 4.0) * 100)));
    const satStrength = Math.min(100, Math.max(30, Math.round(((satNum - 400) / 1200) * 100)));

    return [
      Math.round(satStrength * 0.9 + gpaStrength * 0.1),
      80,
      75,
      Math.round((1 - (satNum / 1600)) * 100),
      Math.round(gpaStrength * 0.7 + satStrength * 0.3),
      85,
    ];
  };

  if (status === 'loading' || loadingApps || loadingProfile) {
    return (
      <div className="max-w-7xl mx-auto pt-24 px-4 space-y-8 animate-pulse">
        <div className="h-10 w-48 rounded bg-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass h-24 rounded-xl" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-white/5" />
      </div>
    );
  }

  const showAdminConsole = userRole === 'ADMIN';
  const showSettings = userRole === 'ADMIN' || userRole === 'USER';

  const cockpitTabs = [
    { id: 'overview', label: '📊 Cockpit Overview' },
    { id: 'tracker', label: '📋 Application Tracker' },
    { id: 'profile', label: '👤 Academic Profile' },
    { id: 'comparisons', label: '💾 Saved Comparisons' },
    ...(showAdminConsole ? [{ id: 'admin', label: '🛡️ Admin User Console' }] : []),
    ...(showSettings ? [{ id: 'settings', label: '⚙️ System Settings' }] : []),
  ];

  const filteredUsers = adminUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pt-24 px-4 pb-16 space-y-8 animate-fadeUp">
      {/* Cockpit Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan/15 text-cyan text-[10px] font-bold uppercase tracking-wider mb-2 border border-cyan/20">
            ✦ Mission Control Cockpit Active
          </div>
          <h1 className="text-3xl md:text-4xl font-geist font-bold text-onSurface">
            Candidate Cockpit
          </h1>
          <p className="text-muted text-xs mt-1">
            Simulate compatibility matches, track application statuses, and optimize your academic profile.
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition border border-red-500/20 bg-red-500/5 whitespace-nowrap"
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Dynamic Candidate Inspector Dropdown for Admins / Sub-Admins */}
      {(userRole === 'ADMIN' || userRole === 'SUB_ADMIN') && (
        <div className="glass p-4 border border-cyan/20 bg-cyan/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeUp shadow-[0_0_24px_rgba(0,244,254,0.03)]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse shadow-[0_0_8px_rgba(0,244,254,0.8)]" />
            <div>
              <span className="text-[10px] text-cyan uppercase font-bold tracking-wider block">Candidate Inspector Engine</span>
              <span className="text-xs text-onSurface font-semibold">
                {selectedCandidateId 
                  ? `Active Session: Inspecting and managing data for user ${profileName}` 
                  : `Active Session: Managing your own evaluator credentials (${userRole})`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[10px] text-muted uppercase tracking-wider font-bold whitespace-nowrap">Select Student:</span>
            <select
              value={selectedCandidateId}
              onChange={(e) => {
                const cid = e.target.value;
                setSelectedCandidateId(cid);
                if (cid) {
                  loadCandidateData(cid);
                } else {
                  // Reload own profile data
                  fetchProfile();
                  fetchApplications();
                  fetchComparisons();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-900 border border-cyan/30 text-xs text-cyan font-bold focus:outline-none focus:border-cyan cursor-pointer w-full sm:w-64"
            >
              <option value="">💼 Evaluator Mode (Self)</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  🎓 {c.name || 'Anonymous'} ({c.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Nav Menu */}
        <div className="lg:col-span-3 space-y-2">
          <div className="hidden lg:flex flex-col gap-1 bg-white/2.5 border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] text-muted uppercase tracking-wider px-3 py-1 font-bold">Cockpit Divisions</span>
            {cockpitTabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/dashboard?tab=${tab.id}`}
                className={`w-full text-left px-4 py-3 text-xs font-semibold rounded-xl transition ${
                  activeTab === tab.id
                    ? 'bg-cyan text-surface-900 shadow-[0_0_12px_rgba(0,244,254,0.3)]'
                    : 'text-muted hover:text-onSurface hover:bg-white/5'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Mobile switcher */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {cockpitTabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/dashboard?tab=${tab.id}`}
                className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-cyan text-surface-900 shadow-[0_0_10px_rgba(0,244,254,0.2)]'
                    : 'bg-white/5 text-muted border border-white/5'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Active tab pane */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: COCKPIT OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeUp">
              <div className="glass p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-2xl font-bold border border-cyan/30">
                    {session?.user?.name?.[0] || '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-geist font-bold text-onSurface">Welcome back, {session?.user?.name || 'Academic Scholar'}!</h2>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      Your preloaded academic profile stats are active. Explore predictions or fine-tune compatibility matches below.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link href="/dashboard?tab=profile" className="px-4 py-2 bg-white/5 hover:bg-cyan/15 hover:text-cyan border border-white/10 rounded-lg text-xs font-bold transition">
                    👤 Edit Profile Stats
                  </Link>
                  <Link href="/explore" className="px-4 py-2 bg-cyan text-surface-900 text-xs font-bold rounded-lg hover:shadow-[0_0_12px_rgba(0,244,254,0.3)] transition">
                    🔍 Explore Colleges
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Tracked Colleges" value={String(applications.length)} subtitle="In active pipeline" accent />
                <StatsCard label="Reach / Target" value={`${reachCount} / ${targetCount}`} subtitle="Profile match difficulty" />
                <StatsCard label="Avg Match Score" value={`${averageMatchScore()}%`} subtitle="Academic Proximity" accent />
                <StatsCard label="Applications Sent" value={String(submittedCount)} subtitle="Submitted to portals" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Spider Fit Radar */}
                <div className="md:col-span-7 glass p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan mb-1">Admissions Compatibility Vector</h3>
                    <p className="text-muted text-[11px] mb-4">Overlay comparing simulated student academic strength metrics against tracked colleges averages.</p>
                  </div>
                  <div className="py-2 flex justify-center">
                    <SpiderChart
                      axes={['Research', 'Campus', 'Social', 'Financial', 'Innovation', 'Diversity']}
                      datasets={[
                        { label: 'Your Profile Potential', values: userStrengthProfile(), color: '#00f4fe' },
                        { label: 'Tracked Colleges Avg', values: averageDimensions(), color: '#c5c4de' },
                      ]}
                      size={240}
                    />
                  </div>
                </div>

                {/* Deadlines count & Quick Advisor */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  <div className="glass p-6 space-y-4 flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-onSurface border-b border-white/5 pb-2">Upcoming Portal Deadlines</h3>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-onSurface block">MIT (Early Action)</span>
                          <span className="text-[10px] text-muted">Deadline: Nov 1</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-cyan/10 border border-cyan/25 text-[10px] font-bold text-cyan">23 days left</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-onSurface block">Stanford (REA)</span>
                          <span className="text-[10px] text-muted">Deadline: Nov 1</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-cyan/10 border border-cyan/25 text-[10px] font-bold text-cyan">23 days left</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-onSurface block">Caltech (Regular Decision)</span>
                          <span className="text-[10px] text-muted">Deadline: Jan 1</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-muted">84 days left</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-6 bg-gradient-to-br from-white/2.5 via-transparent to-white/0.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-cyan uppercase tracking-wider flex items-center gap-1.5">
                        <span>✦</span> AI Admissions Coach
                      </h4>
                      <p className="text-xs text-muted leading-relaxed">
                        Your list is well-balanced with <span className="text-onSurface font-semibold">{reachCount} reach</span> and <span className="text-onSurface font-semibold">{targetCount} target</span> schools. Since your SAT score matches Caltech's high tier, we suggest keeping supplemental essay drafting active.
                      </p>
                    </div>
                    <Link href="/predict" className="text-[11px] text-cyan font-bold uppercase tracking-wider hover:underline block mt-3">
                      Run admission check →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATION STATUS */}
          {activeTab === 'tracker' && (
            <div className="space-y-6 animate-fadeUp">
              {/* Tracker Top KPI Bento Block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass p-5 flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-muted font-bold">TOTAL APPS</span>
                  <span className="text-3xl font-geist font-extrabold text-cyan">{applications.length}</span>
                </div>
                <div className="glass p-5 flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-muted font-bold">IN PROGRESS</span>
                  <span className="text-3xl font-geist font-extrabold text-onSurface">{getFilteredApps('IN_PROGRESS').length}</span>
                </div>
                <div className="glass p-5 flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-muted font-bold">SUBMITTED</span>
                  <span className="text-3xl font-geist font-extrabold text-cyan">{getFilteredApps('SUBMITTED').length}</span>
                </div>
                <div className="glass p-5 flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-muted font-bold">DECISIONS</span>
                  <span className="text-3xl font-geist font-extrabold text-onSurface">
                    {getFilteredApps('ACCEPTED').length + getFilteredApps('REJECTED').length}
                  </span>
                </div>
              </div>

              {/* Title area */}
              <div className="flex justify-between items-center bg-white/2.5 p-4 rounded-xl border border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-onSurface">Application Tracker</h2>
                  <p className="text-[11px] text-muted">Mission Control for your college applications. Click cards to manage essays & checklist milestones.</p>
                </div>
                <Link
                  href="/explore"
                  className="px-4 py-2 bg-cyan text-surface-900 font-extrabold text-xs uppercase tracking-wider rounded-lg hover:shadow-[0_0_12px_rgba(0,244,254,0.3)] transition"
                >
                  + Add Application
                </Link>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-6">
                  {/* Kanban grid columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                    
                    {/* Column 1: Researching */}
                    <div className="glass p-4 space-y-3 min-h-[350px] bg-white/1 flex flex-col">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Researching</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-cyan">
                          {getFilteredApps('RESEARCHING').length}
                        </span>
                      </div>
                      <div className="space-y-3 flex-1">
                        {getFilteredApps('RESEARCHING').map((app) => (
                          <div key={app.id} className="bg-white/2.5 border border-white/5 rounded-xl p-3.5 hover:border-cyan/20 transition-all duration-200">
                            <div className="flex justify-between items-start gap-2">
                              <span
                                onClick={() => toggleCard(app.id)}
                                className="font-geist font-bold text-sm text-onSurface hover:text-cyan transition-colors cursor-pointer truncate block"
                                title="Click to view milestones"
                              >
                                {app.college.name}
                              </span>
                              {app.college.matchScore != null && (
                                <span className="text-xs font-bold text-cyan ml-1 whitespace-nowrap">
                                  {app.college.matchScore}%
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-2.5 text-[10px] text-muted border-t border-white/5 pt-2">
                              <span className="flex items-center gap-1 font-semibold">
                                📅 {getCollegeDeadline(app.college.slug)}
                              </span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleCard(app.id)} className="text-[9px] font-bold text-cyan uppercase tracking-wider hover:underline">Checklist</button>
                                <button onClick={() => handleRemove(app.id)} className="text-muted hover:text-red-400 text-xs pl-1">✕</button>
                              </div>
                            </div>
                            
                            {/* Expanded Milestone Checklist */}
                            {expandedCards[app.id] && (
                              <div className="mt-3 border-t border-white/5 pt-2.5 space-y-2 animate-fadeUp">
                                <span className="text-[9px] text-cyan uppercase font-bold tracking-wider block">Required Checklists</span>
                                <div className="space-y-1.5">
                                  {[
                                    { key: 'essays', label: 'Supplemental Essays' },
                                    { key: 'transcripts', label: 'High School Transcripts' },
                                    { key: 'recs', label: 'Letters of Rec' },
                                    { key: 'scores', label: 'Standardized Scores' },
                                    { key: 'feesPaid', label: 'Application Fee Paid' },
                                  ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-2 text-[10px] text-muted hover:text-onSurface cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={(milestones[app.id] || defaultMilestones)[item.key as keyof Milestones] || false}
                                        onChange={() => handleMilestoneToggle(app.id, item.key as keyof Milestones)}
                                        className="rounded bg-white/5 border-white/10 text-cyan focus:ring-0 w-3 h-3 cursor-pointer"
                                      />
                                      {item.label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                              className="w-full mt-3 px-2 py-1 rounded bg-surface-900 border border-white/10 text-[10px] text-muted focus:outline-none focus:border-cyan/50 cursor-pointer font-semibold"
                            >
                              <option value="RESEARCHING">Researching</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="ACCEPTED">Decision: Accepted</option>
                              <option value="REJECTED">Decision: Rejected</option>
                            </select>
                          </div>
                        ))}
                        {getFilteredApps('RESEARCHING').length === 0 && (
                          <p className="text-center text-muted text-[10px] py-12">No researching schools.</p>
                        )}
                      </div>
                    </div>

                    {/* Column 2: In Progress */}
                    <div className="glass p-4 space-y-3 min-h-[350px] bg-white/1 flex flex-col">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">In Progress</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-cyan">
                          {getFilteredApps('IN_PROGRESS').length}
                        </span>
                      </div>
                      <div className="space-y-3 flex-1">
                        {getFilteredApps('IN_PROGRESS').map((app) => (
                          <div key={app.id} className="bg-white/2.5 border border-white/5 rounded-xl p-3.5 hover:border-cyan/20 transition-all duration-200">
                            <div className="flex justify-between items-start gap-2">
                              <span
                                onClick={() => toggleCard(app.id)}
                                className="font-geist font-bold text-sm text-onSurface hover:text-cyan transition-colors cursor-pointer truncate block"
                                title="Click to view milestones"
                              >
                                {app.college.name}
                              </span>
                              {app.college.matchScore != null && (
                                <span className="text-xs font-bold text-cyan ml-1 whitespace-nowrap">
                                  {app.college.matchScore}%
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-2.5 text-[10px] text-muted border-t border-white/5 pt-2">
                              <span className="flex items-center gap-1 font-semibold">
                                📅 {getCollegeDeadline(app.college.slug)}
                              </span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleCard(app.id)} className="text-[9px] font-bold text-cyan uppercase tracking-wider hover:underline">Checklist</button>
                                <button onClick={() => handleRemove(app.id)} className="text-muted hover:text-red-400 text-xs pl-1">✕</button>
                              </div>
                            </div>
                            
                            {/* Expanded Milestone Checklist */}
                            {expandedCards[app.id] && (
                              <div className="mt-3 border-t border-white/5 pt-2.5 space-y-2 animate-fadeUp">
                                <span className="text-[9px] text-cyan uppercase font-bold tracking-wider block">Required Checklists</span>
                                <div className="space-y-1.5">
                                  {[
                                    { key: 'essays', label: 'Supplemental Essays' },
                                    { key: 'transcripts', label: 'High School Transcripts' },
                                    { key: 'recs', label: 'Letters of Rec' },
                                    { key: 'scores', label: 'Standardized Scores' },
                                    { key: 'feesPaid', label: 'Application Fee Paid' },
                                  ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-2 text-[10px] text-muted hover:text-onSurface cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={(milestones[app.id] || defaultMilestones)[item.key as keyof Milestones] || false}
                                        onChange={() => handleMilestoneToggle(app.id, item.key as keyof Milestones)}
                                        className="rounded bg-white/5 border-white/10 text-cyan focus:ring-0 w-3 h-3 cursor-pointer"
                                      />
                                      {item.label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                              className="w-full mt-3 px-2 py-1 rounded bg-surface-900 border border-white/10 text-[10px] text-muted focus:outline-none focus:border-cyan/50 cursor-pointer font-semibold"
                            >
                              <option value="RESEARCHING">Researching</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="ACCEPTED">Decision: Accepted</option>
                              <option value="REJECTED">Decision: Rejected</option>
                            </select>
                          </div>
                        ))}
                        {getFilteredApps('IN_PROGRESS').length === 0 && (
                          <p className="text-center text-muted text-[10px] py-12">No in progress schools.</p>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Submitted */}
                    <div className="glass p-4 space-y-3 min-h-[350px] bg-white/1 flex flex-col">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Submitted</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-cyan">
                          {getFilteredApps('SUBMITTED').length}
                        </span>
                      </div>
                      <div className="space-y-3 flex-1">
                        {getFilteredApps('SUBMITTED').map((app) => (
                          <div key={app.id} className="bg-white/2.5 border border-white/5 rounded-xl p-3.5 hover:border-cyan/20 transition-all duration-200">
                            <div className="flex justify-between items-start gap-2">
                              <span
                                onClick={() => toggleCard(app.id)}
                                className="font-geist font-bold text-sm text-onSurface hover:text-cyan transition-colors cursor-pointer truncate block"
                                title="Click to view milestones"
                              >
                                {app.college.name}
                              </span>
                              {app.college.matchScore != null && (
                                <span className="text-xs font-bold text-cyan ml-1 whitespace-nowrap">
                                  {app.college.matchScore}%
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-2.5 text-[10px] text-muted border-t border-white/5 pt-2">
                              <span className="flex items-center gap-1 font-semibold">
                                📅 {getCollegeDeadline(app.college.slug)}
                              </span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleCard(app.id)} className="text-[9px] font-bold text-cyan uppercase tracking-wider hover:underline">Checklist</button>
                                <button onClick={() => handleRemove(app.id)} className="text-muted hover:text-red-400 text-xs pl-1">✕</button>
                              </div>
                            </div>
                            
                            {/* Expanded Milestone Checklist */}
                            {expandedCards[app.id] && (
                              <div className="mt-3 border-t border-white/5 pt-2.5 space-y-2 animate-fadeUp">
                                <span className="text-[9px] text-cyan uppercase font-bold tracking-wider block">Required Checklists</span>
                                <div className="space-y-1.5">
                                  {[
                                    { key: 'essays', label: 'Supplemental Essays' },
                                    { key: 'transcripts', label: 'High School Transcripts' },
                                    { key: 'recs', label: 'Letters of Rec' },
                                    { key: 'scores', label: 'Standardized Scores' },
                                    { key: 'feesPaid', label: 'Application Fee Paid' },
                                  ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-2 text-[10px] text-muted hover:text-onSurface cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={(milestones[app.id] || defaultMilestones)[item.key as keyof Milestones] || false}
                                        onChange={() => handleMilestoneToggle(app.id, item.key as keyof Milestones)}
                                        className="rounded bg-white/5 border-white/10 text-cyan focus:ring-0 w-3 h-3 cursor-pointer"
                                      />
                                      {item.label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                              className="w-full mt-3 px-2 py-1 rounded bg-surface-900 border border-white/10 text-[10px] text-muted focus:outline-none focus:border-cyan/50 cursor-pointer font-semibold"
                            >
                              <option value="RESEARCHING">Researching</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="ACCEPTED">Decision: Accepted</option>
                              <option value="REJECTED">Decision: Rejected</option>
                            </select>
                          </div>
                        ))}
                        {getFilteredApps('SUBMITTED').length === 0 && (
                          <p className="text-center text-muted text-[10px] py-12">No submitted schools.</p>
                        )}
                      </div>
                    </div>

                    {/* Column 4: Decisions (Accepted / Rejected) */}
                    <div className="glass p-4 space-y-3 min-h-[350px] bg-white/1 flex flex-col">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Decision</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-cyan">
                          {getFilteredApps('ACCEPTED').length + getFilteredApps('REJECTED').length}
                        </span>
                      </div>
                      <div className="space-y-3 flex-1">
                        {/* Accepted */}
                        {getFilteredApps('ACCEPTED').map((app) => (
                          <div key={app.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-3.5 hover:border-green-500/35 transition-all">
                            <div className="flex justify-between items-start gap-2">
                              <span onClick={() => toggleCard(app.id)} className="font-geist font-bold text-sm text-green-400 hover:text-green-300 transition-colors cursor-pointer truncate block">
                                {app.college.name}
                              </span>
                              {app.college.matchScore != null && (
                                <span className="text-xs font-bold text-cyan ml-1 whitespace-nowrap">
                                  {app.college.matchScore}%
                                </span>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-end mt-3 border-t border-white/5 pt-2">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 font-bold uppercase tracking-wider text-green-400 w-max">Accepted ✓</span>
                                <span className="text-[10px] text-muted font-semibold">📅 {getCollegeDeadline(app.college.slug)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleCard(app.id)} className="text-[9px] font-bold text-cyan uppercase tracking-wider hover:underline">Checklist</button>
                                <button onClick={() => handleRemove(app.id)} className="text-muted hover:text-red-400 text-xs pl-1">✕</button>
                              </div>
                            </div>

                            {/* Expanded Milestone Checklist */}
                            {expandedCards[app.id] && (
                              <div className="mt-3 border-t border-white/5 pt-2.5 space-y-2 animate-fadeUp">
                                <span className="text-[9px] text-cyan uppercase font-bold tracking-wider block">Required Checklists</span>
                                <div className="space-y-1.5">
                                  {[
                                    { key: 'essays', label: 'Supplemental Essays' },
                                    { key: 'transcripts', label: 'High School Transcripts' },
                                    { key: 'recs', label: 'Letters of Rec' },
                                    { key: 'scores', label: 'Standardized Scores' },
                                    { key: 'feesPaid', label: 'Application Fee Paid' },
                                  ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-2 text-[10px] text-muted hover:text-onSurface cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={(milestones[app.id] || defaultMilestones)[item.key as keyof Milestones] || false}
                                        onChange={() => handleMilestoneToggle(app.id, item.key as keyof Milestones)}
                                        className="rounded bg-white/5 border-white/10 text-cyan focus:ring-0 w-3 h-3 cursor-pointer"
                                      />
                                      {item.label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                              className="w-full mt-3 px-2 py-1 rounded bg-surface-900 border border-white/10 text-[10px] text-muted focus:outline-none cursor-pointer font-semibold"
                            >
                              <option value="RESEARCHING">Researching</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="ACCEPTED">Decision: Accepted</option>
                              <option value="REJECTED">Decision: Rejected</option>
                            </select>
                          </div>
                        ))}
                        {/* Rejected */}
                        {getFilteredApps('REJECTED').map((app) => (
                          <div key={app.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 hover:border-red-500/35 transition-all">
                            <div className="flex justify-between items-start gap-2">
                              <span onClick={() => toggleCard(app.id)} className="font-geist font-bold text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer truncate block">
                                {app.college.name}
                              </span>
                              {app.college.matchScore != null && (
                                <span className="text-xs font-bold text-cyan ml-1 whitespace-nowrap">
                                  {app.college.matchScore}%
                                </span>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-end mt-3 border-t border-white/5 pt-2">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 font-bold uppercase tracking-wider text-red-400 w-max">Rejected</span>
                                <span className="text-[10px] text-muted font-semibold">📅 {getCollegeDeadline(app.college.slug)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleCard(app.id)} className="text-[9px] font-bold text-cyan uppercase tracking-wider hover:underline">Checklist</button>
                                <button onClick={() => handleRemove(app.id)} className="text-muted hover:text-red-400 text-xs pl-1">✕</button>
                              </div>
                            </div>

                            {/* Expanded Milestone Checklist */}
                            {expandedCards[app.id] && (
                              <div className="mt-3 border-t border-white/5 pt-2.5 space-y-2 animate-fadeUp">
                                <span className="text-[9px] text-cyan uppercase font-bold tracking-wider block">Required Checklists</span>
                                <div className="space-y-1.5">
                                  {[
                                    { key: 'essays', label: 'Supplemental Essays' },
                                    { key: 'transcripts', label: 'High School Transcripts' },
                                    { key: 'recs', label: 'Letters of Rec' },
                                    { key: 'scores', label: 'Standardized Scores' },
                                    { key: 'feesPaid', label: 'Application Fee Paid' },
                                  ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-2 text-[10px] text-muted hover:text-onSurface cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={(milestones[app.id] || defaultMilestones)[item.key as keyof Milestones] || false}
                                        onChange={() => handleMilestoneToggle(app.id, item.key as keyof Milestones)}
                                        className="rounded bg-white/5 border-white/10 text-cyan focus:ring-0 w-3 h-3 cursor-pointer"
                                      />
                                      {item.label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                              className="w-full mt-3 px-2 py-1 rounded bg-surface-900 border border-white/10 text-[10px] text-muted focus:outline-none cursor-pointer font-semibold"
                            >
                              <option value="RESEARCHING">Researching</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="ACCEPTED">Decision: Accepted</option>
                              <option value="REJECTED">Decision: Rejected</option>
                            </select>
                          </div>
                        ))}
                        {getFilteredApps('ACCEPTED').length === 0 && getFilteredApps('REJECTED').length === 0 && (
                          <p className="text-center text-muted text-[10px] py-12">Admissions pending.</p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* ── AI Application Advisor ── */}
                  <div className="glass p-6 space-y-4 border border-white/10 bg-white/2.5">
                    <div className="flex items-center gap-2 text-cyan">
                      <span className="text-xl">🤖</span>
                      <h3 className="font-geist font-bold text-xs uppercase tracking-widest">AI Application Advisor</h3>
                    </div>
                    <p className="text-onSurface text-sm leading-relaxed">
                      Your application strategy looks strong. You have <span className="font-semibold text-cyan">{reachCount} reach</span>, <span className="font-semibold text-cyan">{targetCount} target</span>, and <span className="font-semibold text-cyan">{safetyCount} safety</span> schools in progress. Focus on completing your MIT essay this week — it's your highest-match school with a November 1st deadline.
                    </p>
                    <div className="flex gap-2.5 flex-wrap pt-2">
                      <button onClick={() => alert('Essay coaching: Focus on explaining your passion for independent coding or research in the main MIT prompt.')} className="px-4 py-2 bg-white/5 hover:bg-cyan/15 hover:text-cyan border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition text-muted">Essay Tips</button>
                      <button onClick={() => alert('Deadline alerts: Early action deadlines close in 23 days (MIT, Stanford).')} className="px-4 py-2 bg-white/5 hover:bg-cyan/15 hover:text-cyan border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition text-muted">Deadline Alert</button>
                      <button onClick={() => alert('Financial aid comparison: All of your saved Ivy-adjacent schools offer 100% demonstrated financial aid.')} className="px-4 py-2 bg-white/5 hover:bg-cyan/15 hover:text-cyan border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition text-muted">Financial Aid</button>
                      <button onClick={() => alert('Interview prep: Stand out by asking clear, research-specific questions during your alumnus interviews.')} className="px-4 py-2 bg-white/5 hover:bg-cyan/15 hover:text-cyan border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition text-muted">Interview Prep</button>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon="📋"
                  message="No colleges currently saved in your active tracking pipeline."
                  ctaLabel="Explore Colleges"
                  ctaHref="/explore"
                />
              )}
            </div>
          )}

          {/* TAB 3: ACADEMIC PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fadeUp">
              <div className="glass p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-onSurface">Academic Profile Metrics</h2>
                  <p className="text-xs text-muted mt-1">Configure your official candidate stats. These parameters dynamically control college predictor compatibilities.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">Scholar Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">Unweighted GPA (0.00-4.00)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={gpa}
                        onChange={(e) => setGpa(e.target.value)}
                        placeholder="3.85"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">SAT Score (400-1600)</label>
                      <input
                        type="number"
                        min="400"
                        max="1600"
                        value={sat}
                        onChange={(e) => setSat(e.target.value)}
                        placeholder="1450"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">Intended Major</label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="Computer Science"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50"
                      />
                    </div>
                  </div>

                  {profileSuccess && (
                    <p className={`text-xs p-3 rounded-lg border ${
                      profileSuccess.includes('successfully')
                        ? 'text-cyan bg-cyan/5 border-cyan/20'
                        : 'text-red-400 bg-red-400/5 border-red-500/20'
                    }`}>
                      {profileSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-cyan text-surface-900 font-bold text-xs uppercase tracking-wider rounded-lg hover:shadow-[0_0_12px_rgba(0,244,254,0.3)] transition disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving metrics...' : 'Save Profile Metrics'}
                  </button>
                </form>
              </div>

              {/* Password Rotation */}
              <div className="glass p-6 md:p-8 space-y-6 border border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-onSurface">Rotate Account Credentials</h2>
                  <p className="text-xs text-muted mt-1">Rotate and secure your sign in access credentials.</p>
                </div>

                <form onSubmit={handleRotatePassword} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm focus:outline-none focus:border-cyan/50"
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-red-400 text-xs bg-red-400/5 border border-red-500/20 rounded-lg p-3">
                      {passwordError}
                    </p>
                  )}

                  {passwordSuccess && (
                    <p className="text-cyan text-xs bg-cyan/5 border border-cyan/20 rounded-lg p-3">
                      {passwordSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={rotatingPassword}
                    className="px-6 py-2.5 bg-cyan/10 hover:bg-cyan/15 text-cyan border border-cyan/25 font-bold text-xs uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                  >
                    {rotatingPassword ? 'Rotating credentials...' : 'Rotate Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: SAVED COMPARISONS */}
          {activeTab === 'comparisons' && (
            <div className="glass p-6 md:p-8 space-y-6 animate-fadeUp">
              <div>
                <h2 className="text-lg font-bold text-onSurface">Saved Comparisons Folders</h2>
                <p className="text-xs text-muted mt-1">Review, load, and manage your custom college side-by-side comparison overlays.</p>
              </div>

              {loadingComparisons ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : comparisons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparisons.map((comp) => (
                    <div key={comp.id} className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-geist font-bold text-sm text-cyan truncate">{comp.name}</h3>
                          <button
                            onClick={() => handleDeleteComparison(comp.id)}
                            className="text-muted hover:text-red-400 text-xs transition"
                            title="Remove Comparison"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[10px] text-muted mt-1 uppercase tracking-wider font-semibold">
                          Colleges: {comp.collegeIds.join(', ')}
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-[9px] text-muted font-mono">
                          Saved: {new Date(comp.createdAt).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/compare?ids=${comp.collegeIds.join(',')}`}
                          className="px-3 py-1.5 bg-cyan text-surface-900 font-extrabold text-[10px] uppercase tracking-wider rounded-lg hover:shadow-[0_0_8px_rgba(0,244,254,0.3)] transition"
                        >
                          📊 Load Comparison
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <span className="text-3xl block">⚖️</span>
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider">No Saved Comparisons</h4>
                  <p className="text-xs text-muted max-w-xs mx-auto">
                    Go to the college comparison page to build custom benchmarks for 2 or 3 colleges and persist them.
                  </p>
                  <Link
                    href="/compare"
                    className="inline-block px-4 py-2 bg-cyan text-surface-900 font-extrabold text-xs uppercase tracking-wider rounded-lg hover:shadow-[0_0_10px_rgba(0,244,254,0.3)] transition"
                  >
                    ⚖️ Launch Compare Tool
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB: ADMIN USER CONSOLE */}
          {activeTab === 'admin' && isAdminUser && (
            <div className="glass p-6 md:p-8 space-y-6 animate-fadeUp">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-onSurface flex items-center gap-1.5">
                    <span>🛡️</span> Registered Users Administration
                  </h2>
                  <p className="text-xs text-muted mt-1">Search, register, update, and manage candidate user accounts securely.</p>
                </div>
                <button
                  onClick={handleOpenCreateUser}
                  className="px-4 py-2 bg-cyan text-surface-900 font-extrabold text-xs uppercase tracking-widest rounded-lg hover:shadow-[0_0_12px_rgba(0,244,254,0.3)] transition flex items-center gap-1.5"
                >
                  ➕ Register User
                </button>
              </div>

              {/* Search Bar */}
              <div className="w-full relative">
                <input
                  type="text"
                  placeholder="Filter users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                />
              </div>

              {loadingUsers ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/1">
                  <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-muted uppercase tracking-wider bg-white/2">
                        <th className="py-3 px-4 font-bold">User Name</th>
                        <th className="py-3 px-4 font-bold">Email</th>
                        <th className="py-3 px-4 font-bold">Academic Profile</th>
                        <th className="py-3 px-4 font-bold">Created At</th>
                        <th className="py-3 px-4 font-bold text-right">CRUD Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-onSurface">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-onSurface">{u.name || 'Anonymous User'}</div>
                            <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-extrabold mt-1 uppercase tracking-wider ${
                              u.role === 'ADMIN' 
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                : u.role === 'SUB_ADMIN' 
                                ? 'bg-cyan/20 text-cyan border border-cyan/30' 
                                : 'bg-white/10 text-muted border border-white/10'
                            }`}>
                              {u.role === 'ADMIN' ? '🛡️ Super Admin' : u.role === 'SUB_ADMIN' ? '🔬 Sub-Admin' : '🎓 Scholar'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-muted">{u.email}</td>
                          <td className="py-3 px-4 leading-normal text-muted font-semibold">
                            GPA: <span className="text-cyan font-bold">{u.gpa != null ? u.gpa.toFixed(2) : '—'}</span> | 
                            SAT: <span className="text-cyan font-bold">{u.sat || '—'}</span> | 
                            Major: <span className="text-cyan font-bold">{u.major || '—'}</span>
                          </td>
                          <td className="py-3 px-4 text-muted font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-cyan/15 hover:text-cyan border border-white/10 rounded font-bold uppercase tracking-wider text-[9px] transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={u.id === session?.user?.id}
                              className="px-2.5 py-1 bg-red-500/5 hover:bg-red-500/15 hover:text-red-400 border border-red-500/20 rounded font-bold uppercase tracking-wider text-[9px] transition disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted text-xs py-8">No registered users matched your criteria.</p>
              )}
            </div>
          )}

          {/* TAB 4: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="glass p-6 md:p-8 space-y-8 animate-fadeUp">
              <div>
                <h2 className="text-lg font-bold text-onSurface">Portal Control & System Preferences</h2>
                <p className="text-xs text-muted mt-1 font-medium">Configure Cockpit dashboard behavior, alerts, and platform security toggles.</p>
              </div>

              <div className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan border-b border-white/5 pb-1">Safety & Authorization</h3>
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <span className="text-sm font-semibold text-onSurface block">Multi-Factor Authentication (MFA)</span>
                      <span className="text-[11px] text-muted">Request secondary OTP code confirmation on credentials authorization prompts.</span>
                    </div>
                    <button
                      onClick={() => handleSettingsToggle('mfa', !mfaEnabled)}
                      className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                        mfaEnabled ? 'bg-cyan' : 'bg-white/10'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-surface-900 absolute top-1 transition-all ${
                        mfaEnabled ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan border-b border-white/5 pb-1">Milestones & Warnings</h3>
                  
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <span className="text-sm font-semibold text-onSurface block">Admissions Deadlines Alerts</span>
                      <span className="text-[11px] text-muted">Display warnings in Dashboard 7 days prior to college Early / Regular submission deadlines.</span>
                    </div>
                    <button
                      onClick={() => handleSettingsToggle('alerts', !alertsEnabled)}
                      className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                        alertsEnabled ? 'bg-cyan' : 'bg-white/10'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-surface-900 absolute top-1 transition-all ${
                        alertsEnabled ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <span className="text-sm font-semibold text-onSurface block">Weekly Admissions Digest</span>
                      <span className="text-[11px] text-muted">Receive compiled statistics of admissions compatibility results via email.</span>
                    </div>
                    <button
                      onClick={() => handleSettingsToggle('digest', !digestEnabled)}
                      className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                        digestEnabled ? 'bg-cyan' : 'bg-white/10'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-surface-900 absolute top-1 transition-all ${
                        digestEnabled ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {savedSettingsSuccess && (
                  <p className="text-cyan text-xs font-bold uppercase tracking-wider animate-pulse">
                    ✓ Preference Synced in Real Time
                  </p>
                )}

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 border-b border-red-500/20 pb-1">Danger Zone</h3>
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    <div>
                      <span className="text-sm font-bold text-red-400 block">Reset Application Tracker Pipeline</span>
                      <span className="text-[11px] text-muted">Permanently unsave and remove all tracked colleges from the Kanban board tracker.</span>
                    </div>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to clear your entire tracked list? This action is permanent.')) return;
                        try {
                          for (const app of applications) {
                            await fetch(`/api/saved/${app.id}`, { method: 'DELETE' });
                            localStorage.removeItem(`milestones_${app.id}`);
                          }
                          setApplications([]);
                          alert('Tracker pipeline cleared.');
                        } catch {}
                      }}
                      className="px-4 py-2 text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition whitespace-nowrap"
                    >
                      Clear All Saved Data
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Admin User Register/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/80 backdrop-blur-md animate-fadeUp">
          <div className="glass w-full max-w-md p-6 relative shadow-2xl border border-cyan/20 bg-surface-800">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-cyan text-lg transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="font-geist font-bold text-onSurface text-md">
                    {modalMode === 'create' ? 'Register New Candidate Account' : 'Edit Candidate User details'}
                  </h3>
                  <p className="text-[9px] text-cyan font-semibold uppercase tracking-wider">
                    {modalMode === 'create' ? 'Admin Action: Create user record' : 'Admin Action: Patch user record'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUserFormSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="modal-user-name" className="text-[9px] text-muted uppercase tracking-wider block mb-1 font-bold">User Name</label>
                  <input
                    id="modal-user-name"
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Candidate full name"
                    className="w-full px-3.5 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                  />
                </div>

                <div>
                  <label htmlFor="modal-user-email" className="text-[9px] text-muted uppercase tracking-wider block mb-1 font-bold">Email Address</label>
                  <input
                    id="modal-user-email"
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="candidate@example.com"
                    className="w-full px-3.5 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                  />
                </div>

                <div>
                  <label htmlFor="modal-user-pass" className="text-[9px] text-muted uppercase tracking-wider block mb-1 font-bold">
                    {modalMode === 'create' ? 'Account Password' : 'New Password (Optional)'}
                  </label>
                  <input
                    id="modal-user-pass"
                    type="password"
                    required={modalMode === 'create'}
                    value={userForm.password}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder={modalMode === 'create' ? '••••••••' : 'Leave blank to keep unchanged'}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                  />
                </div>

                <div>
                  <label htmlFor="modal-user-role" className="text-[9px] text-muted uppercase tracking-wider block mb-1 font-bold">System Privilege Role</label>
                  <select
                    id="modal-user-role"
                    value={userForm.role}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs focus:outline-none focus:border-cyan/50 cursor-pointer font-bold text-cyan"
                  >
                    <option value="USER">🎓 Standard Candidate Student</option>
                    <option value="SUB_ADMIN">🔬 Admissions Sub-Admin Partner</option>
                    <option value="ADMIN">🛡️ Super Administrator</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="modal-user-gpa" className="text-[8px] text-muted uppercase tracking-wider block mb-1 font-bold">GPA (0-4.0)</label>
                    <input
                      id="modal-user-gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      required
                      value={userForm.gpa}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, gpa: e.target.value }))}
                      placeholder="3.85"
                      className="w-full px-2.5 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-user-sat" className="text-[8px] text-muted uppercase tracking-wider block mb-1 font-bold">SAT (400-1600)</label>
                    <input
                      id="modal-user-sat"
                      type="number"
                      min="400"
                      max="1600"
                      required
                      value={userForm.sat}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, sat: e.target.value }))}
                      placeholder="1450"
                      className="w-full px-2.5 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-user-major" className="text-[8px] text-muted uppercase tracking-wider block mb-1 font-bold">Major</label>
                    <input
                      id="modal-user-major"
                      type="text"
                      required
                      value={userForm.major}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, major: e.target.value }))}
                      placeholder="CS"
                      className="w-full px-2.5 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                    />
                  </div>
                </div>

                {userModalSuccess && (
                  <p className="text-cyan text-xs bg-cyan/5 border border-cyan/20 rounded-lg px-3 py-2 leading-relaxed">
                    {userModalSuccess}
                  </p>
                )}

                {userModalError && (
                  <p className="text-red-400 text-xs bg-red-400/5 border border-red-500/20 rounded-lg px-3 py-2 leading-relaxed">
                    {userModalError}
                  </p>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-onSurface text-xs font-semibold rounded-lg border border-white/10 transition-all uppercase tracking-wider"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan text-surface-900 font-bold text-xs uppercase tracking-wider rounded-lg hover:shadow-[0_0_16px_rgba(0,244,254,0.3)] transition-all flex justify-center items-center gap-1.5"
                  >
                    {modalMode === 'create' ? 'Register Account' : 'Update Stats'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto pt-24 px-4 space-y-8 animate-pulse">
        <div className="h-10 w-48 rounded bg-white/5" />
        <div className="h-64 rounded-xl bg-white/5" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
