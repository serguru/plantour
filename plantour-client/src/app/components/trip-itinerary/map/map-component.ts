import { Component, ViewChild, computed, signal } from '@angular/core';
import {
  GoogleMap,
  MapAdvancedMarker,
  MapInfoWindow,
  MapPolyline,
  MapTrafficLayer,
} from '@angular/google-maps';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { mapsConfig } from './maps.config';

type FeatureSpot = {
  id: string;
  title: string;
  summary: string;
  position: google.maps.LatLngLiteral;
  accent: string;
};

type MarkerSelection = {
  title: string;
  summary: string;
  accent: string;
  position: google.maps.LatLngLiteral;
};

type RouteStop = {
  id: string;
  title: string;
  summary: string;
  query: string;
  position: google.maps.LatLngLiteral;
};

type RouteLeg = {
  id: string;
  from: RouteStop;
  to: RouteStop;
  title: string;
};

const FEATURE_SPOTS: FeatureSpot[] = [
  {
    id: 'vancouver',
    title: 'Vancouver',
    summary: 'Departure and return point for the international trip.',
    position: { lat: 49.2827, lng: -123.1207 },
    accent: 'sky',
  },
  {
    id: 'london',
    title: 'London',
    summary: 'Transatlantic stop on the itinerary before continuing through Europe.',
    position: { lat: 51.5074, lng: -0.1278 },
    accent: 'amber',
  },
  {
    id: 'rome',
    title: 'Rome',
    summary: 'Mediterranean leg of the trip and midpoint of the European stops.',
    position: { lat: 41.9028, lng: 12.4964 },
    accent: 'coral',
  },
  {
    id: 'paris',
    title: 'Paris',
    summary: 'Final European stop before returning across the Atlantic to Vancouver.',
    position: { lat: 48.8566, lng: 2.3522 },
    accent: 'mint',
  },
];

const CUSTOM_ROUTE_STOPS: RouteStop[] = [
  {
    id: 'trip-vancouver-start',
    title: 'Vancouver',
    summary: 'Trip departure point on the Pacific coast.',
    query: 'Vancouver BC',
    position: { lat: 49.2827, lng: -123.1207 },
  },
  {
    id: 'trip-london',
    title: 'London',
    summary: 'Transatlantic arrival before the continental Europe segment.',
    query: 'London UK',
    position: { lat: 51.5074, lng: -0.1278 },
  },
  {
    id: 'trip-rome',
    title: 'Rome',
    summary: 'Italian stop before continuing north to Paris.',
    query: 'Rome Italy',
    position: { lat: 41.9028, lng: 12.4964 },
  },
  {
    id: 'trip-paris',
    title: 'Paris',
    summary: 'Final European stop before returning to Vancouver.',
    query: 'Paris France',
    position: { lat: 48.8566, lng: 2.3522 },
  },
  {
    id: 'trip-vancouver-end',
    title: 'Vancouver',
    summary: 'Return point that completes the round trip.',
    query: 'Vancouver BC',
    position: { lat: 49.2827, lng: -123.1207 },
  },
];

const ROME_SIGHTSEEING_STOPS: RouteStop[] = [
  {
    id: 'rome-colosseum',
    title: 'Colosseum',
    summary: 'Ancient amphitheater and the strongest visual anchor for the Rome walk.',
    query: 'Colosseum Rome Italy',
    position: { lat: 41.8902, lng: 12.4922 },
  },
  {
    id: 'rome-pantheon',
    title: 'Pantheon',
    summary: 'Historic Roman temple known for its preserved dome and central oculus.',
    query: 'Pantheon Rome Italy',
    position: { lat: 41.8986, lng: 12.4769 },
  },
  {
    id: 'rome-trevi',
    title: 'Trevi Fountain',
    summary: 'One of Rome\'s busiest landmarks and a natural stop on a central walking route.',
    query: 'Trevi Fountain Rome Italy',
    position: { lat: 41.9009, lng: 12.4833 },
  },
  {
    id: 'rome-st-peters',
    title: "St. Peter's Basilica",
    summary: 'Vatican-side destination that closes the Rome sightseeing circuit.',
    query: "St Peter's Basilica Vatican City",
    position: { lat: 41.9022, lng: 12.4539 },
  },
];


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMap, MapAdvancedMarker, MapInfoWindow, MapPolyline, MapTrafficLayer],
  templateUrl: './map-component.html',
  styleUrls: ['./map-component.scss'],
})
export class MapComponent {
  @ViewChild(GoogleMap) private googleMap?: GoogleMap;
  @ViewChild(MapInfoWindow) private infoWindow?: MapInfoWindow;

