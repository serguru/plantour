import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TemporaryUserResponse, UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { EMPTY } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage-service';
import { CurrentTripService } from '../../services/current-trip-service';

interface HelpSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  subsections?: HelpSubsection[];
}

interface HelpSubsection {
  id: string;
  title: string;
  linkId?: string;
}


// TODO: add a link to Guest Mode video tutorial
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    CardModule,
    AccordionModule,
    ButtonModule
  ],
  templateUrl: './help-component.html',
  styleUrl: './help-component.scss'
})
export class HelpComponent {
  constructor() { }

  router = inject(Router);

  usersService = inject(UsersService);

  messagesService = inject(MessagesService);

  localStorageService = inject(LocalStorageService);

  currentTripService = inject(CurrentTripService);

  helpSections = signal<HelpSection[]>([
    {
      id: 'get-started',
      title: 'Get Started - No Registration Required',
      icon: 'pi pi-star',
      description: 'Try Plantour immediately with test data. Learn the basics without creating an account.',
      subsections: [
        { id: 'welcome', title: 'Welcome to Plantour', linkId: 'link#1' },
        { id: 'test-mode', title: 'Using Test Mode', linkId: 'link#2' },
        { id: 'quick-tour', title: 'Quick Tour (5 Minutes)', linkId: 'link#3' },
        { id: 'create-account', title: 'Ready to Create Your Account?', linkId: 'link#4' }
      ]
    },
    {
      id: 'overview',
      title: 'Plantour Overview',
      icon: 'pi pi-info-circle',
      description: 'Understand what Plantour is and how it helps you organize trips.',
      subsections: [
        { id: 'what-is-plantour', title: 'What is Plantour?' },
        { id: 'key-features', title: 'Key Features' },
        { id: 'who-is-it-for', title: 'Who is Plantour For?' },
        { id: 'basic-workflow', title: 'Basic Workflow' }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: 'pi pi-user',
      description: 'Create and manage your account, profile, and preferences.',
      subsections: [
        { id: 'registration', title: 'How to Register', linkId: 'link#5' },
        { id: 'login', title: 'Sign In to Your Account', linkId: 'link#6' },
        { id: 'profile', title: 'Edit Your Profile', linkId: 'link#7' },
        { id: 'security', title: 'Password and Security', linkId: 'link#8' }
      ]
    },
    {
      id: 'travelers',
      title: 'Travelers Module',
      icon: 'pi pi-users',
      description: 'Manage people who participate in your trips.',
      subsections: [
        { id: 'travelers-intro', title: 'Understanding Travelers', linkId: 'link#9' },
        { id: 'add-traveler', title: 'Add a Traveler', linkId: 'link#10' },
        { id: 'edit-traveler', title: 'Edit Traveler Information', linkId: 'link#11' },
        { id: 'delete-traveler', title: 'Delete a Traveler', linkId: 'link#12' },
        { id: 'filter-travelers', title: 'Filter and Sort Travelers', linkId: 'link#13' },
        { id: 'traveler-roles', title: 'Admin vs Participant Roles', linkId: 'link#14' }
      ]
    },
    {
      id: 'things',
      title: 'Things Module',
      icon: 'pi pi-box',
      description: 'Create and manage packing items.',
      subsections: [
        { id: 'things-intro', title: 'Understanding Things', linkId: 'link#15' },
        { id: 'add-thing', title: 'Add a Thing', linkId: 'link#16' },
        { id: 'edit-thing', title: 'Edit Thing Details', linkId: 'link#17' },
        { id: 'delete-thing', title: 'Delete a Thing', linkId: 'link#18' },
        { id: 'thing-categories', title: 'Using Categories', linkId: 'link#19' },
        { id: 'filter-things', title: 'Filter and Sort Things', linkId: 'link#20' }
      ]
    },
    {
      id: 'packs',
      title: 'Packs Module',
      icon: 'pi pi-briefcase',
      description: 'Organize luggage and packages.',
      subsections: [
        { id: 'packs-intro', title: 'Understanding Packs', linkId: 'link#21' },
        { id: 'add-pack', title: 'Add a Pack', linkId: 'link#22' },
        { id: 'edit-pack', title: 'Edit Pack Details', linkId: 'link#23' },
        { id: 'delete-pack', title: 'Delete a Pack', linkId: 'link#24' },
        { id: 'filter-packs', title: 'Filter and Sort Packs', linkId: 'link#25' }
      ]
    },
    {
      id: 'trips',
      title: 'Trips Module',
      icon: 'pi pi-map',
      description: 'Create and manage your trips.',
      subsections: [
        { id: 'trips-intro', title: 'Understanding Trips', linkId: 'link#26' },
        { id: 'create-trip', title: 'Create a New Trip', linkId: 'link#27' },
        { id: 'edit-trip', title: 'Edit Trip Details', linkId: 'link#28' },
        { id: 'delete-trip', title: 'Delete a Trip', linkId: 'link#29' },
        { id: 'trip-status', title: 'Trip Status Workflow', linkId: 'link#30' },
        { id: 'filter-trips', title: 'Filter and Sort Trips', linkId: 'link#31' },
        { id: 'select-current-trip', title: 'Select Current Trip', linkId: 'link#32' }
      ]
    },
    {
      id: 'trip-participants',
      title: 'Trip Participants',
      icon: 'pi pi-users',
      description: 'Add and manage people in your trip.',
      subsections: [
        { id: 'participants-intro', title: 'Understanding Trip Participants', linkId: 'link#33' },
        { id: 'add-participant', title: 'Add Participant to Trip', linkId: 'link#34' },
        { id: 'remove-participant', title: 'Remove Participant from Trip', linkId: 'link#35' },
        { id: 'participant-permissions', title: 'Participant Permissions', linkId: 'link#36' }
      ]
    },
    {
      id: 'trip-things',
      title: 'Trip Packing Lists',
      icon: 'pi pi-list',
      description: 'Manage things and packing for your trip.',
      subsections: [
        { id: 'trip-things-intro', title: 'Understanding Trip Things', linkId: 'link#37' },
        { id: 'add-thing-to-trip', title: 'Add Thing to Trip', linkId: 'link#38' },
        { id: 'remove-thing-from-trip', title: 'Remove Thing from Trip', linkId: 'link#39' },
        { id: 'packing-status', title: 'Track Packing Status', linkId: 'link#40' },
        { id: 'assign-thing-to-traveler', title: 'Assign Thing to Traveler', linkId: 'link#41' }
      ]
    },
    {
      id: 'trip-packs',
      title: 'Trip Packages',
      icon: 'pi pi-briefcase',
      description: 'Assign luggage to trip participants.',
      subsections: [
        { id: 'trip-packs-intro', title: 'Understanding Trip Packs', linkId: 'link#42' },
        { id: 'add-pack-to-trip', title: 'Add Pack to Trip', linkId: 'link#43' },
        { id: 'remove-pack-from-trip', title: 'Remove Pack from Trip', linkId: 'link#44' },
        { id: 'assign-pack-to-traveler', title: 'Assign Pack to Traveler', linkId: 'link#45' }
      ]
    },
    {
      id: 'shared-things',
      title: 'Shared Things',
      icon: 'pi pi-share-alt',
      description: 'Share items between trip participants.',
      subsections: [
        { id: 'shared-intro', title: 'Understanding Shared Things', linkId: 'link#46' },
        { id: 'create-shared-thing', title: 'Create a Shared Thing', linkId: 'link#47' },
        { id: 'edit-shared-thing', title: 'Edit Shared Thing', linkId: 'link#48' },
        { id: 'delete-shared-thing', title: 'Delete Shared Thing', linkId: 'link#49' }
      ]
    },
    {
      id: 'trip-comments',
      title: 'Trip Comments',
      icon: 'pi pi-comments',
      description: 'Collaborate with notes and comments.',
      subsections: [
        { id: 'comments-intro', title: 'Understanding Comments', linkId: 'link#50' },
        { id: 'add-comment', title: 'Add a Comment', linkId: 'link#51' },
        { id: 'edit-comment', title: 'Edit Your Comment', linkId: 'link#52' },
        { id: 'delete-comment', title: 'Delete a Comment', linkId: 'link#53' }
      ]
    },
    {
      id: 'target-mode',
      title: 'Target Mode',
      icon: 'pi pi-crosshairs',
      description: 'Work with items in the context of a specific trip.',
      subsections: [
        { id: 'target-intro', title: 'What is Target Mode?', linkId: 'link#54' },
        { id: 'activate-target', title: 'Activate Target Mode', linkId: 'link#55' },
        { id: 'target-travelers', title: 'Target Mode for Travelers', linkId: 'link#56' },
        { id: 'target-things', title: 'Target Mode for Things', linkId: 'link#57' },
        { id: 'target-packs', title: 'Target Mode for Packs', linkId: 'link#58' },
        { id: 'deactivate-target', title: 'Exit Target Mode', linkId: 'link#59' }
      ]
    },
    {
      id: 'filtering-sorting',
      title: 'Filtering and Sorting',
      icon: 'pi pi-filter',
      description: 'Find items quickly with filters and sorting.',
      subsections: [
        { id: 'filters-intro', title: 'Using Filters', linkId: 'link#60' },
        { id: 'sort-items', title: 'Sort Items', linkId: 'link#61' },
        { id: 'search', title: 'Search for Items', linkId: 'link#62' },
        { id: 'clear-filters', title: 'Clear Filters', linkId: 'link#63' }
      ]
    },
    {
      id: 'templates',
      title: 'Templates',
      icon: 'pi pi-clone',
      description: 'Reuse items and trip structures.',
      subsections: [
        { id: 'templates-intro', title: 'Understanding Templates', linkId: 'link#64' },
        { id: 'thing-templates', title: 'Thing Templates', linkId: 'link#65' },
        { id: 'trip-templates', title: 'Trip Templates (Future)', linkId: 'link#66' }
      ]
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: 'pi pi-lightbulb',
      description: 'Get the most from Plantour.',
      subsections: [
        { id: 'planning-tips', title: 'Trip Planning Tips', linkId: 'link#67' },
        { id: 'packing-strategies', title: 'Packing Strategies', linkId: 'link#68' },
        { id: 'organization-tips', title: 'Organization Tips', linkId: 'link#69' },
        { id: 'team-coordination', title: 'Team Coordination', linkId: 'link#70' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: 'pi pi-wrench',
      description: 'Common issues and solutions.',
      subsections: [
        { id: 'common-problems', title: 'Common Problems', linkId: 'link#71' },
        { id: 'error-messages', title: 'Error Messages Explained', linkId: 'link#72' },
        { id: 'cant-delete', title: 'Why Can\'t I Delete This?', linkId: 'link#73' },
        { id: 'missing-items', title: 'Items Not Showing Up', linkId: 'link#74' }
      ]
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: 'pi pi-question-circle',
      description: 'Frequently asked questions.',
      subsections: [
        { id: 'faq-general', title: 'General Questions' },
        { id: 'faq-account', title: 'Account Questions' },
        { id: 'faq-trips', title: 'Trip Questions' },
        { id: 'faq-packing', title: 'Packing Questions' },
        { id: 'faq-collaboration', title: 'Collaboration Questions' }
      ]
    }
  ]);

  selectedSection = signal<string | null>(null);

  navigateToSection(sectionId: string, subsectionId?: string) {
    this.selectedSection.set(sectionId);
    // Future: Navigate to specific subsection with fragment
    console.log('Navigate to:', sectionId, subsectionId);
  }

  getStartedWithTest = async () => {

    if (this.usersService.isAuthenticatedSignal()) {
      this.messagesService.showInfo("Please sign out first to use Guest Access Mode");
      return;
    }

    const dialogResult = await this.messagesService.openOkCancel({
      title: `Start Guest Access Mode`,
      message: "You are entering Guest Mode! You can explore Plantour for 7 days without creating an account. Ready to start?",
      okLabel: 'Yes',
      cancelLabel: 'No'
    });

    if (dialogResult !== 'ok') {
      return;
    }

    this.usersService.registerTemporaryAdmin().subscribe({
      next: (response: TemporaryUserResponse) => {

        localStorage.clear();
        this.localStorageService.setComponentKey('trips', 'selectedId', response.currentTripId);
        this.localStorageService.setItem('toolbar-showTripText', true);
        this.currentTripService.updateCurrentTripVisible(true);

        this.usersService.updateUser(response.accessToken);
        const path = `/trips/${response.currentTripId}/trip-things`;
        this.router.navigate([path]);

        this.messagesService.openInfo({
          title: `Welcome to Plantour!`,
          message: `You are now in Guest Access Mode as Robin Miles for 7 days. The app works with full features, except you are limited to 5 items. To get started, add items to your current trip "Weekend in Las Vegas", pack them into bags, and download a packing list. 
          
          If you need help, see Guest Mode Help. Enjoy!
          `
        });
      }
    });
  }
}


