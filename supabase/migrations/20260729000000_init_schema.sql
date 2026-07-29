-- StaffSync Supabase PostgreSQL Schema & Migrations

-- 1. Create Restaurants Table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    manager_name TEXT NOT NULL,
    currency TEXT DEFAULT '$',
    opening_hours JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Manager', 'Employee')),
    employee_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('Waiter', 'Chef', 'Cashier', 'Barista', 'Kitchen staff')),
    secondary_positions TEXT[] DEFAULT '{}',
    employment_type TEXT NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time')),
    max_weekly_hours INTEGER NOT NULL DEFAULT 40,
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 18.50,
    available_days TEXT[] NOT NULL DEFAULT '{"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"}',
    unavailable_days TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint back to users table if required
ALTER TABLE public.users 
ADD CONSTRAINT fk_user_employee 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- 4. Create Shifts Table
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('Waiter', 'Chef', 'Cashier', 'Barista', 'Kitchen staff')),
    assigned_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    notes TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Availability Change Requests Table
CREATE TABLE IF NOT EXISTS public.availability_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    requested_available_days TEXT[] NOT NULL,
    requested_unavailable_days TEXT[] NOT NULL,
    requested_max_hours INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_shifts_restaurant_date ON public.shifts(restaurant_id, date);
CREATE INDEX IF NOT EXISTS idx_shifts_employee ON public.shifts(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_restaurant ON public.employees(restaurant_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_requests ENABLE ROW LEVEL SECURITY;
