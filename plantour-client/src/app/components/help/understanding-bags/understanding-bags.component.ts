import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContentSection {
  title: string;
  paragraphs: string[];
  list?: string[];
  subsections?: {
    title: string;
    paragraphs: string[];
    list?: string[];
  }[];
}

@Component({
  selector: 'app-understanding-bags',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-bags.component.html',
  styleUrls: ['./understanding-bags.component.scss']
})
export class UnderstandingBagsComponent {
  mainHeading = 'Understanding Bags in Plantour';
  intro = 'Bags (also called "Packages") are containers that help you organize your items for trips. Whether it\'s a suitcase, backpack, or carry-on bag, Plantour helps you track what\'s packed where, making it easy to find things during your journey and ensuring nothing gets left behind.';

  sections: ContentSection[] = [
    {
      title: 'What Are Bags?',
      paragraphs: [
        'In Plantour, "Bags" (sometimes referred to as "Packages" or "Luggage") are physical containers you use to pack and transport your items during a trip. Each bag represents a real-world container like a suitcase, backpack, duffel bag, or even a smaller pouch.',
        'Bags serve as organizational units that group related items together. By assigning items to specific bags, you always know exactly where everything is packed.'
      ],
      list: [
        'Each bag has a unique name for easy identification',
        'Bags can contain multiple items from your master items list',
        'You can assign different bags to different travelers',
        'Track which traveler is responsible for carrying each bag',
        'Add notes and details to each bag for additional context'
      ]
    },
    {
      title: 'Why Use Bags?',
      paragraphs: [
        'Organizing your packing with bags provides several key benefits:'
      ],
      subsections: [
        {
          title: 'Quick Location',
          paragraphs: [
            'Need your phone charger in the middle of a road trip? Instead of searching through all your luggage, Plantour tells you exactly which bag contains it.'
          ]
        },
        {
          title: 'Efficient Packing',
          paragraphs: [
            'Plan ahead by deciding what goes in which bag. This helps distribute weight evenly and ensures frequently needed items are in accessible bags.'
          ]
        },
        {
          title: 'Group Coordination',
          paragraphs: [
            'When traveling with others, assign bags to specific travelers. Everyone knows what they\'re responsible for carrying and where their items are packed.'
          ]
        },
        {
          title: 'Unpacking Made Easy',
          paragraphs: [
            'At your destination, you can quickly locate essentials without unpacking everything. Only open the bags you need.'
          ]
        }
      ]
    },
    {
      title: 'Types of Bags You Can Create',
      paragraphs: [
        'Plantour is flexible about bag types. You can create bags for any container you\'re actually using:'
      ],
      list: [
        'Large checked suitcases ("Main Suitcase", "Red Luggage")',
        'Carry-on bags ("Cabin Bag", "Backpack")',
        'Personal items ("Purse", "Laptop Bag")',
        'Specialty containers ("Toiletries Kit", "Camera Bag")',
        'Shared bags ("Family Cooler", "Kids\' Toys Bag")',
        'Vehicle storage ("Car Trunk Items", "Bike Panniers")'
      ]
    },
    {
      title: 'Bag Properties',
      paragraphs: [
        'Each bag in Plantour has several properties that help you manage it effectively:'
      ],
      subsections: [
        {
          title: 'Name',
          paragraphs: [
            'A unique identifier for the bag. Use descriptive names like "John\'s Backpack" or "Suitcase #2" to make identification easy.'
          ]
        },
        {
          title: 'Owner/Traveler',
          paragraphs: [
            'Which traveler owns or is responsible for this bag. This is especially useful for group trips.'
          ]
        },
        {
          title: 'Responsible Person',
          paragraphs: [
            'Sometimes the owner isn\'t the person carrying the bag. For example, a parent might be responsible for a child\'s bag. You can assign a different traveler as responsible.'
          ]
        },
        {
          title: 'Contents',
          paragraphs: [
            'The list of items currently packed in this bag. You can easily add or remove items as you pack.'
          ]
        },
        {
          title: 'Notes',
          paragraphs: [
            'Additional information like "Check-in luggage only" or "Keep with me at all times".'
          ]
        },
        {
          title: 'Weight (Optional)',
          paragraphs: [
            'For some trips, tracking total bag weight matters (airline limits, hiking trips). Plantour can calculate this based on item weights.'
          ]
        }
      ]
    },
    {
      title: 'Bags vs. Items',
      paragraphs: [
        'Understanding the relationship between bags and items is key to using Plantour effectively:'
      ],
      list: [
        'Items are individual objects you want to bring (shirt, toothbrush, passport)',
        'Bags are containers that hold multiple items',
        'Items exist independently of bags - you create a master list of items',
        'When packing for a trip, you assign items to bags',
        'The same item type can be added to different bags on different trips',
        'Items can be marked as packed without being in a specific bag ("carrying it by hand", "wearing it")'
      ]
    },
    {
      title: 'Nested Bags and Organization',
      paragraphs: [
        'In some cases, you might have bags within bags - like a toiletries pouch inside a suitcase, or packing cubes. Plantour supports this nested organization:',
        'You can create smaller "bags" that represent pouches, cubes, or organizers within larger bags. Add notes to indicate the parent bag, or use naming conventions like "Main Suitcase > Toiletries" to show the hierarchy.'
      ]
    },
    {
      title: 'Real-World Example',
      paragraphs: [
        'Imagine a weekend family trip with two adults and one child:'
      ],
      list: [
        'Bag: "Family Suitcase" - Contains shared clothing, owned by Mom, responsible: Mom',
        'Bag: "Dad\'s Backpack" - Contains Dad\'s laptop and documents, owned by Dad',
        'Bag: "Emma\'s Backpack" - Contains Emma\'s toys and snacks, owned by Emma, responsible: Mom',
        'Bag: "Cooler" - Contains food and drinks, owned by Family, responsible: Dad',
        'Bag: "Mom\'s Purse" - Contains important documents and first aid, owned by Mom'
      ],
      subsections: [
        {
          title: 'During the Trip',
          paragraphs: [
            'When Emma wants her stuffed animal, you check Plantour and see it\'s in "Emma\'s Backpack". When you need passports, you know they\'re in "Mom\'s Purse". No digging through all the luggage required!'
          ]
        }
      ]
    }
  ];
}
