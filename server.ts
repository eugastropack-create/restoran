import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_RESTAURANT,
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_AVAILABILITY_REQUESTS,
} from './src/lib/mockData';
import { runAutoScheduler } from './src/lib/schedulerEngine';
import {
  Restaurant,
  User,
  Employee,
  Shift,
  AvailabilityRequest,
  AutoScheduleOptions,
  DashboardStats,
} from './src/types';

// In-memory / persistent data store
let restaurantStore: Restaurant = { ...INITIAL_RESTAURANT };
let usersStore: User[] = [...INITIAL_USERS];
let employeesStore: Employee[] = [...INITIAL_EMPLOYEES];
let shiftsStore: Shift[] = [...INITIAL_SHIFTS];
let availabilityRequestsStore: AvailabilityRequest[] = [...INITIAL_AVAILABILITY_REQUESTS];

// Try loading persisted data if available
const DB_FILE = path.join(process.cwd(), 'data_db.json');
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (data.restaurant) restaurantStore = data.restaurant;
      if (data.users) usersStore = data.users;
      if (data.employees) employeesStore = data.employees;
      if (data.shifts) shiftsStore = data.shifts;
      if (data.requests) availabilityRequestsStore = data.requests;
      console.log('Database loaded from disk file.');
    }
  } catch (err) {
    console.error('Failed to load database file, using defaults', err);
  }
}

