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