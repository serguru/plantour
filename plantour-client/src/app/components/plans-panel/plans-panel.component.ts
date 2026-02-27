import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingDto, LandingService, PlanDto } from '../../services/landing-service';
import { UsersService } from '../../services/users-service';
import { map } from 'rxjs';

interface PlanFeature {
  label: string;
  value: string | boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  monthlyPriceName: string;
  annualPriceName?: string;
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
  selector: 'app-plans-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plans-panel.component.html',
  styleUrl: './plans-panel.component.scss'
})
export class PlansPanelComponent implements OnInit {

  landingService = inject(LandingService);
  usersService = inject(UsersService);

  get currentPlanPeriod(): string {
    return this.usersService.planPeriodSignal() ?? '';
  }

  isCurrentPlanPrice(planPrice: string): boolean {
    const cpp = this.currentPlanPeriod;
    const result = cpp === planPrice;
    return result;
  }


  get isAuthenticated(): boolean {
    return this.usersService.isAuthenticatedSignal();
  }

  changeText = "";



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

    const rate: any[] = [];

    data.plans.filter(x => !(this.isAuthenticated && x.name === 'Starter')).forEach(plan => {

      switch (plan.name) {
        case 'Starter':
          plans.push(
            {
              name: 'Starter',
              monthlyPrice: '0',
              monthlyPriceName: "Free",
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

          rate.push({ name: 'Family Monthly', value: monthlyPriceObject.valueCents });
          rate.push({ name: 'Family Yearly', value: yearlyPriceObject.valueCents });

          plans.push(
            {
              name: 'Family',
              monthlyPrice: (monthlyPriceObject?.valueCents / 100).toFixed(2),
              annualPrice: (yearlyPriceObject?.valueCents / 100).toFixed(2),
              monthlyPriceName: monthlyPriceObject.name,
              annualPriceName: yearlyPriceObject.name,
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

          rate.push({ name: 'Expedition Monthly', value: monthlyPriceObject1.valueCents });
          rate.push({ name: 'Expedition Yearly', value: yearlyPriceObject1.valueCents });


          plans.push(
            {
              name: 'Expedition',
              monthlyPrice: (monthlyPriceObject1?.valueCents / 100).toFixed(2),
              annualPrice: (yearlyPriceObject1?.valueCents / 100).toFixed(2),
              monthlyPriceName: monthlyPriceObject1.name,
              annualPriceName: yearlyPriceObject1.name,
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

    rate.sort((a, b) => a.value - b.value);
    const currentIndex = rate.findIndex(r => r.name === this.currentPlanPeriod);

    this.changeText = "";

    if (rate.length) {
      if (currentIndex === 0 || currentIndex === -1) {
        this.changeText = "upgrade";
      } else if (currentIndex === rate.length - 1) {
        this.changeText = "downgrade";
      } else {
        this.changeText = "upgrdade or downgrade";
      }
    }
    this.plans = plans.sort((a, b) => a.order - b.order);
  }
}
