import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GoogleMap, MapInfoWindow, MapMarker, MapPolyline } from '@angular/google-maps';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { Checkbox } from 'primeng/checkbox';
import { firstValueFrom, forkJoin } from 'rxjs';
import { EntitiesHeader, HeaderButtonConfig, MenuConfig } from '../../entities/entities-header-component/entities-header-component';
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
  itineraryPartId: string | null;
};

type InvalidLocation = {
  id: string;
  title: string;
  entityLabel: string;
  reason: string;
  address: string | null;
  startDate: string | null;
};

type PositionResolution = {
  position: google.maps.LatLngLiteral | null;
  reason: string;
  skipped: boolean;
};

type InvalidItineraryPartCompatibility = {
  part: ItineraryPartDto;
  reason: string;
};

type ActivityPath = {
  id: string;
  title: string;
  path: google.maps.LatLngLiteral[];
  options: google.maps.PolylineOptions;
};

type PathListItem = {
  id: string;
  title: string;
  kindLabel: string;
  pointCount: number;
  visible: boolean;
};

type ActivitySource = {
  activity: TripActivityDto;
  kind: 'personal' | 'shared';
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

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  australia: 'AU',
  austria: 'AT',
  canada: 'CA',
  france: 'FR',
  germany: 'DE',
  india: 'IN',
  italy: 'IT',
  japan: 'JP',
  mexico: 'MX',
  spain: 'ES',
  'united kingdom': 'GB',
  uk: 'GB',
  'great britain': 'GB',
  'united states': 'US',
  usa: 'US',
  'united states of america': 'US',
};

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [EntitiesHeader, FormsModule, Checkbox, GoogleMap, MapInfoWindow, MapMarker, MapPolyline],
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
  private geocoder: google.maps.Geocoder | null = null;

  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly mapsApiKeyConfigured = mapsConfig.apiKey.trim().length > 0;
  protected readonly apiReady = signal(false);
  protected readonly loading = signal(false);
  protected readonly loadError = signal('');
  protected readonly trip = signal<TripDto | null>(null);
  protected readonly selectedPoint = signal<MapPoint | null>(null);
  protected readonly points = signal<MapPoint[]>([]);
  protected readonly itineraryPath = signal<google.maps.LatLngLiteral[]>([]);
  protected readonly activityPaths = signal<ActivityPath[]>([]);
  protected readonly invalidLocations = signal<InvalidLocation[]>([]);
  protected readonly invalidItineraryParts = signal<InvalidItineraryPartCompatibility[]>([]);
  protected readonly showItineraryPath = signal(true);
  protected readonly hiddenActivityPathIds = signal<string[]>([]);
  protected readonly pathsCollapsed = signal(false);

  protected readonly mapCenter = signal<google.maps.LatLngLiteral>(mapsConfig.defaultCenter);
  protected readonly zoom = signal(2);
  protected readonly itineraryPolylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#0b6e4f',
    strokeOpacity: 0.95,
    strokeWeight: 5,
    geodesic: true,
  };

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

  protected readonly hasLocationIssues = computed(() => this.invalidLocations().length > 0);
  protected readonly visibleActivityPaths = computed(() => {
    const hiddenIds = new Set(this.hiddenActivityPathIds());
    return this.activityPaths().filter((path) => !hiddenIds.has(path.id));
  });
  protected readonly visiblePoints = computed(() => this.points().filter((point) => this.isPointVisible(point)));
  protected readonly selectedDirectionPoints = computed(() => {
    const pathPoints: google.maps.LatLngLiteral[] = [];

    if (this.showItineraryPath() && this.itineraryPath().length > 1) {
      pathPoints.push(...this.itineraryPath());
    }

    for (const path of this.visibleActivityPaths()) {
      pathPoints.push(...path.path);
    }

    return this.compactDirectionPoints(pathPoints);
  });
  protected readonly canGetDirections = computed(() => this.selectedDirectionPoints().length > 1);
  protected readonly canHideAllPaths = computed(() => this.pathList().some((path) => path.visible));
  protected readonly canShowAllPaths = computed(() => this.pathList().some((path) => !path.visible));
  protected readonly headerButtons = computed<HeaderButtonConfig[]>(() => [
    {
      label: 'Get directions',
      icon: 'compass',
      action: () => this.getDirections(),
      disabled: !this.canGetDirections(),
    },
    {
      label: 'Show all paths',
      icon: 'eye',
      action: () => this.showAllPaths(),
      disabled: !this.canShowAllPaths(),
    },
    {
      label: 'Hide all paths',
      icon: 'eye-slash',
      action: () => this.hideAllPaths(),
      disabled: !this.canHideAllPaths(),
    },
  ]);
  protected readonly menuItems = computed<MenuConfig[]>(() => []);
  protected readonly pathList = computed<PathListItem[]>(() => {
    const items: PathListItem[] = [];
    const itineraryPath = this.itineraryPath();

    if (itineraryPath.length > 1) {
      items.push({
        id: 'itinerary',
        title: 'Itinerary',
        kindLabel: 'Itinerary path',
        pointCount: itineraryPath.length,
        visible: this.showItineraryPath(),
      });
    }

    const hiddenIds = new Set(this.hiddenActivityPathIds());
    for (const path of this.activityPaths()) {
      items.push({
        id: path.id,
        title: path.title,
        kindLabel: 'Activity path',
        pointCount: path.path.length,
        visible: !hiddenIds.has(path.id),
      });
    }

    return items;
  });

  protected hasInvalidItineraryIssues(): boolean {
    return this.hasLocationIssues();
  }

  protected hasBlockingItineraryIssue(): boolean {
    return false;
  }

  protected routePath(): google.maps.LatLngLiteral[] {
    return this.itineraryPath();
  }

  protected toggleItineraryPath(visible: boolean): void {
    this.showItineraryPath.set(visible);
  }

  protected toggleActivityPath(pathId: string, visible: boolean): void {
    const hiddenIds = new Set(this.hiddenActivityPathIds());

    if (visible) {
      hiddenIds.delete(pathId);
    } else {
      hiddenIds.add(pathId);
    }

    this.hiddenActivityPathIds.set([...hiddenIds]);
  }

  protected togglePathsCollapsed(): void {
    this.pathsCollapsed.update((value) => !value);
  }

  protected hideAllPaths(): void {
    if (!this.canHideAllPaths()) {
      return;
    }

    this.showItineraryPath.set(false);
    this.hiddenActivityPathIds.set(this.activityPaths().map((path) => path.id));
  }

  protected showAllPaths(): void {
    if (!this.canShowAllPaths()) {
      return;
    }

    this.showItineraryPath.set(true);
    this.hiddenActivityPathIds.set([]);
  }

  protected getDirections(): void {
    if (!this.isBrowser || !this.canGetDirections()) {
      return;
    }

    const points = this.selectedDirectionPoints();
    const origin = this.formatDirectionPoint(points[0]);
    const destination = this.formatDirectionPoint(points[points.length - 1]);
    const waypointPoints = points.slice(1, -1).map((point) => this.formatDirectionPoint(point));
    const url = new URL('https://www.google.com/maps/dir/');

    url.searchParams.set('api', '1');
    url.searchParams.set('origin', origin);
    url.searchParams.set('destination', destination);
    url.searchParams.set('travelmode', 'driving');

    if (waypointPoints.length > 0) {
      url.searchParams.set('waypoints', waypointPoints.join('|'));
    }

    window.open(url.toString(), '_blank', 'noopener');
  }

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

      const mapData = await this.buildMapData(
        sortedItineraryParts,
        response.personalActivities,
        response.sharedActivities
      );

      this.points.set(mapData.points);
      this.itineraryPath.set(mapData.itineraryPath);
      this.activityPaths.set(mapData.activityPaths);
      this.invalidLocations.set(mapData.invalidLocations);
      this.invalidItineraryParts.set([]);
      this.showItineraryPath.set(true);
      this.hiddenActivityPathIds.set([]);
      this.pathsCollapsed.set(false);
      this.selectedPoint.set(null);

      if (mapData.points.length > 0) {
        this.mapCenter.set(mapData.points[0].position);
        this.zoom.set(mapData.points.length === 1 ? 13 : 5);
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
      authReferrerPolicy: 'origin',
      mapIds: [mapsConfig.mapId],
    });

    await Promise.all([importLibrary('maps'), importLibrary('marker'), importLibrary('geocoding')]);
    this.geocoder = new google.maps.Geocoder();
    this.apiReady.set(true);
  }

  private async buildMapData(
    itineraryParts: ItineraryPartDto[],
    personalActivities: TripActivityDto[],
    sharedActivities: TripActivityDto[]
  ): Promise<{
    points: MapPoint[];
    itineraryPath: google.maps.LatLngLiteral[];
    activityPaths: ActivityPath[];
    invalidLocations: InvalidLocation[];
  }> {
    const points: MapPoint[] = [];
    const invalidLocations: InvalidLocation[] = [];
    const itineraryPointByPartId = new Map<string, MapPoint>();

    for (const part of itineraryParts) {
      const result = await this.resolvePosition(part.latitude, part.longitude, part.address);
      if (!result.position) {
        if (result.skipped) {
          continue;
        }

        invalidLocations.push({
          id: `itinerary-${part.id}`,
          title: part.name,
          entityLabel: 'Itinerary part',
          reason: result.reason,
          address: part.address?.trim() || null,
          startDate: part.startDate ?? null,
        });
        continue;
      }

      const point = this.buildItineraryPoint(part, result.position);
      itineraryPointByPartId.set(part.id, point);
      points.push(point);
    }

    const itineraryPath = itineraryParts
      .map((part) => itineraryPointByPartId.get(part.id)?.position ?? null)
      .filter((position): position is google.maps.LatLngLiteral => position !== null);

    const allActivities: ActivitySource[] = [
      ...personalActivities.map((activity) => ({ activity, kind: 'personal' as const })),
      ...sharedActivities.map((activity) => ({ activity, kind: 'shared' as const })),
    ].sort((left, right) =>
      this.compareByStartDate(
        left.activity.startDate,
        right.activity.startDate,
        left.activity.name,
        right.activity.name
      )
    );

    const activityPointsByPartId = new Map<string, MapPoint[]>();

    for (const source of allActivities) {
      const result = await this.resolvePosition(
        source.activity.latitude,
        source.activity.longitude,
        source.activity.address
      );

      if (!result.position) {
        if (result.skipped) {
          continue;
        }

        invalidLocations.push({
          id: `${source.kind}-${source.activity.id}`,
          title: source.activity.name,
          entityLabel: source.kind === 'personal' ? 'Personal activity' : 'Shared activity',
          reason: result.reason,
          address: source.activity.address?.trim() || null,
          startDate: source.activity.startDate ?? null,
        });
        continue;
      }

      const point = this.buildActivityPoint(source.activity, source.kind, result.position);
      points.push(point);

      if (point.itineraryPartId) {
        const groupedPoints = activityPointsByPartId.get(point.itineraryPartId) ?? [];
        groupedPoints.push(point);
        activityPointsByPartId.set(point.itineraryPartId, groupedPoints);
      }
    }

    const activityPaths = [...activityPointsByPartId.entries()]
      .map(([itineraryPartId, groupedPoints]) => {
        const sortedPoints = [...groupedPoints].sort((left, right) =>
          this.compareByStartDate(left.startDate, right.startDate, left.title, right.title)
        );

        if (sortedPoints.length < 2) {
          return null;
        }

        const itineraryTitle = itineraryPointByPartId.get(itineraryPartId)?.title || sortedPoints[0].meta;
        return {
          id: `activity-path-${itineraryPartId}`,
          title: itineraryTitle,
          path: sortedPoints.map((point) => point.position),
          options: this.buildActivityPolylineOptions(),
        } satisfies ActivityPath;
      })
      .filter((path): path is ActivityPath => path !== null);

    const sortedPoints = [...points].sort((left, right) =>
      this.compareByStartDate(left.startDate, right.startDate, left.title, right.title)
    );

    return {
      points: sortedPoints,
      itineraryPath,
      activityPaths,
      invalidLocations,
    };
  }

  private buildItineraryPoint(
    part: ItineraryPartDto,
    position: google.maps.LatLngLiteral
  ): MapPoint {
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
      itineraryPartId: part.id,
    };
  }

  private buildActivityPoint(
    activity: TripActivityDto,
    kind: 'personal' | 'shared',
    position: google.maps.LatLngLiteral
  ): MapPoint {
    const itineraryPartLabel = activity.itineraryPartName?.trim();
    const baseMeta = activity.activity?.trim() || (kind === 'personal' ? 'Personal activity' : 'Shared activity');

    return {
      id: `${kind}-${activity.id}`,
      title: activity.name,
      kind,
      kindLabel: kind === 'personal' ? 'Personal activity' : 'Shared activity',
      meta: itineraryPartLabel ? `${baseMeta} · ${itineraryPartLabel}` : baseMeta,
      address: activity.address?.trim() || null,
      notes: activity.notes?.trim() || null,
      startDate: activity.startDate ?? null,
      endDate: activity.endDate ?? null,
      position,
      itineraryPartId: activity.itineraryPartId ?? null,
    };
  }

  private buildActivityPolylineOptions(): google.maps.PolylineOptions {
    return {
      strokeColor: '#2563eb',
      strokeOpacity: 0.75,
      strokeWeight: 4,
      geodesic: true,
    };
  }

  private async resolvePosition(
    latitude?: number | null,
    longitude?: number | null,
    address?: string | null
  ): Promise<PositionResolution> {
    if (this.hasValidCoordinates(latitude, longitude)) {
      return {
        position: { lat: latitude as number, lng: longitude as number },
        reason: '',
        skipped: false,
      };
    }

    const normalizedAddress = address?.trim();
    if (!normalizedAddress) {
      return {
        position: null,
        reason: '',
        skipped: true,
      };
    }

    if (this.geocodeCache.has(normalizedAddress)) {
      const cachedPosition = this.geocodeCache.get(normalizedAddress) ?? null;
      return {
        position: cachedPosition,
        reason: cachedPosition ? '' : 'The address could not be placed on the map.',
        skipped: false,
      };
    }

    const position = await this.geocodeAddress(normalizedAddress);
    this.geocodeCache.set(normalizedAddress, position);
    return {
      position,
      reason: position ? '' : 'The address could not be placed on the map.',
      skipped: false,
    };
  }

  private async geocodeAddress(address: string): Promise<google.maps.LatLngLiteral | null> {
    const directMatch = await this.geocodeSingleAddress(address);
    if (directMatch) {
      return directMatch;
    }

    const candidates = this.buildRelaxedAddressCandidates(address);
    for (const candidate of candidates) {
      const candidateMatch = await this.geocodeSingleAddress(candidate);
      if (candidateMatch) {
        return candidateMatch;
      }
    }

    return this.geocodeGroupedAddressParts(address);
  }

  private geocodeSingleAddress(address: string): Promise<google.maps.LatLngLiteral | null> {
    if (!this.geocoder) {
      return Promise.resolve(null);
    }

    const request = this.buildGeocodeRequest(address);

    return new Promise((resolve) => {
      this.geocoder?.geocode(request, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          resolve(results[0].geometry.location.toJSON());
          return;
        }

        resolve(null);
      });
    });
  }

  private buildGeocodeRequest(address: string): google.maps.GeocoderRequest {
    const inferredCountryCode = this.inferCountryCode(address);
    const request: google.maps.GeocoderRequest = {
      address,
    };

    if (inferredCountryCode) {
      request.region = inferredCountryCode.toLowerCase();
      request.componentRestrictions = {
        country: inferredCountryCode,
      };
    }

    return request;
  }

  private buildRelaxedAddressCandidates(address: string): string[] {
    const normalizedAddress = address.trim();
    const candidates = new Set<string>();
    const groupedParts = this.extractGroupedAddressParts(normalizedAddress);

    candidates.add(normalizedAddress.replace(/\s*&\s*/g, ' and '));
    candidates.add(normalizedAddress.replace(/\s*\/\s*/g, ' '));

    for (const part of groupedParts) {
      candidates.add(part);
    }

    candidates.delete(normalizedAddress);
    return [...candidates].filter((candidate) => candidate.trim().length > 0);
  }

  private inferCountryCode(address: string): string | null {
    const segments = address
      .split(',')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);

    if (segments.length === 0) {
      return null;
    }

    const trailingSegment = segments[segments.length - 1].toLowerCase();
    if (/^[a-z]{2}$/i.test(trailingSegment)) {
      return trailingSegment.toUpperCase();
    }

    return COUNTRY_NAME_TO_CODE[trailingSegment] ?? null;
  }

  private async geocodeGroupedAddressParts(address: string): Promise<google.maps.LatLngLiteral | null> {
    const groupedParts = this.extractGroupedAddressParts(address);

    if (groupedParts.length < 2) {
      return null;
    }

    const positions: google.maps.LatLngLiteral[] = [];
    for (const part of groupedParts) {
      const position = await this.geocodeSingleAddress(part);
      if (position) {
        positions.push(position);
      }
    }

    if (positions.length === 0) {
      return null;
    }

    if (positions.length === 1) {
      return positions[0];
    }

    return {
      lat: positions.reduce((sum, position) => sum + position.lat, 0) / positions.length,
      lng: positions.reduce((sum, position) => sum + position.lng, 0) / positions.length,
    };
  }

  private extractGroupedAddressParts(address: string): string[] {
    const rawParts = address
      .split(/\s*(?:&| and |\/|\+|;|\|)\s*/i)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (rawParts.length <= 1) {
      return rawParts;
    }

    const sharedSuffix = this.extractSharedLocationSuffix(rawParts);
    return rawParts.map((part) => this.appendSharedLocationSuffix(part, sharedSuffix));
  }

  private extractSharedLocationSuffix(parts: string[]): string {
    for (let index = parts.length - 1; index >= 0; index -= 1) {
      const commaIndex = parts[index].indexOf(',');
      if (commaIndex >= 0) {
        return parts[index].slice(commaIndex + 1).trim();
      }
    }

    return '';
  }

  private appendSharedLocationSuffix(part: string, sharedSuffix: string): string {
    if (!sharedSuffix || part.includes(',')) {
      return part;
    }

    return `${part}, ${sharedSuffix}`;
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

  private isPointVisible(point: MapPoint): boolean {
    if (point.kind === 'itinerary') {
      return this.showItineraryPath();
    }

    if (!point.itineraryPartId) {
      return true;
    }

    const pathId = `activity-path-${point.itineraryPartId}`;
    const hasPath = this.activityPaths().some((path) => path.id === pathId);
    if (!hasPath) {
      return true;
    }

    return !this.hiddenActivityPathIds().includes(pathId);
  }

  private compactDirectionPoints(points: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral[] {
    const compacted: google.maps.LatLngLiteral[] = [];

    for (const point of points) {
      const previous = compacted[compacted.length - 1];
      if (previous && previous.lat === point.lat && previous.lng === point.lng) {
        continue;
      }

      compacted.push(point);
    }

    return compacted;
  }

  private formatDirectionPoint(point: google.maps.LatLngLiteral): string {
    return `${point.lat},${point.lng}`;
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

  private hasValidCoordinates(
    latitude?: number | null,
    longitude?: number | null
  ): boolean {
    return typeof latitude === 'number'
      && Number.isFinite(latitude)
      && latitude >= -90
      && latitude <= 90
      && typeof longitude === 'number'
      && Number.isFinite(longitude)
      && longitude >= -180
      && longitude <= 180;
  }
}
