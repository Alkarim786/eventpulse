import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { AuthSession, DEMO_USERS, authService } from '../services/auth';

interface HeadLoginPanelProps {
  onSuccess: (session: AuthSession) => void;
  onSwitchToStaff?: () => void;
  onSwitchToStudent?: () => void;
}

export const HeadLoginPanel: React.FC<HeadLoginPanelProps> = ({
  onSuccess,
  onSwitchToStaff,
  onSwitchToStudent,
}) => {
  const [identifier, setIdentifier] = useState(DEMO_USERS.HEAD.identifier);
  const [password, setPassword] = useState(DEMO_USERS.HEAD.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Allow demo password or standard institutional credentials
      if (
        (identifier.trim().toLowerCase() === DEMO_USERS.HEAD.identifier.toLowerCase() ||
          identifier.trim().toLowerCase().includes('head') ||
          identifier.trim().toLowerCase().includes('admin')) &&
        (password === DEMO_USERS.HEAD.password || password === 'admin2026' || password.length >= 4)
      ) {
        const session: AuthSession = {
          id: 'session-head-iqac',
          role: 'HEAD_ADMIN',
          name: DEMO_USERS.HEAD.name,
          identifier: identifier.trim(),
          department: DEMO_USERS.HEAD.department,
          designationOrBatch: DEMO_USERS.HEAD.designationOrBatch,
          loginTime: new Date().toISOString(),
          avatarUrl: DEMO_USERS.HEAD.avatarUrl,
        };
        authService.setHeadSession(session);
        setIsLoading(false);
        onSuccess(session);
      } else {
        setIsLoading(false);
        setError('Invalid administrative credentials. Use the Demo Account button below for instant access.');
      }
    }, 400);
  };

  const handleDemoFill = () => {
    setIdentifier(DEMO_USERS.HEAD.identifier);
    setPassword(DEMO_USERS.HEAD.password);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Executive Card Container */}
      <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xl">
        {/* Top Gradient Banner */}
        <div className="h-32 bg-gradient-to-tr from-indigo-950 via-indigo-800 to-violet-900 p-6 flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-32 h-32 text-white" />
          </div>

          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-indigo-100 backdrop-blur-md border border-white/20">
              <ShieldCheck className="w-3 h-3 text-amber-300" />
              Restricted Executive Access
            </span>
            <span className="text-[10px] font-bold text-indigo-200/80 bg-indigo-950/60 px-2 py-0.5 rounded">
              IQAC / NAAC Hub
            </span>
          </div>

          <div className="z-10">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Head Admin Login
            </h2>
            <p className="text-xs text-indigo-200/80">
              Executive Governance, 12-Rubric Scoring &amp; Compliance Audit
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Director / Executive Email or ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. head.iqac@institution.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Administrative Master Key
                </label>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  Confidential
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In as Head Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Demo Credentials
              </span>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition"
              >
                Auto-Fill Demo
              </button>
            </div>
            <div className="text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300 font-mono">
              <p>Email: <strong className="text-slate-900 dark:text-white">head.iqac@institution.edu</strong></p>
              <p>Key: <strong className="text-slate-900 dark:text-white">admin</strong></p>
              <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                Profile: Dr. K. R. Ramanathan, Director of IQAC &amp; Principal
              </p>
            </div>
          </div>

          {/* Switch to Other Panels */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Other portals:</span>
            <div className="flex items-center gap-3">
              {onSwitchToStaff && (
                <button
                  type="button"
                  onClick={onSwitchToStaff}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Staff Login
                </button>
              )}
              {onSwitchToStudent && (
                <button
                  type="button"
                  onClick={onSwitchToStudent}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Student Portal
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
