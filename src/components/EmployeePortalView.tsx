import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  Building2,
  DollarSign,
  Printer,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Shift, Employee, Restaurant, User } from '../types';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import { calculateShiftDurationHours } from '../lib/schedulerEngine';

interface EmployeePortalViewProps {
  currentUser: User | null;
  employee: Employee | null;
  shifts: Shift[];
  restaurant: Restaurant | null;
  onNavigateTab: (tab: string) => void;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  currentUser,
  employee,
  shifts,
  restaurant,
  onNavigateTab,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  if (!employee) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Employee Profile Not Linked</h3>
        <p className="text-xs text-slate-500">
          Your current login account ({currentUser?.email}) is not linked to an active employee record. Please select an employee account from the top user switcher.
        </p>
      </div>
    );
  }

  // Days of current week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const weekDateStrings = weekDays.map((d) => format(d, 'yyyy-MM-dd'));

  // Shifts assigned to this employee this week
  const myShiftsThisWeek = shifts.filter(
    (s) => s.assignedEmployeeId === employee.id && weekDateStrings.includes(s.date)
  );

  // Total scheduled hours this week
  let totalHours = 0;
  myShiftsThisWeek.forEach((s) => {
    totalHours += calculateShiftDurationHours(s.startTime, s.endTime);
  });

  const estimatedEarnings = Math.round(totalHours * employee.hourlyRate);

  return (
    <div className="space-y-6">
      {/* Profile Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
              {employee.name.charAt(0)}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">{employee.name}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {employee.position}
                </span>
                <span>•</span>
                <span>{employee.employmentType}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {restaurant?.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('requests')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              Request Availability Change
            </button>
            <button
              onClick={() => onNavigateTab('export')}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Schedule</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Scheduled Hours This Week
            </span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {totalHours} hrs / {employee.maxWeeklyHours}h max
            </div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Estimated Weekly Pay
            </span>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">
              ${estimatedEarnings} (${employee.hourlyRate}/hr)
            </div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Shifts Assigned
            </span>
            <div className="text-xl font-extrabold text-white mt-1">
              {myShiftsThisWeek.length} shifts
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7))}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900 text-sm">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          className="text-xs font-semibold text-amber-600 hover:underline"
        >
          Jump to Current Week
        </button>
      </div>

      {/* Daily Shifts Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-amber-500" />
          <span>My Shifts For Selected Week</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayShifts = myShiftsThisWeek.filter((s) => s.date === dateStr);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={dateStr}
                className={`p-3 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                  isToday
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/50'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{format(day, 'EEE')}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {format(day, 'MMM d')}
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    {dayShifts.length > 0 ? (
                      dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1 text-xs"
                        >
                          <div className="font-bold text-slate-900 text-[11px]">
                            {shift.startTime} - {shift.endTime}
                          </div>
                          <div className="text-[10px] text-amber-700 font-semibold">
                            {shift.position}
                          </div>
                          {shift.notes && (
                            <div className="text-[10px] text-slate-500 italic">
                              "{shift.notes}"
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-[11px] text-slate-400 italic">
                        No shift
                      </div>
                    )}
                  </div>
                </div>

                {dayShifts.length > 0 && (
                  <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
