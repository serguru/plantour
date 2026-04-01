import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { LandingDto, LandingService, PlanDto } from '../../../../services/landing-service';

interface PlanLimitRow {
  label: string;
  values: string[];
}

@Component({
  selector: 'app-help-workflows-plan-offers-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-workflows-plan-offers-answer.component.html',
  styleUrl: '../../help-component.scss'
})
export class HelpWorkflowsPlanOffersAnswerComponent implements OnInit {
  private readonly landingService = inject(LandingService);

  plans: PlanDto[] = [];
  limitRows: PlanLimitRow[] = [];
  loaded = false;

  ngOnInit(): void {
    this.landingService.getLandingData().subscribe((data: LandingDto) => {
      this.plans = this.sortPlans(data.plans);
      this.limitRows = this.buildLimitRows(this.plans);
      this.loaded = true;
    });
  }

  priceSummary(plan: PlanDto): string {
    if (plan.name === 'Starter') {
      return 'Free forever';
    }

    const sortedPrices = [...(plan.prices ?? [])].sort((left, right) => left.valueCents - right.valueCents);
    if (sortedPrices.length === 0) {
      return 'Pricing available at checkout';
    }

    return sortedPrices
      .map((price) => `${price.name}: US$${(price.valueCents / 100).toFixed(2)}`)
      .join(' | ');
  }

  private sortPlans(plans: PlanDto[]): PlanDto[] {
    const order = new Map<string, number>([
      ['Starter', 1],
      ['Family', 2],
      ['Expedition', 3]
    ]);

    return [...plans].sort((left, right) => {
      const leftRank = order.get(left.name) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = order.get(right.name) ?? Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    });
  }

  private buildLimitRows(plans: PlanDto[]): PlanLimitRow[] {
    return [
      { label: 'Items per trip', values: plans.map((plan) => this.formatLimit(plan.allowedItems)) },
      { label: 'Participants per trip', values: plans.map((plan) => this.formatLimit(plan.allowedTravelers)) },
      { label: 'Todos per trip', values: plans.map((plan) => this.formatLimit(plan.allowedTodos)) },
      { label: 'Expenses per trip', values: plans.map((plan) => this.formatLimit(plan.allowedExpenses)) },
      { label: 'Itinerary parts per trip', values: plans.map((plan) => this.formatLimit(plan.allowedItineraryParts)) },
      { label: 'Activities per trip', values: plans.map((plan) => this.formatLimit(plan.allowedActivities)) },
      { label: 'AI suggestions per day', values: plans.map((plan) => this.formatLimit(plan.allowedAiPrompts)) }
    ];
  }

  private formatLimit(limit: number | null): string {
    return limit && limit > 0 ? `${limit}` : 'Unlimited';
  }
}
