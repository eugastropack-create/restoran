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
import { api } from './lib/api';
import {
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
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Manager by default
  const [restaurant, setRestaurant] = useState<Restaurant | null>(INITIAL_RESTAURANT);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [availabilityRequests, setAvailabilityRequests] = useState<AvailabilityRequest[]>(
    INITIAL_AVAILABILITY_REQUESTS
  );

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [defaultShiftDate, setDefaultShiftDate] = useState<string | undefined>(undefined);
  const [defaultShiftPosition, setDefaultShiftPosition] = useState<Position | undefined>(
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
        const [restData, empData, shiftData, reqData] = await Promise.all([
          api.getRestaurant().catch(() => INITIAL_RESTAURANT),
          api.getEmployees().catch(() => INITIAL_EMPLOYEES),
          api.getShifts().catch(() => INITIAL_SHIFTS),
          api.getAvailabilityRequests().catch(() => INITIAL_AVAILABILITY_REQUESTS),
        ]);

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
  const handleOpenAddShift = (date?: string, position?: Position) => {
    setEditingShift(null);
    setDefaultShiftDate(date);
    setDefaultShiftPosition(position);
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async (shiftData: Partial<Shift>) => {
    try {
      if (shiftData.id) {
        const updated = await api.updateShift(shiftData.id, shiftData).catch(() => ({
          ...shifts.find((s) => s.id === shiftData.id)!,
          ...shiftData,
        }));
        setShifts(shifts.map((s) => (s.id === updated.id ? (updated as Shift) : s)));
        showToast('Shift details updated.');
      } else {
        const newShift = await api.createShift(shiftData).catch(() => ({
          id: 'shift-' + Date.now(),
          restaurantId: restaurant?.id || 'rest-1',
          date: shiftData.date || new Date().toISOString().split('T')[0],
          startTime: shiftData.startTime || '09:00',
          endTime: shiftData.endTime || '17:00',
          position: shiftData.position || 'Waiter',
          assignedEmployeeId: shiftData.assignedEmployeeId || null,
          notes: shiftData.notes || '',
          isPublished: false,
        }));
        setShifts([...shifts, newShift as Shift]);
        showToast('New shift created successfully.');
      }
    } catch (err) {
      showToast('Error saving shift', 'error');
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
        const { runAutoScheduler } = require('./lib/schedulerEngine');
        return runAutoScheduler(shifts, employees, options);
      });

      if (result.success) {
        setShifts(result.generatedShifts);
        showToast(
          `Auto-Scheduler assigned ${result.assignedShiftsCount} shifts (${result.unfilledShiftsCount} unfilled).`
        );
      }
      return result;
    } catch (err) {
      showToast('Auto-scheduler error', 'error');
      throw err;
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
    try {
      const created = await api.createEmployee(empData).catch(() => {
        const newEmp: Employee = {
          id: 'emp-' + Date.now(),
          restaurantId: restaurant?.id || 'rest-1',
          name: empData.name || 'New Staff',
          email: empData.email || 'staff@restaurant.com',
          phone: empData.phone || '(555) 000-0000',
          position: empData.position || 'Waiter',
          employmentType: empData.employmentType || 'Full-time',
          maxWeeklyHours: empData.maxWeeklyHours || 40,
          hourlyRate: empData.hourlyRate || 18.0,
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

      setEmployees([...employees, created]);

      // Add user record
      const newUser: User = {
        id: 'usr-' + Date.now(),
        email: created.email,
        name: created.name,
        role: 'Employee',
        restaurantId: restaurant?.id || 'rest-1',
        employeeId: created.id,
      };
      setUsers([...users, newUser]);

      showToast(`Employee profile created for ${created.name}`);
    } catch (err) {
      showToast('Failed to create employee profile', 'error');
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
    status: 'Approved' | 'Rejected'
  ) => {
    try {
      const updated = await api.updateAvailabilityRequestStatus(id, status).catch(() => {
        const req = availabilityRequests.find((r) => r.id === id)!;
        return { ...req, status };
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

      showToast(`Request ${status.toLowerCase()}.`);
    } catch (err) {
      showToast('Failed to update status', 'error');
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
      showToast('User email not found. Try manager@bistro.com', 'error');
    }
  };

  const currentEmp = employees.find((e) => e.id === currentUser?.employeeId) || null;

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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        onSwitchUser={handleSwitchUser}
        onOpenAutoScheduler={() => setIsAutoSchedulerOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={calculateStats()}
            employees={employees}
            shifts={shifts}
            availabilityRequests={availabilityRequests}
            onNavigateTab={setActiveTab}
            onOpenAutoScheduler={() => setIsAutoSchedulerOpen(true)}
            onOpenAddShift={() => handleOpenAddShift()}
            onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleCalendarView
            shifts={shifts}
            employees={employees}
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
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'export' && (
          <ExportScheduleView shifts={shifts} employees={employees} restaurant={restaurant} />
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
        defaultDate={defaultShiftDate}
        defaultPosition={defaultShiftPosition}
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
