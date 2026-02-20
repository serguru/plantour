import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingDto, UsersService } from '../../services/users-service';
import { PaddleService } from '../../services/paddle-service';
import { AppButton } from '../button/button-component';

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
  monthlyPriceLink?: string;
  annualPriceLink?: string;
  features: PlanFeature[];
}

interface LandingFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing-new-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-new-user.component.html',
  styleUrl: './landing-new-user.component.scss'
})
export class LandingNewUserComponent implements OnInit {

  paddleService = inject(PaddleService);

  slogan = 'Pack smart. Travel better.';
  subSlogan = 'Never forget an item again. Organize your packing with smart lists, categories, and seamless group coordination. Get AI-powered packing recommendations tailored to your destination.';

  usersService = inject(UsersService);
  plans: Plan[] = [];

  ngOnInit(): void {
    this.usersService.getLandingData().subscribe((data: LandingDto) => {
      this.setPlans(data);
    });
  }


  featureList: LandingFeature[] = [
    {
      icon: 'list',
      title: 'Planning',
      description: 'Create trips with clear structure, item lists, and participants, all in one place. Nothing important is missed before you go.'
    },
    {
      icon: 'building-columns',
      title: 'Organization',
      description: 'Keep travelers, items, and bags neatly structured and easy to manage. Everything has its place and is always up to date.'
    },
    {
      icon: 'share-alt',
      title: 'Sharing',
      description: 'Create shared packing lists for groups and families. Coordinate who brings what and avoid duplicates or missing items.'
    },
    {
      icon: 'shopping-bag',
      title: 'Packing',
      description: 'Build smart packing lists and track what is packed and what is missing. Use the unique Plantour "do many by one click" feature to pack faster.'
    },
    {
      icon: 'sun',
      title: 'AI',
      description: 'Get intelligent AI suggestions based on your trip destination and weather. Pack faster and avoid forgetting essentials.'
    },
    {
      icon: 'clone',
      title: 'Templates',
      description: 'Reuse proven packing setups for future journeys. Start in seconds instead of planning from scratch.'
    }
  ];

  setPlans(data: LandingDto): void {
    this.plans = [
      {
        name: data.trialPlanName || "",
        monthlyPrice: "0",
        description: 'For small trips and light packers',
        monthlyButtonText: 'Join Free',
        features: [
          { label: 'Duration', value: 'Unlimited', highlight: true },
          { label: 'Max Items', value: '10 per trip' },
          { label: 'Participants', value: 'Max 2' },
          { label: 'PDF Export', value: true },
          { label: 'AI Suggestions', value: '30 / month' },
          { label: 'Shared Items', value: true },
        ]
      },
      {
        name: data.basePlanName || "",
        monthlyPrice: data.basePlanMonthly || "",
        annualPrice: data.basePlanYearly || "",
        description: 'Perfect for families and small groups',
        isPopular: true,
        monthlyButtonText: 'Start monthly',
        annualButtonText: 'Start yearly',
        monthlyPriceLink: data.baseMonthlyPriceUrl || "",
        annualPriceLink: data.baseYearlyPriceUrl || "",
        features: [
          { label: 'Duration', value: 'Unlimited' },
          { label: 'Max Items', value: 'Unlimited', highlight: true },
          { label: 'Participants', value: 'Max 5' },
          { label: 'PDF Export', value: true },
          { label: 'AI Suggestions', value: '10 / day' },
          { label: 'Shared Items', value: true },
        ]
      },
      {
        name: data.proPlanName || "",
        monthlyPrice: data.proPlanMonthly || "",
        annualPrice: data.proPlanYearly || "",
        description: 'Ideal for large groups and expeditions',
        monthlyButtonText: 'Go monthly',
        annualButtonText: 'Go yearly',
        monthlyPriceLink: data.proMonthlyPriceUrl || "",
        annualPriceLink: data.proYearlyPriceUrl || "",
        features: [
          { label: 'Duration', value: 'Unlimited' },
          { label: 'Max Items', value: 'Unlimited' },
          { label: 'Participants', value: 'Unlimited', highlight: true },
          { label: 'PDF Export', value: true },
          { label: 'AI Suggestions', value: '100 / day', highlight: true },
          { label: 'Shared Items', value: true },
        ]
      }
    ];
  }
}