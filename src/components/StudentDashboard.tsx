import React, { useState } from 'react';
import {
  GraduationCap,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { CampusEvent, EventFeedback } from '../types';
import { AuthSession, authService } from '../services/auth';
import { db } from '../services/db';

interface StudentDashboardProps {
  session: AuthSession;
  events: CampusEvent[];
  onOpenFeedback: (eventId: number, rollNo: string) => void;
  onViewEvent: (eventId: number) => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  session,
  events,
  onOpenFeedback,
  onViewEvent,
  onLogout,
}) => {
  const [activeSubView, setActiveSubView] = useState<'surveys' | 'history'>('surveys');

  // Find feedback submitted by this student roll number
  const studentRollNo = session.identifier.toUpperCase();
  const allEvents = events;

  // Filter events that have active feedback
  const feedbackEvents = allEvents.filter((e) => e.feedback_open);

  // Check eligibility for each active event
  const eligibleActiveEvents = feedbackEvents.map((ev) => {
    const isEligible = ev.eligibility_prefixes.some((prefix) =>
      studentRollNo.startsWith(prefix.toUpperCase())
    );
    const existingFeedbacks: EventFeedback[] = db.getFeedbackByEvent(ev.id);
    const hasSubmitted = existingFeedbacks.some(
      (f: EventFeedback) => f.register_no.toUpperCase() === studentRollNo
    );

    return {
      event: ev,
      isEligible,
      hasSubmitted,
      existingFeedback: existingFeedbacks.find(
        (f: EventFeedback) => f.register_no.toUpperCase() === studentRollNo
      ),
    };
  });

  // Collect all historical feedback submissions for this student across all events
  const mySubmissions: { event: CampusEvent; feedback: EventFeedback }[] = [];
  allEvents.forEach((ev) => {
    const feedbacks: EventFeedback[] = db.getFeedbackByEvent(ev.id);
    const fb = feedbacks.find((f: EventFeedback) => f.register_no.toUpperCase() === studentRollNo);
    if (fb) {
      mySubmissions.push({ event: ev, feedback: fb });
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Student Identity Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  session.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt={session.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  VERIFIED ENROLLED STUDENT
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 text-emerald-300 font-bold border border-white/10">
                  {session.identifier}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {session.name}
              </h2>
              <p className="text-xs text-emerald-200/90 flex items-center gap-2 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Department of {session.department}</span>
                <span>•</span>
                <span>{session.designationOrBatch}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-emerald-200/70">Authenticated Session</p>
              <p className="text-xs font-mono font-bold text-emerald-300">
                {new Date(session.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-200 border border-white/15 hover:border-rose-400/40 text-xs font-semibold transition flex items-center gap-2"
              title="Sign out of student account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-emerald-200/70 block text-[11px]">Roll Number</span>
            <span className="font-bold font-mono text-white text-sm">{session.identifier}</span>
          </div>
          <div>
            <span className="text-emerald-200/70 block text-[11px]">Enrolled Dept</span>
            <span className="font-bold text-white text-sm">{session.department}</span>
          </div>
          <div>
            <span className="text-emerald-200/70 block text-[11px]">Active Surveys Eligible</span>
            <span className="font-bold text-emerald-300 text-sm">
              {eligibleActiveEvents.filter((item) => item.isEligible && !item.hasSubmitted).length} Pending
            </span>
          </div>
          <div>
            <span className="text-emerald-200/70 block text-[11px]">Submitted Evaluations</span>
            <span className="font-bold text-white text-sm">
              {mySubmissions.length} Verified
            </span>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('surveys')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeSubView === 'surveys'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Active Feedback Surveys ({eligibleActiveEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeSubView === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>My Submission History ({mySubmissions.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Institutional Double-Submission Prevention Guard</span>
        </div>
      </div>

      {/* SUB-VIEW 1: ACTIVE FEEDBACK SURVEYS */}
      {activeSubView === 'surveys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Campus Events with Live Feedback Windows
            </h3>
            <span className="text-xs text-slate-500">
              Matching your roll prefix: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{session.identifier.slice(0, 4)}</strong>
            </span>
          </div>

          {eligibleActiveEvents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No active feedback surveys right now
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Faculty coordinators open evaluation windows when academic sessions conclude. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleActiveEvents.map(({ event, isEligible, hasSubmitted }) => (
                <div
                  key={event.id}
                  className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    hasSubmitted
                      ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                      : isEligible
                      ? 'bg-white/90 dark:bg-slate-900/90 border-emerald-500/40 shadow-sm hover:shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {event.department_id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{event.event_type}</span>

                      {hasSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Evaluation Completed &amp; Verified
                        </span>
                      ) : isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Eligible to Evaluate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          <AlertCircle className="w-3 h-3" />
                          Not Open for Your Batch Prefix
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => onViewEvent(event.id)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
                    >
                      {event.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {event.date_start}
                      </span>
                      <span>•</span>
                      <span>
                        Eligible Batches: <strong className="font-mono">{event.eligibility_prefixes.join(', ')}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch md:self-auto">
                    <button
                      onClick={() => onViewEvent(event.id)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {hasSubmitted ? (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Submitted</span>
                      </button>
                    ) : isEligible ? (
                      <button
                        onClick={() => onOpenFeedback(event.id, studentRollNo)}
                        className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Enter Evaluation</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
                        title="Your batch prefix is not included in this event's target audience"
                      >
                        Ineligible
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: SUBMISSION HISTORY */}
      {activeSubView === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Feedback Submissions by {session.identifier}
            </h3>
            <span className="text-xs text-slate-500">
              Total Records: {mySubmissions.length}
            </span>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No feedback submitted yet
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                When you evaluate an event above, your verified participation record will be indexed here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map(({ event, feedback }) => (
                <div
                  key={feedback.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {event.department_id}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {event.name}
                      </h4>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-500 block">Submitted On</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {new Date(feedback.submitted_at).toLocaleDateString()} at{' '}
                        {new Date(feedback.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">Satisfaction</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ★ {feedback.satisfaction_score} / 5
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">Content Quality</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        ★ {feedback.content_quality_score} / 5
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">Speaker Score</span>
                      <span className="font-bold text-violet-600 dark:text-violet-400">
                        ★ {feedback.speaker_effectiveness_score} / 5
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">Knowledge Gain</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        ★ {feedback.knowledge_gain_score} / 5
                      </span>
                    </div>
                  </div>

                  {feedback.suggestions && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Your Feedback Comment: </span>
                      &ldquo;{feedback.suggestions}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
