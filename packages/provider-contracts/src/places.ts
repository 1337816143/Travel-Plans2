import type {
  GeoPoint,
  ISODateTime,
  PlaceCategory,
  RegionId,
  SourceReference,
} from "@travel/domain";
import type { ProviderDescriptor, ProviderRequestContext } from "./base";

export interface PlaceSearchQuery {
  text: string;
  center?: GeoPoint;
  bounds?: { southWest: GeoPoint; northEast: GeoPoint };
  regionId?: RegionId;
  categories?: readonly PlaceCategory[];
  limit?: number;
  cursor?: string;
}

export interface ProviderPlace {
  providerId: string;
  externalId: string;
  name: string;
  location: GeoPoint;
  address?: string;
  categories: readonly string[];
  regionNames?: readonly string[];
  source: SourceReference;
  rawRecordHash?: string;
}

export interface PlaceSearchResult {
  items: readonly ProviderPlace[];
  nextCursor?: string;
  retrievedAt: ISODateTime;
}

export interface PlaceProvider {
  descriptor: ProviderDescriptor;
  search(query: PlaceSearchQuery, context: ProviderRequestContext): Promise<PlaceSearchResult>;
  getByExternalId(
    externalId: string,
    context: ProviderRequestContext,
  ): Promise<ProviderPlace | null>;
}
