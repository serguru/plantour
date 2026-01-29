import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EditableField {
  fieldName: string;
  description: string;
  examples?: string[];
  notes?: string;
}

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  note?: string;
}

interface Scenario {
  scenario: string;
  howTo: string;
  tips?: string[];
}

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-trip.component.html',
  styleUrls: ['./edit-trip.component.scss']
})
export class EditTripComponent {
  mainHeading = 'Editing Trip Details';
  intro = 'As your travel plans evolve, you\'ll need to update trip information. Whether changing dates, updating descriptions, or modifying trip status, editing trips is quick and straightforward. This guide shows you how to make changes to existing trips.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to Your Trips',
      description: 'Go to the Trips section.',
      details: [
        'Click "Trips" in the main navigation',
        'You\'ll see your list of all trips',
        'Use filters if needed to find the specific trip'
      ]
    },
    {
      stepNumber: 2,
      title: 'Select the Trip to Edit',
      description: 'Open the trip you want to modify.',
      details: [
        'Click on the trip card or row',
        'This opens the trip details view',
        'Look for an "Edit" button, pencil icon, or similar option'
      ]
    },
    {
      stepNumber: 3,
      title: 'Click "Edit" or Edit Icon',
      description: 'Enter edit mode for the trip.',
      details: [
        'Usually a button with a pencil icon or labeled "Edit"',
        'May be in the trip header or actions menu',
        'Fields become editable once clicked'
      ],
      note: 'Some systems allow inline editing, others open a dedicated edit form or modal.'
    },
    {
      stepNumber: 4,
      title: 'Modify Fields as Needed',
      description: 'Update any trip information.',
      details: [
        'Change trip name, description, dates, or other details',
        'See the "Editable Fields" section below for all options',
        'Required fields are usually marked with an asterisk (*)'
      ]
    },
    {
      stepNumber: 5,
      title: 'Save Your Changes',
      description: 'Apply the updates to your trip.',
      details: [
        'Click "Save", "Update", or a checkmark icon',
        'Your changes take effect immediately',
        'The trip list and details will reflect the updates'
      ],
      note: 'If you change dates, check if item assignments or bags need adjustment.'
    }
  ];

  editableFields: EditableField[] = [
    {
      fieldName: 'Trip Name',
      description: 'The display name of your trip.',
      examples: ['Change "Summer Trip" to "Summer Beach Vacation 2026"'],
      notes: 'Must be unique. Use descriptive names for easier identification.'
    },
    {
      fieldName: 'Description',
      description: 'Additional details about the trip.',
      examples: ['Update from "Beach trip" to "Week-long beach vacation with focus on snorkeling and relaxation"'],
      notes: 'Optional but helpful for providing context, especially for group trips.'
    },
    {
      fieldName: 'Start Date',
      description: 'When the trip begins.',
      examples: ['Change from July 10 to July 15 if plans shift'],
      notes: 'Must be on or before the end date. Changing dates may affect packing timelines.'
    },
    {
      fieldName: 'End Date',
      description: 'When the trip ends.',
      examples: ['Extend return from July 20 to July 22'],
      notes: 'Must be on or after the start date. For day trips, can be the same as start date.'
    },
    {
      fieldName: 'Status',
      description: 'Current stage of the trip (Planning, Active, Completed, Archived).',
      examples: ['Change from "Planning" to "Active" when departure day arrives'],
      notes: 'Status helps organize and filter trips. See "Trip Status Workflow" for more details.'
    },
    {
      fieldName: 'Destination',
      description: 'Where you\'re traveling (if available).',
      examples: ['Update from "Italy" to "Rome, Italy" for specificity'],
      notes: 'Helps with trip organization and quick reference.'
    }
  ];

  commonScenarios: Scenario[] = [
    {
      scenario: 'Trip Dates Changed',
      howTo: 'Edit the start and/or end dates. Ensure the new dates still make sense for your planned items and bags.',
      tips: [
        'Review packing timelines after date changes',
        'Notify participants if it\'s a group trip',
        'Check if accommodations or transport need updating outside Plantour'
      ]
    },
    {
      scenario: 'Rename Trip for Clarity',
      howTo: 'Update the trip name to be more descriptive or accurate.',
      tips: [
        'Include destination and/or date in the name',
        'Use consistent naming across similar trips',
        'Avoid generic names like "Trip 1" or "Vacation"'
      ]
    },
    {
      scenario: 'Update Trip Status',
      howTo: 'Change status from Planning → Active when trip starts, or Active → Completed when it ends.',
      tips: [
        'Use status to keep your trips list organized',
        'Archive old trips you don\'t need to reference regularly',
        'Filter by status to focus on current/upcoming trips'
      ]
    },
    {
      scenario: 'Add More Details to Description',
      howTo: 'Edit the description field to include more context, special notes, or reminders.',
      tips: [
        'Note special requirements like "Bring passport" or "Check visa"',
        'Include key activities or goals for the trip',
        'Use descriptions to remember trip context months later'
      ]
    }
  ];

  importantNotes: string[] = [
    'Editing a trip does NOT automatically update items, bags, or participants. Review those separately after major changes.',
    'Changing trip dates won\'t reschedule or notify anyone. It only updates the trip record in Plantour.',
    'If you rename a trip, any shared links or bookmarks may still work, but consider informing participants.',
    'You can edit trips at any status (Planning, Active, Completed, Archived). There are no restrictions.',
    'Some fields may be required (like trip name). You won\'t be able to save if required fields are empty.',
    'Changes are saved immediately upon clicking "Save". There\'s usually no undo, so double-check before saving.'
  ];

  tips: string[] = [
    'Edit trip details as soon as plans change to keep your information accurate.',
    'For group trips, communicate changes to participants outside of Plantour (email, chat, etc.).',
    'Use the description field to track major plan changes: "Updated: Extended by 2 days on June 15".',
    'If trip dates shift significantly, review item assignments and bags to ensure they still make sense.',
    'Update status regularly to keep your trips list organized and meaningful.',
    'Consider creating a new trip instead of heavily editing if the trip purpose or destination changes entirely.'
  ];
}
