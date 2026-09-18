import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import { AuthSession, DEMO_USERS, authService } from '../services/auth';

interface StudentLoginPanelProps {
  onSuccess: (session: AuthSession) => void;
  onSwitchToStaff?: () => void;
  onSwitchToHead?: () => void;
}

export const StudentLoginPanel: React.FC<StudentLoginPanelProps> = ({
  onSuccess,
  onSwitchToStaff,
  onSwitchToHead,
}) => {
  const defaultStudent = DEMO_USERS.STUDENTS[0];
  const [rollNo, setRollNo] = useState(defaultStudent.rollNo);
  const [pin, setPin] = useState(defaultStudent.pin);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derive department and batch info from prefix
  const detectedPrefix = rollNo.trim().toUpperCase().slice(0, 4);
  const getDepartmentName = (prefix: string) => {
    if (prefix.includes('CS')) return 'Computer Science & Engineering';
    if (prefix.includes('IT')) return 'Information Technology';
    if (prefix.includes('EC')) return 'Electronics & Communication';
    if (prefix.includes('EE')) return 'Electrical & Electronics';
    if (prefix.includes('ME')) return 'Mechanical Engineering';
    if (prefix.includes('CV') || prefix.includes('CE')) return 'Civil Engineering';
    return 'Engineering Student Batch';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanRoll = rollNo.trim().toUpperCase();
      if (cleanRoll.length < 4) {
        setIsLoading(false);
        setError('Please enter a valid institutional roll number (e.g. 24CS101, 23IT042).');
        return;
      }

      // Check if matches known demo student or construct valid student session
      const matched = DEMO_USERS.STUDENTS.find((s) => s.rollNo.toUpperCase() === cleanRoll);
      const studentName = matched ? matched.name : `Student (${cleanRoll})`;
      const studentDept = matched
        ? matched.department
        : cleanRoll.includes('CS')
        ? 'CSE'
        : cleanRoll.includes('IT')
        ? 'IT'
        : cleanRoll.includes('EC')
        ? 'ECE'
        : cleanRoll.includes('EE')
        ? 'EEE'
        : 'ENGG';
      const studentBatch = matched ? matched.batch : `Batch 20${cleanRoll.slice(0, 2)}`;

      const session: AuthSession = {
        id: `session-student-${cleanRoll}`,
        role: 'STUDENT',
        name: studentName,
        identifier: cleanRoll,
        department: studentDept,
        designationOrBatch: `${cleanRoll} • ${studentBatch}`,
        loginTime: new Date().toISOString(),
        avatarUrl: matched?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      };

      authService.setStudentSession(session);
      setIsLoading(false);
      onSuccess(session);
    }, 400);
  };

  const handleSelectPreset = (preset: typeof DEMO_USERS.STUDENTS[0]) => {
    setRollNo(preset.rollNo);
    setPin(preset.pin);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xl">
        {/* Top Gradient Banner */}
        <div className="h-32 bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 p-6 flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <GraduationCap className="w-32 h-32 text-white" />
          </div>

          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-emerald-100 backdrop-blur-md border border-white/20">
              <BadgeCheck className="w-3 h-3 text-emerald-300" />
              Student Academic Gateway
            </span>
            <span className="text-[10px] font-bold text-emerald-200/80 bg-emerald-950/60 px-2 py-0.5 rounded">
              Verified Evaluations
            </span>
          </div>

          <div className="z-10">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Student Login Portal
            </h2>
            <p className="text-xs text-emerald-200/80">
              Access Gated Event Feedback, Evaluations &amp; Participation Records
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Institutional Roll / Reg No.
                </label>
                {rollNo.length >= 2 && (
                  <span className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    Prefix: {rollNo.slice(0, 4).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="e.g. 24CS101, 23IT042"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
              </div>
              {rollNo.length >= 4 && (
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{getDepartmentName(detectedPrefix)}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Student PIN / Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={6}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition tracking-widest font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 hover:from-emerald-500 hover:to-slate-800 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Ledger...
                </span>
              ) : (
                <>
                  <span>Sign In to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Preset Demo Student Accounts */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              One-Click Demo Student Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.STUDENTS.map((st) => (
                <button
                  key={st.rollNo}
                  type="button"
                  onClick={() => handleSelectPreset(st)}
                  className={`p-2 rounded-xl text-left border text-xs transition ${
                    rollNo === st.rollNo
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  <p className="font-mono font-bold text-[11px]">{st.rollNo}</p>
                  <p className="text-[10px] opacity-90 truncate">{st.name.split(' ')[0]}</p>
                </button>
              ))}
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
              {onSwitchToStaff && (
                <button
                  type="button"
                  onClick={onSwitchToStaff}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Staff Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
