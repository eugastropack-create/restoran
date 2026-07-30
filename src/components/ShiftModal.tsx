import React, { useState, useEffect } from 'react';
import { X, Clock, User, AlertTriangle, Check, Calendar as CalendarIcon, Building2 } from 'lucide-react';
import { Shift, Employee, Position, DayOfWeek, Restaurant } from '../types';
import { calculateShiftDurationHours, getDayOfWeekFromDate } from '../lib/schedulerEngine';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveShift: (shiftData: Partial<Shift>) => void;
  onDeleteShift?: (shiftId: string) => void;
  initialShift?: Shift | null;
  employees: Employee[];
  restaurants?: Restaurant[];
  defaultDate?: string;
  defaultPosition?: Position;
  defaultRestaurantId?: string;
}

const POSITIONS: Position[] = ['Çalışan'];

const GERMAN_DAYS: Record<DayOfWeek, string> = {
  Monday: 'Montag',
  Tuesday: 'Dienstag',
  Wednesday: 'Mittwoch',
  Thursday: 'Donnerstag',
  Friday: 'Freitag',
  Saturday: 'Samstag',
  Sunday: 'Sonntag',
};

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSaveShift,
  onDeleteShift,
  initialShift,
  employees,
  restaurants = [],
  defaultDate,
  defaultPosition,
  defaultRestaurantId,
}) => {
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('12:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [position, setPosition] = useState<Position>('Çalışan');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [restaurantId, setRestaurantId] = useState<string>('rest-1');

  useEffect(() => {
    if (initialShift) {
      setDate(initialShift.date);
      setStartTime(initialShift.startTime);
      setEndTime(initialShift.endTime);
      setPosition(initialShift.position);
      setAssignedEmployeeId(initialShift.assignedEmployeeId || '');
      setNotes(initialShift.notes || '');
      setRestaurantId(initialShift.restaurantId || defaultRestaurantId || restaurants[0]?.id || 'rest-1');
    } else {
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setStartTime('12:00');
      setEndTime('17:00');
      setPosition(defaultPosition || 'Çalışan');
      setAssignedEmployeeId('');
      setNotes('');
      setRestaurantId(defaultRestaurantId || restaurants[0]?.id || 'rest-1');
    }
  }, [initialShift, defaultDate, defaultPosition, defaultRestaurantId, isOpen, restaurants]);

  if (!isOpen) return null;

  const durationHours = calculateShiftDurationHours(startTime, endTime);
  const selectedDayOfWeek: DayOfWeek = date ? getDayOfWeekFromDate(date) : 'Monday';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveShift({
      id: initialShift?.id,
      restaurantId,
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
              {initialShift ? 'Schichtdetails bearbeiten' : 'Neue Schicht erstellen'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Restaurant / Standort */}
          {restaurants && restaurants.length > 0 && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Standort / Restaurant</span>
              </label>
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Schichtdatum</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Tag: {GERMAN_DAYS[selectedDayOfWeek]}</span>
          </div>

          {/* Time Interval */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Startzeit</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Endzeit</label>
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
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Gesamtdauer:
              </span>
              <span className="text-amber-700 font-bold">{durationHours} Std.</span>
            </div>
          </div>

          {/* Assigned Employee Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Mitarbeiter zuweisen</label>
            <select
              value={assignedEmployeeId}
              onChange={(e) => setAssignedEmployeeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">-- Unbesetzt (Entwurf) --</option>
              {employees.map((emp) => {
                const isUnavailable = emp.unavailableDays.includes(selectedDayOfWeek);

                let label = emp.name;
                if (isUnavailable) label += ` ⚠️ Nicht verfügbar am ${GERMAN_DAYS[selectedDayOfWeek]}`;

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
                    <AlertTriangle className="w-3 h-3" /> Warnung: {employees.find((e) => e.id === assignedEmployeeId)?.name} ist am {GERMAN_DAYS[selectedDayOfWeek]} nicht verfügbar.
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verfügbar am {GERMAN_DAYS[selectedDayOfWeek]}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Notizen / Bereich</label>
            <textarea
              rows={2}
              placeholder="z. B. Terrassenbereich, Küchenvorbereitung, Kasse 1..."
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
                className="text-rose-600 hover:text-rose-700 font-semibold text-xs px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Schicht löschen
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow transition-colors cursor-pointer"
              >
                Schicht speichern
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
