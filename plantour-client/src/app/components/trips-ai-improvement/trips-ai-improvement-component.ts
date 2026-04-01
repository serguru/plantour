import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { getMessageFromError } from '../../helpers/utils';
import { CurrentTripService } from '../../services/current-trip-service';
import { MessagesService } from '../../services/messages-service';
import { TripImprovementService } from '../../services/trip-improvement-service';
import {
  GenerateTripAiImprovementsResponseDto,
  TripsAiService,
} from '../../services/trips-ai-service';
import { UsersService } from '../../services/users-service';
import { AppButton } from '../button/button-component';
import { FormHeader, MenuConfig } from '../form/form-header/form-header';

@Component({
  selector: 'app-trips-ai-improvement',
  standalone: true,
  imports: [
    CommonModule,
    AppButton,
    FormHeader,
  ],
  templateUrl: './trips-ai-improvement-component.html',
  styleUrl: './trips-ai-improvement-component.scss',
})
export class TripsAIImprovementComponent {
  readonly componentId = 'trips-ai-improvement';
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentTripService = inject(CurrentTripService);
  private readonly tripImprovementService = inject(TripImprovementService);
  private readonly tripsAiService = inject(TripsAiService);
  private readonly messagesService = inject(MessagesService);
  readonly usersService = inject(UsersService);

  readonly tripId = this.route.snapshot.paramMap.get('tripId');
  readonly currentTrip = this.currentTripService.currentTripDtoSignal;
  readonly isGenerating = signal(false);
  readonly existingImprovementsCount = signal(0);
  readonly result = signal<GenerateTripAiImprovementsResponseDto | null>(null);

  readonly scopeSummary = computed(() => {
    const generated = this.result();
    if (generated?.scopeSummary) {
      return generated.scopeSummary;
    }

    return this.usersService.isAdminSignal()
      ? 'AI will analyze your personal and shared trip data for this trip.'
      : 'AI will analyze only your personal trip data for this trip.';
  });

  readonly tripTitle = computed(() => {
    const trip = this.currentTrip();
    return trip && trip.id === this.tripId ? trip.name : 'Current trip';
  });

  readonly menuItems = computed<MenuConfig[]>(() => {
    if (!this.tripId) {
      return [];
    }

    return [
      {
        label: 'Open improvements',
        icon: 'thumbs-up',
        action: () => {
          void this.router.navigate([`/trips/${this.tripId}/trips-improvement`]);
        }
      }
    ];
  });

  constructor() {
    if (!this.tripId) {
      throw new Error('Trip Id is null');
    }

    this.loadExistingImprovementsCount();
  }

  async generate(): Promise<void> {
    if (!this.tripId) {
      return;
    }

    const existingCount = this.existingImprovementsCount();
    if (existingCount > 0) {
      const result = await this.messagesService.openOkCancel({
        title: 'Replace improvements',
        message: `This trip already has ${existingCount} saved improvements for you. Delete them and replace them with a new AI result?`,
        okLabel: 'Replace',
        cancelLabel: 'Cancel'
      });

      if (result !== 'ok') {
        return;
      }
    }

    this.isGenerating.set(true);
    this.tripsAiService.generateTripImprovements({
      tripId: this.tripId,
      replaceExisting: existingCount > 0,
    }).pipe(
      finalize(() => this.isGenerating.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: response => {
        this.result.set(response);
        this.existingImprovementsCount.set(response.improvements.length);

        const deletedText = response.deletedExistingCount > 0
          ? ` Replaced ${response.deletedExistingCount} older improvements.`
          : '';
        this.messagesService.showInfo(`Generated ${response.improvements.length} trip improvements.${deletedText}`);
        void this.router.navigate([`/trips/${this.tripId}/trips-improvement`]);
      },
      error: error => {
        this.messagesService.showError(getMessageFromError(error, 'AI trip improvements failed'));
      }
    });
  }

  openImprovements(): void {
    if (!this.tripId) {
      return;
    }

    void this.router.navigate([`/trips/${this.tripId}/trips-improvement`]);
  }

  private loadExistingImprovementsCount(): void {
    if (!this.tripId) {
      return;
    }

    this.tripImprovementService.getAll(this.tripId).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: improvements => {
        this.existingImprovementsCount.set(improvements.length);
      },
      error: error => {
        this.messagesService.showError(getMessageFromError(error, 'Trip improvements could not be loaded'));
      }
    });
  }
}