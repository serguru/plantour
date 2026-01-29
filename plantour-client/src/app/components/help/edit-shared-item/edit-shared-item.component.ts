import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EditStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface EditableField {
  name: string;
  description: string;
  canEdit: boolean;
}

@Component({
  selector: 'app-edit-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-shared-item.component.html',
  styleUrl: './edit-shared-item.component.scss'
})
export class EditSharedItemComponent {
  steps: EditStep[] = [
    {
      number: 1,
      title: 'Navigate to Trip Shared Items',
      description: 'Go to your trip and select the Shared Items section.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Find the Item',
      description: 'Locate the shared item you want to edit in the list.',
      icon: 'pi pi-search'
    },
    {
      number: 3,
      title: 'Open Edit Dialog',
      description: 'Click the edit icon or button next to the shared item.',
      icon: 'pi pi-pencil'
    },
    {
      number: 4,
      title: 'Update Information',
      description: 'Change the item details, description, quantity, or participant assignments.',
      icon: 'pi pi-file-edit'
    },
    {
      number: 5,
      title: 'Save Changes',
      description: 'Click Save to update the shared item.',
      icon: 'pi pi-check'
    }
  ];

  editableFields: EditableField[] = [
    {
      name: 'Item Name',
      description: 'Change the name of the shared item',
      canEdit: true
    },
    {
      name: 'Description',
      description: 'Update the description or packing instructions',
      canEdit: true
    },
    {
      name: 'Quantity',
      description: 'Modify how many items are needed',
      canEdit: true
    },
    {
      name: 'Assigned Participants',
      description: 'Change which participants are responsible for this item',
      canEdit: true
    }
  ];

  importantNotes: string[] = [
    'Only trip admins can edit shared items',
    'When you change participant assignments, those participants will see the update',
    'If a participant has already accepted or rejected the item, they should be notified of changes',
    'You can add or remove participant assignments at any time during the trip planning',
    'Changes to shared items affect all assigned participants immediately'
  ];

  scenarios: string[] = [
    'Adjusting quantities based on final trip headcount',
    'Reassigning items to different participants if plans change',
    'Clarifying instructions or adding more details about the item',
    'Correcting information that was entered incorrectly during creation'
  ];
}
