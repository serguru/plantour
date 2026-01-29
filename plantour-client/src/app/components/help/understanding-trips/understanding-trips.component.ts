import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContentSection {
  title: string;
  paragraphs: string[];
  list?: string[];
  subsections?: {
    title: string;
    paragraphs: string[];
    list?: string[];
  }[];
}

@Component({
  selector: 'app-understanding-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-trips.component.html',
  styleUrls: ['./understanding-trips.component.scss']
})
export class UnderstandingTripsComponent {
  mainHeading = 'Understanding Trips in Plantour';
  intro = 'Trips are the central organizing unit in Plantour. Each trip represents a journey you\'re planning, whether it\'s a weekend getaway, family vacation, business trip, or multi-week adventure. Understanding how trips work will help you organize everything efficiently.';

  sections: ContentSection[] = [
    {
      title: 'What is a Trip?',
      paragraphs: [
        'A Trip in Plantour is a container that brings together all the planning elements for a specific journey. It acts as a workspace where you organize travelers, items, bags, and all the details needed for your adventure.',
        'Each trip is independent, meaning you can have multiple trips at different stages of planning without them interfering with each other.'
      ],
      list: [
        'Every trip has a unique name and description',
        'Trips have start and end dates to help you plan timelines',
        'You can assign multiple participants (travelers) to each trip',
        'Items and bags are managed within the context of specific trips',
        'Each trip tracks its own packing status and progress',
        'Trips have statuses (Planning, Active, Completed, Archived) to organize your workflow'
      ]
    },
    {
      title: 'Why Use Trips?',
      paragraphs: [
        'Organizing your travel into distinct trips provides several key benefits:'
      ],
      subsections: [
        {
          title: 'Clear Organization',
          paragraphs: [
            'Keep all information for one journey in one place. No more confusion about which packing list belongs to which trip.'
          ]
        },
        {
          title: 'Reusable Planning',
          paragraphs: [
            'Learn from past trips. Copy item lists, bag structures, and participant setups from previous journeys to save time.'
          ]
        },
        {
          title: 'Progress Tracking',
          paragraphs: [
            'See at a glance how prepared you are. Track packing completion, participant readiness, and planning milestones.'
          ]
        },
        {
          title: 'Collaboration',
          paragraphs: [
            'Share trip planning with other participants. Everyone can see what\'s packed, what\'s needed, and who\'s responsible for what.'
          ]
        },
        {
          title: 'Historical Record',
          paragraphs: [
            'Keep completed trips as reference. Remember what worked, what you forgot, and what you\'ll do differently next time.'
          ]
        }
      ]
    },
    {
      title: 'Trip Components',
      paragraphs: [
        'Each trip consists of several interconnected elements:'
      ],
      subsections: [
        {
          title: 'Basic Information',
          paragraphs: [
            'Name, description, destination, start date, end date, and current status. This helps you identify and organize your trips.'
          ]
        },
        {
          title: 'Participants',
          paragraphs: [
            'The travelers going on this trip. You can assign items and bags to specific participants, making group coordination easier.'
          ]
        },
        {
          title: 'Items',
          paragraphs: [
            'The things you need to bring. Items are added to trips from your master items list, allowing you to reuse and customize for each journey.'
          ]
        },
        {
          title: 'Bags',
          paragraphs: [
            'The containers for packing. Bags are assigned to participants and filled with items, helping you organize physical luggage.'
          ]
        },
        {
          title: 'Packing Status',
          paragraphs: [
            'Track what\'s packed, what\'s not, and overall completion percentage. This ensures nothing gets forgotten.'
          ]
        }
      ]
    },
    {
      title: 'Trip Lifecycle',
      paragraphs: [
        'Trips typically move through several stages as you plan and execute your journey:'
      ],
      list: [
        'Planning: Initial creation and setup. Adding participants, deciding on items, organizing bags.',
        'Active: The trip is happening now. Track packing completion, access information on the go.',
        'Completed: The trip is finished. Review what worked, keep notes for future reference.',
        'Archived: Long-term storage. Trips you want to keep but don\'t need in your active list.'
      ]
    },
    {
      title: 'Current Trip Concept',
      paragraphs: [
        'Plantour allows you to designate one trip as your "Current Trip". This is the journey you\'re actively working on right now.',
        'When a trip is set as current, the interface focuses on it, making it faster to add items, update packing status, and manage details. You can quickly switch between trips as needed.'
      ]
    },
    {
      title: 'Single vs. Group Trips',
      paragraphs: [
        'Plantour handles both solo and group travel efficiently:'
      ],
      subsections: [
        {
          title: 'Solo Trips',
          paragraphs: [
            'You\'re the only participant. All items and bags belong to you. Simple, straightforward planning.'
          ]
        },
        {
          title: 'Group Trips',
          paragraphs: [
            'Multiple participants each with their own items and bags. Assign responsibilities, track who\'s bringing what, coordinate shared items.'
          ]
        },
        {
          title: 'Family Trips',
          paragraphs: [
            'Special case of group trips where parents often manage children\'s packing. Assign bags to kids but make parents responsible for carrying them.'
          ]
        }
      ]
    },
    {
      title: 'Trips vs. Templates',
      paragraphs: [
        'While trips represent specific journeys, Plantour also supports templates (reusable patterns):'
      ],
      list: [
        'Trips are unique instances with specific dates, participants, and details',
        'Templates are generic patterns you can copy when starting new trips',
        'Completed trips can serve as informal templates - copy their structure for future journeys',
        'Templates help when you take similar trips regularly (business trips, weekend getaways, etc.)'
      ]
    },
    {
      title: 'Real-World Example',
      paragraphs: [
        'Imagine planning a family beach vacation:'
      ],
      list: [
        'Trip: "Summer Beach Trip 2026"',
        'Dates: July 15-22, 2026',
        'Participants: John (Dad), Sarah (Mom), Emma (age 8), Tom (age 5)',
        'Items: Beach toys, swimwear, sunscreen, snacks, books, first aid kit, etc.',
        'Bags: "Family Suitcase" (shared clothing), "Beach Bag" (toys and gear), "Mom\'s Carry-on" (important documents)',
        'Status: Planning → Active (during trip) → Completed',
        'Next year: Copy this trip structure to start "Summer Beach Trip 2027"'
      ]
    }
  ];
}
