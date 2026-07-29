import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Filter,
  Check,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  UserCheck,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Shift,
  Employee,
  Position,
  DayOfWeek,
} from '../types';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  isSameDay,
  parseISO,
} from 'date-fns';
import { calculateShiftDurationHours } from '../lib/schedulerEngine';

interface ScheduleCalendarViewProps {
  shifts: Shift[];
  employees: Employee[];
  onOpenAddShift: (date?: string, position?: Position) => void;
  onOpenEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onOpenAutoScheduler: () => void;
  onPublishSchedule: (dates: string[]) => void;
}

const POSITIONS: Position[] = ['Waiter', 'Chef', 'Cashier', 'Barista', 'Kitchen staff'];

const POSITION_STYLES: Record<Position, { card: string; pill: string; labelBg: string }> = {
  Waiter: {
    card: 'bg-blue-50 border-l-4 border-blue-500 text-slate-900',
    pill: 'bg-blue-100 text-blue-800 border-blue-200',
    labelBg: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  Chef: {
    card: 'bg-orange-50 border-l-4 border-orange-500 text-slate-900',
    pill: 'bg-orange-100 text-orange-800 border-orange-200',
    labelBg: 'bg-orange-50 border-orange-200 text-orange-800',
  },
  Cashier: {
    card: 'bg-purple-50 border-l-4 border-purple-500 text-slate-900',
    pill: 'bg-purple-100 text-purple-800 border-purple-200',
    labelBg: 'bg-purple-50 border-purple-200 text-purple-800',
  },
  Barista: {
    card: 'bg-emerald-50 border-l-4 border-emerald-500 text-slate-900',
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    labelBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  'Kitchen staff': {
    card: 'bg-indigo-50 border-l-4 border-indigo-500 text-slate-900',
    pill: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    labelBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  },
};

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  shifts,
  employees,
  onOpenAddShift,
  onOpenEditShift,
  onDeleteShift,
  onOpenAutoScheduler,
  onPublishSchedule,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedPositionFilter, setSelectedPositionFilter] = useState<string>('ALL');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('ALL');
  const [groupBy, setGroupBy] = useState<'POSITION' | 'EMPLOYEE'>('POSITION');

  // Days of current week (Monday to Sunday)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const weekDateStrings = weekDays.map((d) => format(d, 'yyyy-MM-dd'));

  // Navigation handlers
  const handlePrevWeek = () => setCurrentWeekStart(subDays(currentWeekStart, 7));
  const handleNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const handleTodayWeek = () =>
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Filter shifts for current week
  const weekShifts = shifts.filter((s) => weekDateStrings.includes(s.date));

  const filteredShifts = weekShifts.filter((s) => {
    if (selectedPositionFilter !== 'ALL' && s.position !== selectedPositionFilter) {
      return false;
    }
    if (selectedEmployeeFilter !== 'ALL' && s.assignedEmployeeId !== selectedEmployeeFilter) {
      return false;
    }
    return true;
  });

  const unassignedWeekShifts = filteredShifts.filter((s) => !s.assignedEmployeeId);

  // Publish handler
  const handlePublishClick = () => {
    onPublishSchedule(weekDateStrings);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Calendar Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        {/* Left: Week Title & Nav */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              id="btn-prev-week"
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white rounded text-slate-700 transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-today-week"
              onClick={handleTodayWeek}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded transition-colors"
            >
              Current Week
            </button>
            <button
              id="btn-next-week"
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white rounded text-slate-700 transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>
                {format(currentWeekStart, 'MMM d')} -{' '}
                {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {filteredShifts.length} shifts scheduled this week
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-auto-scheduler-calendar"
            onClick={onOpenAutoScheduler}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Generate Schedule</span>
          </button>

          <button
            id="btn-publish-schedule"
            onClick={handlePublishClick}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Publish Schedule</span>
          </button>

          <button
            id="btn-add-shift-calendar"
            onClick={() => onOpenAddShift()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Unassigned Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-3.5 rounded-xl shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Filter:</span>
          </div>

          {/* Position Selector */}
          <select
            id="filter-position-select"
            value={selectedPositionFilter}
            onChange={(e) => setSelectedPositionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
          >
            <option value="ALL">All Positions</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>

          {/* Employee Selector */}
          <select
            id="filter-employee-select"
            value={selectedEmployeeFilter}
            onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
          >
            <option value="ALL">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.position})
              </option>
            ))}
          </select>

          {/* Group By Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setGroupBy('POSITION')}
              className={`px-2.5 py-1 rounded transition-colors ${
                groupBy === 'POSITION' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              By Position
            </button>
            <button
              onClick={() => setGroupBy('EMPLOYEE')}
              className={`px-2.5 py-1 rounded transition-colors ${
                groupBy === 'EMPLOYEE' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              By Employee
            </button>
          </div>
        </div>

        {/* Unassigned Warning Indicator */}
        {unassignedWeekShifts.length > 0 && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 text-xs px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>
              <strong>{unassignedWeekShifts.length} unfilled shifts</strong>. Click Auto-Generate to auto-assign.
            </span>
          </div>
        )}
      </div>

      {/* Main Weekly Calendar Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            {/* Header: Days of Week */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase">
                <th className="p-3 text-left w-44 border-r border-slate-200 sticky left-0 bg-slate-50 z-10">
                  {groupBy === 'POSITION' ? 'Position' : 'Employee'}
                </th>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isToday = isSameDay(day, new Date());

                  return (
                    <th
                      key={dateStr}
                      className={`p-3 text-center border-r border-slate-200 ${
                        isToday ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-500'
                      }`}
                    >
                      <div>
                        {format(day, 'EEE')}{' '}
                        <span className="text-slate-900 font-bold">{format(day, 'd')}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body Rows */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {groupBy === 'POSITION' ? (
                // Grouped by Position
                POSITIONS.filter(
                  (pos) => selectedPositionFilter === 'ALL' || selectedPositionFilter === pos
                ).map((position) => (
                  <tr key={position} className="hover:bg-slate-50/50 transition-colors">
                    {/* Position Label Column */}
                    <td className="p-3 border-r border-slate-200 sticky left-0 bg-white font-bold text-slate-800 z-10">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                            POSITION_STYLES[position]?.labelBg || 'bg-slate-100'
                          }`}
                        >
                          {position}
                        </span>
                      </div>
                    </td>

                    {/* 7 Days Columns */}
                    {weekDays.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const dayShifts = filteredShifts.filter(
                        (s) => s.date === dateStr && s.position === position
                      );

                      return (
                        <td
                          key={dateStr}
                          className="p-2 border-r border-slate-100 align-top h-32 hover:bg-slate-50/80 transition-colors relative"
                        >
                          {/* List of shifts for this day and position */}
                          <div className="space-y-1.5 h-full min-h-[100px]">
                            {dayShifts.map((shift) => {
                              const emp = employees.find((e) => e.id === shift.assignedEmployeeId);
                              const posStyle = POSITION_STYLES[shift.position] || POSITION_STYLES.Waiter;

                              if (!shift.assignedEmployeeId) {
                                return (
                                  <div
                                    key={shift.id}
                                    className="bg-red-50 border border-dashed border-red-300 p-2 rounded text-[11px] text-red-600 relative group/card shadow-2xs"
                                  >
                                    <p className="font-bold uppercase text-[9px]">Missing Position</p>
                                    <p className="font-semibold text-slate-900">
                                      {shift.startTime} - {shift.endTime}
                                    </p>

                                    {/* Quick Actions */}
                                    <div className="opacity-0 group-hover/card:opacity-100 transition-opacity absolute top-1 right-1 bg-white rounded p-0.5 border border-slate-200 shadow flex items-center gap-1">
                                      <button
                                        onClick={() => onOpenEditShift(shift)}
                                        className="p-1 hover:bg-slate-100 text-slate-700 rounded"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteShift(shift.id)}
                                        className="p-1 hover:bg-rose-100 text-rose-700 rounded"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={shift.id}
                                  className={`p-2 rounded text-[11px] ${posStyle.card} relative group/card shadow-2xs hover:shadow-sm transition-all`}
                                >
                                  <p className="font-bold text-slate-900 leading-tight">
                                    {emp ? emp.name : 'Staff Member'}
                                  </p>
                                  <p className="text-slate-500 text-[10px]">
                                    {shift.position} • {shift.startTime} - {shift.endTime}
                                  </p>

                                  {/* Quick Actions */}
                                  <div className="opacity-0 group-hover/card:opacity-100 transition-opacity absolute top-1 right-1 bg-white rounded p-0.5 border border-slate-200 shadow flex items-center gap-1">
                                    <button
                                      onClick={() => onOpenEditShift(shift)}
                                      className="p-1 hover:bg-blue-100 text-blue-700 rounded"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteShift(shift.id)}
                                      className="p-1 hover:bg-rose-100 text-rose-700 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* + Add Shift Button */}
                            <button
                              onClick={() => onOpenAddShift(dateStr, position)}
                              className="w-full py-1 border border-dashed border-slate-200 rounded text-[10px] text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center gap-1 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Shift</span>
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                // Grouped by Employee
                employees
                  .filter(
                    (emp) => selectedEmployeeFilter === 'ALL' || selectedEmployeeFilter === emp.id
                  )
                  .map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Employee Label Column */}
                      <td className="p-3 border-r border-slate-200 sticky left-0 bg-white font-bold text-slate-800 z-10">
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase">
                            {emp.position} • Max {emp.maxWeeklyHours}h
                          </div>
                        </div>
                      </td>

                      {/* 7 Days Columns */}
                      {weekDays.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayShifts = filteredShifts.filter(
                          (s) => s.date === dateStr && s.assignedEmployeeId === emp.id
                        );

                        return (
                          <td
                            key={dateStr}
                            className="p-2 border-r border-slate-100 align-top h-32 hover:bg-slate-50/80 transition-colors relative"
                          >
                            <div className="space-y-1.5 h-full min-h-[100px]">
                              {dayShifts.map((shift) => {
                                const posStyle = POSITION_STYLES[shift.position] || POSITION_STYLES.Waiter;

                                return (
                                  <div
                                    key={shift.id}
                                    className={`p-2 rounded text-[11px] ${posStyle.card} relative group/card shadow-2xs hover:shadow-sm transition-all`}
                                  >
                                    <p className="font-bold text-slate-900 leading-tight">
                                      {shift.position}
                                    </p>
                                    <p className="text-slate-500 text-[10px]">
                                      {shift.startTime} - {shift.endTime}
                                    </p>

                                    {/* Hover Actions */}
                                    <div className="opacity-0 group-hover/card:opacity-100 transition-opacity absolute top-1 right-1 bg-white rounded p-0.5 border border-slate-200 shadow flex items-center gap-1">
                                      <button
                                        onClick={() => onOpenEditShift(shift)}
                                        className="p-1 hover:bg-blue-100 text-blue-700 rounded"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteShift(shift.id)}
                                        className="p-1 hover:bg-rose-100 text-rose-700 rounded"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                              <button
                                onClick={() => onOpenAddShift(dateStr, emp.position)}
                                className="w-full py-1 border border-dashed border-slate-200 rounded text-[10px] text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center gap-1 transition-all"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Shift</span>
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
