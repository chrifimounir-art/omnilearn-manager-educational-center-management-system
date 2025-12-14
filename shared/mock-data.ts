import type { Center, Student, Teacher } from './types';
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