import type { GeoPoint } from "@travel/domain";
import { estimateWalkingMinutes, isValidPoint } from "./geo";
import type { PlanDayResult, PlannerCandidate, PlannerDayInput, PlannedStop } from "./types";

const weights = { required: -10000, preferred: -2000, optional: 0 } as const;

export function planDay(input: PlannerDayInput): PlanDayResult {
  if (input.dayEndMinute <= input.dayStartMinute || !isValidPoint(input.startLocation)) {
    throw new RangeError("Invalid day range or start location");
  }

  const travel: NonNullable<PlannerDayInput["travelMinutes"]> =
    input.travelMinutes ?? ((from, to) => estimateWalkingMinutes(from, to));
  const remaining = input.candidates.filter((item) => item.durationMinutes > 0 && isValidPoint(item.location));
  const invalid = input.candidates.filter((item) => item.durationMinutes <= 0 || !isValidPoint(item.location));
  const stops: PlannedStop[] = [];
  const maxStops = input.maxStops ?? Number.POSITIVE_INFINITY;
  let minute = input.dayStartMinute;
  let location: GeoPoint = input.startLocation;
  let totalTravelMinutes = 0;
  let totalVisitMinutes = 0;

  while (remaining.length && stops.length < maxStops) {
    const choices = remaining.map((candidate) => {
      const rawTravelMinutes = travel(location, candidate.location);
      const travelMinutes = Number.isFinite(rawTravelMinutes) && rawTravelMinutes >= 0
        ? Math.ceil(rawTravelMinutes)
        : Number.POSITIVE_INFINITY;
      const arrivalMinute = minute + travelMinutes;
      const startMinute = getStart(candidate, arrivalMinute);
      const endMinute = startMinute === null ? Number.POSITIVE_INFINITY : startMinute + candidate.durationMinutes;
      const lockedBonus = candidate.locked ? -5000 : 0;
      const score = weights[candidate.priority] + lockedBonus + travelMinutes + (candidate.preferredOrder ?? 0) * 3;
      return { candidate, travelMinutes, arrivalMinute, startMinute, endMinute, score };
    }).filter((item) => item.startMinute !== null && item.endMinute <= input.dayEndMinute)
      .sort((a, b) => a.score - b.score || a.endMinute - b.endMinute);

    const next = choices[0];
    if (!next || next.startMinute === null) break;
    const waitMinutes = next.startMinute - next.arrivalMinute;
    const explanation = [
      next.candidate.priority === "required" ? "必去地点优先" : "综合距离与偏好排序",
      `预计通勤 ${next.travelMinutes} 分钟`,
    ];
    if (next.candidate.locked) explanation.unshift("保留用户锁定地点");

    stops.push({
      placeId: next.candidate.placeId,
      sequence: stops.length + 1,
      arrivalMinute: next.arrivalMinute,
      startMinute: next.startMinute,
      endMinute: next.endMinute,
      travelMinutesFromPrevious: next.travelMinutes,
      waitMinutes,
      explanation,
    });
    minute = next.endMinute;
    location = next.candidate.location;
    totalTravelMinutes += next.travelMinutes;
    totalVisitMinutes += next.candidate.durationMinutes;
    remaining.splice(remaining.indexOf(next.candidate), 1);
  }

  const unscheduled = [
    ...invalid.map((item) => ({
      placeId: item.placeId,
      reason: item.durationMinutes <= 0 ? "invalid_duration" as const : "invalid_location" as const,
      explanation: item.durationMinutes <= 0 ? "停留时长无效。" : "地点坐标无效。",
    })),
    ...remaining.map((item) => ({
      placeId: item.placeId,
      reason: stops.length >= maxStops ? "max_stops_reached" as const : "day_capacity_exceeded" as const,
      explanation: stops.length >= maxStops ? "达到当天地点数量上限。" : "当天剩余时间不足。",
    })),
  ];

  return {
    stops,
    unscheduled,
    totalTravelMinutes,
    totalVisitMinutes,
    finishMinute: minute,
    warnings: unscheduled.length ? ["部分地点未被排入，当天安排需要调整。"] : [],
  };
}

function getStart(candidate: PlannerCandidate, arrival: number): number | null {
  if (candidate.fixedStartMinute !== undefined) {
    if (arrival > candidate.fixedStartMinute) return null;
    if (!candidate.openingWindows?.length) return candidate.fixedStartMinute;
    const fixedEnd = candidate.fixedStartMinute + candidate.durationMinutes;
    const fits = candidate.openingWindows.some((window) =>
      candidate.fixedStartMinute! >= window.opensAtMinute &&
      fixedEnd <= window.closesAtMinute &&
      (window.lastEntryAtMinute === undefined || candidate.fixedStartMinute! <= window.lastEntryAtMinute),
    );
    return fits ? candidate.fixedStartMinute : null;
  }
  if (!candidate.openingWindows?.length) return arrival;
  for (const window of candidate.openingWindows) {
    const start = Math.max(arrival, window.opensAtMinute);
    const latest = Math.min(window.closesAtMinute - candidate.durationMinutes, window.lastEntryAtMinute ?? Infinity);
    if (start <= latest) return start;
  }
  return null;
}
