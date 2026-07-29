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
  Lock,
  X,
  AlertCircle,
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
    password: string;
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
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPosition, setRegPosition] = useState<Position>('Çalışan');
  const [regIsShared, setRegIsShared] = useState(true);
  const [regHourlyRate, setRegHourlyRate] = useState<number>(18);
  const [regMaxHours, setRegMaxHours] = useState<number>(38);
  const [regSuccessMsg, setRegSuccessMsg] = useState(false);
  const [regErrorMsg, setRegErrorMsg] = useState('');

  // Employee Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Quick Employee Password Modal State
  const [empModalTarget, setEmpModalTarget] = useState<Employee | null>(null);
  const [empModalPassword, setEmpModalPassword] = useState('');
  const [empModalError, setEmpModalError] = useState('');

  // Manager Password Protection State
  const [isManagerPasswordModalOpen, setIsManagerPasswordModalOpen] = useState(false);
  const [managerPassword, setManagerPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg('');
    if (!regName || !regEmail || !regPassword) {
      setRegErrorMsg('Bitte füllen Sie Name, E-Mail und Passwort aus.');
      return;
    }
    if (regPassword.length < 4) {
      setRegErrorMsg('Das Passwort muss mindestens 4 Zeichen lang sein.');
      return;
    }

    onEmployeeRegister({
      name: regName,
      email: regEmail,
      phone: regPhone,
      position: regPosition,
      isSharedStaff: regIsShared,
      hourlyRate: Number(regHourlyRate),
      maxWeeklyHours: Number(regMaxHours),
      password: regPassword,
    });

    setRegSuccessMsg(true);
    setTimeout(() => {
      setRegSuccessMsg(false);
      setActiveMode('EMPLOYEE_LOGIN');
    }, 1500);
  };

  const handleDirectEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('E-Mail und Passwort sind erforderlich.');
      return;
    }

    const matchedUser = users.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase());

    if (!matchedUser) {
      setLoginError('Mit dieser E-Mail-Adresse wurde kein Mitarbeiter gefunden.');
      return;
    }

    const validPassword = matchedUser.password || '123456';
    if (loginPassword !== validPassword) {
      setLoginError('Falsches Passwort! Bitte versuchen Sie es erneut.');
      return;
    }

    onEmployeeLogin(matchedUser);
  };

  const handleQuickEmpClick = (emp: Employee) => {
    setEmpModalTarget(emp);
    setEmpModalPassword('');
    setEmpModalError('');
  };

  const handleEmpModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empModalTarget) return;

    const matchedUser = users.find((u) => u.email.toLowerCase() === empModalTarget.email.toLowerCase()) || {
      id: `usr-${empModalTarget.id}`,
      name: empModalTarget.name,
      email: empModalTarget.email,
      role: 'Employee' as const,
      employeeId: empModalTarget.id,
      restaurantId: 'rest-1',
      password: '123456',
    };

    const validPassword = matchedUser.password || '123456';
    if (empModalPassword === validPassword) {
      setEmpModalTarget(null);
      onEmployeeLogin(matchedUser);
    } else {
      setEmpModalError('Falsches Passwort! (Standard-Passwort: 123456)');
    }
  };

  const managerUser = users.find((u) => u.role === 'Manager') || users[0];

  const handleOpenManagerPasswordModal = () => {
    setManagerPassword('');
    setPasswordError('');
    setIsManagerPasswordModalOpen(true);
  };

  const handleManagerPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (managerPassword === 'serkan1907') {
      setIsManagerPasswordModalOpen(false);
      onManagerLogin(managerUser);
    } else {
      setPasswordError('Falsches Passwort! Bitte fragen Sie Ihren Manager.');
    }
  };

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
                Dienstplan-Portal
              </span>
            </h1>
            <p className="text-xs text-slate-400">Mitarbeiter-Schicht & Verfügbarkeitsportal</p>
          </div>
        </div>

        <button
          onClick={handleOpenManagerPasswordModal}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Manager-Anmeldung</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto px-6 py-10 z-10 flex flex-col lg:flex-row items-stretch gap-8 my-auto">
        {/* Left Side: Informational Hero Banner */}
        <div className="lg:w-1/2 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl backdrop-blur-md">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mitarbeiter Schicht- & Verfügbarkeitssystem</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
              Geben Sie Ihre Arbeitstage und Schichtverfügbarkeiten an.
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Praktische Dienstplan- und Verfügbarkeitsplattform für Mitarbeiter.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white">Wählen Sie Ihre Arbeitstage</div>
                  <div className="text-slate-400">Geben Sie an, an welchen Tagen Sie verfügbar oder abwesend sind.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white">Maximale Wochenstunden festlegen</div>
                  <div className="text-slate-400">Teilen Sie Ihr gewünschtes wöchentliches Stundenlimit der Betriebsleitung mit.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Standort-Dienstplansystem</span>
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
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'EMPLOYEE_LOGIN'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Mitarbeiter-Login</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('EMPLOYEE_REGISTER')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'EMPLOYEE_REGISTER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Neuregistrierung</span>
              </button>
            </div>

            {/* EMPLOYEE LOGIN FORM */}
            {activeMode === 'EMPLOYEE_LOGIN' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Mitarbeiter-Anmeldung</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Melden Sie sich an, um Ihre Verfügbarkeiten und Schichteinstellungen einzugeben.
                  </p>
                </div>

                {/* Direct Email & Password Login Form */}
                <form onSubmit={handleDirectEmployeeLogin} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <LogIn className="w-4 h-4 text-blue-600" />
                    <span>Login mit E-Mail und Passwort:</span>
                  </div>

                  {loginError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">E-Mail-Adresse:</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="mitarbeiter@restoran.com"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          setLoginError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Passwort:</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          setLoginError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Anmelden</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Direct Quick Account Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Oder wählen Sie Ihr Mitarbeiterprofil:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleQuickEmpClick(emp)}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700 flex items-center gap-1">
                            <span>{emp.name}</span>
                            <Lock className="w-3 h-3 text-slate-400" />
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Mitarbeiter
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EMPLOYEE REGISTRATION FORM */}
            {activeMode === 'EMPLOYEE_REGISTER' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Neuer Mitarbeiter Registrierung</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Treten Sie dem Team bei und tragen Sie Ihre Schichtwünsche ein.
                  </p>
                </div>

                {regSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Registrierung erfolgreich! Sie werden weitergeleitet...</span>
                  </div>
                )}

                {regErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>{regErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Vollständiger Name:</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="z.B. Max Mustermann"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">E-Mail-Adresse:</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="max@restoran.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Passwort festlegen:</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          placeholder="Mindestens 4 Zeichen"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Telefonnummer:</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="0170 000 0000"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Registrieren & Anmelden</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>StaffSync Pro © 2026</span>
            <button
              onClick={handleOpenManagerPasswordModal}
              className="text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Zum Manager-Portal →</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900/60 z-10">
        Dienstplan- und Schichtverwaltungsportal.
      </footer>

      {/* QUICK EMPLOYEE PASSWORD MODAL OVERLAY */}
      {empModalTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEmpModalTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">{empModalTarget.name}</h3>
                <p className="text-xs text-slate-400">{empModalTarget.email} • Passwort eingeben</p>
              </div>
            </div>

            <form onSubmit={handleEmpModalSubmit} className="space-y-4">
              {empModalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{empModalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Mitarbeiter-Passwort:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    autoFocus
                    required
                    placeholder="••••••••"
                    value={empModalPassword}
                    onChange={(e) => {
                      setEmpModalPassword(e.target.value);
                      setEmpModalError('');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Standard Demo-Passwort: <code className="text-blue-400 font-mono">123456</code></p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmpModalTarget(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Anmelden</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGER PASSWORD MODAL OVERLAY */}
      {isManagerPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsManagerPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Manager-Authentifizierung</h3>
                <p className="text-xs text-slate-400">Passwort für Manager-Zugang eingeben</p>
              </div>
            </div>

            <form onSubmit={handleManagerPasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Manager-Passwort:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    autoFocus
                    required
                    placeholder="••••••••"
                    value={managerPassword}
                    onChange={(e) => {
                      setManagerPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManagerPasswordModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Anmelden</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
