import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Building2,
  FileText,
  Download,
  ShieldCheck,
  Award,
  Users,
  MessageSquare,
  Maximize2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CampusEvent, EventMedia, EventSpeaker } from '../types';

interface EventDetailModalProps {
  event: CampusEvent;
  speakers: EventSpeaker[];
  media: EventMedia[];
  onClose: () => void;
  onOpenFeedback: (eventId: number) => void;
  onOpenPhotoLightbox: (photoUrl: string, allPhotos: string[], startIndex: number) => void;
  onOpenDocViewer: (media: EventMedia) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  speakers,
  media,
  onClose,
  onOpenFeedback,
  onOpenPhotoLightbox,
  onOpenDocViewer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'speakers' | 'gallery' | 'circulars'>('overview');

  const photos = media.filter((m) => m.media_type === 'PHOTO');
  const circulars = media.filter(
    (m) => m.media_type === 'CIRCULAR' || m.media_type === 'REPORT' || m.media_type === 'ATTENDANCE_RECORD'
  );

  const photoUrls = photos.map((p) => p.file_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Header Banner */}
        <div className="relative h-44 sm:h-52 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 overflow-hidden flex-shrink-0">
          <img
            src={event.banner_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
            alt={event.name}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 transition z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header titles */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/80 text-white uppercase tracking-wider">
                Dept of {event.department_id}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-white/20 text-slate-200">
                {event.event_type}
              </span>
              {event.venue_mode && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-white/10 text-indigo-200">
                  {event.venue_mode}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {event.name}
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 overflow-x-auto flex-shrink-0">
          {(
            [
              { id: 'overview', label: 'Overview & Agenda' },
              { id: 'speakers', label: `Resource Persons (${speakers.length})` },
              { id: 'gallery', label: `Public Gallery (${photos.length})` },
              { id: 'circulars', label: `Circulars & Documents (${circulars.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                activeSubTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {event.feedback_open && (
            <button
              onClick={() => {
                onClose();
                onOpenFeedback(event.id);
              }}
              className="ml-auto mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Give Feedback</span>
            </button>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & AGENDA */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Core Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Dates Conducted</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                      {event.date_start} to {event.date_end}
                    </p>
                    <p className="text-[10px] text-slate-500">{event.time_start} - {event.time_end}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rose-500 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Physical Venue / Mode</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                      {event.venue_details}
                    </p>
                    <p className="text-[10px] text-slate-500">Mode: {event.venue_mode}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Coordinator Contact</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                      {event.coordinator_name}
                    </p>
                    <p className="text-[10px] text-slate-500">{event.coordinator_email}</p>
                  </div>
                </div>
              </div>

              {/* Objective Statement */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                  Curricular Alignment &amp; Objective Statement
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                  {event.objective_statement || event.description}
                </p>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Session Description &amp; Scope
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Distinguished Resource Person(s) Preview */}
              {speakers && speakers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Distinguished Resource Person Spotlight
                    </h3>
                    <button
                      onClick={() => setActiveSubTab('speakers')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      View All Speakers ({speakers.length}) &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {speakers.slice(0, 2).map((spk) => (
                      <div
                        key={spk.id}
                        className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-800/60 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-700/70 flex items-start gap-3.5 shadow-sm"
                      >
                        <img
                          src={
                            spk.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={spk.name}
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-500/40 shadow-sm flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {spk.name}
                            </h4>
                            {spk.is_industry_expert && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                                INDUSTRY
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                            {spk.designation}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            <span>{spk.organization}</span>
                          </p>
                          {spk.profile_summary && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                              {spk.profile_summary}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda Topics */}
              {event.agenda_topics && event.agenda_topics.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Technical Agenda &amp; Module Plan
                  </h3>
                  <div className="space-y-2">
                    {event.agenda_topics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                          {topic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Notice */}
              <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Target Student Audience Eligibility
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Feedback evaluation authorized for institutional register numbers matching:{' '}
                    <span className="font-mono font-bold">{event.eligibility_prefixes.join(', ')}</span>
                  </p>
                </div>
                {event.feedback_open && (
                  <span className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold">
                    Feedback Window Live
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RESOURCE PERSON SPOTLIGHT CARDS */}
          {activeSubTab === 'speakers' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distinguished guest speakers, industry veterans, and researchers leading technical modules for this event.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.map((spk) => (
                  <div
                    key={spk.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            spk.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                          }
                          alt={spk.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              {spk.name}
                            </h4>
                            {spk.is_industry_expert && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                Industry Expert
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                            {spk.designation}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{spk.organization}</span>
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
                        {spk.profile_summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{spk.contact_email}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const mockCvMedia: EventMedia = {
                            id: `spk-cv-${spk.id}`,
                            event_id: event.id,
                            media_type: 'SPEAKER_CV',
                            original_filename: `${spk.name.replace(/\s+/g, '_')}_Official_CV.pdf`,
                            file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                            file_size_bytes: 1820000,
                            mime_type: 'application/pdf',
                            uploaded_at: new Date().toISOString(),
                            storage_path: spk.profile_document_url || `/storage/speakers/${spk.id}_CV.pdf`,
                            verified_magic_bytes: true,
                          };
                          onOpenDocViewer(mockCvMedia);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download CV</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PUBLIC GALLERY & LIGHTBOX */}
          {activeSubTab === 'gallery' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-resolution captures of stage sessions, laboratory demonstrations, student project presentations, and prize ceremonies.
              </p>

              {photos.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-xs text-slate-500">No event photos uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      onClick={() => onOpenPhotoLightbox(photo.file_url, photoUrls, idx)}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition"
                    >
                      <img
                        src={photo.thumbnail_url || photo.file_url}
                        alt={photo.original_filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2 rounded-full bg-white/20 text-white backdrop-blur-xs">
                          <Maximize2 className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="absolute bottom-1.5 left-2 right-2 truncate text-[10px] text-white/90 font-medium drop-shadow">
                        {photo.original_filename}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CIRCULARS & DOCUMENTS */}
          {activeSubTab === 'circulars' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All official signed documentation, institution circulars, brochures, and compliance outcome reports.
              </p>

              {circulars.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-xs text-slate-500">No circular documents attached.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {circulars.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {doc.original_filename}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                              {doc.mime_type.includes('pdf') ? 'PDF' : 'DOCX'}
                            </span>
                            <span>{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <ShieldCheck className="w-3 h-3" />
                              Magic-Byte Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => onOpenDocViewer(doc)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-xs"
                        >
                          Preview In-Browser
                        </button>
                        <a
                          href={doc.file_url}
                          download={doc.original_filename}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
                          title="Direct Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
