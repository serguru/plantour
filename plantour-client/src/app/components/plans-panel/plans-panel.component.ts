import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingDto, LandingService, PlanDto } from '../../services/landing-service';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';

// TODO: it is necessary to add to the log user activity to proof their activity if they decided to get a refund.
// TODO: implement forgot password functionality in the sign in
// TODO: fix the top wording
interface PlanFeature {
  label: string;
  value: string | boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  monthlyPriceName: string;
  yearlyPriceName?: string;
  monthlyPrice: string;
  yearlyPrice?: string;
  description: string;
  monthlyButtonText: string;
  yearlyButtonText?: string;
  monthlyPriceUrl?: string;
  yearlyPriceUrl?: string;
  features: PlanFeature[];
  monthlyAvalable: boolean;
  yearlyAvalable: boolean;
}

@Component({
  selector: 'app-plans-panel',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './plans-panel.component.html',
  styleUrl: './plans-panel.component.scss'
})
export class PlansPanelComponent implements OnInit {

  landingService = inject(LandingService);
  usersService = inject(UsersService);
  messagesService = inject(MessagesService);
  router = inject(Router);
  topWording1 = "";
  topWording2 = "";

  starter!: Plan;
  family!: Plan;
  expedition!: Plan;
  plansLoaded = false;

  isDowngrade(text: string): boolean {
    const result = text.startsWith('Downgrade');
    return result;
  }

  get currentPlanPeriod(): string {
    return this.usersService.planPeriodSignal() ?? '';
  }

  async onPlanButtonClick(event: Event, planPrice: string, isDowngrade: boolean): Promise<void> {
    event.preventDefault();

    const currentName = this.currentPlanPeriod;
    const newName = planPrice;

    let message = "";
    let title = "";
    this.messagesService.focusOkButton = !isDowngrade;

    let endDate: string | null = null;


    if (isDowngrade) {
      endDate = this.usersService.userBillingPeriodEndSignal() || '';
      message = `You are downgrading from ${currentName} to ${newName}. The new plan will be in effect from the next billing cycle ${endDate ? ' before ' + endDate : ''}. Are you sure you want to proceed?`;
      title = `Downgrade to ${newName}`;
    } else {
      message = `You are upgrading from ${currentName} to ${newName}. The new plan will be in effect immediately. Click Yes to proceed.`;
      title = `Upgrade to ${newName}`;
    }

    const result = await this.messagesService.openOkCancel({
      title: title,
      message: message,
      okLabel: 'Yes',
      cancelLabel: 'Cancel'
    });

    if (result !== 'ok') {
      return;
    }

    if (isDowngrade) {
      this.usersService.downgradePlanPrice(currentName, newName).subscribe(() => {
        this.messagesService.showInfo(`Your plan will be downgraded at the end of the current billing cycle${endDate ? ' before ' + endDate : ''}`);

      });
      return;
    }

    this.usersService.upgradePlanPrice(currentName, newName).pipe(
      switchMap(_ => this.usersService.refreshTokens()
      )
    ).subscribe(
        () => {
          this.router.navigate(['profile']);
          this.messagesService.showInfo("Your plan has been upgraded");
        }
      );
  }

  isCurrentPlanPrice(planPrice: string): boolean {
    const cpp = this.currentPlanPeriod;
    const result = cpp === planPrice;
    return result;
  }