  protected readonly mapsApiKeyConfigured = mapsConfig.apiKey.trim().length > 0;
  protected readonly apiReady = signal(false);
  protected readonly loading = signal(false);
  protected readonly loadError = signal('');
  protected readonly showTraffic = signal(false);
  protected readonly currentLocation = signal<google.maps.LatLngLiteral | null>(null);
  protected readonly droppedPin = signal<google.maps.LatLngLiteral | null>(null);
  protected readonly selectedSpot = signal<MarkerSelection | null>(null);
  protected readonly featureSpots = FEATURE_SPOTS;
  protected readonly routeStops = CUSTOM_ROUTE_STOPS;
  protected readonly routePath = CUSTOM_ROUTE_STOPS.map((stop) => stop.position);
  protected readonly romeSightseeingStops = ROME_SIGHTSEEING_STOPS;
  protected readonly romeSightseeingPath = ROME_SIGHTSEEING_STOPS.map((stop) => stop.position);
  protected readonly routeLegs: RouteLeg[] = CUSTOM_ROUTE_STOPS.slice(0, -1).map((stop, index) => ({
    id: `${stop.id}-${CUSTOM_ROUTE_STOPS[index + 1].id}`,
    from: stop,
    to: CUSTOM_ROUTE_STOPS[index + 1],
    title: `${stop.title} -> ${CUSTOM_ROUTE_STOPS[index + 1].title}`,
  }));

