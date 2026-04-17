import { Component, inject, OnInit } from '@angular/core';

import { LandingDto, LandingService, PlanDto } from '../../services/landing-service';
import { UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

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
  imports: [],
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

  get isTemporary(): boolean {
    const result = this.usersService.isTemporarySignal();
    return result;
  }

  get isStarter(): boolean {
    return this.currentPlanPeriod == "Starter Free";
  }

  get starterEmailUrlPart(): string {
      const email = this.usersService.userEmail();
      if (!email || !this.isStarter || this.isTemporary) {
        return '';
      } 
      return `?email=${encodeURIComponent(email)}`;
  }

  isDowngrade(text: string): boolean {
    const result = text.startsWith('Downgrade');
    return result;
  }

  get currentPlanPeriod(): string {
    return this.usersService.planPeriodSignal() ?? '';
  }

  async onPlanButtonClick(event: Event, planPrice: string, isDowngrade: boolean): Promise<void> {
    event.preventDefault();

    try {
      const currentName = this.currentPlanPeriod;
      const newName = planPrice;

      let message = "";
      let title = "";
      const billingPeriodEnd = await this.ensureBillingPeriodEndAsync();
      let confirmedBillingPeriodEnd: Date | null = null;
      this.messagesService.focusOkButton = !isDowngrade;

      if (isDowngrade) {
        if (!billingPeriodEnd) {
          throw new Error('Cannot get billing period end date');
        }

        confirmedBillingPeriodEnd = billingPeriodEnd;

        message = `You are downgrading from ${currentName} to ${newName}. The downgrade will happen on ${confirmedBillingPeriodEnd.toLocaleString()} in your local time. Your current plan will stay active until then, and the new plan will start after that. Are you sure you want to proceed?`;

        title = `Downgrade to ${newName}`;
      } else {
        message = `You are upgrading from ${currentName} to ${newName}. The new plan will be in effect immediately. Click Yes to proceed.`;
        title = `Upgrade to ${newName}`;
      }

      const result = await this.messagesService.openOkCancel({
        title,
        message,
        okLabel: 'Yes',
        cancelLabel: 'Cancel'
      });

      if (result !== 'ok') {
        return;
      }

      if (isDowngrade) {
        await firstValueFrom(this.usersService.downgradePlanPrice(currentName, newName).pipe(
          switchMap(() => this.usersService.refreshTokens())
        ));

        this.messagesService.showInfo(`Your downgrade is scheduled. Your current plan remains active until ${confirmedBillingPeriodEnd!.toLocaleString()}.`);

        this.router.navigate(['profile']);
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
    } catch (error: any) {
      const detail = error?.error?.message || error?.message || 'Failed to change the plan.';
      this.messagesService.showError('Plan change failed', detail);
    }
  }

  private async ensureBillingPeriodEndAsync(): Promise<Date | null> {
    const currentValue = this.usersService.userBillingPeriodEndSignal();
    if (currentValue) {
      return currentValue;
    }

    if (!this.usersService.refreshToken) {
      return this.getBillingPeriodEndFallbackAsync();
    }

    try {
      await firstValueFrom(this.usersService.refreshTokens());
    } catch {
      return this.getBillingPeriodEndFallbackAsync();
    }

    return this.usersService.userBillingPeriodEndSignal() ?? await this.getBillingPeriodEndFallbackAsync();
  }

  private async getBillingPeriodEndFallbackAsync(): Promise<Date | null> {
    try {
      const currentBillingPeriod = await firstValueFrom(this.usersService.getCurrentBillingPeriodEnd());
      const currentValue = currentBillingPeriod.billingPeriodEnd;
      if (currentValue) {
        return new Date(currentValue);
      }

      const info = await firstValueFrom(this.usersService.getScheduledDowngrade());
      const value = info.currentBillingPeriodEnd;
      return value ? new Date(value) : null;
    } catch {
      return null;
    }
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

  plansHelpUrl(): string {
    return '/help/get-started/plantour-plans';
  }

  private featuresByPlan(plan: PlanDto): PlanFeature[] {
    return [
      { label: 'Max Items', value: this.formatPlanLimit(plan.allowedItems) },
      { label: 'Max Participants', value: this.formatPlanLimit(plan.allowedTravelers) },
      // { label: 'PDF Export', value: true },
      { label: 'AI Suggestions', value: `${plan.allowedAiPrompts && plan.allowedAiPrompts > 0 ? plan.allowedAiPrompts : 'Unlimited'} per day` },
      // { label: 'Shared Items', value: true },
      { label: 'Extended AI prompts', value: plan.extendedAiAllowed },
    ];
  }

  private formatPlanLimit(limit: number | null): string {
    return limit && limit > 0 ? `${limit} per trip` : 'Unlimited';
  }

  private setPlans(data: LandingDto): void {

    data.plans.filter(x => !(this.isAuthenticated && x.name === 'Starter')).forEach(plan => {
      switch (plan.name) {
        case 'Starter':
          this.starter =
          {
            name: 'Starter',
            description: 'Suitable for short and easy trips alone or in pairs',
            monthlyPrice: '0',
            monthlyPriceName: "Free",
            monthlyButtonText: 'Join Free',
            monthlyPriceUrl: '/sign-in',
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
            monthlyPriceUrl: `/checkout/${monthlyPriceObject.paymentProcessorPriceId}/${encodeURIComponent('Family Monthly')}`,
            yearlyPriceUrl: `/checkout/${yearlyPriceObject.paymentProcessorPriceId}/${encodeURIComponent('Family Yearly')}`,
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
            monthlyPriceUrl: `/checkout/${monthlyPriceObject1.paymentProcessorPriceId}/${encodeURIComponent('Expedition Monthly')}`,
            yearlyPriceUrl: `/checkout/${yearlyPriceObject1.paymentProcessorPriceId}/${encodeURIComponent('Expedition Yearly')}`,
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
        case 'Starter Free':
          this.family.monthlyButtonText = 'Upgrade to Monthly';
          this.family.monthlyAvalable = true;
          this.family.yearlyButtonText = 'Upgrade to Yearly';
          this.family.yearlyAvalable = true;
          this.expedition.monthlyButtonText = 'Upgrade to Monthly';
          this.expedition.monthlyAvalable = true;
          this.expedition.yearlyButtonText = 'Upgrade to Yearly';
          this.expedition.yearlyAvalable = true;
          break;
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
