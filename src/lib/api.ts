import {
  Restaurant,
  User,
  Employee,
  Shift,
  AvailabilityRequest,
  AutoScheduleOptions,
  AutoScheduleResult,
  DashboardStats,
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string) =>
    fetchJson<{ user: User; restaurant: Restaurant }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  register: (data: { restaurantName: string; managerName: string; email: string; phone?: string }) =>
    fetchJson<{ user: User; restaurant: Restaurant }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Restaurant
  getRestaurants: () => fetchJson<Restaurant[]>('/api/restaurants'),
  getRestaurant: () => fetchJson<Restaurant>('/api/restaurant'),
  updateRestaurant: (data: Partial<Restaurant>) =>
    fetchJson<Restaurant>('/api/restaurant', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Employees
  getEmployees: () => fetchJson<Employee[]>('/api/employees'),
  createEmployee: (employee: Partial<Employee>) =>
    fetchJson<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    }),
  updateEmployee: (id: string, employee: Partial<Employee>) =>
    fetchJson<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    }),
  deleteEmployee: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/employees/${id}`, {
      method: 'DELETE',
    }),

  // Shifts
  getShifts: () => fetchJson<Shift[]>('/api/shifts'),
  createShift: (shift: Partial<Shift>) =>
    fetchJson<Shift>('/api/shifts', {
      method: 'POST',
      body: JSON.stringify(shift),
    }),
  updateShift: (id: string, shift: Partial<Shift>) =>
    fetchJson<Shift>(`/api/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shift),
    }),
  deleteShift: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/shifts/${id}`, {
      method: 'DELETE',
    }),

  // Auto Scheduler Engine
  autoGenerateSchedule: (options: AutoScheduleOptions) =>
    fetchJson<AutoScheduleResult>('/api/schedules/auto-generate', {
      method: 'POST',
      body: JSON.stringify(options),
    }),

  publishSchedule: (dates?: string[]) =>
    fetchJson<{ success: boolean; totalShifts: number }>('/api/schedules/publish', {
      method: 'POST',
      body: JSON.stringify({ dates }),
    }),

  // Availability Requests
  getAvailabilityRequests: () => fetchJson<AvailabilityRequest[]>('/api/availability-requests'),
  createAvailabilityRequest: (reqData: Partial<AvailabilityRequest>) =>
    fetchJson<AvailabilityRequest>('/api/availability-requests', {
      method: 'POST',
      body: JSON.stringify(reqData),
    }),
  updateAvailabilityRequestStatus: (
    id: string,
    status: 'Approved' | 'Rejected' | 'ChangeRequested' | 'Unlocked',
    changeRequestReason?: string
  ) =>
    fetchJson<AvailabilityRequest>(`/api/availability-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, changeRequestReason }),
    }),

  // Stats
  getStats: () => fetchJson<DashboardStats>('/api/stats'),
};
