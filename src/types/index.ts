export type EntityCategory = "person" | "company" | "mobile" | "address" | "vehicle";
export type ContextAssessment = "confirmed" | "likely" | "rumor";
export type UserRole = "admin" | "user";
export type AccessLevel = "basic" | "full";
export type ClearanceLevel = 1 | 2 | 3 | 4 | 5;
export type SensitivityLevel = "standard" | "sensitive" | "confidential" | "top-secret";

export const CLEARANCE_LABELS: Record<ClearanceLevel, string> = {
  1: "Field Operative",
  2: "Field Officer",
  3: "Analyst",
  4: "Senior Analyst",
  5: "Director",
};

export const SENSITIVITY_MIN_CLEARANCE: Record<SensitivityLevel, ClearanceLevel> = {
  standard: 1,
  sensitive: 2,
  confidential: 3,
  "top-secret": 5,
};

export const SENSITIVITY_COLORS: Record<SensitivityLevel, string> = {
  standard: "emerald",
  sensitive: "amber",
  confidential: "red",
  "top-secret": "purple",
};

export interface User {
  username: string;
  password: string;
  role: UserRole;
  access: AccessLevel;
  clearance: ClearanceLevel;
  active: boolean;
  fullName: string;
  department: string;
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
  sensitivity?: SensitivityLevel;
}

export interface ReportSection {
  title: string;
  content: string;
  sensitivity: SensitivityLevel;
}

export type ReportItemType = "person" | "company" | "phone" | "vehicle" | "location" | "document" | "financial" | "other";

export interface ReportItem {
  type: ReportItemType;
  label: string;
  value: string;
  notes: string;
  sensitivity: SensitivityLevel;
  linkedEntityId?: number;
}

export interface Report {
  id: number;
  title: string;
  type: "meeting-debrief" | "field-report" | "analysis" | "intelligence-brief";
  date: string;
  location?: string;
  attendees: number[];
  externalAttendees: string[];
  sections: ReportSection[];
  items?: ReportItem[];
  tags: string[];
  linkedEntities: number[];
  createdBy: string;
  createdAt: string;
  overallSensitivity: SensitivityLevel;
  status: "draft" | "submitted" | "reviewed" | "archived";
}

export interface InferredConnection {
  id: number;
  entityA: number;
  entityB: number;
  confidence: number;
  reason: string;
  category: "shared-location" | "co-attendance" | "organizational" | "social-proximity" | "pattern-match" | "behavioral";
  evidence: string[];
  createdAt: string;
  status: "new" | "confirmed" | "dismissed";
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
  reports: Report[];
  inferredConnections: InferredConnection[];
  nextId: number;
}
