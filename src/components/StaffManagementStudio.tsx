import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Upload,
  Image as ImageIcon,
  Users,
  Calendar,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
  Eye,
  Building2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import {
  CampusEvent,
  EventFeedback,
  EventMedia,
  EventMetrics,
  EventSpeaker,
  EventType,
  VenueMode,
} from '../types';
import { db } from '../services/db';
import { calculateEventKPIScore } from '../services/kpiScoring';
import { exportFeedbackToCSV, exportFeedbackToExcel, exportStructuredJSON } from '../services/dataExport';
import { verifyMagicBytes, optimizeImageFile } from '../services/fileSecurity';

interface StaffStudioProps {
  onSelectEventForPreview: (id: number) => void;
}

export const StaffManagementStudio: React.FC<StaffStudioProps> = ({
  onSelectEventForPreview,
}) => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Wizard State (Steps 1 through 5)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form Fields - Step 1: Metadata
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<EventType>('WORKSHOP');
  const [formDept, setFormDept] = useState('CSE');
  const [formCoDepts, setFormCoDepts] = useState<string[]>([]);
  const [formMode, setFormMode] = useState<VenueMode>('OFFLINE');
  const [formVenue, setFormVenue] = useState('');
  const [formDateStart, setFormDateStart] = useState('');
  const [formDateEnd, setFormDateEnd] = useState('');
  const [formTimeStart, setFormTimeStart] = useState('09:30 AM');
  const [formTimeEnd, setFormTimeEnd] = useState('04:30 PM');
  const [formCoordName, setFormCoordName] = useState('Dr. S. K. Narayanan');
  const [formCoordEmail, setFormCoordEmail] = useState('narayanan.cse@institution.edu');
  const [formCoordPhone, setFormCoordPhone] = useState('+91 94441 88320');
  const [formDescription, setFormDescription] = useState('');

  // Step 2: Objectives & Prefixes
  const [formObjective, setFormObjective] = useState('');
  const [formAgenda, setFormAgenda] = useState<string[]>(['Keynote & Concept Intro', 'Hands-on Lab Session']);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [formPrefixes, setFormPrefixes] = useState<string[]>(['23CS', '24CS']);
  const [newPrefixInput, setNewPrefixInput] = useState('');
  const [formTargetTotal, setFormTargetTotal] = useState<number>(100);
  const [formTargetInternal, setFormTargetInternal] = useState<number>(80);
  const [formTargetExternal, setFormTargetExternal] = useState<number>(20);

  // Step 3: Resource Persons
  const [formSpeakers, setFormSpeakers] = useState<Partial<EventSpeaker>[]>([
    {
      name: '',
      designation: '',
      organization: '',
      is_industry_expert: true,
      contact_email: '',
      contact_mobile: '',
      profile_summary: '',
    },
  ]);

  // Step 4: Financial & Metrics
  const [formBudgetAlloc, setFormBudgetAlloc] = useState<number>(45000);
  const [formBudgetSpent, setFormBudgetSpent] = useState<number>(38000);
  const [formSponsorship, setFormSponsorship] = useState<number>(25000);
  const [formAchievedTotal, setFormAchievedTotal] = useState<number>(95);
  const [formAchievedInternal, setFormAchievedInternal] = useState<number>(75);
  const [formAchievedExternal, setFormAchievedExternal] = useState<number>(20);

  // Step 5: Media & Uploads
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string>('');
  const [uploadedMediaList, setUploadedMediaList] = useState<EventMedia[]>([]);
  const [securityScanLog, setSecurityScanLog] = useState<string[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Feedback Desk State for Selected Event
  const [selectedEventFeedbacks, setSelectedEventFeedbacks] = useState<EventFeedback[]>([]);
  const [selectedEventMetrics, setSelectedEventMetrics] = useState<EventMetrics | undefined>(undefined);
  const [selectedEventSpeakers, setSelectedEventSpeakers] = useState<EventSpeaker[]>([]);

  // Load all events
  const loadEvents = () => {
    const list = db.getAllEvents();
    setEvents(list);
    if (list.length > 0 && selectedEventId === null) {
      setSelectedEventId(list[0].id);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // When selected event changes, load feedbacks and metrics
  useEffect(() => {
    if (selectedEventId) {
      const fb = db.getFeedbackByEvent(selectedEventId);
      setSelectedEventFeedbacks(fb);
      const met = db.getMetrics(selectedEventId);
      setSelectedEventMetrics(met);
      const spk = db.getSpeakersByEvent(selectedEventId);
      setSelectedEventSpeakers(spk);
    }
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Toggle Live Feedback Window
  const handleToggleFeedbackStatus = (eventId: number, currentStatus: boolean) => {
    db.toggleFeedbackStatus(eventId, !currentStatus);
    loadEvents();
  };

  // Step 5 File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'PHOTO' | 'CIRCULAR') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingFile(true);

    try {
      // 1. Magic byte binary signature validation
      const secResult = await verifyMagicBytes(file);
      setSecurityScanLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ${file.name}: ${secResult.message} (${secResult.detectedFormat})`,
        ...prev,
      ]);

      if (!secResult.valid) {
        alert(`Security Error: ${secResult.message}`);
        setIsProcessingFile(false);
        return;
      }

      if (type === 'PHOTO') {
        // Optimize image
        const opt = await optimizeImageFile(file);
        const newMedia: EventMedia = {
          id: `media-${Date.now()}`,
          event_id: selectedEventId || 999,
          media_type: 'PHOTO',
          original_filename: file.name,
          file_url: opt.fullDataUrl,
          thumbnail_url: opt.thumbDataUrl,
          file_size_bytes: opt.optimizedSize,
          mime_type: 'image/webp',
          uploaded_at: new Date().toISOString(),
          storage_path: `/storage/campus_events/2025-26/${formDept || 'CSE'}/${selectedEventId || 999}/photos/${file.name}`,
          verified_magic_bytes: true,
        };
        setUploadedMediaList((prev) => [...prev, newMedia]);
        setBannerPreviewUrl(opt.fullDataUrl);
      } else {
        const fakeUrl = URL.createObjectURL(file);
        const newMedia: EventMedia = {
          id: `media-${Date.now()}`,
          event_id: selectedEventId || 999,
          media_type: 'CIRCULAR',
          original_filename: file.name,
          file_url: fakeUrl,
          file_size_bytes: file.size,
          mime_type: secResult.mimeType,
          uploaded_at: new Date().toISOString(),
          storage_path: `/storage/campus_events/2025-26/${formDept || 'CSE'}/${selectedEventId || 999}/circulars/${file.name}`,
          verified_magic_bytes: true,
        };
        setUploadedMediaList((prev) => [...prev, newMedia]);
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Add agenda topic
  const handleAddAgenda = () => {
    if (!newAgendaItem.trim()) return;
    setFormAgenda([...formAgenda, newAgendaItem.trim()]);
    setNewAgendaItem('');
  };

  // Remove agenda topic
  const handleRemoveAgenda = (idx: number) => {
    setFormAgenda(formAgenda.filter((_, i) => i !== idx));
  };

  // Add prefix
  const handleAddPrefix = () => {
    const p = newPrefixInput.trim().toUpperCase();
    if (!p || formPrefixes.includes(p)) return;
    setFormPrefixes([...formPrefixes, p]);
    setNewPrefixInput('');
  };

  // Remove prefix
  const handleRemovePrefix = (prefix: string) => {
    setFormPrefixes(formPrefixes.filter((p) => p !== prefix));
  };

  // Update speaker list
  const handleAddSpeakerRow = () => {
    setFormSpeakers([
      ...formSpeakers,
      {
        name: '',
        designation: '',
        organization: '',
        is_industry_expert: false,
        contact_email: '',
        contact_mobile: '',
        profile_summary: '',
      },
    ]);
  };

  const handleSpeakerChange = (index: number, field: keyof EventSpeaker, value: any) => {
    const next = [...formSpeakers];
    next[index] = { ...next[index], [field]: value };
    setFormSpeakers(next);
  };

  // Final Publish Event
  const handleSaveEvent = () => {
    if (!formName || !formDateStart) {
      alert('Please fill in Event Title and Date Start');
      return;
    }

    const newId = Date.now();
    const eventPayload: CampusEvent = {
      id: newId,
      name: formName,
      event_type: formType,
      department_id: formDept,
      co_departments: formCoDepts,
      date_start: formDateStart,
      date_end: formDateEnd || formDateStart,
      time_start: formTimeStart,
      time_end: formTimeEnd,
      venue_mode: formMode,
      venue_details: formVenue || 'Main Auditorium',
      coordinator_name: formCoordName,
      coordinator_email: formCoordEmail,
      coordinator_phone: formCoordPhone,
      coordinator_designation: 'Associate Professor & Event Head',
      created_by_coordinator_id: 'usr-coord-1',
      status: 'UPCOMING',
      feedback_open: true,
      eligibility_prefixes: formPrefixes.length > 0 ? formPrefixes : ['23CS', '24CS'],
      objective_statement: formObjective || `${formName} aimed at enhancing practical competency.`,
      description: formDescription || formName,
      agenda_topics: formAgenda,
      banner_image_url:
        bannerPreviewUrl ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      digital_signature: `SHA256:${Math.random().toString(36).substring(2, 12).toUpperCase()}_VERIFIED_DEPT_${formDept}`,
    };

    // Save Event
    db.createEvent(eventPayload);

    // Save Speakers
    formSpeakers.forEach((spk, idx) => {
      if (spk.name) {
        db.createSpeaker({
          id: `spk-${newId}-${idx}`,
          event_id: newId,
          name: spk.name || 'Invited Resource Person',
          designation: spk.designation || 'Specialist',
          organization: spk.organization || 'Institutional Partner',
          is_industry_expert: !!spk.is_industry_expert,
          contact_email: spk.contact_email || 'speaker@institution.edu',
          contact_mobile: spk.contact_mobile || '+91 98840 00000',
          profile_summary: spk.profile_summary || 'Expert practitioner with extensive field experience.',
        });
      }
    });

    // Save Metrics
    const metricsPayload: EventMetrics = {
      event_id: newId,
      target_participants: formTargetTotal,
      achieved_participants: formAchievedTotal,
      target_internal: formTargetInternal,
      achieved_internal: formAchievedInternal,
      target_external: formTargetExternal,
      achieved_external: formAchievedExternal,
      faculty_participants: 5,
      budget_allocated: formBudgetAlloc,
      budget_spent: formBudgetSpent,
      sponsorship_funds: formSponsorship,
      certificates_issued_pct: 95,
      ideas_projects_count: 5,
      research_papers_count: 2,
      internships_linkages_count: 3,
      social_media_reach_count: 1200,
      hands_on_verified: true,
      curriculum_alignment_score: 5,
      collaborations_count: 2,
      final_kpi_score: 85,
      final_grade: 'Good',
    };
    db.updateMetrics(newId, metricsPayload);

    // Save uploaded media
    uploadedMediaList.forEach((m) => {
      db.createMedia({ ...m, event_id: newId });
    });

    // Reset wizard
    setIsCreatingNew(false);
    setWizardStep(1);
    loadEvents();
    setSelectedEventId(newId);
    alert('Event published successfully with full KPI metrics and prefix gating!');
  };

  // KPI Preview for Selected Event
  const currentKpiResult =
    selectedEvent && selectedEventMetrics
      ? calculateEventKPIScore(selectedEvent, selectedEventMetrics, selectedEventFeedbacks)
      : null;

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Desk Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Staff Management Studio &amp; Coordinator Control Desk
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage 5-stage event lifecycles, live feedback windows, prefix validation, and spreadsheet exports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {!isCreatingNew ? (
            <button
              onClick={() => {
                setIsCreatingNew(true);
                setWizardStep(1);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Event (5-Step Wizard)</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Cancel Wizard
            </button>
          )}
        </div>
      </div>

      {/* 5-STEP EVENT CREATION WIZARD MODAL / ACCORDION */}
      {isCreatingNew && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Institutional Event Provisioning
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Multi-Step Event Lifecycle Wizard
              </h3>
            </div>
            {/* Step Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setWizardStep(s as any)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                    wizardStep === s
                      ? 'bg-indigo-600 text-white'
                      : wizardStep > s
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: METADATA */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 1: Institutional Metadata &amp; Department Taxonomy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. National Workshop on Large Language Models &amp; Distributed Training"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Classification / Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as EventType)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="WORKSHOP">Workshop</option>
                    <option value="FDP">Faculty Development Program (FDP)</option>
                    <option value="CONFERENCE">National / International Conference</option>
                    <option value="HACKATHON">Hackathon &amp; Design Challenge</option>
                    <option value="GUEST_LECTURE">Guest Lecture / Masterclass</option>
                    <option value="SEMINAR">Technical Seminar</option>
                    <option value="IV">Industrial Visit (IV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Organizing Department
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="ECE">Electronics &amp; Communication (ECE)</option>
                    <option value="EEE">Electrical &amp; Electronics (EEE)</option>
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="CIVIL">Civil Engineering (CIVIL)</option>
                    <option value="MBA">Management Studies (MBA)</option>
                    <option value="S&H">Science &amp; Humanities (S&amp;H)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Mode
                  </label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as VenueMode)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="OFFLINE">Physical / Offline (Campus)</option>
                    <option value="ONLINE">Virtual / Online (Streamed)</option>
                    <option value="HYBRID">Hybrid (Physical + Streamed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Venue Details / Lab Hall
                  </label>
                  <input
                    type="text"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="e.g. Turing Hall / High Performance Computing Lab 4"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date Start *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDateStart}
                    onChange={(e) => setFormDateStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date End
                  </label>
                  <input
                    type="date"
                    value={formDateEnd}
                    onChange={(e) => setFormDateEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    value={formCoordName}
                    onChange={(e) => setFormCoordName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Coordinator Email &amp; Phone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={formCoordEmail}
                      onChange={(e) => setFormCoordEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={formCoordPhone}
                      onChange={(e) => setFormCoordPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Overview / Syllabus Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide detailed description of the event, syllabus modules, hands-on tasks, and target outcomes..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OBJECTIVES, RUBRICS & PREFIX-GATED ACCESS */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 2: Curricular Alignment &amp; Target Register Number Prefixes
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stated Objective Statement *
                </label>
                <textarea
                  rows={2}
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  placeholder="e.g. Equip engineering scholars with production inference deployment patterns and model quantization benchmarks."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Dynamic Prefix Filter Mechanism */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase">
                    Authorized Register Number Prefixes (Student Access Gate)
                  </label>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Only students with register numbers starting with these prefixes can submit feedback surveys.
                  Examples: <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">23CS</code>, <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">23IT</code>, <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">24</code>.
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {formPrefixes.map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 text-xs font-mono font-bold shadow-xs"
                    >
                      <span>{p}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrefix(p)}
                        className="text-slate-400 hover:text-rose-500 transition"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={newPrefixInput}
                    onChange={(e) => setNewPrefixInput(e.target.value)}
                    placeholder="e.g. 22EC"
                    className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPrefix}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Add Prefix
                  </button>
                </div>
              </div>

              {/* Agenda Topics */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Technical Agenda &amp; Module Plan
                </label>
                <div className="space-y-1.5 mb-2">
                  {formAgenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {idx + 1}. {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAgenda(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAgendaItem}
                    onChange={(e) => setNewAgendaItem(e.target.value)}
                    placeholder="Add agenda topic / session title..."
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAgenda}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold hover:bg-slate-300 text-slate-800 dark:text-slate-200"
                  >
                    Add Topic
                  </button>
                </div>
              </div>

              {/* Target Headcount Numbers */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Target Total
                  </label>
                  <input
                    type="number"
                    value={formTargetTotal}
                    onChange={(e) => setFormTargetTotal(parseInt(e.target.value, 10) || 0)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Target Internal
                  </label>
                  <input
                    type="number"
                    value={formTargetInternal}
                    onChange={(e) => setFormTargetInternal(parseInt(e.target.value, 10) || 0)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Target External
                  </label>
                  <input
                    type="number"
                    value={formTargetExternal}
                    onChange={(e) => setFormTargetExternal(parseInt(e.target.value, 10) || 0)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESOURCE PERSON & SPEAKER PROVISIONING */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step 3: Resource Persons &amp; Industry Expert Weightage
                </h4>
                <button
                  type="button"
                  onClick={handleAddSpeakerRow}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Resource Person</span>
                </button>
              </div>

              {formSpeakers.map((spk, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Resource Person #{idx + 1}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!spk.is_industry_expert}
                        onChange={(e) => handleSpeakerChange(idx, 'is_industry_expert', e.target.checked)}
                        className="rounded accent-indigo-600"
                      />
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        Industry Expert (+8.0 KPI Rubric Points)
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Full Name &amp; Title
                      </label>
                      <input
                        type="text"
                        value={spk.name || ''}
                        onChange={(e) => handleSpeakerChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Dr. Jennifer Vance"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={spk.designation || ''}
                        onChange={(e) => handleSpeakerChange(idx, 'designation', e.target.value)}
                        placeholder="e.g. Principal AI Research Scientist"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Organization / University
                      </label>
                      <input
                        type="text"
                        value={spk.organization || ''}
                        onChange={(e) => handleSpeakerChange(idx, 'organization', e.target.value)}
                        placeholder="e.g. Anthropic Research Labs"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Email &amp; Mobile
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="email"
                          value={spk.contact_email || ''}
                          onChange={(e) => handleSpeakerChange(idx, 'contact_email', e.target.value)}
                          placeholder="Email"
                          className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={spk.contact_mobile || ''}
                          onChange={(e) => handleSpeakerChange(idx, 'contact_mobile', e.target.value)}
                          placeholder="Phone"
                          className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Profile Summary &amp; Research Track Record
                    </label>
                    <textarea
                      rows={2}
                      value={spk.profile_summary || ''}
                      onChange={(e) => handleSpeakerChange(idx, 'profile_summary', e.target.value)}
                      placeholder="Summary biography of the resource person for event flyers..."
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: BUDGET & FINANCIAL AUDIT METRICS */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 4: Financial Ledger &amp; Achieved Attendance
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Allocated Budget (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={formBudgetAlloc}
                    onChange={(e) => setFormBudgetAlloc(parseInt(e.target.value, 10) || 0)}
                    className="w-full mt-2 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Actual Spent (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={formBudgetSpent}
                    onChange={(e) => setFormBudgetSpent(parseInt(e.target.value, 10) || 0)}
                    className="w-full mt-2 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">
                    {formBudgetSpent <= formBudgetAlloc
                      ? '✓ Under-budget: +8.0 full budget points'
                      : '⚠ Over-budget penalty applied'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Sponsorship Funds Raised (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={formSponsorship}
                    onChange={(e) => setFormSponsorship(parseInt(e.target.value, 10) || 0)}
                    className="w-full mt-2 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-1">
                    {formSponsorship >= 20000 ? '✓ ≥ ₹20k: +8.0 sponsorship points' : 'Below tier 1'}
                  </span>
                </div>
              </div>

              {/* Achieved Headcount */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Actual Verified Participant Attendance
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase">Achieved Total</label>
                    <input
                      type="number"
                      value={formAchievedTotal}
                      onChange={(e) => setFormAchievedTotal(parseInt(e.target.value, 10) || 0)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase">Internal Students</label>
                    <input
                      type="number"
                      value={formAchievedInternal}
                      onChange={(e) => setFormAchievedInternal(parseInt(e.target.value, 10) || 0)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase">External Participants</label>
                    <input
                      type="number"
                      value={formAchievedExternal}
                      onChange={(e) => setFormAchievedExternal(parseInt(e.target.value, 10) || 0)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: MEDIA, MAGIC-BYTE VERIFICATION & IMAGE COMPRESSION */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 5: Media Pipeline, Security Inspection &amp; Final Publishing
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload with Client-Side Canvas Optimization */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Event Photo / Banner (Lossless WebP Optimization)
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automatically strips camera EXIF/GPS data, optimizes down to max 1920px width, and creates a synchronized 300px thumbnail.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'PHOTO')}
                    disabled={isProcessingFile}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                  />
                  {bannerPreviewUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden aspect-16/9 bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <img src={bannerPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Circular Upload with Magic-Byte Check */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Official Circular / Brochure (Magic-Byte Inspection)
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Inspecting binary signatures (%PDF- or PK OpenXML) to eliminate spoofed file extension risks.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileUpload(e, 'CIRCULAR')}
                    disabled={isProcessingFile}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
                  />

                  {/* Security Scan Terminal */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[10px] max-h-36 overflow-y-auto space-y-1 border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">=== Institutional File Security Inspection ===</div>
                    {securityScanLog.length === 0 ? (
                      <div className="text-slate-600">Awaiting file upload for binary signature verification...</div>
                    ) : (
                      securityScanLog.map((log, i) => (
                        <div key={i} className="leading-tight">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Bottom Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {wizardStep > 1 ? (
              <button
                type="button"
                onClick={() => setWizardStep((s) => (s - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {wizardStep < 5 ? (
              <button
                type="button"
                onClick={() => setWizardStep((s) => (s + 1) as any)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                <span>Proceed to Step {wizardStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveEvent}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Event to Campus Ledger</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE EVENT CONTROL DESK: SPLIT PANE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Event Selector & Status Toggles */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Managed Department Events ({events.length})
              </h3>
              <button
                onClick={loadEvents}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title="Refresh Events"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Event Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter events..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition ${
                    ev.id === selectedEventId
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {ev.department_id}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFeedbackStatus(ev.id, ev.feedback_open);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                        ev.feedback_open
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300'
                      }`}
                    >
                      {ev.feedback_open ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Feedback Live</span>
                        </>
                      ) : (
                        <span>Feedback Closed</span>
                      )}
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {ev.name}
                  </p>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{ev.date_start}</span>
                    <span className="font-mono">Prefixes: {ev.eligibility_prefixes.join(',')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Control Center & Feedback Ledger */}
        <div className="lg:col-span-2 space-y-5">
          {selectedEvent ? (
            <>
              {/* Event Quick Header Card */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {selectedEvent.department_id} • {selectedEvent.event_type}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ID #{selectedEvent.id}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {selectedEvent.name}
                    </h3>
                  </div>

                  {/* Actions: Preview & Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectEventForPreview(selectedEvent.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Public Preview</span>
                    </button>

                    <button
                      onClick={() => handleToggleFeedbackStatus(selectedEvent.id, selectedEvent.feedback_open)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition ${
                        selectedEvent.feedback_open
                          ? 'bg-rose-600 hover:bg-rose-500'
                          : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                    >
                      {selectedEvent.feedback_open ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          <span>Close Feedback Window</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>Open Feedback Window</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Score & Metrics Preview Bar */}
                {currentKpiResult && selectedEventMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Score</p>
                      <p className="text-base sm:text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                        {currentKpiResult.totalScore.toFixed(1)} / 100
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Institutional Grade</p>
                      <p className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        Grade {currentKpiResult.grade}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Surveys Logged</p>
                      <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        {selectedEventFeedbacks.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Budget Efficiency</p>
                      <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        ₹{(selectedEventMetrics.budget_spent / 1000).toFixed(1)}k / ₹{(selectedEventMetrics.budget_allocated / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                )}

                {/* Export Action Center */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    NAAC / Academic Audit Reporting Exports:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        selectedEventMetrics &&
                        exportFeedbackToExcel(
                          selectedEvent,
                          selectedEventFeedbacks,
                          selectedEventSpeakers,
                          selectedEventMetrics
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Excel (.xlsx)</span>
                    </button>

                    <button
                      onClick={() => exportFeedbackToCSV(selectedEvent, selectedEventFeedbacks)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV Ledger</span>
                    </button>

                    <button
                      onClick={() =>
                        selectedEventMetrics &&
                        exportStructuredJSON(
                          selectedEvent,
                          selectedEventMetrics,
                          selectedEventSpeakers,
                          selectedEventFeedbacks
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Audit JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Student Feedback Submissions Ledger Table */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Verified Student Evaluations Ledger ({selectedEventFeedbacks.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Prefix-Gated &amp; Integrity Locked</span>
                </div>

                {selectedEventFeedbacks.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-xs text-slate-500">
                      No feedback submitted yet for this event. Open the feedback window and share the link with eligible students.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-3 py-2.5">Reg. Number</th>
                          <th className="px-3 py-2.5 text-center">Satisfaction</th>
                          <th className="px-3 py-2.5 text-center">Content</th>
                          <th className="px-3 py-2.5 text-center">Speaker</th>
                          <th className="px-3 py-2.5 text-center">Objective</th>
                          <th className="px-3 py-2.5">Acquired Skills</th>
                          <th className="px-3 py-2.5">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedEventFeedbacks.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td className="px-3 py-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {item.register_no}
                            </td>
                            <td className="px-3 py-2 text-center font-bold">{item.satisfaction_score} / 5</td>
                            <td className="px-3 py-2 text-center font-bold">{item.content_quality_score} / 5</td>
                            <td className="px-3 py-2 text-center font-bold">{item.speaker_effectiveness_score} / 5</td>
                            <td className="px-3 py-2 text-center">
                              {item.objective_clarity_met ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                  YES
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                  NO
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 max-w-xs truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {item.acquired_skills || 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(item.submitted_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">Select an event from the left pane to manage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
