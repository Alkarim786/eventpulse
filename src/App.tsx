import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Building2,
  Calendar,
  Layers,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  FileText,
  UserCheck,
  LogOut,
  Lock,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { HeroCarousel } from './components/HeroCarousel';
import { EventFilters, FilterState } from './components/EventFilters';
import { EventCard3D } from './components/EventCard3D';
import { EventDetailModal } from './components/EventDetailModal';
import { StudentFeedbackModal } from './components/StudentFeedbackModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { StaffManagementStudio } from './components/StaffManagementStudio';
import { HeadAdminDashboard } from './components/HeadAdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { LoginPage } from './components/LoginPage';
import { db } from './services/db';
import { authService, AuthSession } from './services/auth';
import { CampusEvent, EventMedia, EventSpeaker } from './types';

export function App() {
  const [events, setEvents] = useState<CampusEvent[]>([]);

  // Authenticated active session (null on initial load so login page is displayed)
  const [activeSession, setActiveSession] = useState<AuthSession | null>(() => authService.getActiveSession());
  const [roleView, setRoleView] = useState<'main' | 'events'>('main');
  const [guestPublicView, setGuestPublicView] = useState<boolean>(false);

  // Filter State for Campus Events View
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedDepartments: [],
    selectedTypes: [],
    selectedModes: [],
    statusFilter: 'ALL',
  });

  // Modal Dialog States
  const [selectedDetailEventId, setSelectedDetailEventId] = useState<number | null>(null);
  const [selectedFeedbackEventId, setSelectedFeedbackEventId] = useState<number | null>(null);
  const [feedbackInitialRoll, setFeedbackInitialRoll] = useState<string | undefined>(undefined);

  // Lightbox & Doc Viewer States
  const [lightboxPhotoData, setLightboxPhotoData] = useState<{
    currentUrl: string;
    allUrls: string[];
    startIndex: number;
  } | null>(null);

  const [activeDocMedia, setActiveDocMedia] = useState<EventMedia | null>(null);

  // Load events
  const refreshEvents = () => {
    setEvents(db.getAllEvents());
  };

  useEffect(() => {
    refreshEvents();
    const unsubscribe = db.subscribe(() => {
      refreshEvents();
    });
    return unsubscribe;
  }, []);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Search query across title, description, coordinator, objective, prefixes
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = ev.name.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesCoord = ev.coordinator_name.toLowerCase().includes(q);
        const matchesDept = ev.department_id.toLowerCase().includes(q);
        const matchesPrefix = ev.eligibility_prefixes.some((p) => p.toLowerCase().includes(q));
        const matchesTopics = (ev.agenda_topics || []).some((t) => t.toLowerCase().includes(q));

        if (!matchesName && !matchesDesc && !matchesCoord && !matchesDept && !matchesPrefix && !matchesTopics) {
          return false;
        }
      }

      // 2. Department filter
      if (filters.selectedDepartments.length > 0) {
        if (!filters.selectedDepartments.includes(ev.department_id)) {
          return false;
        }
      }

      // 3. Classification type
      if (filters.selectedTypes.length > 0) {
        if (!filters.selectedTypes.includes(ev.event_type)) {
          return false;
        }
      }

      // 4. Delivery mode
      if (filters.selectedModes.length > 0) {
        if (!filters.selectedModes.includes(ev.venue_mode)) {
          return false;
        }
      }

      // 5. Status filter
      if (filters.statusFilter === 'FEEDBACK_OPEN' && !ev.feedback_open) return false;
      const isCompleted = ev.status === 'COMPLETED' || new Date(ev.date_end).getTime() < new Date().getTime();
      if (filters.statusFilter === 'UPCOMING' && isCompleted) return false;
      if (filters.statusFilter === 'COMPLETED' && !isCompleted) return false;

      return true;
    });
  }, [events, filters]);

  // Selected event objects for modals
  const detailEvent = events.find((e: CampusEvent) => e.id === selectedDetailEventId);
  const detailSpeakers = selectedDetailEventId ? db.getSpeakersByEvent(selectedDetailEventId) : [];
  const detailMedia = selectedDetailEventId ? db.getMediaByEvent(selectedDetailEventId) : [];
  const feedbackEvent = events.find((e: CampusEvent) => e.id === selectedFeedbackEventId);

  // Quick action: Download or view circular
  const handleDownloadCircular = (eventId: number) => {
    const media = db.getMediaByEvent(eventId);
    const circular = media.find((m: EventMedia) => m.media_type === 'CIRCULAR' || m.media_type === 'REPORT');
    if (circular) {
      setActiveDocMedia(circular);
    } else {
      const fallbackCircular: EventMedia = {
        id: `mock-cir-${eventId}`,
        event_id: eventId,
        media_type: 'CIRCULAR',
        original_filename: `Official_Circular_Event_${eventId}_Signed.pdf`,
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        storage_path: `/storage/campus_events/2025-26/CIRCULARS/${eventId}_Official.pdf`,
        file_size_bytes: 2450000,
        mime_type: 'application/pdf',
        uploaded_at: new Date().toISOString(),
        verified_magic_bytes: true,
      };
      setActiveDocMedia(fallbackCircular);
    }
  };

  const handleLogout = () => {
    authService.clearActiveSession();
    setActiveSession(null);
    setGuestPublicView(false);
    setRoleView('main');
  };

  // IF NOT LOGGED IN & NOT IN GUEST MODE: Show dedicated Role-Based Login Page directly at the beginning!
  if (!activeSession && !guestPublicView) {
    return (
      <LoginPage
        onLoginSuccess={(session) => {
          setActiveSession(session);
          setRoleView('main');
          setGuestPublicView(false);
        }}
        onExplorePublicEvents={() => {
          setGuestPublicView(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Header & Role Navigation Bar */}
      <HeaderNavbar
        activeSession={activeSession}
        currentRoleView={roleView}
        onChangeRoleView={(view) => setRoleView(view as 'main' | 'events')}
        onLogout={handleLogout}
        onSelectEvent={(id) => setSelectedDetailEventId(id)}
        onOpenLoginPage={() => {
          setGuestPublicView(false);
          setActiveSession(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* ========================================================================= */}
        {/* ROLE LANDING 1: STUDENT SCHOLAR LANDING                                  */}
        {/* ========================================================================= */}
        {activeSession?.role === 'STUDENT' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {roleView === 'main' ? (
              <StudentDashboard
                session={activeSession}
                events={events}
                onOpenFeedback={(eventId, rollNo) => {
                  setFeedbackInitialRoll(rollNo);
                  setSelectedFeedbackEventId(eventId);
                }}
                onViewEvent={(id) => setSelectedDetailEventId(id)}
                onLogout={handleLogout}
              />
            ) : (
              /* Student secondary view: Campus Events & Circulars */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <span>Campus Events &amp; Official Circulars</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Explore academic workshops, guest lectures, and symposia matching your batch ({activeSession.designationOrBatch}).
                    </p>
                  </div>
                  <button
                    onClick={() => setRoleView('main')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    Back to My Surveys &amp; History
                  </button>
                </div>

                <EventFilters filters={filters} onChange={setFilters} totalResults={filteredEvents.length} />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((ev) => {
                    const spk = db.getSpeakersByEvent(ev.id)[0];
                    return (
                      <EventCard3D
                        key={ev.id}
                        event={ev}
                        speaker={spk}
                        onViewDetails={(id) => setSelectedDetailEventId(id)}
                        onOpenFeedback={(id) => {
                          setFeedbackInitialRoll(activeSession.identifier);
                          setSelectedFeedbackEventId(id);
                        }}
                        onDownloadCircular={handleDownloadCircular}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE LANDING 2: STAFF COORDINATOR MANAGEMENT STUDIO LANDING              */}
        {/* ========================================================================= */}
        {activeSession?.role === 'STAFF_COORDINATOR' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {roleView === 'main' ? (
              <div>
                {/* Active Staff Coordinator Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 mb-6 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        activeSession.avatarUrl ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={activeSession.name}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/50"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          COORDINATOR SESSION
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {activeSession.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {activeSession.designationOrBatch} • Department of {activeSession.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setRoleView('events')}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition"
                    >
                      Events Directory
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold transition flex items-center gap-1.5"
                      title="Switch role / sign out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Role</span>
                    </button>
                  </div>
                </div>

                <StaffManagementStudio
                  onSelectEventForPreview={(id) => {
                    setSelectedDetailEventId(id);
                  }}
                />
              </div>
            ) : (
              /* Staff secondary view: Campus Events Directory */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <span>Campus Events &amp; Program Circulars</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Review all department event schedules, speaker sessions, and student registration status.
                    </p>
                  </div>
                  <button
                    onClick={() => setRoleView('main')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    Back to Staff Studio &amp; Wizard
                  </button>
                </div>

                <EventFilters filters={filters} onChange={setFilters} totalResults={filteredEvents.length} />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((ev) => {
                    const spk = db.getSpeakersByEvent(ev.id)[0];
                    return (
                      <EventCard3D
                        key={ev.id}
                        event={ev}
                        speaker={spk}
                        onViewDetails={(id) => setSelectedDetailEventId(id)}
                        onOpenFeedback={(id) => {
                          setFeedbackInitialRoll(undefined);
                          setSelectedFeedbackEventId(id);
                        }}
                        onDownloadCircular={handleDownloadCircular}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE LANDING 3: HEAD ADMIN EXECUTIVE IQAC DASHBOARD LANDING             */}
        {/* ========================================================================= */}
        {activeSession?.role === 'HEAD_ADMIN' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {roleView === 'main' ? (
              <div>
                {/* Active Head Admin Session Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 text-white border border-indigo-700/50 mb-6 shadow-md">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        activeSession.avatarUrl ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={activeSession.name}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-400/60"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                          EXECUTIVE GOVERNANCE
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {activeSession.name}
                        </h3>
                      </div>
                      <p className="text-xs text-indigo-200/90 mt-0.5">
                        {activeSession.designationOrBatch} • IQAC Directorate &amp; NAAC Steering Committee
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setRoleView('events')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition"
                    >
                      All Events &amp; Circulars
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-500/40 text-xs font-semibold transition flex items-center gap-1.5"
                      title="Switch role / sign out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Role</span>
                    </button>
                  </div>
                </div>

                <HeadAdminDashboard
                  onSelectEventForPreview={(id) => {
                    setSelectedDetailEventId(id);
                  }}
                />
              </div>
            ) : (
              /* Head Admin secondary view: Institutional Events & Circular Audits */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-violet-500" />
                      <span>Institutional Event Registry &amp; Compliance Audits</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Cross-departmental event audits, uploaded signed circular verification, and feedback status.
                    </p>
                  </div>
                  <button
                    onClick={() => setRoleView('main')}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    Back to Executive IQAC Dashboard
                  </button>
                </div>

                <EventFilters filters={filters} onChange={setFilters} totalResults={filteredEvents.length} />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((ev) => {
                    const spk = db.getSpeakersByEvent(ev.id)[0];
                    return (
                      <EventCard3D
                        key={ev.id}
                        event={ev}
                        speaker={spk}
                        onViewDetails={(id) => setSelectedDetailEventId(id)}
                        onOpenFeedback={(id) => {
                          setFeedbackInitialRoll(undefined);
                          setSelectedFeedbackEventId(id);
                        }}
                        onDownloadCircular={handleDownloadCircular}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* GUEST VIEW: PUBLIC NOTICES & CALENDAR (WHEN USER BROWSES AS GUEST)       */}
        {/* ========================================================================= */}
        {guestPublicView && !activeSession && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Guest Banner Prompting Role Sign In */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-indigo-600 text-white">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    You are browsing campus events as a Visitor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sign in with your institutional role (Student Scholar, Staff Coordinator, or Head Admin) to access personalized features.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGuestPublicView(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Role Login Page</span>
              </button>
            </div>

            {/* Dynamic Hero Banner Carousel */}
            <HeroCarousel
              events={events}
              onViewEvent={(id) => setSelectedDetailEventId(id)}
              onOpenFeedback={(id) => {
                // Return to login page to evaluate
                setGuestPublicView(false);
              }}
              onViewCircular={handleDownloadCircular}
            />

            {/* Faceted Filter & Search Console */}
            <EventFilters
              filters={filters}
              onChange={setFilters}
              totalResults={filteredEvents.length}
            />

            {/* Event Directory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const spk = db.getSpeakersByEvent(ev.id)[0];
                return (
                  <EventCard3D
                    key={ev.id}
                    event={ev}
                    speaker={spk}
                    onViewDetails={(id) => setSelectedDetailEventId(id)}
                    onOpenFeedback={() => {
                      setGuestPublicView(false);
                    }}
                    onDownloadCircular={handleDownloadCircular}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: EVENT DETAIL EXPLORER MODAL */}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          speakers={detailSpeakers}
          media={detailMedia}
          onClose={() => setSelectedDetailEventId(null)}
          onOpenFeedback={(eventId) => {
            setSelectedDetailEventId(null);
            setFeedbackInitialRoll(activeSession?.identifier);
            setSelectedFeedbackEventId(eventId);
          }}
          onOpenPhotoLightbox={(url, allUrls, idx) => {
            setLightboxPhotoData({ currentUrl: url, allUrls, startIndex: idx });
          }}
          onOpenDocViewer={(media) => setActiveDocMedia(media)}
        />
      )}

      {/* MODAL 2: ACCESS-GATED STUDENT FEEDBACK SURVEY */}
      {feedbackEvent && (
        <StudentFeedbackModal
          event={feedbackEvent}
          initialRollNo={feedbackInitialRoll || activeSession?.identifier}
          onClose={() => {
            setSelectedFeedbackEventId(null);
            setFeedbackInitialRoll(undefined);
          }}
          onSuccess={() => {
            refreshEvents();
          }}
        />
      )}

      {/* MODAL 3: FULLSCREEN PHOTO LIGHTBOX OR DOCUMENT VIEWER */}
      {(lightboxPhotoData || activeDocMedia) && (
        <MediaViewerModal
          photoData={lightboxPhotoData || undefined}
          docData={activeDocMedia || undefined}
          onClose={() => {
            setLightboxPhotoData(null);
            setActiveDocMedia(null);
          }}
        />
      )}

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Autonomous Engineering &amp; Technology Institute
            </span>
            <span>•</span>
            <span>IQAC Event &amp; Quality Automation System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              NIRF &amp; NAAC SSR Aligned
            </span>
            <span>Prefix-Gated Authorization</span>
            <span>Version 2.5.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
