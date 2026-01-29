import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-trips.component.html',
  styleUrl: './faq-trips.component.scss'
})
export class FaqTripsComponent {
  faqs: FAQItem[] = [
    {
      question: 'What is a trip in Plantour?',
      answer: 'A trip is a container for organizing all aspects of a specific journey: items to pack, bags to use, participants traveling with you, shared responsibilities, and trip comments. Each trip has its own packing lists and can involve multiple travelers.'
    },
    {
      question: 'How do I create a new trip?',
      answer: 'Navigate to the Trips module and click "Add Trip". Enter trip details like name, destination, dates, and description. Once created, you can add participants, select bags, import items from your dictionary or templates, and start planning.'
    },
    {
      question: 'Can I have multiple trips at once?',
      answer: 'Yes! You can create and manage multiple trips simultaneously. The number of active trips depends on your plan. Use the "Current Trip" selector to switch between trips easily.'
    },
    {
      question: 'What is the "Current Trip"?',
      answer: 'The Current Trip is the trip you\'re actively working on. When you select a trip as current, it becomes the default context for adding items, viewing bags, and managing participants. You can change your current trip anytime.'
    },
    {
      question: 'What are trip statuses?',
      answer: 'Trips progress through statuses: Planning (initial setup), Packing (actively organizing items), In Progress (currently traveling), Completed (trip finished), and Archived (stored for reference). Status helps you organize trips at different stages.'
    },
    {
      question: 'Can I edit a trip after creating it?',
      answer: 'Yes! You can edit trip details (name, dates, destination, description) at any time. Changes to trip information don\'t affect your items, bags, or participants - those are managed separately.'
    },
    {
      question: 'What happens when I delete a trip?',
      answer: 'Deleting a trip removes the trip and all associated data: trip-specific items, bag assignments, shared items, participant assignments, and comments. Items in your dictionary remain untouched. This action cannot be undone.'
    },
    {
      question: 'How do trip participants work?',
      answer: 'Trip participants are travelers invited to collaborate on a trip. You (the admin) can add participants, assign them items and bags, and manage permissions. Participants can view the trip, manage their assigned items, and communicate via comments.'
    },
    {
      question: 'Can I copy items from one trip to another?',
      answer: 'Yes! Save items to your Items Dictionary, then import them to any trip. Alternatively, if you upgrade items from a trip to your dictionary, they become reusable across all trips. Templates also help you quickly populate new trips.'
    },
    {
      question: 'Can participants create their own trips?',
      answer: 'Participants can only participate in trips where they\'re invited by the admin. To create their own trips, they need their own Plantour account. Each account can have its own trips with separate admin rights.'
    },
    {
      question: 'How do I invite someone to my trip?',
      answer: 'First, add the person as a traveler in your Travelers module. Then, in your trip, navigate to Trip Participants and add them. They\'ll receive an invitation email (if you\'re on Company or Expedition plan) and can accept to join.'
    },
    {
      question: 'Can I use Plantour for past trips?',
      answer: 'Yes! Create trips with past dates to document completed journeys. You can use completed trips as references for future travel or keep them archived for memories and packing list history.'
    },
    {
      question: 'What\'s the difference between trip items and dictionary items?',
      answer: 'Trip items are specific to one trip and exist only within that trip context. Dictionary items are part of your personal catalog and can be imported to multiple trips. Think of the dictionary as your reusable packing master list.'
    },
    {
      question: 'Can I filter or sort my trips?',
      answer: 'Yes! Use the filter and sort options in the Trips module to organize trips by date, status, name, or other criteria. This helps you quickly find the trip you need, especially if you have many trips.'
    }
  ];
}
