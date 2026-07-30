import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  UserCheck,
  Calendar,
  X,
  Search,
  Check,
  Building2,
} from 'lucide-react';
import { Employee, Position, EmploymentType, DayOfWeek, Restaurant } from '../types';

interface EmployeeManagementViewProps {
  employees: Employee[];
  restaurants?: Restaurant[];
  selectedRestaurantFilter?: string;
  onAddEmployee: (emp: Partial<Employee>) => void;
  onUpdateEmployee: (id: string, emp: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
  isAddOpen: boolean;
  setIsAddOpen: (open: boolean) => void;
}

const POSITIONS: Position[] = ['Teammitglied'];
const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  restaurants = [],
  selectedRestaurantFilter = 'ALL',
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  isAddOpen,
  setIsAddOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState<string>('ALL');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Modal Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<Position>('Teammitglied');
  const [restaurantId, setRestaurantId] = useState<string>(
    selectedRestaurantFilter !== 'ALL' ? selectedRestaurantFilter : restaurants[0]?.id || 'rest-1'
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number>(40);
  const [hourlyRate, setHourlyRate] = useState<number>(18.5);
  const [availableDays, setAvailableDays] = useState<DayOfWeek[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]);
  const [unavailableDays, setUnavailableDays] = useState<DayOfWeek[]>([]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPhone('');
    setPosition('Teammitglied');
    setRestaurantId(
      selectedRestaurantFilter !== 'ALL' ? selectedRestaurantFilter : restaurants[0]?.id || 'rest-1'
    );
    setEmploymentType('Full-time');
    setMaxWeeklyHours(40);
    setHourlyRate(18.5);
    setAvailableDays([...DAYS_OF_WEEK]);
    setUnavailableDays([]);
    setIsAddOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone);
    setPosition(emp.position);
    setRestaurantId(emp.restaurantId || restaurants[0]?.id || 'rest-1');
    setEmploymentType(emp.employmentType);
    setMaxWeeklyHours(emp.maxWeeklyHours);
    setHourlyRate(emp.hourlyRate);
    setAvailableDays(emp.availableDays || [...DAYS_OF_WEEK]);
    setUnavailableDays(emp.unavailableDays || []);
    setIsAddOpen(true);
  };

  const toggleDayAvailability = (day: DayOfWeek) => {
    if (unavailableDays.includes(day)) {
      setUnavailableDays(unavailableDays.filter((d) => d !== day));
      if (!availableDays.includes(day)) {
        setAvailableDays([...availableDays, day]);
      }
    } else {
      setUnavailableDays([...unavailableDays, day]);
      setAvailableDays(availableDays.filter((d) => d !== day));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Employee> = {
      name,
      email,
      phone,
      position,
      restaurantId: 'rest-1',
      assignedRestaurants: ['rest-1', 'rest-2'],
      isSharedStaff: true,
      employmentType,
      maxWeeklyHours: Number(maxWeeklyHours),
      hourlyRate: Number(hourlyRate),
      availableDays,
      unavailableDays,
      status: 'Active',
    };

    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, payload);
    } else {
      onAddEmployee(payload);
    }

    setIsAddOpen(false);
  };

  // Filter employees list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPos =
      selectedPositionFilter === 'ALL' || emp.position === selectedPositionFilter;

    const matchesRest =
      selectedRestaurantFilter === 'ALL' ||
      emp.restaurantId === selectedRestaurantFilter ||
      emp.assignedRestaurants?.includes(selectedRestaurantFilter);

    return matchesSearch && matchesPos && matchesRest;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Mitarbeiterverwaltung</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verwalten Sie Mitarbeiterprofile, maximale Arbeitsstunden, Stundensätze und wöchentliche Verfügbarkeiten.
          </p>
        </div>

        <button
          id="btn-add-employee-main"
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Mitarbeiter hinzufügen</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Mitarbeiter suchen nach Name, E-Mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
          >
            {/* Top Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{emp.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-purple-600" />
                        Altona & Ottensen (Beide)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {emp.employmentType === 'Full-time' ? 'Vollzeit' : 'Teilzeit'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    title="Profil bearbeiten"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEmployee(emp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    title="Mitarbeiter löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact & Rate details */}
              <div className="text-xs space-y-1 text-slate-600 border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-800 font-semibold pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Max: {emp.maxWeeklyHours} Std./Woche
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    €{emp.hourlyRate}/Std.
                  </span>
                </div>
              </div>

              {/* Available vs Unavailable Days */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nicht verfügbare Tage:
                </span>
                <div className="flex flex-wrap gap-1">
                  {emp.unavailableDays && emp.unavailableDays.length > 0 ? (
                    emp.unavailableDays.map((day) => {
                      const dayMap: Record<string, string> = {
                        Monday: 'Montag',
                        Tuesday: 'Dienstag',
                        Wednesday: 'Mittwoch',
                        Thursday: 'Donnerstag',
                        Friday: 'Freitag',
                        Saturday: 'Samstag',
                        Sunday: 'Sonntag',
                      };
                      return (
                        <span
                          key={day}
                          className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium"
                        >
                          {dayMap[day] || day}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      ✓ An allen Tagen verfügbar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Employee Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingEmployee ? 'Mitarbeiterprofil bearbeiten' : 'Neuen Mitarbeiter hinzufügen'}
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vollständiger Name</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. Alex Rivers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-Mail-Adresse</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@restaurant.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefonnummer</label>
                  <input
                    type="text"
                    required
                    placeholder="+49 151 12345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Anstellung</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Full-time">Vollzeit</option>
                    <option value="Part-time">Teilzeit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Std./Woche</label>
                  <input
                    type="number"
                    min={5}
                    max={80}
                    value={maxWeeklyHours}
                    onChange={(e) => setMaxWeeklyHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stundensatz (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={10}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Weekly Day Availability Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Wöchentliche Verfügbarkeit (Klicken zum Umschalten)
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const isUnavail = unavailableDays.includes(day);
                    const dayLabels: Record<string, string> = {
                      Monday: 'Mo',
                      Tuesday: 'Di',
                      Wednesday: 'Mi',
                      Thursday: 'Do',
                      Friday: 'Fr',
                      Saturday: 'Sa',
                      Sunday: 'So',
                    };
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayAvailability(day)}
                        className={`py-2 rounded-lg text-[10px] font-bold border text-center transition-all cursor-pointer ${
                          isUnavail
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {dayLabels[day] || day.substring(0, 2)}
                        <span className="block text-[9px] font-normal">
                          {isUnavail ? 'Frei' : 'Verfügbar'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  Profil speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
