import type { Attempt, ClassRoom, Repo, SeedData, Student, StudentRecord, StudentSnapshot } from "@/lib/types";

/** In-process store for local dev and offline demos. Lost on server restart. */
export class MemoryRepo implements Repo {
  private classes = new Map<string, ClassRoom>();
  private students = new Map<string, Student>();
  private snapshots = new Map<string, StudentSnapshot>();
  private attempts: Attempt[] = [];

  async getClass(id: string) {
    return this.classes.get(id) ?? null;
  }

  async createStudent(input: { name: string; classId: string; id?: string; createdAt?: string }) {
    const student: Student = {
      id: input.id ?? crypto.randomUUID(),
      name: input.name,
      classId: input.classId,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    if (!this.students.has(student.id)) this.students.set(student.id, student);
    return this.students.get(student.id)!;
  }

  async getStudent(id: string): Promise<StudentRecord | null> {
    const student = this.students.get(id);
    return student ? { student, snapshot: this.snapshots.get(id) ?? null } : null;
  }

  async saveProgress(studentId: string, attempts: Attempt[], snapshot: StudentSnapshot) {
    const known = new Set(this.attempts.map((a) => a.id));
    for (const a of attempts) if (!known.has(a.id)) this.attempts.push({ ...a, studentId });
    this.snapshots.set(studentId, { ...snapshot, studentId });
  }

  async listClassStudents(classId: string): Promise<StudentRecord[]> {
    return [...this.students.values()]
      .filter((s) => s.classId === classId)
      .map((student) => ({ student, snapshot: this.snapshots.get(student.id) ?? null }));
  }

  async listAttempts(filter: { classId?: string; studentId?: string; since?: string; limit?: number }) {
    let list = this.attempts;
    if (filter.studentId) list = list.filter((a) => a.studentId === filter.studentId);
    if (filter.classId) list = list.filter((a) => this.students.get(a.studentId)?.classId === filter.classId);
    if (filter.since) list = list.filter((a) => a.ts > filter.since!);
    const sorted = [...list].sort((a, b) => (a.ts < b.ts ? 1 : -1));
    return filter.limit ? sorted.slice(0, filter.limit) : sorted;
  }

  async seedClass(data: SeedData) {
    const classId = data.classRoom.id;
    const old = new Set([...this.students.values()].filter((s) => s.classId === classId).map((s) => s.id));
    for (const id of old) {
      this.students.delete(id);
      this.snapshots.delete(id);
    }
    this.attempts = this.attempts.filter((a) => !old.has(a.studentId));
    this.classes.set(classId, data.classRoom);
    for (const r of data.students) {
      this.students.set(r.student.id, r.student);
      if (r.snapshot) this.snapshots.set(r.student.id, r.snapshot);
    }
    this.attempts.push(...data.attempts);
  }
}
