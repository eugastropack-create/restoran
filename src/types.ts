export type Position = 'Teammitglied';

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
  password?: string;
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
  restaurantId: string; // Primary restaurant ID
  assignedRestaurants?: string[]; // Restaurant IDs where employee can be scheduled (e.g. ['rest-1', 'rest-2'])
  isSharedStaff?: boolean; // Flag for shared employees working across 2 restaurants
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
  restaurantId: string; // 'rest-1' or 'rest-2'
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
  preferredRestaurantId?: string; // 'rest-1', 'rest-2', or 'ALL'
  dayRestaurantPreferences?: Partial<Record<DayOfWeek, string>>; // e.g. { Monday: 'rest-1', Friday: 'rest-2' }
  selectedWeek?: string; // e.g. '1. Hafta', '2. Hafta', '3. Hafta'
  dayAvailabilityTypes?: Partial<Record<DayOfWeek, 'Tam Gün' | 'Yarım Gün (Sabah)' | 'Yarım Gün (Akşam)' | 'İzinli'>>;
  reason?: string;
  changeRequestReason?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'ChangeRequested' | 'Unlocked';
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
