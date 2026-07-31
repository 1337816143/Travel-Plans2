import type { GeoPoint } from "@travel/domain";
import type { ProviderDescriptor, ProviderRequestContext } from "./base";

export interface WeatherRequest {
  location: GeoPoint;
  startDate: string;
  endDate: string;
  timezoneId: string;
}

export interface DailyWeather {
  localDate: string;
  conditionCode: string;
  temperatureMinCelsius?: number;
  temperatureMaxCelsius?: number;
  precipitationProbability?: number;
  windSpeedMaxKph?: number;
  severeWeather?: boolean;
}

export interface WeatherProvider {
  descriptor: ProviderDescriptor;
  forecast(
    request: WeatherRequest,
    context: ProviderRequestContext,
  ): Promise<readonly DailyWeather[]>;
}
