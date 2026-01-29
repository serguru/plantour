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
    'Admins manage trip settings, participants, and assignments.',
    'Participants typically view trip details and update their own packing items.',
    'Permissions can be updated at any time by a trip admin.'
  ];

  permissionRules: PermissionRule[] = [
    {
      role: 'Trip Admin',
      canView: [
        'All trip details, participants, items, bags, and comments',
        'All packing progress and assignments'
      ],
      canEdit: [
        'Trip details (dates, name, status)',
        'Participant list and roles',
        'Item and bag assignments',
        'Shared items and comments'
      ],
      cannot: [
        'No major restrictions (full access)'
      ]
    },
    {
      role: 'Participant',
      canView: [
        'Trip overview and packing lists',
        'Items assigned to them',
        'Bags they are responsible for'
      ],
      canEdit: [
        'Packing status for their assigned items',
        'Notes or comments they created (if enabled)'
      ],
      cannot: [
        'Change trip dates or status',
        'Add/remove participants (unless explicitly granted)',
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
      recommendation: 'Allow Participants to comment and update status, but keep assignment control with Admins.'
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
      description: 'Let participants use comments for questions and updates, while keeping structural edits for admins.'
    }
  ];

  tips: string[] = [
    'Permissions can be adjusted anytime by an admin.',
    'Use Admin role sparingly to protect trip data.',
    'Participants should still be able to update their own packing status.',
    'If someone needs to add items or bags, consider temporarily promoting them.',
    'Keep roles clear to avoid confusion about responsibilities.'
  ];
}
