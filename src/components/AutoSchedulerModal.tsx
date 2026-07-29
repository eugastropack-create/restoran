import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ListFilter, ArrowRight } from 'lucide-react';
import { AutoScheduleOptions, AutoScheduleResult, DayOfWeek } from '../types';
import { format, startOfWeek } from 'date-fns';

interface AutoSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAutoScheduler: (options: AutoScheduleOptions) => Promise<AutoScheduleResult>;
}

export const AutoSchedulerModal: React.FC<AutoSchedulerModalProps> = ({
  isOpen,
  onClose,
  onRunAutoScheduler,
}) => {
  const [weekStartDate, setWeekStartDate] = useState<string>(
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );
  const [respectUnavailableDays, setRespectUnavailableDays] = useState<boolean>(true);
  const [respectMaxHours, setRespectMaxHours] = useState<boolean>(true);
  const [balanceHours, setBalanceHours] = useState<boolean>(true);
  const [strictPositionMatch, setStrictPositionMatch] = useState<boolean>(true);
  const [clearExistingDrafts, setClearExistingDrafts] = useState<boolean>(true);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<AutoScheduleResult | null>(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await onRunAutoScheduler({
        weekStartDate,
        clearExistingDrafts,
        balanceHours,
        respectMaxHours,
        respectUnavailableDays,
        strictPositionMatch,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Rule-Based Auto Scheduler</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Algorithmic workforce optimization engine (No AI required)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {!result ? (
            <>
              {/* Rules Configuration */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-slate-800 font-bold text-xs">
                    Target Week Starting
                  </label>
                  <input
                    type="date"
                    value={weekStartDate}
                    onChange={(e) => setWeekStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    The engine will assign active employees to all unassigned shifts for this week.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Active Scheduling Rules
                  </h4>

                  {/* Rule 1 */}
                  <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={respectUnavailableDays}
                      onChange={(e) => setRespectUnavailableDays(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">
                        1. Respect Unavailable Days
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Strictly exclude staff who marked specific days as unavailable in their availability preferences.
                      </div>
                    </div>
                  </label>

                  {/* Rule 2 */}
                  <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={respectMaxHours}
                      onChange={(e) => setRespectMaxHours(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">
                        2. Respect Maximum Weekly Hours Limit
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Never assign a shift if total weekly hours for that employee would exceed their profile max hours limit.
                      </div>
                    </div>
                  </label>

                  {/* Rule 3 */}
                  <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={balanceHours}
                      onChange={(e) => setBalanceHours(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">
                        3. Balance Work Hours Between Employees
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Prioritize team members with lower accumulated scheduled hours for fair work distribution.
                      </div>
                    </div>
                  </label>

                  {/* Rule 4 */}
                  <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={strictPositionMatch}
                      onChange={(e) => setStrictPositionMatch(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">
                        4. Position & Role Matching
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Match primary position required (e.g. Waiter to Waiter shift). Prevent overlapping double-booking.
                      </div>
                    </div>
                  </label>

                  {/* Rule 5 */}
                  <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clearExistingDrafts}
                      onChange={(e) => setClearExistingDrafts(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">
                        5. Re-evaluate Draft Shifts
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Reset current un-published draft assignments before executing calculation.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  id="btn-run-auto-algorithm"
                  onClick={handleRun}
                  disabled={isRunning}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isRunning ? 'Running Optimization Engine...' : 'Run Automatic Schedule Generator'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            /* Results & Execution Log View */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-emerald-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Automatic Scheduling Complete!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Successfully processed {result.totalShiftsProcessed} total shifts. Assigned:{' '}
                    <strong>{result.assignedShiftsCount}</strong> | Unfilled:{' '}
                    <strong>{result.unfilledShiftsCount}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="text-xs text-emerald-800 underline font-semibold"
                >
                  Re-run with rules
                </button>
              </div>

              {/* Log List */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <ListFilter className="w-4 h-4 text-amber-500" />
                  Detailed Shift Assignment Audit Logs:
                </h5>

                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 p-2 rounded-xl bg-slate-50">
                  {result.logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                        log.status === 'Assigned'
                          ? 'bg-white border-emerald-200'
                          : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{log.date}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                            {log.startTime} - {log.endTime}
                          </span>
                          <span className="text-amber-700 font-semibold">[{log.position}]</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{log.reason}</p>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        {log.status === 'Assigned' ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ✓ {log.assignedEmployeeName}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                            ⚠️ Unfilled
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close and apply */}
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                >
                  <span>Accept & Apply Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
