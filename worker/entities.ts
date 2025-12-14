import { IndexedEntity } from "./core-utils";
import type { Center, Student, Teacher, FinancialConfig, Payment, Expense } from "@shared/types";
import { MOCK_CENTERS, MOCK_STUDENTS, MOCK_TEACHERS, MOCK_PAYMENTS, MOCK_EXPENSES } from "@shared/mock-data";
export class CenterEntity extends IndexedEntity<Center> {
  static readonly entityName = "center";
  static readonly indexName = "centers";
  static readonly initialState: Center = { id: "", name: "", address: "", createdAt: 0 };
  static seedData = MOCK_CENTERS;
}
export class StudentEntity extends IndexedEntity<Student> {
  static readonly entityName = "student";
  static readonly indexName = "students";
  static readonly initialState: Student = { id: "", firstName: "", lastName: "", dateOfBirth: "", centerIds: [], createdAt: 0 };
  static seedData = MOCK_STUDENTS;
}
export class TeacherEntity extends IndexedEntity<Teacher> {
  static readonly entityName = "teacher";
  static readonly indexName = "teachers";
  static readonly initialState: Teacher = { id: "", firstName: "", lastName: "", specialty: "", remuneration: "hourly", centerIds: [], createdAt: 0 };
  static seedData = MOCK_TEACHERS;
}
// Phase 3 Additions
export class FinancialConfigEntity extends IndexedEntity<FinancialConfig> {
  static readonly entityName = "financialConfig";
  static readonly indexName = "financialConfigs";
  static readonly initialState: FinancialConfig = { id: "", centerId: "", basePricePerStudent: 0, profPercent: 0, centerPercent: 0, createdAt: 0 };
  // No seed data for this, should be configured by user
}
export class PaymentEntity extends IndexedEntity<Payment> {
  static readonly entityName = "payment";
  static readonly indexName = "payments";
  static readonly initialState: Payment = { id: "", studentId: "", centerId: "", baseAmount: 0, discountAmount: 0, paidAmount: 0, paidDate: 0, createdAt: 0 };
  static seedData = MOCK_PAYMENTS;
}
export class ExpenseEntity extends IndexedEntity<Expense> {
  static readonly entityName = "expense";
  static readonly indexName = "expenses";
  static readonly initialState: Expense = { id: "", centerId: "", description: "", amount: 0, date: 0, createdAt: 0 };
  static seedData = MOCK_EXPENSES;
}