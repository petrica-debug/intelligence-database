import { describe, it, expect } from "vitest";

describe("Entity Detection", () => {
  it("should import entity detection module", async () => {
    const mod = await import("@/lib/entity-detection");
    expect(mod).toBeDefined();
  });
});
