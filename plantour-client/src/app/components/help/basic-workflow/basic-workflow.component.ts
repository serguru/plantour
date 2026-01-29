import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-basic-workflow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './basic-workflow.component.html',
  styleUrls: ['./basic-workflow.component.scss']
})
export class BasicWorkflowComponent {
  content = {
    mainHeading: 'Basic Workflow',
    intro: 'Plantour keeps trip planning simple and structured. Below is a clear workflow for Admins and Participants.',
    adminWorkflow: {
      title: 'Admin Workflow',
      steps: [
        {
          title: 'Create a Trip',
          description: 'Set destination, dates, and trip details to define the planning scope.'
        },
        {
          title: 'Invite Trip Participants',
          description: 'Add travelers and assign roles so everyone knows their responsibilities.'
        },
        {
          title: 'Add Items to the Trip',
          description: 'Use template search, your own items dictionary, or direct input to add the right items to the trip.'
        },
        {
          title: 'Add Bags',
          description: 'Create bags directly or reuse bags from the dictionary for faster setup.'
        },
        {
          title: 'Create Shared Item Lists',
          description: 'Group shared items (documents, chargers, meds) into shared lists and assign responsible participants.'
        },
        {
          title: 'Track the Big Picture',
          description: 'Use the Dashboard to see the overall trip status and how it compares with other trips.'
        }
      ]
    },
    participantWorkflow: {
      title: 'Participant Workflow',
      description: 'Participants have a focused view with limited functionality: create their own item lists and bags, and update packing status.'
    },
    packingLists: {
      title: 'Automatic Packing Lists',
      description: 'Downloadable packing lists are generated automatically from your trip data, so you always have a ready-to-print summary.'
    }
  };
}
