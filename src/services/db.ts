import {
  CampusEvent,
  EventFeedback,
  EventMedia,
  EventMetrics,
  EventSpeaker,
  NotificationItem,
  User,
} from '../types';
import { calculateEventKPIScore } from './kpiScoring';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firestoreDb, handleFirestoreError, OperationType } from './firebase';

function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

const STORAGE_KEYS = {
  EVENTS: 'inst_events_v2',
  SPEAKERS: 'inst_speakers_v2',
  METRICS: 'inst_metrics_v2',
  MEDIA: 'inst_media_v2',
  FEEDBACK: 'inst_feedback_v2',
  NOTIFICATIONS: 'inst_notifications_v2',
  USERS: 'inst_users_v2',
  CURRENT_USER: 'inst_current_user_v2',
};

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    username: 'ADM-001',
    email: 'principal@institution.edu',
    role: 'HEAD_ADMIN',
    department: 'Executive Administration',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'usr-coord-1',
    username: 'STF-CSE-042',
    email: 'priya.s@institution.edu',
    role: 'STAFF_COORDINATOR',
    department: 'CSE',
    created_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'usr-student-1',
    username: '23CS1045',
    email: '23cs1045@student.institution.edu',
    role: 'STUDENT',
    department: 'CSE',
    created_at: '2025-08-10T00:00:00Z',
  },
];

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 101,
    name: 'National Symposium on Generative AI & Autonomous Agent Frameworks',
    event_type: 'CONFERENCE',
    department_id: 'CSE',
    co_departments: ['IT', 'ECE'],
    date_start: '2026-03-24',
    date_end: '2026-03-25',
    time_start: '09:30 AM',
    time_end: '04:30 PM',
    venue_mode: 'HYBRID',
    venue_details: 'Sir C.V. Raman Auditorium & Google Meet Stream',
    eligibility_prefixes: ['23', '24CS', '23IT', '22CS'],
    feedback_open: true,
    created_by_coordinator_id: 'usr-coord-1',
    coordinator_name: 'Dr. Priya Swaminathan',
    coordinator_designation: 'Associate Professor, Dept. of CSE',
    coordinator_email: 'priya.s@institution.edu',
    coordinator_phone: '+91 94441 28910',
    description: 'A 2-day flagship national symposium gathering pioneer AI researchers, industry leads from top frontier labs, and academia to dissect foundation models, agentic workflows, and ethical guardrails.',
    objective_statement: 'To foster deep foundational competencies in transformer architectures, autonomous multi-agent systems, and production LLMOps strictly aligned with Institutional Curriculum Rubric AI-402.',
    featured_banner: true,
    banner_image_url: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=1200&q=80',
    agenda_topics: [
      'State of Generative Modeling: From Attention to Reasoning Chains',
      'Hands-on Lab: Deploying Local LLMs with vLLM & Tool Calling',
      'Student Research Paper Presentation & Poster Evaluation',
      'Industry Panel: Frontier AI Deployment Challenges in 2026',
    ],
    circular_url: '/storage/campus_events/2025-26/CSE/101/circulars/Symposium_Circular_2026.pdf',
    digital_signature: 'DIGI-SIGN-CSE-2026-P018-VALID',
    signature_timestamp: '2026-03-20T11:45:00Z',
    audit_completed: true,
  },
  {
    id: 102,
    name: 'Hands-on Cyber Defense & Offensive Security Masterclass',
    event_type: 'WORKSHOP',
    department_id: 'IT',
    co_departments: ['CSE'],
    date_start: '2026-04-02',
    date_end: '2026-04-03',
    time_start: '10:00 AM',
    time_end: '05:00 PM',
    venue_mode: 'OFFLINE',
    venue_details: 'Turing Advanced Network Simulation Center (Lab 4)',
    eligibility_prefixes: ['23IT', '23CS', '22IT'],
    feedback_open: true,
    created_by_coordinator_id: 'usr-coord-1',
    coordinator_name: 'Prof. K. Venkatesh',
    coordinator_designation: 'Assistant Professor (Sr. Grade), IT',
    coordinator_email: 'venkatesh.k@institution.edu',
    coordinator_phone: '+91 98402 77192',
    description: 'An intensive hands-on lab drilling students into real-time SOC incident triage, zero-day threat analysis, kernel-level exploit defenses, and container sandbox hardening.',
    objective_statement: 'Bridge academic network theory with practical Red-Team vs Blue-Team defense mechanics, validating industry-standard MITRE ATT&CK vectors.',
    featured_banner: true,
    banner_image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    agenda_topics: [
      'Adversary Emulation & Living-off-the-Land Binaries',
      'Automated Threat Hunting with eBPF & Falco',
      'Capture The Flag (CTF) Defense Sprint',
    ],
    circular_url: '/storage/campus_events/2025-26/IT/102/circulars/CyberDefense_Circular.pdf',
    digital_signature: 'DIGI-SIGN-IT-2026-V88-VALID',
    signature_timestamp: '2026-03-28T09:15:00Z',
    audit_completed: true,
  },
  {
    id: 103,
    name: 'Electric Vehicle Powertrain Architecture & Battery Management Systems',
    event_type: 'FDP',
    department_id: 'EEE',
    co_departments: ['MECH'],
    date_start: '2026-04-12',
    date_end: '2026-04-14',
    time_start: '09:00 AM',
    time_end: '04:00 PM',
    venue_mode: 'OFFLINE',
    venue_details: 'Dr. APJ Abdul Kalam Innovation & EV Dyno Hall',
    eligibility_prefixes: ['22EE', '23EE', '22ME', '23ME'],
    feedback_open: false,
    created_by_coordinator_id: 'usr-coord-1',
    coordinator_name: 'Dr. S. Ranganathan',
    coordinator_designation: 'Professor & Head, EEE',
    coordinator_email: 'ranganathan.s@institution.edu',
    coordinator_phone: '+91 97890 33411',
    description: 'Faculty Development Program (FDP) centered on cell thermal modeling, regenerative braking electronics, CAN bus telematics, and state-of-charge Kalman filtering for next-gen EV platforms.',
    objective_statement: 'Upskill engineering educators in modern power electronics topologies and high-voltage safety standards conforming to AIS-156 mandates.',
    featured_banner: false,
    banner_image_url: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=1200&q=80',
    agenda_topics: [
      'Electrochemical Impedance Spectroscopy for Li-Ion Health',
      'SiC and GaN Inverter Topologies & Thermal Optimization',
      'Hardware-in-the-Loop (HIL) BMS Validation Testbench',
    ],
    circular_url: '/storage/campus_events/2025-26/EEE/103/circulars/EV_FDP_Brochure.pdf',
    audit_completed: false,
  },
  {
    id: 104,
    name: 'National Robotics & Autonomous Edge Hackathon 2026',
    event_type: 'HACKATHON',
    department_id: 'ECE',
    co_departments: ['CSE', 'MECH'],
    date_start: '2026-04-20',
    date_end: '2026-04-21',
    time_start: '08:30 AM',
    time_end: '06:00 PM',
    venue_mode: 'OFFLINE',
    venue_details: 'Main Indoor Sports Complex & Embedded Systems Lab',
    eligibility_prefixes: ['23', '24', '22'],
    feedback_open: true,
    created_by_coordinator_id: 'usr-coord-1',
    coordinator_name: 'Dr. Meenakshi Sundaram',
    coordinator_designation: 'Associate Professor, ECE',
    coordinator_email: 'meenakshi.s@institution.edu',
    coordinator_phone: '+91 94871 11200',
    description: 'A 36-hour non-stop prototyping hackathon challenging multi-disciplinary student squads to engineer edge-AI autonomous rovers, warehouse robotic arms, and drone delivery avionics.',
    objective_statement: 'Deliver functional embedded hardware artifacts addressing automated agricultural spraying, industrial inspection, and search-and-rescue.',
    featured_banner: true,
    banner_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    agenda_topics: [
      'Hardware Kit Distribution & Sensor Calibration',
      'Round 1: Mechanical Chassis & Motor Driver Checkpoint',
      'Round 2: Computer Vision & SLAM Navigation Stress Test',
      'Grand Pitching & Live Obstacle Arena Finale',
    ],
    circular_url: '/storage/campus_events/2025-26/ECE/104/circulars/Hackathon_Rules_2026.pdf',
    digital_signature: 'DIGI-SIGN-ECE-2026-M44-VALID',
    signature_timestamp: '2026-04-18T14:30:00Z',
    audit_completed: true,
  },
  {
    id: 105,
    name: 'Advanced Structural BIM & Sustainable Urban Infrastructure Seminar',
    event_type: 'SEMINAR',
    department_id: 'CIVIL',
    co_departments: ['MECH'],
    date_start: '2026-05-04',
    date_end: '2026-05-04',
    time_start: '10:30 AM',
    time_end: '03:30 PM',
    venue_mode: 'OFFLINE',
    venue_details: 'Civil Engineering Seminar Hall (Block 2)',
    eligibility_prefixes: ['23CV', '22CV', '24CV'],
    feedback_open: false,
    created_by_coordinator_id: 'usr-coord-1',
    coordinator_name: 'Er. Anandha Babu',
    coordinator_designation: 'Assistant Professor, Civil',
    coordinator_email: 'anandhababu@institution.edu',
    coordinator_phone: '+91 93600 55421',
    description: 'Expert lecture session detailing Building Information Modeling (BIM 4D/5D), seismic structural dampers, carbon-sequestering geopolymer concrete, and LEED Platinum compliance.',
    objective_statement: 'Expose undergraduates to digital twin structural engineering workflows used by global mega-infrastructure contractors.',
    featured_banner: false,
    banner_image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    agenda_topics: [
      'Digital Twin Modeling with Autodesk Revit & Dynamo',
      'Earthquake Resilient Design for High-Rise Structures',
      'Case Study: High-Speed Metro Rail Station BIM Integration',
    ],
    circular_url: '/storage/campus_events/2025-26/CIVIL/105/circulars/Civil_BIM_Seminar.pdf',
    audit_completed: false,
  },
  {
    id: 106,
    name: 'Executive Masterclass on Venture Capital, Seed Funding & Cap Tables',
    event_type: 'GUEST_LECTURE',
    department_id: 'MBA',
    co_departments: ['CSE', 'IT'],
    date_start: '2026-05-15',
    date_end: '2026-05-15',
    time_start: '02:00 PM',
    time_end: '05:30 PM',
    venue_mode: 'ONLINE',
    venue_details: 'Zoom Webinar VIP Room',
    eligibility_prefixes: ['24MB', '23MB', '23', '24'],
    feedback_open: true,
    created_by_coordinator_id: 'usr-coord-1',
    coordinator_name: 'Dr. Shalini Mukhopadhyay',
    coordinator_designation: 'Dean, Department of Management Studies',
    coordinator_email: 'shalini.m@institution.edu',
    coordinator_phone: '+91 98112 40099',
    description: 'A focused deep-dive into founder equity mechanics, SAFEs vs Convertible Notes, term sheet negotiation tactics, valuation multiples, and institutional venture backing.',
    objective_statement: 'Prepare student founders and management analysts for institutional fundraising rounds with real syndicate term sheets.',
    featured_banner: false,
    banner_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    agenda_topics: [
      'Understanding SAFE notes & Pre/Post-Money Math',
      'Term Sheet Pitfalls: Liquidation Preferences & Anti-Dilution',
      'Live Cap Table Simulation Exercise',
    ],
    circular_url: '/storage/campus_events/2025-26/MBA/106/circulars/Fintech_VC_Brochure.pdf',
    digital_signature: 'DIGI-SIGN-MBA-2026-S19-VALID',
    signature_timestamp: '2026-05-10T16:00:00Z',
    audit_completed: true,
  },
];

