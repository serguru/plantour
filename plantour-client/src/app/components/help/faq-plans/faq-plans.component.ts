import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-plans.component.html',
  styleUrl: './faq-plans.component.scss'
})
export class FaqPlansComponent {
  faqs: FAQItem[] = [
    {
      question: 'What plans does Plantour offer?',
      answer: 'Plantour offers three plans: Trial (Free forever with 10 items max), Family ($4.99/month or $19.99/year for up to 5 travelers with shared items and trip comments), and Expedition ($19.99/year with no limitations, packing lists, and item templates).'
    },
    {
      question: 'Is there a free plan?',
      answer: 'Yes! The Trial plan is free forever and includes essential features: up to 10 items, one-click pack functionality, and mobile-friendly access. It\'s perfect for solo travelers with simple packing needs.'
    },
    {
      question: 'What are the limits on the Trial plan?',
      answer: 'The Trial plan limits you to 10 items maximum. This includes items in your dictionary and trip items combined. You can create trips and use basic packing features, but advanced collaboration features require upgrading.'
    },
    {
      question: 'What does the Family plan include?',
      answer: 'The Company plan ($9.99/year) supports up to 5 travelers, enables shared items for group coordination, and includes trip comments for team communication. It\'s ideal for families or small groups traveling together.'
    },
    {
      question: 'What does the Expedition plan include?',
      answer: 'The Expedition plan ($19.99/year) has no limitations on travelers, items, or trips. It includes advanced features like downloadable packing lists and item templates for quick trip setup. Perfect for frequent travelers or large groups.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes. You can upgrade your plan at any time to access more features. When upgrading, you\'ll pay a prorated amount for the remaining subscription period. Downgrading takes effect at your next renewal date.'
    },
    {
      question: 'What happens to my data if I downgrade?',
      answer: 'When downgrading, your data is preserved but may be limited by the new plan\'s restrictions. For example, downgrading from Expedition to Trial will limit you to 10 items. You\'ll need to remove excess items to continue using the app.'
    },
    {
      question: 'Is the Guest Access Mode the same as the Trial plan?',
      answer: 'No. Guest Access Mode is a 7-day temporary trial with demo data and a 5-item limit for testing. The Trial plan is a permanent free account with your own data and a 10-item limit that lasts forever.'
    },
    {
      question: 'Do I get charged automatically?',
      answer: 'Yes, paid plans (Company and Expedition) auto-renew annually. You\'ll receive a reminder email before renewal. You can cancel anytime from account settings to prevent future charges.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes. You can cancel your subscription anytime from account settings. You\'ll continue to have access to paid features until the end of your billing period, then automatically switch to the Trial plan.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'Plantour accepts major credit cards (Visa, Mastercard, American Express) and PayPal for paid plan subscriptions. All payments are processed securely through encrypted payment gateways.'
    },
    {
      question: 'Can I try premium features before paying?',
      answer: 'Yes! Use Guest Access Mode to explore all features for 7 days. This includes advanced features like shared items and templates. After trying, you can create an account and choose the plan that fits your needs.'
    },
    {
      question: 'Are there discounts for yearly subscriptions?',
      answer: 'Our plans are already priced annually at discounted rates. Company and Expedition plans are billed yearly, providing significant savings compared to monthly billing that may be offered in the future.'
    },
    {
      question: 'Can multiple people share one account?',
      answer: 'Each person should have their own account. However, with Company or Expedition plans, you can invite multiple travelers as participants to your trips, allowing them to collaborate without sharing your login credentials.'
    }
  ];
}
