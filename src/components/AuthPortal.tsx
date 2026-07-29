import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  LogIn,
  BadgePercent,
  ChefHat,
  Briefcase,
} from 'lucide-react';
import { User as UserType, Employee, Position } from '../types';

interface AuthPortalProps {
  onEmployeeLogin: (user: UserType) => void;
  onEmployeeRegister: (empData: {
    name: string;
    email: string;
    phone: string;
    position: Position;
    isSharedStaff: boolean;
    hourlyRate: number;
    maxWeeklyHours: number;
  }) => void;
  onManagerLogin: (managerUser: UserType) => void;
  users: UserType[];
  employees: Employee[];
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onEmployeeLogin,
  onEmployeeRegister,
  onManagerLogin,
  users,
  employees,
}) => {
  const [activeMode, setActiveMode] = useState<'EMPLOYEE_LOGIN' | 'EMPLOYEE_REGISTER' | 'MANAGER_LOGIN'>('EMPLOYEE_LOGIN');

  // Employee Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPosition, setRegPosition] = useState<Position>('Waiter');
  const [regIsShared, setRegIsShared] = useState(true);
  const [regHourlyRate, setRegHourlyRate] = useState<number>(18);
  const [regMaxHours, setRegMaxHours] = useState<number>(38);
  const [regSuccessMsg, setRegSuccessMsg] = useState(false);

  // Employee Quick Login State
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;

    onEmployeeRegister({
      name: regName,
      email: regEmail,
      phone: regPhone,
      position: regPosition,
      isSharedStaff: regIsShared,
      hourlyRate: Number(regHourlyRate),
      maxWeeklyHours: Number(regMaxHours),
    });

    setRegSuccessMsg(true);
    setTimeout(() => {
      setRegSuccessMsg(false);
      setActiveMode('EMPLOYEE_LOGIN');
    }, 1500);
  };

  const handleQuickEmployeeLogin = (emp: Employee) => {
    const matchedUser = users.find((u) => u.email.toLowerCase() === emp.email.toLowerCase()) || {
      id: `usr-${emp.id}`,
      name: emp.name,
      email: emp.email,
      role: 'Employee' as const,
      employeeId: emp.id,
      restaurantId: 'rest-1',
    };
    onEmployeeLogin(matchedUser);
  };

  const managerUser = users.find((u) => u.role === 'Manager') || users[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-600/30">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
              StaffSync Pro
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                2 Restoran Ortak Portalı
              </span>
            </h1>
            <p className="text-xs text-slate-400">Bistro Bella & Trattoria Milano Vardiya Portalı</p>
          </div>
        </div>

        <button
          onClick={() => onManagerLogin(managerUser)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Yönetici Girişi (Manager Portal)</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto px-6 py-10 z-10 flex flex-col lg:flex-row items-stretch gap-8 my-auto">
        {/* Left Side: Informational Hero Banner */}
        <div className="lg:w-1/2 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl backdrop-blur-md">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Çalışan Vardiya & Müsaitlik Giriş Sistemi</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
              Çalışma Günlerinizi ve Şube Tercihlerinizi Bildirin.
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Bistro Bella ve Trattoria Milano restoranlarında görev alan çalışanlar için hazırlanmış ortak vardiya bildirimi platformudur.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white">Çalışmak İstediğiniz Günleri Seçin</div>
                  <div className="text-slate-400">Haftalık hangi günlerde izinli veya müsait olduğunuzu belirtin.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white">2 Restoran (Ottensen & Altona) Tercihi</div>
                  <div className="text-slate-400">Bistro Bella veya Trattoria Milano şubelerindeki müsaitliğinizi bildirin.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white">Maksimum Saat Sınırı Belirleyin</div>
                  <div className="text-slate-400">Haftalık hedef çalışma saati limitinizi yöneticiye iletin.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Standort Ottensen & Altona</span>
            <span className="font-mono text-blue-400">v2.4 Shared-Staff System</span>
          </div>
        </div>

        {/* Right Side: Auth Card (Login or Register) */}
        <div className="lg:w-1/2 bg-white text-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMode('EMPLOYEE_LOGIN')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeMode === 'EMPLOYEE_LOGIN'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Çalışan Girişi</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('EMPLOYEE_REGISTER')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeMode === 'EMPLOYEE_REGISTER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Yeni Kayıt Ol</span>
              </button>
            </div>

            {/* EMPLOYEE LOGIN FORM */}
            {activeMode === 'EMPLOYEE_LOGIN' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Çalışan Hesabına Giriş Yap</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Müsaitlik durumunuzu ve vardiya tercihlerinizi girmek için profilinizi seçin veya e-posta ile giriş yapın.
                  </p>
                </div>

                {/* Direct Demo Account Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kayıtlı Çalışan Listesinden Seçerek Hızlı Giriş Yap:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleQuickEmployeeLogin(emp)}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700">
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {emp.position} • {emp.isSharedStaff ? 'Ortak Çalışan' : 'Garson'}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Login Input */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">Veya E-posta Adresinizle Giriş Yapın:</label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const targetEmp = employees.find((emp) => emp.email.toLowerCase() === regEmail.toLowerCase());
                      if (targetEmp) {
                        handleQuickEmployeeLogin(targetEmp);
                      } else if (employees.length > 0) {
                        handleQuickEmployeeLogin(employees[0]);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="email"
                      required
                      placeholder="calisan@restoran.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Giriş Yap
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* EMPLOYEE REGISTRATION FORM */}
            {activeMode === 'EMPLOYEE_REGISTER' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Yeni Çalışan Kaydı</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Restoran ekibine katılın ve haftalık vardiya isteklerinizi girmeye başlayın.
                  </p>
                </div>

                {regSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Kaydınız tamamlandı! Giriş ekranına yönlendiriliyorsunuz...</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ad Soyad (Full Name):</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Örn: Mehmet Yılmaz"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">E-posta Adresi:</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="mehmet@restoran.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Telefon Numarası:</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="0532 000 0000"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Görev / Pozisyon:</label>
                      <select
                        value={regPosition}
                        onChange={(e) => setRegPosition(e.target.value as Position)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                      >
                        <option value="Waiter">Garson (Waiter)</option>
                        <option value="Chef">Aşçı / Şef (Chef)</option>
                        <option value="Barista">Barista / Barmen</option>
                        <option value="Kitchen Helper">Mutfak Yardımcısı</option>
                        <option value="Dishwasher">Bulaşıkçı (Dishwasher)</option>
                        <option value="Host">Karşılama / Host</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Maks. Haftalık Saat:</label>
                      <input
                        type="number"
                        min={10}
                        max={60}
                        value={regMaxHours}
                        onChange={(e) => setRegMaxHours(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Shared Staff Checkbox */}
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regIsShared}
                        onChange={(e) => setRegIsShared(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="font-bold text-slate-800 text-xs">
                        2 Restoranda Da Çalışabilirim (Bistro Bella + Trattoria Milano)
                      </span>
                    </label>
                    <p className="text-[10px] text-slate-500 mt-1 pl-6">
                      İşaretlendiğinde profiliniz her iki restoranın ortak vardiya planına eklenir.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Kayıt Ol ve Müsaitlik Sayfasına Git</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>StaffSync Pro © 2026</span>
            <button
              onClick={() => onManagerLogin(managerUser)}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Yönetici Paneline Geçiş Yap →
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900/60 z-10">
        Bistro Bella (Ottensen) & Trattoria Milano (Altona) Ortak Vardiya Planlama ve Otomatik Çizelge Portalı.
      </footer>
    </div>
  );
};
