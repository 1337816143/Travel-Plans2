import { describe, expect, it } from "vitest";
import { assertGeoPoint, shouldDisplayCommunitySignal } from "../src/index";

describe("domain rules", () => {
  it("rejects invalid coordinates", () => {
    expect(() => assertGeoPoint({ longitude: 181, latitude: 36 })).toThrow(RangeError);
  });

  it("shows fresh community signals that meet thresholds", () => {
    const visible = shouldDisplayCommunitySignal(
      {
        id: "signal-1",
        subjectId: "place-1",
        topic: "temporary_closure",
        summary: { default: "东门临时关闭" },
        acceptedFeedbackCount: 8,
        uniqueAuthorCount: 6,
        weightedSupport: 5.4,
        firstSeenAt: "2026-07-25T00:00:00Z",
        lastSeenAt: "2026-07-30T00:00:00Z",
        displayUntil: "2026-08-10T00:00:00Z",
        status: "visible",
        label: "来自旅行者反馈",
        feedbackIds: ["f1", "f2"],
      },
      {
        minimumUniqueAuthors: 3,
        minimumWeightedSupport: 3,
        maximumSpamRisk: 0.3,
        freshnessDays: 30,
      },
      new Date("2026-07-31T00:00:00Z"),
    );

    expect(visible).toBe(true);
  });
});
