import { describe, it, expect } from "vitest";

describe("Inference Engine", () => {
  it("should import inference module", async () => {
    const mod = await import("@/lib/inference");
    expect(mod).toBeDefined();
  });
});
