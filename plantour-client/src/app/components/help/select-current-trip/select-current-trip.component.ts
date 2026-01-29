import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  note?: string;
}

interface Benefit {
  benefit: string;
  description: string;
}

interface Scenario {
  scenario: string;
  solution: string;
}

@Component({
  selector: 'app-select-current-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-current-trip.component.html',
  styleUrls: ['./select-current-trip.component.scss']
})
export class SelectCurrentTripComponent {
  mainHeading = 'Select Current Trip';
  intro = 'The "Current Trip" feature lets you focus on one trip at a time, even when managing multiple journeys. Setting a trip as current highlights it for easy access, prioritizes its packing lists, and streamlines your workflow. This guide explains how to use the current trip feature effectively.';

  whatIsCurrentTrip = 'The "Current Trip" is the trip you\'re actively focusing on right now. It\'s your primary trip for planning, packing, or traveling. While you can have multiple trips in various statuses (Planning, Active, Completed), only one trip is marked as "current" at a time. This distinction helps you cut through clutter and work on what matters most in this moment.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to Your Trips List',
      description: 'Go to the Trips section to see all your trips.',
      details: [
        'Click "Trips" in the main navigation',
        'View your list of all trips (Planning, Active, Completed, etc.)',
        'Identify the trip you want to work on'
      ]
    },
    {
      stepNumber: 2,
      title: 'Find the Trip You Want to Focus On',
      description: 'Locate the trip you want to set as current.',
      details: [
        'Use filters if needed (status, date, destination)',
        'Click on the trip to open its details',
        'Ensure this is the trip you want to prioritize'
      ]
    },
    {
      stepNumber: 3,
      title: 'Set as Current Trip',
      description: 'Mark this trip as your current focus.',
      details: [
        'Look for a "Set as Current", "Make Current", or star/pin icon',
        'May be in the trip header, actions menu, or settings',
        'Click to designate this trip as current'
      ],
      note: 'If another trip was previously current, it automatically becomes non-current. Only one trip can be current at a time.'
    },
    {
      stepNumber: 4,
      title: 'Confirm the Change',
      description: 'Verify the trip is now marked as current.',
      details: [
        'The trip may show a "Current" badge, star icon, or highlight',
        'Your dashboard or main view may update to feature this trip',
        'You can now access this trip quickly from shortcuts or home screen'
      ]
    },
    {
      stepNumber: 5,
      title: 'Work on Your Current Trip',
      description: 'Use the focused view to plan, pack, or manage the trip.',
      details: [
        'Add items to packing lists',
        'Assign bags and organize travelers',
        'Track packing progress',
        'Access trip details without navigating through many trips'
      ]
    },
    {
      stepNumber: 6,
      title: 'Change Current Trip When Needed',
      description: 'Switch focus to a different trip anytime.',
      details: [
        'Repeat steps 1-4 with a new trip',
        'The previous current trip returns to normal status',
        'Useful when switching between multiple active or planned trips'
      ],
      note: 'You can change the current trip as often as needed. There are no limits.'
    }
  ];

  benefits: Benefit[] = [
    {
      benefit: 'Quick Access',
      description: 'Your current trip appears prominently on your dashboard or home screen. No need to search through a long trips list.'
    },
    {
      benefit: 'Focused Workflow',
      description: 'When packing or planning, work on one trip at a time without distractions from other trips.'
    },
    {
      benefit: 'Streamlined Navigation',
      description: 'Jump directly to current trip details, items, bags, and participants from anywhere in Plantour.'
    },
    {
      benefit: 'Prioritized Notifications',
      description: 'If enabled, receive notifications or reminders specifically for your current trip.'
    },
    {
      benefit: 'Clear Mental Model',
      description: 'Knowing which trip is "current" helps you stay organized, especially when juggling multiple trips.'
    }
  ];

  whenToChange: string[] = [
    'When a trip\'s departure date approaches and it becomes your priority.',
    'When you complete one trip and want to focus on the next upcoming journey.',
    'When actively packing or traveling and need quick access to that trip\'s lists.',
    'When switching between multiple trips you\'re managing simultaneously (e.g., work trip vs. family vacation).',
    'When collaborating with others and need to highlight the trip you\'re currently coordinating.',
    'Whenever you want to shift your attention from one trip to another.'
  ];

  tips: string[] = [
    'Set the trip as current a few weeks before departure to focus your packing efforts.',
    'Change to a new current trip once you return from the previous one.',
    'If you have no trips soon, you can leave "current trip" unset or set to the next planned trip.',
    'Use current trip in combination with filters: set current trip to one, filter to Planning to see others.',
    'Don\'t confuse "current trip" with "Active" status. Current is your focus; Active means you\'re traveling.',
    'You can have multiple Active status trips but only one current trip at a time.',
    'If you manage trips for others, set current trip to the one you\'re actively coordinating.',
    'Consider setting current trip to the next departure, even if it\'s weeks away, to start preparing early.'
  ];

  scenarios: Scenario[] = [
    {
      scenario: 'I have two trips next month. Which should be current?',
      solution: 'Set the trip departing first as current. Once that trip is completed or you\'ve finished packing for it, switch to the second trip.'
    },
    {
      scenario: 'I\'m traveling right now. Should my Active trip be current?',
      solution: 'Yes. The trip you\'re currently on should be both Active (status) and current (focus) for easy access to packing lists and details.'
    },
    {
      scenario: 'I have no upcoming trips. Should I set a current trip?',
      solution: 'Optional. You can leave current trip unset if nothing is imminent. Or set it to your next planned trip, even if far in the future.'
    },
    {
      scenario: 'Can I set a Completed trip as current?',
      solution: 'Yes, if you need to reference it frequently. However, it\'s more common to set Planning or Active trips as current.'
    },
    {
      scenario: 'I forgot to change my current trip. Will it cause problems?',
      solution: 'No problems. Current trip is a convenience feature. Your data remains safe. Just update it when you remember.'
    },
    {
      scenario: 'How do I clear the current trip (set none)?',
      solution: 'Some systems allow "unset current trip" or "clear current". If not available, just set a different trip as current when needed.'
    }
  ];

  vsStatus: string[] = [
    '<strong>Current Trip:</strong> Which trip you\'re focusing on right now. A convenience/organizational feature.',
    '<strong>Trip Status:</strong> The lifecycle stage of the trip (Planning, Active, Completed, etc.). A factual state.',
    'You can have a "Completed" status trip set as current if you need to reference it often.',
    'You can have an "Active" status trip that\'s not current if you\'re managing multiple simultaneous trips.',
    'Typically, your current trip is either Planning (preparing for it) or Active (traveling).',
    'Use both together: Set status based on trip stage, set current based on your immediate focus.'
  ];
}
