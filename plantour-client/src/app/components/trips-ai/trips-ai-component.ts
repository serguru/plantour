import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs';
import { formatToEnglishLocale, getMessageFromError } from '../../helpers/utils';
import { CurrentTripService } from '../../services/current-trip-service';
import { CurrencyDto, LookupService } from '../../services/lookup-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { MessagesService } from '../../services/messages-service';
import {
  TripAiCreateTripResponseDto,
  TripAiPlanDto,
  TripAiPreviewResponseDto,
  TripsAiService,
} from '../../services/trips-ai-service';
import { UsersService } from '../../services/users-service';
import { AppButton } from '../button/button-component';
import { Dropdown } from '../dropdown/dropdown-component';
import { FormHeader, MenuConfig } from '../form/form-header/form-header';

@Component({
  selector: 'app-trips-ai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    DatePicker,
    DialogModule,
    TextareaModule,
    AppButton,
    Dropdown,
    FormHeader,
  ],
  templateUrl: './trips-ai-component.html',
  styleUrl: './trips-ai-component.scss',
})
export class TripsAiComponent {
  readonly componentId = 'trips-ai';
  private readonly lastCurrencyIdKey = 'lastCurrencyId';
  private readonly router = inject(Router);
  private readonly tripsAiService = inject(TripsAiService);
  private readonly currentTripService = inject(CurrentTripService);
  private readonly lookupService = inject(LookupService);
  private readonly localStorageService = inject(LocalStorageService);
  readonly usersService = inject(UsersService);
  private readonly messagesService = inject(MessagesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly prompt = signal('');
  readonly prompts = signal<string[]>([]);
  readonly currencies = signal<CurrencyDto[]>([]);
  readonly selectedCurrencyId = signal<string | null>(null);
  readonly preview = signal<TripAiPreviewResponseDto | null>(null);
  readonly createResult = signal<TripAiCreateTripResponseDto | null>(null);
  readonly isPreviewLoading = signal(false);
  readonly isCreateLoading = signal(false);
  readonly showDatesDialog = signal(false);
  readonly overrideStartDate = signal<string | null>(null);
  readonly overrideEndDate = signal<string | null>(null);

  readonly selectedCurrency = computed(() => this.currencies().find(x => x.id === this.selectedCurrencyId()) ?? null);
  readonly createdTripId = computed(() => this.createResult()?.tripId ?? null);
  readonly createdTripName = computed(() => this.createResult()?.tripName ?? this.preview()?.plan.title ?? 'Suggested trip');
  readonly canCreateTrip = computed(() => this.usersService.isAdminSignal() && !!this.preview() && !!this.selectedCurrencyId());
  readonly totalSuggestedEntries = computed(() => {
    const plan = this.preview()?.plan;
    if (!plan) {
      return 0;
    }

    return plan.itinerary.length
      + plan.itinerary.reduce((sum, part) => sum + part.publicActivities.length + part.personalActivities.length, 0)
      + plan.personalItems.length
      + plan.sharedItems.length
      + plan.personalTodos.length
      + plan.sharedTodos.length
      + plan.personalExpenses.length
      + plan.sharedExpenses.length;
  });
  readonly overrideDatesInvalid = computed(() => {
    const startDate = this.overrideStartDate();
    const endDate = this.overrideEndDate();
    return !!startDate && !!endDate && endDate < startDate;
  });

  readonly menuItems = computed<MenuConfig[]>(() => {
    const tripId = this.createdTripId();
    if (!tripId) {
      return [];
    }

    return [
      {
        label: 'Open itinerary',
        icon: 'map',
        action: () => {
          void this.router.navigate([`/trips/${tripId}/itinerary`]);
        }
      },
      {
        label: 'Open trip items',
        icon: 'objects-column',
        action: () => {
          void this.router.navigate([`/trips/${tripId}/trip-things`]);
        }
      }
    ];
  });

  constructor() {
    forkJoin({
      prompts: this.tripsAiService.getLatestQuestions(),
      currencies: this.lookupService.getCurrencies(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ prompts, currencies }) => {
        this.prompts.set(prompts.map(x => x.question));
        this.currencies.set(currencies);

        const defaultCurrencyId = this.getDefaultCurrencyId(currencies);
        if (defaultCurrencyId) {
          this.selectedCurrencyId.set(defaultCurrencyId);
        }

        const latestQuestion = prompts[0]?.question ?? null;
        if (latestQuestion) {
          this.prompt.set(latestQuestion);
          this.generatePreview(false);
        }
      });
  }

  onCurrencyChange(currencyId: string | null): void {
    this.selectedCurrencyId.set(currencyId);
    if (currencyId) {
      this.localStorageService.setComponentKey(this.componentId, this.lastCurrencyIdKey, currencyId);
    }
  }

  onPromptChanged(value: string | null): void {
    this.prompt.set(value ?? '');
  }

  onPromptSelected(value: string): void {
    this.prompt.set(value);
    this.generatePreview(false);
  }

  generatePreview(showToast = true): void {
    const question = this.prompt().trim();
    if (!question) {
      this.messagesService.showWarning('Please describe the trip you want the AI to build');
      return;
    }

    this.isPreviewLoading.set(true);
    this.tripsAiService.getPreview({ question }).pipe(
      finalize(() => this.isPreviewLoading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: preview => {
        this.preview.set(preview);
        this.createResult.set(null);
        this.addPromptToLookup(preview.question);
        if (showToast) {
          const source = preview.fromCache ? 'Loaded cached trip suggestion' : 'Generated a new trip suggestion';
          const detail = preview.datesAdjusted ? 'Dates were shifted to avoid overlap with your existing trips.' : undefined;
          this.messagesService.showInfo(source, detail);
        }
      },
      error: error => {
        const errorMessage = getMessageFromError(error, 'AI trip planning failed');
        this.messagesService.showError(errorMessage);
      }
    });
  }

  createTrip(useOverrides = false): void {
    const preview = this.preview();
    const currencyId = this.selectedCurrencyId();
    if (!preview) {
      this.messagesService.showWarning('Generate a trip preview first');
      return;
    }

    if (!currencyId) {
      this.messagesService.showWarning('Please select a currency for the new trip');
      return;
    }

    if (!this.usersService.isAdminSignal()) {
      this.messagesService.showWarning('Only admins can create trips');
      return;
    }

    if (useOverrides && (!this.overrideStartDate() || !this.overrideEndDate() || this.overrideDatesInvalid())) {
      this.messagesService.showWarning('Please provide valid non-overlapping dates');
      return;
    }

    this.isCreateLoading.set(true);
    this.tripsAiService.createTrip({
      question: preview.question,
      currencyId,
      startDate: useOverrides ? this.overrideStartDate() : null,
      endDate: useOverrides ? this.overrideEndDate() : null,
    }).pipe(
      finalize(() => this.isCreateLoading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: result => {
        this.createResult.set(result);
        this.showDatesDialog.set(false);
        this.currentTripService.updateCurrentTripId(result.tripId);
        this.currentTripService.refreshCurrentTrip();
        this.messagesService.showInfo(`Trip ${result.tripName} created in Planning mode`);
      },
      error: error => {
        if (error?.error?.code === 'TRIP_DATES_OVERLAP') {
          this.openDatesDialog();
          return;
        }

        const errorMessage = getMessageFromError(error, 'Failed to create trip from AI plan');
        this.messagesService.showError(errorMessage);
      }
    });
  }

  reset(): void {
    this.prompt.set('');
    this.preview.set(null);
    this.createResult.set(null);
    this.showDatesDialog.set(false);
    this.overrideStartDate.set(null);
    this.overrideEndDate.set(null);
  }

  setExamplePrompt(): void {
    this.prompt.set('The 4 persons family with 2 children 8 and 12 years old want to have a trip to Japan for sightseeing for 7 days this summer, we live in Vancouver BC.');
  }

  openDatesDialog(): void {
    const preview = this.preview();
    this.overrideStartDate.set(preview?.plan.suggestedStartDate || null);
    this.overrideEndDate.set(preview?.plan.suggestedEndDate || null);
    this.showDatesDialog.set(true);
  }

  closeDatesDialog(): void {
    this.showDatesDialog.set(false);
  }

  formatDateTime(value: string): string {
    if (!value) {
      return '';
    }

    return formatToEnglishLocale(value);
  }

  private addPromptToLookup(prompt: string): void {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) {
      return;
    }

    const existing = [...this.prompts()];
    const index = existing.findIndex(item => item.toLowerCase() === normalizedPrompt.toLowerCase());
    if (index === 0) {
      return;
    }
    if (index > 0) {
      existing.splice(index, 1);
    }

    existing.unshift(normalizedPrompt);
    this.prompts.set(existing);
  }

  private getDefaultCurrencyId(currencies: CurrencyDto[]): string | null {
    const savedCurrencyId = this.localStorageService.getComponentKey(this.componentId, this.lastCurrencyIdKey);
    const savedCurrency = savedCurrencyId
      ? currencies.find(currency => currency.id === savedCurrencyId)
      : null;

    return savedCurrency?.id ?? currencies[0]?.id ?? null;
  }
}