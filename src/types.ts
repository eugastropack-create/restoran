export type Position = 'Waiter' | 'Chef' | 'Cashier' | 'Barista' | 'Kitchen staff';

export type EmploymentType = 'Full-time' | 'Part-time';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type UserRole = 'Manager' | 'Employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId: string;
  employeeId?: string; // links user to employee record if role is Employee
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerName: string;
  currency: string;
  openingHours: Record<string, { open: string; close: string }>;
}

export interface Employee {
  id: string;
  restaurantId: string;
  name: string;
  email: string;
  phone: string;
  position: Position;
  secondaryPositions?: Position[];
  employmentType: EmploymentType;
  maxWeeklyHours: number;
  hourlyRate: number;
  availableDays: DayOfWeek[];
  unavailableDays: DayOfWeek[];
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
}

export interface Shift {
  id: string;
  restaurantId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  position: Position;
  assignedEmployeeId: string | null; // null if unassigned
  notes?: string;
  isPublished: boolean;
  color?: string;
}

export interface AvailabilityRequest {
  id: string;
  restaurantId: string;
  employeeId: string;
  employeeName: string;
  requestedAvailableDays: DayOfWeek[];
  requestedUnavailableDays: DayOfWeek[];
  requestedMaxHours: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface AutoScheduleOptions {
  weekStartDate: string; // YYYY-MM-DD (Monday)
  clearExistingDrafts: boolean;
  balanceHours: boolean;
  respectMaxHours: boolean;
  respectUnavailableDays: boolean;
  strictPositionMatch: boolean;
  requiredShiftsTemplate?: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    position: Position;
    countRequired: number;
  }[];
}

export interface AutoScheduleLog {
  shiftId: string;
  date: string;
  position: Position;
  startTime: string;
  endTime: string;
  status: 'Assigned' | 'Unfilled';
  assignedEmployeeName?: string;
  reason: string;
}

export interface AutoScheduleResult {
  success: boolean;
  totalShiftsProcessed: number;
  assignedShiftsCount: number;
  unfilledShiftsCount: number;
  logs: AutoScheduleLog[];
  generatedShifts: Shift[];
}

export interface DashboardStats {
  totalEmployees: number;
  totalHoursThisWeek: number;
  publishedShiftsCount: number;
  unassignedShiftsCount: number;
  estimatedWeeklyPayroll: number;
  pendingAvailabilityRequests: number;
}
