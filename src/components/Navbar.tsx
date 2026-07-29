import React from 'react';
import {
  Calendar,
  Users,
  LayoutDashboard,
  Clock,
  Printer,
  Sparkles,
  UserCheck,
  Building2,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { User, Restaurant } from '../types';

interface NavbarProps {
  currentUser: User | null;
  restaurant: Restaurant | null;
  restaurants: Restaurant[];
  selectedRestaurantFilter: string;
  onSelectRestaurantFilter: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  users: User[];
  onSwitchUser: (user: User) => void;
  onOpenAutoScheduler: () => void;
  onOpenLoginModal: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  restaurant,
  restaurants,
  selectedRestaurantFilter,
  onSelectRestaurantFilter,
  activeTab,
  setActiveTab,
  users,
  onSwitchUser,
  onOpenAutoScheduler,
  onOpenLoginModal,
  onSignOut,
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const isManager = currentUser?.role === 'Manager';

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Restaurant Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white text-base shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-white">StaffSync Pro</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-medium">
                  2 Restoran Ortak Çalışan
                </span>
              </div>

              {/* Restaurant Selection Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <select
                  value={selectedRestaurantFilter}
                  onChange={(e) => onSelectRestaurantFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white font-medium text-xs rounded px-2 py-0.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL"> Her İki Restoran (Ortak Görünüm)</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {isManager ? (
              <>
                <button
                  id="nav-dashboard-btn"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  id="nav-schedule-btn"
                  onClick={() => setActiveTab('schedule')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'schedule'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Weekly Schedule
                </button>

                <button
                  id="nav-employees-btn"
                  onClick={() => setActiveTab('employees')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'employees'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Employees
                </button>

                <button
                  id="nav-requests-btn"
                  onClick={() => setActiveTab('requests')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'requests'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Availability
                </button>

                <button
                  id="nav-export-btn"
                  onClick={() => setActiveTab('export')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'export'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  Export & Print
                </button>
              </>
            ) : (
              <>
                <button
                  id="nav-my-availability-btn"
                  onClick={() => setActiveTab('requests')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'requests'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Clock className="w-4 h-4 text-blue-400" />
                  Müsaitlik & Vardiya İsteği
                </button>

                <button
                  id="nav-portal-btn"
                  onClick={() => setActiveTab('portal')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'portal'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Benim Vardiyalarım
                </button>

                <button
                  id="nav-print-btn"
                  onClick={() => setActiveTab('export')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'export'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  Standort Vardiya Çizelgesi
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: Auto-Generator Button & User Selector */}
          <div className="flex items-center gap-3">
            {isManager && (
              <button
                id="btn-auto-schedule-header"
                onClick={onOpenAutoScheduler}
                className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-all transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate Schedule</span>
              </button>
            )}

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {currentUser?.name.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white leading-tight">{currentUser?.name}</div>
                  <div className="text-[10px] text-blue-400 font-medium">{currentUser?.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-700/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Account (Demo Users)
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-700/60 transition-colors ${
                          u.id === currentUser?.id ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className={`w-3.5 h-3.5 ${u.role === 'Manager' ? 'text-blue-400' : 'text-slate-400'}`} />
                          <div>
                            <div className="font-semibold">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            u.role === 'Manager'
                              ? 'bg-blue-400/20 text-blue-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-700/60 pt-1.5 px-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 text-xs text-rose-300 hover:text-white px-2 py-1.5 rounded hover:bg-rose-900/40 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      Çıkış Yap / Giriş Ekranına Dön
                    </button>
                    {isManager && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenLoginModal();
                        }}
                        className="w-full flex items-center gap-2 text-xs text-slate-300 hover:text-white px-2 py-1.5 rounded hover:bg-slate-700 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Yeni Restoran / Şube Ekle
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 py-2 flex items-center justify-around text-xs">
        {isManager ? (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-2 rounded ${activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`p-2 rounded ${activeTab === 'schedule' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Schedule
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`p-2 rounded ${activeTab === 'employees' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`p-2 rounded ${activeTab === 'requests' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Requests
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`p-2 rounded ${activeTab === 'export' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Export
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('portal')}
              className={`p-2 rounded ${activeTab === 'portal' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              My Shifts
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`p-2 rounded ${activeTab === 'requests' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`p-2 rounded ${activeTab === 'export' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              View Roster
            </button>
          </>
        )}
      </div>
    </header>
  );
};
