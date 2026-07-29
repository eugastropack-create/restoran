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
} from 'lucide-react';
import { AvailabilityRequest, User as UserType, Employee, DayOfWeek } from '../types';

interface AvailabilityRequestsViewProps {
  requests: AvailabilityRequest[];
  currentUser: UserType | null;
  employees: Employee[];
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

export const AvailabilityRequestsView: React.FC<AvailabilityRequestsViewProps> = ({
  requests,
  currentUser,
  employees,
  onRequestSubmit,
  onRequestStatusUpdate,
}) => {
  const isManager = currentUser?.role === 'Manager';

  // Employee Form State
  const [requestedUnavailableDays, setRequestedUnavailableDays] = useState<DayOfWeek[]>([]);
  const [requestedMaxHours, setRequestedMaxHours] = useState<number>(35);
  const [reason, setReason] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const currentEmp = employees.find((e) => e.id === currentUser?.employeeId);

  const toggleDay = (day: DayOfWeek) => {
    if (requestedUnavailableDays.includes(day)) {
      setRequestedUnavailableDays(requestedUnavailableDays.filter((d) => d !== day));
    } else {
      setRequestedUnavailableDays([...requestedUnavailableDays, day]);
    }
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) return;

    const requestedAvailableDays = DAYS_OF_WEEK.filter(
      (d) => !requestedUnavailableDays.includes(d)
    );

    onRequestSubmit({
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      requestedAvailableDays,
      requestedUnavailableDays,
      requestedMaxHours: Number(requestedMaxHours),
      reason,
    });

    setSubmittedSuccess(true);
    setReason('');
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>Availability & Schedule Change Requests</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isManager
            ? 'Review and approve employee requests for day off preferences and maximum working hours.'
            : 'Submit request for updated available working days or maximum weekly hours to your manager.'}
        </p>
      </div>

      {/* Employee Submission Form */}
      {!isManager && currentEmp && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Submit New Availability Request</h3>

          {submittedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your request has been submitted to your manager for review.</span>
            </div>
          )}

          <form onSubmit={handleEmployeeSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Days You Are Unavailable to Work:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = requestedUnavailableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        isSelected
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        {isSelected ? 'Unavailable' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requested Max Weekly Hours:
                </label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={requestedMaxHours}
                  onChange={(e) => setRequestedMaxHours(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Note:</label>
                <input
                  type="text"
                  placeholder="e.g. School exams, family commitments, travel..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Availability Request</span>
            </button>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          {isManager ? 'All Employee Availability Requests' : 'My Submitted Requests'}
        </h3>

        {requests.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No availability change requests found.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>
                      <strong>Requested Unavailable Days:</strong>{' '}
                      {req.requestedUnavailableDays.length > 0
                        ? req.requestedUnavailableDays.join(', ')
                        : 'None'}
                    </div>
                    <div>
                      <strong>Requested Max Hours:</strong> {req.requestedMaxHours} hours/week
                    </div>
                    {req.reason && (
                      <div className="text-slate-500 italic flex items-center gap-1 mt-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> "{req.reason}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Manager Action Buttons */}
                {isManager && req.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRequestStatusUpdate(req.id, 'Approved')}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => onRequestStatusUpdate(req.id, 'Rejected')}
                      className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
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
