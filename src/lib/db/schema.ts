import { boolean, index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { StudentSnapshot } from "@/lib/types";

// Timestamps are ISO strings (text): sortable, and identical to the JSON contracts.

export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  teacherName: text("teacher_name").notNull(),
  grade: integer("grade").notNull(),
});

export const students = pgTable(
  "students",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    classId: text("class_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("students_class_idx").on(t.classId)],
);

export const snapshots = pgTable("snapshots", {
  studentId: text("student_id").primaryKey(),
  data: jsonb("data").$type<StudentSnapshot>().notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const attempts = pgTable(
  "attempts",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    questionId: text("question_id").notNull(),
    skillId: text("skill_id").notNull(),
    choiceId: text("choice_id").notNull(),
    correct: boolean("correct").notNull(),
    misconceptionId: text("misconception_id"),
    mode: text("mode").notNull(),
    ts: text("ts").notNull(),
  },
  (t) => [index("attempts_student_idx").on(t.studentId), index("attempts_ts_idx").on(t.ts)],
);

/** v2 JSON document store: one row per collection key. */
export const kv = pgTable("kv", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});
