import React from 'react';
import {
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  DashboardStats,
  Employee,
  Shift,
  AvailabilityRequest,
  Position,
} from '../types';
import { format } from 'date-fns';

interface DashboardViewProps {
  stats: DashboardStats;
  employees: Employee[];
  shifts: Shift[];
  availabilityRequests: AvailabilityRequest[];
  onNavigateTab: (tab: string) => void;
  onOpenAutoScheduler: () => void;
  onOpenAddShift: () => void;
  onOpenAddEmployee: () => void;
}

const POSITION_STYLES: Record<Position, { card: string; pill: string }> = {
  Waiter: {
    card: 'bg-blue-50/80 border-l-4 border-blue-500',
    pill: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  Chef: {
    card: 'bg-orange-50/80 border-l-4 border-orange-500',
    pill: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  Cashier: {
    card: 'bg-purple-50/80 border-l-4 border-purple-500',
    pill: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  Barista: {
    card: 'bg-emerald-50/80 border-l-4 border-emerald-500',
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  'Kitchen staff': {
    card: 'bg-indigo-50/80 border-l-4 border-indigo-500',
    pill: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  employees,
  shifts,
  availabilityRequests,
  onNavigateTab,
  onOpenAutoScheduler,
  onOpenAddShift,
  onOpenAddEmployee,
}) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filter today's shifts
  const todaysShifts = shifts.filter((s) => s.date === todayStr);

  // Position breakdown
  const positionCounts: Record<string, number> = {};
  shifts.forEach((s) => {
    positionCounts[s.position] = (positionCounts[s.position] || 0) + 1;
  });

  const totalShifts = shifts.length || 1;

  const activeEmployeesCount = employees.filter((e) => e.status === 'Active').length;
  const coveragePercent = Math.round(
    ((shifts.length - stats.unassignedShiftsCount) / totalShifts) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard & Schedule Overview</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Weekly workforce summary for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-add-shift-dash"
            onClick={onOpenAddShift}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shift</span>
          </button>

          <button
            id="btn-auto-schedule-dash"
            onClick={onOpenAutoScheduler}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Generate Schedule</span>
          </button>
        </div>
      </div>

      {/* High Density Stats Bar (4-Column Layout as in High Density template) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Hours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalHoursThisWeek}</p>
          <div className="mt-2 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>+8.5 hrs vs last week target</span>
          </div>
        </div>

        {/* Card 2: Scheduled Staff */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Scheduled Staff</p>
          <p className="text-2xl font-bold text-slate-900">
            {activeEmployeesCount} / {stats.totalEmployees}
          </p>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{
                width: `${Math.round((activeEmployeesCount / (stats.totalEmployees || 1)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Card 3: Labor Cost Est */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Labor Cost Est.</p>
          <p className="text-2xl font-bold text-slate-900">
            ${stats.estimatedWeeklyPayroll.toLocaleString()}
          </p>
          <div className="mt-2 text-[10px] text-slate-500 font-medium">
            Based on active employee hourly rates
          </div>
        </div>

        {/* Card 4: Shift Coverage */}
        <div
          onClick={() => onNavigateTab('schedule')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Shift Coverage</p>
          <p className="text-2xl font-bold text-emerald-600">{coveragePercent}%</p>
          <div className="mt-2 text-[10px] font-semibold text-rose-500 flex items-center gap-1">
            {stats.unassignedShiftsCount > 0 ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>{stats.unassignedShiftsCount} unfilled shift gaps</span>
              </>
            ) : (
              <span className="text-emerald-600">All shifts covered!</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's On-Duty Roster */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's On-Duty Roster</h2>
              <p className="text-xs text-slate-500">Live roster for {format(new Date(), 'MMM d, yyyy')}</p>
            </div>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-tight flex items-center gap-1"
            >
              Full Calendar
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaysShifts.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">No shifts scheduled for today.</p>
              <button
                onClick={onOpenAddShift}
                className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add shift for today
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaysShifts.map((shift) => {
                const assignedEmp = employees.find((e) => e.id === shift.assignedEmployeeId);
                const posStyle = POSITION_STYLES[shift.position] || POSITION_STYLES.Waiter;

                if (!assignedEmp) {
                  return (
                    <div
                      key={shift.id}
                      className="bg-red-50 border border-dashed border-red-300 p-3 rounded-lg text-xs text-red-600 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold uppercase text-[9px] tracking-wider text-rose-700">
                          Unassigned Shift
                        </p>
                        <p className="font-semibold text-slate-800">
                          {shift.position} Required • {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                      <button
                        onClick={onOpenAutoScheduler}
                        className="text-[11px] bg-white border border-red-200 text-rose-700 font-semibold px-2.5 py-1 rounded hover:bg-rose-100/50"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={shift.id}
                    className={`p-3 rounded-lg ${posStyle.card} text-xs flex items-center justify-between transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                        {assignedEmp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-snug">{assignedEmp.name}</p>
                        <p className="text-slate-500 text-[11px]">
                          {shift.position} • {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${posStyle.pill}`}>
                      {shift.position}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Team Availability Sidebar Widget */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Team Roster & Status</h3>
              <button
                onClick={() => onNavigateTab('employees')}
                className="text-[10px] font-bold text-blue-600 uppercase tracking-tight hover:underline"
              >
                Manage All
              </button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[380px] overflow-y-auto">
              {employees.slice(0, 6).map((emp, idx) => {
                const colors = [
                  'bg-indigo-100 text-indigo-700',
                  'bg-orange-100 text-orange-700',
                  'bg-emerald-100 text-emerald-700',
                  'bg-purple-100 text-purple-700',
                  'bg-blue-100 text-blue-700',
                ];
                const bg = colors[idx % colors.length];

                return (
                  <div key={emp.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center font-bold text-xs`}>
                      {emp.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-tight truncate">{emp.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium truncate">
                        {emp.position} • Max {emp.maxWeeklyHours}h
                      </p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        emp.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                      title={emp.status}
                    ></div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-100">
              <button
                onClick={onOpenAddEmployee}
                className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                + Add New Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
