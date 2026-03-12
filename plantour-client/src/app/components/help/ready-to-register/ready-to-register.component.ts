import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ready-to-register',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ready-to-register.component.html',
  styleUrls: ['./ready-to-register.component.scss']
})
export class ReadyToRegisterComponent {

  registrationContent = {
    mainHeading: 'Ready to Create Your Account?',
    intro: 'Take the next step and create your Plantour account. It\'s quick, easy, and comes with a free Trial plan so you can get started right away without any immediate commitment.',

    registrationProcess: {
      title: 'How to Register',
      description: 'Creating a Plantour account is straightforward:',
      steps: [
        {
          number: 1,
          title: 'Click "Create Account"',
          details: 'fix this'
        },
        {
          number: 2,
          title: 'Enter Your Information',
          details: 'Provide your email address, and enter your name. Make sure your email is valid—you\'ll need it for account verification and communication.'
        },
        {
          number: 3,
          title: 'Verify Your Email',
          details: 'Check your inbox for a verification email from Plantour. Click the verification link to confirm your email address.'
        },
        {
          number: 4,
          title: 'You\'re All Set!',
          details: 'Your account is now active, and you\'ll automatically be on the Trial plan. Start creating trips, adding travelers, and packing items right away.'
        }
      ]
    },

    trialPlan: {
      title: 'Your Trial Plan',
      description: 'Every new Plantour account starts with a Trial plan at no cost. Here\'s what you get:',
      features: [
        {
          icon: 'check-circle',
          title: 'Full Feature Access',
          description: 'All core Plantour features available: trips, travelers, packing lists, bags, and more.'
        },
        {
          icon: 'clock',
          title: '30-Day Trial Period',
          description: 'Use Plantour for free for 30 days. No payment information required to start.'
        },
        {
          icon: 'download',
          title: 'PDF Downloads',
          description: 'Generate and download packing lists in PDF format for printing and offline use.'
        },
        {
          icon: 'users',
          title: 'Collaboration',
          description: 'Invite family members and travel companions to collaborate on trip planning.'
        },
        {
          icon: 'shield',
          title: 'Secure Storage',
          description: 'Your data is encrypted and securely stored. Never worry about losing your information.'
        },
        {
          icon: 'headphones',
          title: 'Email Support',
          description: 'Get help from our support team if you have any questions during your trial.'
        }
      ]
    },

    trialExpiration: {
      title: 'What Happens After 30 Days?',
      description: 'When your Trial plan expires, you\'ll need to choose a paid plan to continue using Plantour:',
      timeline: [
        {
          day: 'Day 1-29',
          status: 'Active',
          description: 'Trial plan is fully active. You can use all features without any limitations.'
        },
        {
          day: 'Day 30',
          status: 'Last Day',
          description: 'Final day of your Trial plan. You\'ll receive a reminder to choose a plan.'
        },
        {
          day: 'Day 31+',
          status: 'Expired',
          description: 'Trial expires. Your account is frozen until you select and pay for a new plan. Your data is preserved.'
        }
      ]
    },

    pricingPlans: {
      title: 'Available Plans',
      description: 'After your trial ends, choose the plan that fits your needs:',
      plans: [
        {
          name: 'Basic Plan',
          price: '$4.99',
          period: 'per month',
          bestFor: 'Solo travelers',
          features: [
            'Personal trip planning',
            '10 trips per year',
            'Unlimited travelers per trip',
            'Unlimited items (with 50 items per trip limit)',
            'PDF packing list download',
            'Email support',
            'Basic filters and sorting'
          ],
          icon: 'user'
        },
        {
          name: 'Family Plan',
          price: '$14.99',
          period: 'per month',
          bestFor: 'Families planning together',
          highlighted: true,
          features: [
            'Everything in Basic Plan, plus:',
            'Up to 5 family members',
            '50 trips per year',
            'Shared items and bags',
            'Collaborative editing',
            'Real-time updates',
            'Advanced filtering',
            'Priority email support',
            'Trip templates'
          ],
          icon: 'users'
        },
        {
          name: 'Professional Plan',
          price: '$29.99',
          period: 'per month',
          bestFor: 'Travel agencies and groups',
          features: [
            'Everything in Family Plan, plus:',
            'Unlimited trips per year',
            'Unlimited team members',
            'Group collaboration features',
            'Advanced analytics and reports',
            'Custom branding options',
            'Priority phone & email support',
            'API access',
            'Bulk operations'
          ],
          icon: 'briefcase'
        }
      ]
    },

    planManagement: {
      title: 'Managing Your Plan',
      description: 'You have full control over your subscription:',
      actions: [
        {
          title: 'View Current Plan',
          description: 'Go to Settings > Billing to see your current plan, next billing date, and renewal cost.'
        },
        {
          title: 'Change Plans Anytime',
          description: 'Want to upgrade or downgrade? You can change your plan at any time from your Profile. Changes take effect immediately after payment.'
        },
        {
          title: 'Cancel Subscription',
          description: 'If you decide Plantour isn\'t for you, cancel your subscription anytime. No long-term contracts or hidden fees.'
        },
        {
          title: 'Manage Payment Method',
          description: 'Update your payment information, add a backup card, or change your billing details in Settings > Billing.'
        }
      ]
    },

    refundPolicy: {
      title: 'Refund Policy & Upgrades',
      description: 'Understanding how money and plans work:',
      policies: [
        {
          title: 'No Refunds for Unused Time',
          description: 'If you upgrade, downgrade, or cancel during your billing period, the remaining money for the current period is not refundable. For example, if you\'re 10 days into a 30-day billing cycle and cancel, you won\'t receive a refund for the remaining 20 days.'
        },
        {
          title: 'Upgrade Credit Included',
          description: 'When upgrading from a lower plan to a higher plan, the remaining money from your current plan is automatically credited toward the new plan. No money is lost—it\'s applied to your upgrade. Example: If you paid $4.99 for Basic Plan and have $2 remaining, that $2 is credited toward Family Plan payment.'
        },
        {
          title: 'Plan Activation Timing',
          description: 'Your new plan takes effect immediately after payment is received. You\'ll have instant access to all features of your new plan without any waiting period.'
        },
        {
          title: 'Pro-Rata Adjustments',
          description: 'When upgrading mid-cycle, we calculate the difference in plan costs and charge you only for the remaining days at the new plan\'s rate.'
        }
      ]
    },

    paymentInfo: {
      title: 'Payment & Security',
      description: 'Your payment information is safe with us:',
      details: [
        {
          icon: 'lock',
          title: 'Secure Payment Processing',
          description: 'We use industry-standard encryption (SSL/TLS) and PCI-DSS compliance to protect your payment information. We never store full credit card details on our servers.'
        },
        {
          icon: 'credit-card',
          title: 'Accepted Payment Methods',
          description: 'We accept all major credit cards (Visa, Mastercard, American Express) and digital payment options. Payments are processed through trusted payment processors.'
        },
        {
          icon: 'receipt',
          title: 'Invoices',
          description: 'You\'ll receive a detailed invoice after each payment. Access all your invoices anytime from Settings > Billing.'
        },
        {
          icon: 'shield',
          title: 'Money-Back Guarantee',
          description: 'Trial users get 30 days free. If you\'re not satisfied after paying, contact support within 7 days of your first payment for a full refund.'
        }
      ]
    },

    faq: {
      title: 'Registration & Billing FAQ',
      questions: [
        {
          q: 'Can I use Plantour forever with just the Trial plan?',
          a: 'No, the Trial plan is limited to 30 days. After 30 days, you\'ll need to select and pay for a plan to continue using Plantour. Your data is preserved, so you won\'t lose anything if you upgrade.'
        },
        {
          q: 'Do I need to enter a payment method to start my Trial?',
          a: 'No! Your Trial plan requires no payment information. You only need to provide an email to get started.'
        },
        {
          q: 'When will I be charged for a plan?',
          a: 'You\'ll be charged only when your Trial ends and you select a paid plan. After that, you\'ll be charged on the same day each month (your billing anniversary) unless you cancel.'
        },
        {
          q: 'Can I change plans after registering?',
          a: 'Yes! You can upgrade to a higher plan, downgrade to a lower plan, or cancel anytime from your Profile. Changes take effect immediately after payment (for upgrades) or from your next billing date (for downgrades).'
        },
        {
          q: 'What happens to my data if I downgrade?',
          a: 'Your data is preserved regardless of your plan. If you downgrade from Family to Basic, you keep all your trips, travelers, and items. However, you may exceed the new plan\'s limits (e.g., more than 10 trips per year), so you won\'t be able to create new items until you\'re within limits.'
        },
        {
          q: 'Is there a discount for annual billing?',
          a: 'Currently, all plans are billed monthly. We\'re exploring annual billing options. Check your Profile for updates!'
        },
        {
          q: 'Can I have multiple accounts?',
          a: 'You can create multiple accounts with different email addresses. However, each account is separate, and your Trial plan is tied to one email address. We recommend one account per person.'
        },
        {
          q: 'Can I have a free or discounted plan for a nonprofit organization?',
          a: 'We\'d love to help! Contact our support team at support@plantour.app to discuss nonprofit and educational discounts.'
        },
        {
          q: 'What payment methods do you accept outside the US?',
          a: 'We accept major credit cards worldwide. Some digital payment options may vary by region. Check the payment page during checkout to see options available in your country.'
        }
      ]
    },

    nextSteps: {
      title: 'Ready to Get Started?',
      description: 'Here\'s what to do next:',
      steps: [
        {
          title: 'Create Your Account',
          text: 'Click the "Create Account" button and fill in your information. You\'ll be up and running in less than a minute!'
        },
        {
          title: 'Explore During Trial',
          text: 'Use your 30-day Trial to explore all of Plantour\'s features. Create trips, add travelers, and organize your packing.'
        },
        {
          title: 'Choose Your Plan',
          text: 'Before your Trial ends, decide which plan works best for you. Upgrade anytime, downgrade anytime.'
        },
        {
          title: 'Start Planning Trips',
          text: 'With a paid plan in place, you\'re ready to plan as many trips as you want with full access to all features!'
        },
        {
          title: 'Invite Collaborators',
          text: 'If you choose Family or Professional Plan, invite family members or team members to collaborate on trip planning together.'
        }
      ]
    },

    support: {
      title: 'Need Help?',
      description: 'We\'re here to support you:',
      options: [
        {
          icon: 'envelope',
          title: 'Email Support',
          description: 'Contact support@plantour.app for registration, billing, or feature questions. We respond within 24 hours.'
        },
        {
          icon: 'phone',
          title: 'Live Chat',
          description: 'Professional Plan members can access live chat support. Click the chat icon in the bottom right corner.'
        },
        {
          icon: 'question-circle',
          title: 'Help Center',
          description: 'Browse the Help section for answers to common questions about registration, plans, and features.'
        },
        {
          icon: 'lightbulb',
          title: 'Community',
          description: 'Join our community forum to share tips, ask questions, and learn from other Plantour users.'
        }
      ]
    }
  };
}
