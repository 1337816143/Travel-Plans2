export type ProviderCapability =
  | "place_search"
  | "place_details"
  | "geocoding"
  | "reverse_geocoding"
  | "route"
  | "route_matrix"
  | "weather_current"
  | "weather_forecast"
  | "transit"
  | "map_tiles"
  | "opening_hours"
  | "content_evidence";

export interface ProviderDescriptor {
  id: string;
  displayName: string;
  capabilities: readonly ProviderCapability[];
  supportedCountryCodes?: readonly string[];
  attribution?: string;
  termsUrl?: string;
  license?: string;
  commercialUse: "allowed" | "restricted" | "unknown";
  cachePolicy: "no_cache" | "short_lived" | "persistent" | "provider_specific";
}

export interface ProviderRequestContext {
  requestId: string;
  locale: string;
  countryCode?: string;
  client: "web" | "miniapp" | "worker" | "admin";
  userId?: string;
}

export class ProviderRegistry<T extends { descriptor: ProviderDescriptor }> {
  private readonly providers = new Map<string, T>();

  register(provider: T): void {
    if (this.providers.has(provider.descriptor.id)) {
      throw new Error(`Provider already registered: ${provider.descriptor.id}`);
    }
    this.providers.set(provider.descriptor.id, provider);
  }

  get(id: string): T {
    const provider = this.providers.get(id);
    if (!provider) throw new Error(`Provider not configured: ${id}`);
    return provider;
  }

  findByCapability(capability: ProviderCapability): readonly T[] {
    return [...this.providers.values()].filter((provider) =>
      provider.descriptor.capabilities.includes(capability),
    );
  }
}
