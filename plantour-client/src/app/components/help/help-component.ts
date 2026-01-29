import { Component, inject, signal, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TemporaryUserResponse, UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { take } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { HelpSectionComponent } from './help-section/help-section.component';
import { HelpSection } from './help-types';

// TODO: add a link to Guest Mode video tutorial
// TODO: Help documents were genertated by AI. It is necessary to read ALL the Help documents carefully and make sure the content is OK
// TODO: put section collapsimg button in one row with section title
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    HelpSectionComponent
  ],
  templateUrl: './help-component.html',
  styleUrl: './help-component.scss'
})
export class HelpComponent {
  constructor() { }

  router = inject(Router);

  route = inject(ActivatedRoute);

  usersService = inject(UsersService);

  messagesService = inject(MessagesService);

  localStorageService = inject(LocalStorageService);

  currentTripService = inject(CurrentTripService);
  welcomeComponent = signal<Type<unknown> | null>(null);
  testModeComponent = signal<Type<unknown> | null>(null);
  readyToRegisterComponent = signal<Type<unknown> | null>(null);
  keyFeaturesComponent = signal<Type<unknown> | null>(null);
  whoPlantourForComponent = signal<Type<unknown> | null>(null);
  basicWorkflowComponent = signal<Type<unknown> | null>(null);
  adminsParticipantsComponent = signal<Type<unknown> | null>(null);
  signInToAccountComponent = signal<Type<unknown> | null>(null);
  editYourProfileComponent = signal<Type<unknown> | null>(null);
  understandingTravelersComponent = signal<Type<unknown> | null>(null);
  addTravelerComponent = signal<Type<unknown> | null>(null);
  editTravelerComponent = signal<Type<unknown> | null>(null);
  deleteTravelerComponent = signal<Type<unknown> | null>(null);
  filterTravelersComponent = signal<Type<unknown> | null>(null);
  understandingItemsComponent = signal<Type<unknown> | null>(null);
  addItemComponent = signal<Type<unknown> | null>(null);
  editItemComponent = signal<Type<unknown> | null>(null);
  deleteItemComponent = signal<Type<unknown> | null>(null);
  usingCategoriesComponent = signal<Type<unknown> | null>(null);
  filterSortItemsComponent = signal<Type<unknown> | null>(null);
  understandingBagsComponent = signal<Type<unknown> | null>(null);
  addBagComponent = signal<Type<unknown> | null>(null);
  editBagDetailsComponent = signal<Type<unknown> | null>(null);
  deleteBagComponent = signal<Type<unknown> | null>(null);
  filterSortBagsComponent = signal<Type<unknown> | null>(null);
  understandingTripsComponent = signal<Type<unknown> | null>(null);
  createTripComponent = signal<Type<unknown> | null>(null);
  editTripComponent = signal<Type<unknown> | null>(null);
  deleteTripComponent = signal<Type<unknown> | null>(null);
  tripStatusWorkflowComponent = signal<Type<unknown> | null>(null);
  filterSortTripsComponent = signal<Type<unknown> | null>(null);
  selectCurrentTripComponent = signal<Type<unknown> | null>(null);
  understandingTripParticipantsComponent = signal<Type<unknown> | null>(null);
  addParticipantToTripComponent = signal<Type<unknown> | null>(null);
  removeParticipantFromTripComponent = signal<Type<unknown> | null>(null);
  participantPermissionsComponent = signal<Type<unknown> | null>(null);

