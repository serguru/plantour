import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PermissionRule {
  role: string;
  canView: string[];
  canEdit: string[];
  cannot: string[];
}

interface BestPractice {
  title: string;
  description: string;
}

@Component({
  selector: 'app-participant-permissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participant-permissions.component.html',
  styleUrls: ['./participant-permissions.component.scss']
})
export class ParticipantPermissionsComponent {
  mainHeading = 'Participant Permissions';
  intro = 'Participant permissions control who can view, edit, and manage trip information. Understanding roles helps you keep trips secure while still collaborating effectively.';

  overviewPoints: string[] = [
    'Permissions are usually tied to roles such as Admin or Participant.',
    'Admins manage trip settings, participants, shared assignments, and deadlines.',
    'Participants view trip details and can work with their own trip items, trip todos, and accepted assignments.',
    'Permissions can be updated at any time by a trip admin.'
  ];

  permissionRules: PermissionRule[] = [
    {
      role: 'Trip Admin',
      canView: [
        'All trip details, participants, items, todos, bags, and comments',
        'All packing progress, shared-item assignments, and shared-todo assignments'
      ],
      canEdit: [
        'Trip details (dates, name, status)',
        'Participant list and roles',
        'Item, todo, and bag assignments',
        'Shared items, shared todos, and comments'
      ],
      cannot: [
        'No major restrictions (full access)'
      ]
    },
    {
      role: 'Participant',
      canView: [
        'Trip overview and packing lists',
        'Items and todos assigned to them',
        'Bags they are responsible for',
        'Shared item and shared todo statuses relevant to them'
      ],
      canEdit: [
        'Packing status for accepted shared-item assignments',
        'Acceptance, rejection, and finish status for their shared assignments',
        'Their own trip items, trip todos, and comments allowed by the trip workflow'
      ],
      cannot: [
        'Change trip dates or status',
        'Add/remove participants',
        'Create or assign shared todos or shared items',
        'Delete the trip'
      ]
    }
  ];

  commonScenarios: { scenario: string; recommendation: string }[] = [
    {
      scenario: 'Family trip with one organizer',
      recommendation: 'Make the organizer an Admin. Others can be Participants to update their own packing.'
    },
    {
      scenario: 'Work trip with multiple coordinators',
      recommendation: 'Assign Admin role to all coordinators so they can edit plans and manage participants.'
    },
    {
      scenario: 'Large group adventure',
      recommendation: 'Keep most members as Participants and assign 1–2 Admins to prevent accidental changes.'
    },
    {
      scenario: 'Shared items planning',
      recommendation: 'Let participants accept, reject, and finish their assignments, but keep creation and assignment control with Admins.'
    }
  ];

  bestPractices: BestPractice[] = [
    {
      title: 'Limit Admin Access',
      description: 'Only assign Admin role to people who need to manage trip settings to avoid accidental changes.'
    },
    {
      title: 'Match Permissions to Responsibilities',
      description: 'If someone is coordinating packing or logistics, give them the access they need to do the job.'
    },
    {
      title: 'Review Permissions Before Departure',
      description: 'Check roles and permissions a few days before travel to ensure everyone can access what they need.'
    },
    {
      title: 'Use Comments for Coordination',
      description: 'Let participants use comments and assignment status updates for coordination, while keeping structural edits and assignment decisions with admins.'
    }
  ];

  tips: string[] = [
    'Permissions can be adjusted anytime by an admin.',
    'Use Admin role sparingly to protect trip data.',
    'Participants should still be able to update their own assignment status and their own trip lists.',
    'If someone needs to manage shared assignments, make sure an admin handles that work.',
    'Keep roles clear to avoid confusion about responsibilities.'
  ];
}
