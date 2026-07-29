import React, { useState, useEffect } from 'react';
import { X, Clock, User, AlertTriangle, Check, Calendar as CalendarIcon } from 'lucide-react';
import { Shift, Employee, Position, DayOfWeek } from '../types';
import { calculateShiftDurationHours, getDayOfWeekFromDate } from '../lib/schedulerEngine';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveShift: (shiftData: Partial<Shift>) => void;
  onDeleteShift?: (shiftId: string) => void;
  initialShift?: Shift | null;
  employees: Employee[];
  defaultDate?: string;
  defaultPosition?: Position;
}

const POSITIONS: Position[] = ['Waiter', 'Chef', 'Cashier', 'Barista', 'Kitchen staff'];

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSaveShift,
  onDeleteShift,
  initialShift,
  employees,
  defaultDate,
  defaultPosition,
}) => {
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [position, setPosition] = useState<Position>('Waiter');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialShift) {
      setDate(initialShift.date);
      setStartTime(initialShift.startTime);
      setEndTime(initialShift.endTime);
      setPosition(initialShift.position);
      setAssignedEmployeeId(initialShift.assignedEmployeeId || '');
      setNotes(initialShift.notes || '');
    } else {
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('17:00');
      setPosition(defaultPosition || 'Waiter');
      setAssignedEmployeeId('');
      setNotes('');
    }
  }, [initialShift, defaultDate, defaultPosition, isOpen]);

  if (!isOpen) return null;

  const durationHours = calculateShiftDurationHours(startTime, endTime);
  const selectedDayOfWeek: DayOfWeek = date ? getDayOfWeekFromDate(date) : 'Monday';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveShift({
      id: initialShift?.id,
      date,
      startTime,
      endTime,
      position,
      assignedEmployeeId: assignedEmployeeId || null,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">
              {initialShift ? 'Edit Shift Details' : 'Create New Shift'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Shift Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Day: {selectedDayOfWeek}</span>
            </div>

            {/* Required Position */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Required Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Interval */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="col-span-2 flex items-center justify-between text-slate-600 font-semibold text-[11px] pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Total Duration:
              </span>
              <span className="text-amber-700 font-bold">{durationHours} hours</span>
            </div>
          </div>

          {/* Assigned Employee Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assign Employee</label>
            <select
              value={assignedEmployeeId}
              onChange={(e) => setAssignedEmployeeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Unassigned (Draft Shift) --</option>
              {employees.map((emp) => {
                const matchesPos = emp.position === position;
                const isUnavailable = emp.unavailableDays.includes(selectedDayOfWeek);

                let label = `${emp.name} (${emp.position})`;
                if (isUnavailable) label += ' ⚠️ Unavailable on ' + selectedDayOfWeek;
                if (!matchesPos) label += ' [Different Primary Role]';

                return (
                  <option key={emp.id} value={emp.id}>
                    {label}
                  </option>
                );
              })}
            </select>
            {assignedEmployeeId && (
              <div className="mt-1.5 text-[11px]">
                {employees.find((e) => e.id === assignedEmployeeId)?.unavailableDays.includes(selectedDayOfWeek) ? (
                  <span className="text-rose-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Warning: {employees.find((e) => e.id === assignedEmployeeId)?.name} marked {selectedDayOfWeek} as unavailable.
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Available on {selectedDayOfWeek}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Shift Notes / Station</label>
            <textarea
              rows={2}
              placeholder="e.g. Patio seating, Kitchen prep, Cash register #1..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {initialShift && onDeleteShift ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteShift(initialShift.id);
                  onClose();
                }}
                className="text-rose-600 hover:text-rose-700 font-semibold text-xs px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
              >
                Delete Shift
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow transition-colors"
              >
                Save Shift
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