  protected readonly mapCenter = signal<google.maps.LatLngLiteral>(mapsConfig.defaultCenter);
  protected readonly zoom = signal(2);
  protected readonly polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#0b6e4f',
    strokeOpacity: 0.95,
    strokeWeight: 5,
    geodesic: true,
  };
  protected readonly romePolylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#c05621',
    strokeOpacity: 0.95,
    strokeWeight: 4,
    geodesic: false,
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

  protected readonly routeSummary = computed(
    () => 'International trip: Vancouver -> London -> Rome -> Paris -> Vancouver'
  );
  protected readonly romeSightseeingSummary = computed(
    () => 'Rome sightseeing walk: Colosseum -> Pantheon -> Trevi Fountain -> St. Peter\'s Basilica'
  );

  constructor() {
    if (this.mapsApiKeyConfigured) {
      void this.loadGoogleMaps();
    }
  }

  protected async loadGoogleMaps(): Promise<void> {
    if (this.apiReady() || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.loadError.set('');

    try {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown loading error.';
      this.loadError.set(`Google Maps failed to load. ${message}`);
    } finally {
      this.loading.set(false);
    }
  }

  protected focusSpot(spot: FeatureSpot): void {
    this.mapCenter.set(spot.position);
    this.zoom.set(5);
    this.selectedSpot.set(spot);
    this.infoWindow?.close();
  }

  protected focusRomeSightseeing(): void {
    const map = this.googleMap?.googleMap;

    if (!map) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    for (const stop of this.romeSightseeingStops) {
      bounds.extend(stop.position);
    }

    map.fitBounds(bounds, 72);
    this.selectedSpot.set({
      title: 'Rome sightseeing route',
      summary: this.romeSightseeingSummary(),
      accent: 'rome-route',
      position: this.romeSightseeingStops[0].position,
    });
    this.infoWindow?.close();
  }

  protected openSpot(spot: FeatureSpot, marker: MapAdvancedMarker): void {
    this.selectedSpot.set(spot);
    this.infoWindow?.open(marker);
  }

  protected openRouteStop(stop: RouteStop, marker: MapAdvancedMarker): void {
    this.selectedSpot.set({
      title: stop.title,
      summary: stop.summary,
      accent: 'route-stop',
      position: stop.position,
    });
    this.infoWindow?.open(marker);
  }

  protected toggleTraffic(): void {
    this.showTraffic.update((value) => !value);
  }

  protected async recenterOnUser(): Promise<void> {
    if (!navigator.geolocation) {
      this.loadError.set('This browser does not expose the Geolocation API.');
      return;
    }

    this.loadError.set('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        this.currentLocation.set(nextCenter);
        this.mapCenter.set(nextCenter);
        this.zoom.set(4);
      },
      (error) => {
        this.loadError.set(`Unable to fetch your current location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  protected onMapInitialized(map: google.maps.Map): void {
    this.focusRoute(undefined, map);
  }

  protected dropPin(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) {
      return;
    }

    const position = event.latLng.toJSON();
    this.droppedPin.set(position);
    this.selectedSpot.set({
      title: 'Dropped Pin',
      summary: `Lat ${position.lat.toFixed(5)}, Lng ${position.lng.toFixed(5)}`,
      accent: 'slate',
      position,
    });
    this.infoWindow?.close();
  }

  protected fitFeaturedMarkers(): void {
    const map = this.googleMap?.googleMap;

    if (!map) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    for (const spot of this.featureSpots) {
      bounds.extend(spot.position);
    }

    const currentLocation = this.currentLocation();
    if (currentLocation) {
      bounds.extend(currentLocation);
    }

    const droppedPin = this.droppedPin();
    if (droppedPin) {
      bounds.extend(droppedPin);
    }

    for (const point of this.routePath) {
      bounds.extend(point);
    }

    map.fitBounds(bounds, 72);
  }

  protected focusRoute(selection?: MarkerSelection, mapInstance?: google.maps.Map): void {
    const map = mapInstance ?? this.googleMap?.googleMap;

    if (!map) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    for (const point of this.routePath) {
      bounds.extend(point);
    }

    map.fitBounds(bounds, 72);
    this.selectedSpot.set(
      selection ?? {
        title: 'International trip route',
        summary: this.routeSummary(),
        accent: 'route',
        position: this.routeStops[0].position,
      }
    );
    this.infoWindow?.close();
  }

  protected sendRouteToGoogleMaps(): void {
    if (this.routeLegs.length === 0) {
      this.loadError.set('At least one trip leg is required to open directions in Google Maps.');
      return;
    }

    this.loadError.set(
      'Google Maps cannot create one continuous driving route across the Atlantic. Use the leg buttons below to open each segment with actual directions.'
    );

    this.sendLegToGoogleMaps(this.routeLegs[0]);
  }

  protected sendLegToGoogleMaps(leg: RouteLeg): void {
    const params = new URLSearchParams({
      api: '1',
      origin: leg.from.query,
      destination: leg.to.query,
    });

    window.open(`https://www.google.com/maps/dir/?${params.toString()}`, '_blank', 'noopener,noreferrer');
  }

  protected sendRomeSightseeingToGoogleMaps(): void {
    if (this.romeSightseeingStops.length < 2) {
      this.loadError.set('Add at least two Rome sightseeing stops before opening Google Maps.');
      return;
    }

    const [origin, ...rest] = this.romeSightseeingStops;
    const destination = rest.at(-1);

    if (!destination) {
      return;
    }

    const waypoints = rest
      .slice(0, -1)
      .map((stop) => stop.query)
      .join('|');

    const params = new URLSearchParams({
      api: '1',
      travelmode: 'walking',
      origin: origin.query,
      destination: destination.query,
    });

    if (waypoints) {
      params.set('waypoints', waypoints);
    }

    this.loadError.set('');
    window.open(`https://www.google.com/maps/dir/?${params.toString()}`, '_blank', 'noopener,noreferrer');
  }

  protected resetView(): void {
    this.focusRoute();
  }
}
