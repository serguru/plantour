import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  note?: string;
}

interface EditableField {
  field: string;
  description: string;
  tips?: string[];
}

interface Issue {
  problem: string;
  solution: string;
}

@Component({
  selector: 'app-edit-bag-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-bag-details.component.html',
  styleUrls: ['./edit-bag-details.component.scss']
})
export class EditBagDetailsComponent {
  mainHeading = 'How to Edit Bag Details';
  intro = 'As your trip evolves, you may need to update bag information - rename a bag, change who\'s carrying it, or add clarifying notes. Plantour makes it easy to modify bag details at any time without affecting the items packed inside.';

  steps: Step[] = [
    {
      stepNumber: 1,
      title: 'Navigate to Your Bags List',
      description: 'Go to the trip and open the bags section where all your bags are displayed.',
      details: [
        'Select your trip from the trips list',
        'Find the "Bags", "Packages", or "Luggage" section',
        'You\'ll see a list or grid of all bags in this trip'
      ]
    },
    {
      stepNumber: 2,
      title: 'Locate the Bag to Edit',
      description: 'Find the specific bag you want to modify in your bags list.',
      details: [
        'Scroll through your bags if you have many',
        'Use search or filter if available',
        'Bags typically show their name, owner, and item count'
      ]
    },
    {
      stepNumber: 3,
      title: 'Open Edit Mode',
      description: 'Access the bag\'s edit interface.',
      details: [
        'Look for an "Edit" button, pencil icon, or three-dot menu next to the bag',
        'Click on the edit option',
        'Alternatively, clicking on the bag itself might open details with an edit option'
      ],
      note: 'The exact location of the edit button depends on your interface layout, but it\'s typically near the bag name.'
    },
    {
      stepNumber: 4,
      title: 'Modify Bag Details',
      description: 'Update any of the bag\'s properties in the edit form.',
      details: [
        'Change the bag name if needed',
        'Update the owner/traveler assignment',
        'Modify who\'s responsible for carrying it',
        'Add, edit, or remove notes',
        'Update any other available fields'
      ]
    },
    {
      stepNumber: 5,
      title: 'Save Your Changes',
      description: 'Confirm and save the modifications you\'ve made.',
      details: [
        'Click "Save", "Update", or "Confirm"',
        'Your changes will be applied immediately',
        'The bag list will update to reflect the new information'
      ],
      note: 'If you change your mind, look for a "Cancel" button to discard changes without saving.'
    }
  ];

  editableFields: EditableField[] = [
    {
      field: 'Bag Name',
      description: 'Change the name to something more descriptive or correct a typo.',
      tips: [
        'The new name must still be unique within your trip',
        'Items inside the bag are not affected by name changes',
        'Consider renaming if the bag\'s purpose has changed'
      ]
    },
    {
      field: 'Owner/Traveler',
      description: 'Reassign the bag to a different traveler if plans change.',
      tips: [
        'All items in the bag will now be associated with the new owner',
        'Useful when redistributing luggage among group members',
        'The traveler must be a participant in the trip'
      ]
    },
    {
      field: 'Responsible Person',
      description: 'Change who\'s responsible for carrying or managing the bag.',
      tips: [
        'Defaults to the owner if left empty',
        'Helpful when someone else takes over bag duty',
        'Great for managing children\'s luggage in family trips'
      ]
    },
    {
      field: 'Notes',
      description: 'Update or add information about the bag.',
      tips: [
        'Add handling instructions as you learn what works',
        'Note if the bag is checked-in vs. carry-on',
        'Include identifying details for retrieval'
      ]
    }
  ];

  commonScenarios: { scenario: string; action: string }[] = [
    {
      scenario: 'You realize two travelers need to swap bags',
      action: 'Edit each bag to change the owner field. The items inside move with the bag ownership.'
    },
    {
      scenario: 'A bag name is too vague and causing confusion',
      action: 'Edit the bag and give it a more specific name like "Sarah\'s Red Suitcase" instead of just "Suitcase".'
    },
    {
      scenario: 'Plans changed and someone else is now carrying a bag',
      action: 'Update the "Responsible Person" field without changing ownership.'
    },
    {
      scenario: 'You want to add color or identification details',
      action: 'Add this information to the notes field: "Navy blue with yellow tag".'
    },
    {
      scenario: 'You accidentally created a duplicate bag',
      action: 'Edit one of them to have a distinct name, or delete the duplicate if it\'s empty.'
    }
  ];

  tips: string[] = [
    'Edit bags as soon as you notice something needs changing - don\'t wait until packing day.',
    'If you rename a bag, items already packed in it remain associated with it automatically.',
    'Check the traveler list before changing ownership - ensure the new owner is in the trip.',
    'Use notes liberally to capture details you might forget later.',
    'When redistributing bags among travelers, edit ownership rather than moving items individually.',
    'Keep bag names consistent with their real-world counterparts to avoid confusion during travel.'
  ];

  commonIssues: Issue[] = [
    {
      problem: 'I can\'t find the edit button',
      solution: 'Try right-clicking on the bag or looking for a three-dot (⋮) menu icon. Some interfaces require clicking into the bag details first before showing edit options.'
    },
    {
      problem: 'I get an error: "Bag name already exists"',
      solution: 'Another bag in this trip already has that name. Choose a different, unique name. Try adding numbers or descriptions to distinguish them.'
    },
    {
      problem: 'The traveler I want isn\'t in the owner dropdown',
      solution: 'That person needs to be added as a participant in the trip first. Go to trip settings and add them to the travelers list.'
    },
    {
      problem: 'My changes aren\'t saving',
      solution: 'Check for validation errors highlighted in the form. Ensure all required fields are filled. If problems persist, try refreshing the page and editing again.'
    },
    {
      problem: 'I edited the wrong bag by accident',
      solution: 'Immediately go back to that bag and change it back to the original values. Or use the undo feature if available.'
    }
  ];

  warningNote = 'Important: Editing a bag\'s details does NOT affect the items packed inside it. The items stay in the bag unless you explicitly move them. However, changing the bag owner will associate those items with the new owner.';
}
