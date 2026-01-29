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
            'Invited users who joined through an Admin\'s invitation have full access to edit their profile information. They can update personal details and, most importantly, set a password to convert their account into a full Plantour account.'
          ]
        },
        {
          title: 'Admins',
          content: [
            'Registered users with full accounts have complete access to all profile settings, including personal information, password management, and account preferences.'
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
            'In the "Password" section, click "Set Password"',
            'Create a strong password (minimum 8 characters, including letters and numbers)',
            'Confirm your password by entering it again',
            'Click "Save Password"',
            'Your account is now a full Plantour account!'
          ]
        },
        {
          title: 'After Setting Your Password',
          content: [
            'Once you\'ve set a password, your account converts from Participant-only to a full account:',
            'You can now sign in using your email and password (the same way Admins do)',
            'You retain access to all trips you were invited to as a Participant',
            'You can create new trips and become an Admin for those trips',
            'Your email becomes your permanent account identifier'
          ]
        }
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
            'Create a password for your account',
            'Confirm your password',
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
            'You can sign in using your new email and password'
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
      id: 'password-management',
      title: 'Password Management',
      content: [
        'Managing your password is crucial for account security and access control. The password options available depend on your account type.'
      ],
      subsections: [
        {
          title: 'For Participants (Setting First Password)',
          content: [
            'If you\'re a Participant who was invited and doesn\'t have a password yet:',
            'Navigate to the "Password" section on your profile',
            'Click "Set Password"',
            'Enter a strong password (minimum 8 characters)',
            'Confirm your password',
            'Click "Save"',
            'Your account is now upgraded to a full account!'
          ]
        },
        {
          title: 'For Admins and Upgraded Participants (Changing Password)',
          content: [
            'If you already have a password and want to change it:',
            'Go to the "Password" section on your profile',
            'Click "Change Password"',
            'Enter your current password',
            'Enter your new password',
            'Confirm your new password',
            'Click "Update Password"'
          ]
        },
        {
          title: 'Password Requirements',
          content: [
            'For security, your password must meet these requirements:'
          ],
          list: [
            'Minimum 8 characters long',
            'At least one uppercase letter',
            'At least one lowercase letter',
            'At least one number',
            'Special characters recommended but not required'
          ]
        },
        {
          title: 'Forgot Password?',
          content: [
            'If you forget your password, use the "Forgot Password" link on the sign-in page. You\'ll receive a password reset email with instructions to create a new password.'
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
            'Enter your password to confirm',
            'Click "Request Change"',
            'Check both your old and new email for verification links',
            'Click both verification links to complete the change'
          ]
        },
        {
          title: 'For Participants Without Password',
          content: [
            'Participants who haven\'t set a password yet cannot change their email directly. Instead:',
            'Set a password first (as described in the Password Management section)',
            'Once you have a password, you can change your email using the process above'
          ]
        },
        {
          title: 'Important Notes',
          content: [
            'You must verify both the old and new email addresses to complete the change.',
            'Your old email remains active until you verify the new one.',
            'All future sign-ins and notifications will use the new email after verification.',
            'Update your email in any saved password managers after changing it.'
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
          title: 'Security Tips',
          content: [],
          list: [
            'Use a unique, strong password that you don\'t use for other services',
            'Enable two-factor authentication if available (coming soon)',
            'Don\'t share your password with other trip participants',
            'Update your password regularly (every 3-6 months recommended)',
            'If you suspect unauthorized access, change your password immediately'
          ]
        },
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
            'Setting a password doesn\'t cost anything - you only pay if you create trips as an Admin',
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