  get isAuthenticated(): boolean {
    const result = this.usersService.isAuthenticatedSignal();
    return result;
  }

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
      { label: 'AI Suggestions', value: `${plan.allowedAiPrompts > 0 ? plan.allowedAiPrompts : 'Unlimited'} ${plan.extendedAiAllowed ? '' : ''} per day` },
      { label: 'Shared Items', value: true },
    ];
  }

  private setPlans(data: LandingDto): void {

    const plans: Plan[] = [];

    data.plans.filter(x => !(this.isAuthenticated && x.name === 'Starter')).forEach(plan => {

      switch (plan.name) {
        case 'Starter':
          this.starter =
          {
            name: 'Starter',
            description: 'For small trips and light packers',
            monthlyPrice: '0',
            monthlyPriceName: "Free",
            monthlyButtonText: 'Join Free',
            monthlyPriceUrl: '/sign-up',
            features: this.featuresByPlan(plan),
            monthlyAvalable: true,
            yearlyAvalable: true
          }
          break;
        case 'Family':
          const monthlyPriceObject = plan.prices?.find(p => p.name === 'Family Monthly')!;
          const yearlyPriceObject = plan.prices?.find(p => p.name === 'Family Yearly')!;

          this.family =
          {
            name: 'Family',
            monthlyPrice: (monthlyPriceObject?.valueCents / 100).toFixed(2),
            yearlyPrice: (yearlyPriceObject?.valueCents / 100).toFixed(2),
            monthlyPriceName: monthlyPriceObject.name,
            yearlyPriceName: yearlyPriceObject.name,
            description: plan.notes || '',
            monthlyButtonText: 'Start monthly',
            yearlyButtonText: 'Start yearly',
            monthlyPriceUrl: `/checkout/${monthlyPriceObject.paddlePriceId}/${encodeURIComponent('Family Monthly')}`,
            yearlyPriceUrl: `/checkout/${yearlyPriceObject.paddlePriceId}/${encodeURIComponent('Family Yearly')}`,
            features: this.featuresByPlan(plan),
            monthlyAvalable: true,
            yearlyAvalable: true
          };

          break;
        case 'Expedition':
          const monthlyPriceObject1 = plan.prices?.find(p => p.name === 'Expedition Monthly')!;
          const yearlyPriceObject1 = plan.prices?.find(p => p.name === 'Expedition Yearly')!;

          this.expedition =
          {
            name: 'Expedition',
            monthlyPrice: (monthlyPriceObject1?.valueCents / 100).toFixed(2),
            yearlyPrice: (yearlyPriceObject1?.valueCents / 100).toFixed(2),
            monthlyPriceName: monthlyPriceObject1.name,
            yearlyPriceName: yearlyPriceObject1.name,
            description: plan.notes || '',
            monthlyButtonText: 'Go monthly',
            yearlyButtonText: 'Go yearly',
            monthlyPriceUrl: `/checkout/${monthlyPriceObject1.paddlePriceId}/${encodeURIComponent('Expedition Monthly')}`,
            yearlyPriceUrl: `/checkout/${yearlyPriceObject1.paddlePriceId}/${encodeURIComponent('Expedition Yearly')}`,
            features: this.featuresByPlan(plan),
            monthlyAvalable: true,
            yearlyAvalable: true
          };
          break;
        default:
          throw new Error(`Unknown plan name: ${plan.name}`);
      }
    });

    if (this.isAuthenticated) {

      switch (this.currentPlanPeriod) {
        case 'Family Monthly':
          this.family.monthlyButtonText = 'Current Monthly';
          this.family.monthlyAvalable = false;
          this.family.yearlyButtonText = 'Upgrade to Yearly';
          this.family.yearlyAvalable = true;
          this.expedition.monthlyButtonText = 'Upgrade to Monthly';
          this.expedition.monthlyAvalable = true;
          this.expedition.yearlyButtonText = 'Upgrade to Yearly';
          this.expedition.yearlyAvalable = true;
          break;
        case 'Family Yearly':
          this.family.monthlyButtonText = 'Downgrade to Monthly';
          this.family.monthlyAvalable = true;

          this.family.yearlyButtonText = 'Current Yearly';
          this.family.yearlyAvalable = false;

          this.expedition.monthlyButtonText = 'Downgrade to Monthly';
          this.expedition.monthlyAvalable = true;

          this.expedition.yearlyButtonText = 'Upgrade to Yearly';
          this.expedition.yearlyAvalable = true;

          break;
        case 'Expedition Monthly':
          this.family.monthlyButtonText = 'Downgrade to Monthly';
          this.family.monthlyAvalable = true;
          this.family.yearlyButtonText = 'Upgrade to Yearly';
          this.family.yearlyAvalable = true;
          this.expedition.monthlyButtonText = 'Current Monthly';
          this.expedition.monthlyAvalable = false;
          this.expedition.yearlyButtonText = 'Upgrade to Yearly';
          this.expedition.yearlyAvalable = true;
          break;
        case 'Expedition Yearly':
          this.family.monthlyButtonText = 'Downgrade to Monthly';
          this.family.monthlyAvalable = true;
          this.family.yearlyButtonText = 'Downgrade to Yearly';
          this.family.yearlyAvalable = true;
          this.expedition.monthlyButtonText = 'Downgrade to Monthly';
          this.expedition.monthlyAvalable = true;
          this.expedition.yearlyButtonText = 'Current Yearly';
          this.expedition.yearlyAvalable = false;
          break;
        default:
          throw new Error(`Unknown plan period: ${this.currentPlanPeriod}`);
      }
    }

    this.topWording1 = `Your current plan is '${this.currentPlanPeriod}'.`
    this.topWording2 = `You can change it by clicking one of the buttons below.`;

    this.plansLoaded = true;
  }


}
