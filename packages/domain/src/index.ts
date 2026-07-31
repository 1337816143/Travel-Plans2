export type ISODateTime = string;
export type CurrencyCode = string;
export type LocaleCode = string;

export type RegionId = string;
export type PlaceId = string;
export type TripId = string;
export type UserId = string;
export type SourceId = string;

export interface GeoPoint {
  /** WGS84 longitude, from -180 to 180. */
  longitude: number;
  /** WGS84 latitude, from -90 to 90. */
  latitude: number;
}

export interface BoundingBox {
  southWest: GeoPoint;
  northEast: GeoPoint;
}

export type RegionKind =
  | "district"
  | "county"
  | "city"
  | "prefecture"
  | "province"
  | "state"
  | "country"
  | "continent"
  | "basin"
  | "coast"
  | "island_group"
  | "mountain_area"
  | "cultural_area"
  | "travel_corridor"
  | "custom";

export interface LocalizedText {
  default: string;
  translations?: Readonly<Record<LocaleCode, string>>;
}

export interface Region {
  id: RegionId;
  kind: RegionKind;
  name: LocalizedText;
  parentIds: readonly RegionId[];
  center: GeoPoint;
  bounds?: BoundingBox;
  timezoneIds: readonly string[];
  countryCodes: readonly string[];
  externalIds?: Readonly<Record<string, string>>;
}

export type PlaceCategory =
  | "sight.natural"
  | "sight.heritage"
  | "sight.museum"
  | "sight.gallery"
  | "sight.architecture"
  | "sight.religious"
  | "sight.landmark"
  | "sight.viewpoint"
  | "outdoor.hiking"
  | "outdoor.camping"
  | "outdoor.beach"
  | "outdoor.hotspring"
  | "outdoor.skiing"
  | "outdoor.diving"
  | "outdoor.cycling"
  | "outdoor.park"
  | "entertainment.theme_park"
  | "entertainment.zoo"
  | "entertainment.aquarium"
  | "entertainment.performance"
  | "entertainment.nightlife"
  | "entertainment.festival"
  | "food.restaurant"
  | "food.snack"
  | "food.breakfast"
  | "food.dessert"
  | "food.cafe"
  | "food.bar"
  | "food.night_market"
  | "food.market"
  | "food.local_specialty"
  | "shopping.must_buy"
  | "shopping.local_brand"
  | "shopping.market"
  | "shopping.mall"
  | "shopping.handicraft"
  | "experience.workshop"
  | "experience.farm"
  | "experience.cruise"
  | "experience.scenic_train"
  | "experience.guided_tour"
  | "experience.family"
  | "stay.hotel"
  | "stay.homestay"
  | "stay.hostel"
  | "stay.resort"
  | "stay.campsite"
  | "transport.airport"
  | "transport.railway"
  | "transport.port"
  | "transport.transit"
  | "transport.parking"
  | "transport.car_rental"
  | "transport.charging"
  | "service.toilet"
  | "service.medical"
  | "service.police"
  | "service.visitor_center"
  | "service.luggage"
  | "service.accessibility"
  | "service.emergency_shelter"
  | `custom.${string}`;

export type SourceKind =
  | "official"
  | "government_open_data"
  | "licensed_provider"
  | "open_data"
  | "editorial_research"
  | "community_submission"
  | "first_party_observation";

export interface SourceReference {
  id: SourceId;
  kind: SourceKind;
  publisher: string;
  title?: string;
  canonicalUrl?: string;
  license?: string;
  retrievedAt: ISODateTime;
  publishedAt?: ISODateTime;
  contentHash?: string;
}

export type VerificationStatus =
  | "unreviewed"
  | "machine_checked"
  | "editor_verified"
  | "disputed"
  | "expired"
  | "rejected";

/**
 * A time-bound assertion. Mutable real-world information must be represented
 * by a fact instead of overwriting the stable Place record.
 */
export interface TemporalFact<T> {
  id: string;
  subjectId: PlaceId | RegionId;
  field: string;
  value: T;
  sourceIds: readonly SourceId[];
  observedAt: ISODateTime;
  validFrom?: ISODateTime;
  validUntil?: ISODateTime;
  confidence: number;
  status: VerificationStatus;
  conflictsWith?: readonly string[];
}

export interface OpeningInterval {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  opensAt: string;
  closesAt: string;
  lastEntryAt?: string;
}

export interface PriceHint {
  amount?: number;
  currency: CurrencyCode;
  description?: LocalizedText;
}

export interface AccessibilityProfile {
  wheelchair?: "yes" | "partial" | "no" | "unknown";
  stroller?: "yes" | "partial" | "no" | "unknown";
  hearingSupport?: boolean;
  visualSupport?: boolean;
  notes?: LocalizedText;
}

