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
  selector: 'app-understanding-travelers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-travelers.component.html',
  styleUrls: ['./understanding-travelers.component.scss']
})
export class UnderstandingTravelersComponent {
  mainHeading = 'Understanding Travelers in Plantour';
  intro = 'The Travelers module is your central hub for managing all the people involved in your trips. Whether you\'re planning a solo adventure or coordinating a large group, understanding how travelers work in Plantour will help you organize efficiently and collaborate seamlessly.';

  sections: ContentSection[] = [
    {
      title: 'What Are Travelers?',
      paragraphs: [
        'In Plantour, "Travelers" refers to any person who is associated with one or more trips. This includes yourself, family members, friends, colleagues, or anyone else who will be participating in a trip you\'re planning.',
        'Travelers are stored in your personal Travelers module, which acts as your contact list for all trip-related activities. Once you add a traveler, you can quickly assign them to any trip without re-entering their information.'
      ],
      subsections: [
        {
          title: 'Key Characteristics',
          paragraphs: [],
          list: [
            'Each traveler has a name, optional email, and optional phone number',
            'Travelers can be assigned to multiple trips',
            'You can track what items each traveler is responsible for',
            'Travelers persist across trips - add once, use everywhere',
            'You control who sees your travelers list (it\'s private to you)'
          ]
        },
        {
          title: 'Who Can Be a Traveler?',
          paragraphs: [
            'Anyone can be added as a traveler in your list:'
          ],
          list: [
            'Yourself (automatically added when you create your account)',
            'Family members and friends',
            'Travel companions',
            'Children or dependents',
            'Tour group members',
            'Business colleagues for work trips',
            'Even pets if you want to track their items!'
          ]
        }
      ]
    },
    {
      title: 'Travelers vs. Participants: What\'s the Difference?',
      paragraphs: [
        'This is an important distinction that often confuses new users. In Plantour, "Travelers" and "Participants" are different concepts:'
      ],
      subsections: [
        {
          title: 'Travelers',
          paragraphs: [
            'Travelers are entries in YOUR personal contact list within Plantour. They represent people you might travel with, but they don\'t necessarily have Plantour accounts themselves.'
          ],
          list: [
            'Stored in your Travelers module',
            'Can be anyone - they don\'t need a Plantour account',
            'You can assign them to trips and items',
            'They won\'t see the trip unless you also invite them as Participants',
            'You manually enter their information',
            'Private to your account'
          ]
        },
        {
          title: 'Participants',
          paragraphs: [
            'Participants are actual Plantour users who have been invited to collaborate on a specific trip. They have access to the trip and can interact with it.'
          ],
          list: [
            'Invited via email to specific trips',
            'Receive an invitation link or access code',
            'Can sign in to Plantour and see the trip',
            'Can add their own items, check off tasks, update status',
            'Can see shared items and collaborate in real-time',
            'May or may not be listed in your Travelers module'
          ]
        },
        {
          title: 'The Connection',
          paragraphs: [
            'You can have a traveler who is ALSO a participant on the same trip:',
            'Example: You add "Sarah" as a traveler in your Travelers module. Then you create a trip and assign "Sarah" (the traveler) to various items. Later, you invite the real Sarah via email as a Participant so she can access the trip and see what she needs to pack. Now Sarah exists in both roles - as a traveler entry (so you can assign items to her) and as a participant (so she can access the trip).'
          ]
        }
      ]
    },
    {
      title: 'Why Use the Travelers Module?',
      paragraphs: [
        'The Travelers module provides several benefits for trip planning and organization:'
      ],
      subsections: [
        {
          title: 'Efficiency',
          paragraphs: [],
          list: [
            'Add a traveler once, use them across multiple trips',
            'No need to retype names or contact information',
            'Quickly populate new trips with your usual travel companions',
            'Maintain a consistent spelling of names across all trips'
          ]
        },
        {
          title: 'Organization',
          paragraphs: [],
          list: [
            'See all your frequent travel companions in one place',
            'Track who you\'ve traveled with on past trips',
            'Organize family members, friend groups, or work teams',
            'Filter and search through your traveler list'
          ]
        },
        {
          title: 'Accountability',
          paragraphs: [],
          list: [
            'Assign specific items to specific travelers',
            'Track who is responsible for bringing what',
            'Identify who has completed their packing tasks',
            'Generate per-traveler packing lists'
          ]
        },
        {
          title: 'Planning Without Inviting',
          paragraphs: [
            'You can plan and organize a trip for other people without giving them access to Plantour. Simply add them as travelers, assign items, and manage everything yourself. This is perfect for:'
          ],
          list: [
            'Planning trips for children who don\'t need system access',
            'Organizing group trips where only you need to manage logistics',
            'Creating packing lists for others who prefer paper or PDF exports',
            'Maintaining control over trip planning while delegating responsibilities'
          ]
        }
      ]
    },
    {
      title: 'Common Travelers Workflows',
      paragraphs: [
        'Here are typical ways people use the Travelers module in their trip planning:'
      ],
      subsections: [
        {
          title: 'Solo Traveler',
          paragraphs: [
            'Even if you travel alone, you\'ll have yourself as a traveler. This allows you to:',
            'Assign all items to yourself so you have clear accountability. Generate personalized packing lists. Track your own progress as you prepare for trips.'
          ]
        },
        {
          title: 'Family Trip',
          paragraphs: [
            'Add all family members as travelers:'
          ],
          list: [
            'Create travelers for each family member (Mom, Dad, Kids)',
            'Assign age-appropriate items to each person',
            'Track who has packed their bags',
            'If needed, invite adult family members as Participants so they can manage their own lists',
            'Keep children as travelers-only and manage their items yourself'
          ]
        },
        {
          title: 'Group Trip',
          paragraphs: [
            'For trips with friends or colleagues:'
          ],
          list: [
            'Add all group members as travelers',
            'Assign shared responsibilities (e.g., "John brings tent", "Sarah brings cooking supplies")',
            'Invite everyone as Participants so they can see assignments and update status',
            'Use shared items lists to track communal gear',
            'Coordinate who brings what to avoid duplication'
          ]
        },
        {
          title: 'Multi-Trip Planning',
          paragraphs: [
            'If you take regular trips with the same people:'
          ],
          list: [
            'Add your regular travel companions once',
            'Reuse them across multiple trips',
            'Build a history of trips with specific travelers',
            'Quickly create new trips by assigning existing travelers'
          ]
        }
      ]
    },
    {
      title: 'Traveler Information Fields',
      paragraphs: [
        'When you add or edit a traveler, you can provide the following information:'
      ],
      subsections: [
        {
          title: 'Required Fields',
          paragraphs: [],
          list: [
            'Name - The traveler\'s first and last name (or nickname)',
            'This is the only required field'
          ]
        },
        {
          title: 'Optional Fields',
          paragraphs: [],
          list: [
            'Email - Useful if you plan to invite them as a Participant',
            'Phone - For contact purposes or coordination',
            'Notes - Any additional information (age, special needs, preferences)',
            'Avatar/Photo - Visual identification in lists and assignments'
          ]
        },
        {
          title: 'Why Email Matters',
          paragraphs: [
            'If you add an email address to a traveler, that email becomes the bridge between your traveler entry and a potential participant invitation:',
            'When you invite someone as a Participant, Plantour will check if that email matches any traveler in your list. If there\'s a match, the system can automatically link the traveler entry with the participant account, maintaining consistency.'
          ]
        }
      ]
    },
    {
      title: 'Travelers and Item Assignment',
      paragraphs: [
        'One of the most powerful features of travelers is the ability to assign items to them. This creates clear responsibility and accountability.'
      ],
      subsections: [
        {
          title: 'How Assignment Works',
          paragraphs: [],
          list: [
            'When creating or editing an item, select one or more travelers',
            'The item appears on that traveler\'s packing list',
            'Items can be assigned to multiple travelers (shared responsibility)',
            'Travelers can see their assigned items if they\'re also Participants',
            'You can filter items by traveler to see what each person needs to pack'
          ]
        },
        {
          title: 'Assignment Strategies',
          paragraphs: [
            'Different strategies work for different trip types:'
          ],
          list: [
            'Individual Assignment - Each person has their own items (clothes, toiletries)',
            'Shared Assignment - Multiple people assigned to one item (rent car, book hotel)',
            'No Assignment - Leave items unassigned for general trip items',
            'Leader Assignment - Assign all shared items to the trip organizer'
          ]
        },
        {
          title: 'Visual Indicators',
          paragraphs: [
            'In the Items module, you\'ll see:',
            'Traveler names or avatars next to assigned items. Color-coding or badges showing completion status. Filters to show only one traveler\'s items. Counts of how many items each traveler is responsible for.'
          ]
        }
      ]
    },
    {
      title: 'Managing Your Travelers List',
      paragraphs: [
        'As you use Plantour, your travelers list will grow. Here are tips for keeping it organized:'
      ],
      subsections: [
        {
          title: 'Adding Travelers',
          paragraphs: [],
          list: [
            'Add travelers before or during trip creation',
            'Import from contacts if supported by your device',
            'Add them on-the-fly when assigning items',
            'Bulk-add for large group trips'
          ]
        },
        {
          title: 'Editing Travelers',
          paragraphs: [],
          list: [
            'Update contact information when it changes',
            'Changes apply to all trips using that traveler',
            'Edit from the Travelers module or within a trip',
            'Add notes or preferences for future reference'
          ]
        },
        {
          title: 'Deleting Travelers',
          paragraphs: [
            'You can delete travelers you no longer need, but be aware:'
          ],
          list: [
            'Deleting removes them from ALL trips (past and future)',
            'Items assigned to that traveler become unassigned',
            'This action cannot be undone',
            'Consider archiving instead if you might need them later',
            'You cannot delete yourself'
          ]
        },
        {
          title: 'Searching and Filtering',
          paragraphs: [],
          list: [
            'Search by name to find specific travelers',
            'Filter by trips they\'re assigned to',
            'Sort alphabetically or by frequency of use',
            'View travelers with missing information (e.g., no email)'
          ]
        }
      ]
    },
    {
      title: 'Best Practices for Using Travelers',
      paragraphs: [
        'Follow these tips to get the most out of the Travelers module:'
      ],
      subsections: [
        {
          title: 'Setup',
          paragraphs: [],
          list: [
            'Add yourself first with complete information',
            'Include email addresses for anyone you might invite as Participants',
            'Use consistent naming (e.g., always "Sarah Jones" not sometimes "Sarah J.")',
            'Add notes for special considerations (dietary restrictions, mobility issues)'
          ]
        },
        {
          title: 'Organization',
          paragraphs: [],
          list: [
            'Create travelers before starting trip planning',
            'Group family members with similar last names for easy identification',
            'Use nicknames if multiple people share the same first name',
            'Keep your list current - remove old travelers you won\'t use again'
          ]
        },
        {
          title: 'Assignment',
          paragraphs: [],
          list: [
            'Assign items when you create them, not as an afterthought',
            'Be specific - "John\'s jacket" is clearer than "jacket" assigned to John',
            'Review assignments before finalizing the trip',
            'Balance the load - don\'t assign everything to one person'
          ]
        },
        {
          title: 'Collaboration',
          paragraphs: [],
          list: [
            'Invite travelers as Participants if they need access',
            'Communicate about assignments outside Plantour if needed',
            'Use shared items for group responsibilities',
            'Review together if possible to confirm assignments make sense'
          ]
        }
      ]
    },
    {
      title: 'Travelers and Trip Collaboration',
      paragraphs: [
        'Understanding how travelers relate to actual trip collaboration:'
      ],
      subsections: [
        {
          title: 'When to Add as Traveler Only',
          paragraphs: [],
          list: [
            'Children or dependents who won\'t use Plantour themselves',
            'People you\'re planning for who don\'t need system access',
            'Placeholder names for spots you haven\'t filled yet',
            'People who prefer paper lists (you\'ll export PDFs for them)'
          ]
        },
        {
          title: 'When to Invite as Participant Too',
          paragraphs: [],
          list: [
            'Adults who want to manage their own packing',
            'Trip co-organizers who need full access',
            'People who will add their own items',
            'Anyone who needs real-time visibility into the trip'
          ]
        },
        {
          title: 'The Hybrid Approach',
          paragraphs: [
            'Many users combine both approaches:',
            'Add everyone as travelers first for assignment purposes. Invite only those who need access as Participants. This gives you full control over planning while enabling selective collaboration.'
          ]
        }
      ]
    },
    {
      title: 'Common Questions About Travelers',
      paragraphs: [],
      subsections: [
        {
          title: 'Can travelers see my trips?',
          paragraphs: [
            'No, not unless you also invite them as Participants. Simply adding someone as a traveler in your module does not give them any access to your trips or data. It\'s just your personal contact list.'
          ]
        },
        {
          title: 'Do I need to add email addresses?',
          paragraphs: [
            'No, emails are optional. However, including emails makes it easier if you later decide to invite them as Participants, and helps Plantour link the traveler entry with their participant account.'
          ]
        },
        {
          title: 'Can I use the same traveler across multiple trips?',
          paragraphs: [
            'Yes! That\'s one of the main benefits. Add a traveler once, then assign them to as many trips as needed. Their information stays consistent across all trips.'
          ]
        },
        {
          title: 'What happens if I edit a traveler\'s information?',
          paragraphs: [
            'The changes apply everywhere that traveler appears - past, present, and future trips. If you change "John Smith" to "John S. Smith", it updates in all trips where he\'s assigned.'
          ]
        },
        {
          title: 'Can other users see my travelers?',
          paragraphs: [
            'No, your Travelers module is private. Only you can see your travelers list. However, if you invite someone as a Participant to a trip, they\'ll see the names of travelers assigned to items on that trip (because they need to know "who\'s bringing what").'
          ]
        }
      ]
    }
  ];
}
