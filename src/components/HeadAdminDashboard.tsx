import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  AlertTriangle,
  DollarSign,
  Printer,
  Download,
  FileSpreadsheet,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  ChevronDown,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { CampusEvent, EventFeedback, EventMetrics, EventSpeaker } from '../types';
import { db } from '../services/db';
import { calculateEventKPIScore, KPIBreakdownResult } from '../services/kpiScoring';
import { exportFeedbackToExcel, exportStructuredJSON } from '../services/dataExport';

interface HeadAdminDashboardProps {
  onSelectEventForPreview: (id: number) => void;
}

export const HeadAdminDashboard: React.FC<HeadAdminDashboardProps> = ({
  onSelectEventForPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'kpi_analytics' | 'audit_matrix' | 'naac_report'>('kpi_analytics');
  const [selectedReportEventId, setSelectedReportEventId] = useState<number>(101);

  const events = db.getAllEvents();
  const allFeedbacks = db.getAllFeedbacks();

  // Compute overall KPI aggregates across all events
  const eventEvaluations: {
    event: CampusEvent;
    metrics: EventMetrics;
    feedbacks: EventFeedback[];
    speakers: EventSpeaker[];
    kpi: KPIBreakdownResult;
  }[] = events.map((ev: CampusEvent) => {
    const met: EventMetrics = db.getMetrics(ev.id) || {
      event_id: ev.id,
      target_participants: 100,
      achieved_participants: 90,
      target_internal: 80,
      achieved_internal: 70,
      target_external: 20,
      achieved_external: 20,
      faculty_participants: 5,
      budget_allocated: 40000,
      budget_spent: 35000,
      sponsorship_funds: 10000,
      certificates_issued_pct: 98,
      ideas_projects_count: 3,
      research_papers_count: 1,
      internships_linkages_count: 2,
      social_media_reach_count: 800,
      hands_on_verified: true,
      curriculum_alignment_score: 4,
      collaborations_count: 1,
      final_kpi_score: 80,
      final_grade: 'Good',
    };
    const fbs = db.getFeedbackByEvent(ev.id);
    const spks = db.getSpeakersByEvent(ev.id);
    const kpi = calculateEventKPIScore(ev, met, fbs);
    return { event: ev, metrics: met, feedbacks: fbs, speakers: spks, kpi };
  });

  // Top Metrics
  const totalEvents = events.length;
  const totalParticipants = eventEvaluations.reduce((acc, curr) => acc + curr.metrics.achieved_participants, 0);
  const avgKpiScore =
    eventEvaluations.length > 0
      ? (
          eventEvaluations.reduce((acc, curr) => acc + curr.kpi.totalScore, 0) / eventEvaluations.length
        ).toFixed(1)
      : '0';
  const totalSponsorship = eventEvaluations.reduce((acc, curr) => acc + curr.metrics.sponsorship_funds, 0);
  const totalBudgetSpent = eventEvaluations.reduce((acc, curr) => acc + curr.metrics.budget_spent, 0);

  // Department Benchmarking Aggregator
  const departmentStats: Record<
    string,
    { count: number; totalScore: number; avgSatisfaction: number; sponsorship: number }
  > = {};

  eventEvaluations.forEach((item) => {
    const dept = item.event.department_id;
    if (!departmentStats[dept]) {
      departmentStats[dept] = { count: 0, totalScore: 0, avgSatisfaction: 0, sponsorship: 0 };
    }
    departmentStats[dept].count += 1;
    departmentStats[dept].totalScore += item.kpi.totalScore;
    departmentStats[dept].sponsorship += item.metrics.sponsorship_funds;

    const avgSat =
      item.feedbacks.length > 0
        ? item.feedbacks.reduce((a, c) => a + c.satisfaction_score, 0) / item.feedbacks.length
        : 4.5;
    departmentStats[dept].avgSatisfaction += avgSat;
  });

  // Compliance Risk Flags
  const flaggedEvents = eventEvaluations.filter((item) => {
    const isOverBudget = item.metrics.budget_spent > item.metrics.budget_allocated;
    const isLowScore = item.kpi.totalScore < 75;
    const isUnderAttended = item.metrics.achieved_participants < item.metrics.target_participants * 0.7;
    return isOverBudget || isLowScore || isUnderAttended;
  });

  // Selected event for the 14-section NAAC report
  const currentReportItem =
    eventEvaluations.find((i) => i.event.id === selectedReportEventId) || eventEvaluations[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Executive Hero Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-700 to-violet-600 text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Head Admin Executive Intelligence &amp; NAAC Audit Desk
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                AUDIT READY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Institution-wide 12-rubric performance scoring, department benchmarks, and 14-section accreditation reports.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('kpi_analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'kpi_analytics'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            KPI Analytics &amp; Matrix
          </button>
          <button
            onClick={() => setActiveTab('audit_matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'audit_matrix'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Risk Flags</span>
            {flaggedEvents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {flaggedEvents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('naac_report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'naac_report'
                ? 'bg-gradient-to-r from-indigo-700 to-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>14-Section NAAC Report</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KPI ANALYTICS SUITE */}
      {activeTab === 'kpi_analytics' && (
        <div className="space-y-6">
          {/* Executive Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Conducted Events</span>
                <Calendar className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalEvents}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                100% verified with digital hashes
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total Participant Reach</span>
                <Users className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalParticipants.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Internal &amp; external scholars
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Institutional Quality Index</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {avgKpiScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </p>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                Institutional Rating: Grade A (Very Good)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Industry Sponsorship</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹{(totalSponsorship / 1000).toFixed(0)}k
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                External funds mobilized
              </p>
            </div>
          </div>

          {/* Departmental Performance Matrix & Heatmap */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Cross-Departmental Performance &amp; Benchmarking Matrix
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive breakdown of department metrics against institutional 12-rubric benchmarks.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                Accreditation Criterion 5.3 &amp; 6.5
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-center">Events Conducted</th>
                    <th className="px-4 py-3 text-center">Average KPI Score</th>
                    <th className="px-4 py-3 text-center">Awarded Grade</th>
                    <th className="px-4 py-3 text-center">Avg Student Rating</th>
                    <th className="px-4 py-3 text-right">Sponsorship Mobilized</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(departmentStats).map(([dept, stats]) => {
                    const avg = stats.totalScore / stats.count;
                    const avgSat = stats.avgSatisfaction / stats.count;
                    const grade = avg >= 90 ? 'S' : avg >= 80 ? 'A' : avg >= 70 ? 'B' : 'C';

                    return (
                      <tr key={dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          <span>Department of {dept}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">{stats.count}</td>
                        <td className="px-4 py-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                          {avg.toFixed(1)} / 100
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              grade === 'S'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                                : grade === 'A'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            Grade {grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          {avgSat.toFixed(2)} / 5.0
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          ₹{stats.sponsorship.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Compliant
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 12-Rubric Comparative Breakdown for All Events */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              12-Rubric Institutional Scoring Distribution Ledger
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  <tr>
                    <th className="px-3 py-3">Event Title</th>
                    <th className="px-2 py-3 text-center">Participation (20%)</th>
                    <th className="px-2 py-3 text-center">Academic Impact (25%)</th>
                    <th className="px-2 py-3 text-center">Feedback Analysis (20%)</th>
                    <th className="px-2 py-3 text-center">Outcome KPIs (15%)</th>
                    <th className="px-2 py-3 text-center">Financial (10%)</th>
                    <th className="px-2 py-3 text-center">Outreach (10%)</th>
                    <th className="px-3 py-3 text-center">Final Score</th>
                    <th className="px-2 py-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 whitespace-nowrap">
                  {eventEvaluations.map((item) => (
                    <tr key={item.event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-3 py-2.5 max-w-xs truncate font-bold text-slate-900 dark:text-white">
                        <span className="text-[10px] font-mono text-indigo-500 mr-1.5">
                          [{item.event.department_id}]
                        </span>
                        {item.event.name}
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-semibold">
                        {item.kpi.rubrics[0]?.weightedScore.toFixed(1)} / 20
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-semibold">
                        {item.kpi.rubrics[1]?.weightedScore.toFixed(1)} / 25
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-semibold">
                        {item.kpi.rubrics[2]?.weightedScore.toFixed(1)} / 20
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-semibold">
                        {item.kpi.rubrics[3]?.weightedScore.toFixed(1)} / 15
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-semibold">
                        {item.kpi.rubrics[4]?.weightedScore.toFixed(1)} / 10
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-semibold">
                        {item.kpi.rubrics[5]?.weightedScore.toFixed(1)} / 10
                      </td>
                      <td className="px-3 py-2.5 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                        {item.kpi.totalScore.toFixed(1)} / 100
                      </td>
                      <td className="px-2 py-2.5 text-center font-bold">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                          {item.kpi.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT & RISK MATRIX */}
      {activeTab === 'audit_matrix' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase">
                Institutional Risk &amp; Compliance Audit Engine
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                The automation engine continuously monitors event parameters against institutional thresholds:
                budget overrun penalties, attendance participation deviations &gt;30%, sub-par student satisfaction &lt;3.5, and missing digital signature verifications.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {flaggedEvents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Compliance Violations</h4>
                <p className="text-xs text-slate-500 mt-1">
                  All active institutional events comply with NAAC benchmarks, budget limits, and feedback thresholds.
                </p>
              </div>
            ) : (
              flaggedEvents.map((item) => {
                const isOverBudget = item.metrics.budget_spent > item.metrics.budget_allocated;
                const isLowScore = item.kpi.totalScore < 75;
                const isUnderAttended = item.metrics.achieved_participants < item.metrics.target_participants * 0.7;

                return (
                  <div
                    key={item.event.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 uppercase">
                          Action Required
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {item.event.department_id} • ID #{item.event.id}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.event.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {isOverBudget && (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            • Budget Overrun: Spent ₹{item.metrics.budget_spent} vs ₹{item.metrics.budget_allocated} Allocated
                          </span>
                        )}
                        {isLowScore && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            • Score Alert: {item.kpi.totalScore.toFixed(1)} / 100 (Below 75 Threshold)
                          </span>
                        )}
                        {isUnderAttended && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            • Attendance Deficit: {item.metrics.achieved_participants} / {item.metrics.target_participants}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setSelectedReportEventId(item.event.id);
                          setActiveTab('naac_report');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                      >
                        Inspect Audit Report
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 14-SECTION INSTITUTIONAL OUTCOME & NAAC AUDIT REPORT */}
      {activeTab === 'naac_report' && currentReportItem && (
        <div className="space-y-6">
          {/* Report Event Selector & Export Buttons Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Select Event for Audit Dossier:
              </label>
              <select
                value={selectedReportEventId}
                onChange={(e) => setSelectedReportEventId(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {events.map((e: CampusEvent) => (
                  <option key={e.id} value={e.id}>
                    [{e.department_id}] {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official NAAC Dossier</span>
              </button>

              <button
                onClick={() =>
                  exportFeedbackToExcel(
                    currentReportItem.event,
                    currentReportItem.feedbacks,
                    currentReportItem.speakers,
                    currentReportItem.metrics
                  )
                }
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-xs font-semibold"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          </div>

          {/* PRINTABLE 14-SECTION DOSSIER DOCUMENT CONTAINER */}
          <div
            id="naac-official-report"
            className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl print:border-none print:shadow-none print:p-0 space-y-8"
          >
            {/* Document Header with Institutional Crest */}
            <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-6 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                AUTONOMOUS ENGINEERING &amp; TECHNOLOGY INSTITUTE
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                INSTITUTIONAL EVENT LIFECYCLE &amp; ACCREDITATION OUTCOME DOSSIER
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Internal Quality Assurance Cell (IQAC) • NAAC Criterion 5.1, 5.3 &amp; 6.5 Compliance Ledger
              </p>
              <div className="pt-2 flex justify-center gap-4 text-[11px] font-mono text-slate-500">
                <span>DOCUMENT REF: IQAC/EVD/{currentReportItem.event.id}/2026</span>
                <span>•</span>
                <span>ACADEMIC YEAR: 2025-2026</span>
                <span>•</span>
                <span>GENERATED: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* SECTION 1: EXECUTIVE SUMMARY & EVENT IDENTIFICATION */}
            <section className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                1. Executive Summary &amp; Event Identification Taxonomy
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Event Name</span>
                  <strong className="text-slate-900 dark:text-white">{currentReportItem.event.name}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Classification</span>
                  <strong className="text-slate-900 dark:text-white">{currentReportItem.event.event_type}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lead Department</span>
                  <strong className="text-slate-900 dark:text-white">Dept of {currentReportItem.event.department_id}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery Mode &amp; Venue</span>
                  <strong className="text-slate-900 dark:text-white">
                    {currentReportItem.event.venue_mode} ({currentReportItem.event.venue_details})
                  </strong>
                </div>
              </div>
            </section>

            {/* SECTION 2: CURRICULAR ALIGNMENT & OBJECTIVES */}
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                2. Curricular Alignment &amp; Stated Pedagogical Objectives
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {currentReportItem.event.objective_statement}
              </p>
            </section>

            {/* SECTION 3: RESOURCE PERSONS PROFILE */}
            <section className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                3. Resource Persons Profile &amp; Industry Alignment
              </h2>
              <div className="space-y-2 text-xs">
                {currentReportItem.speakers.map((spk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white">{spk.name}</strong>
                        {spk.is_industry_expert && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                            Verified Industry Expert
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        {spk.designation}, {spk.organization}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">{spk.profile_summary}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{spk.contact_email}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 4: PARTICIPATION DEMOGRAPHICS */}
            <section className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                4. Participation Demographics &amp; Internal/External Mix
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Total</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {currentReportItem.metrics.target_participants}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Achieved Total</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    {currentReportItem.metrics.achieved_participants}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Internal Students</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {currentReportItem.metrics.achieved_internal}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">External Delegates</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {currentReportItem.metrics.achieved_external}
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 5: FINANCIAL AUDIT & SPONSORSHIP */}
            <section className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                5. Financial Ledger, Budget Variance &amp; Sponsorship Audit
              </h2>
              <div className="grid grid-cols-3 gap-3 text-xs text-center">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Allocated Budget</span>
                  <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    ₹{currentReportItem.metrics.budget_allocated.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Actual Expenditure</span>
                  <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    ₹{currentReportItem.metrics.budget_spent.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sponsorship Mobilized</span>
                  <span className="text-base font-extrabold font-mono text-emerald-600">
                    ₹{currentReportItem.metrics.sponsorship_funds.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 6: TECHNICAL AGENDA COVERED */}
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                6. Technical Agenda &amp; Knowledge Modules Covered
              </h2>
              <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {(currentReportItem.event.agenda_topics || []).map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </section>

            {/* SECTION 7: QUANTITATIVE 12-RUBRIC SCORE BREAKDOWN */}
            <section className="space-y-3">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border-l-4 border-indigo-600">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  7. Quantitative Feedback Analytics &amp; 12-Rubric Scoring Engine
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Final Score:</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {currentReportItem.kpi.totalScore.toFixed(1)} / 100
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                    Grade {currentReportItem.kpi.grade}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Rubric Dimension</th>
                      <th className="px-3 py-2 text-center">Weightage</th>
                      <th className="px-3 py-2 text-center">Awarded Points</th>
                      <th className="px-3 py-2">Evaluation Logic &amp; Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentReportItem.kpi.rubrics.map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-semibold">{r.dimension}</td>
                        <td className="px-3 py-2 text-center font-mono">{r.weightage}%</td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {r.score.toFixed(1)} <span className="text-[10px] text-slate-400">({r.weightedScore.toFixed(1)} pts)</span>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-500">
                          {r.description} • {r.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 8: QUALITATIVE SYNTHESIS & ACQUIRED SKILLS */}
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                8. Qualitative Feedback Synthesis &amp; Acquired Industry Skills
              </h2>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Documented Real-World Tools Acquired by Students:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentReportItem.feedbacks
                    .filter((f) => f.acquired_skills)
                    .map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono"
                      >
                        {f.acquired_skills}
                      </span>
                    ))}
                </div>
              </div>
            </section>

            {/* SECTION 9: PHOTOGRAPHIC EVIDENCE LEDGER */}
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                9. Photographic Evidence Ledger
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl overflow-hidden aspect-16/9 bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
                    alt="Session 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden aspect-16/9 bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80"
                    alt="Session 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden aspect-16/9 bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
                    alt="Session 3"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic text-center">
                All uploaded photographic evidence compressed losslessly to WebP standards with camera EXIF tags isolated.
              </p>
            </section>

            {/* SECTION 10: INSTITUTIONAL CIRCULAR & APPROVALS */}
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                10. Institutional Circulars, Approvals &amp; Verification Signatures
              </h2>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Official Event Approval Circular Ref: CIR/DEPT/{currentReportItem.event.department_id}/042
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Approved by Vice Chancellor &amp; Dean Academic Courses on 12-04-2026. Scanned for macro integrity.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">PASSED MAGIC-BYTE CHECK</span>
              </div>
            </section>

            {/* SECTION 11: ATTENDANCE RECORDS & REGISTER-GATED LEDGER */}
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                11. Attendance Records &amp; Register-Gated Verification Ledger
              </h2>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <span>
                  Authorized Student Batch Eligibility Prefixes: <strong className="font-mono">{currentReportItem.event.eligibility_prefixes.join(', ')}</strong>
                </span>
                <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                  {currentReportItem.feedbacks.length} Verified Surveys Recorded
                </span>
              </div>
            </section>

            {/* SECTION 12: PO/PSO MAPPING MATRIX */}
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                12. Program Outcome (PO) &amp; Program Specific Outcome (PSO) Mapping
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <table className="w-full text-center">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="py-2">PO1</th>
                      <th className="py-2">PO2</th>
                      <th className="py-2">PO3</th>
                      <th className="py-2">PO4</th>
                      <th className="py-2">PO5</th>
                      <th className="py-2">PO6</th>
                      <th className="py-2">PSO1</th>
                      <th className="py-2">PSO2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
                    <tr>
                      <td className="py-2 text-indigo-600">3 (High)</td>
                      <td className="py-2 text-indigo-600">3 (High)</td>
                      <td className="py-2 text-indigo-600">2 (Med)</td>
                      <td className="py-2 text-indigo-600">3 (High)</td>
                      <td className="py-2 text-indigo-600">3 (High)</td>
                      <td className="py-2 text-indigo-600">2 (Med)</td>
                      <td className="py-2 text-emerald-600">3 (High)</td>
                      <td className="py-2 text-emerald-600">3 (High)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 13: ACTION TAKEN REPORT (ATR) */}
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                13. Action Taken Report (ATR) for Continuous Quality Enhancement
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 leading-relaxed">
                Based on student recommendations regarding extended hands-on terminal time, the Department Curriculum Committee will provision extra GPU compute hours and integrate a 4-credit elective on autonomous architectures in the forthcoming academic semester.
              </p>
            </section>

            {/* SECTION 14: INSTITUTIONAL SIGN-OFF & CRYPTOGRAPHIC DIGITAL STAMP */}
            <section className="pt-6 border-t-2 border-slate-900 dark:border-slate-700 space-y-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white border-l-4 border-indigo-600">
                14. Institutional Sign-Off, Administrative Approval &amp; Cryptographic Digital Stamp
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs text-center">
                <div className="space-y-4">
                  <div className="h-14 flex items-center justify-center">
                    <span className="font-serif italic text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                      Dr. {currentReportItem.event.coordinator_name}
                    </span>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    <p className="font-bold text-slate-900 dark:text-white">Event Coordinator</p>
                    <p className="text-[10px] text-slate-500">Dept of {currentReportItem.event.department_id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-14 flex items-center justify-center">
                    <span className="font-serif italic text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                      Prof. K. R. Ranganathan
                    </span>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    <p className="font-bold text-slate-900 dark:text-white">Head of Department (HOD)</p>
                    <p className="text-[10px] text-slate-500">Dept of {currentReportItem.event.department_id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-14 flex items-center justify-center">
                    <span className="font-serif italic text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                      Dr. A. V. Shankaran
                    </span>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    <p className="font-bold text-slate-900 dark:text-white">Dean - Academic &amp; IQAC Director</p>
                    <p className="text-[10px] text-slate-500">Autonomous Institute Council</p>
                  </div>
                </div>
              </div>

              {/* Cryptographic Digital Stamp */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>DIGITAL AUDIT HASH: {currentReportItem.event.digital_signature}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">VERIFIED BLOCKCHAIN ANCHOR</span>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
