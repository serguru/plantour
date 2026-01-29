import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-to-plantour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-to-plantour.component.html',
  styleUrls: ['./welcome-to-plantour.component.scss']
})
export class WelcomeToPlantourComponent {
  welcomeContent = {
    mainHeading: 'Welcome to Plantour! 🌍✈️',
    intro: 'Plantour is your complete travel planning companion. Whether you\'re organizing a weekend getaway or a month-long adventure, Plantour helps you plan every detail, stay organized, and enjoy your trip with confidence.',

    whatYouWillLearn: {
      heading: 'What You\'ll Learn in This Guide',
      items: [
        'Plan your trip - Create a trip and add basic information',
        'Organize travelers - Add family and friends to your trip',
        'Pack smarter - Create packing lists and track what\'s packed',
        'Collaborate easily - Share your trip with travel companions',
        'Stay on track - Use notes and to-dos during your trip'
      ]
    },

    whyUseplantour: {
      heading: 'Why Use Plantour?',
      subheading: 'Key Benefits',
      benefits: [
        {
          icon: '📋',
          title: 'All-in-One Trip Organization',
          description: 'Keep all trip information in one place. Stop juggling spreadsheets, notes, and emails. Find anything instantly with search'
        },
        {
          icon: '👥',
          title: 'Easy Collaboration',
          description: 'Invite family and friends to plan together. Everyone sees updates in real-time. No more "I thought you were bringing that!"'
        },
        {
          icon: '🧳',
          title: 'Smart Packing Lists',
          description: 'Never forget anything important. Organize items by category. Track who packed what. Print labels for luggage'
        },
        {
          icon: '💡',
          title: 'Simplified Planning',
          description: 'Create new trips from scratch or use templates. Copy successful trips from your past travels. Plan step-by-step without feeling overwhelmed'
        },
        {
          icon: '📱',
          title: 'Works Anywhere',
          description: 'Use on your computer at home. Access on your phone during travel. Works online and offline (offline features available in mobile apps)'
        },
        {
          icon: '🆓',
          title: 'Try Before You Commit',
          description: 'Use Guest Mode for 7 days free - no registration needed. Explore all features with sample data. Create your account when you\'re ready'
        }
      ]
    },

    gettingStarted: {
      heading: 'Getting Started - Choose Your Path',

      option1: {
        title: 'Option 1: Try Guest Mode First (Recommended)',
        description: 'Perfect if you want to explore without creating an account.',
        steps: [
          'Look for the "Get Started" section in the Help menu',
          'Click on "Start Test Mode" button',
          'You\'ll be logged in as a test user with sample trip data',
          'Explore features for 7 days',
          'Upgrade to a full account anytime'
        ],
        whatYouWillSee: {
          title: 'What You\'ll See in Guest Mode:',
          items: [
            'Sample trip: "Weekend in Las Vegas"',
            'Pre-loaded travelers with different roles',
            'Packing items to explore',
            'A bag to organize items into',
            'Full access to all features (limited to 5 items max)'
          ]
        },
        proTip: 'Use the test data to understand how items organize into bags, and how participants collaborate.'
      },

      option2: {
        title: 'Option 2: Create Your Account Now',
        description: 'Ready to start planning your real trip?',
        steps: [
          'Click the login area (usually top-right) - link#1',
          'Click "Create Account"',
          'Enter your email and choose a password',
          'Verify your email address',
          'You\'re ready to start!'
        ],
        whatHappensNext: {
          title: 'What Happens Next:',
          items: [
            'You\'ll see your dashboard with no trips yet',
            'Click "Create New Trip" to start your first trip',
            'Add trip details, travelers, and items',
            'Start organizing!'
          ]
        }
      }
    },

    basicWorkflow: {
      heading: 'How Plantour Works - The Basic Workflow',

      step1: {
        title: 'Step 1: Create a Trip',
        subtitle: 'A "Trip" is your main project. It contains everything related to one journey.',
        whatGoesIn: {
          title: 'What goes in a trip:',
          items: [
            'Trip name and dates',
            'Participants (family, friends, colleagues)',
            'Packing lists and items',
            'Bags and luggage',
            'Notes and comments',
            'Expenses and budgets',
            'To-do lists'
          ]
        },
        howToCreate: {
          title: 'How to create:',
          items: [
            'From your dashboard, click "Create New Trip"',
            'Give it a name (example: "Summer Vacation 2025")',
            'Set start and end dates',
            'Add a description (optional)',
            'Click "Create"'
          ]
        }
      },

      step2: {
        title: 'Step 2: Add Travelers',
        subtitle: '"Travelers" are the people involved in your trip.',
        whyAdd: {
          title: 'Why add travelers:',
          items: [
            'Track who needs to pack what',
            'Assign responsibilities',
            'Share the trip for collaboration',
            'Know who\'s bringing which bag'
          ]
        },
        howToAdd: {
          title: 'How to add:',
          items: [
            'From your trip, go to "Travelers" - link#2',
            'Click "Add Traveler"',
            'Enter name, age, relationship, contact info',
            'Click "Save"'
          ]
        },
        roles: {
          title: 'Important Roles:',
          items: [
            'Admin: Can manage all trip details and invite others',
            'Participant: Can see trip details, pack items, and add comments'
          ]
        }
      },

      step3: {
        title: 'Step 3: Create Packing Items',
        subtitle: '"Items" are things you need to bring: clothes, documents, electronics, etc.',
        whyOrganize: {
          title: 'Why organize items:',
          items: [
            'Never forget essential documents',
            'Pack intentionally, not frantically',
            'Reuse packing lists from past trips',
            'Know exactly what you\'re bringing'
          ]
        },
        howToAdd: {
          title: 'How to add items:',
          steps: [
            'From your trip, go to "Items" - link#3',
            'Click "Add Item"',
            'Enter item name (example: "Passport")',
            'Choose a category (Clothing, Documents, Electronics, etc.)',
            'Add notes if needed (example: "Backup passport copy")',
            'Click "Save"'
          ]
        },
        makeReusable: {
          title: 'Making Items Reusable:',
          items: [
            'Create items once, use them on every trip',
            'Save time on future packing lists',
            'Add items to your library for quick access'
          ]
        }
      },

      step4: {
        title: 'Step 4: Organize Items into Bags',
        subtitle: '"Bags" represent your luggage. Items go into bags for packing.',
        whyUseBags: {
          title: 'Why use bags:',
          items: [
            'Know what\'s in each suitcase',
            'Find items quickly',
            'Track packing progress per bag',
            'Print packing labels'
          ]
        },
        howToCreateBags: {
          title: 'How to create bags:',
          steps: [
            'Go to "Bags" in your trip',
            'Click "Add Bag"',
            'Name it (example: "Blue Suitcase" or "Carry-on Backpack")',
            'Add notes about the bag',
            'Click "Save"'
          ]
        },
        addItems: {
          title: 'Then add items to the bag:',
          steps: [
            'From Items list, select items to pack',
            'Drag them to a bag, or',
            'Use the "Assign to Bag" option',
            'Mark items as packed when ready'
          ]
        }
      },

      step5: {
        title: 'Step 5: Collaborate with Others',
        subtitle: 'Invite travelers to join your planning.',
        howItWorks: {
          title: 'How it works:',
          items: [
            'Trip Admin shares the trip with participants',
            'Participants can view all trip details',
            'Participants can add comments and notes',
            'Participants can pack items and mark them complete',
            'Everyone sees real-time updates',
            'Everyone is always on the same page'
          ]
        },
        howToInvite: {
          title: 'How to invite:',
          steps: [
            'Open your trip',
            'Go to "Participants" or "Invite" - link#4',
            'Click "Invite Participant"',
            'Choose from your travelers or enter email',
            'Select their role (Participant or Admin)',
            'Send invitation',
            'They accept via email link'
          ]
        }
      }
    },

    commonTasks: {
      heading: 'Common Tasks You\'ll Do',
      tasks: [
        { task: 'I want to invite my family to plan together', section: 'Trip Participants → Add Participant to Trip' },
        { task: 'I want to print a packing checklist', section: 'Trip Packing Lists → Track Packing Status' },
        { task: 'I want to reuse items from my last trip', section: 'Templates → Item Templates' },
        { task: 'I want to share a trip with a friend', section: 'Trip Participants → Participant Permissions' },
        { task: 'I want to organize items by category', section: 'Items Module → Using Categories' },
        { task: 'I want to mark items as packed', section: 'Trip Packing Lists → Track Packing Status' },
        { task: 'I want to assign items to specific travelers', section: 'Trip Packing Lists → Assign Item to Traveler' }
      ]
    },

    proTips: {
      heading: 'Pro Tips for Success',
      tips: [
        {
          title: 'Tip 1: Use Categories',
          content: 'Organize items into categories like "Clothing," "Documents," "Electronics," "Toiletries." This makes finding items much faster.'
        },
        {
          title: 'Tip 2: Add Notes',
          content: 'Use the notes field to add details like "Waterproof phone case (for beach)", "Allergy medications - 30 tablets", "Backup charger in carry-on". These notes help everyone remember important details.'
        },
        {
          title: 'Tip 3: Create Templates',
          content: 'After your first trip, save your packing list as a template. Next time, you\'ll have 80% of items already ready. Just add or remove what\'s different.'
        },
        {
          title: 'Tip 4: Assign Early',
          content: 'Don\'t wait until packing day to assign items. Assign items to people as you plan. This prevents last-minute confusion.'
        },
        {
          title: 'Tip 5: Use Target Mode',
          content: '"Target Mode" lets you focus on one specific trip while working with your items. This is helpful when you have multiple upcoming trips and want to avoid mixing items. Learn more: "Target Mode" help section'
        },
        {
          title: 'Tip 6: Communicate Clearly',
          content: 'Use comments on trips to clarify things like "I\'m bringing the tent and sleeping bags", "Please bring your own pillow", "Lunch on Day 2 is at 12:30".'
        },
        {
          title: 'Tip 7: Test Mode First',
          content: 'If you\'re new to Plantour, spend 10-15 minutes in Guest Mode first. Click around, see how items and bags work, understand the layout. You\'ll be much faster once you create your real trip.'
        }
      ]
    },

    troubleshooting: {
      heading: 'Troubleshooting: Getting Started Problems',
      faqs: [
        {
          question: 'I created an account but forgot my password',
          answer: 'Click "Forgot Password" on the login page. You\'ll receive an email with reset instructions.'
        },
        {
          question: 'I invited someone but they didn\'t receive the email',
          answer: 'Check their spam folder. Ask them to check their email filters. Resend the invitation from the Participants section.'
        },
        {
          question: 'I added an item but it\'s not showing in my items list',
          answer: 'Check if you\'re in Target Mode (shows only items for current trip). Toggle Target Mode off to see all items.'
        },
        {
          question: 'I can\'t delete an item because it says "Item in use"',
          answer: 'The item is assigned to a bag in a trip. Remove it from the bag first, then delete it.'
        },
        {
          question: 'How do I know if I\'m in Guest Mode?',
          answer: 'Look at the top of the screen. You\'ll see "Guest Access Mode - 7 Days Remaining" message.'
        },
        {
          question: 'Can I save my Guest Mode data?',
          answer: 'No, Guest Mode data expires after 7 days. Before that happens, create a real account and you can export or recreate your trip.'
        }
      ]
    },

    nextSteps: {
      heading: 'Next Steps',
      introText: 'You\'re now ready to start using Plantour! Here\'s what to do:',

      guestModeSteps: {
        title: 'If You Chose Guest Mode:',
        items: [
          'Click "Start Test Mode" from the Help menu',
          'Explore the sample trip',
          'Add a few test items',
          'Assign items to the sample bag',
          'Click around and get comfortable',
          'Return to this help section anytime for questions'
        ]
      },

      accountSteps: {
        title: 'If You Chose to Create an Account:',
        items: [
          'Create your account - link#1',
          'Go to your dashboard',
          'Click "Create New Trip"',
          'Add your first travelers',
          'Create your first packing items',
          'Organize items into bags',
          'Invite family or friends to help'
        ]
      },

      gettingHelp: {
        title: 'Getting Help:',
        items: [
          'Use the Help menu (Question mark icon) anytime - link#5',
          'Each feature has contextual help',
          'Check the FAQ section for quick answers',
          'Contact support if stuck'
        ]
      }
    },

    quickReference: {
      heading: 'Quick Reference: What to Do When...',
      items: [
        { need: 'Forgot password', action: 'Login page → "Forgot Password"' },
        { need: 'Add travelers', action: 'Trip → "Travelers" section' },
        { need: 'Create packing list', action: 'Trip → "Items" section' },
        { need: 'Organize into bags', action: 'Trip → "Bags" section' },
        { need: 'Invite others', action: 'Trip → "Participants" section' },
        { need: 'Understand features', action: 'Help menu → Browse sections' },
        { need: 'See example data', action: 'Help menu → "Start Test Mode"' },
        { need: 'Print packing list', action: 'Trip → Print button' },
        { need: 'Edit trip info', action: 'Trip → Settings' },
        { need: 'Delete a trip', action: 'Trip → More options → Delete' }
      ]
    }
  };
}
