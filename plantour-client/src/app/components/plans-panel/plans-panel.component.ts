import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingDto, LandingService, PlanDto } from '../../services/landing-service';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { Router } from '@angular/router';


// TODO: it is necessary to add to the log user activity to proof their activity if they decided to get a refund.
// TODO: implement forgot password functionality in the sign in
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
  topWording = "";

  changeText = "";
  rate: any[] = [];

  starter!: Plan;
  family!: Plan;
  expedition!: Plan;

  get currentPlanPeriod(): string {
    return this.usersService.planPeriodSignal() ?? '';
  }

  async onPlanButtonClick(event: Event, planPrice: string): Promise<void> {
    event.preventDefault();

    const currentName = this.currentPlanPeriod;
    const currentIndex = this.rate.findIndex(r => r.name === currentName);

    const newName = planPrice;
    const newIndex = this.rate.findIndex(r => r.name === newName);

    const isDowngrade = newIndex < currentIndex;

    let message = "";
    let title = "";
    this.messagesService.focusOkButton = !isDowngrade;

    if (isDowngrade) {
      message = `You are downgrading from ${currentName} to ${newName}. The new plan will be in effect from the next billing cycle. Are you sure you want to proceed?`;
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

    this.usersService.changePlanPrice(currentName, newName).subscribe({
      next: _ => {
        this.messagesService.showInfo("Your plan has been updated. Please sign in.");
        this.usersService.signOut();
        this.router.navigate(["sign-in"]);
      }
    });

    return;
  }

  isCurrentPlanPrice(planPrice: string): boolean {
    const cpp = this.currentPlanPeriod;
    const result = cpp === planPrice;
    return result;
  }

  get isAuthenticated(): boolean {
    return this.usersService.isAuthenticatedSignal();
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

          this.rate.push({ name: 'Family Monthly', value: monthlyPriceObject.valueCents });
          this.rate.push({ name: 'Family Yearly', value: yearlyPriceObject.valueCents });

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

          this.rate.push({ name: 'Expedition Monthly', value: monthlyPriceObject1.valueCents });
          this.rate.push({ name: 'Expedition Yearly', value: yearlyPriceObject1.valueCents });


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

    let s = "s";
    let changeText = "upgrade";

    if (this.isAuthenticated) {

      switch (this.currentPlanPeriod) {
        case 'Family Monthly':
          this.family.monthlyButtonText = 'Current monthly';
          this.family.monthlyAvalable = false;

          this.family.yearlyButtonText = 'Upgrade to yearly';
          this.family.yearlyAvalable = true;

          this.expedition.monthlyButtonText = 'Upgrade to monthly';
          this.expedition.monthlyAvalable = true;

          this.expedition.yearlyButtonText = 'Upgrade to yearly';
          this.expedition.yearlyAvalable = true;
          break;
        case 'Family Yearly':
          this.family.monthlyButtonText = 'Monthly unavailable';
          this.family.monthlyAvalable = false;

          this.family.yearlyButtonText = 'Current yearly';
          this.family.yearlyAvalable = false;

          this.expedition.monthlyButtonText = 'Monthly unavailable';
          this.expedition.monthlyAvalable = false;

          this.expedition.yearlyButtonText = 'Upgrade to yearly';
          this.expedition.yearlyAvalable = true;
          break;
        case 'Expedition Monthly':
          this.family.monthlyButtonText = 'Downgrade to monthly';
          this.family.monthlyAvalable = true;

          this.family.yearlyButtonText = 'Yearly unavailable';
          this.family.yearlyAvalable = false;

          this.expedition.monthlyButtonText = 'Current monthly';
          this.expedition.monthlyAvalable = false;

          this.expedition.yearlyButtonText = 'Upgrade to yearly';
          this.expedition.yearlyAvalable = true;
          break;
        case 'Expedition Yearly':
          this.family.monthlyButtonText = 'Monthly unavailable';
          this.family.monthlyAvalable = false;

          this.family.yearlyButtonText = 'Downgrade to yearly';
          this.family.yearlyAvalable = true;

          this.expedition.monthlyButtonText = 'Monthly unavailable';
          this.expedition.monthlyAvalable = false;

          this.expedition.yearlyButtonText = 'Current yearly';
          this.expedition.yearlyAvalable = false;

          s = "";

          break;
        default:
          throw new Error(`Unknown plan period: ${this.currentPlanPeriod}`);
      }
    }



    this.topWording = `Your current plan is ${this.currentPlanPeriod}. You can ${changeText} it by
    clicking one of the button${s} below.`;

    this.rate.sort((a, b) => a.value - b.value);
  }


}
