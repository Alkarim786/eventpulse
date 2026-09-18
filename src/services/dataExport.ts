import * as XLSX from 'xlsx';
import { CampusEvent, EventFeedback, EventMetrics, EventSpeaker } from '../types';
import { calculateEventKPIScore } from './kpiScoring';

/**
 * Generates formatted Excel (.xlsx) and CSV spreadsheets for event feedback and metrics
 * strictly conforming to Section 4 Coordinator Control Center requirements
 */
export function exportFeedbackToExcel(
  event: CampusEvent,
  feedbackList: EventFeedback[],
  speakers: EventSpeaker[],
  metrics: EventMetrics
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Event Summary & Metadata
  const summaryData = [
    ['INSTITUTIONAL EVENT & KPI REPORT', ''],
    ['Event Name', event.name],
    ['Event ID', event.id],
    ['Category / Type', event.event_type],
    ['Organizing Department', event.department_id],
    ['Co-Organizing Departments', (event.co_departments || []).join(', ') || 'None'],
    ['Date Range', `${event.date_start} to ${event.date_end}`],
    ['Delivery Mode', event.venue_mode],
    ['Venue / Virtual Link', event.venue_details],
    ['Coordinator Name', event.coordinator_name],
    ['Coordinator Designation', event.coordinator_designation],
    ['Coordinator Contact', `${event.coordinator_email} | ${event.coordinator_phone}`],
    ['Target Total Attendance', metrics.target_participants],
    ['Achieved Total Attendance', metrics.achieved_participants],
    ['Target Internal Students', metrics.target_internal],
    ['Achieved Internal Students', metrics.achieved_internal],
    ['Total Feedback Surveys Recorded', feedbackList.length],
    ['Allocated Budget (INR)', metrics.budget_allocated],
    ['Actual Expenditure (INR)', metrics.budget_spent],
    ['Sponsorship Funds (INR)', metrics.sponsorship_funds],
    ['Final Institutional KPI Score', `${metrics.final_kpi_score} / 100`],
    ['Awarded Institutional Grade', metrics.final_grade],
    ['Digital Signature Stamp', event.digital_signature || 'PENDING VERIFICATION'],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Event Overview');

  // Sheet 2: Raw Student Submissions
  const headers = [
    'Submission ID',
    'Register Number',
    'Student Batch/Branch Prefix',
    'Objective Clarity Met',
    'Satisfaction (1-5)',
    'Content & Tech Depth (1-5)',
    'Speaker Effectiveness (1-5)',
    'Organization Quality (1-5)',
    'Knowledge Gain (1-5)',
    'Acquired Skills & Real-World Tools',
    'Constructive Suggestions',
    'Submission Timestamp',
  ];

  const submissionRows = feedbackList.map((f) => [
    f.id,
    f.register_no,
    f.register_no.substring(0, 4),
    f.objective_clarity_met ? 'YES' : 'NO',
    f.satisfaction_score,
    f.content_quality_score,
    f.speaker_effectiveness_score,
    f.organization_quality_score,
    f.knowledge_gain_score,
    f.acquired_skills || 'N/A',
    f.suggestions || 'None provided',
    new Date(f.submitted_at).toLocaleString(),
  ]);

  const wsFeedback = XLSX.utils.aoa_to_sheet([headers, ...submissionRows]);
  XLSX.utils.book_append_sheet(wb, wsFeedback, 'Student Feedback Ledger');

  // Sheet 3: Resource Persons
  const speakerHeaders = [
    'Speaker ID',
    'Full Name',
    'Designation',
    'Parent Organization / University',
    'Industry Expert Flag',
    'Email Address',
    'Contact Phone',
    'Summary Profile',
  ];
  const speakerRows = speakers.map((s) => [
    s.id,
    s.name,
    s.designation,
    s.organization,
    s.is_industry_expert ? 'YES' : 'NO',
    s.contact_email,
    s.contact_mobile,
    s.profile_summary,
  ]);
  const wsSpeakers = XLSX.utils.aoa_to_sheet([speakerHeaders, ...speakerRows]);
  XLSX.utils.book_append_sheet(wb, wsSpeakers, 'Resource Persons');

  // Save to file
  const fileName = `Event_${event.id}_${event.department_id}_Feedback_and_KPI_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportFeedbackToCSV(event: CampusEvent, feedbackList: EventFeedback[]) {
  const headers = [
    'Submission ID',
    'Register Number',
    'Objective Met',
    'Satisfaction',
    'Content Quality',
    'Speaker Rating',
    'Organization',
    'Knowledge Gain',
    'Acquired Skills',
    'Suggestions',
    'Timestamp',
  ];

  const rows = feedbackList.map((f) => [
    f.id,
    f.register_no,
    f.objective_clarity_met ? 'YES' : 'NO',
    f.satisfaction_score,
    f.content_quality_score,
    f.speaker_effectiveness_score,
    f.organization_quality_score,
    f.knowledge_gain_score,
    `"${(f.acquired_skills || '').replace(/"/g, '""')}"`,
    `"${(f.suggestions || '').replace(/"/g, '""')}"`,
    f.submitted_at,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Event_${event.id}_Feedback_Submissions.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportStructuredJSON(
  event: CampusEvent,
  metrics: EventMetrics,
  speakers: EventSpeaker[],
  feedbackList: EventFeedback[]
) {
  const calc = calculateEventKPIScore(event, metrics, feedbackList);
  const payload = {
    institution: 'Autonomous Engineering & Technology Institute',
    academic_year: '2025-2026',
    generated_at: new Date().toISOString(),
    event,
    speakers,
    metrics,
    kpi_evaluation: calc,
    total_feedback_records: feedbackList.length,
    raw_feedback_sample: feedbackList,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Event_${event.id}_Institutional_Audit_Backup.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
