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
  User,
  Building2,
  AlertCircle,
  Tag,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { navigate } = useRouter();
  const { signup } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('NovaMart Electronics');
  const [industry, setIndustry] = useState('Retail / Electronics');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!displayName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!businessName.trim()) {
      setErrorMessage('Please enter your business or store name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and re-type.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(
        email.trim(),
        password,
        displayName.trim(),
        businessName.trim(),
        industry.trim()
      );
      navigate('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background grid accent */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            OpsPilot AI
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 font-medium">
            Create your account & initialize your business workspace
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          <div className="mb-6 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-blue-950 mb-0.5">
                Multi-Tenant Data Isolation
              </span>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Signing up provisions a dedicated <strong>businesses/{'{businessId}'}</strong> workspace and isolated Firestore security boundary.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div
              id="signup-error-alert"
              className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Dev Anand"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-email-input"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-business-name-input"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="NovaMart Electronics"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Category
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    id="signup-industry-select"
                    disabled={isSubmitting}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="Retail / Electronics">Retail / Electronics</option>
                    <option value="Apparel & Fashion">Apparel & Fashion</option>
                    <option value="Groceries & Supermarket">Groceries & Supermarket</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="General E-Commerce">General E-Commerce</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-password-input"
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
                    id="btn-toggle-signup-password"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    disabled={isSubmitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                  <button
                    type="button"
                    id="btn-toggle-signup-confirm-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-create-account-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Provisioning Account & Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Workspace & Sign Up</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <button
              id="link-go-to-login"
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>OpsPilot AI • Production-Ready Google Cloud Foundation</p>
        </div>
      </div>
    </div>
  );
};
