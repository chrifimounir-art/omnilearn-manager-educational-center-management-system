import { Hono } from "hono";
import type { Env } from './core-utils';
import { CenterEntity, StudentEntity, TeacherEntity, PaymentEntity, ExpenseEntity, FinancialConfigEntity, LevelEntity, ClassEntity, SubjectEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Center, Student, Teacher, Payment, Expense, FinancialConfig, Level, Class, Subject } from "@shared/types";
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
      LevelEntity.ensureSeed(c.env),
      ClassEntity.ensureSeed(c.env),
      SubjectEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // CORE ENTITIES (Centers, Students, Teachers)
  app.get('/api/centers', async (c) => ok(c, await CenterEntity.list(c.env)));
  app.post('/api/centers', async (c) => {
    const { name, address } = (await c.req.json()) as Partial<Center>;
    if (!isStr(name) || !isStr(address)) return bad(c, 'name and address required');
    const center = await CenterEntity.create(c.env, { id: crypto.randomUUID(), name, address, createdAt: Date.now() });
    return ok(c, center);
  });
  app.delete('/api/centers/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await CenterEntity.delete(c.env, c.req.param('id')) }));
  app.get('/api/students', async (c) => ok(c, await StudentEntity.list(c.env)));
  app.post('/api/students', async (c) => {
    const { firstName, lastName, dateOfBirth, centerIds } = (await c.req.json()) as Partial<Student>;
    if (!isStr(firstName) || !isStr(lastName) || !isStr(dateOfBirth) || !Array.isArray(centerIds)) return bad(c, 'firstName, lastName, dateOfBirth, and centerIds are required');
    const student = await StudentEntity.create(c.env, { id: crypto.randomUUID(), firstName, lastName, dateOfBirth, centerIds, createdAt: Date.now() });
    return ok(c, student);
  });
  app.delete('/api/students/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await StudentEntity.delete(c.env, c.req.param('id')) }));
  app.get('/api/teachers', async (c) => ok(c, await TeacherEntity.list(c.env)));
  app.post('/api/teachers', async (c) => {
    const { firstName, lastName, specialty, remuneration, centerIds } = (await c.req.json()) as Partial<Teacher>;
    if (!isStr(firstName) || !isStr(lastName) || !isStr(specialty) || !isStr(remuneration) || !Array.isArray(centerIds)) return bad(c, 'All fields are required');
    const teacher = await TeacherEntity.create(c.env, { id: crypto.randomUUID(), firstName, lastName, specialty, remuneration, centerIds, createdAt: Date.now() });
    return ok(c, teacher);
  });
  app.delete('/api/teachers/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await TeacherEntity.delete(c.env, c.req.param('id')) }));
  // FINANCIAL ENTITIES
  app.get('/api/payments', async (c) => ok(c, await PaymentEntity.list(c.env)));
  app.post('/api/payments', async (c) => {
    const { studentId, centerId, baseAmount, discountAmount, discountPercent, paidAmount } = (await c.req.json()) as Partial<Payment>;
    if (!isStr(studentId) || !isStr(centerId) || typeof baseAmount !== 'number' || typeof paidAmount !== 'number') return bad(c, 'studentId, centerId, baseAmount, and paidAmount are required');
    if (!(await new StudentEntity(c.env, studentId).exists())) return bad(c, `Student with id ${studentId} not found`);
    const payment = await PaymentEntity.create(c.env, { id: crypto.randomUUID(), studentId, centerId, baseAmount, discountAmount: discountAmount ?? 0, discountPercent, paidAmount, paidDate: Date.now(), createdAt: Date.now() });
    return ok(c, payment);
  });
  app.delete('/api/payments/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await PaymentEntity.delete(c.env, c.req.param('id')) }));
  app.get('/api/expenses', async (c) => ok(c, await ExpenseEntity.list(c.env)));
  app.post('/api/expenses', async (c) => {
    const { centerId, description, amount } = (await c.req.json()) as Partial<Expense>;
    if (!isStr(centerId) || !isStr(description) || typeof amount !== 'number') return bad(c, 'centerId, description, and amount are required');
    const expense = await ExpenseEntity.create(c.env, { id: crypto.randomUUID(), centerId, description, amount, date: Date.now(), createdAt: Date.now() });
    return ok(c, expense);
  });
  app.delete('/api/expenses/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ExpenseEntity.delete(c.env, c.req.param('id')) }));
  app.get('/api/financial-configs', async (c) => ok(c, await FinancialConfigEntity.list(c.env)));
  app.post('/api/financial-configs', async (c) => {
    const { centerId, basePricePerStudent, profPercent, centerPercent } = (await c.req.json()) as Partial<FinancialConfig>;
    if (!isStr(centerId) || typeof basePricePerStudent !== 'number' || typeof profPercent !== 'number' || typeof centerPercent !== 'number') return bad(c, 'All fields are required');
    const config = await FinancialConfigEntity.create(c.env, { id: centerId, centerId, basePricePerStudent, profPercent, centerPercent, createdAt: Date.now() });
    return ok(c, config);
  });
  // ACADEMIC ENTITIES
  app.get('/api/levels', async (c) => ok(c, await LevelEntity.list(c.env)));
  app.post('/api/levels', async (c) => {
    const { centerId, name } = (await c.req.json()) as Partial<Level>;
    if (!isStr(centerId) || !isStr(name)) return bad(c, 'centerId and name are required');
    if (!(await new CenterEntity(c.env, centerId).exists())) return bad(c, `Center with id ${centerId} not found`);
    const level = await LevelEntity.create(c.env, { id: crypto.randomUUID(), centerId, name, createdAt: Date.now() });
    return ok(c, level);
  });
  app.delete('/api/levels/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await LevelEntity.delete(c.env, c.req.param('id')) }));
  app.get('/api/classes', async (c) => ok(c, await ClassEntity.list(c.env)));
  app.post('/api/classes', async (c) => {
    const { levelId, name, capacity } = (await c.req.json()) as Partial<Class>;
    if (!isStr(levelId) || !isStr(name) || typeof capacity !== 'number' || capacity <= 0) return bad(c, 'levelId, name, and a positive capacity are required');
    if (!(await new LevelEntity(c.env, levelId).exists())) return bad(c, `Level with id ${levelId} not found`);
    const newClass = await ClassEntity.create(c.env, { id: crypto.randomUUID(), levelId, name, capacity, createdAt: Date.now() });
    return ok(c, newClass);
  });
  app.delete('/api/classes/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ClassEntity.delete(c.env, c.req.param('id')) }));
  app.get('/api/subjects', async (c) => ok(c, await SubjectEntity.list(c.env)));
  app.post('/api/subjects', async (c) => {
    const { centerId, name, levelIds } = (await c.req.json()) as Partial<Subject>;
    if (!isStr(centerId) || !isStr(name) || !Array.isArray(levelIds)) return bad(c, 'centerId, name, and levelIds array are required');
    if (!(await new CenterEntity(c.env, centerId).exists())) return bad(c, `Center with id ${centerId} not found`);
    const subject = await SubjectEntity.create(c.env, { id: crypto.randomUUID(), centerId, name, levelIds, createdAt: Date.now() });
    return ok(c, subject);
  });
  app.delete('/api/subjects/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await SubjectEntity.delete(c.env, c.req.param('id')) }));
}