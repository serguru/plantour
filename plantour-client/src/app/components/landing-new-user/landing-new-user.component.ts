import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingDto, UsersService } from '../../services/users-service';

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
  buttonText: string;
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
      icon: 'LIST',
      title: 'Trips that stay organized',
      description: 'Keep travelers, gear, and lists in one place.'
    },
    {
      icon: 'TEAM',
      title: 'Share items with clarity',
      description: 'Assign shared items to specific people.'
    },
    {
      icon: 'AI',
      title: 'Weather-smart packing',
      description: 'AI suggestions tuned to destination and season.'
    },
    {
      icon: 'FAST',
      title: 'Templates that start fast',
      description: 'Reusable lists for quick setup.'
    },
    {
      icon: 'PDF',
      title: 'Exportable lists',
      description: 'Print or share PDF packing lists.'
    },
    {
      icon: 'CHAT',
      title: 'Trip comments',
      description: 'Keep notes and updates with the group.'
    }
  ];

  setPlans(data: LandingDto): void {
    this.plans = [
      {
        name: data.trialPlanName || "",
        monthlyPrice: "0",
        description: 'Test the full app experience',
        buttonText: 'Start free',
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
        description: 'Perfect for families & small groups.',
        isPopular: true,
        buttonText: 'Choose Base',
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
        description: 'For guides and power travelers.',
        buttonText: 'Go Unlimited',
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