import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DeleteStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface DeleteConsideration {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-delete-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-shared-item.component.html',
  styleUrl: './delete-shared-item.component.scss'
})
export class DeleteSharedItemComponent {
  steps: DeleteStep[] = [
    {
      number: 1,
      title: 'Navigate to Trip Shared Items',
      description: 'Go to your trip and select the Shared Items section.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Find the Item',
      description: 'Locate the shared item you want to delete in the list.',
      icon: 'pi pi-search'
    },
    {
      number: 3,
      title: 'Click Delete',
      description: 'Click the delete or trash icon next to the shared item.',
      icon: 'pi pi-trash'
    },
    {
      number: 4,
      title: 'Confirm Deletion',
      description: 'Confirm that you want to permanently delete the shared item.',
      icon: 'pi pi-exclamation-triangle'
    },
    {
      number: 5,
      title: 'Item Deleted',
      description: 'The shared item is permanently removed from the trip.',
      icon: 'pi pi-check'
    }
  ];

  considerations: DeleteConsideration[] = [
    {
      title: 'Permanent Action',
      description: 'Deleting a shared item is permanent and cannot be undone.',
      icon: 'pi pi-exclamation-circle'
    },
    {
      title: 'Participants Notified',
      description: 'Participants who have assignments for this item will see it removed.',
      icon: 'pi pi-bell'
    },
    {
      title: 'Assignment Data Lost',
      description: 'Any acceptance, rejection, or completion status for this item will be lost.',
      icon: 'pi pi-info-circle'
    },
    {
      title: 'Consider Edit Instead',
      description: 'If the item details are wrong, editing might be better than deleting and recreating.',
      icon: 'pi pi-pencil'
    }
  ];

  alternativesTitle = 'Alternatives to Deletion';
  alternatives: string[] = [
    'Edit the shared item if only details need changing',
    'Unassign participants instead of deleting if the item is no longer needed by some people',
    'Mark the item as low priority if it becomes optional for the trip'
  ];

  tips: string[] = [
    'Only trip admins can delete shared items',
    'Think carefully before deleting - is editing a better option?',
    'If participants have accepted the assignment, let them know about the deletion',
    'Deletion removes all assignment history and status information',
    'You cannot recover a deleted shared item'
  ];
}
