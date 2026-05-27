"use client";

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState<boolean | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Standard user forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPreviousPassword, setForgotPreviousPassword] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Admin secret key & passcode states
  const [secretKey, setSecretKey] = useState('');
  const [customAdminPasscode, setCustomAdminPasscode] = useState('abc123');
  const [adminRecoveryMode, setAdminRecoveryMode] = useState(false);
  const [adminRecoveryEmail, setAdminRecoveryEmail] = useState('');
  const [adminPreviousPasscode, setAdminPreviousPasscode] = useState('');
  const [adminNewPasscode, setAdminNewPasscode] = useState('');
  const [adminRecoverySuccess, setAdminRecoverySuccess] = useState('');

  // Check if Google provider is configured
  useEffect(() => {
    fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((providers) => {
        setIsGoogleConfigured(!!providers?.google);
      })
      .catch(() => setIsGoogleConfigured(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json();
          if (data.error && typeof data.error === 'object') {
            const messages = Object.entries(data.error)
              .map(([field, msgs]) => `${field.toUpperCase()}: ${(msgs as string[]).join(', ')}`)
              .join(' | ');
            setError(messages || 'Registration failed.');
          } else {
            setError(typeof data.error === 'string' ? data.error : 'Registration failed.');
          }
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          previousPassword: forgotPreviousPassword,
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to rotate password.');
      } else {
        setForgotSuccess(true);
        setForgotPreviousPassword('');
        setForgotNewPassword('');
      }
    } catch {
      setError('Failed to process password rotation. Please try again.');
    }
    setLoading(false);
  };

  const fillDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: 'demo@example.com',
        password: 'demo123',
      });
      if (result?.error) {
        setError('Sample user sign-in failed. Please try again.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Something went wrong during sample user login.');
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    const isPasscodeCorrect = secretKey === customAdminPasscode;
    const isKeyCorrect = secretKey === 'UNIVISION_ADMIN_2026';
    if (!isPasscodeCorrect && !isKeyCorrect) {
      setError('Invalid admin secret passcode.');
      return;
    }
    setLoading(true);
    setError('');
    setMode('login');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: 'peelapuneeth@gmail.com',
        password: 'admin123',
      });
      if (result?.error) {
        setError('Evaluator Admin login failed.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Evaluator Admin login failed.');
    }
    setLoading(false);
  };

  const handleAdminRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (adminRecoveryEmail.toLowerCase().trim() !== 'peelapuneeth@gmail.com') {
      setAdminRecoverySuccess('❌ Access Denied: Recovery is only permitted for the authorized admin email.');
      return;
    }

    if (adminPreviousPasscode !== customAdminPasscode) {
      setAdminRecoverySuccess('❌ Incorrect Previous Passcode. Passcode recovery authentication failed.');
      return;
    }

    if (adminNewPasscode.trim().length < 4) {
      setError('New passcode must be at least 4 characters.');
      return;
    }

    setCustomAdminPasscode(adminNewPasscode.trim());
    setAdminRecoverySuccess(`🔑 Admin passcode successfully rotated! New passcode: "${adminNewPasscode.trim()}" is now active.`);
    setSecretKey(adminNewPasscode.trim());
    setAdminPreviousPasscode('');
    setAdminNewPasscode('');
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleConfigured === false) {
      setShowSetupModal(true);
      return;
    }
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Google Sign-In configuration required.');
    }
  };

  const isPasscodeCorrect = secretKey === customAdminPasscode;
  const isKeyCorrect = secretKey === 'UNIVISION_ADMIN_2026';
  const isUnlocked = isPasscodeCorrect || isKeyCorrect;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 bg-gradient-to-br from-surface-900 via-[#0d0e14] to-surface-900">
      <div className="w-full max-w-md space-y-6">
        {/* Warning Banner */}
        <div className="glass-cyan p-4 text-xs text-cyan space-y-1.5 animate-fadeUp">
          <p className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <span>⚠️</span> Evaluator Notice
          </p>
          <p className="leading-relaxed">
            Please register a new account to experience the **Auto-Seeded Onboarding College Pipeline** or use the credentials below to explore preloaded data.
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass p-8 md:p-10 w-full animate-fadeUp shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-geist font-bold text-cyan neon-text tracking-wider">UNIVISION</h1>
            <p className="text-muted text-xs mt-2 font-medium uppercase tracking-wider">
              {mode === 'login' && 'AI-POWERED COLLEGE DISCOVERY COCKPIT'}
              {mode === 'signup' && 'START YOUR MATHEMATICALLY CURATED JOURNEY'}
              {mode === 'forgot' && 'CREDENTIAL ROTATION CONTROL PANEL'}
            </p>
          </div>

          {mode === 'forgot' ? (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-sm font-bold text-cyan uppercase tracking-wider">Rotate Password</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-wider mt-1">Verify previous credentials to rotate password</p>
              </div>

              {forgotSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <div className="text-4xl animate-bounce">🔑</div>
                  <p className="text-xs text-cyan bg-cyan/5 border border-cyan/20 p-3 rounded-lg leading-relaxed">
                    Your password has been successfully verified, rotated, and updated! You can now sign in using your new credentials.
                  </p>
                  <button
                    onClick={() => { setMode('login'); setForgotSuccess(false); setForgotEmail(''); }}
                    className="text-xs text-cyan hover:underline font-bold mt-2"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">Email Address</label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="forgot-prev-password" className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">Previous Password</label>
                    <input
                      id="forgot-prev-password"
                      type="password"
                      value={forgotPreviousPassword}
                      onChange={(e) => setForgotPreviousPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="forgot-new-password" className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">New Password</label>
                    <input
                      id="forgot-new-password"
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs bg-red-400/5 border border-red-500/20 rounded-lg px-3 py-2 leading-relaxed">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-cyan text-surface-900 font-bold text-xs uppercase tracking-widest rounded-lg hover:shadow-[0_0_24px_rgba(0,244,254,0.4)] transition-all disabled:opacity-50"
                  >
                    {loading ? 'Rotating Credentials...' : 'Rotate Password'}
                  </button>

                  <p className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); }}
                      className="text-xs text-muted hover:text-cyan font-bold transition-all"
                    >
                      ← Back to Sign In
                    </button>
                  </p>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Toggle */}
              <div className="flex rounded-lg bg-white/5 p-1 mb-6 border border-white/5">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all uppercase tracking-wider ${
                    mode === 'login'
                      ? 'bg-cyan text-surface-900 shadow-[0_0_12px_rgba(0,244,254,0.3)]'
                      : 'text-muted hover:text-onSurface'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all uppercase tracking-wider ${
                    mode === 'signup'
                      ? 'bg-cyan text-surface-900 shadow-[0_0_12px_rgba(0,244,254,0.3)]'
                      : 'text-muted hover:text-onSurface'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="auth-name" className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">Name</label>
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="auth-email" className="text-[10px] text-muted uppercase tracking-wider block mb-1.5 font-bold">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="auth-password" className="text-[10px] text-muted uppercase tracking-wider font-bold">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(''); }}
                        className="text-[10px] text-cyan hover:underline font-bold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-onSurface text-sm placeholder-muted focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-400/5 border border-red-500/20 rounded-lg px-3 py-2 leading-relaxed">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-cyan text-surface-900 font-bold text-xs uppercase tracking-widest rounded-lg hover:shadow-[0_0_24px_rgba(0,244,254,0.4)] transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                      {mode === 'login' ? 'Authorizing Cockpit…' : 'Building Profile…'}
                    </span>
                  ) : mode === 'login' ? (
                    'Launch Mission Control'
                  ) : (
                    'Deploy New Account'
                  )}
                </button>
              </form>

              {/* Social Sign-In */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-muted text-[10px] uppercase font-bold tracking-wider">or sign in with</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-onSurface text-xs font-semibold rounded-lg flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>

              {/* Toggle Link */}
              <p className="text-center text-muted text-xs mt-6 font-medium">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                  className="text-cyan hover:underline font-bold"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>

        {/* Demo Credentials Card */}
        <div className="glass p-5 space-y-3 relative overflow-hidden border border-white/5 bg-white/2 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">🔬 Sample Scholar Account</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan/20 text-cyan font-bold uppercase">Preloaded</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted block text-[9px] uppercase tracking-wider">Email</span>
              <span className="font-mono text-onSurface font-semibold">demo@example.com</span>
            </div>
            <div>
              <span className="text-muted block text-[9px] uppercase tracking-wider">Password</span>
              <span className="font-mono text-onSurface font-semibold">demo123</span>
            </div>
          </div>
          <button
            onClick={fillDemo}
            type="button"
            className="w-full py-2.5 bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-cyan text-xs font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(0,244,254,0.1)] hover:shadow-[0_0_16px_rgba(0,244,254,0.2)]"
          >
            ⚡ One-Click Sample Scholar Login
          </button>
        </div>

        {/* Quick Admin Login (Passcode Protected) */}
        <div className="glass p-5 space-y-3 relative overflow-hidden border border-cyan/20 bg-cyan/5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-cyan uppercase font-bold tracking-wider">🛡️ Evaluator Admin Portal</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan/15 text-cyan font-bold uppercase">Protected</span>
          </div>

          {adminRecoveryMode ? (
            <form onSubmit={handleAdminRecovery} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="admin-recovery-email" className="text-[9px] text-muted uppercase tracking-wider block font-bold">Admin Email Address</label>
                <input
                  id="admin-recovery-email"
                  type="email"
                  value={adminRecoveryEmail}
                  onChange={(e) => setAdminRecoveryEmail(e.target.value)}
                  required
                  placeholder="Enter peelapuneeth@gmail.com..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-prev-passcode" className="text-[9px] text-muted uppercase tracking-wider block font-bold">Previous Passcode</label>
                <input
                  id="admin-prev-passcode"
                  type="password"
                  value={adminPreviousPasscode}
                  onChange={(e) => setAdminPreviousPasscode(e.target.value)}
                  required
                  placeholder="e.g. abc123"
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-new-passcode" className="text-[9px] text-muted uppercase tracking-wider block font-bold">New Passcode</label>
                <input
                  id="admin-new-passcode"
                  type="password"
                  value={adminNewPasscode}
                  onChange={(e) => setAdminNewPasscode(e.target.value)}
                  required
                  placeholder="Min 4 characters"
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                />
              </div>

              {adminRecoverySuccess && (
                <div className="space-y-2">
                  <p className={`text-[10px] p-2 rounded-lg leading-relaxed ${adminRecoverySuccess.startsWith('❌') ? 'bg-red-400/5 border border-red-500/20 text-red-400' : 'bg-cyan/5 border border-cyan/20 text-cyan font-semibold'}`}>
                    {adminRecoverySuccess}
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-400 text-[10px] bg-red-400/5 border border-red-500/20 rounded-lg px-2 py-1 leading-relaxed">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-cyan text-surface-900 text-xs font-bold rounded-lg transition-all hover:shadow-[0_0_16px_rgba(0,244,254,0.3)]"
              >
                🔐 Rotate Admin Passcode
              </button>
            </form>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="admin-secret-key" className="text-[9px] text-muted uppercase tracking-wider block font-bold">Admin Secret Passcode</label>
                <input
                  id="admin-secret-key"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter passcode to unlock admin..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-white/10 text-onSurface text-xs placeholder-muted focus:outline-none focus:border-cyan/50"
                />
              </div>
              <button
                onClick={handleAdminLogin}
                disabled={loading || !isUnlocked}
                type="button"
                className="w-full py-2 bg-cyan text-surface-900 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:shadow-none hover:shadow-[0_0_16px_rgba(0,244,254,0.3)]"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-surface-900/30 border-t-surface-900 rounded-full animate-spin" />
                ) : (
                  '🔓 Launch Admin Cockpit'
                )}
              </button>
            </>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setAdminRecoveryMode(!adminRecoveryMode); setAdminRecoverySuccess(''); }}
              className="text-[9px] text-muted hover:text-cyan font-bold transition-all uppercase tracking-wider"
            >
              {adminRecoveryMode ? '← Back to Admin Login' : 'Forgot Admin Passcode?'}
            </button>
          </div>

          <p className="text-center text-[9px] text-muted">
            🔑 Secret Admin Key: <span className={`font-mono text-cyan transition-all duration-500 cursor-help ${isPasscodeCorrect ? 'blur-none select-all font-semibold text-cyan drop-shadow-[0_0_8px_rgba(0,244,254,0.5)]' : 'blur-[6px] select-none opacity-40'}`}>UNIVISION_ADMIN_2026</span>
          </p>
        </div>

      </div>

      {/* Google Setup Guide Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/80 backdrop-blur-md animate-fadeUp">
          <div className="glass w-full max-w-lg p-6 md:p-8 relative shadow-2xl border border-cyan/20 bg-surface-800">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-cyan text-lg transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="font-geist font-bold text-lg text-onSurface">Google OAuth Setup Guide</h3>
                  <p className="text-[10px] text-cyan font-semibold uppercase tracking-wider">Missing Client Credentials</p>
                </div>
              </div>

              <p className="text-muted text-xs leading-relaxed">
                Google Sign-In is built and fully integrated, but requires active Google Cloud Client credentials. To link them to your deployment:
              </p>

              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-muted leading-relaxed">
                <p>
                  <strong className="text-cyan">1. Get Keys:</strong> Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline inline-flex items-center gap-0.5">Google Cloud Console ↗</a>, create/select project **Univision**, configure the **OAuth consent screen** (External), and create a **Web application** client ID.
                </p>
                <p>
                  <strong className="text-cyan">2. Add Redirect URI:</strong> Input the exact redirect URI:
                  <code className="block mt-1 p-2 rounded bg-surface-900 text-cyan font-mono text-[10px] border border-white/5 select-all">
                    https://univision-1.vercel.app/api/auth/callback/google
                  </code>
                </p>
                <p>
                  <strong className="text-cyan">3. Deploy Env Vars:</strong> In your terminal, run these two commands to add the variables to Vercel and trigger a rebuild:
                  <code className="block mt-1 p-2 rounded bg-surface-900 text-lavender font-mono text-[10px] border border-white/5 select-all break-all whitespace-pre-wrap">
                    npx vercel env add GOOGLE_CLIENT_ID production --value "your_client_id" --yes && npx vercel env add GOOGLE_CLIENT_SECRET production --value "your_client_secret" --yes && npx vercel --prod --yes
                  </code>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-onSurface text-xs font-semibold rounded-lg border border-white/10 transition-all uppercase tracking-wider"
                >
                  Configure Later
                </button>
                <button
                  onClick={async () => {
                    setShowSetupModal(false);
                    try {
                      await signIn('google', { callbackUrl: '/dashboard' });
                    } catch {
                      setError('Failed to trigger Google Sign-In.');
                    }
                  }}
                  className="flex-1 py-2.5 bg-cyan text-surface-900 font-bold text-xs uppercase tracking-wider rounded-lg hover:shadow-[0_0_16px_rgba(0,244,254,0.3)] transition-all"
                >
                  Continue to Sign-In Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
