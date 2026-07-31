import type { GeoPoint } from "@travel/domain";

export function isValidPoint(point: GeoPoint): boolean {
  return Number.isFinite(point.longitude) &&
    point.longitude >= -180 &&
    point.longitude <= 180 &&
    Number.isFinite(point.latitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90;
}

export function haversineDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const radius = 6371.0088;
  const lat1 = radians(from.latitude);
  const lat2 = radians(to.latitude);
  const deltaLat = radians(to.latitude - from.latitude);
  const deltaLng = radians(to.longitude - from.longitude);
  const value = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function estimateWalkingMinutes(from: GeoPoint, to: GeoPoint): number {
  return Math.max(1, Math.ceil(haversineDistanceKm(from, to) / 4.5 * 60));
}

function radians(value: number): number {
  return value * Math.PI / 180;
}
