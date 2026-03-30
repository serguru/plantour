import { ItineraryPartDto } from '../../services/itinerary-service';
import { TripActivityDto } from '../../services/trip-activity-service';

export interface TripActivityNameOption {
  name: string;
  activity?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
}

export function sortTripActivityItineraryParts(parts: ItineraryPartDto[]): ItineraryPartDto[] {
  return [...parts].sort((left, right) => {
    const startDateComparison = (left.startDate || '').localeCompare(right.startDate || '');
    return startDateComparison !== 0 ? startDateComparison : left.name.localeCompare(right.name);
  });
}

export function enrichTripActivities(activities: TripActivityDto[], itineraryParts: ItineraryPartDto[]): TripActivityDto[] {
  const itineraryPartLookup = new Map(itineraryParts.map((part) => [part.id, part.name]));

  return activities.map((activity) => ({
    ...activity,
    itineraryPartName: activity.itineraryPartId ? itineraryPartLookup.get(activity.itineraryPartId) ?? null : null,
  }));
}

export function buildTripActivityNameOptions(activities: TripActivityDto[]): TripActivityNameOption[] {
  const lookup = new Map<string, TripActivityNameOption>();

  for (const activity of activities) {
    const normalizedName = activity.name?.trim().toLowerCase();
    if (!normalizedName || lookup.has(normalizedName)) {
      continue;
    }

    lookup.set(normalizedName, {
      name: activity.name,
      activity: activity.activity ?? null,
      address: activity.address ?? null,
      latitude: activity.latitude ?? null,
      longitude: activity.longitude ?? null,
      notes: activity.notes ?? null,
    });
  }

  return Array.from(lookup.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export function buildTripActivityTypeOptions(activities: TripActivityDto[]): string[] {
  return Array.from(
    new Set(
      activities
        .map((activity) => activity.activity?.trim())
        .filter((value): value is string => !!value)
        .map((value) => value.toLowerCase())
    )
  )
    .map((normalizedValue) => {
      const match = activities.find((activity) => activity.activity?.trim().toLowerCase() === normalizedValue);
      return match?.activity?.trim() ?? normalizedValue;
    })
    .sort((left, right) => left.localeCompare(right));
}