import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatusInfo {
  status: string;
  description: string;
  whenToUse: string;
  icon: string;
  color: string;
}

interface Transition {
  from: string;
  to: string;
  when: string;
  how: string;
}

interface Benefit {
  benefit: string;
  description: string;
}

@Component({
  selector: 'app-trip-status-workflow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-status-workflow.component.html',
  styleUrls: ['./trip-status-workflow.component.scss']
})
export class TripStatusWorkflowComponent {
  mainHeading = 'Trip Status Workflow';
  intro = 'Trip statuses help you organize and track your travels through different stages. Understanding each status and when to use it makes managing multiple trips easier. This guide explains the typical trip lifecycle and how to change statuses effectively.';

  statuses: StatusInfo[] = [
    {
      status: 'Planning',
      description: 'The initial stage for new trips. You\'re still deciding details, adding participants, creating packing lists, and preparing.',
      whenToUse: 'From trip creation until departure day. Most trips start in this status and stay here during all preparation.',
      icon: 'pi-calendar',
      color: 'blue'
    },
    {
      status: 'Active',
      description: 'The trip is currently happening. You\'re traveling, and this status helps you focus on current trips.',
      whenToUse: 'From departure day until you return home. Change to Active when you leave for your trip.',
      icon: 'pi-map-marker',
      color: 'green'
    },
    {
      status: 'Completed',
      description: 'The trip is finished. You\'ve returned, but the trip record remains for future reference.',
      whenToUse: 'After returning home. Keeps trip data accessible while indicating it\'s no longer active.',
      icon: 'pi-check-circle',
      color: 'teal'
    },
    {
      status: 'Archived',
      description: 'Old trips you rarely need but want to keep. Hidden from main lists to reduce clutter.',
      whenToUse: 'For trips from long ago that you don\'t reference often but want preserved.',
      icon: 'pi-inbox',
      color: 'gray'
    },
    {
      status: 'Cancelled',
      description: 'Trip was planned but won\'t happen. Useful for tracking why trips didn\'t occur.',
      whenToUse: 'When plans change and the trip is no longer happening. Alternative to deletion.',
      icon: 'pi-times-circle',
      color: 'red'
    }
  ];

  commonTransitions: Transition[] = [
    {
      from: 'Planning',
      to: 'Active',
      when: 'On departure day, when you begin traveling.',
      how: 'Open trip → Edit → Change status to Active → Save. This helps you focus on the current trip.'
    },
    {
      from: 'Active',
      to: 'Completed',
      when: 'When you return home from the trip.',
      how: 'Open trip → Edit → Change status to Completed → Save. Trip data remains accessible for review.'
    },
    {
      from: 'Planning',
      to: 'Cancelled',
      when: 'When trip plans are canceled before departure.',
      how: 'Open trip → Edit → Change status to Cancelled → Save. Keeps record without deleting.'
    },
    {
      from: 'Completed',
      to: 'Archived',
      when: 'After the trip is done and you rarely need to reference it.',
      how: 'Open trip → Edit → Change status to Archived → Save. Hides from main list but preserves data.'
    },
    {
      from: 'Planning',
      to: 'Planning',
      when: 'If you need to postpone or reschedule, keep it in Planning.',
      how: 'Edit trip dates, description, and details. No status change needed.'
    }
  ];

  benefits: Benefit[] = [
    {
      benefit: 'Easy Filtering',
      description: 'Quickly view only Active trips, or filter by Planning to see upcoming trips. Status makes finding trips faster.'
    },
    {
      benefit: 'Clear Organization',
      description: 'Your trips list stays organized by stage. Past, present, and future trips are distinct.'
    },
    {
      benefit: 'Focus on What Matters',
      description: 'When traveling, set trip to Active to highlight it. Completed trips don\'t clutter your current planning.'
    },
    {
      benefit: 'Historical Reference',
      description: 'Completed trips serve as templates for future travel. Easily copy packing lists from past trips.'
    },
    {
      benefit: 'No Need to Delete',
      description: 'Use Archived or Completed instead of deleting. Keeps your travel history intact.'
    }
  ];

  howToChange: string[] = [
    'Navigate to the Trips section and find the trip you want to update.',
    'Click on the trip to open its details.',
    'Look for an "Edit" button, pencil icon, or status dropdown.',
    'Select the new status from the available options.',
    'Save your changes. The trip will immediately reflect the new status.',
    'Use filters in the trips list to view trips by specific status.'
  ];

  tips: string[] = [
    'Update trip status on departure and return days to keep your trips organized.',
    'Use the Active status for trips currently underway - makes them easy to find.',
    'Mark trips as Completed after returning, not Archived. Archive much later if needed.',
    'Cancelled status is better than deleting - preserves planning work and lessons learned.',
    'Filter by status to focus on upcoming trips (Planning) or review past trips (Completed).',
    'You can change status at any time - there are no restrictions or required sequences.',
    'Some systems may have a "Current Trip" feature separate from status - use both together.',
    'Regularly move old Completed trips to Archived to keep your Completed list manageable.'
  ];

  commonScenarios: { scenario: string; solution: string; }[] = [
    {
      scenario: 'I have multiple active trips at once',
      solution: 'Mark all as Active, then use the "Current Trip" feature (if available) to highlight the most relevant one.'
    },
    {
      scenario: 'I want to reuse a Completed trip as a template',
      solution: 'Keep it as Completed. Copy or duplicate the trip when planning a similar journey. Don\'t change its status.'
    },
    {
      scenario: 'A trip is postponed indefinitely',
      solution: 'Either keep it as Planning with updated dates, or mark as Cancelled if it\'s unlikely to happen.'
    },
    {
      scenario: 'I have too many Completed trips',
      solution: 'Archive older trips you rarely reference. Keep recent Completed trips accessible for quick reference.'
    },
    {
      scenario: 'I forgot to change status when trip started',
      solution: 'Update it now. Trip status is for your organization - you can change it anytime.'
    }
  ];
}