function saveDatabase() {
  try {
    const data = {
      restaurant: restaurantStore,
      users: usersStore,
      employees: employeesStore,
      shifts: shiftsStore,
      requests: availabilityRequestsStore,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file', err);
  }
}

loadDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = usersStore.find((u) => u.email.toLowerCase() === email?.toLowerCase());
    if (!user) {
      // Fallback demo manager if email not matched
      return res.status(401).json({ error: 'Invalid user email. Try manager@bistro.com or alex.rivers@bistro.com' });
    }
    return res.json({ user, restaurant: restaurantStore });
  });

  // Auth: Register Restaurant
  app.post('/api/auth/register', (req, res) => {
    const { restaurantName, managerName, email, phone } = req.body;
    if (!restaurantName || !email) {
      return res.status(400).json({ error: 'Restaurant name and manager email are required.' });
    }

    const newRestId = 'rest-' + Date.now();
    const newRest: Restaurant = {
      id: newRestId,
      name: restaurantName,
      address: 'Main Street 101',
      phone: phone || '(555) 000-0000',
      managerName: managerName || 'Manager',
      currency: '$',
      openingHours: INITIAL_RESTAURANT.openingHours,
    };

    const newUser: User = {
      id: 'usr-' + Date.now(),
      email: email,
      name: managerName || 'Manager',
      role: 'Manager',
      restaurantId: newRestId,
    };

    restaurantStore = newRest;
    usersStore.push(newUser);
    saveDatabase();

    return res.json({ user: newUser, restaurant: newRest });
  });

  // Restaurant Settings
  app.get('/api/restaurant', (req, res) => {
    res.json(restaurantStore);
  });

  app.put('/api/restaurant', (req, res) => {
    restaurantStore = { ...restaurantStore, ...req.body };
    saveDatabase();
    res.json(restaurantStore);
  });

  // Employees CRUD
  app.get('/api/employees', (req, res) => {
    res.json(employeesStore);
  });

  app.post('/api/employees', (req, res) => {
    const newEmp: Employee = {
      id: 'emp-' + Date.now(),
      restaurantId: restaurantStore.id,
      name: req.body.name || 'New Employee',
      email: req.body.email || 'employee@restaurant.com',
      phone: req.body.phone || '(555) 000-0000',
      position: req.body.position || 'Waiter',
      secondaryPositions: req.body.secondaryPositions || [],
      employmentType: req.body.employmentType || 'Full-time',
      maxWeeklyHours: Number(req.body.maxWeeklyHours) || 40,
      hourlyRate: Number(req.body.hourlyRate) || 18.0,
      availableDays: req.body.availableDays || [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      unavailableDays: req.body.unavailableDays || [],
      status: 'Active',
    };

    // Also auto-create employee login user
    const newUser: User = {
      id: 'usr-' + Date.now(),
      email: newEmp.email,
      name: newEmp.name,
      role: 'Employee',
      restaurantId: restaurantStore.id,
      employeeId: newEmp.id,
    };

    employeesStore.push(newEmp);
    usersStore.push(newUser);
    saveDatabase();

    res.status(201).json(newEmp);
  });

  app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const index = employeesStore.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    employeesStore[index] = { ...employeesStore[index], ...req.body };
    saveDatabase();
    res.json(employeesStore[index]);
  });

  app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    employeesStore = employeesStore.filter((e) => e.id !== id);
    // Unassign shifts
    shiftsStore = shiftsStore.map((s) => (s.assignedEmployeeId === id ? { ...s, assignedEmployeeId: null } : s));
    saveDatabase();
    res.json({ success: true });
  });

  // Shifts CRUD
  app.get('/api/shifts', (req, res) => {
    res.json(shiftsStore);
  });

  app.post('/api/shifts', (req, res) => {
    const newShift: Shift = {
      id: 'shift-' + Date.now() + Math.random().toString(36).substring(2, 6),
      restaurantId: restaurantStore.id,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      position: req.body.position,
      assignedEmployeeId: req.body.assignedEmployeeId || null,
      notes: req.body.notes || '',
      isPublished: req.body.isPublished ?? false,
      color: req.body.color || '#3b82f6',
    };

    shiftsStore.push(newShift);
    saveDatabase();
    res.status(201).json(newShift);
  });

  app.put('/api/shifts/:id', (req, res) => {
    const { id } = req.params;
    const index = shiftsStore.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    shiftsStore[index] = { ...shiftsStore[index], ...req.body };
    saveDatabase();
    res.json(shiftsStore[index]);
  });

  app.delete('/api/shifts/:id', (req, res) => {
    const { id } = req.params;
    shiftsStore = shiftsStore.filter((s) => s.id !== id);
    saveDatabase();
    res.json({ success: true });
  });

  // Rule-Based Automatic Schedule Generator
  app.post('/api/schedules/auto-generate', (req, res) => {
    const options: AutoScheduleOptions = req.body;
    const result = runAutoScheduler(shiftsStore, employeesStore, options);

    if (result.success) {
      shiftsStore = result.generatedShifts;
      saveDatabase();
    }

    res.json(result);
  });

  // Publish Schedule for week
  app.post('/api/schedules/publish', (req, res) => {
    const { dates } = req.body; // array of date strings
    if (Array.isArray(dates) && dates.length > 0) {
      shiftsStore = shiftsStore.map((s) => (dates.includes(s.date) ? { ...s, isPublished: true } : s));
    } else {
      shiftsStore = shiftsStore.map((s) => ({ ...s, isPublished: true }));
    }
    saveDatabase();
    res.json({ success: true, totalShifts: shiftsStore.length });
  });

  // Availability Change Requests
  app.get('/api/availability-requests', (req, res) => {
    res.json(availabilityRequestsStore);
  });

  app.post('/api/availability-requests', (req, res) => {
    const newReq: AvailabilityRequest = {
      id: 'req-' + Date.now(),
      restaurantId: restaurantStore.id,
      employeeId: req.body.employeeId,
      employeeName: req.body.employeeName,
      requestedAvailableDays: req.body.requestedAvailableDays,
      requestedUnavailableDays: req.body.requestedUnavailableDays,
      requestedMaxHours: req.body.requestedMaxHours,
      reason: req.body.reason || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    availabilityRequestsStore.unshift(newReq);
    saveDatabase();
    res.status(201).json(newReq);
  });

  app.put('/api/availability-requests/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Approved or Rejected
    const index = availabilityRequestsStore.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    availabilityRequestsStore[index].status = status;

    // If approved, update employee record
    if (status === 'Approved') {
      const empId = availabilityRequestsStore[index].employeeId;
      const empIndex = employeesStore.findIndex((e) => e.id === empId);
      if (empIndex !== -1) {
        employeesStore[empIndex].availableDays =
          availabilityRequestsStore[index].requestedAvailableDays;
        employeesStore[empIndex].unavailableDays =
          availabilityRequestsStore[index].requestedUnavailableDays;
        employeesStore[empIndex].maxWeeklyHours =
          availabilityRequestsStore[index].requestedMaxHours;
      }
    }

    saveDatabase();
    res.json(availabilityRequestsStore[index]);
  });

  // Dashboard Metrics
  app.get('/api/stats', (req, res) => {
    let totalHours = 0;
    let estimatedPayroll = 0;

    shiftsStore.forEach((s) => {
      const [startH, startM] = s.startTime.split(':').map(Number);
      const [endH, endM] = s.endTime.split(':').map(Number);
      let dur = (endH * 60 + endM - (startH * 60 + startM)) / 60;
      if (dur < 0) dur += 24;

      totalHours += dur;

      if (s.assignedEmployeeId) {
        const emp = employeesStore.find((e) => e.id === s.assignedEmployeeId);
        if (emp) {
          estimatedPayroll += dur * emp.hourlyRate;
        }
      }
    });

    const stats: DashboardStats = {
      totalEmployees: employeesStore.length,
      totalHoursThisWeek: Math.round(totalHours * 10) / 10,
      publishedShiftsCount: shiftsStore.filter((s) => s.isPublished).length,
      unassignedShiftsCount: shiftsStore.filter((s) => !s.assignedEmployeeId).length,
      estimatedWeeklyPayroll: Math.round(estimatedPayroll),
      pendingAvailabilityRequests: availabilityRequestsStore.filter((r) => r.status === 'Pending').length,
    };

    res.json(stats);
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
