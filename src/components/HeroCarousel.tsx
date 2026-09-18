import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Award,
  Building2,
  Briefcase,
} from 'lucide-react';
import { CampusEvent } from '../types';
import { db } from '../services/db';

interface HeroCarouselProps {
  events: CampusEvent[];
  onViewEvent: (id: number) => void;
  onOpenFeedback: (id: number) => void;
  onViewCircular: (id: number) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  events,
  onViewEvent,
  onOpenFeedback,
  onViewCircular,
}) => {
  const featured = events.filter((e) => e.featured_banner);
  const displayEvents = featured.length > 0 ? featured : events.slice(0, 3);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (displayEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayEvents.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayEvents.length]);

  if (displayEvents.length === 0) return null;

  const current = displayEvents[currentIndex];
  const speakers = current ? db.getSpeakersByEvent(current.id) : [];
  const primarySpeaker = speakers[0];
  const otherSpeakersCount = speakers.length - 1;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayEvents.length) % displayEvents.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayEvents.length);
  };

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-900 group">
      {/* Background Graphic & Cover Image with Gradient Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.banner_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
          alt={current.name}
          className="w-full h-full object-cover object-center opacity-30 transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-indigo-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 min-h-[360px] sm:min-h-[420px] flex flex-col justify-between">
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-indigo-600/80 text-white border border-indigo-400/40 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              FEATURED INSTITUTIONAL SYMPOSIUM
            </span>

            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/20 backdrop-blur-md">
              Dept of {current.department_id}
            </span>

            {current.venue_mode && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-900/60 text-indigo-200 border border-indigo-500/30">
                {current.venue_mode} MODE
              </span>
            )}
          </div>

          {current.feedback_open && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold glow-ring-green">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              FEEDBACK OPEN FOR BATCHES: {current.eligibility_prefixes.join(', ')}
            </div>
          )}
        </div>

        {/* Main Event Details and Resource Person Spotlight */}
        <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Event Details (Col 7 or 8) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {current.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 line-clamp-2 leading-relaxed font-normal">
              {current.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>
                  {current.date_start} {current.date_end !== current.date_start ? `to ${current.date_end}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span className="line-clamp-1">{current.venue_details}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Coord: {current.coordinator_name}</span>
              </div>
            </div>
          </div>

          {/* Right: Distinguished Resource Person Spotlight Card */}
          {primarySpeaker && (
            <div className="lg:col-span-5 xl:col-span-4">
              <div
                onClick={() => onViewEvent(current.id)}
                className="group/speaker cursor-pointer relative p-4 sm:p-5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-indigo-400/60 shadow-2xl transition-all duration-300 hover:-translate-y-1"
                title="Click to view speaker profile & event agenda"
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                    <Award className="w-3 h-3 text-amber-300" />
                    RESOURCE PERSON SPOTLIGHT
                  </span>
                  {primarySpeaker.is_industry_expert && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      <Briefcase className="w-3 h-3" />
                      INDUSTRY EXPERT
                    </span>
                  )}
                </div>

                {/* Speaker Photo & Identity */}
                <div className="flex items-center gap-3.5">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        primarySpeaker.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={primarySpeaker.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-400/60 group-hover/speaker:ring-indigo-300 shadow-lg transition"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-white group-hover/speaker:text-indigo-200 transition truncate">
                      {primarySpeaker.name}
                    </h4>
                    <p className="text-xs font-semibold text-indigo-300 line-clamp-1 mt-0.5">
                      {primarySpeaker.designation}
                    </p>
                    <p className="text-xs text-slate-300 line-clamp-1 flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      <span>{primarySpeaker.organization}</span>
                    </p>
                  </div>
                </div>

                {/* Speaker Profile Summary Bio */}
                {primarySpeaker.profile_summary && (
                  <p className="mt-3 text-xs text-slate-300/90 line-clamp-2 leading-relaxed bg-black/25 p-2.5 rounded-xl border border-white/5 font-normal">
                    {primarySpeaker.profile_summary}
                  </p>
                )}

                {/* Bottom link & secondary speakers count */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="text-indigo-300 group-hover/speaker:text-indigo-200 font-medium inline-flex items-center gap-1">
                    View profile &amp; agenda <ArrowRight className="w-3 h-3" />
                  </span>
                  {otherSpeakersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 text-[10px] font-bold">
                      +{otherSpeakersCount} more speaker{otherSpeakersCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls and Next/Prev Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onViewEvent(current.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:translate-y-[-1px]"
            >
              <span>View Agenda &amp; Spotlight</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onViewCircular(current.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 font-medium text-xs sm:text-sm border border-white/20 backdrop-blur-md transition"
            >
              <Download className="w-4 h-4 text-indigo-300" />
              <span>Official Circular</span>
            </button>

            {current.feedback_open && (
              <button
                onClick={() => onOpenFeedback(current.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Submit Student Feedback</span>
              </button>
            )}
          </div>

          {/* Carousel Slide Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              {displayEvents.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-indigo-400' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handlePrev}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
