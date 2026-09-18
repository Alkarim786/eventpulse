import React from 'react';
import { Search, Filter, X, Check, RotateCcw } from 'lucide-react';
import { EventType, VenueMode } from '../types';

export interface FilterState {
  searchQuery: string;
  selectedDepartments: string[];
  selectedTypes: EventType[];
  selectedModes: VenueMode[];
  statusFilter: 'ALL' | 'FEEDBACK_OPEN' | 'UPCOMING' | 'COMPLETED';
}

interface EventFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

const DEPARTMENTS = [
  { id: 'CSE', label: 'Computer Science (CSE)' },
  { id: 'IT', label: 'Information Tech (IT)' },
  { id: 'ECE', label: 'Electronics & Comm (ECE)' },
  { id: 'EEE', label: 'Electrical & Electronics (EEE)' },
  { id: 'MECH', label: 'Mechanical (MECH)' },
  { id: 'CIVIL', label: 'Civil Engineering' },
  { id: 'MBA', label: 'Management Studies (MBA)' },
  { id: 'S&H', label: 'Science & Humanities' },
];

const CLASSIFICATIONS: { id: EventType; label: string }[] = [
  { id: 'CONFERENCE', label: 'Conference' },
  { id: 'WORKSHOP', label: 'Workshop' },
  { id: 'FDP', label: 'FDP' },
  { id: 'HACKATHON', label: 'Hackathon' },
  { id: 'GUEST_LECTURE', label: 'Guest Lecture' },
  { id: 'SEMINAR', label: 'Seminar' },
  { id: 'IV', label: 'Industrial Visit' },
];

const MODES: { id: VenueMode; label: string }[] = [
  { id: 'OFFLINE', label: 'Physical / Offline' },
  { id: 'ONLINE', label: 'Virtual / Online' },
  { id: 'HYBRID', label: 'Hybrid Delivery' },
];

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
  const toggleDept = (deptId: string) => {
    const next = filters.selectedDepartments.includes(deptId)
      ? filters.selectedDepartments.filter((d) => d !== deptId)
      : [...filters.selectedDepartments, deptId];
    onChange({ ...filters, selectedDepartments: next });
  };

  const toggleType = (typeId: EventType) => {
    const next = filters.selectedTypes.includes(typeId)
      ? filters.selectedTypes.filter((t) => t !== typeId)
      : [...filters.selectedTypes, typeId];
    onChange({ ...filters, selectedTypes: next });
  };

  const toggleMode = (modeId: VenueMode) => {
    const next = filters.selectedModes.includes(modeId)
      ? filters.selectedModes.filter((m) => m !== modeId)
      : [...filters.selectedModes, modeId];
    onChange({ ...filters, selectedModes: next });
  };

  const resetAll = () => {
    onChange({
      searchQuery: '',
      selectedDepartments: [],
      selectedTypes: [],
      selectedModes: [],
      statusFilter: 'ALL',
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.selectedDepartments.length > 0 ||
    filters.selectedTypes.length > 0 ||
    filters.selectedModes.length > 0 ||
    filters.statusFilter !== 'ALL';

  return (
    <div className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
      {/* Top Search Bar & Quick Status Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Full-text search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="input-global-event-search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search events, speakers, keywords, topics, or eligibility (e.g. 23CS, AI, BIM)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Mode Segmented Pill */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start md:self-auto overflow-x-auto max-w-full">
          {(
            [
              { key: 'ALL', label: 'All Events' },
              { key: 'FEEDBACK_OPEN', label: 'Feedback Open' },
              { key: 'UPCOMING', label: 'Upcoming' },
              { key: 'COMPLETED', label: 'Completed' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => onChange({ ...filters, statusFilter: item.key })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filters.statusFilter === item.key
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Select Faceted Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Departments */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Organizing Department
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {DEPARTMENTS.map((dept) => {
              const isSelected = filters.selectedDepartments.includes(dept.id);
              return (
                <button
                  key={dept.id}
                  onClick={() => toggleDept(dept.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{dept.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Classification */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Event Classification
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {CLASSIFICATIONS.map((c) => {
              const isSelected = filters.selectedTypes.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleType(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Delivery Mode & Reset */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Delivery Mode
            </label>
            {hasActiveFilters && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => {
              const isSelected = filters.selectedModes.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMode(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-800 dark:text-white">{totalResults}</strong> event{totalResults === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
