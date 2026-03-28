import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  GoogleMap,
  MapInfoWindow,
  MapMarker,
  MapPolyline,
} from '@angular/google-maps';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { firstValueFrom, forkJoin } from 'rxjs';
import { mapsConfig } from './maps.config';
import { ItineraryPartDto, ItineraryService } from '../../../services/itinerary-service';
import { TripActivityDto, TripActivityService } from '../../../services/trip-activity-service';
import { TripDto, TripService } from '../../../services/trip-service';

type MapPointKind = 'itinerary' | 'personal' | 'shared';

type MapPoint = {
  id: string;
  title: string;
  kind: MapPointKind;
  kindLabel: string;
  meta: string;
  address: string | null;
  notes: string | null;
  startDate: string | null;
  endDate: string | null;
  position: google.maps.LatLngLiteral;
};

type InvalidItineraryPart = {
  part: ItineraryPartDto;
  reason: string;
};

type MarkerStyle = {
  fill: string;
  stroke: string;
  chipFill: string;
};

const MARKER_STYLES: Record<MapPointKind, MarkerStyle> = {
  itinerary: {
    fill: '#0b6e4f',
    stroke: '#084c38',
    chipFill: '#effaf5',
  },
  personal: {
    fill: '#1d4ed8',
    stroke: '#1e3a8a',
    chipFill: '#eff6ff',
  },
  shared: {
    fill: '#b45309',
    stroke: '#7c2d12',
    chipFill: '#fff7ed',
  },
};

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMap, MapInfoWindow, MapMarker, MapPolyline],
  templateUrl: './map-component.html',
  styleUrls: ['./map-component.scss'],
})
export class MapComponent implements OnInit {
  @ViewChild(GoogleMap) private googleMap?: GoogleMap;
  @ViewChild(MapInfoWindow) private infoWindow?: MapInfoWindow;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly itineraryService = inject(ItineraryService);
  private readonly tripActivityService = inject(TripActivityService);
  private readonly tripService = inject(TripService);
  private readonly geocodeCache = new Map<string, google.maps.LatLngLiteral | null>();

  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly mapsApiKeyConfigured = mapsConfig.apiKey.trim().length > 0;
  protected readonly apiReady = signal(false);
  protected readonly loading = signal(false);
  protected readonly loadError = signal('');
  protected readonly trip = signal<TripDto | null>(null);
  protected readonly itineraryParts = signal<ItineraryPartDto[]>([]);
  protected readonly invalidItineraryParts = signal<InvalidItineraryPart[]>([]);
  protected readonly selectedPoint = signal<MapPoint | null>(null);
  protected readonly points = signal<MapPoint[]>([]);

