import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FinishStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface FinishStatus {
  status: string;
  icon: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-finish-shared-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finish-shared-item.component.html',
  styleUrl: './finish-shared-item.component.scss'
})
export class FinishSharedItemComponent {
  steps: FinishStep[] = [
    {
      number: 1,
      title: 'Pack the Item',
      description: 'Gather and pack the shared item according to trip requirements.',
      icon: 'pi pi-box'
    },
    {
      number: 2,
      title: 'Navigate to Accepted Items',
      description: 'Go to your assigned shared items to find the one you just packed.',
      icon: 'pi pi-list'
    },
    {
      number: 3,
      title: 'Mark as Finished',
      description: 'Click the "Finish" or "Complete" button next to the item.',
      icon: 'pi pi-pencil'
    },
    {
      number: 4,
      title: 'Select Finish Status',
      description: 'Choose whether you successfully packed the item or encountered an issue.',
      icon: 'pi pi-check-circle'
    },
    {
      number: 5,
      title: 'Add Optional Notes',
      description: 'Include any relevant information about the packed item or issues encountered.',
      icon: 'pi pi-comment'
    },
    {
      number: 6,
      title: 'Confirm Finish',
      description: 'Submit the finish status. The admin will see that you have completed the packing.',
      icon: 'pi pi-check'
    }
  ];

  statuses: FinishStatus[] = [
    {
      status: 'Success',
      icon: 'pi pi-check-circle',
      description: 'Successfully packed the item and it is ready for the trip.',
      color: 'green'
    },
    {
      status: 'Issue/Failure',
      icon: 'pi pi-exclamation-circle',
      description: 'Encountered a problem while packing (item unavailable, damage, etc.).',
      color: 'orange'
    }
  ];

  successChecklist: string[] = [
    'Item is properly packed and ready for travel',
    'Item is labeled if necessary',
    'Item meets any special requirements mentioned',
    'Item is safely stored and won\'t shift during transport',
    'You have documented or photographed if needed for shared items'
  ];

  issueExamples: string[] = [
    'Item was unavailable or could not be obtained',
    'Item was damaged or defective',
    'Item was lost or misplaced',
    'Unable to pack due to space/capacity constraints',
    'Item did not meet specified requirements'
  ];

  tips: string[] = [
    'Wait until you have actually packed the item before marking it finished',
    'Be honest about the status - success or issue',
    'Include relevant notes to help the admin understand any problems',
    'If an issue occurred, contact the admin to discuss alternatives',
    'Take a photo or note details if the item will need to be verified at the trip',
    'Finishing the item notifies other team members and the admin'
  ];

  teamNotification: string[] = [
    'Your trip admin will see that you completed the assignment',
    'Other participants may be notified about the shared item status',
    'If you mark an issue, the admin may reach out to discuss solutions',
    'Your reliability helps the team trust and depend on you for future trips'
  ];
}
