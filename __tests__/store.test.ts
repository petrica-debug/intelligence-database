import { describe, it, expect, beforeEach, vi } from "vitest";

const mockStorage: Record<string, string> = {};

vi.stubGlobal("localStorage", {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
  length: 0,
  key: () => null,
});

describe("Store", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  });

  it("should return seed data when no stored data exists", async () => {
    const { getInitialDb } = await import("@/lib/store");
    const db = getInitialDb();

    expect(db).toBeDefined();
    expect(db.users).toBeDefined();
    expect(db.users.length).toBeGreaterThan(0);
    expect(db.entries).toBeDefined();
    expect(db.entries.length).toBeGreaterThan(0);
  });

  it("should persist and load data from storage", async () => {
    const { getInitialDb, persistDb } = await import("@/lib/store");
    const db = getInitialDb();

    db.entries.push({
      id: 999,
      category: "person",
      name: "Test Person",
      context: "confirmed",
      narrative: "Test narrative",
      createdBy: "test",
      createdAt: new Date().toISOString(),
      linkedTo: [],
    });

    persistDb(db);

    const stored = JSON.parse(mockStorage["rfe_db_v5"]);
    expect(stored.entries.find((e: { id: number }) => e.id === 999)).toBeDefined();
  });

  it("should have correct seed data structure", async () => {
    const { getSeedData } = await import("@/lib/store");
    const seed = getSeedData();

    expect(seed.users).toHaveLength(5);
    expect(seed.reports.length).toBeGreaterThan(0);
    expect(seed.inferredConnections.length).toBeGreaterThan(0);
    expect(seed.pendingValidations.length).toBeGreaterThan(0);
    expect(seed.signals.length).toBeGreaterThan(0);
    expect(seed.logs.length).toBeGreaterThan(0);
    expect(seed.notifications.length).toBeGreaterThan(0);
    expect(seed.nextId).toBeGreaterThan(100);
  });

  it("should have valid entity categories", async () => {
    const { getSeedData } = await import("@/lib/store");
    const seed = getSeedData();
    const validCategories = ["person", "company", "mobile", "address", "vehicle"];

    for (const entry of seed.entries) {
      expect(validCategories).toContain(entry.category);
    }
  });

  it("should have valid context assessments", async () => {
    const { getSeedData } = await import("@/lib/store");
    const seed = getSeedData();
    const validContexts = ["confirmed", "likely", "rumor"];

    for (const entry of seed.entries) {
      expect(validContexts).toContain(entry.context);
    }
  });
});
