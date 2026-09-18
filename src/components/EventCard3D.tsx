import React, { useRef, useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Download,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { CampusEvent, EventSpeaker } from '../types';

interface EventCard3DProps {
  event: CampusEvent;
  speaker?: EventSpeaker;
  onViewDetails: (id: number) => void;
  onOpenFeedback: (id: number) => void;
  onDownloadCircular: (id: number) => void;
}

export const EventCard3D: React.FC<EventCard3DProps> = ({
  event,
  speaker,
  onViewDetails,
  onOpenFeedback,
  onDownloadCircular,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt: max 8 degrees
    const rX = ((y - centerY) / centerY) * -7;
    const rY = ((x - centerX) / centerX) * 7;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="h-full flex flex-col"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
        }}
        className="relative flex-1 flex flex-col rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/40 overflow-hidden transition-shadow"
      >
        {/* Subtle Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-400" />

        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          {/* Top Status Badges */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  {event.department_id}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {event.event_type}
                </span>
              </div>

              {/* Status Glow Badge */}
              {event.feedback_open ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/40 glow-ring-amber">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Feedback Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Upcoming
                </span>
              )}
            </div>

            {/* Event Title */}
            <h2
              onClick={() => onViewDetails(event.id)}
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
            >
              {event.name}
            </h2>

            {/* Objective Preview */}
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {event.objective_statement || event.description}
            </p>
          </div>

          {/* Center Info Block: Dates & Venue */}
          <div className="my-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span>
                {event.date_start} {event.date_end !== event.date_start ? `to ${event.date_end}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="line-clamp-1">{event.venue_details}</span>
              <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {event.venue_mode}
              </span>
            </div>

            {/* Resource Person Spotlight Snippet */}
            {speaker && (
              <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/70 flex items-center gap-2.5">
                <img
                  src={
                    speaker.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={speaker.name}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-400/40"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    {speaker.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {speaker.organization}
                  </p>
                </div>
                {speaker.is_industry_expert && (
                  <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    INDUSTRY
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom Card Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onDownloadCircular(event.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Download Official Circular"
              >
                <Download className="w-4 h-4" />
              </button>

              {event.feedback_open && (
                <button
                  onClick={() => onOpenFeedback(event.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                </button>
              )}
            </div>

            <button
              onClick={() => onViewDetails(event.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-transform active:scale-98 shadow-xs"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
