import type { GeoPoint, ISODateTime, TravelMode } from "@travel/domain";
import type { ProviderDescriptor, ProviderRequestContext } from "./base";

export interface RouteRequest {
  origin: GeoPoint;
  destination: GeoPoint;
  waypoints?: readonly GeoPoint[];
  mode: TravelMode;
  departureAt?: ISODateTime;
  avoid?: readonly ("tolls" | "ferries" | "highways" | "stairs")[];
}

export interface RouteResult {
  providerId: string;
  distanceMeters: number;
  durationMinutes: number;
  geometry?: string;
  warnings?: readonly string[];
  retrievedAt: ISODateTime;
}

export interface RouteMatrixRequest {
  origins: readonly GeoPoint[];
  destinations: readonly GeoPoint[];
  mode: TravelMode;
  departureAt?: ISODateTime;
}

export interface RouteProvider {
  descriptor: ProviderDescriptor;
  route(request: RouteRequest, context: ProviderRequestContext): Promise<RouteResult>;
  matrix?(
    request: RouteMatrixRequest,
    context: ProviderRequestContext,
  ): Promise<readonly (readonly number[])[]>;
}
