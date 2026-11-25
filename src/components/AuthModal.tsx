import React, { useState, useEffect } from 'react';
import {
  useAuth,
  formatFirebaseAuthError,
} from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  RefreshCw,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export type AuthModalTab = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: AuthModalTab;
  onClose: () => void;
  onAuthSuccess?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onAuthSuccess,
}) => {
  const {
    user,
    signUpWithEmail,
    logInWithEmail,
    logInWithGoogle,
    sendPasswordReset,
    resendVerificationEmail,
    refreshVerificationStatus,
    logOut,
  } = useAuth();

  const [tab, setTab] = useState<AuthModalTab>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await logInWithEmail(email, password);
      onAuthSuccess?.('Welcome back to SME Brand Studio!');
      onClose();
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!displayName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password, displayName, businessName);
      setSuccessMsg(
        `Account created! We sent a verification link to ${email.trim()}. Please verify your email before saving projects.`
      );
      onAuthSuccess?.('Account created! Check your email for verification link.');
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email.trim()) {
      setError('Please enter the email address associated with your account.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSuccessMsg(
        `Password reset instructions sent to ${email.trim()}. Check your inbox (and spam folder) to set a new password.`
      );
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await logInWithGoogle();
      onAuthSuccess?.('Signed in with Google successfully!');
      onClose();
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await resendVerificationEmail();
      setSuccessMsg(`Verification email re-sent to ${user?.email}.`);
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckVerified = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const verified = await refreshVerificationStatus();
      if (verified) {
        onAuthSuccess?.('Email verified! Your cloud account & dashboard are now active.');
        onClose();
      } else {
        setError('Your email is still unverified. Click the verification link sent to your inbox, then click Refresh Status.');
      }
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              SME Brand Studio Account
            </span>
            <h2 className="text-lg font-extrabold tracking-tight">
              {user && !user.emailVerified
                ? 'Verify Your Email'
                : tab === 'login'
                ? 'Log In to Your Studio'
                : tab === 'signup'
                ? 'Create Customer Account'
                : 'Reset Your Password'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close account modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* If signed in but email unverified */}
          {user && !user.emailVerified ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Email Verification Required</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">
                  Signed in as <strong>{user.email}</strong>. To enforce strict security rules on your saved brand projects, please click the verification link in your inbox.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleCheckVerified}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>I Verified My Email — Refresh Status</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Resend Verification Email
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await logOut();
                    onClose();
                  }}
                  className="w-full py-2 px-4 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
                {(
                  [
                    { id: 'login', label: 'Log In' },
                    { id: 'signup', label: 'Sign Up' },
                    { id: 'reset', label: 'Reset' },
                  ] as { id: AuthModalTab; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTab(t.id);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tab === t.id
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourbusiness.com"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setTab('reset');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isSubmitting ? 'Signing In...' : 'Log In'}</span>
                  </button>
                </form>
              )}

              {tab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Chidinma Okafor"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Business Name (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Nonnies Zobo Infusion"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourbusiness.com"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isSubmitting ? 'Creating Account...' : 'Create Free Account'}</span>
                  </button>
                </form>
              )}

              {tab === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Enter your registered email address and Firebase Authentication will send you a secure password reset link.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourbusiness.com"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isSubmitting ? 'Sending Reset Link...' : 'Send Password Reset Email'}</span>
                  </button>
                </form>
              )}

              {/* Divider + Google Sign-In option */}
              {tab !== 'reset' && (
                <div className="pt-2 space-y-3">
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-stone-200 w-full" />
                    <span className="bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase">
                      or
                    </span>
                    <div className="border-t border-stone-200 w-full" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
