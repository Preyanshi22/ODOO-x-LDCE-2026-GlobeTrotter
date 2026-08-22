import type { Destination, Trip } from '../types';

export interface SuggestedStop {
  destination: Destination;
  reason: string;
  score: number;
}

const ROUTE_PAIRINGS: Record<string, string[]> = {
  Paris: ['London', 'Rome', 'Barcelona', 'Zurich', 'Venice', 'Florence', 'Amsterdam'],
  Rome: ['Florence', 'Venice', 'Amalfi Coast', 'Paris', 'Barcelona', 'Santorini', 'Prague'],
  Tokyo: ['Kyoto', 'Osaka', 'Seoul', 'Singapore', 'Bali'],
  Kyoto: ['Tokyo', 'Osaka', 'Seoul'],
  Osaka: ['Kyoto', 'Tokyo'],
  Bali: ['Singapore', 'Bangkok', 'Tokyo'],
  London: ['Paris', 'Amsterdam', 'Edinburgh', 'Dublin'],
  Barcelona: ['Madrid', 'Paris', 'Rome', 'Nice'],
  'New York': ['London', 'Paris', 'Boston', 'Washington DC'],
  Dubai: ['Abu Dhabi', 'Doha', 'Singapore', 'London'],
};

export function getSuggestedStops(trip: Trip, destinations: Destination[]): SuggestedStop[] {
  if (!trip || !destinations) return [];

  const existingCities = new Set(trip.stops.map((stop) => stop.city.toLowerCase()));
  const existingCountries = new Set(trip.stops.map((stop) => stop.country.toLowerCase()));

  // Determine existing trip regions & tags
  const existingRegions = new Set<string>();
  const tripTags = new Set<string>();

  trip.stops.forEach((stop) => {
    const dest = destinations.find((d) => d.city.toLowerCase() === stop.city.toLowerCase());
    if (dest) {
      existingRegions.add(dest.region);
      dest.tags.forEach((tag) => tripTags.add(tag));
    }
  });

  const suggestions: SuggestedStop[] = destinations
    .filter((dest) => !existingCities.has(dest.city.toLowerCase()))
    .map((dest) => {
      let score = dest.popularity / 2; // base score from popularity
      let reason = `Popular travel destination in ${dest.region}`;

      // 1. Check direct route pairing with current trip stops
      let pairedCity = '';
      for (const stop of trip.stops) {
        const pairings = ROUTE_PAIRINGS[stop.city];
        if (pairings && pairings.some((p) => p.toLowerCase() === dest.city.toLowerCase())) {
          pairedCity = stop.city;
          break;
        }
      }

      if (pairedCity) {
        score += 50;
        reason = `Popular pairing with ${pairedCity}`;
      } else if (existingCountries.has(dest.country.toLowerCase())) {
        score += 40;
        reason = `Also in ${dest.country}`;
      } else if (existingRegions.size > 0 && existingRegions.has(dest.region)) {
        score += 30;
        reason = `Fits your ${dest.region} route`;
      }

      // 2. Check tag / theme overlap
      const matchingTags = dest.tags.filter((t) => tripTags.has(t));
      if (matchingTags.length > 0) {
        score += matchingTags.length * 10;
        if (!pairedCity && !existingCountries.has(dest.country.toLowerCase())) {
          reason = `Matches your ${matchingTags.slice(0, 2).join(' & ')} preference`;
        }
      }

      return {
        destination: dest,
        reason,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  return suggestions;
}
