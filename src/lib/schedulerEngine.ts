import {
  Employee,
  Shift,
  AutoScheduleOptions,
  AutoScheduleResult,
  AutoScheduleLog,
  DayOfWeek,
  Position,
} from '../types';

/**
 * Helper to get Day of Week string from a YYYY-MM-DD date string
 */
export function getDayOfWeekFromDate(dateStr: string): DayOfWeek {
  const date = new Date(dateStr + 'T00:00:00');
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
}

/**
 * Calculates duration in decimal hours between 24h format times (e.g. "09:00" and "17:00")
 */
export function calculateShiftDurationHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    // Overnight shift (e.g. 22:00 to 02:00)
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
}

/**
 * Checks if two time intervals overlap on the same day
 */
export function doShiftsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  let s1 = toMin(start1);
  let e1 = toMin(end1);
  if (e1 <= s1) e1 += 24 * 60;

  let s2 = toMin(start2);
  let e2 = toMin(end2);
  if (e2 <= s2) e2 += 24 * 60;

  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Helper to get 7 YYYY-MM-DD date strings starting from a weekStartDate (Monday)
 */
export function getWeekDates(weekStartDate: string): string[] {
  const dates: string[] = [];
  const base = new Date(weekStartDate + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

/**
 * Rule-Based Automatic Schedule Generator Engine (NO AI)
 */
export function runAutoScheduler(
  existingShifts: Shift[],
  employees: Employee[],
  options: AutoScheduleOptions
): AutoScheduleResult {
  const logs: AutoScheduleLog[] = [];
  let generatedShifts: Shift[] = JSON.parse(JSON.stringify(existingShifts));

  // Active employees only
  const activeEmployees = employees.filter((e) => e.status === 'Active');

  // Calculate target dates for week
  const weekDates = options.weekStartDate ? getWeekDates(options.weekStartDate) : [];

  // Check if target week has any shifts in generatedShifts
  const existingShiftsInWeek = weekDates.length > 0
    ? generatedShifts.filter((s) => weekDates.includes(s.date))
    : generatedShifts;

  // If no shifts exist for target week, auto-generate standard shift templates for each restaurant
  if (weekDates.length > 0 && existingShiftsInWeek.length === 0) {
    const defaultRestaurants = ['rest-1', 'rest-2'];
    const defaultSlots = [
      { startTime: '12:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '22:00' },
    ];

    for (const dateStr of weekDates) {
      for (const restId of defaultRestaurants) {
        for (const slot of defaultSlots) {
          generatedShifts.push({
            id: 'shift-auto-' + restId + '-' + dateStr + '-' + slot.startTime.replace(':', ''),
            restaurantId: restId,
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            position: 'Çalışan',
            assignedEmployeeId: null,
            isPublished: false,
            color: restId === 'rest-1' ? '#3b82f6' : '#8b5cf6',
          });
        }
      }
    }
  }

  // Reset assignment if clearExistingDrafts is enabled
  if (options.clearExistingDrafts) {
    generatedShifts = generatedShifts.map((s) => {
      if (weekDates.length > 0 && !weekDates.includes(s.date)) {
        return s; // Keep other weeks untouched
      }
      return { ...s, assignedEmployeeId: null };
    });
  }

  // Map to track weekly scheduled hours for each employee
  const employeeWeeklyHours: Record<string, number> = {};
  activeEmployees.forEach((e) => {
    employeeWeeklyHours[e.id] = 0;
  });

  // Calculate existing hours for already assigned shifts
  generatedShifts.forEach((s) => {
    if (s.assignedEmployeeId && employeeWeeklyHours[s.assignedEmployeeId] !== undefined) {
      const hours = calculateShiftDurationHours(s.startTime, s.endTime);
      employeeWeeklyHours[s.assignedEmployeeId] += hours;
    }
  });

  // Determine shifts to schedule
  let shiftsToSchedule = generatedShifts.filter((s) => {
    if (weekDates.length > 0 && !weekDates.includes(s.date)) return false;
    return !s.assignedEmployeeId;
  });

  // Sort shifts to schedule by date and start time
  shiftsToSchedule.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  let assignedCount = 0;
  let unfilledCount = 0;

  for (const shift of shiftsToSchedule) {
    const dayOfWeek = getDayOfWeekFromDate(shift.date);
    const shiftHours = calculateShiftDurationHours(shift.startTime, shift.endTime);

    // Filter candidate employees according to rules
    const candidates = activeEmployees.filter((emp) => {
      // Rule 1: Restaurant Eligibility Check
      if (shift.restaurantId) {
        const empRestaurants =
          emp.assignedRestaurants && emp.assignedRestaurants.length > 0
            ? emp.assignedRestaurants
            : [emp.restaurantId];
        if (!empRestaurants.includes(shift.restaurantId) && !emp.isSharedStaff) {
          return false; // Not assigned to this restaurant
        }
      }

      // Rule 2: Unavailable Days
      if (options.respectUnavailableDays) {
        if (emp.unavailableDays && emp.unavailableDays.includes(dayOfWeek)) {
          return false;
        }
      }

      // Rule 3: Maximum Weekly Hours
      if (options.respectMaxHours) {
        const currentHours = employeeWeeklyHours[emp.id] || 0;
        if (currentHours + shiftHours > emp.maxWeeklyHours) {
          return false;
        }
      }

      // Rule 4: Overlapping Shift Check on the same date
      const empShiftsOnDate = generatedShifts.filter(
        (s) => s.assignedEmployeeId === emp.id && s.date === shift.date
      );

      for (const empShift of empShiftsOnDate) {
        if (doShiftsOverlap(shift.startTime, shift.endTime, empShift.startTime, empShift.endTime)) {
          return false; // Overlap detected!
        }
      }

      return true;
    });

    if (candidates.length === 0) {
      // Unfilled shift
      unfilledCount++;
      logs.push({
        shiftId: shift.id,
        date: shift.date,
        position: shift.position,
        startTime: shift.startTime,
        endTime: shift.endTime,
        status: 'Unfilled',
        reason: `No available staff found for ${shift.restaurantId === 'rest-2' ? 'Ottensen' : 'Altona'} on ${dayOfWeek} (${shift.startTime}-${shift.endTime}) meeting max hours/availability rules.`,
      });
      continue;
    }

    // Rule 5: Balance Working Hours between candidate employees
    if (options.balanceHours) {
      candidates.sort((a, b) => {
        const hoursA = employeeWeeklyHours[a.id] || 0;
        const hoursB = employeeWeeklyHours[b.id] || 0;
        if (hoursA !== hoursB) return hoursA - hoursB;
        return a.name.localeCompare(b.name);
      });
    }

    // Select best candidate
    const selectedEmployee = candidates[0];

    // Assign employee
    shift.assignedEmployeeId = selectedEmployee.id;
    employeeWeeklyHours[selectedEmployee.id] =
      (employeeWeeklyHours[selectedEmployee.id] || 0) + shiftHours;
    assignedCount++;

    // Update in generatedShifts array
    const idx = generatedShifts.findIndex((s) => s.id === shift.id);
    if (idx !== -1) {
      generatedShifts[idx] = { ...shift };
    } else {
      generatedShifts.push(shift);
    }

    const restName = shift.restaurantId === 'rest-2' ? 'Ottensen' : 'Altona';
    logs.push({
      shiftId: shift.id,
      date: shift.date,
      position: shift.position,
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: 'Assigned',
      assignedEmployeeName: selectedEmployee.name,
      reason: `Assigned to ${selectedEmployee.name} at ${restName} on ${dayOfWeek} (${employeeWeeklyHours[selectedEmployee.id]}h total).`,
    });
  }

  return {
    success: true,
    totalShiftsProcessed: shiftsToSchedule.length,
    assignedShiftsCount: assignedCount,
    unfilledShiftsCount: unfilledCount,
    logs,
    generatedShifts,
  };
}
