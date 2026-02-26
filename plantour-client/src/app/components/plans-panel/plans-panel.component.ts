import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingDto, LandingService, PlanDto } from '../../services/landing-service';

interface PlanFeature {
  label: string;
  value: string | boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  monthlyPrice: string;
  annualPrice?: string;
  description: string;
  isPopular?: boolean;
  monthlyButtonText: string;
  annualButtonText?: string;
  monthlyPriceUrl?: string;
  annualPriceUrl?: string;
  features: PlanFeature[];
  order: number;
}

@Component({
  selector: 'app-plans-panel-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plans-panel.component.html',
  styleUrl: './plans-panel.component.scss'
})
export class PlansPanelComponent implements OnInit {
  private landingService = inject(LandingService);

  plans: Plan[] = [];

  ngOnInit(): void {
    this.landingService.getLandingData().subscribe((data: LandingDto) => {
      this.setPlans(data);
    });
  }

  private featuresByPlan(plan: PlanDto): PlanFeature[] {
    return [
      { label: 'Max Items', value: `${plan.allowedItems > 0 ? plan.allowedItems + ' per trip' : 'Unlimited'}` },
      { label: 'Max Participants', value: `${plan.allowedTravelers > 0 ? plan.allowedTravelers + ' per trip' : 'Unlimited'}` },
      { label: 'PDF Export', value: true },
      { label: 'AI Suggestions', value: `${plan.allowedAiPrompts > 0 ? plan.allowedAiPrompts : 'Unlimited'} ${plan.extendedAiAllowed ? 'extended' : 'regular'} per day` },
      { label: 'Shared Items', value: true },
    ];
  }

  private setPlans(data: LandingDto): void {
    const plans: Plan[] = [];

    data.plans.forEach(plan => {
      switch (plan.name) {
        case 'Starter':
          plans.push(
            {
              name: 'Starter',
              monthlyPrice: '0',
              description: 'For small trips and light packers',
              monthlyButtonText: 'Join Free',
              monthlyPriceUrl: '/sign-up',
              features: this.featuresByPlan(plan),
              order: 1
            }
          );
          break;
        case 'Family':
          const monthlyPriceObject = plan.prices?.find(p => p.name === 'Family Monthly')!;
          const yearlyPriceObject = plan.prices?.find(p => p.name === 'Family Yearly')!;

          plans.push(
            {
              name: 'Family',
              monthlyPrice: (monthlyPriceObject?.valueCents / 100).toFixed(2),
              annualPrice: (yearlyPriceObject?.valueCents / 100).toFixed(2),
              description: plan.notes || '',
              isPopular: true,
              monthlyButtonText: 'Start monthly',
              annualButtonText: 'Start yearly',
              monthlyPriceUrl: `/checkout/${monthlyPriceObject.paddlePriceId}/${encodeURIComponent('Family Monthly')}`,
              annualPriceUrl: `/checkout/${yearlyPriceObject.paddlePriceId}/${encodeURIComponent('Family Yearly')}`,
              features: this.featuresByPlan(plan),
              order: 2
            }
          );
          break;
        case 'Expedition':
          const monthlyPriceObject1 = plan.prices?.find(p => p.name === 'Expedition Monthly')!;
          const yearlyPriceObject1 = plan.prices?.find(p => p.name === 'Expedition Yearly')!;

          plans.push(
            {
              name: 'Expedition',
              monthlyPrice: (monthlyPriceObject1?.valueCents / 100).toFixed(2),
              annualPrice: (yearlyPriceObject1?.valueCents / 100).toFixed(2),
              description: plan.notes || '',
              monthlyButtonText: 'Go monthly',
              annualButtonText: 'Go yearly',
              monthlyPriceUrl: `/checkout/${monthlyPriceObject1.paddlePriceId}/${encodeURIComponent('Expedition Monthly')}`,
              annualPriceUrl: `/checkout/${yearlyPriceObject1.paddlePriceId}/${encodeURIComponent('Expedition Yearly')}`,
              features: this.featuresByPlan(plan),
              order: 3
            }
          );
          break;
        default:
          throw new Error(`Unknown plan name: ${plan.name}`);
      }
    });

    this.plans = plans.sort((a, b) => a.order - b.order);
  }
}
