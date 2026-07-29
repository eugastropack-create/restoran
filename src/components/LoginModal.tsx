import React, { useState } from 'react';
import { X, Building2, User, Mail, Phone, Check, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: { restaurantName: string; managerName: string; email: string; phone?: string }) => void;
  onLogin: (email: string) => void;
  users: UserType[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  onLogin,
  users,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  // Register state
  const [restaurantName, setRestaurantName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({
      restaurantName,
      managerName,
      email,
      phone,
    });
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginEmail);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              {mode === 'REGISTER' ? 'Neues Restaurant registrieren' : 'Manager-Anmeldung'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'REGISTER'
                ? 'Neuen Dienstplan-Arbeitsbereich erstellen'
                : 'Melden Sie sich an, um Ihren Dienstplan zu verwalten'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
              mode === 'REGISTER' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-slate-500'
            }`}
          >
            Restaurant registrieren
          </button>
          <button
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
              mode === 'LOGIN' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-slate-500'
            }`}
          >
            Anmelden
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {mode === 'REGISTER' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name des Standorts</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="z.B. Restoran 1"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vollständiger Name des Managers</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="z.B. Sarah Jenkins"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manager E-Mail-Adresse</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="manager@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefonnummer</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="0170 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>Arbeitsbereich erstellen & Dienstplan starten</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-Mail-Adresse</label>
                <input
                  type="email"
                  required
                  placeholder="manager@bistro.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow transition-colors cursor-pointer"
              >
                Anmelden
              </button>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Oder Demo-Konto zum Anmelden wählen:
                </span>
                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        onLogin(u.email);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-800 font-semibold flex items-center justify-between border border-slate-200 cursor-pointer"
                    >
                      <span>{u.name} ({u.role})</span>
                      <span className="text-[10px] text-blue-700">{u.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
