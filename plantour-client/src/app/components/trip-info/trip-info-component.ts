import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripDto, TripService } from '../../services/trip-service';
import { MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { FormHeader } from '../form/form-header/form-header';
import { CurrentTripService } from '../../services/current-trip-service';
import {
  DashboardAllUsersTripDto,
  DashboardService,
  DashboardTripDto,
  DashboardUserTripDto,
} from '../../services/dashboard-service';
import { RouterLink } from '@angular/router';
import { ItineraryPartDto, ItineraryService } from '../../services/itinerary-service';
import { TripActivityDto, TripActivityService } from '../../services/trip-activity-service';
import { TripExpenseDto, TripExpenseService } from '../../services/trip-expense-service';
import { TripSharedExpenseDto, TripSharedExpenseService } from '../../services/trip-shared-expense-service';
import { TripNoteDto, TripNoteService } from '../../services/trip-note-service';
import { TripUserDto, TripUserService } from '../../services/trip-user-service';

interface TripInfoStat {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'accent' | 'warn';
}

interface TripInfoLink {
  label: string;
  route: string;
  disabled?: boolean;
}

interface TripInfoTimelineItem {
  id: string;
  name: string;
  schedule: string;
  address?: string | null;
  publicActivities: number;
  personalActivities: number;
  noteCount: number;
}

interface TripInfoNotePreview {
  id: string;
  title: string;
  meta: string;
}

interface TripInfoViewModel {
  tripId: string;
  name: string;
  status: string;
  dateRange: string;
  daysText: string;
  tripBrief: string | null;
  currencyText: string;
  currentUserIncluded: boolean;
  inclusionText: string;
  heroStats: TripInfoStat[];
  planningStats: TripInfoStat[];
  moneyStats: TripInfoStat[];
  personalStats: TripInfoStat[];
  groupStats: TripInfoStat[];
  overviewLinks: TripInfoLink[];
  planningLinks: TripInfoLink[];
  moneyLinks: TripInfoLink[];
  personalLinks: TripInfoLink[];
  groupLinks: TripInfoLink[];
  itineraryPreview: TripInfoTimelineItem[];
  recentNotes: TripInfoNotePreview[];
}

interface LoadedTripInfo {
  trip: TripDto | null;
  dashboardTrip: DashboardTripDto | null;
  userSummary: DashboardUserTripDto | null;
  allUsersSummary: DashboardAllUsersTripDto | null;
  itineraryParts: ItineraryPartDto[];
  publicActivities: TripActivityDto[];
  personalActivities: TripActivityDto[];
  personalExpenses: TripExpenseDto[];
  sharedExpenses: TripSharedExpenseDto[];
  notes: TripNoteDto[];
  participants: TripUserDto[];
}

@Component({
  selector: 'app-trip-info',
  standalone: true,
  imports: [
    CommonModule,
    FormHeader,
    RouterLink
  ],
  templateUrl: './trip-info-component.html',
  styleUrls: ['./trip-info-component.scss']
})
export class TripInfoComponent {
  componentId = 'trip-info';

  menuItems = computed<MenuConfig[]>(() => []);

  tripService = inject(TripService);
  currentTripService = inject(CurrentTripService);
  dashboardService = inject(DashboardService);
  itineraryService = inject(ItineraryService);
  tripActivityService = inject(TripActivityService);
  tripExpenseService = inject(TripExpenseService);
  tripSharedExpenseService = inject(TripSharedExpenseService);
  tripNoteService = inject(TripNoteService);
  tripUserService = inject(TripUserService);

  loading = signal(false);

  currentTripId$ = this.currentTripService.currentTripId$.pipe(distinctUntilChanged());
  currentTripId = toSignal(this.currentTripId$, { initialValue: this.currentTripService.currentTripIdSignal() ?? null });

  tripInfoVm = toSignal(
    this.currentTripId$.pipe(
      switchMap((tripId) => {
        this.loading.set(true);

        if (!tripId) {
          this.loading.set(false);
          return of(null);
        }

        return combineLatest({
          trip: this.tripService.getById(tripId).pipe(catchError(() => of(null))),
          dashboardTrip: this.dashboardService.getDashboardTripDto(tripId).pipe(catchError(() => of(null))),
          userSummary: this.dashboardService.getDashboardUserTripDto(tripId).pipe(catchError(() => of(null))),
          allUsersSummary: this.dashboardService.getDashboardAllUsersTripDto(tripId).pipe(catchError(() => of(null))),
          itineraryParts: this.tripToEmptyArray(this.itineraryService.getAll(tripId)),
          publicActivities: this.tripToEmptyArray(this.tripActivityService.getAllPublic(tripId)),
          personalActivities: this.tripToEmptyArray(this.tripActivityService.getAllPersonal(tripId)),
          personalExpenses: this.tripToEmptyArray(this.tripExpenseService.getAll(tripId)),
          sharedExpenses: this.tripToEmptyArray(this.tripSharedExpenseService.getAll(tripId)),
          notes: this.tripToEmptyArray(this.tripNoteService.getAll(tripId)),
          participants: this.tripToEmptyArray(this.tripUserService.getAll(tripId)),
        }).pipe(
          map((data) => this.buildViewModel(tripId, data)),
          finalize(() => this.loading.set(false))
        );
      })
    ),
    { initialValue: null }
  );

  private tripToEmptyArray<T>(source: import('rxjs').Observable<T[]>): import('rxjs').Observable<T[]> {
    return source.pipe(catchError(() => of([])));
  }

  private buildViewModel(tripId: string, data: LoadedTripInfo): TripInfoViewModel {
    const trip = data.trip;
    const dashboardTrip = data.dashboardTrip;
    const userSummary = data.userSummary;
    const allUsersSummary = data.allUsersSummary;

    const itineraryParts = [...data.itineraryParts].sort((a, b) => this.compareNullableStrings(a.startDate, b.startDate) || a.name.localeCompare(b.name));
    const publicActivities = [...data.publicActivities].sort((a, b) => this.compareNullableStrings(a.startDate, b.startDate) || a.name.localeCompare(b.name));
    const personalActivities = [...data.personalActivities].sort((a, b) => this.compareNullableStrings(a.startDate, b.startDate) || a.name.localeCompare(b.name));
    const notes = [...data.notes].sort((a, b) => this.compareNullableStrings(b.createdAt, a.createdAt) || a.title.localeCompare(b.title));

    const publicActivitiesByPart = this.countByItineraryPart(publicActivities);
    const personalActivitiesByPart = this.countByItineraryPart(personalActivities);

    const notesByActivityId = new Map<string, number>();
    for (const note of notes) {
      if (!note.tripActivityId) {
        continue;
      }
      notesByActivityId.set(note.tripActivityId, (notesByActivityId.get(note.tripActivityId) || 0) + 1);
    }

    const noteCountByPart = new Map<string, number>();
    for (const activity of [...publicActivities, ...personalActivities]) {
      if (!activity.itineraryPartId) {
        continue;
      }
      noteCountByPart.set(
        activity.itineraryPartId,
        (noteCountByPart.get(activity.itineraryPartId) || 0) + (notesByActivityId.get(activity.id) || 0)
      );
    }

    const participantCount = data.participants.length || trip?.totalParticipants || allUsersSummary?.participants || 0;
    const totalActivityCount = publicActivities.length + personalActivities.length;
    const totalExpenseCount = data.personalExpenses.length + data.sharedExpenses.length;
    const linkedActivities = [...publicActivities, ...personalActivities].filter((activity) => !!activity.itineraryPartId).length;
    const linkedNotes = notes.filter((note) => !!note.tripActivityId).length;
    const mapPoints = this.countMapPoints(itineraryParts) + this.countMapPoints(publicActivities) + this.countMapPoints(personalActivities);

    const tripCurrency = trip?.currency || 'trip currency';
    const personalExpenseTotal = data.personalExpenses.reduce((sum, expense) => sum + (expense.amountInTripCurrency || 0), 0);
    const sharedExpenseTotal = data.sharedExpenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0);
    const totalSharedAssigned = data.participants.reduce((sum, participant) => sum + (participant.sharedAmount || 0), 0);
    const totalSharedPaid = data.participants.reduce((sum, participant) => sum + (participant.sharedPaidAmount || 0), 0);
    const totalSharedRemaining = data.participants.reduce((sum, participant) => sum + (participant.sharedRemainingAmount || 0), 0);
    const sharedAssignmentsPending = data.participants.filter((participant) => participant.sharedAmount > 0 && !participant.accept).length;
    const sharedAssignmentsRejected = data.participants.filter((participant) => participant.accept === 'rejected').length;

    const currentUserIncluded = trip?.currentUserIncluded ?? dashboardTrip?.currentUserIncluded ?? false;
    const routes = {
      trip: `/trips/trip/${tripId}`,
      participants: `/trips/${tripId}/trip-participants`,
      itinerary: `/trips/${tripId}/itinerary`,
      map: `/trips/${tripId}/itinerary/map`,
      personalActivities: `/trips/${tripId}/trip-activities/personal`,
      publicActivities: `/trips/${tripId}/trip-activities/public`,
      personalExpenses: `/trips/${tripId}/trip-expenses`,
      sharedExpenses: `/trips/${tripId}/trip-shared-expenses`,
      notes: `/trips/${tripId}/trip-notes`,
      packs: `/trips/${tripId}/trip-packs`,
      items: `/trips/${tripId}/trip-things`,
      todos: `/trips/${tripId}/trip-todos`,
      sharedItems: `/trips/${tripId}/trip-shared`,
      sharedTodos: `/trips/${tripId}/trip-shared-todos`,
    };

    return {
      tripId,
      name: trip?.name || dashboardTrip?.name || 'Trip',
      status: dashboardTrip?.tripStatus || trip?.tripStatus || 'No status',
      dateRange: dashboardTrip?.fromTo || this.formatTripDateRange(trip?.startDate, trip?.endDate),
      daysText: dashboardTrip?.daysLeftText || 'Review the latest trip plan and progress below.',
      tripBrief: this.trimText(trip?.notes || dashboardTrip?.notes || null, 220),
      currencyText: trip?.currency || 'No currency',
      currentUserIncluded,
      inclusionText: currentUserIncluded
        ? 'You are included in this trip, so personal trip pages are available.'
        : 'You are not included in this trip, so personal trip pages may be unavailable.',
      heroStats: [
        {
          label: 'Participants',
          value: this.formatInteger(participantCount),
          hint: 'People currently connected to this trip.',
        },
        {
          label: 'Itinerary parts',
          value: this.formatInteger(itineraryParts.length),
          hint: 'Stops and scheduled trip stages.',
          tone: 'accent',
        },
        {
          label: 'Activities',
          value: this.formatInteger(totalActivityCount),
          hint: `${publicActivities.length} shared and ${personalActivities.length} personal.`,
        },
        {
          label: 'Notes',
          value: this.formatInteger(notes.length),
          hint: `${linkedNotes} notes are linked to activities.`,
        },
      ],
      planningStats: [
        {
          label: 'Itinerary parts',
          value: this.formatInteger(itineraryParts.length),
          hint: 'Sorted by start date in the itinerary page.',
        },
        {
          label: 'Public activities',
          value: this.formatInteger(publicActivities.length),
          hint: 'Visible to the whole trip.',
        },
        {
          label: 'Personal activities',
          value: this.formatInteger(personalActivities.length),
          hint: currentUserIncluded ? 'Your private activity plan.' : 'Available when you are part of the trip.',
        },
        {
          label: 'Linked activities',
          value: this.formatInteger(linkedActivities),
          hint: 'Activities already attached to itinerary parts.',
          tone: 'accent',
        },
        {
          label: 'Map points',
          value: this.formatInteger(mapPoints),
          hint: 'Itinerary parts and activities with coordinates or an address.',
        },
        {
          label: 'Activity notes',
          value: this.formatInteger(linkedNotes),
          hint: 'Notes connected to one activity.',
        },
      ],
      moneyStats: [
        {
          label: 'Personal expenses',
          value: this.formatInteger(data.personalExpenses.length),
          hint: `${this.formatAmount(personalExpenseTotal, tripCurrency)} total in ${tripCurrency}.`,
        },
        {
          label: 'Shared expenses',
          value: this.formatInteger(data.sharedExpenses.length),
          hint: `${this.formatAmount(sharedExpenseTotal, tripCurrency)} total in ${tripCurrency}.`,
          tone: 'accent',
        },
        {
          label: 'Shared assigned',
          value: this.formatAmount(totalSharedAssigned, tripCurrency),
          hint: 'Total shared amount assigned across participants.',
        },
        {
          label: 'Shared paid',
          value: this.formatAmount(totalSharedPaid, tripCurrency),
          hint: 'Payments recorded through personal expenses marked as shared.',
        },
        {
          label: 'Shared remaining',
          value: this.formatAmount(totalSharedRemaining, tripCurrency),
          hint: 'Assigned amount that still needs to be paid.',
          tone: totalSharedRemaining > 0 ? 'warn' : 'default',
        },
        {
          label: 'All expenses',
          value: this.formatInteger(totalExpenseCount),
          hint: 'Personal and shared spending together.',
        },
        {
          label: 'Awaiting response',
          value: this.formatInteger(sharedAssignmentsPending),
          hint: 'Participants with a shared assignment still pending acceptance.',
          tone: sharedAssignmentsPending > 0 ? 'warn' : 'default',
        },
        {
          label: 'Rejected assignments',
          value: this.formatInteger(sharedAssignmentsRejected),
          hint: 'Participants who have rejected their current shared assignment.',
          tone: sharedAssignmentsRejected > 0 ? 'warn' : 'default',
        },
      ],
      personalStats: [
        {
          label: 'Bags',
          value: this.formatInteger(userSummary?.packs || 0),
          hint: 'Trip bags connected to your profile.',
        },
        {
          label: 'Items',
          value: this.formatInteger(userSummary?.items || 0),
          hint: 'Your personal trip items.',
        },
        {
          label: 'Todos',
          value: this.formatInteger(userSummary?.todos || 0),
          hint: 'Your personal trip todo items.',
        },
        {
          label: 'Activities',
          value: this.formatInteger(personalActivities.length),
          hint: 'Private activities for this trip.',
          tone: 'accent',
        },
        {
          label: 'Notes',
          value: this.formatInteger(notes.length),
          hint: 'Rich-text trip notes with optional activity links.',
        },
        {
          label: 'Weight',
          value: userSummary?.weightStr || '0',
          hint: 'Current packed and no-pack weight summary.',
        },
      ],
      groupStats: [
        {
          label: 'Participants',
          value: this.formatInteger(allUsersSummary?.participants || participantCount),
          hint: 'Everyone participating in the selected trip.',
        },
        {
          label: 'Packing progress',
          value: `${allUsersSummary?.packingProgress || 0}%`,
          hint: 'Overall trip packing progress.',
          tone: 'accent',
        },
        {
          label: 'Shared items pending',
          value: this.formatInteger(allUsersSummary?.sharedPending || 0),
          hint: 'Shared items not finished yet.',
          tone: (allUsersSummary?.sharedPending || 0) > 0 ? 'warn' : 'default',
        },
        {
          label: 'Shared todos pending',
          value: this.formatInteger(allUsersSummary?.sharedTodosPending || 0),
          hint: 'Shared todos still waiting for completion.',
          tone: (allUsersSummary?.sharedTodosPending || 0) > 0 ? 'warn' : 'default',
        },
        {
          label: 'Shared activities',
          value: this.formatInteger(publicActivities.length),
          hint: 'Activities visible to the whole trip.',
        },
        {
          label: 'Shared expenses',
          value: this.formatInteger(data.sharedExpenses.length),
          hint: 'Shared spending tracked for the group.',
        },
      ],
      overviewLinks: [
        { label: 'Open trip', route: routes.trip },
        { label: 'Participants', route: routes.participants },
        { label: 'Itinerary', route: routes.itinerary },
        { label: 'Map', route: routes.map },
      ],
      planningLinks: [
        { label: 'Itinerary', route: routes.itinerary },
        { label: 'Personal activities', route: routes.personalActivities, disabled: !currentUserIncluded },
        { label: 'Shared activities', route: routes.publicActivities },
      ],
      moneyLinks: [
        { label: 'Personal expenses', route: routes.personalExpenses, disabled: !currentUserIncluded },
        { label: 'Shared expenses', route: routes.sharedExpenses },
        { label: 'Notes', route: routes.notes, disabled: !currentUserIncluded },
      ],
      personalLinks: [
        { label: 'Bags', route: routes.packs, disabled: !currentUserIncluded },
        { label: 'Items', route: routes.items, disabled: !currentUserIncluded },
        { label: 'Todos', route: routes.todos, disabled: !currentUserIncluded },
      ],
      groupLinks: [
        { label: 'Shared items', route: routes.sharedItems },
        { label: 'Shared todos', route: routes.sharedTodos },
        { label: 'Shared expenses', route: routes.sharedExpenses },
      ],
      itineraryPreview: itineraryParts.slice(0, 5).map((part) => ({
        id: part.id,
        name: part.name,
        schedule: this.formatTripDateRange(part.startDate, part.endDate),
        address: part.address || null,
        publicActivities: publicActivitiesByPart.get(part.id) || 0,
        personalActivities: personalActivitiesByPart.get(part.id) || 0,
        noteCount: noteCountByPart.get(part.id) || 0,
      })),
      recentNotes: notes.slice(0, 4).map((note) => ({
        id: note.id,
        title: note.title,
        meta: this.buildNoteMeta(note),
      })),
    };
  }

  private countByItineraryPart(activities: TripActivityDto[]): Map<string, number> {
    const result = new Map<string, number>();

    for (const activity of activities) {
      if (!activity.itineraryPartId) {
        continue;
      }

      result.set(activity.itineraryPartId, (result.get(activity.itineraryPartId) || 0) + 1);
    }

    return result;
  }

  private countMapPoints(items: Array<{ address?: string | null; latitude?: number | null; longitude?: number | null }>): number {
    return items.filter((item) => !!item.address || (item.latitude != null && item.longitude != null)).length;
  }

  private buildNoteMeta(note: TripNoteDto): string {
    const parts: string[] = [];
    const createdAt = this.formatDate(note.createdAt);
    if (createdAt) {
      parts.push(createdAt);
    }
    if (note.tripActivityName) {
      parts.push(`Activity: ${note.tripActivityName}`);
    }
    return parts.join(' · ') || 'No linked activity';
  }

  private formatTripDateRange(startDate?: string | null, endDate?: string | null): string {
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end || 'No trip dates';
  }

  private formatDate(value?: string | null): string {
    if (!value) {
      return '';
    }

    const normalized = value.includes('T') ? value : `${value}T00:00:00`;
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatInteger(value: number): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  }

  private formatAmount(value: number, currency: string): string {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);

    return `${formatted} ${currency}`;
  }

  private trimText(value?: string | null, maxLength = 180): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trim()}…`;
  }

  private compareNullableStrings(left?: string | null, right?: string | null): number {
    return (left || '').localeCompare(right || '');
  }
}