  helpSections = signal<HelpSection[]>([
    {
      id: 'get-started',
      title: 'Get Started - No Registration Required',
      icon: 'pi pi-star',
      description: 'Try Plantour immediately with test data. Learn the basics without creating an account.',
      subsections: [
        { id: 'welcome', title: 'Welcome to Plantour', linkId: 'link#1' },
        { id: 'test-mode', title: 'Using Test Mode', linkId: 'link#2' },
//        { id: 'quick-tour', title: 'Quick Tour (5 Minutes)', linkId: 'link#3' },
        { id: 'create-account', title: 'Ready to Create Your Account?', linkId: 'link#4' }
      ]
    },
    {
      id: 'overview',
      title: 'Plantour Overview',
      icon: 'pi pi-info-circle',
      description: 'Understand what Plantour is and how it helps you organize trips.',
      subsections: [
        //{ id: 'what-is-plantour', title: 'What is Plantour?' },
        { id: 'key-features', title: 'Key Features' },
        { id: 'who-is-it-for', title: 'Who is Plantour For?' },
        { id: 'admins-and-participants', title: 'Admins and Participants' },
        { id: 'basic-workflow', title: 'Basic Workflow' }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: 'pi pi-user',
      description: 'Create and manage your account, profile, and preferences.',
      subsections: [
        // { id: 'registration', title: 'How to Register', linkId: 'link#5' },
        { id: 'login', title: 'Sign In to Your Account', linkId: 'link#6' },
        { id: 'profile', title: 'Edit Your Profile', linkId: 'link#7' },
        //{ id: 'security', title: 'Password and Security', linkId: 'link#8' }
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
        { id: 'filter-travelers', title: 'Filter and Sort Travelers', linkId: 'link#13' }
      ]
    },
    {
      id: 'things',
      title: 'Items Module',
      icon: 'pi pi-shopping-bag',
      description: 'Create and manage packing items.',
      subsections: [
        { id: 'things-intro', title: 'Understanding Items', linkId: 'link#15' },
        { id: 'add-item', title: 'Add an Item', linkId: 'link#16' },
        { id: 'edit-item', title: 'Edit Item Details', linkId: 'link#17' },
        { id: 'delete-item', title: 'Delete an Item', linkId: 'link#18' },
        { id: 'item-categories', title: 'Using Categories', linkId: 'link#19' },
        { id: 'filter-things', title: 'Filter and Sort Items', linkId: 'link#20' }
      ]
    },
    {
      id: 'packs',
      title: 'Bags Module',
      icon: 'pi pi-briefcase',
      description: 'Organize luggage and packages.',
      subsections: [
        { id: 'packs-intro', title: 'Understanding Bags', linkId: 'link#21' },
        { id: 'add-bag', title: 'Add a Bag', linkId: 'link#22' },
        { id: 'edit-bag', title: 'Edit Bag Details', linkId: 'link#23' },
        { id: 'delete-bag', title: 'Delete a Bag', linkId: 'link#24' },
        { id: 'filter-packs', title: 'Filter and Sort Bags', linkId: 'link#25' }
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
        { id: 'trip-things-intro', title: 'Understanding Trip Items', linkId: 'link#37' },
        { id: 'add-item-to-trip', title: 'Add Item to Trip', linkId: 'link#38' },
        { id: 'remove-item-from-trip', title: 'Remove Item from Trip', linkId: 'link#39' },
        { id: 'packing-status', title: 'Track Packing Status', linkId: 'link#40' },
        { id: 'assign-item-to-traveler', title: 'Assign Item to Traveler', linkId: 'link#41' }
      ]
    },
    {
      id: 'trip-packs',
      title: 'Trip Bags',
      icon: 'pi pi-briefcase',
      description: 'Assign luggage to trip participants.',
      subsections: [
        { id: 'trip-packs-intro', title: 'Understanding Trip Bags', linkId: 'link#42' },
        { id: 'add-bag-to-trip', title: 'Add Bag to Trip', linkId: 'link#43' },
        { id: 'remove-bag-from-trip', title: 'Remove Bag from Trip', linkId: 'link#44' },
        { id: 'assign-bag-to-traveler', title: 'Assign Bag to Traveler', linkId: 'link#45' }
      ]
    },
    {
      id: 'shared-things',
      title: 'Shared Items',
      icon: 'pi pi-share-alt',
      description: 'Share items between trip participants.',
      subsections: [
        { id: 'shared-intro', title: 'Understanding Shared Items', linkId: 'link#46' },
        { id: 'create-shared-item', title: 'Create a Shared Item', linkId: 'link#47' },
        { id: 'edit-shared-item', title: 'Edit Shared Item', linkId: 'link#48' },
        { id: 'delete-shared-item', title: 'Delete Shared Item', linkId: 'link#49' }
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
        { id: 'target-things', title: 'Target Mode for Items', linkId: 'link#57' },
        { id: 'target-packs', title: 'Target Mode for Bags', linkId: 'link#58' },
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
        { id: 'item-templates', title: 'Item Templates', linkId: 'link#65' },
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

  expandedSectionId = signal<string | null>(null);
  selectedSubsection = signal<{ sectionId: string; subsectionId: string } | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(take(1)).subscribe(params => {
      if (params.get('start') === 'guest') {
        this.getStartedWithTest();
      }
    });
  }

  toggleSection(sectionId: string) {
    const currentExpanded = this.expandedSectionId();
    if (currentExpanded === sectionId) {
      this.expandedSectionId.set(null);
      if (this.selectedSubsection()?.sectionId === sectionId) {
        this.selectedSubsection.set(null);
      }
      return;
    }

    this.expandedSectionId.set(sectionId);
    if (this.selectedSubsection()?.sectionId !== sectionId) {
      this.selectedSubsection.set(null);
    }
  }

  selectedSubsectionIdFor(sectionId: string) {
    const selected = this.selectedSubsection();
    return selected?.sectionId === sectionId ? selected.subsectionId : null;
  }

  handleSelectSubsection(selection: { sectionId: string; subsectionId: string }) {
    this.expandedSectionId.set(selection.sectionId);
    
    // If subsectionId is empty, it means we're collapsing
    if (!selection.subsectionId) {
      this.selectedSubsection.set(null);
      return;
    }
    
    this.selectedSubsection.set(selection);
    this.loadSubcomponent(selection.sectionId, selection.subsectionId);
  }

  getSectionComponents(sectionId: string): Record<string, Type<unknown> | null> {
    switch (sectionId) {
      case 'get-started':
        return {
          welcome: this.welcomeComponent(),
          'test-mode': this.testModeComponent(),
          'create-account': this.readyToRegisterComponent()
        };
      case 'overview':
        return {
          'key-features': this.keyFeaturesComponent(),
          'who-is-it-for': this.whoPlantourForComponent(),
          'basic-workflow': this.basicWorkflowComponent(),
          'admins-and-participants': this.adminsParticipantsComponent()
        };
      case 'account':
        return {
          login: this.signInToAccountComponent(),
          profile: this.editYourProfileComponent()
        };
      case 'travelers':
        return {
          'travelers-intro': this.understandingTravelersComponent(),
          'add-traveler': this.addTravelerComponent(),
          'edit-traveler': this.editTravelerComponent(),
          'delete-traveler': this.deleteTravelerComponent(),
          'filter-travelers': this.filterTravelersComponent()
        };
      case 'things':
        return {
          'things-intro': this.understandingItemsComponent(),
          'add-item': this.addItemComponent(),
          'edit-item': this.editItemComponent(),
          'delete-item': this.deleteItemComponent(),
          'item-categories': this.usingCategoriesComponent(),
          'filter-things': this.filterSortItemsComponent()
        };
      case 'packs':
        return {
          'packs-intro': this.understandingBagsComponent(),
          'add-bag': this.addBagComponent(),
          'edit-bag': this.editBagDetailsComponent(),
          'delete-bag': this.deleteBagComponent(),
          'filter-packs': this.filterSortBagsComponent()
        };
      case 'trips':
        return {
          'trips-intro': this.understandingTripsComponent(),
          'create-trip': this.createTripComponent(),
          'edit-trip': this.editTripComponent(),
          'delete-trip': this.deleteTripComponent(),
          'trip-status': this.tripStatusWorkflowComponent(),
          'filter-trips': this.filterSortTripsComponent(),
          'select-current-trip': this.selectCurrentTripComponent()
        };
      case 'trip-participants':
        return {
          'participants-intro': this.understandingTripParticipantsComponent(),
          'add-participant': this.addParticipantToTripComponent(),
          'remove-participant': this.removeParticipantFromTripComponent(),
          'participant-permissions': this.participantPermissionsComponent()
        };
      default:
        return {};
    }
  }

  private loadSubcomponent(sectionId: string, subsectionId: string) {
    if (sectionId === 'get-started' && subsectionId === 'welcome') {
      this.loadWelcomeComponent();
    }
    if (sectionId === 'get-started' && subsectionId === 'test-mode') {
      this.loadTestModeComponent();
    }
    if (sectionId === 'get-started' && subsectionId === 'create-account') {
      this.loadReadyToRegisterComponent();
    }
    if (sectionId === 'overview' && subsectionId === 'key-features') {
      this.loadKeyFeaturesComponent();
    }
    if (sectionId === 'overview' && subsectionId === 'who-is-it-for') {
      this.loadWhoPlantourForComponent();
    }
    if (sectionId === 'overview' && subsectionId === 'basic-workflow') {
      this.loadBasicWorkflowComponent();
    }
    if (sectionId === 'overview' && subsectionId === 'admins-and-participants') {
      this.loadAdminsParticipantsComponent();
    }
    if (sectionId === 'account' && subsectionId === 'login') {
      this.loadSignInToAccountComponent();
    }
    if (sectionId === 'account' && subsectionId === 'profile') {
      this.loadEditYourProfileComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'travelers-intro') {
      this.loadUnderstandingTravelersComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'add-traveler') {
      this.loadAddTravelerComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'edit-traveler') {
      this.loadEditTravelerComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'delete-traveler') {
      this.loadDeleteTravelerComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'filter-travelers') {
      this.loadFilterTravelersComponent();
    }
    if (sectionId === 'things' && subsectionId === 'things-intro') {
      this.loadUnderstandingItemsComponent();
    }
    if (sectionId === 'things' && subsectionId === 'add-item') {
      this.loadAddItemComponent();
    }
    if (sectionId === 'things' && subsectionId === 'edit-item') {
      this.loadEditItemComponent();
    }
    if (sectionId === 'things' && subsectionId === 'delete-item') {
      this.loadDeleteItemComponent();
    }
    if (sectionId === 'things' && subsectionId === 'item-categories') {
      this.loadUsingCategoriesComponent();
    }
    if (sectionId === 'things' && subsectionId === 'filter-things') {
      this.loadFilterSortItemsComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'packs-intro') {
      this.loadUnderstandingBagsComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'add-bag') {
      this.loadAddBagComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'edit-bag') {
      this.loadEditBagDetailsComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'delete-bag') {
      this.loadDeleteBagComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'filter-packs') {
      this.loadFilterSortBagsComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'trips-intro') {
      this.loadUnderstandingTripsComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'create-trip') {
      this.loadCreateTripComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'edit-trip') {
      this.loadEditTripComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'delete-trip') {
      this.loadDeleteTripComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'trip-status') {
      this.loadTripStatusWorkflowComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'filter-trips') {
      this.loadFilterSortTripsComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'select-current-trip') {
      this.loadSelectCurrentTripComponent();
    }
    if (sectionId === 'trip-participants' && subsectionId === 'participants-intro') {
      this.loadUnderstandingTripParticipantsComponent();
    }
    if (sectionId === 'trip-participants' && subsectionId === 'add-participant') {
      this.loadAddParticipantToTripComponent();
    }
    if (sectionId === 'trip-participants' && subsectionId === 'remove-participant') {
      this.loadRemoveParticipantFromTripComponent();
    }
    if (sectionId === 'trip-participants' && subsectionId === 'participant-permissions') {
      this.loadParticipantPermissionsComponent();
    }
  }

  private async loadWelcomeComponent() {
    if (this.welcomeComponent()) {
      return;
    }

    const module = await import('./welcome-to-plantour/welcome-to-plantour.component');
    this.welcomeComponent.set(module.WelcomeToPlantourComponent);
  }

  private async loadTestModeComponent() {
    if (this.testModeComponent()) {
      return;
    }

    const module = await import('./using-test-mode/using-test-mode.component');
    this.testModeComponent.set(module.UsingTestModeComponent);
  }

  private async loadReadyToRegisterComponent() {
    if (this.readyToRegisterComponent()) {
      return;
    }

    const module = await import('./ready-to-register/ready-to-register.component');
    this.readyToRegisterComponent.set(module.ReadyToRegisterComponent);
  }

  private async loadKeyFeaturesComponent() {
    if (this.keyFeaturesComponent()) {
      return;
    }

    const module = await import('./key-features/key-features.component');
    this.keyFeaturesComponent.set(module.KeyFeaturesComponent);
  }

  private async loadWhoPlantourForComponent() {
    if (this.whoPlantourForComponent()) {
      return;
    }

    const module = await import('./who-plantour-for/who-plantour-for.component');
    this.whoPlantourForComponent.set(module.WhoPlantourForComponent);
  }

  private async loadBasicWorkflowComponent() {
    if (this.basicWorkflowComponent()) {
      return;
    }

    const module = await import('./basic-workflow/basic-workflow.component');
    this.basicWorkflowComponent.set(module.BasicWorkflowComponent);
  }

  private async loadAdminsParticipantsComponent() {
    if (this.adminsParticipantsComponent()) {
      return;
    }

    const module = await import('./admins-participants/admins-participants.component');
    this.adminsParticipantsComponent.set(module.AdminsParticipantsComponent);
  }

  private async loadSignInToAccountComponent() {
    if (this.signInToAccountComponent()) {
      return;
    }

    const module = await import('./sign-in-to-account/sign-in-to-account.component');
    this.signInToAccountComponent.set(module.SignInToAccountComponent);
  }

  private async loadEditYourProfileComponent() {
    if (this.editYourProfileComponent()) {
      return;
    }

    const module = await import('./edit-your-profile/edit-your-profile.component');
    this.editYourProfileComponent.set(module.EditYourProfileComponent);
  }

  private async loadUnderstandingTravelersComponent() {
    if (this.understandingTravelersComponent()) {
      return;
    }

    const module = await import('./understanding-travelers/understanding-travelers.component');
    this.understandingTravelersComponent.set(module.UnderstandingTravelersComponent);
  }

  private async loadAddTravelerComponent() {
    if (this.addTravelerComponent()) {
      return;
    }

    const module = await import('./add-traveler/add-traveler.component');
    this.addTravelerComponent.set(module.AddTravelerComponent);
  }

  private async loadEditTravelerComponent() {
    if (this.editTravelerComponent()) {
      return;
    }

    const module = await import('./edit-traveler/edit-traveler.component');
    this.editTravelerComponent.set(module.EditTravelerComponent);
  }

  private async loadDeleteTravelerComponent() {
    if (this.deleteTravelerComponent()) {
      return;
    }

    const module = await import('./delete-traveler/delete-traveler.component');
    this.deleteTravelerComponent.set(module.DeleteTravelerComponent);
  }

  private async loadFilterTravelersComponent() {
    if (this.filterTravelersComponent()) {
      return;
    }

    const module = await import('./filter-travelers/filter-travelers.component');
    this.filterTravelersComponent.set(module.FilterTravelersComponent);
  }

  private async loadUnderstandingItemsComponent() {
    if (this.understandingItemsComponent()) {
      return;
    }

    const module = await import('./understanding-items/understanding-items.component');
    this.understandingItemsComponent.set(module.UnderstandingItemsComponent);
  }

  private async loadAddItemComponent() {
    if (this.addItemComponent()) {
      return;
    }

    const module = await import('./add-item/add-item.component');
    this.addItemComponent.set(module.AddItemComponent);
  }

  private async loadEditItemComponent() {
    if (this.editItemComponent()) {
      return;
    }

    const module = await import('./edit-item/edit-item.component');
    this.editItemComponent.set(module.EditItemComponent);
  }

  private async loadDeleteItemComponent() {
    if (this.deleteItemComponent()) {
      return;
    }

    const module = await import('./delete-item/delete-item.component');
    this.deleteItemComponent.set(module.DeleteItemComponent);
  }

  private async loadUsingCategoriesComponent() {
    if (this.usingCategoriesComponent()) {
      return;
    }

    const module = await import('./using-categories/using-categories.component');
    this.usingCategoriesComponent.set(module.UsingCategoriesComponent);
  }

  private async loadFilterSortItemsComponent() {
    if (this.filterSortItemsComponent()) {
      return;
    }

    const module = await import('./filter-sort-items/filter-sort-items.component');
    this.filterSortItemsComponent.set(module.FilterSortItemsComponent);
  }

  private async loadUnderstandingBagsComponent() {
    if (this.understandingBagsComponent()) {
      return;
    }

    const module = await import('./understanding-bags/understanding-bags.component');
    this.understandingBagsComponent.set(module.UnderstandingBagsComponent);
  }

  private async loadAddBagComponent() {
    if (this.addBagComponent()) {
      return;
    }

    const module = await import('./add-bag/add-bag.component');
    this.addBagComponent.set(module.AddBagComponent);
  }

  private async loadEditBagDetailsComponent() {
    if (this.editBagDetailsComponent()) {
      return;
    }

    const module = await import('./edit-bag-details/edit-bag-details.component');
    this.editBagDetailsComponent.set(module.EditBagDetailsComponent);
  }

  private async loadDeleteBagComponent() {
    if (this.deleteBagComponent()) {
      return;
    }

    const module = await import('./delete-bag/delete-bag.component');
    this.deleteBagComponent.set(module.DeleteBagComponent);
  }

  private async loadFilterSortBagsComponent() {
    if (this.filterSortBagsComponent()) {
      return;
    }

    const module = await import('./filter-sort-bags/filter-sort-bags.component');
    this.filterSortBagsComponent.set(module.FilterSortBagsComponent);
  }

  private async loadUnderstandingTripsComponent() {
    if (this.understandingTripsComponent()) {
      return;
    }

    const module = await import('./understanding-trips/understanding-trips.component');
    this.understandingTripsComponent.set(module.UnderstandingTripsComponent);
  }

  private async loadCreateTripComponent() {
    if (this.createTripComponent()) {
      return;
    }

    const module = await import('./create-trip/create-trip.component');
    this.createTripComponent.set(module.CreateTripComponent);
  }

  private async loadEditTripComponent() {
    if (this.editTripComponent()) {
      return;
    }

    const module = await import('./edit-trip/edit-trip.component');
    this.editTripComponent.set(module.EditTripComponent);
  }

  private async loadDeleteTripComponent() {
    if (this.deleteTripComponent()) {
      return;
    }

    const module = await import('./delete-trip/delete-trip.component');
    this.deleteTripComponent.set(module.DeleteTripComponent);
  }

  private async loadTripStatusWorkflowComponent() {
    if (this.tripStatusWorkflowComponent()) {
      return;
    }

    const module = await import('./trip-status-workflow/trip-status-workflow.component');
    this.tripStatusWorkflowComponent.set(module.TripStatusWorkflowComponent);
  }

  private async loadFilterSortTripsComponent() {
    if (this.filterSortTripsComponent()) {
      return;
    }

    const module = await import('./filter-sort-trips/filter-sort-trips.component');
    this.filterSortTripsComponent.set(module.FilterSortTripsComponent);
  }

  private async loadSelectCurrentTripComponent() {
    if (this.selectCurrentTripComponent()) {
      return;
    }

    const module = await import('./select-current-trip/select-current-trip.component');
    this.selectCurrentTripComponent.set(module.SelectCurrentTripComponent);
  }

  private async loadUnderstandingTripParticipantsComponent() {
    if (this.understandingTripParticipantsComponent()) {
      return;
    }

    const module = await import('./understanding-trip-participants/understanding-trip-participants.component');
    this.understandingTripParticipantsComponent.set(module.UnderstandingTripParticipantsComponent);
  }

  private async loadAddParticipantToTripComponent() {
    if (this.addParticipantToTripComponent()) {
      return;
    }

    const module = await import('./add-participant-to-trip/add-participant-to-trip.component');
    this.addParticipantToTripComponent.set(module.AddParticipantToTripComponent);
  }

  private async loadRemoveParticipantFromTripComponent() {
    if (this.removeParticipantFromTripComponent()) {
      return;
    }

    const module = await import('./remove-participant-from-trip/remove-participant-from-trip.component');
    this.removeParticipantFromTripComponent.set(module.RemoveParticipantFromTripComponent);
  }

  private async loadParticipantPermissionsComponent() {
    if (this.participantPermissionsComponent()) {
      return;
    }

    const module = await import('./participant-permissions/participant-permissions.component');
    this.participantPermissionsComponent.set(module.ParticipantPermissionsComponent);
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
        this.localStorageService.setItem('accessToken', response.accessToken);
        this.localStorageService.setItem('refreshToken', response.refreshToken);
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


