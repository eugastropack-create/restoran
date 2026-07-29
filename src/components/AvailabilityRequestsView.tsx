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

export const AvailabilityRequestsView: React.FC<AvailabilityRequestsViewProps> = ({
  requests,
  currentUser,
  employees,
  restaurants = [],
  onRequestSubmit,
  onRequestStatusUpdate,
}) => {
  const isManager = currentUser?.role === 'Manager';

  // Employee Form State
  const [requestedUnavailableDays, setRequestedUnavailableDays] = useState<DayOfWeek[]>([]);
  const [preferredRestaurantId, setPreferredRestaurantId] = useState<string>('ALL');
  const [dayRestaurantPreferences, setDayRestaurantPreferences] = useState<Partial<Record<DayOfWeek, string>>>({
    Monday: 'rest-1',
    Wednesday: 'rest-1',
    Friday: 'rest-2',
    Saturday: 'rest-2',
  });
  const [requestedMaxHours, setRequestedMaxHours] = useState<number>(38);
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

  const setDayPreference = (day: DayOfWeek, restId: string) => {
    setDayRestaurantPreferences((prev) => ({ ...prev, [day]: restId }));
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) return;

    const requestedAvailableDays = DAYS_OF_WEEK.filter(
      (d) => !requestedUnavailableDays.includes(d)
    );

    onRequestSubmit({
      employeeId: currentEmp.id,
      employeeName: `${currentEmp.name}${currentEmp.isSharedStaff ? ' (Ortak Çalışan / Shared Staff)' : ''}`,
      requestedAvailableDays,
      requestedUnavailableDays,
      requestedMaxHours: Number(requestedMaxHours),
      preferredRestaurantId,
      dayRestaurantPreferences,
      reason: reason || 'Müsaitlik güncellemesi: 2 restoran ortak şube çalışma günleri belirlendi.',
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
              Çalışan Müsaitlik Bildirimi & 2 Restoran Yönetimi
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isManager
              ? '2 restoranın ortak çalışanlarından gelen haftalık müsaitlik ve şube tercihlerini inceleyin ve onaylayın.'
              : 'Çalışabileceğiniz günleri, saat sınırınızı ve hangi restoranda (Bistro Bella veya Trattoria Milano) müsait olduğunuzu bildirin.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-2 rounded-xl text-xs">
          <Users2 className="w-4 h-4 text-blue-400" />
          <div>
            <div className="font-bold text-slate-200">Ortak Çalışan Havuzu</div>
            <div className="text-[10px] text-blue-400 font-medium">Bistro Bella + Trattoria Milano</div>
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
                <span>Yeni Müsaitlik Bildirimi Gönder</span>
              </h3>
              <p className="text-xs text-slate-500">
                {currentEmp.name} - {currentEmp.isSharedStaff ? '2 Restoran Ortak Çalışanı' : 'Restoran Çalışanı'}
              </p>
            </div>
            {currentEmp.isSharedStaff && (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] px-2.5 py-1 rounded-lg font-bold">
                Ortak Çalışan / Shared Staff
              </span>
            )}
          </div>

          {submittedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Müsaitlik bildiriminiz başarıyla yöneticinize iletildi!</span>
            </div>
          )}

          <form onSubmit={handleEmployeeSubmit} className="space-y-5 text-xs">
            {/* Preferred Primary Location */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800">
                Genel Şube Tercihi (General Location Preference):
              </label>
              <select
                value={preferredRestaurantId}
                onChange={(e) => setPreferredRestaurantId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL"> Her İki Restoran Müsait (Bistro Bella + Trattoria Milano)</option>
                <option value="rest-1">Öncelik: Bistro Bella Italian Kitchen (Restoran 1)</option>
                <option value="rest-2">Öncelik: Trattoria Milano Gourmet (Restoran 2)</option>
              </select>
            </div>

            {/* Daily Availability & Location Selection */}
            <div>
              <label className="block font-semibold text-slate-800 mb-2">
                Haftalık Günlük Müsaitlik ve Şube Tercihleri:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isUnavailable = requestedUnavailableDays.includes(day);
                  const selectedRest = dayRestaurantPreferences[day] || 'ALL';

                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                        isUnavailable
                          ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{day}</span>
                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isUnavailable
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isUnavailable ? 'İzinli' : 'Müsait'}
                        </button>
                      </div>

                      {!isUnavailable && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-medium block">Şube:</span>
                          <select
                            value={selectedRest}
                            onChange={(e) => setDayPreference(day, e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded text-[11px] p-1 font-medium focus:outline-none focus:border-blue-500"
                          >
                            <option value="ALL">İki Şube De Olur</option>
                            <option value="rest-1">Bistro Bella</option>
                            <option value="rest-2">Trattoria Milano</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maksimum Haftalık Çalışma Saati (Max Weekly Hours):
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
                <label className="block font-semibold text-slate-700 mb-1">Açıklama / Not (Reason / Note):</label>
                <input
                  type="text"
                  placeholder="Örn: Pazartesi-Çarşamba Bistro Bella'da, Cuma-Cumartesi Trattoria Milano'da akşam nöbetinde müsaitim..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Müsaitlik Bildirimini Gönder</span>
            </button>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            {isManager ? 'Gelen Çalışan Müsaitlik Bildirimleri' : 'Gönderdiğim Müsaitlik Bildirimleri'}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Toplam {requests.length} bildirim kaydı
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Henüz bildirilmiş bir müsaitlik talebi bulunmuyor.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
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
                      {req.status === 'Approved' ? 'Onaylandı' : req.status === 'Rejected' ? 'Reddedildi' : 'Beklemede'}
                    </span>

                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-500" />
                      {req.preferredRestaurantId === 'rest-2'
                        ? 'Trattoria Milano Tercihi'
                        : req.preferredRestaurantId === 'rest-1'
                        ? 'Bistro Bella Tercihi'
                        : 'Her İki Restoran Müsait'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <strong>İzinli/Çalışılamayan Günler:</strong>{' '}
                      {req.requestedUnavailableDays.length > 0 ? (
                        <span className="text-rose-600 font-semibold">{req.requestedUnavailableDays.join(', ')}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Tüm Günler Müsait</span>
                      )}
                    </div>
                    <div>
                      <strong>Maksimum Haftalık Çalışma:</strong> {req.requestedMaxHours} saat/hafta
                    </div>

                    {req.dayRestaurantPreferences && Object.keys(req.dayRestaurantPreferences).length > 0 && (
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                        <strong className="block text-slate-700 font-bold mb-0.5">Günlük Şube Tercihleri:</strong>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(req.dayRestaurantPreferences).map(([d, rId]) => (
                            <span key={d} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-medium">
                              {d}: {rId === 'rest-1' ? 'Bistro Bella' : rId === 'rest-2' ? 'Trattoria Milano' : 'Her İkisi'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

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
                      <CheckCircle2 className="w-3.5 h-3.5" /> Onayla
                    </button>
                    <button
                      onClick={() => onRequestStatusUpdate(req.id, 'Rejected')}
                      className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reddet
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

