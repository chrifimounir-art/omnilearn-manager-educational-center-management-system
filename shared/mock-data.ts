import type { Center, Student, Teacher, Payment, Expense } from './types';
export const MOCK_CENTERS: Center[] = [
  { id: 'center-1', name: 'Downtown Learning Hub', address: '123 Main St, Metropolis', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10 },
  { id: 'center-2', name: 'Uptown Arts Academy', address: '456 Oak Ave, Star City', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
  { id: 'center-3', name: 'Suburbia Tech Institute', address: '789 Pine Ln, Gotham', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
];
export const MOCK_STUDENTS: Student[] = [
  { id: 'student-1', firstName: 'Alice', lastName: 'Johnson', dateOfBirth: '2008-05-15', centerIds: ['center-1'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8 },
  { id: 'student-2', firstName: 'Bob', lastName: 'Smith', dateOfBirth: '2007-09-20', centerIds: ['center-1', 'center-2'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
  { id: 'student-3', firstName: 'Charlie', lastName: 'Brown', dateOfBirth: '2009-02-10', centerIds: ['center-2'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4 },
  { id: 'student-4', firstName: 'Diana', lastName: 'Prince', dateOfBirth: '2006-11-30', centerIds: ['center-3'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1 },
];
export const MOCK_TEACHERS: Teacher[] = [
  { id: 'teacher-1', firstName: 'John', lastName: 'Doe', specialty: 'Mathematics', remuneration: 'hourly', centerIds: ['center-1'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9 },
  { id: 'teacher-2', firstName: 'Jane', lastName: 'Roe', specialty: 'Physics', remuneration: 'percentage', centerIds: ['center-1', 'center-2'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6 },
  { id: 'teacher-3', firstName: 'Peter', lastName: 'Jones', specialty: 'Literature', remuneration: 'per_student', centerIds: ['center-2', 'center-3'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
];
// Phase 3 Additions
const now = Date.now();
const day = 1000 * 60 * 60 * 24;
export const MOCK_PAYMENTS: Payment[] = [
  { id: 'payment-1', studentId: 'student-1', centerId: 'center-1', baseAmount: 30000, discountAmount: 0, paidAmount: 30000, paidDate: now - 2 * day, createdAt: now - 2 * day },
  { id: 'payment-2', studentId: 'student-2', centerId: 'center-1', baseAmount: 30000, discountAmount: 3000, discountPercent: 10, paidAmount: 27000, paidDate: now - 5 * day, createdAt: now - 5 * day },
  { id: 'payment-3', studentId: 'student-3', centerId: 'center-2', baseAmount: 35000, discountAmount: 0, paidAmount: 35000, paidDate: now - 8 * day, createdAt: now - 8 * day },
  { id: 'payment-4', studentId: 'student-4', centerId: 'center-3', baseAmount: 40000, discountAmount: 0, paidAmount: 40000, paidDate: now - 1 * day, createdAt: now - 1 * day },
  { id: 'payment-5', studentId: 'student-1', centerId: 'center-1', baseAmount: 30000, discountAmount: 0, paidAmount: 30000, paidDate: now - 32 * day, createdAt: now - 32 * day }, // Previous month
  { id: 'payment-6', studentId: 'student-2', centerId: 'center-2', baseAmount: 35000, discountAmount: 5250, discountPercent: 15, paidAmount: 29750, paidDate: now - 40 * day, createdAt: now - 40 * day }, // Previous month
  { id: 'payment-7', studentId: 'student-3', centerId: 'center-2', baseAmount: 35000, discountAmount: 0, paidAmount: 35000, paidDate: now - 60 * day, createdAt: now - 60 * day }, // Two months ago
];
export const MOCK_EXPENSES: Expense[] = [
  { id: 'expense-1', centerId: 'center-1', description: 'Monthly Rent', amount: 250000, date: now - 15 * day, createdAt: now - 15 * day },
  { id: 'expense-2', centerId: 'center-1', description: 'Office Supplies', amount: 15000, date: now - 10 * day, createdAt: now - 10 * day },
  { id: 'expense-3', centerId: 'center-2', description: 'Internet Bill', amount: 8000, date: now - 5 * day, createdAt: now - 5 * day },
  { id: 'expense-4', centerId: 'center-3', description: 'New Equipment', amount: 120000, date: now - 2 * day, createdAt: now - 2 * day },
  { id: 'expense-5', centerId: 'center-1', description: 'Teacher Payout - John Doe', amount: 120000, date: now - 3 * day, createdAt: now - 3 * day },
  { id: 'expense-6', centerId: 'center-1', description: 'Monthly Rent', amount: 250000, date: now - 45 * day, createdAt: now - 45 * day }, // Previous month
  { id: 'expense-7', centerId: 'center-2', description: 'Internet Bill', amount: 8000, date: now - 35 * day, createdAt: now - 35 * day }, // Previous month
];