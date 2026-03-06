import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-using-test-mode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './using-test-mode.component.html',
  styleUrls: ['./using-test-mode.component.scss']
})
export class UsingTestModeComponent {
  
  testModeContent = {
    mainHeading: 'Using Test Mode (Guest Access)',
    intro: 'Test Mode allows you to experience Plantour without creating an account. Perfect for trying out the app and understanding how it works before committing to registration.',
    
    whatYouGet: {
      title: 'What You Get in Test Mode',
      description: 'When you activate Test Mode, a temporary account is created with the following features:',
      features: [
        {
          icon: 'user',
          title: 'Temporary Account',
          description: 'Account name: Robin Miles, Email: robin.milesXXXX@plantour.app'
        },
        {
          icon: 'clock',
          title: '7-Day Access Window',
          description: 'Your Test Mode account is valid for 7 days from creation. After 7 days, your account and data will be automatically deleted.'
        },
        {
          icon: 'shopping-bag',
          title: '10 Items Maximum',
          description: 'You can create and manage up to 10 packing items during Test Mode. This limit is sufficient to understand the app\'s core functionality.'
        },
        {
          icon: 'lock-open',
          title: 'No Sign-In Required',
          description: 'Your account is created instantly with no email verification needed. Start exploring immediately!'
        },
        {
          icon: 'globe',
          title: 'Full Feature Access',
          description: 'All Plantour features are available: create trips, add travelers, organize items, assign bags, and more.'
        },
        {
          icon: 'download',
          title: 'Download Packing Lists',
          description: 'Generate and download PDF packing lists just like you would with a regular account.'
        }
      ]
    },
    
    howToActivate: {
      title: 'How to Activate Test Mode',
      description: 'Getting started with Test Mode is simple:',
      steps: [
        {
          number: 1,
          title: 'Click the Start Test Mode Button',
          details: 'On the Help & Documentation page, under the "Get Started" section, click the "Start Test Mode" button. You can also click this button on any page where you see it highlighted.'
        },
        {
          number: 2,
          title: 'Confirm Your Choice',
          details: 'A dialog will appear asking you to confirm. Read the message and click "Yes" to proceed with activating Test Mode.'
        },
        {
          number: 3,
          title: 'Welcome to Plantour!',
          details: 'You\'ll be logged in instantly and taken directly to the packing list view of a pre-created trip called "Weekend in Las Vegas". You\'re all set to explore!'
        }
      ]
    },
    
    whatYouCanDo: {
      title: 'What You Can Do in Test Mode',
      description: 'During your 7-day Test Mode trial, you have full access to:',
      capabilities: [
        {
          category: 'Trips',
          items: [
            'View the pre-created "Weekend in Las Vegas" trip',
            'Create new trips',
            'Edit trip details (destination, dates, description)',
            'Change trip status (planning, packing, ready, completed)'
          ]
        },
        {
          category: 'Travelers',
          items: [
            'View the pre-added "Robin Miles" traveler',
            'Add more travelers to your trips',
            'Assign roles (admin or participant)',
            'Edit traveler information',
            'Filter and organize travelers'
          ]
        },
        {
          category: 'Items (Packing List)',
          items: [
            'Add up to 10 items to your trips',
            'Organize items by category',
            'Mark items as packed or unpacked',
            'Assign items to specific travelers',
            'Edit item details and notes'
          ]
        },
        {
          category: 'Bags',
          items: [
            'Create and manage luggage/bags',
            'Assign bags to travelers',
            'Track what\'s packed in each bag',
            'Estimate bag weight and size'
          ]
        },
        {
          category: 'Documentation',
          items: [
            'Generate packing lists in PDF format',
            'Download your packing lists',
            'View comprehensive trip summaries'
          ]
        }
      ]
    },
    
    importantLimitations: {
      title: 'Important Limitations',
      description: 'To keep Test Mode lightweight and accessible, a few limitations apply:',
      limitations: [
        {
          title: 'Maximum 10 Items',
          description: 'You can only create 10 packing items. This is enough to understand the app but creates intentional constraints for testing.'
        },
        {
          title: '7-Day Expiration',
          description: 'After 7 days, your Test Mode account and all associated data are automatically deleted. Plan accordingly if you want to keep your data.'
        },
        {
          title: 'Sign Out = Permanent Loss',
          description: 'If you sign out of your Test Mode account, you will lose access to it. The account will still exist for the full 7 days, but you\'ll need to start fresh with a new Test Mode account or create a regular account.'
        },
        {
          title: 'No Email Confirmation',
          description: 'Your email is auto-generated as robin.milesXXXX@plantour.app. This is a temporary test email and cannot receive notifications.'
        }
      ]
    },
    
    convertToRegular: {
      title: 'Converting Test Mode to a Regular Account',
      description: 'If you\'ve tested Plantour and want to keep your data, it\'s easy to convert your Test Mode account to a regular one:',
      steps: [
        {
          title: 'Stay Logged In',
          description: 'While logged into your Test Mode account, navigate to your Profile.'
        },
        {
          title: 'Update Your Profile',
          description: 'Change your name from "Robin Miles" to your actual name and update the email address from robin.milesXXXX@plantour.app to your real email.'
        },
        {
          title: 'Save Changes',
          description: 'Click save. Your profile update triggers the conversion process.'
        },
        {
          title: 'Verification Email',
          description: 'A verification email will be sent to your new email address. Click the verification link to confirm your email.'
        },
        {
          title: 'Account Converted!',
          description: 'Your Test Mode account is now a regular Plantour account. The 7-day expiration is removed, and all your data (trips, items, travelers, bags) is preserved permanently. You can now manage your account normally.'
        }
      ]
    },
    
    bestPractices: {
      title: 'Test Mode Best Practices',
      description: 'Get the most from your Test Mode experience:',
      tips: [
        {
          icon: 'check',
          title: 'Start Simple',
          text: 'Begin by adding a few items to the pre-created trip to understand the workflow before creating new trips.'
        },
        {
          icon: 'check',
          title: 'Explore All Features',
          text: 'Try creating travelers with different roles, assigning items to different people, and organizing items by category.'
        },
        {
          icon: 'check',
          title: 'Generate a Packing List',
          text: 'Download a PDF packing list to see how Plantour formats your data. This is one of the core features you\'ll use regularly.'
        },
        {
          icon: 'check',
          title: 'Check Out the Help',
          text: 'While in Test Mode, explore the Help section thoroughly. The app is yours to experiment with!'
        },
        {
          icon: 'check',
          title: 'Plan to Convert',
          text: 'If you like Plantour, don\'t forget to convert your account before 7 days are up. You won\'t be able to recover data after expiration.'
        },
        {
          icon: 'check',
          title: 'Take Notes',
          text: 'Use the notes/description fields when creating items and travelers. This helps you understand the app\'s documentation capabilities.'
        }
      ]
    },
    
    faq: {
      title: 'Frequently Asked Questions',
      questions: [
        {
          q: 'Can I create multiple Test Mode accounts?',
          a: 'Technically yes, but only one Test Mode account can be active at a time per browser/device. If you start a new Test Mode account, your previous one is abandoned.'
        },
        {
          q: 'What happens if I sign out?',
          a: 'You\'ll be logged out, but your Test Mode account still exists. You can log in again with a new Test Mode account (starting fresh) or create a regular account. Your old Test Mode data will be deleted after 7 days if not converted.'
        },
        {
          q: 'Can I share my Test Mode trip with others?',
          a: 'No, Test Mode is single-user only. The collaboration features require a regular account. If you want to share, convert to a regular account first.'
        },
        {
          q: 'Will I lose my data if I create a regular account afterward?',
          a: 'Not if you convert your Test Mode account to a regular account before the 7 days expire. If you create a completely separate regular account, the Test Mode data will be deleted after 7 days.'
        },
        {
          q: 'What if I reach the 10-item limit?',
          a: 'You won\'t be able to add more items until you delete some. Convert to a regular account to remove this limitation.'
        },
        {
          q: 'Can I extend my 7-day trial?',
          a: 'No, the 7-day period is fixed. However, converting to a regular account removes the expiration entirely.'
        },
        {
          q: 'Is my Test Mode data secure?',
          a: 'Test Mode data is treated the same as regular account data while it exists. However, it\'s designed to be temporary, so don\'t rely on Test Mode for long-term storage. Convert to a regular account for permanent data protection.'
        },
        {
          q: 'Can I download my packing lists in Test Mode?',
          a: 'Yes! You can generate and download PDF packing lists just as you would with a regular account. This is a great way to test the export functionality.'
        }
      ]
    },
    
    nextSteps: {
      title: 'Next Steps',
      description: 'After exploring Test Mode:',
      options: [
        {
          title: 'Convert to a Regular Account',
          text: 'If you\'re satisfied with Plantour, keep your Test Mode data by converting to a regular account before 7 days are up. See the conversion section above for detailed steps.'
        },
        {
          title: 'Create Your First Real Trip',
          text: 'Once you have a regular account, you can create unlimited trips and collaborate with others. Start planning your next real journey!'
        },
        {
          title: 'Invite Collaborators',
          text: 'With a regular account, invite family members or travel companions to collaborate on trip planning. One person plans, everyone contributes!'
        },
        {
          title: 'Explore Advanced Features',
          text: 'Regular accounts unlock all advanced features including team collaboration, shared items, and full customization options.'
        },
        {
          title: 'Read More Help',
          text: 'Check out the "Welcome to Plantour" and other help sections to learn about Plantour\'s full capabilities and best practices.'
        }
      ]
    }
  };
}
