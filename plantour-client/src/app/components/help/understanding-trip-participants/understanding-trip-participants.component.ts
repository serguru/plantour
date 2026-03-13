import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContentSection {
  title: string;
  icon: string;
  description: string;
  details?: string[];
  highlight?: string;
}

interface RoleInfo {
  role: string;
  description: string;
  responsibilities: string[];
}

@Component({
  selector: 'app-understanding-trip-participants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-trip-participants.component.html',
  styleUrls: ['./understanding-trip-participants.component.scss']
})
export class UnderstandingTripParticipantsComponent {
  mainHeading = 'Understanding Trip Participants';
  intro = 'Trip Participants are the people involved in a specific trip. They can be travelers, coordinators, or collaborators who help plan and pack. Participants make it easy to assign items, bags, and responsibilities within a trip.';

  sections: ContentSection[] = [
    {
      title: 'What Are Trip Participants?',
      icon: 'pi pi-users',
      description: 'Participants are the people connected to a trip, including travelers and trip organizers. They appear only within the context of a specific trip.',
      details: [
        'Participants are tied to one trip and do not automatically appear in other trips',
        'You can add participants whether or not they are already listed as Travelers in your account',
        'Participants can be assigned shared items, shared todos, and bags for trip responsibilities'
      ],
      highlight: 'Think of participants as the roster for one trip.'
    },
    {
      title: 'Why Use Participants?',
      icon: 'pi pi-check-circle',
      description: 'Participants help you delegate packing tasks, track who is responsible for what, and keep group trips organized.',
      details: [
        'Assign items to specific people (e.g., "John packs the charger")',
        'Assign action-based work such as confirmations or reminders through shared trip todos',
        'Assign bags to owners (e.g., "Maria\'s carry-on")',
        'See packing progress by participant',
        'Keep group planning transparent and organized'
      ]
    },
    {
      title: 'Participants vs. Travelers',
      icon: 'pi pi-sitemap',
      description: 'Travelers are global profiles in your account. Participants are trip-specific entries that may link to Travelers.',
      details: [
        'A Traveler can be added as a Participant to multiple trips',
        'A Participant can also be added without creating a full Traveler profile',
        'Participants are focused on this trip\'s packing and coordination'
      ],
      highlight: 'Travelers are global; Participants are trip-specific.'
    },
    {
      title: 'Participant Responsibilities',
      icon: 'pi pi-clipboard',
      description: 'Participants can be assigned tasks and items to keep packing collaborative and clear.',
      details: [
        'Items can be assigned to a participant for packing',
        'Shared todos can be assigned to one participant at a time for action tracking',
        'Participants can manage their own trip items and trip todos when they are part of the trip',
        'Bags can be assigned to a participant for ownership',
        'Admins keep control of participant lists and shared-assignment decisions'
      ]
    },
    {
      title: 'When to Add Participants',
      icon: 'pi pi-calendar-plus',
      description: 'Add participants as soon as you know who is involved, especially for group trips.',
      details: [
        'Add participants early to distribute packing responsibilities',
        'Update the participant list if plans change',
        'You can add or remove participants at any time'
      ]
    }
  ];

  roles: RoleInfo[] = [
    {
      role: 'Trip Admin',
      description: 'Has full control over trip settings, participant management, and packing lists.',
      responsibilities: [
        'Create and edit trip details',
        'Add or remove participants',
        'Assign shared items, shared todos, and bags',
        'Manage permissions and statuses'
      ]
    },
    {
      role: 'Participant',
      description: 'Can view trip details and manage their own assigned items (depending on permissions).',
      responsibilities: [
        'View trip details and packing lists',
        'Update packing status for accepted shared items',
        'Accept or reject assigned shared items and shared todos',
        'Complete accepted shared assignments and manage their own trip lists'
      ]
    }
  ];

  commonUseCases: string[] = [
    'Family trip: Assign each family member their own packing list',
    'Family trip: Assign one participant to complete booking or document reminders through shared todos',
    'Business trip with colleagues: Track who is responsible for shared items',
    'Group adventure: Assign bags to owners and items to packers',
    'Couples trip: Split responsibilities between partners for faster packing'
  ];

  tips: string[] = [
    'Add participants early to keep planning organized.',
    'Use consistent names (e.g., full names) to avoid confusion on large trips.',
    'Assign bags to participants to keep ownership clear.',
    'Use shared todos when the responsibility is an action, not a packable object.',
    'Review participant list before departure to ensure it\'s accurate.',
    'If a participant is no longer joining, remove them to prevent confusion.'
  ];
}
