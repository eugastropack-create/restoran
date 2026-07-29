import React, { useRef, useState } from 'react';
import { Printer, Download, Calendar as CalendarIcon, Building2, Check, ChevronLeft, ChevronRight, FileSpreadsheet, LayoutGrid } from 'lucide-react';
import { Shift, Employee, Restaurant } from '../types';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportScheduleViewProps {
  shifts: Shift[];
  employees: Employee[];
  restaurant: Restaurant | null;
}

export const ExportScheduleView: React.FC<ExportScheduleViewProps> = ({
  shifts,
  employees,
  restaurant,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [exportFormat, setExportFormat] = useState<'STANDORT_MATRIX' | 'EMPLOYEE_TABLE'>('STANDORT_MATRIX');
  const [weekCount, setWeekCount] = useState<number>(3); // 1 or 3 weeks as in the screenshot
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Generate 1 or 3 weeks array
  const weeks = Array.from({ length: weekCount }, (_, weekIdx) => {
    const weekStart = addDays(currentWeekStart, weekIdx * 7);
    const days = Array.from({ length: 7 }, (_, dayIdx) => addDays(weekStart, dayIdx));
    return {
      weekIdx: weekIdx + 1,
      weekStart,
      weekEnd: addDays(weekStart, 6),
      days,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 8, 8, imgWidth, Math.min(imgHeight, 195));
      pdf.save(`MITARBEITER-DIENSTPLAN_${format(currentWeekStart, 'yyyy-MM-dd')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Helper to format shift time like "12-22" or "17-22"
  const formatShiftTimeShort = (startTime: string, endTime: string) => {
    const sHour = startTime.split(':')[0];
    const eHour = endTime.split(':')[0];
    return `${sHour}-${eHour}`;
  };

  // Locations to display as Standort rows
  const locations = [
    { id: 'rest-1', name: 'Restoran 1', fullName: 'Restoran 1' },
    { id: 'rest-2', name: 'Restoran 2', fullName: 'Restoran 2' },
  ];

  // Day Header Color Palette matching the photo exact colors
  const dayHeaderColors = [
    { name: 'Montag', bg: '#cb8140', text: '#ffffff' },      // Orange
    { name: 'Dienstag', bg: '#d8ab38', text: '#ffffff' },    // Yellow
    { name: 'Mittwoch', bg: '#8bae68', text: '#ffffff' },    // Sage Green
    { name: 'Donnerstag', bg: '#839cb8', text: '#ffffff' },  // Slate Blue
    { name: 'Freitag', bg: '#5484bf', text: '#ffffff' },     // Royal Blue
    { name: 'Samstag', bg: '#c0656a', text: '#ffffff' },     // Coral Pink
    { name: 'Sonntag', bg: '#a24b4c', text: '#ffffff' },     // Dark Red
  ];

  const overallEndDate = addDays(currentWeekStart, weekCount * 7 - 1);

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <span>Dienstplan drucken & als PDF exportieren</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Erstellen Sie den <strong className="text-slate-700">MITARBEITER-DIENSTPLAN (Standort-Matrix)</strong> im 1- oder 3-Wochen-Format.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Format Selector */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setExportFormat('STANDORT_MATRIX')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                exportFormat === 'STANDORT_MATRIX'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Standort-Matrix</span>
            </button>
            <button
              onClick={() => setExportFormat('EMPLOYEE_TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                exportFormat === 'EMPLOYEE_TABLE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Mitarbeiter-Liste</span>
            </button>
          </div>

          {/* Week Count Selector */}
          {exportFormat === 'STANDORT_MATRIX' && (
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setWeekCount(1)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  weekCount === 1 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 Woche
              </button>
              <button
                onClick={() => setWeekCount(3)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  weekCount === 3 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3-Wochen-Matrix
              </button>
            </div>
          )}

          {/* Week Date Nav */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7 * weekCount))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 cursor-pointer"
              title="Vorheriger Zeitraum"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">
              {format(currentWeekStart, 'dd.MM.yy')} - {format(overallEndDate, 'dd.MM.yy')}
            </span>
            <button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7 * weekCount))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 cursor-pointer"
              title="Nächster Zeitraum"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Drucken</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'PDF wird erstellt...' : 'PDF herunterladen'}</span>
          </button>
        </div>
      </div>

      {/* Printable Schedule Area */}
      <div
        ref={printRef}
        className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none"
      >
        {exportFormat === 'STANDORT_MATRIX' ? (
          /* EXACT MATCH TO THE USER'S PDF/PHOTO: MITARBEITER-DIENSTPLAN */
          <div className="space-y-6 font-sans">
            {/* Top Red Header Bar */}
            <div className="bg-[#b91c1c] text-white text-center font-bold text-xs uppercase tracking-widest py-2 rounded-t-sm shadow-xs">
              MITARBEITER-DIENSTPLAN - VON {format(currentWeekStart, 'dd.MM.yy')} - {format(overallEndDate, 'dd.MM.yy')}
            </div>

            {/* Weeks */}
            {weeks.map((week) => (
              <div key={week.weekIdx} className="border border-slate-300 rounded-sm overflow-hidden shadow-2xs">
                {/* Week Subheader */}
                <div className="bg-slate-200 text-slate-900 text-center font-black text-xs uppercase tracking-wider py-1.5 border-b border-slate-300">
                  WOCHE {week.weekIdx} – {format(week.weekStart, 'dd.MM.yyyy')} bis {format(week.weekEnd, 'dd.MM.yyyy')}
                </div>

                {/* Week Table */}
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-300 bg-slate-100 font-bold text-slate-800 text-left w-28">
                        Standort
                      </th>
                      {week.days.map((d, dayIdx) => {
                        const headerColor = dayHeaderColors[dayIdx];
                        return (
                          <th
                            key={d.toISOString()}
                            className="p-1.5 border border-slate-300 font-bold text-center"
                            style={{ backgroundColor: headerColor.bg, color: headerColor.text }}
                          >
                            <div className="text-[11px] leading-tight font-extrabold">{headerColor.name}</div>
                            <div className="text-[10px] font-semibold">{format(d, 'dd.MM.')}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {locations.map((loc) => (
                      <tr key={loc.id} className="border-b border-slate-300">
                        {/* Standort Name Column */}
                        <td className="p-2 border border-slate-300 font-extrabold text-slate-900 bg-slate-50 align-middle text-left">
                          <div>{loc.name}</div>
                          <div className="text-[9px] text-slate-500 font-semibold">{loc.fullName.split(' ')[0]}</div>
                        </td>

                        {/* 7 Days */}
                        {week.days.map((d) => {
                          const dateStr = format(d, 'yyyy-MM-dd');
                          const cellShifts = shifts.filter(
                            (s) => s.restaurantId === loc.id && s.date === dateStr
                          );

                          return (
                            <td
                              key={dateStr}
                              className="p-2 border border-slate-300 text-center align-middle h-20 min-w-[95px] relative bg-white"
                            >
                              {cellShifts.length > 0 ? (
                                <div className="space-y-1">
                                  {cellShifts.map((s) => {
                                    const emp = employees.find((e) => e.id === s.assignedEmployeeId);
                                    const empName = emp ? emp.name.split(' ')[0].toUpperCase() : 'UNASSIGNED';
                                    const timeStr = formatShiftTimeShort(s.startTime, s.endTime);

                                    return (
                                      <div
                                        key={s.id}
                                        className="font-extrabold text-slate-900 underline text-[11px] tracking-tight leading-tight"
                                      >
                                        {empName}/{timeStr}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                /* Closed / Off Day Red X */
                                <div className="flex items-center justify-center h-full">
                                  <svg
                                    className="w-10 h-10 text-rose-600 opacity-90 stroke-current"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          /* STANDARD EMPLOYEE TABLE VIEW */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{restaurant?.name || 'StaffSync Pro'}</h1>
                <p className="text-xs text-slate-500">Mitarbeiter-Pool • Wöchentliche Schichtliste</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                  Offizieller Dienstplan
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  Woche vom: {format(currentWeekStart, 'dd. MMMM yyyy')}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border border-slate-300 font-bold text-slate-800">
                    <th className="p-2.5 text-left border border-slate-300 w-40">Mitarbeiter</th>
                    <th className="p-2.5 text-left border border-slate-300 w-24">Position</th>
                    {weeks[0].days.map((d) => {
                      const dayNames: Record<string, string> = {
                        Monday: 'Montag',
                        Tuesday: 'Dienstag',
                        Wednesday: 'Mittwoch',
                        Thursday: 'Donnerstag',
                        Friday: 'Freitag',
                        Saturday: 'Samstag',
                        Sunday: 'Sonntag',
                      };
                      const dayNameStr = dayNames[format(d, 'EEEE')] || format(d, 'EEEE');

                      return (
                        <th key={d.toISOString()} className="p-2.5 text-center border border-slate-300">
                          <div>{dayNameStr}</div>
                          <div className="text-[10px] font-normal text-slate-500">{format(d, 'd. MMM')}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-300 border border-slate-300">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 border border-slate-300 font-bold text-slate-900">
                        <div>{emp.name}</div>
                      </td>
                      <td className="p-2.5 border border-slate-300 font-semibold text-slate-700">
                        {emp.position}
                      </td>

                      {weeks[0].days.map((d) => {
                        const dateStr = format(d, 'yyyy-MM-dd');
                        const empShifts = shifts.filter(
                          (s) => s.assignedEmployeeId === emp.id && s.date === dateStr
                        );

                        return (
                          <td key={dateStr} className="p-2 border border-slate-300 text-center align-top">
                            {empShifts.length > 0 ? (
                              empShifts.map((s) => (
                                <div
                                  key={s.id}
                                  className="bg-blue-50 border border-blue-200 text-slate-900 p-1.5 rounded text-[11px] font-bold space-y-0.5"
                                >
                                  <div className="text-[9px] text-blue-700 uppercase font-extrabold">
                                    {s.restaurantId === 'rest-2' ? 'Restoran 2' : 'Restoran 1'}
                                  </div>
                                  <div>
                                    {s.startTime} - {s.endTime}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-300 font-mono text-[10px]">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-4 border-t border-slate-200">
          <span>StaffSync Pro Dienstplanverwaltung • 2 Standorte</span>
          <span>Unterschrift Betriebsleitung: _______________________</span>
        </div>
      </div>
    </div>
  );
};
