import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Mail,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { AuthSession, DEMO_USERS, authService } from '../services/auth';

interface StaffLoginPanelProps {
  onSuccess: (session: AuthSession) => void;
  onSwitchToHead?: () => void;
  onSwitchToStudent?: () => void;
}

export const StaffLoginPanel: React.FC<StaffLoginPanelProps> = ({
  onSuccess,
  onSwitchToHead,
  onSwitchToStudent,
}) => {
  const [identifier, setIdentifier] = useState(DEMO_USERS.STAFF.identifier);
  const [password, setPassword] = useState(DEMO_USERS.STAFF.password);
  const [department, setDepartment] = useState(DEMO_USERS.STAFF.department);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Validate staff
      if (
        (identifier.trim().toLowerCase() === DEMO_USERS.STAFF.identifier.toLowerCase() ||
          identifier.trim().toLowerCase().includes('staff') ||
          identifier.trim().toLowerCase().includes('swaminathan') ||
          identifier.trim().toLowerCase().includes('fac')) &&
        (password === DEMO_USERS.STAFF.password || password === 'staff2026' || password.length >= 4)
      ) {
        const session: AuthSession = {
          id: 'session-staff-coord',
          role: 'STAFF_COORDINATOR',
          name: DEMO_USERS.STAFF.name,
          identifier: identifier.trim(),
          department: department,
          designationOrBatch: DEMO_USERS.STAFF.designationOrBatch,
          loginTime: new Date().toISOString(),
          avatarUrl: DEMO_USERS.STAFF.avatarUrl,
        };
        authService.setStaffSession(session);
        setIsLoading(false);
        onSuccess(session);
      } else {
        setIsLoading(false);
        setError('Invalid staff credentials. Click "Auto-Fill Demo" to use verified demo coordinator credentials.');
      }
    }, 400);
  };

  const handleDemoFill = () => {
    setIdentifier(DEMO_USERS.STAFF.identifier);
    setPassword(DEMO_USERS.STAFF.password);
    setDepartment(DEMO_USERS.STAFF.department);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xl">
        {/* Top Gradient Banner */}
        <div className="h-32 bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-700 p-6 flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <FileText className="w-32 h-32 text-white" />
          </div>

          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-indigo-100 backdrop-blur-md border border-white/20">
              <UserCheck className="w-3 h-3 text-indigo-300" />
              Faculty &amp; Coordinator Portal
            </span>
            <span className="text-[10px] font-bold text-indigo-200/80 bg-indigo-950/60 px-2 py-0.5 rounded">
              Staff Studio
            </span>
          </div>

          <div className="z-10">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Staff Login Panel
            </h2>
            <p className="text-xs text-indigo-200/80">
              Event Scheduling, Signed Circulars &amp; Feedback Management
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
                Staff Email or Faculty ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. dr.swaminathan@institution.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                  >
                    <option value="CSE">CSE Dept</option>
                    <option value="IT">IT Dept</option>
                    <option value="ECE">ECE Dept</option>
                    <option value="EEE">EEE Dept</option>
                    <option value="MECH">MECH Dept</option>
                    <option value="CIVIL">CIVIL Dept</option>
                    <option value="MBA">MBA Dept</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-slate-800 hover:from-indigo-600 hover:to-slate-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging In...
                </span>
              ) : (
                <>
                  <span>Sign In to Staff Studio</span>
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
                Demo Staff Account
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
              <p>Email: <strong className="text-slate-900 dark:text-white">dr.swaminathan@institution.edu</strong></p>
              <p>Password: <strong className="text-slate-900 dark:text-white">staff</strong></p>
              <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                Profile: Dr. Priya Swaminathan, Associate Professor (CSE)
              </p>
            </div>
          </div>

          {/* Switch to Other Panels */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Other portals:</span>
            <div className="flex items-center gap-3">
              {onSwitchToHead && (
                <button
                  type="button"
                  onClick={onSwitchToHead}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Head Admin
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
