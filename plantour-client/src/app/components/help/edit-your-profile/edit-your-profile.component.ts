import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';

interface HelpSection {
  id: string;
  title: string;
  content: string[];
  subsections?: HelpSubsection[];
}

interface HelpSubsection {
  title: string;
  content: string[];
  list?: string[];
}

@Component({
  selector: 'app-edit-your-profile',
  standalone: true,
  imports: [CommonModule, AccordionModule, CardModule],
  templateUrl: './edit-your-profile.component.html',
  styleUrls: ['./edit-your-profile.component.scss']
})
export class EditYourProfileComponent {
  sections: HelpSection[] = [
    {
      id: 'overview',
      title: 'Profile Settings Overview',
      content: [
        'Your profile page allows you to manage your personal information and account settings. Whether you\'re a Guest user, Participant, or registered Admin, you can access your profile to update details and control your Plantour experience.',
        'The level of access and options available depends on your user type:'
      ],
      subsections: [
        {
          title: 'Guest Users (Test Mode)',
          content: [
            'Temporary users using test accounts (robin.milesXXXX@plantour.app) have limited profile access during their 7-day trial period. They can view their profile but cannot make permanent changes until they convert to a full account.'
          ]
        },
        {
          title: 'Participants',
          content: [
            'Invited users who joined through an Admin\'s invitation have full access to edit their profile information. They can update personal details.'
          ]
        },
        {
          title: 'Admins',
          content: [
            'Registered users with full accounts have complete access to all profile settings, including personal information, and account preferences.'
          ]
        }
      ]
    },
    {
      id: 'accessing-profile',
      title: 'Accessing Your Profile',
      content: [
        'To access your profile page, follow these steps:'
      ],
      subsections: [
        {
          title: 'From Dashboard',
          content: [],
          list: [
            'Click on your name or avatar in the top-right corner of the screen',
            'Select "Edit Profile" from the dropdown menu',
            'You\'ll be redirected to your profile page'
          ]
        },
        {
          title: 'Direct Navigation',
          content: [
            'If you\'re already signed in, you can navigate directly to the profile page using the main menu or navigation bar, depending on your device.'
          ]
        }
      ]
    },
    {
      id: 'participants-upgrade',
      title: 'How Participants Can Become Full Users',
      content: [
        'If you were invited to Plantour as a Participant, you have a unique opportunity to upgrade your account to a full Plantour user. This process is simple and gives you complete control over your account.'
      ],
      subsections: [
        {
          title: 'Why Upgrade Your Account?',
          content: [
            'As a Participant, you can use Plantour for free and access trips you\'ve been invited to. However, upgrading to a full account provides several benefits:'
          ],
          list: [
            'Create your own trips as an Admin',
            'Invite other participants to your trips',
            'Access all Plantour features independently',
            'Maintain permanent access to your account',
            'Switch between being an Admin and Participant across different trips'
          ]
        },
        {
          title: 'Upgrade Steps for Participants',
          content: [
            'Follow these simple steps to convert your Participant account into a full Plantour account:'
          ],
          list: [
            'Navigate to your profile page (click your name → Edit Profile)',
            'Your account is now a full Plantour account!'
          ]
        },
      ]
    },
    {
      id: 'guests-upgrade',
      title: 'How Guests Can Become Full Users',
      content: [
        'Guest users (those using the test mode with temporary robin.milesXXXX@plantour.app accounts) have a different upgrade path. Since Guest accounts are temporary and not tied to a real email address, the conversion process requires providing your actual email.'
      ],
      subsections: [
        {
          title: 'Understanding Guest Account Limitations',
          content: [
            'Guest accounts are designed for quick testing and exploration:',
            'They expire after 7 days',
            'They\'re limited to 10 items per trip',
            'They use a temporary robin.miles email that doesn\'t receive actual messages',
            'All data is deleted when the account expires'
          ]
        },
        {
          title: 'Conversion Steps for Guests',
          content: [
            'To convert your Guest account into a permanent account, follow these steps:'
          ],
          list: [
            'Navigate to your profile page before your 7-day trial expires',
            'Look for the "Convert to Full Account" section',
            'Enter your real email address (this will become your account email)',
            'Click "Convert Account"',
            'Check your email for a verification link',
            'Click the verification link to activate your account'
          ]
        },
        {
          title: 'What Happens After Conversion?',
          content: [
            'Once you complete the conversion process:',
            'Your robin.milesXXXX@plantour.app email is replaced with your real email',
            'All your trip data, items, and bags are preserved',
            'The 10-item limit is removed',
            'The 7-day expiration no longer applies',
            'You\'ll need to choose a subscription plan (you can start with the 30-day Trial plan)',
            'You can sign in using your new email'
          ]
        },
        {
          title: 'Important Notes',
          content: [
            'Make sure to convert your account before the 7-day trial expires, or you\'ll lose all your data.',
            'You can only convert once - choose your email carefully as it becomes your permanent account identifier.',
            'After conversion, you\'ll be directed to select a subscription plan (Trial, Basic, Family, or Professional).'
          ]
        }
      ]
    },
    {
      id: 'editing-personal-info',
      title: 'Editing Personal Information',
      content: [
        'All user types (except Guests during trial) can update their personal information on the profile page. This helps keep your account current and ensures proper identification within trips.'
      ],
      subsections: [
        {
          title: 'Editable Fields',
          content: [
            'You can update the following information:'
          ],
          list: [
            'First Name - Your given name',
            'Last Name - Your family name',
            'Display Name - Optional name shown to other users (defaults to First + Last)',
            'Phone Number - Contact number for notifications (optional)',
            'Profile Picture - Upload a photo to personalize your account',
            'Time Zone - Ensures correct time displays for trip events',
            'Language Preference - Choose your preferred interface language'
          ]
        },
        {
          title: 'How to Edit',
          content: [],
          list: [
            'On your profile page, locate the field you want to change',
            'Click in the field or click the "Edit" icon next to it',
            'Enter or update your information',
            'Click "Save" or "Update" to apply changes',
            'Changes take effect immediately'
          ]
        },
        {
          title: 'Profile Picture Upload',
          content: [
            'To add or change your profile picture:',
            'Click on the current picture placeholder or existing image',
            'Select "Upload New Photo" or "Change Photo"',
            'Choose an image file from your device (JPG, PNG, max 5MB)',
            'Crop or adjust if needed',
            'Click "Save" to apply'
          ]
        }
      ]
    },
    {
      id: 'email-changes',
      title: 'Changing Your Email Address',
      content: [
        'Your email address is your primary account identifier. Changing it requires verification to ensure security.'
      ],
      subsections: [
        {
          title: 'For Full Users (Admins and Upgraded Participants)',
          content: [
            'To change your email address:',
            'Navigate to the "Email" section on your profile',
            'Click "Change Email"',
            'Enter your new email address',
            'Click "Request Change"',
            'Check both your old and new email for verification links',
            'Click both verification links to complete the change'
          ]
        },
        {
          title: 'Important Notes',
          content: [
            'You must verify both the old and new email addresses to complete the change.',
            'Your old email remains active until you verify the new one.',
            'All future sign-ins and notifications will use the new email after verification.'
          ]
        }
      ]
    },
    {
      id: 'tips',
      title: 'Profile Tips and Best Practices',
      content: [
        'Here are some helpful tips for managing your profile effectively:'
      ],
      subsections: [
        {
          title: 'Profile Completeness',
          content: [],
          list: [
            'Add a profile picture - it helps other participants recognize you',
            'Set your correct time zone to see accurate trip dates and times',
            'Add a phone number for optional SMS notifications',
            'Choose a display name if you prefer something different from your legal name',
            'Keep your email current to receive important trip updates'
          ]
        },
        {
          title: 'For Participants',
          content: [],
          list: [
            'Consider upgrading to a full account even if you don\'t plan to create trips - it gives you more control',
            'After upgrading, you can still participate in others\' trips for free',
            'Your upgraded account never expires, unlike Guest accounts'
          ]
        },
        {
          title: 'For Guests',
          content: [],
          list: [
            'Convert your account before day 7 to keep your data',
            'Use your real email for conversion - you can\'t change this later without support help',
            'Test all features during your trial before converting',
            'After converting, choose the Trial plan for another 30 days free before subscribing'
          ]
        }
      ]
    }
  ];
}
