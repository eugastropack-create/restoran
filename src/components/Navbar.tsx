import React from 'react';
import {
  Calendar,
  Users,
  LayoutDashboard,
  Clock,
  Printer,
  Sparkles,
  UserCheck,
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
                  2 Restaurants & Gemeinsames Team
                </span>
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
                  Wochenplan
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
                  Mitarbeiter
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
                  Verfügbarkeit
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
                  Export & Drucken
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
                  Verfügbarkeit & Anfragen
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
                  Meine Schichten
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
                  Dienstplan-Ansicht
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
                <span>Autom. Dienstplan erstellen</span>
              </button>
            )}

            {/* User Profile Badge & Sign Out */}
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
                  <div className="text-[10px] text-blue-400 font-medium">{currentUser?.role === 'Manager' ? 'Manager' : 'Mitarbeiter'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-700/60">
                    <div className="font-bold text-white text-xs">{currentUser?.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium truncate">{currentUser?.email}</div>
                    <div className="mt-1">
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                        {currentUser?.role === 'Manager' ? 'Manager-Portal' : 'Mitarbeiter-Konto'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 text-xs text-rose-300 hover:text-white px-3 py-2 rounded-lg hover:bg-rose-900/40 transition-colors font-bold"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Abmelden</span>
                    </button>
                    {/* Removed 'Neues Restaurant hinzufügen' button per user request */}
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
              Wochenplan
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`p-2 rounded ${activeTab === 'employees' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Mitarbeiter
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`p-2 rounded ${activeTab === 'requests' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Verfügbarkeit
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
              Schichten
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`p-2 rounded ${activeTab === 'requests' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Verfügbarkeit
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`p-2 rounded ${activeTab === 'export' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
            >
              Dienstplan
            </button>
          </>
        )}
      </div>
    </header>
  );
};
