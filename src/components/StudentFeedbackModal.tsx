import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Star,
  Send,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Lock,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CampusEvent, EventFeedback } from '../types';
import { db } from '../services/db';

interface StudentFeedbackModalProps {
  event: CampusEvent;
  initialRollNo?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentFeedbackModal: React.FC<StudentFeedbackModalProps> = ({
  event,
  initialRollNo,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [regNoInput, setRegNoInput] = useState(initialRollNo || '');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [surveyToken, setSurveyToken] = useState<string | null>(null);
  const [normalizedId, setNormalizedId] = useState('');

  // Form State
  const [objectiveClarityMet, setObjectiveClarityMet] = useState(true);
  const [satisfactionScore, setSatisfactionScore] = useState<number>(5);
  const [contentQualityScore, setContentQualityScore] = useState<number>(5);
  const [speakerEffectivenessScore, setSpeakerEffectivenessScore] = useState<number>(5);
  const [knowledgeGainScore, setKnowledgeGainScore] = useState<number>(5);
  const [organizationQualityScore, setOrganizationQualityScore] = useState<number>(5);
  const [suggestions, setSuggestions] = useState('');
  const [acquiredSkills, setAcquiredSkills] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);

  // Restore draft from sessionStorage if exists
  useEffect(() => {
    const draftKey = `feedback_draft_${event.id}`;
    const saved = sessionStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.regNo) setRegNoInput(parsed.regNo);
        if (parsed.satisfactionScore) setSatisfactionScore(parsed.satisfactionScore);
        if (parsed.contentQualityScore) setContentQualityScore(parsed.contentQualityScore);
        if (parsed.speakerEffectivenessScore) setSpeakerEffectivenessScore(parsed.speakerEffectivenessScore);
        if (parsed.knowledgeGainScore) setKnowledgeGainScore(parsed.knowledgeGainScore);
        if (parsed.organizationQualityScore) setOrganizationQualityScore(parsed.organizationQualityScore);
        if (parsed.suggestions) setSuggestions(parsed.suggestions);
        if (parsed.acquiredSkills) setAcquiredSkills(parsed.acquiredSkills);
        setDraftSavedTime('Draft restored from session');
      } catch (e) {
        // ignore
      }
    }
  }, [event.id]);

  // Autosave draft
  useEffect(() => {
    if (!regNoInput && !suggestions && !acquiredSkills) return;
    const draftKey = `feedback_draft_${event.id}`;
    const payload = {
      regNo: regNoInput,
      satisfactionScore,
      contentQualityScore,
      speakerEffectivenessScore,
      knowledgeGainScore,
      organizationQualityScore,
      suggestions,
      acquiredSkills,
      objectiveClarityMet,
    };
    sessionStorage.setItem(draftKey, JSON.stringify(payload));
    setDraftSavedTime(new Date().toLocaleTimeString());
  }, [
    regNoInput,
    satisfactionScore,
    contentQualityScore,
    speakerEffectivenessScore,
    knowledgeGainScore,
    organizationQualityScore,
    suggestions,
    acquiredSkills,
    objectiveClarityMet,
    event.id,
  ]);

  // Step 1: Identifier Verification Pipeline
  const handleVerifyRegisterNumber = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    const result = db.evaluateStudentEligibility(event.id, regNoInput);
    if (!result.eligible) {
      setVerificationError(result.errorReason || 'Eligibility validation failed.');
      return;
    }

    setNormalizedId(result.normalizedRegNo);
    setSurveyToken(result.token || '');
    setStep(2); // Proceed to survey matrix
  };

  // Step 3 Submit
  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const feedbackPayload = {
        event_id: event.id,
        register_no: normalizedId,
        satisfaction_score: satisfactionScore,
        content_quality_score: contentQualityScore,
        speaker_effectiveness_score: speakerEffectivenessScore,
        organization_quality_score: organizationQualityScore,
        knowledge_gain_score: knowledgeGainScore,
        objective_clarity_met: objectiveClarityMet,
        suggestions: suggestions.trim() || undefined,
        acquired_skills: acquiredSkills.trim() || undefined,
      };

      const res = db.submitFeedback(feedbackPayload);
      setIsSubmitting(false);

      if (!res.success) {
        setVerificationError(res.message);
        setStep(1);
        return;
      }

      // Clear draft
      sessionStorage.removeItem(`feedback_draft_${event.id}`);

      // Fire confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // fallback
      }

      onSuccess();
      onClose();
    }, 600);
  };

  const renderStarSelector = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    description?: string
  ) => {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
            {description && <p className="text-[10px] text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
            {value} / 5
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-400 focus:outline-none transition group"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= value
                    ? 'fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform'
                    : 'hover:text-amber-300'
                }`}
              />
            </button>
          ))}
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-24 ml-3 accent-indigo-600"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex items-center justify-between border-b border-indigo-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-white border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block">
                Access-Gated Student Feedback Engine
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight line-clamp-1">
                {event.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white border border-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progressive Stepper Breadcrumb */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>1</span>
              ID Gate
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>2</span>
              Evaluation Matrix
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={`flex items-center gap-1.5 ${step === 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>3</span>
              Qualitative
            </span>
          </div>

          {draftSavedTime && (
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Autosaved: {draftSavedTime}
            </span>
          )}
        </div>

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* STEP 1: STUDENT IDENTIFIER VERIFICATION */}
          {step === 1 && (
            <form onSubmit={handleVerifyRegisterNumber} className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                  Prefix-Based Dynamic Eligibility Verification
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  To preserve institutional academic data integrity and satisfy NAAC accreditation criteria, evaluations are access-gated.
                  Please enter your official institutional Register Number.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <Lock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>Authorized Batch Prefixes: <strong>{event.eligibility_prefixes.join(', ')}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institutional Register Number (Reg. No) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regNoInput}
                    onChange={(e) => {
                      setRegNoInput(e.target.value);
                      setVerificationError(null);
                    }}
                    placeholder="e.g. 23CS1045, 23IT0042, 22ME018"
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition placeholder:normal-case placeholder:font-sans"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Format pattern: 2 digit year (23) + branch (CS/IT/EC) + 3-4 roll digits.
                </p>
              </div>

              {/* Error Callout */}
              {verificationError && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div className="text-xs leading-relaxed">
                    <strong className="block font-semibold mb-0.5">Verification Restriction</strong>
                    {verificationError}
                  </div>
                </div>
              )}

              {/* Sample test register numbers for quick demo */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Quick Demo Register Numbers for this Event:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {event.eligibility_prefixes.map((pref, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setRegNoInput(`${pref}10${90 + i}`);
                        setVerificationError(null);
                      }}
                      className="text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 border border-slate-300 dark:border-slate-600 font-mono hover:bg-indigo-50"
                    >
                      {pref}10{90 + i}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setRegNoInput('21ME0001'); // Intentionally ineligible
                      setVerificationError(null);
                    }}
                    className="text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-500 border border-slate-300 dark:border-slate-600 font-mono hover:bg-slate-100"
                    title="Test ineligible ID"
                  >
                    21ME0001 (Ineligible)
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition"
                >
                  <span>Verify Eligibility &amp; Authorize</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: EVALUATION MATRIX (1-5 SCALE & SLIDERS) */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Student ID: <strong className="font-mono">{normalizedId}</strong></span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Token: Verified</span>
              </div>

              {/* Objective Clarity Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Objective Clarity: Did the event meet its stated goals?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Goal: &ldquo;{event.objective_statement.substring(0, 75)}...&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setObjectiveClarityMet(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      objectiveClarityMet
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setObjectiveClarityMet(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      !objectiveClarityMet
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>

              {/* Evaluation Matrix */}
              <div className="space-y-3">
                {renderStarSelector(
                  '1. Content Quality & Technical Depth',
                  contentQualityScore,
                  setContentQualityScore,
                  'Rigor of topics, syllabus relevance, and practical examples'
                )}

                {renderStarSelector(
                  '2. Resource Person / Speaker Effectiveness',
                  speakerEffectivenessScore,
                  setSpeakerEffectivenessScore,
                  'Clarity of presentation, domain mastery, and audience engagement'
                )}

                {renderStarSelector(
                  '3. Knowledge Gain & Practical Exposure',
                  knowledgeGainScore,
                  setKnowledgeGainScore,
                  'New concepts mastered and applicability to your major'
                )}

                {renderStarSelector(
                  '4. Organization, Infrastructure & Venue Quality',
                  organizationQualityScore,
                  setOrganizationQualityScore,
                  'Time management, lab setup, audio-visual acoustics, and coordination'
                )}

                {renderStarSelector(
                  '5. Overall Event Satisfaction',
                  satisfactionScore,
                  setSatisfactionScore,
                  'Would you recommend this workshop to junior batches?'
                )}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition"
                >
                  <span>Proceed to Suggestions</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: QUALITATIVE FEEDBACK & FINAL SUBMISSION */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Actionable Skills or Real-World Tools Acquired *
                </label>
                <input
                  type="text"
                  value={acquiredSkills}
                  onChange={(e) => setAcquiredSkills(e.target.value)}
                  placeholder="e.g., vLLM deployment, eBPF threat hunting, ROS2 SLAM, Dynamo BIM..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition"
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Highlight tangible frameworks, libraries, or methodologies practiced.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Constructive Suggestions &amp; Future Recommendations
                </label>
                <textarea
                  rows={4}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="Provide recommendations for upcoming technical workshops, lab exercises, or speakers..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition"
                />
              </div>

              {/* Integrity Pledge */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Institutional Integrity &amp; Anti-Tampering Safeguard</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  By submitting, Register Number <strong className="font-mono text-indigo-600 dark:text-indigo-400">{normalizedId}</strong> certifies
                  this evaluation is authentic. A composite primary key <code className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">({event.id}, {normalizedId})</code> will be locked in the institutional ledger preventing duplicate entries.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Ratings</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Recording in Ledger...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Verified Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
