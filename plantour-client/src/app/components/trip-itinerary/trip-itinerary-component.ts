import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { ComponentService } from '../../services/component-service';
import { ItineraryPartDto, ItineraryService, ItineraryTodoDto } from '../../services/itinerary-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { MessagesService } from '../../services/messages-service';
import { formatDate } from '../../helpers/utils';

@Component({
  selector: 'app-trip-itinerary',
  standalone: true,
  imports: [CommonModule, EntitiesHeader],
  templateUrl: './trip-itinerary-component.html',
  styleUrl: './trip-itinerary-component.scss',
})
export class TripItineraryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly componentId = 'trip-itinerary';
  readonly componentService = inject(ComponentService);
  readonly itineraryService = inject(ItineraryService);
  readonly localStorageService = inject(LocalStorageService);
  readonly messagesService = inject(MessagesService);

  private tripId: string | null = null;

  readonly parts = signal<ItineraryPartDto[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly expandedState = signal<Record<string, boolean>>({});
  readonly markedTodoIds = signal<Record<string, boolean>>({});
  readonly markedTodoCount = computed(() => {
    return this.parts()
      .flatMap((part) => part.todos)
      .filter((todo) => this.isMarked(todo.id))
      .length;
  });
  readonly collapsibleParts = computed(() => this.parts().filter((part) => this.isCollapsible(part)));
  readonly allExpanded = computed(() => {
    const parts = this.collapsibleParts();
    return parts.length > 0 && parts.every((part) => this.isExpanded(part.id));
  });
  readonly allCollapsed = computed(() => {
    const parts = this.collapsibleParts();
    return parts.length > 0 && parts.every((part) => !this.isExpanded(part.id));
  });

  readonly menuItems = computed<MenuConfig[]>(() => [
    {
      label: 'Expand all',
      icon: 'angle-double-down',
      action: () => this.expandAll(),
      disabled: this.collapsibleParts().length === 0 || this.allExpanded(),
    },
    {
      label: 'Collapse all',
      icon: 'angle-double-up',
      action: () => this.collapseAll(),
      disabled: this.collapsibleParts().length === 0 || this.allCollapsed(),
    },
    {
      label: 'Send to Google maps',
      icon: 'map-marker',
      action: () => this.sendMarkedTodosToGoogleMaps(),
      disabled: this.markedTodoCount() === 0,
    },
  ]);

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);

    this.tripId = this.route.snapshot.paramMap.get('tripId');
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    const selectedId = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    this.selectedId.set(selectedId);
    this.componentService.updateSelectedId(selectedId);

    this.refresh();
  }

  private refresh(): void {
    this.itineraryService.getAll(this.tripId!).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((parts) => {
      const sorted = [...parts].sort((a, b) => {
        const startDateComparison = (a.startDate || '').localeCompare(b.startDate || '');
        return startDateComparison !== 0 ? startDateComparison : a.name.localeCompare(b.name);
      });

      this.parts.set(sorted);

      const partIds = new Set(sorted.map((part) => part.id));
      if (this.selectedId() && !partIds.has(this.selectedId()!)) {
        this.selectPart(null);
      }

      this.expandedState.update((current) => {
        const nextState: Record<string, boolean> = {};
        for (const part of sorted) {
          nextState[part.id] = current[part.id] ?? true;
        }
        return nextState;
      });

      const todoIds = new Set(sorted.flatMap((part) => part.todos.map((todo) => todo.id)));
      this.markedTodoIds.update((current) => {
        const nextState: Record<string, boolean> = {};
        for (const todoId of Object.keys(current)) {
          if (todoIds.has(todoId) && current[todoId]) {
            nextState[todoId] = true;
          }
        }
        return nextState;
      });
    });
  }

  selectPart(partId: string | null): void {
    this.selectedId.set(partId);
    this.componentService.updateSelectedId(partId);
    this.localStorageService.setComponentKey(this.componentId, 'selectedId', partId);
  }

  togglePart(partId: string, event?: Event): void {
    event?.stopPropagation();

    const part = this.parts().find((item) => item.id === partId);
    if (!part || !this.isCollapsible(part)) {
      return;
    }

    this.expandedState.update((current) => ({
      ...current,
      [partId]: !current[partId],
    }));
  }

  isCollapsible(part: ItineraryPartDto): boolean {
    return part.todos.length > 0;
  }

  isExpanded(partId: string): boolean {
    return this.expandedState()[partId] ?? true;
  }

  expandAll(): void {
    this.expandedState.update((current) => ({
      ...current,
      ...Object.fromEntries(this.collapsibleParts().map((part) => [part.id, true])),
    }));
  }

  collapseAll(): void {
    this.expandedState.update((current) => ({
      ...current,
      ...Object.fromEntries(this.collapsibleParts().map((part) => [part.id, false])),
    }));
  }

  isMarked(todoId: string): boolean {
    return !!this.markedTodoIds()[todoId];
  }

  toggleTodoSelection(todoId: string, checked: boolean, event?: Event): void {
    event?.stopPropagation();
    this.markedTodoIds.update((current) => {
      if (!checked) {
        const { [todoId]: removed, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [todoId]: true,
      };
    });
  }

  deletePart(id: string): void {
    if (!this.tripId) {
      return;
    }

    this.itineraryService.delete(id, this.tripId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.messagesService.showInfo('Itinerary part deleted successfully');
      this.refresh();
    });
  }

  getScheduleText(part: ItineraryPartDto): string | null {
    if (!part.startDate && !part.endDate) {
      return null;
    }

    if (part.startDate && part.endDate) {
      return `${formatDate(part.startDate)} - ${formatDate(part.endDate)}`;
    }

    return formatDate(part.startDate || part.endDate || '');
  }

  private sendMarkedTodosToGoogleMaps(): void {
    const locations = this.parts()
      .filter((part) => part.todos.some((todo) => this.isMarked(todo.id)))
      .map((part) => this.getPartLocationValue(part))
      .filter((value): value is string => !!value);

    if (locations.length < 2) {
      this.messagesService.showWarning('Select marked todos across at least two itinerary parts with an address or coordinates');
      return;
    }

    const origin = encodeURIComponent(locations[0]);
    const destination = encodeURIComponent(locations[locations.length - 1]);
    const waypoints = locations.slice(1, -1).map((value) => encodeURIComponent(value)).join('|');

    let url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  private getPartLocationValue(part: ItineraryPartDto): string | null {
    if (part.latitude != null && part.longitude != null) {
      return `${part.latitude},${part.longitude}`;
    }

    if (part.address && part.address.trim().length > 0) {
      return part.address.trim();
    }

    return null;
  }
}