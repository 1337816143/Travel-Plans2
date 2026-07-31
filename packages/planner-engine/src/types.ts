import type { GeoPoint, PlaceId } from "@travel/domain";

export type PlannerPriority = "required" | "preferred" | "optional";

export interface DailyOpeningWindow {
  opensAtMinute: number;
  closesAtMinute: number;
  lastEntryAtMinute?: number;
}

export interface PlannerCandidate {
  placeId: PlaceId;
  location: GeoPoint;
  durationMinutes: number;
  priority: PlannerPriority;
  preferredOrder?: number;
  fixedStartMinute?: number;
  openingWindows?: readonly DailyOpeningWindow[];
  locked?: boolean;
}

export interface PlannerDayInput {
  dayStartMinute: number;
  dayEndMinute: number;
  startLocation: GeoPoint;
  endLocation?: GeoPoint;
  candidates: readonly PlannerCandidate[];
  maxStops?: number;
  travelMinutes?: (
    from: GeoPoint,
    to: GeoPoint,
    fromPlaceId?: PlaceId,
    toPlaceId?: PlaceId,
  ) => number;
}

export interface PlannedStop {
  placeId: PlaceId;
  sequence: number;
  arrivalMinute: number;
  startMinute: number;
  endMinute: number;
  travelMinutesFromPrevious: number;
  waitMinutes: number;
  explanation: readonly string[];
}

export type UnscheduledReason =
  | "outside_opening_hours"
  | "day_capacity_exceeded"
  | "invalid_duration"
  | "invalid_location"
  | "max_stops_reached";

export interface UnscheduledStop {
  placeId: PlaceId;
  reason: UnscheduledReason;
  explanation: string;
}

export interface PlanDayResult {
  stops: readonly PlannedStop[];
  unscheduled: readonly UnscheduledStop[];
  totalTravelMinutes: number;
  totalVisitMinutes: number;
  finishMinute: number;
  returnTravelMinutes?: number;
  warnings: readonly string[];
}
