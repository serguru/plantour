import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-general.component.html',
  styleUrl: './faq-general.component.scss'
})
export class FaqGeneralComponent {
  faqs: FAQItem[] = [
    {
      question: 'What is Plantour?',
      answer: 'Plantour is a trip planning and packing management application that helps you organize travelers, items, bags, and trips. It provides tools for solo travelers and groups to plan packing lists, track items across trips, and collaborate with fellow travelers.'
    },
    {
      question: 'Do I need to create an account to try Plantour?',
      answer: 'No! You can start with Guest Access Mode (Test Mode) immediately without registration. Click "Get Started with Test Mode" on the Help page to explore Plantour with pre-loaded demo data for 7 days. You\'ll have full features except a limit of 5 items to keep testing simple.'
    },
    {
      question: 'What happens to my data in Guest Access Mode?',
      answer: 'Guest Access Mode creates a temporary account with demo data. After 7 days, the account and all data are automatically deleted. To keep your data permanently, create a regular account before the trial period ends.'
    },
    {
      question: 'Can I use Plantour offline?',
      answer: 'Plantour requires an internet connection for syncing data and accessing your account. However, once loaded, you can view your trip information even if connectivity is temporarily lost. Changes made offline will sync when you reconnect.'
    },
    {
      question: 'Is Plantour mobile-friendly?',
      answer: 'Yes! Plantour is fully responsive and works on smartphones, tablets, and desktop computers. You can access your trips and packing lists from any device with a web browser.'
    },
    {
      question: 'Can I use Plantour for both solo trips and group trips?',
      answer: 'Absolutely! Plantour works equally well for solo travelers (managing your own items and bags) and group trips (collaborating with participants, assigning shared items, and coordinating packing responsibilities).'
    },
    {
      question: 'What\'s the difference between Items Dictionary and Trip Items?',
      answer: 'Items Dictionary is your personal catalog of items you can reuse across multiple trips. Trip Items are specific to one trip. You can import items from your dictionary to any trip, or add items from templates directly to trips.'
    },
    {
      question: 'How many trips can I create?',
      answer: 'The number of trips depends on your plan. Trial plan allows creating trips with basic features. Higher-tier plans (Company and Expedition) support multiple active trips with advanced collaboration features.'
    },
    {
      question: 'Can I delete my account and data?',
      answer: 'Yes. You can request account deletion through account settings. All your data (travelers, items, bags, trips) will be permanently deleted. Guest Access accounts are automatically deleted after 7 days.'
    },
    {
      question: 'How do I get help if I have issues?',
      answer: 'You can access comprehensive help documentation within the app (Help section), explore this FAQ, or contact support through the app. The Help section provides step-by-step guides for all features.'
    },
    {
      question: 'What browsers does Plantour support?',
      answer: 'Plantour works best on modern browsers: Chrome, Firefox, Safari, and Edge (latest versions). For the best experience, keep your browser updated.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. Plantour uses industry-standard security practices including encrypted connections (HTTPS), secure authentication, and data protection measures to keep your trip information safe.'
    }
  ];
}
