import { describe, expect, it } from "vitest";
import { planDay } from "../src/plan-day";

const location = { longitude: 120, latitude: 36 };

describe("planDay", () => {
  it("places required stops first", () => {
    const result = planDay({
      dayStartMinute: 540,
      dayEndMinute: 1080,
      startLocation: location,
      travelMinutes: () => 20,
      candidates: [
        { placeId: "optional", location, durationMinutes: 60, priority: "optional" },
        { placeId: "required", location, durationMinutes: 90, priority: "required" },
      ],
    });

    expect(result.stops.map((stop) => stop.placeId)).toEqual(["required", "optional"]);
    expect(result.stops.map((stop) => stop.sequence)).toEqual([1, 2]);
  });

  it("waits until a place opens", () => {
    const result = planDay({
      dayStartMinute: 480,
      dayEndMinute: 1080,
      startLocation: location,
      travelMinutes: () => 15,
      candidates: [{
        placeId: "museum",
        location,
        durationMinutes: 60,
        priority: "preferred",
        openingWindows: [{ opensAtMinute: 600, closesAtMinute: 1020 }],
      }],
    });

    expect(result.stops[0]?.startMinute).toBe(600);
    expect(result.stops[0]?.waitMinutes).toBe(105);
  });
});
