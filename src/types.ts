/**
 * Institutional Event & KPI Automation Platform - Type Definitions
 * Aligned strictly with Section 7 Relational Data Architecture
 */

export type UserRole = 'HEAD_ADMIN' | 'STAFF_COORDINATOR' | 'STUDENT';

export interface User {
  id: string; // UUID
  username: string; // reg_no or staff ID
  email: string;
  role: UserRole;
  department: string;
  created_at: string;
}

export type EventType =
  | 'FDP'
  | 'WORKSHOP'
  | 'SEMINAR'
  | 'CONFERENCE'
  | 'IV'
  | 'HACKATHON'
  | 'GUEST_LECTURE';

export type VenueMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Feedback Open';

export interface EventSpeaker {
  id: string; // UUID
  event_id: number;
  name: string;
  designation: string;
  organization: string;
  contact_mobile: string;
  contact_email: string;
  profile_summary: string;
  profile_document_url?: string;
  is_industry_expert: boolean;
  avatar_url?: string;
}

export type MediaType =
  | 'CIRCULAR'
  | 'PHOTO'
  | 'REPORT'
  | 'SPEAKER_CV'
  | 'ATTENDANCE_RECORD';

export interface EventMedia {
  id: string;
  event_id: number;
  media_type: MediaType;
  original_filename: string;
  file_url: string;
  thumbnail_url?: string;
  file_size_bytes: number;
  mime_type: string;
  uploaded_at: string;
  storage_path: string; // /storage/campus_events/{academic_year}/{dept}/{event_id}/...
  verified_magic_bytes?: boolean;
}

export interface EventMetrics {
  event_id: number;
  target_participants: number;
  achieved_participants: number;
  target_external: number;
  achieved_external: number;
  target_internal: number;
  achieved_internal: number;
  faculty_participants: number;
  budget_allocated: number; // ₹
  budget_spent: number; // ₹
  sponsorship_funds: number; // ₹
  certificates_issued_pct: number; // e.g. 98.5%
  ideas_projects_count: number;
  research_papers_count: number;
  internships_linkages_count: number;
  social_media_reach_count: number;
  hands_on_verified: boolean;
  curriculum_alignment_score: number; // 1-5
  collaborations_count: number;
  final_kpi_score: number; // 0 - 100
  final_grade: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';
}

export interface EventFeedback {
  id: string;
  event_id: number;
  register_no: string;
  satisfaction_score: number; // 1-5
  content_quality_score: number; // 1-5
  speaker_effectiveness_score: number; // 1-5
  organization_quality_score: number; // 1-5
  knowledge_gain_score: number; // 1-5
  objective_clarity_met: boolean;
  suggestions?: string;
  acquired_skills?: string;
  submitted_at: string;
}

export interface CampusEvent {
  id: number;
  name: string;
  event_type: EventType;
  department_id: string; // CSE, IT, ECE, EEE, MECH, CIVIL, MBA, S&H
  co_departments?: string[];
  date_start: string;
  date_end: string;
  time_start?: string;
  time_end?: string;
  venue_mode: VenueMode;
  venue_details: string;
  eligibility_prefixes: string[]; // e.g., ['23', '24CS', '22ME']
  feedback_open: boolean;
  created_by_coordinator_id: string;
  coordinator_name: string;
  coordinator_designation: string;
  coordinator_email: string;
  coordinator_phone: string;
  description: string;
  objective_statement: string;
  featured_banner?: boolean;
  banner_image_url?: string;
  agenda_topics: string[];
  circular_url?: string;
  digital_signature?: string; // Data URL or hash
  signature_timestamp?: string;
  audit_completed?: boolean;
  status?: 'UPCOMING' | 'COMPLETED' | 'ONGOING';
}

export interface RubricDimensionScore {
  dimension: string;
  weightage: number; // e.g. 20 for 20%
  score: number; // out of 100
  weightedScore: number; // (score * weightage) / 100
  description: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
}

export interface KPIScoreCalculation {
  totalScore: number;
  grade: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';
  needsReview: boolean;
  rubrics: RubricDimensionScore[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'circular' | 'feedback' | 'audit' | 'deadline' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
