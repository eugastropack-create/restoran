import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScheduleCalendarView } from './components/ScheduleCalendarView';
import { ShiftModal } from './components/ShiftModal';
import { AutoSchedulerModal } from './components/AutoSchedulerModal';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { AvailabilityRequestsView } from './components/AvailabilityRequestsView';
import { EmployeePortalView } from './components/EmployeePortalView';
import { ExportScheduleView } from './components/ExportScheduleView';
import { LoginModal } from './components/LoginModal';
import { AuthPortal } from './components/AuthPortal';
import { api } from './lib/api';
import { runAutoScheduler } from './lib/schedulerEngine';
import {
  INITIAL_RESTAURANTS,
  INITIAL_RESTAURANT,
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_AVAILABILITY_REQUESTS,
} from './lib/mockData';
import {
  Restaurant,
  User,
  Employee,
  Shift,
  AvailabilityRequest,
  DashboardStats,
  Position,
  AutoScheduleOptions,
  AutoScheduleResult,
} from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Starts at AuthPortal Landing Page
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(INITIAL_RESTAURANTS[0]);
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState<string>('ALL');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [availabilityRequests, setAvailabilityRequests] = useState<AvailabilityRequest[]>(
    INITIAL_AVAILABILITY_REQUESTS
  );

  const [activeTab, setActiveTab] = useState<string>('requests');

  // Modals state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [defaultShiftDate, setDefaultShiftDate] = useState<string | undefined>(undefined);
  const [defaultShiftPosition, setDefaultShiftPosition] = useState<Position | undefined>(
    undefined
  );
  const [defaultShiftRestaurantId, setDefaultShiftRestaurantId] = useState<string | undefined>(
    undefined
  );

  const [isAutoSchedulerOpen, setIsAutoSchedulerOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data from API server if available, fallback to mock store
  useEffect(() => {
    async function loadData() {
      try {
        const [restsData, restData, empData, shiftData, reqData] = await Promise.all([
          api.getRestaurants().catch(() => INITIAL_RESTAURANTS),
          api.getRestaurant().catch(() => INITIAL_RESTAURANT),
          api.getEmployees().catch(() => INITIAL_EMPLOYEES),
          api.getShifts().catch(() => INITIAL_SHIFTS),
          api.getAvailabilityRequests().catch(() => INITIAL_AVAILABILITY_REQUESTS),
        ]);

        if (restsData && restsData.length > 0) setRestaurants(restsData);
        if (restData) setRestaurant(restData);
        if (empData) setEmployees(empData);
        if (shiftData) setShifts(shiftData);
        if (reqData) setAvailabilityRequests(reqData);
      } catch (err) {
        console.warn('API fetch fallback to local memory state:', err);
      }
    }
    loadData();
  }, []);

  // Compute stats
  const calculateStats = (): DashboardStats => {
    let totalHours = 0;
    let estimatedPayroll = 0;

    shifts.forEach((s) => {
      const [startH, startM] = s.startTime.split(':').map(Number);
      const [endH, endM] = s.endTime.split(':').map(Number);
      let dur = (endH * 60 + endM - (startH * 60 + startM)) / 60;
      if (dur < 0) dur += 24;

      totalHours += dur;

      if (s.assignedEmployeeId) {
        const emp = employees.find((e) => e.id === s.assignedEmployeeId);
        if (emp) {
          estimatedPayroll += dur * emp.hourlyRate;
        }
      }
    });

    return {
      totalEmployees: employees.length,
      totalHoursThisWeek: Math.round(totalHours * 10) / 10,
      publishedShiftsCount: shifts.filter((s) => s.isPublished).length,
      unassignedShiftsCount: shifts.filter((s) => !s.assignedEmployeeId).length,
      estimatedWeeklyPayroll: Math.round(estimatedPayroll),
      pendingAvailabilityRequests: availabilityRequests.filter((r) => r.status === 'Pending').length,
    };
  };

  // Handlers for Shifts
  const handleOpenAddShift = (date?: string, position?: Position, restaurantId?: string) => {
    setEditingShift(null);
    setDefaultShiftDate(date);
    setDefaultShiftPosition(position);
    setDefaultShiftRestaurantId(restaurantId);
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async (shiftData: Partial<Shift>) => {
    const targetRestId =
      shiftData.restaurantId ||
      defaultShiftRestaurantId ||
      (selectedRestaurantFilter !== 'ALL' ? selectedRestaurantFilter : restaurant?.id || 'rest-1');

    try {
      if (shiftData.id) {
        const updated = await api.updateShift(shiftData.id, { ...shiftData, restaurantId: targetRestId }).catch(() => ({
          ...shifts.find((s) => s.id === shiftData.id)!,
          ...shiftData,
          restaurantId: targetRestId,
        }));
        setShifts(shifts.map((s) => (s.id === updated.id ? (updated as Shift) : s)));
        showToast('Schichtdetails aktualisiert.');
      } else {
        const newShift = await api.createShift({ ...shiftData, restaurantId: targetRestId }).catch(() => ({
          id: 'shift-' + Date.now(),
          restaurantId: targetRestId,
          date: shiftData.date || new Date().toISOString().split('T')[0],
          startTime: shiftData.startTime || '12:00',
          endTime: shiftData.endTime || '17:00',
          position: shiftData.position || 'Çalışan',
          assignedEmployeeId: shiftData.assignedEmployeeId || null,
          notes: shiftData.notes || '',
          isPublished: false,
        }));
        setShifts([...shifts, newShift as Shift]);
        showToast('Neue Schicht erfolgreich erstellt.');
      }
    } catch (err) {
      showToast('Fehler beim Speichern der Schicht', 'error');
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await api.deleteShift(shiftId).catch(() => null);
      setShifts(shifts.filter((s) => s.id !== shiftId));
      showToast('Shift deleted.');
    } catch (err) {
      showToast('Error deleting shift', 'error');
    }
  };

  // Handlers for Auto Scheduler
  const handleRunAutoScheduler = async (options: AutoScheduleOptions): Promise<AutoScheduleResult> => {
    try {
      const result = await api.autoGenerateSchedule(options).catch(() => {
        // Fallback local run
        return runAutoScheduler(shifts, employees, options);
      });

      if (result.success) {
        setShifts(result.generatedShifts);
        showToast(
          `Automatische Planung: ${result.assignedShiftsCount} Schichten zugewiesen (${result.unfilledShiftsCount} offen).`
        );
      }
      return result;
    } catch (err) {
      // Fallback in case api call threw uncaught exception
      const fallbackResult = runAutoScheduler(shifts, employees, options);
      setShifts(fallbackResult.generatedShifts);
      showToast(
        `Automatische Planung: ${fallbackResult.assignedShiftsCount} Schichten zugewiesen (${fallbackResult.unfilledShiftsCount} offen).`
      );
      return fallbackResult;
    }
  };

  const handlePublishSchedule = async (dates: string[]) => {
    try {
      await api.publishSchedule(dates).catch(() => null);
      setShifts(shifts.map((s) => (dates.includes(s.date) ? { ...s, isPublished: true } : s)));
      showToast(`Published schedule for week! Team notified.`);
    } catch (err) {
      showToast('Publish failed', 'error');
    }
  };

  // Handlers for Employees
  const handleAddEmployee = async (empData: Partial<Employee>) => {
    const targetRestId =
      empData.restaurantId ||
      (selectedRestaurantFilter !== 'ALL' ? selectedRestaurantFilter : restaurant?.id || 'rest-1');

    try {
      const created = await api.createEmployee({ ...empData, restaurantId: targetRestId }).catch(() => {
        const newEmp: Employee = {
          id: 'emp-' + Date.now(),
          restaurantId: targetRestId,
          assignedRestaurants: empData.assignedRestaurants || [targetRestId],
          name: empData.name || 'Neuer Mitarbeiter',
          email: empData.email || 'mitarbeiter@restaurant.de',
          phone: empData.phone || '+49 151 00000000',
          position: empData.position || 'Çalışan',
          employmentType: empData.employmentType || 'Full-time',
          maxWeeklyHours: empData.maxWeeklyHours || 40,
          hourlyRate: empData.hourlyRate || 18.5,
          availableDays: empData.availableDays || [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          unavailableDays: empData.unavailableDays || [],
          status: 'Active',
        };
        return newEmp;
      });

      setEmployees((prev) => [...prev, created]);

      // Add user record
      const newUser: User = {
        id: 'usr-' + Date.now(),
        email: created.email,
        name: created.name,
        role: 'Employee',
        restaurantId: targetRestId,
        employeeId: created.id,
      };
      setUsers((prev) => [...prev, newUser]);

      const restName = restaurants.find((r) => r.id === targetRestId)?.name || 'Restaurant';
      showToast(`Mitarbeiterprofil für ${created.name} (${restName}) erstellt`);
    } catch (err) {
      showToast('Fehler beim Erstellen des Mitarbeiterprofils', 'error');
    }
  };

  const handleUpdateEmployee = async (id: string, empData: Partial<Employee>) => {
    try {
      const updated = await api.updateEmployee(id, empData).catch(() => ({
        ...employees.find((e) => e.id === id)!,
        ...empData,
      }));
      setEmployees(employees.map((e) => (e.id === id ? (updated as Employee) : e)));
      showToast('Employee profile updated.');
    } catch (err) {
      showToast('Failed to update employee', 'error');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.deleteEmployee(id).catch(() => null);
      setEmployees(employees.filter((e) => e.id !== id));
      setShifts(
        shifts.map((s) => (s.assignedEmployeeId === id ? { ...s, assignedEmployeeId: null } : s))
      );
      showToast('Employee deleted.');
    } catch (err) {
      showToast('Failed to delete employee', 'error');
    }
  };

  // Handlers for Availability Requests
  const handleCreateAvailabilityRequest = async (reqData: Partial<AvailabilityRequest>) => {
    try {
      const created = await api.createAvailabilityRequest(reqData).catch(() => ({
        id: 'req-' + Date.now(),
        restaurantId: restaurant?.id || 'rest-1',
        employeeId: reqData.employeeId!,
        employeeName: reqData.employeeName!,
        requestedAvailableDays: reqData.requestedAvailableDays!,
        requestedUnavailableDays: reqData.requestedUnavailableDays!,
        requestedMaxHours: reqData.requestedMaxHours!,
        reason: reqData.reason || '',
        status: 'Pending' as const,
        createdAt: new Date().toISOString(),
      }));

      setAvailabilityRequests([created, ...availabilityRequests]);
      showToast('Availability request submitted.');
    } catch (err) {
      showToast('Failed to submit request', 'error');
    }
  };

  const handleUpdateAvailabilityRequestStatus = async (
    id: string,
    status: 'Approved' | 'Rejected' | 'ChangeRequested' | 'Unlocked',
    changeRequestReason?: string
  ) => {
    try {
      const updated = await api.updateAvailabilityRequestStatus(id, status, changeRequestReason).catch(() => {
        const req = availabilityRequests.find((r) => r.id === id)!;
        return { ...req, status, ...(changeRequestReason ? { changeRequestReason } : {}) };
      });

      setAvailabilityRequests(
        availabilityRequests.map((r) => (r.id === id ? (updated as AvailabilityRequest) : r))
      );

      // If approved, update employee profile in local state
      if (status === 'Approved') {
        const req = availabilityRequests.find((r) => r.id === id);
        if (req) {
          setEmployees(
            employees.map((e) =>
              e.id === req.employeeId
                ? {
                    ...e,
                    availableDays: req.requestedAvailableDays,
                    unavailableDays: req.requestedUnavailableDays,
                    maxWeeklyHours: req.requestedMaxHours,
                  }
                : e
            )
          );
        }
      }

      if (status === 'Unlocked') {
        showToast('Freigabe erteilt: Der Mitarbeiter kann nun eine neue Verfügbarkeit senden.');
      } else if (status === 'ChangeRequested') {
        showToast('Änderungsanfrage an den Manager gesendet.');
      } else {
        showToast(`Status auf ${status === 'Approved' ? 'Genehmigt' : 'Abgelehnt'} aktualisiert.`);
      }
    } catch (err) {
      showToast('Fehler beim Aktualisieren des Status', 'error');
    }
  };

  // User switcher
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'Employee') {
      setActiveTab('portal');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Switched account to ${user.name} (${user.role})`);
  };

  // Register new restaurant
  const handleRegisterRestaurant = async (data: {
    restaurantName: string;
    managerName: string;
    email: string;
    phone?: string;
  }) => {
    try {
      const res = await api.register(data).catch(() => {
        const newRest: Restaurant = {
          id: 'rest-' + Date.now(),
          name: data.restaurantName,
          address: 'Main Street 101',
          phone: data.phone || '(555) 000-0000',
          managerName: data.managerName,
          currency: '$',
          openingHours: INITIAL_RESTAURANT.openingHours,
        };
        const newUser: User = {
          id: 'usr-' + Date.now(),
          email: data.email,
          name: data.managerName,
          role: 'Manager',
          restaurantId: newRest.id,
        };
        return { user: newUser, restaurant: newRest };
      });

      setRestaurant(res.restaurant);
      setCurrentUser(res.user);
      setUsers([res.user, ...users]);
      setActiveTab('dashboard');
      showToast(`Workspace created for ${res.restaurant.name}!`);
    } catch (err) {
      showToast('Registration failed', 'error');
    }
  };

  const handleLoginUser = async (email: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      handleSwitchUser(found);
    } else {
      showToast('User email not found.', 'error');
    }
  };

  const handleEmployeeLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'Employee') {
      setActiveTab('requests');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Hoş geldiniz ${user.name}! Vardiya isteklerinizi girebilirsiniz.`);
  };

  const handleEmployeeRegister = (empData: {
    name: string;
    email: string;
    phone: string;
    position: Position;
    isSharedStaff: boolean;
    hourlyRate: number;
    maxWeeklyHours: number;
    password: string;
  }) => {
    const newEmpId = `emp-${Date.now()}`;
    const newEmp: Employee = {
      id: newEmpId,
      restaurantId: 'rest-1',
      assignedRestaurants: empData.isSharedStaff ? ['rest-1', 'rest-2'] : ['rest-1'],
      isSharedStaff: empData.isSharedStaff,
      name: empData.name,
      email: empData.email,
      phone: empData.phone,
      position: empData.position,
      employmentType: 'Full-time',
      hourlyRate: empData.hourlyRate,
      maxWeeklyHours: empData.maxWeeklyHours,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      unavailableDays: [],
      status: 'Active',
    };

    const newUser: User = {
      id: `usr-${newEmpId}`,
      name: empData.name,
      email: empData.email,
      role: 'Employee',
      employeeId: newEmpId,
      restaurantId: 'rest-1',
      password: empData.password,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setActiveTab('requests');
    showToast(`Kayıt tamamlandı! ${empData.name} olarak vardiya isteklerinizi belirtebilirsiniz.`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    showToast('Oturum kapatıldı.');
  };

  const currentEmp = employees.find((e) => e.id === currentUser?.employeeId) || null;

  // Render AuthPortal when no user is logged in
  if (!currentUser) {
    return (
      <AuthPortal
        onEmployeeLogin={handleEmployeeLogin}
        onEmployeeRegister={handleEmployeeRegister}
        onManagerLogin={(managerUser) => {
          setCurrentUser(managerUser);
          setActiveTab('dashboard');
          showToast(`Yönetici Girişi Yapıldı (${managerUser.name})`);
        }}
        users={users}
        employees={employees}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased flex flex-col">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold text-white border ${
              toastMessage.type === 'error'
                ? 'bg-rose-600 border-rose-500'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Navbar
        currentUser={currentUser}
        restaurant={restaurant}
        restaurants={restaurants}
        selectedRestaurantFilter={selectedRestaurantFilter}
        onSelectRestaurantFilter={setSelectedRestaurantFilter}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        onSwitchUser={handleSwitchUser}
        onOpenAutoScheduler={() => setIsAutoSchedulerOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={calculateStats()}
            employees={employees}
            shifts={selectedRestaurantFilter === 'ALL' ? shifts : shifts.filter((s) => s.restaurantId === selectedRestaurantFilter)}
            availabilityRequests={availabilityRequests}
            onNavigateTab={setActiveTab}
            onOpenAutoScheduler={() => setIsAutoSchedulerOpen(true)}
            onOpenAddShift={() => handleOpenAddShift()}
            onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleCalendarView
            shifts={selectedRestaurantFilter === 'ALL' ? shifts : shifts.filter((s) => s.restaurantId === selectedRestaurantFilter)}
            employees={employees}
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurantFilter}
            onOpenAddShift={handleOpenAddShift}
            onOpenEditShift={handleOpenEditShift}
            onDeleteShift={handleDeleteShift}
            onOpenAutoScheduler={() => setIsAutoSchedulerOpen(true)}
            onPublishSchedule={handlePublishSchedule}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagementView
            employees={employees}
            restaurants={restaurants}
            selectedRestaurantFilter={selectedRestaurantFilter}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            isAddOpen={isAddEmployeeOpen}
            setIsAddOpen={setIsAddEmployeeOpen}
          />
        )}

        {activeTab === 'requests' && (
          <AvailabilityRequestsView
            requests={availabilityRequests}
            currentUser={currentUser}
            employees={employees}
            restaurants={restaurants}
            onRequestSubmit={handleCreateAvailabilityRequest}
            onRequestStatusUpdate={handleUpdateAvailabilityRequestStatus}
          />
        )}

        {activeTab === 'portal' && (
          <EmployeePortalView
            currentUser={currentUser}
            employee={currentEmp}
            shifts={shifts}
            restaurant={restaurant}
            restaurants={restaurants}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'export' && (
          <ExportScheduleView shifts={selectedRestaurantFilter === 'ALL' ? shifts : shifts.filter((s) => s.restaurantId === selectedRestaurantFilter)} employees={employees} restaurant={restaurant} />
        )}
      </main>

      {/* Modals */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSaveShift={handleSaveShift}
        onDeleteShift={handleDeleteShift}
        initialShift={editingShift}
        employees={employees}
        restaurants={restaurants}
        defaultDate={defaultShiftDate}
        defaultPosition={defaultShiftPosition}
        defaultRestaurantId={defaultShiftRestaurantId}
      />

      <AutoSchedulerModal
        isOpen={isAutoSchedulerOpen}
        onClose={() => setIsAutoSchedulerOpen(false)}
        onRunAutoScheduler={handleRunAutoScheduler}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegister={handleRegisterRestaurant}
        onLogin={handleLoginUser}
        users={users}
      />
    </div>
  );
}
