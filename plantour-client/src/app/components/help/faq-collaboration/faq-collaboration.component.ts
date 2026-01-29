import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq-collaboration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-collaboration.component.html',
  styleUrl: './faq-collaboration.component.scss'
})
export class FaqCollaborationComponent {
  faqs: FAQItem[] = [
    {
      question: 'What is the difference between Admin and Participant?',
      answer: 'Admin (trip creator) has full control: can add/remove participants, create shared items, assign responsibilities, and manage all trip aspects. Participants can view the trip, manage their assigned items, accept/reject shared item assignments, and post comments.'
    },
    {
      question: 'How do I add participants to my trip?',
      answer: 'First, add the person to your Travelers list. Then, in your trip, navigate to Trip Participants and select "Add Participant". Choose the traveler and send them an invitation (on Company/Expedition plans). They\'ll receive an email to join.'
    },
    {
      question: 'Can participants add their own items to the trip?',
      answer: 'Participants can manage items assigned to them but cannot create new trip items. They can, however, accept shared items assigned by the admin and mark them as packed or finished. For their own items, they need their own Plantour account.'
    },
    {
      question: 'What are shared items?',
      answer: 'Shared items are items created by the admin and assigned to participants. Examples: "Tent" assigned to John, "First Aid Kit" assigned to Sarah. Participants can accept, reject, or mark shared items as packed. This coordinates "who brings what" for the group.'
    },
    {
      question: 'How do shared items work?',
      answer: 'Admin creates a shared item (e.g., "Camping Stove"), assigns it to one or more participants, and sets quantity/description. Assigned participants receive notification, can accept the responsibility, pack the item, and mark it as finished (successfully packed or failed).'
    },
    {
      question: 'Can I assign the same shared item to multiple people?',
      answer: 'Yes! Create one shared item and assign it to multiple participants. This is useful for items everyone needs (like "Trail Map - 3 copies") or when distributing responsibility (like "Snacks" assigned to multiple people).'
    },
    {
      question: 'What happens when a participant rejects a shared item?',
      answer: 'When a participant rejects a shared item, the admin is notified. The item remains in the trip but shows as rejected. The admin can reassign it to someone else or decide to handle it themselves. Communication via comments helps resolve this.'
    },
    {
      question: 'How do trip comments work?',
      answer: 'Trip comments (available on Company/Expedition plans) are messages posted by admin and participants visible to everyone in the trip. Use comments to discuss plans, coordinate pickups, ask questions, or share updates. All comments show author name and timestamp.'
    },
    {
      question: 'Can participants see each other\'s items?',
      answer: 'Participants can see shared items assigned to them and overall trip progress, but they typically cannot see other participants\' personal items unless those items are shared by the admin. The admin sees everything in the trip.'
    },
    {
      question: 'How do I remove a participant from a trip?',
      answer: 'Navigate to Trip Participants, select the participant, and click "Remove". This unassigns all their shared items and removes their access to the trip. Their personal Plantour account remains unchanged - they just can\'t access this specific trip anymore.'
    },
    {
      question: 'Can participants invite other participants?',
      answer: 'No. Only the trip admin can add or remove participants. This maintains clear trip ownership and prevents unauthorized access. If a participant wants to add someone, they should request the admin to send an invitation.'
    },
    {
      question: 'What permissions do participants have?',
      answer: 'Participants can: view the trip, see shared items assigned to them, accept/reject shared items, mark shared items as packed/finished, post trip comments, and view other participants. They cannot: create items, delete items, add/remove participants, or change trip settings.'
    },
    {
      question: 'Can I change participant permissions?',
      answer: 'Currently, participant permissions are fixed. Participants have a standard set of permissions focused on managing their assigned responsibilities. For different levels of control, participants should create their own trips with separate admin rights.'
    },
    {
      question: 'How do I coordinate with participants who don\'t have accounts?',
      answer: 'Create their items as shared items and manage them yourself. You can use trip comments to communicate or coordinate outside Plantour (email, messaging apps). When they get items ready, you mark them as packed based on your offline communication.'
    },
    {
      question: 'Can participants edit shared items assigned to them?',
      answer: 'Participants can mark shared items as accepted, rejected, packed, or finished, but they cannot edit the item details (name, quantity, description). Only the admin can modify shared item properties. Participants can add comments to request changes.'
    },
    {
      question: 'How do I know if participants have packed their shared items?',
      answer: 'The trip view shows packing status for all shared items. When participants mark items as "finished", you\'ll see the status update. The overall trip progress percentage includes shared items, giving you visibility into group packing completion.'
    }
  ];
}
