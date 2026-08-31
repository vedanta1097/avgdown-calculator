import { describe, expect, it } from "vitest";
import {
  calculateFloatingLoss,
  calculateMode1,
  calculateMode2,
  calculateMode3,
  getAveragingStrategy,
} from "./calculate";

describe("getAveragingStrategy", () => {
  it("detects average up, down, and unchanged", () => {
    expect(getAveragingStrategy(1_000, 1_300)).toBe("up");
    expect(getAveragingStrategy(1_000, 800)).toBe("down");
    expect(getAveragingStrategy(1_000, 1_000)).toBe("unchanged");
  });
});

describe("calculateMode1", () => {
  it("calculates an average-up target", () => {
    const result = calculateMode1(10, 1_000, 1_300, 1_100);

    expect(result.additionalLots).toBe(5);
    expect(result.moneyNeeded).toBe(650_000);
    expect(result.actualNewAvg).toBe(1_100);
    expect(result.avgChangePercent).toBeCloseTo(10);
    expect(result.strategy).toBe("up");
  });

  it("calculates an average-down target", () => {
    const result = calculateMode1(10, 1_000, 800, 900);

    expect(result.additionalLots).toBe(10);
    expect(result.actualNewAvg).toBe(900);
    expect(result.avgChangePercent).toBeCloseTo(-10);
    expect(result.strategy).toBe("down");
  });

  it("rejects targets outside the two input prices", () => {
    expect(() => calculateMode1(10, 1_000, 1_300, 1_400)).toThrow(
      RangeError,
    );
    expect(() => calculateMode1(10, 1_000, 1_000, 1_000)).toThrow(
      RangeError,
    );
  });
});

describe("calculateMode2", () => {
  it("uses whole lots and calculates a new average-up price", () => {
    const result = calculateMode2(10, 1_000, 1_300, 700_000);

    expect(result.affordableLots).toBe(5);
    expect(result.moneyUsed).toBe(650_000);
    expect(result.moneyLeft).toBe(50_000);
    expect(result.newAvgPrice).toBe(1_100);
    expect(result.avgChangePercent).toBeCloseTo(10);
    expect(result.strategy).toBe("up");
  });

  it("keeps the average unchanged when buying at the old average", () => {
    const result = calculateMode2(10, 1_000, 1_000, 100_000);

    expect(result.newAvgPrice).toBe(1_000);
    expect(result.avgChangePercent).toBe(0);
    expect(result.strategy).toBe("unchanged");
  });

  it("rejects capital below one lot", () => {
    expect(() => calculateMode2(10, 1_000, 1_300, 100_000)).toThrow(
      RangeError,
    );
  });
});

describe("calculateMode3", () => {
  it("calculates a reachable positive profit target", () => {
    const result = calculateMode3(10, 1_000, 1_300, 1_500, 30);

    expect(result.additionalLots).toBe(11);
    expect(result.moneyNeeded).toBe(1_430_000);
    expect(result.actualProfitLossPercent).toBeCloseTo(29.6296, 3);
    expect(result.strategy).toBe("up");
  });

  it("rejects a target that does not require positive shares", () => {
    expect(() => calculateMode3(10, 1_000, 1_300, 1_500, 60)).toThrow(
      RangeError,
    );
  });
});

describe("calculateFloatingLoss", () => {
  it("compares profit before and after averaging up", () => {
    const result = calculateFloatingLoss(10, 1_000, 1_500, 5, 1_300);

    expect(result.floatingLossBefore).toBe(500_000);
    expect(result.floatingLossPercentBefore).toBeCloseTo(50);
    expect(result.floatingLossAfter).toBe(600_000);
    expect(result.floatingLossPercentAfter).toBeCloseTo(36.3636, 3);
    expect(result.breakEvenPrice).toBe(1_100);
  });
});
