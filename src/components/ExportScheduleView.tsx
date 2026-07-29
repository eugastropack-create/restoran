import React, { useRef } from 'react';
import { Printer, Download, Calendar as CalendarIcon, Building2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [isExportingPdf, setIsExportingPdf] = React.useState<boolean>(false);

  const printRef = useRef<HTMLDivElement>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const weekDateStrings = weekDays.map((d) => format(d, 'yyyy-MM-dd'));

  // Shifts for selected week
  const weekShifts = shifts.filter((s) => weekDateStrings.includes(s.date));

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

      pdf.addImage(imgData, 'PNG', 8, 8, imgWidth, imgHeight);
      pdf.save(`Schedule_${format(currentWeekStart, 'yyyy-MM-dd')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-500" />
            <span>Export & Print Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate clean, professional weekly schedule sheets for printing or PDF sharing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d')}
            </span>
            <button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Schedule</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Schedule Area */}
      <div
        ref={printRef}
        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none"
      >
        {/* Restaurant Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{restaurant?.name || 'Bistro Bella'}</h1>
            <p className="text-xs text-slate-500">{restaurant?.address} • Phone: {restaurant?.phone}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
              Official Weekly Roster
            </span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              Week of {format(currentWeekStart, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border border-slate-300 font-bold text-slate-800">
                <th className="p-2.5 text-left border border-slate-300 w-36">Employee</th>
                <th className="p-2.5 text-left border border-slate-300 w-24">Position</th>
                {weekDays.map((d) => (
                  <th key={d.toISOString()} className="p-2.5 text-center border border-slate-300">
                    <div>{format(d, 'EEEE')}</div>
                    <div className="text-[10px] font-normal text-slate-500">{format(d, 'MMM d')}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-300 border border-slate-300">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 border border-slate-300 font-bold text-slate-900">
                    {emp.name}
                  </td>
                  <td className="p-2.5 border border-slate-300 font-semibold text-slate-700">
                    {emp.position}
                  </td>

                  {weekDays.map((d) => {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const empShifts = weekShifts.filter(
                      (s) => s.assignedEmployeeId === emp.id && s.date === dateStr
                    );

                    return (
                      <td key={dateStr} className="p-2 border border-slate-300 text-center align-top">
                        {empShifts.length > 0 ? (
                          empShifts.map((s) => (
                            <div
                              key={s.id}
                              className="bg-amber-50 border border-amber-200 text-amber-950 p-1.5 rounded text-[11px] font-bold"
                            >
                              {s.startTime} - {s.endTime}
                              {s.notes && (
                                <div className="text-[9px] font-normal text-slate-600 italic">
                                  {s.notes}
                                </div>
                              )}
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

        {/* Footer info */}
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-4 border-t border-slate-200">
          <span>Generated by StaffSync Workforce Manager</span>
          <span>Manager Signature: _______________________</span>
        </div>
      </div>
    </div>
  );
};
