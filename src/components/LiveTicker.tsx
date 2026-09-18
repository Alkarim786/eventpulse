import React from 'react';
import { Radio, ChevronRight, Zap } from 'lucide-react';

interface LiveTickerProps {
  onSelectEvent?: (id: number) => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ onSelectEvent }) => {
  const tickerItems = [
    {
      id: 101,
      badge: 'LIVE FEEDBACK',
      text: 'National Symposium on Generative AI (CSE): Student feedback portal is active for batches 23, 24CS, 23IT.',
    },
    {
      id: 102,
      badge: 'REGISTRATION CLOSING',
      text: 'Offensive Security & Cyber Defense Masterclass: Registration closes at 5:00 PM today. Limited lab seats.',
    },
    {
      id: 104,
      badge: 'FLAGSHIP EVENT',
      text: 'National Robotics & Autonomous Edge Hackathon 2026: ₹1.5L Prize Pool announced. Hardware kits ready.',
    },
    {
      id: 106,
      badge: 'NEW MASTERCLASS',
      text: 'Executive Masterclass on VC & Cap Tables: Peak XV Partners guest lecture scheduled for May 15.',
    },
  ];

  return (
    <aside aria-label="Campus event ticker" className="w-full bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white border-b border-indigo-800/40 text-xs overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center px-3 sm:px-6 py-1.5 gap-3">
        <div className="flex items-center gap-1.5 bg-indigo-600/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-indigo-100 flex-shrink-0 border border-indigo-400/30">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">CAMPUS WIRE</span>
          <span className="sm:hidden">LIVE</span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center gap-10 whitespace-nowrap animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused]">
            {tickerItems.concat(tickerItems).map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectEvent && onSelectEvent(item.id)}
                className="inline-flex items-center gap-2 cursor-pointer group hover:text-indigo-300 transition"
              >
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/20">
                  {item.badge}
                </span>
                <span className="text-slate-200 group-hover:underline text-xs">{item.text}</span>
                <ChevronRight className="w-3 h-3 text-indigo-400 opacity-60 group-hover:opacity-100 transition inline" />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-indigo-300/80 pl-2 border-l border-indigo-800/50 flex-shrink-0">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Institutional Server Online</span>
        </div>
      </div>
    </aside>
  );
};
