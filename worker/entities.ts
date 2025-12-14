import { IndexedEntity } from "./core-utils";
import type { Center, Student, Teacher } from "@shared/types";
import { MOCK_CENTERS, MOCK_STUDENTS, MOCK_TEACHERS } from "@shared/mock-data";
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