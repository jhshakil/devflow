export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "PAUSED"
  | "WAITING"
  | "IN_REVIEW"
  | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TimeLogType = "ACTIVE" | "PAUSED" | "WAITING";

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  tasks?: Task[];
  deadlines?: Deadline[];
  notes?: Note[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  progress: number;
  projectId: string;
  userId: string;
  dueDate: Date | null;
  completedAt: Date | null;
  totalTime: number;
  blockedBy: string[];
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
  user?: User;
  timeLogs?: TimeLog[];
  dependencies?: Task[];
  dependents?: Task[];
}

export interface TimeLog {
  id: string;
  taskId: string;
  startedAt: Date;
  pausedAt: Date | null;
  resumedAt: Date | null;
  endedAt: Date | null;
  duration: number | null;
  reason: string | null;
  logType: TimeLogType;
  createdAt: Date;
  task?: Task;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: Date;
  projectId: string;
  notifyAt: Date | null;
  notified: boolean;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  projectId: string | null;
  taskId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  project?: Project | null;
  task?: Task | null;
}
