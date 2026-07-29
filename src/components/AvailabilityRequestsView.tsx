import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  User,
  Calendar,
  MessageSquare,
  Building2,
  Users2,
  Sparkles,
} from 'lucide-react';
import { AvailabilityRequest, User as UserType, Employee, DayOfWeek, Restaurant } from '../types';

interface AvailabilityRequestsViewProps {
  requests: AvailabilityRequest[];
  currentUser: UserType | null;
  employees: Employee[];
  restaurants?: Restaurant[];
  onRequestSubmit: (req: Partial<AvailabilityRequest>) => void;
  onRequestStatusUpdate: (id: string, status: 'Approved' | 'Rejected') => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const GERMAN_DAYS: Record<DayOfWeek, string> = {
  Monday: 'Montag',
  Tuesday: 'Dienstag',
  Wednesday: 'Mittwoch',
  Thursday: 'Donnerstag',
  Friday: 'Freitag',
  Saturday: 'Samstag',
  Sunday: 'Sonntag',
};

export const AvailabilityRequestsView: React.FC<AvailabilityRequestsViewProps> = ({
  requests,
  currentUser,
  employees,
  restaurants = [],
  onRequestSubmit,
  onRequestStatusUpdate,
}) => {
  const isManager = currentUser?.role === 'Manager';

  // 3-Week Availability State
  const WEEKS = [
    { id: '1. Woche (Diese Woche)', label: '1. Woche (Diese Woche)' },
    { id: '2. Woche (Nächste Woche)', label: '2. Woche (Nächste Woche)' },
    { id: '3. Woche (In 2 Wochen)', label: '3. Woche (In 2 Wochen)' },
  ];

  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(0);

  // Availability per week: Map weekIndex -> Record<DayOfWeek, AvailabilityType>
  type AvailabilityType = 'Ganztägig' | 'Halbtag (Morgen)' | 'Halbtag (Abend)' | 'Frei / Nicht verfügbar';

  const initialWeekAvailability = (): Record<number, Record<DayOfWeek, AvailabilityType>> => {
    const initialDayMap: Record<DayOfWeek, AvailabilityType> = {
      Monday: 'Ganztägig',
      Tuesday: 'Ganztägig',
      Wednesday: 'Ganztägig',
      Thursday: 'Ganztägig',
      Friday: 'Ganztägig',
      Saturday: 'Ganztägig',
      Sunday: 'Ganztägig',
    };
    return {
      0: { ...initialDayMap },
      1: { ...initialDayMap },
      2: { ...initialDayMap },
    };
  };

  const [weeklyAvailabilityMap, setWeeklyAvailabilityMap] = useState<
    Record<number, Record<DayOfWeek, AvailabilityType>>
  >(initialWeekAvailability);

  const [requestedMaxHours, setRequestedMaxHours] = useState<number>(38);
  const [reason, setReason] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const currentEmp = employees.find((e) => e.id === currentUser?.employeeId);

  const setDayAvailability = (weekIdx: number, day: DayOfWeek, type: AvailabilityType) => {
    setWeeklyAvailabilityMap((prev) => ({
      ...prev,
      [weekIdx]: {
        ...prev[weekIdx],
        [day]: type,
      },
    }));
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) return;

    WEEKS.forEach((w, weekIdx) => {
      const currentWeekData = weeklyAvailabilityMap[weekIdx];
      const selectedWeekLabel = w.label;

      const requestedUnavailableDays = DAYS_OF_WEEK.filter(
        (d) => currentWeekData[d] === 'Frei / Nicht verfügbar'
      );
      const requestedAvailableDays = DAYS_OF_WEEK.filter(
        (d) => currentWeekData[d] !== 'Frei / Nicht verfügbar'
      );

      onRequestSubmit({
        employeeId: currentEmp.id,
        employeeName: `${currentEmp.name}${currentEmp.isSharedStaff ? ' (Gemeinsamer Mitarbeiter)' : ''}`,
        selectedWeek: selectedWeekLabel,
        requestedAvailableDays,
        requestedUnavailableDays,
        dayAvailabilityTypes: currentWeekData,
        requestedMaxHours: Number(requestedMaxHours),
        reason: reason || `Verfügbarkeitsmeldung für ${selectedWeekLabel} aktualisiert.`,
      });
    });

    setSubmittedSuccess(true);
    setReason('');
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold tracking-tight">
              Mitarbeiter-Verfügbarkeit & 3-Wochen-Planung
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isManager
              ? 'Prüfen und genehmigen Sie die 3-Wochen-Verfügbarkeitsmeldungen (Ganztägig / Halbtag / Frei) der Mitarbeiter.'
              : 'Geben Sie Ihre Verfügbarkeit (Ganztägig, Halbtags oder Frei) für die nächsten 3 Wochen an.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-2 rounded-xl text-xs">
          <Calendar className="w-4 h-4 text-blue-400" />
          <div>
            <div className="font-bold text-slate-200">3-Wochen-Ansicht</div>
            <div className="text-[10px] text-blue-400 font-medium">Flexible Schichten & Halbtag</div>
          </div>
        </div>
      </div>

      {/* Employee Submission Form */}
      {!isManager && currentEmp && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Neue Verfügbarkeitsmeldung senden</span>
              </h3>
              <p className="text-xs text-slate-500">
                {currentEmp.name} - {currentEmp.isSharedStaff ? 'Gemeinsamer Mitarbeiter' : 'Restaurant-Mitarbeiter'}
              </p>
            </div>
          </div>

          {submittedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Ihre Verfügbarkeitsmeldungen für alle 3 Wochen wurden erfolgreich an den Manager gesendet!</span>
            </div>
          )}

          <form onSubmit={handleEmployeeSubmit} className="space-y-6 text-xs">
            {/* 3 Weeks Availability Stacked */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                <label className="block font-bold text-slate-800 text-sm">
                  Verfügbarkeitsstatus für 3 Wochen:
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Wählen Sie für jede Woche Ihre Präferenz (Ganztägig / Halbtag / Frei).
                </span>
              </div>

              {WEEKS.map((w, weekIdx) => (
                <div
                  key={w.id}
                  className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{w.label}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const currentType = weeklyAvailabilityMap[weekIdx][day];

                      let cardStyle = 'bg-white border-slate-200 text-slate-800';
                      if (currentType === 'Ganztägig') {
                        cardStyle = 'bg-emerald-50/80 border-emerald-200 text-emerald-900';
                      } else if (currentType.includes('Halbtag')) {
                        cardStyle = 'bg-amber-50/90 border-amber-200 text-amber-900';
                      } else if (currentType === 'Frei / Nicht verfügbar') {
                        cardStyle = 'bg-rose-50/80 border-rose-200 text-rose-800';
                      }

                      return (
                        <div
                          key={day}
                          className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${cardStyle}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{GERMAN_DAYS[day]}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide ${
                                currentType === 'Ganztägig'
                                  ? 'bg-emerald-600 text-white'
                                  : currentType.includes('Halbtag')
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {currentType}
                            </span>
                          </div>

                          {/* Select options */}
                          <select
                            value={currentType}
                            onChange={(e) =>
                              setDayAvailability(weekIdx, day, e.target.value as AvailabilityType)
                            }
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                          >
                            <option value="Ganztägig">🟢 Ganztägig</option>
                            <option value="Halbtag (Morgen)">🌤️ Halbtag (Morgen)</option>
                            <option value="Halbtag (Abend)">🌙 Halbtag (Abend)</option>
                            <option value="Frei / Nicht verfügbar">🔴 Frei / Nicht verfügbar</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maximale Wochenarbeitszeit (Stunden/Woche):
                </label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={requestedMaxHours}
                  onChange={(e) => setRequestedMaxHours(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hinweis / Anmerkung:</label>
                <input
                  type="text"
                  placeholder="z. B. Unter der Woche bevorzugt Abendschichten..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors cursor-pointer w-full sm:w-auto text-xs sm:text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Verfügbarkeitsmeldung für 3 Wochen senden</span>
            </button>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            {isManager ? 'Eingegangene Verfügbarkeitsmeldungen' : 'Meine gesendeten Verfügbarkeitsmeldungen'}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Gesamt {requests.length} Einträge
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Bisher wurden keine Verfügbarkeitsmeldungen eingereicht.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {req.status === 'Approved' ? 'Genehmigt' : req.status === 'Rejected' ? 'Abgelehnt' : 'Ausstehend'}
                    </span>

                    {req.selectedWeek && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        {req.selectedWeek}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5">
                    {/* Day Availability Badges */}
                    {req.dayAvailabilityTypes && Object.keys(req.dayAvailabilityTypes).length > 0 ? (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                        <strong className="block text-slate-700 font-bold text-[11px]">
                          Tägliche Verfügbarkeitsdetails:
                        </strong>
                        <div className="flex flex-wrap gap-1.5">
                          {DAYS_OF_WEEK.map((day) => {
                            const type = req.dayAvailabilityTypes?.[day] || 'Ganztägig';
                            let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                            if (type.includes('Halbtag')) {
                              badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                            } else if (type === 'Frei / Nicht verfügbar' || type === 'İzinli') {
                              badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
                            }

                            return (
                              <span
                                key={day}
                                className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold flex items-center gap-1 ${badgeStyle}`}
                              >
                                <span className="font-bold">{GERMAN_DAYS[day].slice(0, 2)}:</span> {type}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <strong>Freie Tage:</strong>{' '}
                        {req.requestedUnavailableDays.length > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            {req.requestedUnavailableDays.map((d) => GERMAN_DAYS[d] || d).join(', ')}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Alle Tage verfügbar</span>
                        )}
                      </div>
                    )}

                    <div>
                      <strong>Maximale Wochenarbeitszeit:</strong> {req.requestedMaxHours} Std./Woche
                    </div>

                    {req.reason && (
                      <div className="text-slate-600 italic flex items-center gap-1 mt-1 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span>"{req.reason}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manager Action Buttons */}
                {isManager && req.status === 'Pending' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onRequestStatusUpdate(req.id, 'Approved')}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Genehmigen
                    </button>
                    <button
                      onClick={() => onRequestStatusUpdate(req.id, 'Rejected')}
                      className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Ablehnen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

