import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Restaurant, Employee, Shift, AvailabilityRequest } from '../types';
import {
  INITIAL_RESTAURANTS,
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_AVAILABILITY_REQUESTS,
  INITIAL_RESTAURANT
} from './mockData';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Collection references
const USERS_COL = 'users';
const RESTAURANTS_COL = 'restaurants';
const EMPLOYEES_COL = 'employees';
const SHIFTS_COL = 'shifts';
const REQUESTS_COL = 'requests';

// Realtime listeners or fetching functions with Firestore
export async function seedInitialFirestoreDataIfNeeded() {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COL));
    if (usersSnap.empty) {
      console.log('Seeding initial data into Firestore...');
      
      // Seed Users
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, USERS_COL, u.id), u);
      }
      // Seed Restaurants
      for (const r of INITIAL_RESTAURANTS) {
        await setDoc(doc(db, RESTAURANTS_COL, r.id), r);
      }
      // Seed Employees
      for (const e of INITIAL_EMPLOYEES) {
        await setDoc(doc(db, EMPLOYEES_COL, e.id), e);
      }
      // Seed Shifts
      for (const s of INITIAL_SHIFTS) {
        await setDoc(doc(db, SHIFTS_COL, s.id), s);
      }
      // Seed Requests
      for (const req of INITIAL_AVAILABILITY_REQUESTS) {
        await setDoc(doc(db, REQUESTS_COL, req.id), req);
      }
      console.log('Firestore seed completed successfully!');
    }
  } catch (err) {
    console.warn('Error checking/seeding Firestore:', err);
  }
}

// User Firestore operations
export async function fetchFirestoreUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, USERS_COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
}

export async function saveFirestoreUser(user: User): Promise<void> {
  await setDoc(doc(db, USERS_COL, user.id), user, { merge: true });
}

// Restaurant Firestore operations
export async function fetchFirestoreRestaurants(): Promise<Restaurant[]> {
  const snap = await getDocs(collection(db, RESTAURANTS_COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Restaurant));
}

export async function saveFirestoreRestaurant(restaurant: Restaurant): Promise<void> {
  await setDoc(doc(db, RESTAURANTS_COL, restaurant.id), restaurant, { merge: true });
}

// Employee Firestore operations
export async function fetchFirestoreEmployees(): Promise<Employee[]> {
  const snap = await getDocs(collection(db, EMPLOYEES_COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Employee));
}

export async function saveFirestoreEmployee(emp: Employee): Promise<void> {
  await setDoc(doc(db, EMPLOYEES_COL, emp.id), emp, { merge: true });
}

export async function deleteFirestoreEmployee(empId: string): Promise<void> {
  await deleteDoc(doc(db, EMPLOYEES_COL, empId));
}

// Shift Firestore operations
export async function fetchFirestoreShifts(): Promise<Shift[]> {
  const snap = await getDocs(collection(db, SHIFTS_COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Shift));
}

export async function saveFirestoreShiftsBatch(shifts: Shift[]): Promise<void> {
  for (const s of shifts) {
    await setDoc(doc(db, SHIFTS_COL, s.id), s, { merge: true });
  }
}

export async function saveFirestoreShift(shift: Shift): Promise<void> {
  await setDoc(doc(db, SHIFTS_COL, shift.id), shift, { merge: true });
}

export async function deleteFirestoreShift(shiftId: string): Promise<void> {
  await deleteDoc(doc(db, SHIFTS_COL, shiftId));
}

// Request Firestore operations
export async function fetchFirestoreRequests(): Promise<AvailabilityRequest[]> {
  const snap = await getDocs(collection(db, REQUESTS_COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AvailabilityRequest));
}

export async function saveFirestoreRequest(req: AvailabilityRequest): Promise<void> {
  await setDoc(doc(db, REQUESTS_COL, req.id), req, { merge: true });
}

export async function updateFirestoreRequestStatus(reqId: string, status: AvailabilityRequest['status']): Promise<void> {
  await updateDoc(doc(db, REQUESTS_COL, reqId), { status });
}