const INITIAL_SPEAKERS: EventSpeaker[] = [
  {
    id: 'spk-101',
    event_id: 101,
    name: 'Dr. Arvindh Subramaniam',
    designation: 'Principal AI Research Scientist',
    organization: 'Google DeepMind, London / Bangalore Hub',
    contact_mobile: '+91 98410 99881',
    contact_email: 'arvindh.sub@deepmind.com',
    profile_summary: 'Dr. Arvindh Subramaniam holds a Ph.D. from CMU and has published 30+ peer-reviewed papers on transformer scaling laws, self-improving agent architectures, and neuro-symbolic reasoning.',
    profile_document_url: '/storage/campus_events/2025-26/CSE/101/speaker_profiles/Dr_Arvindh_CV.pdf',
    is_industry_expert: true,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'spk-102',
    event_id: 102,
    name: 'Kavitha Ramachandran, CISSP',
    designation: 'Senior Security Architect & Threat Hunter',
    organization: 'CrowdStrike Intelligence Services',
    contact_mobile: '+91 97910 88234',
    contact_email: 'kavitha.r@crowdstrike.com',
    profile_summary: 'Kavitha has led national critical infrastructure cyber defense audits and holds active credentials in OSCE, GXPN, and CISSP with 14 years in active adversary forensics.',
    profile_document_url: '/storage/campus_events/2025-26/IT/102/speaker_profiles/Kavitha_Profile.pdf',
    is_industry_expert: true,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'spk-103',
    event_id: 103,
    name: 'Er. N. Karthikeyan',
    designation: 'Chief Powertrain Systems Specialist',
    organization: 'Ola Electric & Automotive Research Association of India (ARAI)',
    contact_mobile: '+91 94432 77011',
    contact_email: 'karthikeyan.n@araindia.org',
    profile_summary: 'Author of 4 patents on liquid-cooled battery packs and veteran automotive engineer responsible for BMS architecture across two premier EV scooters.',
    profile_document_url: '/storage/campus_events/2025-26/EEE/103/speaker_profiles/Er_Karthikeyan_CV.pdf',
    is_industry_expert: true,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'spk-104',
    event_id: 104,
    name: 'Siddharth Roy',
    designation: 'Director of Embedded Robotics',
    organization: 'Boston Dynamics Robotics Labs & Y Combinator Alum',
    contact_mobile: '+91 99100 44329',
    contact_email: 'siddharth@roboticslab.org',
    profile_summary: 'Siddharth has designed industrial quadrupeds and autonomous aerial inspection swarms, mentoring over 500 engineering hackathon teams across Asia.',
    profile_document_url: '/storage/campus_events/2025-26/ECE/104/speaker_profiles/Siddharth_Roy_Bio.pdf',
    is_industry_expert: true,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'spk-105',
    event_id: 105,
    name: 'Dr. Tarun Sen, FIE',
    designation: 'Vice President & Head of Civil Engineering Designs',
    organization: 'L&T Infrastructure Engineering Limited',
    contact_mobile: '+91 94330 19820',
    contact_email: 'tarun.sen@lntecc.com',
    profile_summary: 'Chief BIM consultant for mega-bridges and underground metro networks in South Asia with 28 years of structural consultancy expertise.',
    profile_document_url: '/storage/campus_events/2025-26/CIVIL/105/speaker_profiles/Dr_Tarun_CV.pdf',
    is_industry_expert: true,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'spk-106',
    event_id: 106,
    name: 'Ananya Deshmukh',
    designation: 'General Partner & Portfolio Lead',
    organization: 'Peak XV Partners (formerly Sequoia India)',
    contact_mobile: '+91 98201 55678',
    contact_email: 'ananya@peakxv.com',
    profile_summary: 'Ananya manages a $250M seed portfolio in enterprise software and deep tech, serving on boards of 8 high-growth venture-backed companies.',
    profile_document_url: '/storage/campus_events/2025-26/MBA/106/speaker_profiles/Ananya_Bio.pdf',
    is_industry_expert: true,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
];

const INITIAL_METRICS: EventMetrics[] = [
  {
    event_id: 101,
    target_participants: 200,
    achieved_participants: 224,
    target_external: 40,
    achieved_external: 52,
    target_internal: 160,
    achieved_internal: 172,
    faculty_participants: 18,
    budget_allocated: 120000,
    budget_spent: 114500,
    sponsorship_funds: 45000,
    certificates_issued_pct: 100,
    ideas_projects_count: 14,
    research_papers_count: 5,
    internships_linkages_count: 3,
    social_media_reach_count: 4200,
    hands_on_verified: true,
    curriculum_alignment_score: 5,
    collaborations_count: 2,
    final_kpi_score: 94.2,
    final_grade: 'Excellent',
  },
  {
    event_id: 102,
    target_participants: 80,
    achieved_participants: 85,
    target_external: 15,
    achieved_external: 18,
    target_internal: 65,
    achieved_internal: 67,
    faculty_participants: 6,
    budget_allocated: 45000,
    budget_spent: 42000,
    sponsorship_funds: 15000,
    certificates_issued_pct: 98.8,
    ideas_projects_count: 8,
    research_papers_count: 2,
    internships_linkages_count: 4,
    social_media_reach_count: 2800,
    hands_on_verified: true,
    curriculum_alignment_score: 5,
    collaborations_count: 1,
    final_kpi_score: 91.5,
    final_grade: 'Excellent',
  },
  {
    event_id: 103,
    target_participants: 50,
    achieved_participants: 46,
    target_external: 10,
    achieved_external: 8,
    target_internal: 40,
    achieved_internal: 38,
    faculty_participants: 40,
    budget_allocated: 65000,
    budget_spent: 64800,
    sponsorship_funds: 0,
    certificates_issued_pct: 92.0,
    ideas_projects_count: 3,
    research_papers_count: 1,
    internships_linkages_count: 1,
    social_media_reach_count: 850,
    hands_on_verified: true,
    curriculum_alignment_score: 4,
    collaborations_count: 1,
    final_kpi_score: 83.4,
    final_grade: 'Good',
  },
  {
    event_id: 104,
    target_participants: 180,
    achieved_participants: 195,
    target_external: 50,
    achieved_external: 62,
    target_internal: 130,
    achieved_internal: 133,
    faculty_participants: 12,
    budget_allocated: 150000,
    budget_spent: 148000,
    sponsorship_funds: 60000,
    certificates_issued_pct: 100,
    ideas_projects_count: 32,
    research_papers_count: 4,
    internships_linkages_count: 6,
    social_media_reach_count: 6800,
    hands_on_verified: true,
    curriculum_alignment_score: 5,
    collaborations_count: 3,
    final_kpi_score: 96.0,
    final_grade: 'Excellent',
  },
  {
    event_id: 105,
    target_participants: 100,
    achieved_participants: 68,
    target_external: 20,
    achieved_external: 8,
    target_internal: 80,
    achieved_internal: 60,
    faculty_participants: 10,
    budget_allocated: 50000,
    budget_spent: 56000, // over budget
    sponsorship_funds: 0,
    certificates_issued_pct: 75,
    ideas_projects_count: 1,
    research_papers_count: 0,
    internships_linkages_count: 0,
    social_media_reach_count: 320,
    hands_on_verified: false,
    curriculum_alignment_score: 3,
    collaborations_count: 0,
    final_kpi_score: 66.8,
    final_grade: 'Needs Improvement',
  },
  {
    event_id: 106,
    target_participants: 150,
    achieved_participants: 162,
    target_external: 30,
    achieved_external: 44,
    target_internal: 120,
    achieved_internal: 118,
    faculty_participants: 14,
    budget_allocated: 30000,
    budget_spent: 24000,
    sponsorship_funds: 10000,
    certificates_issued_pct: 99.0,
    ideas_projects_count: 11,
    research_papers_count: 1,
    internships_linkages_count: 2,
    social_media_reach_count: 3400,
    hands_on_verified: true,
    curriculum_alignment_score: 4,
    collaborations_count: 1,
    final_kpi_score: 88.5,
    final_grade: 'Good',
  },
];

const INITIAL_MEDIA: EventMedia[] = [
  {
    id: 'med-101-1',
    event_id: 101,
    media_type: 'CIRCULAR',
    original_filename: 'CSE_Symposium_Official_Circular_2026.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size_bytes: 1428500,
    mime_type: 'application/pdf',
    uploaded_at: '2026-03-01T10:00:00Z',
    storage_path: '/storage/campus_events/2025-26/CSE/101/circulars/CSE_Symposium_Official_Circular_2026.pdf',
    verified_magic_bytes: true,
  },
  {
    id: 'med-101-2',
    event_id: 101,
    media_type: 'PHOTO',
    original_filename: 'Keynote_Auditorium_Session.jpg',
    file_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=70',
    file_size_bytes: 3840000,
    mime_type: 'image/jpeg',
    uploaded_at: '2026-03-24T18:00:00Z',
    storage_path: '/storage/campus_events/2025-26/CSE/101/gallery/webp/Keynote_Auditorium_Session.webp',
    verified_magic_bytes: true,
  },
  {
    id: 'med-101-3',
    event_id: 101,
    media_type: 'PHOTO',
    original_filename: 'Hands_on_AI_Lab_Session.jpg',
    file_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=70',
    file_size_bytes: 2950000,
    mime_type: 'image/jpeg',
    uploaded_at: '2026-03-25T11:30:00Z',
    storage_path: '/storage/campus_events/2025-26/CSE/101/gallery/webp/Hands_on_AI_Lab_Session.webp',
    verified_magic_bytes: true,
  },
  {
    id: 'med-101-4',
    event_id: 101,
    media_type: 'PHOTO',
    original_filename: 'Valedictory_Award_Ceremony.jpg',
    file_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=300&q=70',
    file_size_bytes: 3100000,
    mime_type: 'image/jpeg',
    uploaded_at: '2026-03-25T16:45:00Z',
    storage_path: '/storage/campus_events/2025-26/CSE/101/gallery/webp/Valedictory_Award_Ceremony.webp',
    verified_magic_bytes: true,
  },
  {
    id: 'med-101-5',
    event_id: 101,
    media_type: 'ATTENDANCE_RECORD',
    original_filename: 'Signed_Student_Attendance_Sheet.pdf',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size_bytes: 2120000,
    mime_type: 'application/pdf',
    uploaded_at: '2026-03-26T09:00:00Z',
    storage_path: '/storage/campus_events/2025-26/CSE/101/reports/Signed_Student_Attendance_Sheet.pdf',
    verified_magic_bytes: true,
  },
  {
    id: 'med-101-6',
    event_id: 101,
    media_type: 'REPORT',
    original_filename: 'Consolidated_Symposium_Outcome_Report.docx',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size_bytes: 4520000,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploaded_at: '2026-03-26T14:30:00Z',
    storage_path: '/storage/campus_events/2025-26/CSE/101/reports/Consolidated_Symposium_Outcome_Report.pdf',
    verified_magic_bytes: true,
  },
  // Hackathon Media
  {
    id: 'med-104-1',
    event_id: 104,
    media_type: 'PHOTO',
    original_filename: 'Robotics_Arena_Sprint.jpg',
    file_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=70',
    file_size_bytes: 4100000,
    mime_type: 'image/jpeg',
    uploaded_at: '2026-04-20T22:00:00Z',
    storage_path: '/storage/campus_events/2025-26/ECE/104/gallery/webp/Robotics_Arena_Sprint.webp',
    verified_magic_bytes: true,
  },
  {
    id: 'med-104-2',
    event_id: 104,
    media_type: 'PHOTO',
    original_filename: 'Rover_Hardware_Jury_Review.jpg',
    file_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=70',
    file_size_bytes: 3800000,
    mime_type: 'image/jpeg',
    uploaded_at: '2026-04-21T15:00:00Z',
    storage_path: '/storage/campus_events/2025-26/ECE/104/gallery/webp/Rover_Hardware_Jury_Review.webp',
    verified_magic_bytes: true,
  },
];

const INITIAL_FEEDBACK: EventFeedback[] = [
  {
    id: 'fb-1',
    event_id: 101,
    register_no: '23CS1001',
    satisfaction_score: 5,
    content_quality_score: 5,
    speaker_effectiveness_score: 5,
    organization_quality_score: 4,
    knowledge_gain_score: 5,
    objective_clarity_met: true,
    suggestions: 'Would appreciate follow-up session on quantization with AWQ and TensorRT-LLM.',
    acquired_skills: 'vLLM deployment, DSPy agent prompt optimization, Vector RAG tuning',
    submitted_at: '2026-03-25T16:00:00Z',
  },
  {
    id: 'fb-2',
    event_id: 101,
    register_no: '23CS1014',
    satisfaction_score: 5,
    content_quality_score: 4,
    speaker_effectiveness_score: 5,
    organization_quality_score: 5,
    knowledge_gain_score: 4,
    objective_clarity_met: true,
    suggestions: 'Lab Wi-Fi bandwidth during the model download was slightly congested, otherwise flawless.',
    acquired_skills: 'Local inference pipelines, multi-agent coordination',
    submitted_at: '2026-03-25T16:15:00Z',
  },
  {
    id: 'fb-3',
    event_id: 101,
    register_no: '23IT0042',
    satisfaction_score: 4,
    content_quality_score: 5,
    speaker_effectiveness_score: 4,
    organization_quality_score: 4,
    knowledge_gain_score: 5,
    objective_clarity_met: true,
    suggestions: 'Excellent speaker caliber. Kindly publish the presentation slides on the student intranet.',
    acquired_skills: 'Transformer attention mechanics and reasoning prompt evaluation',
    submitted_at: '2026-03-25T17:00:00Z',
  },
  {
    id: 'fb-4',
    event_id: 102,
    register_no: '23IT0012',
    satisfaction_score: 5,
    content_quality_score: 5,
    speaker_effectiveness_score: 5,
    organization_quality_score: 5,
    knowledge_gain_score: 5,
    objective_clarity_met: true,
    suggestions: 'More CTF challenges like this please!',
    acquired_skills: 'eBPF telemetry, kernel exploit analysis, sandbox isolation',
    submitted_at: '2026-04-03T17:30:00Z',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Official Circular Released: AI Symposium 2026',
    message: 'Dept of CSE has published the signed circular and schedule for the Generative AI National Symposium.',
    type: 'circular',
    timestamp: '2026-03-20T10:00:00Z',
    read: false,
    link: '#event-101',
  },
  {
    id: 'notif-2',
    title: 'Feedback Window Active: Event #101',
    message: 'Feedback portal is now open for registered batches (23, 24CS, 23IT). Complete your evaluation for credit clearance.',
    type: 'feedback',
    timestamp: '2026-03-25T15:30:00Z',
    read: false,
    link: '#feedback-101',
  },
  {
    id: 'notif-3',
    title: 'Audit Action Required: Event #105 Documentation Missing',
    message: 'Reminder: Structural BIM Seminar is missing certified attendance records and financial expenditure balance.',
    type: 'audit',
    timestamp: '2026-05-06T09:00:00Z',
    read: false,
    link: '#audit-105',
  },
];

class InstitutionalDatabase {
  private events: CampusEvent[] = [];
  private speakers: EventSpeaker[] = [];
  private metrics: EventMetrics[] = [];
  private media: EventMedia[] = [];
  private feedback: EventFeedback[] = [];
  private notifications: NotificationItem[] = [];
  private users: User[] = [];
  private currentUser: User = INITIAL_USERS[0];
  private listeners: Set<() => void> = new Set();
  private firestoreInitialized = false;

  constructor() {
    this.loadFromStorage();
    this.initFirestoreSync();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in database subscriber callback:', err);
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('institutional-db-update'));
    }
  }

  private initFirestoreSync() {
    if (this.firestoreInitialized) return;
    this.firestoreInitialized = true;

    // 1. Events collection listener
    const eventsPath = 'events';
    onSnapshot(
      collection(firestoreDb, eventsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteEvents: CampusEvent[] = [];
          snapshot.forEach((docSnap) => {
            remoteEvents.push(docSnap.data() as CampusEvent);
          });
          this.events = remoteEvents.sort((a, b) => b.id - a.id);
          this.saveEvents(false);
          this.notifyListeners();
        } else {
          INITIAL_EVENTS.forEach((ev) => {
            this.syncEventToFirestore(ev);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, eventsPath);
      }
    );

    // 2. Speakers collection listener
    const speakersPath = 'speakers';
    onSnapshot(
      collection(firestoreDb, speakersPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteSpeakers: EventSpeaker[] = [];
          snapshot.forEach((docSnap) => {
            remoteSpeakers.push(docSnap.data() as EventSpeaker);
          });
          this.speakers = remoteSpeakers;
          this.saveSpeakers(false);
          this.notifyListeners();
        } else {
          INITIAL_SPEAKERS.forEach((spk) => {
            this.syncSpeakerToFirestore(spk);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, speakersPath);
      }
    );

    // 3. Media collection listener
    const mediaPath = 'media';
    onSnapshot(
      collection(firestoreDb, mediaPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteMedia: EventMedia[] = [];
          snapshot.forEach((docSnap) => {
            remoteMedia.push(docSnap.data() as EventMedia);
          });
          this.media = remoteMedia;
          this.saveMedia(false);
          this.notifyListeners();
        } else {
          INITIAL_MEDIA.forEach((med) => {
            this.syncMediaToFirestore(med);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, mediaPath);
      }
    );

    // 4. Feedback collection listener
    const feedbackPath = 'feedbacks';
    onSnapshot(
      collection(firestoreDb, feedbackPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteFeedback: EventFeedback[] = [];
          snapshot.forEach((docSnap) => {
            remoteFeedback.push(docSnap.data() as EventFeedback);
          });
          this.feedback = remoteFeedback;
          this.saveFeedback(false);
          this.notifyListeners();
        } else {
          INITIAL_FEEDBACK.forEach((fb) => {
            this.syncFeedbackToFirestore(fb);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, feedbackPath);
      }
    );

    // 5. Metrics collection listener
    const metricsPath = 'metrics';
    onSnapshot(
      collection(firestoreDb, metricsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteMetrics: EventMetrics[] = [];
          snapshot.forEach((docSnap) => {
            remoteMetrics.push(docSnap.data() as EventMetrics);
          });
          this.metrics = remoteMetrics;
          this.saveMetrics(false);
          this.notifyListeners();
        } else {
          INITIAL_METRICS.forEach((m) => {
            this.syncMetricsToFirestore(m);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, metricsPath);
      }
    );

    // 6. Notifications collection listener
    const notifsPath = 'notifications';
    onSnapshot(
      collection(firestoreDb, notifsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteNotifs: NotificationItem[] = [];
          snapshot.forEach((docSnap) => {
            remoteNotifs.push(docSnap.data() as NotificationItem);
          });
          this.notifications = remoteNotifs.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.saveNotifications(false);
          this.notifyListeners();
        } else {
          INITIAL_NOTIFICATIONS.forEach((n) => {
            this.syncNotificationToFirestore(n);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, notifsPath);
      }
    );
  }

  // --- Firestore Write Helpers ---
  private async syncEventToFirestore(ev: CampusEvent) {
    const path = `events/${ev.id}`;
    try {
      await setDoc(doc(firestoreDb, 'events', String(ev.id)), cleanFirestoreData(ev));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  private async syncSpeakerToFirestore(spk: EventSpeaker) {
    const path = `speakers/${spk.id}`;
    try {
      await setDoc(doc(firestoreDb, 'speakers', String(spk.id)), cleanFirestoreData(spk));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  private async syncMediaToFirestore(med: EventMedia) {
    const path = `media/${med.id}`;
    try {
      await setDoc(doc(firestoreDb, 'media', String(med.id)), cleanFirestoreData(med));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  private async syncFeedbackToFirestore(fb: EventFeedback) {
    const path = `feedbacks/${fb.id}`;
    try {
      await setDoc(doc(firestoreDb, 'feedbacks', String(fb.id)), cleanFirestoreData(fb));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  private async syncMetricsToFirestore(m: EventMetrics) {
    const path = `metrics/${m.event_id}`;
    try {
      await setDoc(doc(firestoreDb, 'metrics', String(m.event_id)), cleanFirestoreData(m));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  private async syncNotificationToFirestore(n: NotificationItem) {
    const path = `notifications/${n.id}`;
    try {
      await setDoc(doc(firestoreDb, 'notifications', String(n.id)), cleanFirestoreData(n));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  private loadFromStorage() {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      this.events = storedEvents ? JSON.parse(storedEvents) : INITIAL_EVENTS;

      const storedSpeakers = localStorage.getItem(STORAGE_KEYS.SPEAKERS);
      this.speakers = storedSpeakers ? JSON.parse(storedSpeakers) : INITIAL_SPEAKERS;

      const storedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
      this.metrics = storedMetrics ? JSON.parse(storedMetrics) : INITIAL_METRICS;

      const storedMedia = localStorage.getItem(STORAGE_KEYS.MEDIA);
      this.media = storedMedia ? JSON.parse(storedMedia) : INITIAL_MEDIA;

      const storedFeedback = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      this.feedback = storedFeedback ? JSON.parse(storedFeedback) : INITIAL_FEEDBACK;

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS;

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

      const storedCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      this.currentUser = storedCurrent ? JSON.parse(storedCurrent) : INITIAL_USERS[0];
    } catch (e) {
      console.warn('Storage read failed, fallback to defaults', e);
      this.events = INITIAL_EVENTS;
      this.speakers = INITIAL_SPEAKERS;
      this.metrics = INITIAL_METRICS;
      this.media = INITIAL_MEDIA;
      this.feedback = INITIAL_FEEDBACK;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.users = INITIAL_USERS;
      this.currentUser = INITIAL_USERS[0];
    }
  }

  private saveEvents(syncRemote = true) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    if (syncRemote) {
      this.events.forEach((ev) => this.syncEventToFirestore(ev));
    }
    this.notifyListeners();
  }
  private saveSpeakers(syncRemote = true) {
    localStorage.setItem(STORAGE_KEYS.SPEAKERS, JSON.stringify(this.speakers));
    if (syncRemote) {
      this.speakers.forEach((s) => this.syncSpeakerToFirestore(s));
    }
    this.notifyListeners();
  }
  private saveMetrics(syncRemote = true) {
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(this.metrics));
    if (syncRemote) {
      this.metrics.forEach((m) => this.syncMetricsToFirestore(m));
    }
    this.notifyListeners();
  }
  private saveMedia(syncRemote = true) {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(this.media));
    if (syncRemote) {
      this.media.forEach((m) => this.syncMediaToFirestore(m));
    }
    this.notifyListeners();
  }
  private saveFeedback(syncRemote = true) {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(this.feedback));
    if (syncRemote) {
      this.feedback.forEach((f) => this.syncFeedbackToFirestore(f));
    }
    this.notifyListeners();
  }
  private saveNotifications(syncRemote = true) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    if (syncRemote) {
      this.notifications.forEach((n) => this.syncNotificationToFirestore(n));
    }
    this.notifyListeners();
  }
  private saveCurrentUser() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
  }

  // --- Users & Roles ---
  getUsers(): User[] {
    return this.users;
  }
  getCurrentUser(): User {
    return this.currentUser;
  }
  setCurrentUser(user: User) {
    this.currentUser = user;
    this.saveCurrentUser();
  }

  // --- Events ---
  getEvents(): CampusEvent[] {
    return this.events;
  }

  getEventById(id: number): CampusEvent | undefined {
    return this.events.find((e) => e.id === id);
  }

  saveEvent(event: Partial<CampusEvent> & { name: string; department_id: string }): CampusEvent {
    if (event.id) {
      const idx = this.events.findIndex((e) => e.id === event.id);
      if (idx !== -1) {
        this.events[idx] = { ...this.events[idx], ...event };
        this.saveEvents();
        return this.events[idx];
      }
    }

    const newId = this.events.length > 0 ? Math.max(...this.events.map((e) => e.id)) + 1 : 101;
    const newEvent: CampusEvent = {
      id: newId,
      name: event.name,
      event_type: event.event_type || 'WORKSHOP',
      department_id: event.department_id,
      co_departments: event.co_departments || [],
      date_start: event.date_start || new Date().toISOString().split('T')[0],
      date_end: event.date_end || new Date().toISOString().split('T')[0],
      time_start: event.time_start || '09:30 AM',
      time_end: event.time_end || '04:30 PM',
      venue_mode: event.venue_mode || 'OFFLINE',
      venue_details: event.venue_details || 'Main Seminar Hall',
      eligibility_prefixes: event.eligibility_prefixes || ['23', '24'],
      feedback_open: event.feedback_open ?? false,
      created_by_coordinator_id: this.currentUser.id,
      coordinator_name: event.coordinator_name || this.currentUser.username,
      coordinator_designation: event.coordinator_designation || 'Staff Coordinator',
      coordinator_email: event.coordinator_email || this.currentUser.email,
      coordinator_phone: event.coordinator_phone || '+91 98400 00000',
      description: event.description || '',
      objective_statement: event.objective_statement || '',
      agenda_topics: event.agenda_topics || ['Orientation and Welcome', 'Keynote Address', 'Technical Hands-on', 'Q&A and Feedback'],
      featured_banner: event.featured_banner ?? false,
      banner_image_url: event.banner_image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    };

    this.events.unshift(newEvent);
    this.saveEvents();

    // Initialize metrics if not present
    this.saveMetricsForEvent({
      event_id: newId,
      target_participants: 100,
      achieved_participants: 0,
      target_external: 20,
      achieved_external: 0,
      target_internal: 80,
      achieved_internal: 0,
      faculty_participants: 5,
      budget_allocated: 50000,
      budget_spent: 0,
      sponsorship_funds: 0,
      certificates_issued_pct: 0,
      ideas_projects_count: 0,
      research_papers_count: 0,
      internships_linkages_count: 0,
      social_media_reach_count: 0,
      hands_on_verified: true,
      curriculum_alignment_score: 4,
      collaborations_count: 1,
      final_kpi_score: 75.0,
      final_grade: 'Satisfactory',
    });

    // Add notification
    this.addNotification({
      title: `Event Authoring Completed: ${newEvent.name}`,
      message: `${newEvent.department_id} department coordinator has staged a new event. Eligibility: ${newEvent.eligibility_prefixes.join(', ')}.`,
      type: 'circular',
      link: `#event-${newId}`,
    });

    return newEvent;
  }

  toggleFeedback(eventId: number, isOpen: boolean): boolean {
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) return false;
    ev.feedback_open = isOpen;
    this.saveEvents();

    this.addNotification({
      title: `Feedback Window ${isOpen ? 'Opened' : 'Paused'}: ${ev.name}`,
      message: isOpen
        ? `Students with prefixes [${ev.eligibility_prefixes.join(', ')}] can now submit evaluations.`
        : `Feedback submissions paused by event coordinator.`,
      type: 'feedback',
      link: `#event-${eventId}`,
    });

    return true;
  }

  // --- Speakers ---
  getSpeakersForEvent(eventId: number): EventSpeaker[] {
    return this.speakers.filter((s) => s.event_id === eventId);
  }

  saveSpeaker(speaker: Omit<EventSpeaker, 'id'> & { id?: string }): EventSpeaker {
    if (speaker.id) {
      const idx = this.speakers.findIndex((s) => s.id === speaker.id);
      if (idx !== -1) {
        this.speakers[idx] = { ...this.speakers[idx], ...speaker };
        this.saveSpeakers();
        return this.speakers[idx];
      }
    }
    const newSpk: EventSpeaker = {
      ...speaker,
      id: `spk-${Date.now()}`,
    };
    this.speakers.push(newSpk);
    this.saveSpeakers();
    return newSpk;
  }

  // --- Metrics ---
  getMetricsForEvent(eventId: number): EventMetrics {
    let m = this.metrics.find((item) => item.event_id === eventId);
    if (!m) {
      m = {
        event_id: eventId,
        target_participants: 100,
        achieved_participants: 0,
        target_external: 20,
        achieved_external: 0,
        target_internal: 80,
        achieved_internal: 0,
        faculty_participants: 5,
        budget_allocated: 50000,
        budget_spent: 0,
        sponsorship_funds: 0,
        certificates_issued_pct: 0,
        ideas_projects_count: 0,
        research_papers_count: 0,
        internships_linkages_count: 0,
        social_media_reach_count: 0,
        hands_on_verified: true,
        curriculum_alignment_score: 4,
        collaborations_count: 1,
        final_kpi_score: 75.0,
        final_grade: 'Satisfactory',
      };
      this.metrics.push(m);
      this.saveMetrics();
    }
    return m;
  }

  saveMetricsForEvent(metricsData: EventMetrics): EventMetrics {
    const idx = this.metrics.findIndex((m) => m.event_id === metricsData.event_id);
    if (idx !== -1) {
      this.metrics[idx] = { ...this.metrics[idx], ...metricsData };
    } else {
      this.metrics.push(metricsData);
    }
    this.saveMetrics();
    return metricsData;
  }

  // --- Media & Universal Drop Desk ---
  getMediaForEvent(eventId: number): EventMedia[] {
    return this.media.filter((m) => m.event_id === eventId);
  }

  saveMediaRecord(record: Omit<EventMedia, 'id'>): EventMedia {
    const newMedia: EventMedia = {
      ...record,
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    this.media.push(newMedia);
    this.saveMedia();
    return newMedia;
  }

  // --- Student Verification & Prefix-Based Filter Logic ---
  /**
   * Evaluates Section 3 Pipeline:
   * Step 1: Normalize input string (strip whitespace, uppercase)
   * Step 2: Validate against institutional register number format regex: ^[0-9]{2}[A-Z]{2,4}[0-9]{3,4}$
   * Step 3: Validate against the event's registered pattern array (e.g. ['23', '24CS'])
   * Step 4: Check against feedback database for duplicate (event_id, register_no)
   * Step 5: Return result with token or localized restriction prompt
   */
  evaluateStudentEligibility(
    eventId: number,
    rawRegNo: string
  ): {
    eligible: boolean;
    normalizedRegNo: string;
    errorReason?: string;
    token?: string;
    event?: CampusEvent;
  } {
    const event = this.getEventById(eventId);
    if (!event) {
      return { eligible: false, normalizedRegNo: '', errorReason: 'Specified event not found.' };
    }

    // Step 1: Normalize input
    const normalized = rawRegNo.trim().toUpperCase();

    // Step 2: Validate Institutional Register Number regex:
    // Format: 2 digits (e.g. 23) + 2 to 4 departmental letters (e.g. CS, IT, ECE, MECH) + 3 to 4 roll digits (e.g. 1045)
    const institutionalRegNoPattern = /^[0-9]{2}[A-Z]{2,4}[0-9]{3,4}$/;
    if (!institutionalRegNoPattern.test(normalized)) {
      return {
        eligible: false,
        normalizedRegNo: normalized,
        errorReason: `Invalid Institutional Register Number format. Must match format like "23CS1045" or "22ECE042" (alphanumeric pattern: 2 digits year + department letters + roll digits).`,
      };
    }

    // Step 3: Check feedback window
    if (!event.feedback_open) {
      return {
        eligible: false,
        normalizedRegNo: normalized,
        errorReason: 'Student feedback evaluation window is currently closed for this event.',
      };
    }

    // Step 4: Validate against event registered pattern array
    // e.g. '23' targets all 2023-batch students, '23CS' narrows strictly to 2023 Computer Science students
    const matchesPrefix = event.eligibility_prefixes.some((prefix) => {
      const cleanPrefix = prefix.trim().toUpperCase();
      return normalized.startsWith(cleanPrefix);
    });

    if (!matchesPrefix) {
      const formattedPrefixes = event.eligibility_prefixes.join(', ');
      return {
        eligible: false,
        normalizedRegNo: normalized,
        errorReason: `Feedback for this event is reserved exclusively for register numbers matching '${formattedPrefixes}'. Your ID (${normalized}) is not eligible.`,
      };
    }

    // Step 5: Check database for duplicate submission (event_id, register_no)
    const existingFeedback = this.feedback.find(
      (f) => f.event_id === eventId && f.register_no === normalized
    );
    if (existingFeedback) {
      return {
        eligible: false,
        normalizedRegNo: normalized,
        errorReason: `An evaluation survey for Register Number "${normalized}" has already been submitted on ${new Date(existingFeedback.submitted_at).toLocaleDateString()} at ${new Date(existingFeedback.submitted_at).toLocaleTimeString()}. Duplicate submissions are prohibited.`,
      };
    }

    // Step 6: Verified! Issue dynamic single-use survey token
    const token = `SURVEY_AUTH_${eventId}_${normalized}_${Date.now()}`;
    return {
      eligible: true,
      normalizedRegNo: normalized,
      token,
      event,
    };
  }

  // --- Feedback Submissions ---
  getFeedbackForEvent(eventId: number): EventFeedback[] {
    return this.feedback.filter((f) => f.event_id === eventId);
  }

  getAllFeedback(): EventFeedback[] {
    return this.feedback;
  }

  submitFeedback(
    feedbackData: Omit<EventFeedback, 'id' | 'submitted_at'>
  ): { success: boolean; message: string; feedback?: EventFeedback } {
    const normalized = feedbackData.register_no.trim().toUpperCase();

    // Check duplicate
    const existing = this.feedback.find(
      (f) => f.event_id === feedbackData.event_id && f.register_no === normalized
    );
    if (existing) {
      return {
        success: false,
        message: 'Feedback already submitted for this student ID.',
      };
    }

    const newFeedback: EventFeedback = {
      ...feedbackData,
      register_no: normalized,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      submitted_at: new Date().toISOString(),
    };

    this.feedback.push(newFeedback);
    this.saveFeedback();

    // Recalculate event metrics & KPI score
    const event = this.getEventById(feedbackData.event_id);
    if (event) {
      const evMetrics = this.getMetricsForEvent(event.id);
      const allEvFeedback = this.getFeedbackForEvent(event.id);

      // increment achieved internal if feedback submitted
      evMetrics.achieved_internal = Math.max(evMetrics.achieved_internal, allEvFeedback.length);
      evMetrics.achieved_participants =
        evMetrics.achieved_internal + evMetrics.achieved_external + evMetrics.faculty_participants;

      const calc = calculateEventKPIScore(event, evMetrics, allEvFeedback);
      evMetrics.final_kpi_score = calc.totalScore;
      evMetrics.final_grade = calc.grade;

      this.saveMetricsForEvent(evMetrics);
    }

    return {
      success: true,
      message: 'Student feedback recorded successfully and verified on institutional ledger.',
      feedback: newFeedback,
    };
  }

  // --- Digital Signature Canvas & Sign-off ---
  signOffEvent(eventId: number, signatureDataUrl: string): boolean {
    const event = this.getEventById(eventId);
    if (!event) return false;
    event.digital_signature = signatureDataUrl;
    event.signature_timestamp = new Date().toISOString();
    event.audit_completed = true;
    this.saveEvents();

    this.addNotification({
      title: `Formal Digital Sign-Off: ${event.name}`,
      message: `Coordinator digital verification signature uploaded. Event verified for institutional executive review.`,
      type: 'audit',
      link: `#event-${eventId}`,
    });

    return true;
  }

  // --- Notifications ---
  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  markNotificationAsRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.saveNotifications();
    }
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.saveNotifications();
  }

  addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const notif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(notif);
    this.saveNotifications();
  }

  // --- Convenience & Alias Helpers ---
  getAllEvents(): CampusEvent[] {
    return this.getEvents();
  }

  createEvent(event: Partial<CampusEvent> & { name: string; department_id: string }): CampusEvent {
    return this.saveEvent(event);
  }

  getFeedbackByEvent(eventId: number): EventFeedback[] {
    return this.getFeedbackForEvent(eventId);
  }

  getAllFeedbacks(): EventFeedback[] {
    return this.getAllFeedback();
  }

  getSpeakersByEvent(eventId: number): EventSpeaker[] {
    return this.getSpeakersForEvent(eventId);
  }

  createSpeaker(speaker: Omit<EventSpeaker, 'id'> & { id?: string }): EventSpeaker {
    return this.saveSpeaker(speaker);
  }

  getMediaByEvent(eventId: number): EventMedia[] {
    return this.getMediaForEvent(eventId);
  }

  createMedia(record: Omit<EventMedia, 'id'>): EventMedia {
    return this.saveMediaRecord(record);
  }

  getMetrics(eventId: number): EventMetrics {
    return this.getMetricsForEvent(eventId);
  }

  updateMetrics(eventId: number, metricsData: EventMetrics): EventMetrics {
    return this.saveMetricsForEvent(metricsData);
  }

  toggleFeedbackStatus(eventId: number, isOpen: boolean): boolean {
    return this.toggleFeedback(eventId, isOpen);
  }

  // --- Reset to Demonstration Baseline ---
  resetToDefaults() {
    localStorage.clear();
    this.events = INITIAL_EVENTS;
    this.speakers = INITIAL_SPEAKERS;
    this.metrics = INITIAL_METRICS;
    this.media = INITIAL_MEDIA;
    this.feedback = INITIAL_FEEDBACK;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.users = INITIAL_USERS;
    this.currentUser = INITIAL_USERS[0];
    this.saveEvents();
    this.saveSpeakers();
    this.saveMetrics();
    this.saveMedia();
    this.saveFeedback();
    this.saveNotifications();
    this.saveCurrentUser();
  }
}

export const db = new InstitutionalDatabase();