export interface Place {
  id: PlaceId;
  name: LocalizedText;
  aliases?: readonly string[];
  categories: readonly PlaceCategory[];
  regionIds: readonly RegionId[];
  location: GeoPoint;
  entranceLocations?: readonly GeoPoint[];
  address?: LocalizedText;
  summary?: LocalizedText;
  tags: readonly string[];
  typicalVisitMinutes?: number;
  bookingRequired?: boolean;
  priceHint?: PriceHint;
  accessibility?: AccessibilityProfile;
  sourceIds: readonly SourceId[];
  externalIds?: Readonly<Record<string, string>>;
  status: "active" | "temporarily_closed" | "permanently_closed" | "draft";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type FeedbackTopic =
  | "opening_hours"
  | "temporary_closure"
  | "entrance"
  | "queue"
  | "price"
  | "reservation"
  | "transport"
  | "accessibility"
  | "safety"
  | "construction"
  | "food_quality"
  | "service_quality"
  | "crowding"
  | "other";

export interface CommunityFeedback {
  id: string;
  subjectId: PlaceId | RegionId;
  authorId: UserId;
  topic: FeedbackTopic;
  message: string;
  createdAt: ISODateTime;
  occurredAt?: ISODateTime;
  locationEvidence?: GeoPoint;
  mediaEvidenceIds?: readonly string[];
  sourceUrl?: string;
  moderationStatus: "pending" | "accepted" | "rejected" | "quarantined";
  spamRisk: number;
  authorTrust: number;
}

/** Aggregated community information shown beside, never over, editorial facts. */
export interface CommunitySignal {
  id: string;
  subjectId: PlaceId | RegionId;
  topic: FeedbackTopic;
  summary: LocalizedText;
  acceptedFeedbackCount: number;
  uniqueAuthorCount: number;
  weightedSupport: number;
  firstSeenAt: ISODateTime;
  lastSeenAt: ISODateTime;
  displayUntil: ISODateTime;
  status: "emerging" | "visible" | "confirmed" | "resolved" | "suppressed";
  label: "来自旅行者反馈";
  feedbackIds: readonly string[];
}

export type TravelMode =
  | "walk"
  | "bicycle"
  | "ebike"
  | "public_transit"
  | "taxi"
  | "drive"
  | "train"
  | "flight"
  | "ferry"
  | "custom";

export interface MarkerStyle {
  iconKey: string;
  variant?: string;
  colorToken?: string;
  scale?: number;
  showSequence: boolean;
  label?: string;
}

export interface RouteStyle {
  linePattern: "solid" | "dashed" | "dotted";
  width: number;
  colorToken?: string;
  arrow: "none" | "forward" | "both";
  directionVisible: boolean;
}

export interface TripStop {
  id: string;
  placeId: PlaceId;
  dayId: string;
  sequence: number;
  plannedStart?: ISODateTime;
  plannedEnd?: ISODateTime;
  durationMinutes: number;
  priority: "required" | "preferred" | "optional";
  locked: boolean;
  notes?: string;
  markerStyle: MarkerStyle;
  groupIds: readonly string[];
}

export interface TripLeg {
  id: string;
  fromStopId: string;
  toStopId: string;
  travelMode: TravelMode;
  estimatedMinutes?: number;
  distanceMeters?: number;
  routeProvider?: string;
  routeGeometry?: string;
  style: RouteStyle;
  notes?: string;
}

export interface TripDay {
  id: string;
  localDate: string;
  timezoneId: string;
  startLocation?: GeoPoint;
  endLocation?: GeoPoint;
  stopIds: readonly string[];
  legIds: readonly string[];
  accommodationPlaceId?: PlaceId;
  notes?: string;
}

export interface TripPreferences {
  pace: "relaxed" | "balanced" | "intensive";
  budgetLevel: "economy" | "standard" | "premium" | "custom";
  preferredModes: readonly TravelMode[];
  avoidModes?: readonly TravelMode[];
  dietaryTags?: readonly string[];
  accessibilityNeeds?: readonly string[];
  interests?: readonly PlaceCategory[];
  dailyStartTime?: string;
  dailyEndTime?: string;
  maxWalkingMinutesPerDay?: number;
}

export interface Trip {
  id: TripId;
  ownerId: UserId;
  name: string;
  startDate: string;
  endDate: string;
  destinationRegionIds: readonly RegionId[];
  days: readonly TripDay[];
  stops: readonly TripStop[];
  legs: readonly TripLeg[];
  preferences: TripPreferences;
  version: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DisplaySignalPolicy {
  minimumUniqueAuthors: number;
  minimumWeightedSupport: number;
  maximumSpamRisk: number;
  freshnessDays: number;
}

export function assertGeoPoint(point: GeoPoint): void {
  if (!Number.isFinite(point.longitude) || point.longitude < -180 || point.longitude > 180) {
    throw new RangeError(`Invalid longitude: ${point.longitude}`);
  }
  if (!Number.isFinite(point.latitude) || point.latitude < -90 || point.latitude > 90) {
    throw new RangeError(`Invalid latitude: ${point.latitude}`);
  }
}

export function isFactFresh(fact: TemporalFact<unknown>, at: Date = new Date()): boolean {
  if (fact.status === "expired" || fact.status === "rejected") return false;
  if (fact.validFrom && at < new Date(fact.validFrom)) return false;
  if (fact.validUntil && at > new Date(fact.validUntil)) return false;
  return true;
}

export function shouldDisplayCommunitySignal(
  signal: CommunitySignal,
  policy: DisplaySignalPolicy,
  at: Date = new Date(),
): boolean {
  if (signal.status === "suppressed" || signal.status === "resolved") return false;
  if (signal.uniqueAuthorCount < policy.minimumUniqueAuthors) return false;
  if (signal.weightedSupport < policy.minimumWeightedSupport) return false;
  if (at > new Date(signal.displayUntil)) return false;

  const lastSeen = new Date(signal.lastSeenAt);
  const ageInDays = (at.getTime() - lastSeen.getTime()) / 86_400_000;
  return ageInDays <= policy.freshnessDays;
}
