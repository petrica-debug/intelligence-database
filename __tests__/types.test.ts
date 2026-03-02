import { describe, it, expect } from "vitest";
import {
  CLEARANCE_LABELS,
  SENSITIVITY_MIN_CLEARANCE,
  SENSITIVITY_COLORS,
} from "@/types";

describe("Type Constants", () => {
  it("should have clearance labels for all levels", () => {
    expect(CLEARANCE_LABELS[1]).toBe("Field Operative");
    expect(CLEARANCE_LABELS[2]).toBe("Field Officer");
    expect(CLEARANCE_LABELS[3]).toBe("Analyst");
    expect(CLEARANCE_LABELS[4]).toBe("Senior Analyst");
    expect(CLEARANCE_LABELS[5]).toBe("Director");
  });

  it("should have correct sensitivity-clearance mapping", () => {
    expect(SENSITIVITY_MIN_CLEARANCE["standard"]).toBe(1);
    expect(SENSITIVITY_MIN_CLEARANCE["sensitive"]).toBe(2);
    expect(SENSITIVITY_MIN_CLEARANCE["confidential"]).toBe(3);
    expect(SENSITIVITY_MIN_CLEARANCE["top-secret"]).toBe(5);
  });

  it("should have sensitivity colors for all levels", () => {
    expect(SENSITIVITY_COLORS["standard"]).toBeDefined();
    expect(SENSITIVITY_COLORS["sensitive"]).toBeDefined();
    expect(SENSITIVITY_COLORS["confidential"]).toBeDefined();
    expect(SENSITIVITY_COLORS["top-secret"]).toBeDefined();
  });

  it("should enforce clearance hierarchy", () => {
    const levels = Object.values(SENSITIVITY_MIN_CLEARANCE);
    expect(levels[0]).toBeLessThanOrEqual(levels[1]);
    expect(levels[1]).toBeLessThanOrEqual(levels[2]);
    expect(levels[2]).toBeLessThanOrEqual(levels[3]);
  });
});
