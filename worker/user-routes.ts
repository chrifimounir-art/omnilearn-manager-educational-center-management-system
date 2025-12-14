import { Hono } from "hono";
import type { Env } from './core-utils';
import { CenterEntity, StudentEntity, TeacherEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Center, Student, Teacher } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data on first request
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      CenterEntity.ensureSeed(c.env),
      StudentEntity.ensureSeed(c.env),
      TeacherEntity.ensureSeed(c.env),
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
}