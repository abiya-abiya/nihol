import { neon } from "@neondatabase/serverless";
import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type { Attempt, ChoiceId, Repo, SeedData, Student, StudentRecord, StudentSnapshot } from "@/lib/types";
import { attempts, classes, snapshots, students } from "./schema";

type Db = ReturnType<typeof drizzle>;

const toAttempt = (r: typeof attempts.$inferSelect): Attempt => ({
  ...r,
  choiceId: r.choiceId as ChoiceId,
  mode: r.mode as Attempt["mode"],
});

/** Postgres (Neon) store. Tables are created with `npm run db:push`. */
export class PgRepo implements Repo {
  private db: Db;

  constructor(url: string) {
    this.db = drizzle(neon(url));
  }

  async getClass(id: string) {
    const [row] = await this.db.select().from(classes).where(eq(classes.id, id));
    return row ? { ...row, grade: row.grade as 5 | 6 } : null;
  }

  async createStudent(input: { name: string; classId: string; id?: string; createdAt?: string }) {
    const student: Student = {
      id: input.id ?? crypto.randomUUID(),
      name: input.name,
      classId: input.classId,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    await this.db.insert(students).values(student).onConflictDoNothing();
    return student;
  }

  async getStudent(id: string): Promise<StudentRecord | null> {
    const [student] = await this.db.select().from(students).where(eq(students.id, id));
    if (!student) return null;
    const [snap] = await this.db.select().from(snapshots).where(eq(snapshots.studentId, id));
    return { student, snapshot: snap?.data ?? null };
  }

  async saveProgress(studentId: string, list: Attempt[], snapshot: StudentSnapshot) {
    if (list.length) {
      await this.db
        .insert(attempts)
        .values(list.map((a) => ({ ...a, studentId })))
        .onConflictDoNothing();
    }
    await this.db
      .insert(snapshots)
      .values({ studentId, data: { ...snapshot, studentId }, updatedAt: snapshot.updatedAt })
      .onConflictDoUpdate({ target: snapshots.studentId, set: { data: { ...snapshot, studentId }, updatedAt: snapshot.updatedAt } });
  }

  async listClassStudents(classId: string): Promise<StudentRecord[]> {
    const rows = await this.db
      .select()
      .from(students)
      .leftJoin(snapshots, eq(students.id, snapshots.studentId))
      .where(eq(students.classId, classId));
    return rows.map((r) => ({ student: r.students, snapshot: r.snapshots?.data ?? null }));
  }

  async listAttempts(filter: { classId?: string; studentId?: string; since?: string; limit?: number }) {
    const conds = [];
    if (filter.studentId) conds.push(eq(attempts.studentId, filter.studentId));
    if (filter.since) conds.push(gt(attempts.ts, filter.since));
    if (filter.classId) {
      const ids = (await this.db.select({ id: students.id }).from(students).where(eq(students.classId, filter.classId))).map(
        (r) => r.id,
      );
      if (!ids.length) return [];
      conds.push(inArray(attempts.studentId, ids));
    }
    const q = this.db
      .select()
      .from(attempts)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(attempts.ts));
    const rows = filter.limit ? await q.limit(filter.limit) : await q;
    return rows.map(toAttempt);
  }

  async seedClass(data: SeedData) {
    const classId = data.classRoom.id;
    const old = (await this.db.select({ id: students.id }).from(students).where(eq(students.classId, classId))).map((r) => r.id);
    if (old.length) {
      await this.db.delete(attempts).where(inArray(attempts.studentId, old));
      await this.db.delete(snapshots).where(inArray(snapshots.studentId, old));
      await this.db.delete(students).where(inArray(students.id, old));
    }
    await this.db.delete(classes).where(eq(classes.id, classId));
    await this.db.insert(classes).values(data.classRoom);
    if (data.students.length) await this.db.insert(students).values(data.students.map((r) => r.student));
    const snaps = data.students.filter((r) => r.snapshot);
    if (snaps.length) {
      await this.db
        .insert(snapshots)
        .values(snaps.map((r) => ({ studentId: r.student.id, data: r.snapshot!, updatedAt: r.snapshot!.updatedAt })));
    }
    for (let i = 0; i < data.attempts.length; i += 500) {
      await this.db.insert(attempts).values(data.attempts.slice(i, i + 500));
    }
  }
}
