import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-who-plantour-for',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './who-plantour-for.component.html',
  styleUrls: ['./who-plantour-for.component.scss']
})
export class WhoPlantourForComponent {
  content = {
    mainHeading: 'Who is Plantour For?',
    intro: 'Plantour works equally well for solo travelers and large groups. It keeps everyone organized with shared lists, clear ownership, and packing progress tracking.',
    audiences: [
      {
        icon: 'pi pi-user',
        title: 'Solo Travelers',
        description: 'Create trips quickly, build packing lists, and keep everything organized without any complicated setup.'
      },
      {
        icon: 'pi pi-users',
        title: 'Families & Friends',
        description: 'Plan trips together with shared item lists, assign responsibility for each item, and track progress as the group packs.'
      },
      {
        icon: 'pi pi-briefcase',
        title: 'Large Groups',
        description: 'Coordinate many people across multiple bags, keep shared items visible, and make sure every task is completed before departure.'
      }
    ],
    collaboration: {
      title: 'Shared Lists & Responsibility',
      points: [
        'Create shared item lists for group essentials (medicine, chargers, documents, snacks).',
        'Assign a person responsible for each shared item.',
        'Track whether the item is completed (packed) to avoid last-minute surprises.'
      ]
    },
    outcomes: {
      title: 'Why It Works',
      items: [
        'Everyone knows what they own and what is still missing.',
        'Shared items are never duplicated or forgotten.',
        'Packing progress is visible to the entire group.'
      ]
    }
  };
}
