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
  Send,
  Users2,
} from 'lucide-react';
import { Shift, Employee, Restaurant, User } from '../types';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import { calculateShiftDurationHours } from '../lib/schedulerEngine';

interface EmployeePortalViewProps {
  currentUser: User | null;
  employee: Employee | null;
  shifts: Shift[];
  restaurant: Restaurant | null;
  restaurants?: Restaurant[];
  onNavigateTab: (tab: string) => void;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  currentUser,
  employee,
  shifts,
  restaurant,
  restaurants = [],
  onNavigateTab,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  if (!employee) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Mitarbeiterprofil nicht gefunden</h3>
        <p className="text-xs text-slate-500">
          Ihrem Benutzerkonto ({currentUser?.email}) ist kein aktiver Mitarbeiter zugeordnet. Bitte wählen Sie oben über das Benutzermenü ein Mitarbeiterkonto aus.
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

  const getRestaurantName = (restId: string) => {
    const found = restaurants.find((r) => r.id === restId);
    if (found) return found.name;
    if (restId === 'rest-2') return 'Ottensen';
    return restaurant?.name || 'Altona';
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
              {employee.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{employee.name}</h1>
                {employee.isSharedStaff && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Gemeinsamer Mitarbeiter
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <span>{employee.employmentType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('requests')}
              className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Verfügbarkeit angeben</span>
            </button>
            <button
              onClick={() => onNavigateTab('export')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Dienstplan drucken</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Arbeitsstunden diese Woche
            </span>
            <div className="text-xl font-extrabold text-blue-400 mt-1">
              {totalHours} Std. / Max {employee.maxWeeklyHours} Std.
            </div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Zugewiesene Schichten
            </span>
            <div className="text-xl font-extrabold text-white mt-1">
              {myShiftsThisWeek.length} Schichten
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7))}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900 text-sm">
            {format(currentWeekStart, 'd. MMM')} - {format(addDays(currentWeekStart, 6), 'd. MMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          Zur aktuellen Woche
        </button>
      </div>

      {/* Daily Shifts Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>Wöchentlicher Schichtplan (Verteilung über 2 Standorte)</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Auf Basis Ihrer Verfügbarkeit zugewiesene Schichten
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayShifts = myShiftsThisWeek.filter((s) => s.date === dateStr);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={dateStr}
                className={`p-3 rounded-xl border flex flex-col justify-between min-h-[150px] transition-all ${
                  isToday
                    ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/50'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{format(day, 'EEE')}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {format(day, 'd. MMM')}
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    {dayShifts.length > 0 ? (
                      dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1 text-xs"
                        >
                          <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span>{getRestaurantName(shift.restaurantId)}</span>
                          </div>

                          <div className="font-bold text-slate-900 text-[11px] pt-0.5">
                            {shift.startTime} - {shift.endTime}
                          </div>
                          <div className="text-[10px] text-slate-600 font-semibold">
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
                        Keine Schicht
                      </div>
                    )}
                  </div>
                </div>

                {dayShifts.length > 0 && (
                  <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-3 h-3" /> Bestätigt
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
