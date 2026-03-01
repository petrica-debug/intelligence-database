export type EntityCategory = "person" | "company" | "mobile" | "address" | "vehicle";
export type ContextAssessment = "confirmed" | "likely" | "rumor";
export type UserRole = "admin" | "user";
export type AccessLevel = "basic" | "full";

export interface User {
  username: string;
  password: string;
  role: UserRole;
  access: AccessLevel;
  active: boolean;
}

export interface Entry {
  id: number;
  category: EntityCategory;
  name: string;
  context: ContextAssessment;
  narrative: string;
  createdBy: string;
  createdAt: string;
  linkedTo: number[];
  country?: string;
  tags?: string[];
}

export interface PendingValidation {
  id: number;
  entryId: number;
  targetName: string;
  suggestedLink: string;
  suggestedLinkId: number | null;
  submittedBy: string;
  submittedAt: string;
  reason: string;
  resolved?: boolean;
  approved?: boolean;
}

export interface Signal {
  entityId: number;
  entityName: string;
  setBy: string;
  setAt: string;
}

export interface LogEntry {
  ts: string;
  user: string;
  action: string;
  detail: string;
}

export interface Notification {
  message: string;
  forUser: string;
  ts: string;
  read: boolean;
}

export interface DetectedEntity {
  type: EntityCategory;
  value: string;
  existing: Entry | null;
  action?: "link" | "validate" | "skip";
}

export interface Database {
  users: User[];
  entries: Entry[];
  pendingValidations: PendingValidation[];
  logs: LogEntry[];
  signals: Signal[];
  notifications: Notification[];
  nextId: number;
}
