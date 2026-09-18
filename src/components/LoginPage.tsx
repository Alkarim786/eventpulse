import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  FileText,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuthSession, DEMO_USERS, authService } from '../services/auth';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
  onExplorePublicEvents?: () => void;
}

export type SelectedRole = 'STUDENT' | 'STAFF_COORDINATOR' | 'HEAD_ADMIN';

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onExplorePublicEvents,
}) => {
  const [selectedRole, setSelectedRole] = useState<SelectedRole>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Form State
  const defaultStudent = DEMO_USERS.STUDENTS[0];
  const [studentRollNo, setStudentRollNo] = useState(defaultStudent.rollNo);
  const [studentPin, setStudentPin] = useState(defaultStudent.pin);

  // Staff Form State
  const defaultStaff = DEMO_USERS.STAFF;
  const [staffEmail, setStaffEmail] = useState(defaultStaff.identifier);
  const [staffDepartment, setStaffDepartment] = useState(defaultStaff.department);
  const [staffPassword, setStaffPassword] = useState(defaultStaff.password);

  // Head Admin Form State
  const defaultHead = DEMO_USERS.HEAD;
  const [headEmail, setHeadEmail] = useState(defaultHead.identifier);
  const [headPassword, setHeadPassword] = useState(defaultHead.password);

  // Derived student batch & dept info
  const cleanRoll = studentRollNo.trim().toUpperCase();
  const detectedPrefix = cleanRoll.slice(0, 4);

  const getStudentDeptName = (prefix: string) => {
    if (prefix.includes('CS')) return 'Computer Science & Engineering';
    if (prefix.includes('IT')) return 'Information Technology';
    if (prefix.includes('EC')) return 'Electronics & Communication';
    if (prefix.includes('EE')) return 'Electrical & Electronics';
    if (prefix.includes('ME')) return 'Mechanical Engineering';
    if (prefix.includes('CV') || prefix.includes('CE')) return 'Civil Engineering';
    return 'Engineering Student Batch';
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (cleanRoll.length < 4) {
        setIsSubmitting(false);
        setErrorMessage('Please enter a valid institutional roll number (e.g. 24CS101, 23IT042).');
        return;
      }

      const matched = DEMO_USERS.STUDENTS.find((s) => s.rollNo.toUpperCase() === cleanRoll);
      const studentName = matched ? matched.name : `Scholar (${cleanRoll})`;
      const dept = matched ? matched.department : (cleanRoll.includes('CS') ? 'CSE' : cleanRoll.includes('IT') ? 'IT' : 'ECE');
      const batch = matched ? matched.batch : '2024 - 2028';
      const avatar = matched?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80';

      const session: AuthSession = {
        id: `sess_std_${Date.now()}`,
        role: 'STUDENT',
        name: studentName,
        identifier: cleanRoll,
        department: dept,
        designationOrBatch: `Batch ${batch}`,
        loginTime: new Date().toLocaleTimeString(),
        avatarUrl: avatar,
      };

      authService.setActiveSession(session);
      setIsSubmitting(false);
      onLoginSuccess(session);
    }, 250);
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (!staffEmail.includes('@')) {
        setIsSubmitting(false);
        setErrorMessage('Please enter a valid faculty institutional email address.');
        return;
      }

      const isDemo = staffEmail.toLowerCase() === DEMO_USERS.STAFF.identifier.toLowerCase();
      const staffName = isDemo ? DEMO_USERS.STAFF.name : `Prof. ${staffEmail.split('@')[0].replace('.', ' ').toUpperCase()}`;
      const designation = isDemo ? DEMO_USERS.STAFF.designationOrBatch : 'Assistant Professor & Event Coordinator';
      const avatar = isDemo ? DEMO_USERS.STAFF.avatarUrl : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';

      const session: AuthSession = {
        id: `sess_stf_${Date.now()}`,
        role: 'STAFF_COORDINATOR',
        name: staffName,
        identifier: staffEmail,
        department: staffDepartment,
        designationOrBatch: designation,
        loginTime: new Date().toLocaleTimeString(),
        avatarUrl: avatar,
      };

      authService.setActiveSession(session);
      setIsSubmitting(false);
      onLoginSuccess(session);
    }, 250);
  };

  const handleHeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (!headEmail.includes('@')) {
        setIsSubmitting(false);
        setErrorMessage('Please enter an executive administrative email address.');
        return;
      }

      const isDemo = headEmail.toLowerCase() === DEMO_USERS.HEAD.identifier.toLowerCase();
      const headName = isDemo ? DEMO_USERS.HEAD.name : 'Executive Administrative Director';
      const designation = isDemo ? DEMO_USERS.HEAD.designationOrBatch : 'Director of IQAC & Principal';
      const avatar = isDemo ? DEMO_USERS.HEAD.avatarUrl : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';

      const session: AuthSession = {
        id: `sess_head_${Date.now()}`,
        role: 'HEAD_ADMIN',
        name: headName,
        identifier: headEmail,
        department: 'IQAC / Directorate',
        designationOrBatch: designation,
        loginTime: new Date().toLocaleTimeString(),
        avatarUrl: avatar,
      };

      authService.setActiveSession(session);
      setIsSubmitting(false);
      onLoginSuccess(session);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Institutional Crest & Brand Title */}
      <div className="w-full max-w-4xl text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25 mb-4 ring-4 ring-indigo-500/20">
          <GraduationCap className="w-9 h-9" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Campus Event &amp; KPI Hub
          </h1>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-800">
            NAAC / NIRF COMPLIANT
          </span>
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
          Institutional Event Lifecycle, Prefix-Gated Academic Rubrics &amp; NAAC Quality Assurance System
        </p>
      </div>

      {/* Main Authentication Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Step 1: Select Your Role Header */}
        <div className="p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Step 1 of 2
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Select Your Institutional Role
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Each role directs to a personalized, secure landing portal
            </span>
          </div>

          {/* 3 Prominent Role Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Role 1: Student */}
            <button
              type="button"
              id="select-role-student"
              onClick={() => {
                setSelectedRole('STUDENT');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-2xl text-left transition-all relative flex flex-col justify-between border-2 ${
                selectedRole === 'STUDENT'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`p-2.5 rounded-xl ${
                    selectedRole === 'STUDENT'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </span>
                {selectedRole === 'STUDENT' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                  Student Scholar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Batch-gated evaluations, certificates, rubrics &amp; participation history.
                </p>
              </div>
            </button>

            {/* Role 2: Staff Coordinator */}
            <button
              type="button"
              id="select-role-staff"
              onClick={() => {
                setSelectedRole('STAFF_COORDINATOR');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-2xl text-left transition-all relative flex flex-col justify-between border-2 ${
                selectedRole === 'STAFF_COORDINATOR'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`p-2.5 rounded-xl ${
                    selectedRole === 'STAFF_COORDINATOR'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </span>
                {selectedRole === 'STAFF_COORDINATOR' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                  Staff Coordinator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Event creation wizard, signed circular PDF, speaker CVs &amp; feedback triggers.
                </p>
              </div>
            </button>

            {/* Role 3: Head Admin */}
            <button
              type="button"
              id="select-role-head"
              onClick={() => {
                setSelectedRole('HEAD_ADMIN');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-2xl text-left transition-all relative flex flex-col justify-between border-2 ${
                selectedRole === 'HEAD_ADMIN'
                  ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/30 shadow-md ring-2 ring-violet-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`p-2.5 rounded-xl ${
                    selectedRole === 'HEAD_ADMIN'
                      ? 'bg-gradient-to-tr from-indigo-700 to-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </span>
                {selectedRole === 'HEAD_ADMIN' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/80 text-violet-700 dark:text-violet-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                  Head Admin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Executive IQAC dashboard, NAAC 12-rubrics, NIRF analytics &amp; dept rankings.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Role-Specific Authentication Panel */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <strong className="font-bold">Authentication Notice: </strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* 1. STUDENT LOGIN FORM */}
          {selectedRole === 'STUDENT' && (
            <form onSubmit={handleStudentSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Student Scholar Authentication
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Batch &amp; Prefix Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Roll Number Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Institutional Register / Roll No
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="input-student-roll"
                      value={studentRollNo}
                      onChange={(e) => setStudentRollNo(e.target.value.toUpperCase())}
                      placeholder="e.g. 24CS101, 23IT042"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-sm uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  {cleanRoll.length >= 4 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Detected: {getStudentDeptName(detectedPrefix)} (Prefix: {detectedPrefix})
                    </p>
                  )}
                </div>

                {/* PIN / Passcode Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Passcode / PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="input-student-pin"
                      value={studentPin}
                      onChange={(e) => setStudentPin(e.target.value)}
                      placeholder="Enter 4-digit PIN (default 1234)"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Default student demo PIN is <strong className="font-mono">1234</strong>
                  </p>
                </div>
              </div>

              {/* Quick Preset Demo Accounts */}
              <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-2">
                  1-Click Quick Demo Student Profiles:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_USERS.STUDENTS.map((demo) => (
                    <button
                      key={demo.rollNo}
                      type="button"
                      onClick={() => {
                        setStudentRollNo(demo.rollNo);
                        setStudentPin(demo.pin);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                        cleanRoll === demo.rollNo
                          ? 'border-emerald-500 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-emerald-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <img
                        src={demo.avatarUrl}
                        alt={demo.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold truncate">{demo.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {demo.rollNo} • {demo.department}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-login-student"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Enter Student Portal Landing</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* 2. STAFF COORDINATOR LOGIN FORM */}
          {selectedRole === 'STAFF_COORDINATOR' && (
            <form onSubmit={handleStaffSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Faculty Staff Coordinator Sign-In
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Department Authorized
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Faculty Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Institutional Faculty Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="input-staff-email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="dr.swaminathan@institution.edu"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Department Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    id="select-staff-dept"
                    value={staffDepartment}
                    onChange={(e) => setStaffDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="IT">Information Tech (IT)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="MECH">Mechanical (MECH)</option>
                    <option value="CIVIL">Civil (CIVIL)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-staff-password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Enter coordinator password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Default staff demo password is <strong className="font-mono">staff</strong>
                </p>
              </div>

              {/* Quick Preset Demo Account */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 block mb-2">
                  1-Click Quick Demo Staff Profile:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStaffEmail(DEMO_USERS.STAFF.identifier);
                    setStaffDepartment(DEMO_USERS.STAFF.department);
                    setStaffPassword(DEMO_USERS.STAFF.password);
                  }}
                  className="w-full p-2.5 rounded-xl border border-indigo-300/60 dark:border-indigo-800 bg-white dark:bg-slate-800 text-left text-xs flex items-center gap-3 hover:border-indigo-500 transition"
                >
                  <img
                    src={DEMO_USERS.STAFF.avatarUrl}
                    alt={DEMO_USERS.STAFF.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/40"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {DEMO_USERS.STAFF.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {DEMO_USERS.STAFF.designationOrBatch} • Dept of {DEMO_USERS.STAFF.department}
                    </div>
                  </div>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-login-staff"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Enter Staff Management Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* 3. HEAD ADMIN LOGIN FORM */}
          {selectedRole === 'HEAD_ADMIN' && (
            <form onSubmit={handleHeadSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Executive IQAC Administration
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Principal &amp; Director Access
                </span>
              </div>

              <div className="space-y-4">
                {/* Executive Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Executive Institutional Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="input-head-email"
                      value={headEmail}
                      onChange={(e) => setHeadEmail(e.target.value)}
                      placeholder="head.iqac@institution.edu"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Executive Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="input-head-password"
                      value={headPassword}
                      onChange={(e) => setHeadPassword(e.target.value)}
                      placeholder="Enter executive admin password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Default head admin password is <strong className="font-mono">admin</strong>
                  </p>
                </div>
              </div>

              {/* Quick Preset Demo Account */}
              <div className="p-4 rounded-2xl bg-violet-50/40 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-900/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300 block mb-2">
                  1-Click Quick Demo Head Executive:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHeadEmail(DEMO_USERS.HEAD.identifier);
                    setHeadPassword(DEMO_USERS.HEAD.password);
                  }}
                  className="w-full p-2.5 rounded-xl border border-violet-300/60 dark:border-violet-800 bg-white dark:bg-slate-800 text-left text-xs flex items-center gap-3 hover:border-violet-500 transition"
                >
                  <img
                    src={DEMO_USERS.HEAD.avatarUrl}
                    alt={DEMO_USERS.HEAD.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-violet-500/40"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {DEMO_USERS.HEAD.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {DEMO_USERS.HEAD.designationOrBatch}
                    </div>
                  </div>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-login-head"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Enter Executive IQAC Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </div>

        {/* Footer / Public Guest Option */}
        {onExplorePublicEvents && (
          <div className="py-4 px-6 sm:px-8 bg-slate-100/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Looking for open campus announcements or circulars?</span>
            <button
              type="button"
              onClick={onExplorePublicEvents}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Browse Public Notices as Guest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Institutional Compliance Badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>NAAC Criterion 1 &amp; 2 Audited</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-indigo-500" />
          <span>NIRF Parameter Benchmarking</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Prefix-Gated Anti-Tamper Feedback</span>
        </span>
      </div>
    </div>
  );
};
