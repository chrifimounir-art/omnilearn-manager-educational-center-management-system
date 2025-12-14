export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Center {
  id: string;
  name: string;
  address: string;
  createdAt: number;
}
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string
  centerIds: string[];
  createdAt: number;
}
export type TeacherRemuneration = 'hourly' | 'per_student' | 'percentage';
export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  remuneration: TeacherRemuneration;
  centerIds: string[];
  createdAt: number;
}
// Phase 3 Additions
export interface FinancialConfig {
  id: string; // Typically same as centerId for 1-to-1 mapping
  centerId: string;
  basePricePerStudent: number; // In cents (e.g., 30000 for 300.00 MAD)
  profPercent: number; // e.g., 50 for 50%
  centerPercent: number; // e.g., 50 for 50%
  createdAt: number;
}
export interface Payment {
  id: string;
  studentId: string;
  centerId: string;
  baseAmount: number; // In cents
  discountAmount: number; // In cents
  discountPercent?: number; // e.g., 10 for 10%
  paidAmount: number; // In cents (baseAmount - discountAmount)
  paidDate: number; // timestamp
  createdAt: number;
}
export interface Expense {
  id: string;
  centerId: string;
  description: string;
  amount: number; // In cents
  date: number; // timestamp
  createdAt: number;
}