import React, { useState } from 'react';
import { useRouter } from '@/src/lib/router';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { formatAuthError } from '@/src/lib/firebase/auth';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Store,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { login, loginGoogle, signup } = useAuth();

  const [email, setEmail] = useState('manager@novamart.in');
  const [password, setPassword] = useState('NovaMart2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    const demoEmail = 'manager@novamart.in';
    const demoPass = 'NovaMart2026!';

    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential' ||
        (err as Error)?.message?.includes('user-not-found')
      ) {
        // Auto-provision demo manager account if it doesn't exist yet
        try {
          await signup(
            demoEmail,
            demoPass,
            'Dev Anand',
            'NovaMart Electronics',
            'Retail / Electronics'
          );
          navigate('/dashboard');
          return;
        } catch (regErr) {
          setErrorMessage(formatAuthError(regErr));
        }
      } else {
        setErrorMessage(formatAuthError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background visual grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            OpsPilot AI
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 font-medium">
            Your AI operations manager for small businesses.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          {/* Production Firebase Auth Indicator */}
          <div className="mb-6 p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/70 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-emerald-950 mb-0.5">
                Firebase Authentication (Live)
              </span>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Secure enterprise email/password authentication & data isolation powered by Cloud Firestore.
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@novamart.in"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Min 6 characters
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                />
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Remember session</span>
              </label>

              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Store className="w-3 h-3 text-slate-400" />
                Workspace Isolation
              </span>
            </div>

            <button
              id="btn-sign-in"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Alternative Auth Methods */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <button
              id="btn-google-sign-in"
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              id="btn-demo-access"
              type="button"
              disabled={isSubmitting}
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Explore as Demo Manager (NovaMart)</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Need a new workspace?{' '}
            <button
              id="link-create-account"
              type="button"
              onClick={() => navigate('/signup')}
              className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Create Account & Workspace
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>OpsPilot AI • Built for Google Cloud / Hack2Skill Ideathon</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Active: Firebase Auth • Cloud Firestore Security Rules (ABAC)
          </p>
        </div>
      </div>
    </div>
  );
};
