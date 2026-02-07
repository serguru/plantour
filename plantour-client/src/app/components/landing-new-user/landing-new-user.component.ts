import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PlanFeature {
  label: string;
  value: string | boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  isPopular?: boolean;
  buttonText: string;
  features: PlanFeature[];
}

@Component({
  selector: 'app-landing-new-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-new-user.component.html',
  styleUrl: './landing-new-user.component.scss'
})
export class LandingNewUserComponent {
  primaryColor = '#3A9AA8';
  slogan = 'Pack smart. Travel better.';
  subSlogan = 'Never forget an item again. Organize your packing with smart lists, categories, and seamless group coordination. Get AI-powered packing recommendations tailored to your destination.';

  featureList = [
    'Trip participants join for free',
    'Manage travelers, gear, and packing lists',
    'AI suggestions based on weather & trip type',
    'Assign shared items to specific travelers',
    'Smart item templates for quick setup',
    'Export packing lists to PDF',
    'In-app trip comments'
  ];

  plans: Plan[] = [
    {
      name: 'Guest',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'No registration required. Prefilled test data.',
      buttonText: 'Get Started',
      features: [
        { label: 'Duration', value: '2 Weeks', highlight: true },
        { label: 'Max Items', value: '10 per trip' },
        { label: 'Participants', value: 'Max 2' },
        { label: 'PDF Export', value: false },
        { label: 'AI Suggestions', value: '5 (Total)' },
        { label: 'Shared Items', value: false },
      ]
    },
    {
      name: 'Trial',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Test the full app experience',
      buttonText: 'Start Free',
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
      name: 'Base',
      monthlyPrice: 4.99,
      annualPrice: 29.99,
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
      name: 'Expedition',
      monthlyPrice: 29.99,
      annualPrice: 89.99,
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