  protected readonly mapCenter = signal<google.maps.LatLngLiteral>(mapsConfig.defaultCenter);
  protected readonly zoom = signal(2);
  protected readonly polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#0b6e4f',
    strokeOpacity: 0.95,
    strokeWeight: 5,
    geodesic: true,
  };
  protected readonly routePath = computed(() => this.points().map((point) => point.position));

  protected readonly mapOptions = computed<google.maps.MapOptions>(() => ({
    center: this.mapCenter(),
    zoom: this.zoom(),
    mapId: mapsConfig.mapId,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    scaleControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
  }));

  protected readonly hasBlockingItineraryIssue = computed(() => this.invalidItineraryParts().length > 0);

  protected readonly routeSummary = computed(() => {
    const points = this.points();

    if (points.length === 0) {
      return 'No itinerary parts or trip activities with map data were found for this trip.';
    }

    return points.map((point) => point.title).join(' -> ');
  });

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (!tripId) {
      throw new Error('Trip Id is required for the map page');
    }

    void this.initialize(tripId);
  }

  private async initialize(tripId: string): Promise<void> {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.loadError.set('');

    try {
      const trip = await firstValueFrom(this.tripService.getById(tripId));
      this.trip.set(trip);

      if (!this.isBrowser || !this.mapsApiKeyConfigured) {
        return;
      }

      await this.loadGoogleMaps();

      const response = await firstValueFrom(
        forkJoin({
          itineraryParts: this.itineraryService.getAll(tripId),
          personalActivities: this.tripActivityService.getAllPersonal(tripId),
          sharedActivities: this.tripActivityService.getAllPublic(tripId),
        })
      );

      const sortedItineraryParts = [...response.itineraryParts].sort((left, right) =>
        this.compareByStartDate(left.startDate, right.startDate, left.name, right.name)
      );

      this.itineraryParts.set(sortedItineraryParts);

      const { points, invalidItineraryParts } = await this.buildMapPoints(
        sortedItineraryParts,
        response.personalActivities,
        response.sharedActivities
      );

      this.invalidItineraryParts.set(invalidItineraryParts);

      if (invalidItineraryParts.length > 0) {
        this.points.set([]);
        this.selectedPoint.set(null);
        return;
      }

      this.points.set(points);

      if (points.length > 0) {
        this.mapCenter.set(points[0].position);
        this.zoom.set(points.length === 1 ? 13 : 5);
      } else {
        this.loadError.set('No itinerary parts or trip activities with address or coordinates were found for this trip.');
      }

      this.fitToPoints();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown loading error.';
      this.loadError.set(`Unable to load trip map data. ${message}`);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadGoogleMaps(): Promise<void> {
    if (this.apiReady()) {
      return;
    }

    setOptions({
      key: mapsConfig.apiKey,
      v: 'weekly',
      language: mapsConfig.language,
      region: mapsConfig.region,
      authReferrerPolicy: 'origin',
      mapIds: [mapsConfig.mapId],
    });

    await Promise.all([importLibrary('maps'), importLibrary('marker')]);
    this.apiReady.set(true);
  }

  private async buildMapPoints(
    itineraryParts: ItineraryPartDto[],
    personalActivities: TripActivityDto[],
    sharedActivities: TripActivityDto[]
  ): Promise<{ points: MapPoint[]; invalidItineraryParts: InvalidItineraryPart[] }> {
    const sortedPersonalActivities = [...personalActivities].sort((left, right) => this.compareByStartDate(left.startDate, right.startDate, left.name, right.name));
    const sortedSharedActivities = [...sharedActivities].sort((left, right) => this.compareByStartDate(left.startDate, right.startDate, left.name, right.name));

    const itineraryPointResults = await Promise.all(
      itineraryParts.map((part) => this.buildPointFromItineraryPart(part))
    );

    const invalidItineraryParts = itineraryPointResults
      .filter((result): result is InvalidItineraryPart => 'reason' in result)
      .map((result) => result);

    const activityPointResults = await Promise.all([
      ...sortedPersonalActivities.map((activity) => this.buildPointFromActivity(activity, 'personal')),
      ...sortedSharedActivities.map((activity) => this.buildPointFromActivity(activity, 'shared')),
    ]);

    const points = [
      ...itineraryPointResults.filter((result): result is MapPoint => 'position' in result),
      ...activityPointResults.filter((point): point is MapPoint => point !== null),
    ].sort((left, right) => this.compareByStartDate(left.startDate, right.startDate, left.title, right.title));

    return { points, invalidItineraryParts };
  }

  private async buildPointFromItineraryPart(part: ItineraryPartDto): Promise<MapPoint | InvalidItineraryPart> {
    const result = await this.resolvePosition(part.latitude, part.longitude, part.address);
    if (!result.position) {
      return {
        part,
        reason: result.reason,
      };
    }

    const position = result.position;
    if (!position) {
      return {
        part,
        reason: 'This itinerary part does not have usable map coordinates or address.',
      };
    }

    return {
      id: `itinerary-${part.id}`,
      title: part.name,
      kind: 'itinerary',
      kindLabel: 'Itinerary part',
      meta: part.category?.trim() || 'Itinerary part',
      address: part.address?.trim() || null,
      notes: part.notes?.trim() || null,
      startDate: part.startDate ?? null,
      endDate: part.endDate ?? null,
      position,
    };
  }

  private async buildPointFromActivity(activity: TripActivityDto, kind: 'personal' | 'shared'): Promise<MapPoint | null> {
    const result = await this.resolvePosition(activity.latitude, activity.longitude, activity.address);
    if (!result.position) {
      return null;
    }

    return {
      id: `${kind}-${activity.id}`,
      title: activity.name,
      kind,
      kindLabel: kind === 'personal' ? 'Personal activity' : 'Shared activity',
      meta: activity.activity?.trim() || (kind === 'personal' ? 'Personal activity' : 'Shared activity'),
      address: activity.address?.trim() || null,
      notes: activity.notes?.trim() || null,
      startDate: activity.startDate ?? null,
      endDate: activity.endDate ?? null,
      position: result.position,
    };
  }

  private async resolvePosition(
    latitude?: number | null,
    longitude?: number | null,
    address?: string | null
  ): Promise<{ position: google.maps.LatLngLiteral | null; reason: string }> {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return {
        position: { lat: latitude, lng: longitude },
        reason: '',
      };
    }

    const normalizedAddress = address?.trim();
    if (!normalizedAddress) {
      return {
        position: null,
        reason: 'No latitude/longitude and no address were provided.',
      };
    }

    if (this.geocodeCache.has(normalizedAddress)) {
      const cachedPosition = this.geocodeCache.get(normalizedAddress) ?? null;
      return {
        position: cachedPosition,
        reason: cachedPosition ? '' : 'The address could not be placed on the map.',
      };
    }

    const position = await this.geocodeAddress(normalizedAddress);
    this.geocodeCache.set(normalizedAddress, position);
    return {
      position,
      reason: position ? '' : 'The address could not be placed on the map.',
    };
  }

  private geocodeAddress(address: string): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK || !results?.length) {
          resolve(null);
          return;
        }

        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      });
    });
  }

  protected onMapInitialized(map: google.maps.Map): void {
    this.fitToPoints(map);
  }

  protected openPoint(point: MapPoint, marker: MapMarker): void {
    this.selectedPoint.set(point);
    this.infoWindow?.open(marker);
  }

  protected fitToPoints(mapInstance?: google.maps.Map): void {
    const map = mapInstance ?? this.googleMap?.googleMap;
    const points = this.points();

    if (!map || points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setCenter(points[0].position);
      map.setZoom(13);
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    for (const point of points) {
      bounds.extend(point.position);
    }

    map.fitBounds(bounds, 72);
  }

  protected getMarkerOptions(point: MapPoint): google.maps.MarkerOptions {
    const iconWidth = this.getMarkerWidth(point.title);

    return {
      icon: {
        url: this.buildMarkerIconUrl(point),
        scaledSize: new google.maps.Size(iconWidth, 36),
        anchor: new google.maps.Point(14, 30),
      },
      optimized: false,
    };
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  protected formatTripDates(trip: TripDto | null): string {
    if (!trip) {
      return '';
    }

    if (!trip.startDate && !trip.endDate) {
      return 'Dates are not set';
    }

    const start = trip.startDate ? this.formatDate(trip.startDate) : 'No start date';
    const end = trip.endDate ? this.formatDate(trip.endDate) : 'No end date';
    return `${start} - ${end}`;
  }

  private getMarkerWidth(title: string): number {
    return Math.max(120, 44 + title.length * 8);
  }

  private buildMarkerIconUrl(point: MapPoint): string {
    const style = MARKER_STYLES[point.kind];
    const width = this.getMarkerWidth(point.title);
    const escapedTitle = this.escapeXml(point.title);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="36" viewBox="0 0 ${width} 36">
        <path d="M14 1C7.37258 1 2 6.37258 2 13C2 21.75 14 33 14 33C14 33 26 21.75 26 13C26 6.37258 20.6274 1 14 1Z" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5"/>
        <circle cx="14" cy="13" r="4.5" fill="#ffffff"/>
        <rect x="30" y="7" width="${width - 34}" height="18" rx="9" fill="${style.chipFill}" stroke="${style.stroke}" stroke-width="1"/>
        <text x="39" y="20" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="#132238">${escapedTitle}</text>
      </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private compareByStartDate(
    leftStartDate: string | null | undefined,
    rightStartDate: string | null | undefined,
    leftName: string,
    rightName: string
  ): number {
    const leftValue = leftStartDate ?? '';
    const rightValue = rightStartDate ?? '';
    const dateComparison = leftValue.localeCompare(rightValue);
    return dateComparison !== 0 ? dateComparison : leftName.localeCompare(rightName);
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
