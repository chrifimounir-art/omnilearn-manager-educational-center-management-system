import { Hono } from "hono";
import type { Env } from './core-utils';
import { CenterEntity, StudentEntity, TeacherEntity, PaymentEntity, ExpenseEntity, FinancialConfigEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Center, Student, Teacher, Payment, Expense, FinancialConfig } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data on first request
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      CenterEntity.ensureSeed(c.env),
      StudentEntity.ensureSeed(c.env),
      TeacherEntity.ensureSeed(c.env),
      PaymentEntity.ensureSeed(c.env),
      ExpenseEntity.ensureSeed(c.env),
      FinancialConfigEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // CENTERS
  app.get('/api/centers', async (c) => {
    const page = await CenterEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/centers', async (c) => {
    const { name, address } = (await c.req.json()) as Partial<Center>;
    if (!isStr(name) || !isStr(address)) return bad(c, 'name and address required');
    const center = await CenterEntity.create(c.env, { id: crypto.randomUUID(), name, address, createdAt: Date.now() });
    return ok(c, center);
  });
  app.delete('/api/centers/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await CenterEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // STUDENTS
  app.get('/api/students', async (c) => {
    const page = await StudentEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/students', async (c) => {
    const { firstName, lastName, dateOfBirth, centerIds } = (await c.req.json()) as Partial<Student>;
    if (!isStr(firstName) || !isStr(lastName) || !isStr(dateOfBirth) || !Array.isArray(centerIds)) {
      return bad(c, 'firstName, lastName, dateOfBirth, and centerIds are required');
    }
    const student = await StudentEntity.create(c.env, { id: crypto.randomUUID(), firstName, lastName, dateOfBirth, centerIds, createdAt: Date.now() });
    return ok(c, student);
  });
  app.delete('/api/students/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await StudentEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // TEACHERS
  app.get('/api/teachers', async (c) => {
    const page = await TeacherEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/teachers', async (c) => {
    const { firstName, lastName, specialty, remuneration, centerIds } = (await c.req.json()) as Partial<Teacher>;
    if (!isStr(firstName) || !isStr(lastName) || !isStr(specialty) || !isStr(remuneration) || !Array.isArray(centerIds)) {
      return bad(c, 'firstName, lastName, specialty, remuneration, and centerIds are required');
    }
    const teacher = await TeacherEntity.create(c.env, { id: crypto.randomUUID(), firstName, lastName, specialty, remuneration, centerIds, createdAt: Date.now() });
    return ok(c, teacher);
  });
  app.delete('/api/teachers/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await TeacherEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // PAYMENTS
  app.get('/api/payments', async (c) => {
    const page = await PaymentEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/payments', async (c) => {
    const { studentId, centerId, baseAmount, discountAmount, discountPercent, paidAmount } = (await c.req.json()) as Partial<Payment>;
    if (!isStr(studentId) || !isStr(centerId) || typeof baseAmount !== 'number' || typeof paidAmount !== 'number') {
      return bad(c, 'studentId, centerId, baseAmount, and paidAmount are required');
    }
    const studentExists = await new StudentEntity(c.env, studentId).exists();
    if (!studentExists) return bad(c, `Student with id ${studentId} not found`);
    const payment = await PaymentEntity.create(c.env, { 
      id: crypto.randomUUID(), 
      studentId, 
      centerId, 
      baseAmount, 
      discountAmount: discountAmount ?? 0,
      discountPercent,
      paidAmount, 
      paidDate: Date.now(), 
      createdAt: Date.now() 
    });
    return ok(c, payment);
  });
  app.delete('/api/payments/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await PaymentEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // EXPENSES
  app.get('/api/expenses', async (c) => {
    const page = await ExpenseEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/expenses', async (c) => {
    const { centerId, description, amount } = (await c.req.json()) as Partial<Expense>;
    if (!isStr(centerId) || !isStr(description) || typeof amount !== 'number') {
      return bad(c, 'centerId, description, and amount are required');
    }
    const expense = await ExpenseEntity.create(c.env, { 
      id: crypto.randomUUID(), 
      centerId, 
      description, 
      amount, 
      date: Date.now(), 
      createdAt: Date.now() 
    });
    return ok(c, expense);
  });
  app.delete('/api/expenses/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await ExpenseEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // FINANCIAL CONFIGS
  app.get('/api/financial-configs', async (c) => {
    const page = await FinancialConfigEntity.list(c.env);
    return ok(c, page);
  });
  app.post('/api/financial-configs', async (c) => {
    const { centerId, basePricePerStudent, profPercent, centerPercent } = (await c.req.json()) as Partial<FinancialConfig>;
    if (!isStr(centerId) || typeof basePricePerStudent !== 'number' || typeof profPercent !== 'number' || typeof centerPercent !== 'number') {
      return bad(c, 'centerId, basePricePerStudent, profPercent, and centerPercent are required');
    }
    const config = await FinancialConfigEntity.create(c.env, { 
      id: centerId, // Use centerId as config ID for 1-to-1 mapping
      centerId, 
      basePricePerStudent, 
      profPercent, 
      centerPercent, 
      createdAt: Date.now() 
    });
    return ok(c, config);
  });
}