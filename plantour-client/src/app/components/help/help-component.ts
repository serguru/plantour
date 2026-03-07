import { Component, inject, PLATFORM_ID, signal, Type } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TemporaryUserResponse, UsersService } from '../../services/users-service';
import { MessagesService } from '../../services/messages-service';
import { skip, take } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage-service';
import { CurrentTripService } from '../../services/current-trip-service';
import { HelpSectionComponent } from './help-section/help-section.component';
import { HelpSection } from './help-types';
import { SeoService } from '../../services/seo-service';

// TODO: add a link to Guest Mode video tutorial
// TODO: Help documents were genertated by AI. It is necessary to read ALL the Help documents carefully and make sure the content is OK
// TODO: put section collapsimg button in one row with section title
  // TODO: add ai templates to Help

  // TODO: make sure all the section/subsection pages are properly SSR and indexed by SEO crawlers. This is important for users to find help content through search engines.

  // TODO: add info on social login (Google + Facebook)

  // TODO: start using https://pagefind.app/ and add the search functionality. This will allow to keep the content up to date without the need to deploy new versions of the app and also will allow users to search for specific topics/questions.

  // TODO: explain the app does not support a dark theme

  // TODO: it is necessary to read carefully all the content of the help sections and make sure it is correct and does not contain any mistakes. It is also important to make sure the content is clear and easy to understand for users.
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

  document = inject(DOCUMENT);

  platformId = inject(PLATFORM_ID);

  seoService = inject(SeoService);

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
  landingExplainedComponent = signal<Type<unknown> | null>(null);
  dashboardOverviewComponent = signal<Type<unknown> | null>(null);
  tripUserInfoComponent = signal<Type<unknown> | null>(null);
  tripAllUsersInfoComponent = signal<Type<unknown> | null>(null);
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
  understandingTripBagsComponent = signal<Type<unknown> | null>(null);
  addBagToTripComponent = signal<Type<unknown> | null>(null);
  editTripBagComponent = signal<Type<unknown> | null>(null);
  removeBagFromTripComponent = signal<Type<unknown> | null>(null);
  understandingSharedItemsComponent = signal<Type<unknown> | null>(null);
  createSharedItemComponent = signal<Type<unknown> | null>(null);
  editSharedItemComponent = signal<Type<unknown> | null>(null);
  deleteSharedItemComponent = signal<Type<unknown> | null>(null);
  assignSharedItemComponent = signal<Type<unknown> | null>(null);
  unassignSharedItemComponent = signal<Type<unknown> | null>(null);
  acceptSharedItemComponent = signal<Type<unknown> | null>(null);
  rejectSharedItemComponent = signal<Type<unknown> | null>(null);
  finishSharedItemComponent = signal<Type<unknown> | null>(null);
  understandingCommentsComponent = signal<Type<unknown> | null>(null);
  addCommentComponent = signal<Type<unknown> | null>(null);
  understandingTemplatesComponent = signal<Type<unknown> | null>(null);
  itemTemplatesComponent = signal<Type<unknown> | null>(null);
  publicTemplatesComponent = signal<Type<unknown> | null>(null);
  faqGeneralComponent = signal<Type<unknown> | null>(null);
  faqPlansComponent = signal<Type<unknown> | null>(null);
  faqTripsComponent = signal<Type<unknown> | null>(null);
  faqPackingComponent = signal<Type<unknown> | null>(null);
  faqCollaborationComponent = signal<Type<unknown> | null>(null);
  askAiForItemsComponent = signal<Type<unknown> | null>(null);
  addAiItemsToDictionaryComponent = signal<Type<unknown> | null>(null);
  addAiItemsToTripOwnComponent = signal<Type<unknown> | null>(null);
  addAiItemsToTripSharedComponent = signal<Type<unknown> | null>(null);

  helpSections = signal<HelpSection[]>([
    {
      id: 'get-started',
      title: 'Get Started - No Registration Required',
      icon: 'pi pi-star',
      description: 'Try Plantour immediately with test data. Learn the basics without creating an account.',
      subsections: [
        { id: 'welcome', title: 'Welcome to Plantour' },
        { id: 'test-mode', title: 'Using Test Mode' },
        { id: 'create-account', title: 'Ready to Create Your Account?' }
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
        { id: 'login', title: 'Sign In to Your Account' },
        { id: 'profile', title: 'Edit Your Profile' }
      ]
    },
    {
      id: 'landing-dashboard',
      title: 'Landing & Dashboard',
      icon: 'pi pi-home',
      description: 'Understand the first screens: Landing page and Dashboard trip summaries.',
      subsections: [
        { id: 'landing-explained', title: 'Landing explained' },
        { id: 'dashboard-overview', title: 'Dashboard overview' },
        { id: 'trip-user-info', title: 'Trip user info' },
        { id: 'trip-all-users-info', title: 'Trip all users info' }
      ]
    },
    {
      id: 'travelers',
      title: 'Travelers Module',
      icon: 'pi pi-users',
      description: 'Manage people who participate in your trips.',
      subsections: [
        { id: 'travelers-intro', title: 'Understanding Travelers' },
        { id: 'add-traveler', title: 'Add a Traveler' },
        { id: 'edit-traveler', title: 'Edit Traveler Information' },
        { id: 'delete-traveler', title: 'Delete a Traveler' },
        { id: 'filter-travelers', title: 'Filter and Sort Travelers' }
      ]
    },
    {
      id: 'things',
      title: 'Items Module',
      icon: 'pi pi-shopping-bag',
      description: 'Create and manage packing items.',
      subsections: [
        { id: 'things-intro', title: 'Understanding Items' },
        { id: 'add-item', title: 'Add an Item' },
        { id: 'edit-item', title: 'Edit Item Details' },
        { id: 'delete-item', title: 'Delete an Item' },
        { id: 'item-categories', title: 'Using Categories' },
        { id: 'filter-things', title: 'Filter and Sort Items' }
      ]
    },
    {
      id: 'ai-recommendations',
      title: 'AI Item Recommendations',
      icon: 'pi pi-sparkles',
      description: 'Use AI to get personalized packing suggestions for your trip.',
      subsections: [
        { id: 'ask-ai', title: 'Ask AI for Item Recommendations' },
        { id: 'add-to-dictionary', title: 'Add AI Items to Your Dictionary' },
        { id: 'add-to-trip-own', title: 'Add AI Items to Trip Own Items' },
        { id: 'add-to-trip-shared', title: 'Add AI Items to Trip Shared Items' }
      ]
    },
    {
      id: 'packs',
      title: 'Bags Module',
      icon: 'pi pi-briefcase',
      description: 'Organize luggage and packages.',
      subsections: [
        { id: 'packs-intro', title: 'Understanding Bags' },
        { id: 'add-bag', title: 'Add a Bag' },
        { id: 'edit-bag', title: 'Edit Bag Details' },
        { id: 'delete-bag', title: 'Delete a Bag' },
        { id: 'filter-packs', title: 'Filter and Sort Bags' }
      ]
    },
    {
      id: 'trips',
      title: 'Trips Module',
      icon: 'pi pi-map',
      description: 'Create and manage your trips.',
      subsections: [
        { id: 'trips-intro', title: 'Understanding Trips' },
        { id: 'create-trip', title: 'Create a New Trip' },
        { id: 'edit-trip', title: 'Edit Trip Details' },
        { id: 'delete-trip', title: 'Delete a Trip' },
        { id: 'trip-status', title: 'Trip Status Workflow' },
        { id: 'filter-trips', title: 'Filter and Sort Trips' },
        { id: 'select-current-trip', title: 'Select Current Trip' }
      ]
    },
    {
      id: 'trip-participants',
      title: 'Trip Participants',
      icon: 'pi pi-users',
      description: 'Add and manage people in your trip.',
      subsections: [
        { id: 'participants-intro', title: 'Understanding Trip Participants' },
        { id: 'add-participant', title: 'Add Participant to Trip' },
        { id: 'remove-participant', title: 'Remove Participant from Trip' },
        { id: 'participant-permissions', title: 'Participant Permissions' }
      ]
    },
    {
      id: 'trip-packs',
      title: 'Trip Bags',
      icon: 'pi pi-briefcase',
      description: 'Assign luggage to trip participants.',
      subsections: [
        { id: 'trip-packs-intro', title: 'Understanding Trip Bags' },
        { id: 'add-bag-to-trip', title: 'Add Bag to Trip' },
        { id: 'edit-trip-bag', title: 'Edit Trip Bag' },
        { id: 'remove-bag-from-trip', title: 'Remove Bag from Trip' }
      ]
    },
    {
      id: 'shared-things',
      title: 'Shared Items',
      icon: 'pi pi-share-alt',
      description: 'Share items between trip participants.',
      subsections: [
        { id: 'shared-intro', title: 'Understanding Shared Items' },
        { id: 'create-shared-item', title: 'Create a Shared Item' },
        { id: 'edit-shared-item', title: 'Edit Shared Item' },
        { id: 'delete-shared-item', title: 'Delete Shared Item' },
        { id: 'assign-shared-item', title: 'Assign Shared Item' },
        { id: 'unassign-shared-item', title: 'Unassign Shared Item' },
        { id: 'accept-shared-item', title: 'Accept Shared Item' },
        { id: 'reject-shared-item', title: 'Reject Shared Item' },
        { id: 'finish-shared-item', title: 'Finish Shared Item' },
      ]
    },
    {
      id: 'trip-comments',
      title: 'Trip Comments',
      icon: 'pi pi-comments',
      description: 'Collaborate with notes and comments.',
      subsections: [
        { id: 'comments-intro', title: 'Understanding Comments' },
        { id: 'add-comment', title: 'Add a Comment' }
      ]
    },
    {
      id: 'filtering-sorting',
      title: 'Filtering and Sorting',
      icon: 'pi pi-filter',
      description: 'Find items quickly with filters and sorting.',
      subsections: [
        { id: 'filters-intro', title: 'Using Filters' },
        { id: 'sort-items', title: 'Sort Items' },
        { id: 'search', title: 'Search for Items' },
        { id: 'clear-filters', title: 'Clear Filters' }
      ]
    },
    {
      id: 'templates',
      title: 'Templates',
      icon: 'pi pi-clone',
      description: 'Use item templates to speed up item list creation.',
      subsections: [
        { id: 'templates-intro', title: 'Understanding Templates' },
        { id: 'item-templates', title: 'Item Templates' },
        { id: 'public-templates', title: 'Public Templates' }
      ]
    },
    // {
    //   id: 'tips',
    //   title: 'Tips & Best Practices',
    //   icon: 'pi pi-lightbulb',
    //   description: 'Get the most from Plantour.',
    //   subsections: [
    //     { id: 'planning-tips', title: 'Trip Planning Tips', linkId: 'link#67' },
    //     { id: 'packing-strategies', title: 'Packing Strategies', linkId: 'link#68' },
    //     { id: 'organization-tips', title: 'Organization Tips', linkId: 'link#69' },
    //     { id: 'team-coordination', title: 'Team Coordination', linkId: 'link#70' }
    //   ]
    // },
    // {
    //   id: 'troubleshooting',
    //   title: 'Troubleshooting',
    //   icon: 'pi pi-wrench',
    //   description: 'Common issues and solutions.',
    //   subsections: [
    //     { id: 'common-problems', title: 'Common Problems', linkId: 'link#71' },
    //     { id: 'error-messages', title: 'Error Messages Explained', linkId: 'link#72' },
    //     { id: 'cant-delete', title: 'Why Can\'t I Delete This?', linkId: 'link#73' },
    //     { id: 'missing-items', title: 'Items Not Showing Up', linkId: 'link#74' }
    //   ]
    // },
    {
      id: 'faq',
      title: 'FAQ',
      icon: 'pi pi-question-circle',
      description: 'Frequently asked questions.',
      subsections: [
        { id: 'faq-general', title: 'General Questions' },
        { id: 'faq-account', title: 'Plans Questions' },
        { id: 'faq-trips', title: 'Trip Questions' },
        { id: 'faq-packing', title: 'Packing Questions' },
        { id: 'faq-collaboration', title: 'Collaboration Questions' }
      ]
    }
  ]);

  expandedSectionId = signal<string | null>(null);
  selectedSubsection = signal<{ sectionId: string; subsectionId: string } | null>(null);

  expandedSubSectionId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    // Apply initial route selection early (important for SSR).
    await this.applyRouteSelection(
      this.route.snapshot.paramMap.get('section'),
      this.route.snapshot.paramMap.get('subsection'),
    );

    // React to in-app navigation between help pages.
    this.route.paramMap.pipe(skip(1)).subscribe(params => {
      void this.applyRouteSelection(params.get('section'), params.get('subsection'));
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
      void this.router.navigate(['/help']);
      return;
    }
    
    this.selectedSubsection.set(selection);

    // Update URL for shareability/crawlability; actual loading + SEO happens via route handler.
    void this.router.navigate(['/help', selection.sectionId, selection.subsectionId]);
  }

  private scrollToSubsection() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = this.document.querySelector('.subsection-content-wrapper');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private async applyRouteSelection(sectionId: string | null, subsectionId: string | null): Promise<void> {
    if (!sectionId || !subsectionId) {
      this.selectedSubsection.set(null);
      this.setHelpIndexSeo();
      return;
    }

    this.expandedSectionId.set(sectionId);
    this.selectedSubsection.set({ sectionId, subsectionId });
    await this.loadSubcomponent(sectionId, subsectionId);
    this.setHelpArticleSeo(sectionId, subsectionId);

    // Scroll after rendering (browser-only)
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.scrollToSubsection(), 100);
    }
  }

  private setHelpIndexSeo(): void {
    const canonicalUrl = this.toAbsoluteUrl('/help');
    const title = 'Help & Documentation | Plantour';
    const description =
      'Plantour Help Center: step-by-step guides for trips, packing lists, travelers, bags, shared items, templates, and collaboration.';

    this.seoService.setSeo({
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      jsonLd: this.helpJsonLd({
        canonicalUrl,
        title,
        description,
      }),
    });
  }

  private setHelpArticleSeo(sectionId: string, subsectionId: string): void {
    const { title, description } = this.getHelpArticleMeta(sectionId, subsectionId);
    const canonicalUrl = this.toAbsoluteUrl(`/help/${sectionId}/${subsectionId}`);

    this.seoService.setSeo({
      title,
      description,
      canonicalUrl,
      ogType: 'article',
      jsonLd: this.helpJsonLd({
        canonicalUrl,
        title,
        description,
      }),
    });
  }

  private getHelpArticleMeta(sectionId: string, subsectionId: string): { title: string; description: string } {
    const section = this.helpSections().find(s => s.id === sectionId);
    const subsection = section?.subsections?.find(ss => ss.id === subsectionId);

    const sectionTitle = section?.title ?? 'Help';
    const subsectionTitle = subsection?.title ?? 'Guide';
    const title = `${subsectionTitle} | ${sectionTitle} | Plantour Help`;

    const base = section?.description ?? 'Plantour Help Center documentation.';
    const description = this.trimDescription(
      `${base} Learn about “${subsectionTitle}” with clear steps and practical tips.`,
    );

    return { title, description };
  }

  private trimDescription(value: string, maxLen = 160): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLen) {
      return normalized;
    }
    return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
  }

  private toAbsoluteUrl(path: string): string {
    try {
      return new URL(path, this.document.baseURI).toString();
    } catch {
      return path;
    }
  }

  private helpJsonLd(input: { canonicalUrl: string; title: string; description: string }): Record<string, unknown> {
    const homeUrl = this.toAbsoluteUrl('/');
    const helpUrl = this.toAbsoluteUrl('/help');

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: homeUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Help',
              item: helpUrl,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: input.title.replace(/ \| Plantour Help$/, ''),
              item: input.canonicalUrl,
            },
          ],
        },
        {
          '@type': 'Article',
          headline: input.title,
          description: input.description,
          mainEntityOfPage: input.canonicalUrl,
          author: {
            '@type': 'Organization',
            name: 'Plantour',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Plantour',
          },
        },
      ],
    };
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
      case 'landing-dashboard':
        return {
          'landing-explained': this.landingExplainedComponent(),
          'dashboard-overview': this.dashboardOverviewComponent(),
          'trip-user-info': this.tripUserInfoComponent(),
          'trip-all-users-info': this.tripAllUsersInfoComponent()
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
      case 'ai-recommendations':
        return {
          'ask-ai': this.askAiForItemsComponent(),
          'add-to-dictionary': this.addAiItemsToDictionaryComponent(),
          'add-to-trip-own': this.addAiItemsToTripOwnComponent(),
          'add-to-trip-shared': this.addAiItemsToTripSharedComponent()
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
      case 'trip-packs':
        return {
          'trip-packs-intro': this.understandingTripBagsComponent(),
          'add-bag-to-trip': this.addBagToTripComponent(),
          'edit-trip-bag': this.editTripBagComponent(),
          'remove-bag-from-trip': this.removeBagFromTripComponent()
        };
      case 'shared-things':
        return {
          'shared-intro': this.understandingSharedItemsComponent(),
          'create-shared-item': this.createSharedItemComponent(),
          'edit-shared-item': this.editSharedItemComponent(),
          'delete-shared-item': this.deleteSharedItemComponent(),
          'assign-shared-item': this.assignSharedItemComponent(),
          'unassign-shared-item': this.unassignSharedItemComponent(),
          'accept-shared-item': this.acceptSharedItemComponent(),
          'reject-shared-item': this.rejectSharedItemComponent(),
          'finish-shared-item': this.finishSharedItemComponent()
        };
      case 'trip-comments':
        return {
          'comments-intro': this.understandingCommentsComponent(),
          'add-comment': this.addCommentComponent()
        };
      case 'templates':
        return {
          'templates-intro': this.understandingTemplatesComponent(),
          'item-templates': this.itemTemplatesComponent(),
          'public-templates': this.publicTemplatesComponent()
        };
      case 'faq':
        return {
          'faq-general': this.faqGeneralComponent(),
          'faq-account': this.faqPlansComponent(),
          'faq-trips': this.faqTripsComponent(),
          'faq-packing': this.faqPackingComponent(),
          'faq-collaboration': this.faqCollaborationComponent()
        };
      default:
        return {};
    }
  }

  private loadSubcomponent(sectionId: string, subsectionId: string): Promise<void> {
    if (sectionId === 'get-started' && subsectionId === 'welcome') {
      return this.loadWelcomeComponent();
    }
    if (sectionId === 'get-started' && subsectionId === 'test-mode') {
      return this.loadTestModeComponent();
    }
    if (sectionId === 'get-started' && subsectionId === 'create-account') {
      return this.loadReadyToRegisterComponent();
    }
    if (sectionId === 'overview' && subsectionId === 'key-features') {
      return this.loadKeyFeaturesComponent();
    }
    if (sectionId === 'overview' && subsectionId === 'who-is-it-for') {
      return this.loadWhoPlantourForComponent();
    }
    if (sectionId === 'overview' && subsectionId === 'basic-workflow') {
      return this.loadBasicWorkflowComponent();
    }
    if (sectionId === 'overview' && subsectionId === 'admins-and-participants') {
      return this.loadAdminsParticipantsComponent();
    }
    if (sectionId === 'account' && subsectionId === 'login') {
      return this.loadSignInToAccountComponent();
    }
    if (sectionId === 'account' && subsectionId === 'profile') {
      return this.loadEditYourProfileComponent();
    }
    if (sectionId === 'landing-dashboard' && subsectionId === 'landing-explained') {
      return this.loadLandingExplainedComponent();
    }
    if (sectionId === 'landing-dashboard' && subsectionId === 'dashboard-overview') {
      return this.loadDashboardOverviewComponent();
    }
    if (sectionId === 'landing-dashboard' && subsectionId === 'trip-user-info') {
      return this.loadTripUserInfoComponent();
    }
    if (sectionId === 'landing-dashboard' && subsectionId === 'trip-all-users-info') {
      return this.loadTripAllUsersInfoComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'travelers-intro') {
      return this.loadUnderstandingTravelersComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'add-traveler') {
      return this.loadAddTravelerComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'edit-traveler') {
      return this.loadEditTravelerComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'delete-traveler') {
      return this.loadDeleteTravelerComponent();
    }
    if (sectionId === 'travelers' && subsectionId === 'filter-travelers') {
      return this.loadFilterTravelersComponent();
    }
    if (sectionId === 'things' && subsectionId === 'things-intro') {
      return this.loadUnderstandingItemsComponent();
    }
    if (sectionId === 'things' && subsectionId === 'add-item') {
      return this.loadAddItemComponent();
    }
    if (sectionId === 'things' && subsectionId === 'edit-item') {
      return this.loadEditItemComponent();
    }
    if (sectionId === 'things' && subsectionId === 'delete-item') {
      return this.loadDeleteItemComponent();
    }
    if (sectionId === 'things' && subsectionId === 'item-categories') {
      return this.loadUsingCategoriesComponent();
    }
    if (sectionId === 'things' && subsectionId === 'filter-things') {
      return this.loadFilterSortItemsComponent();
    }
    if (sectionId === 'ai-recommendations' && subsectionId === 'ask-ai') {
      return this.loadAskAiForItemsComponent();
    }
    if (sectionId === 'ai-recommendations' && subsectionId === 'add-to-dictionary') {
      return this.loadAddAiItemsToDictionaryComponent();
    }
    if (sectionId === 'ai-recommendations' && subsectionId === 'add-to-trip-own') {
      return this.loadAddAiItemsToTripOwnComponent();
    }
    if (sectionId === 'ai-recommendations' && subsectionId === 'add-to-trip-shared') {
      return this.loadAddAiItemsToTripSharedComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'packs-intro') {
      return this.loadUnderstandingBagsComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'add-bag') {
      return this.loadAddBagComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'edit-bag') {
      return this.loadEditBagDetailsComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'delete-bag') {
      return this.loadDeleteBagComponent();
    }
    if (sectionId === 'packs' && subsectionId === 'filter-packs') {
      return this.loadFilterSortBagsComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'trips-intro') {
      return this.loadUnderstandingTripsComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'create-trip') {
      return this.loadCreateTripComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'edit-trip') {
      return this.loadEditTripComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'delete-trip') {
      return this.loadDeleteTripComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'trip-status') {
      return this.loadTripStatusWorkflowComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'filter-trips') {
      return this.loadFilterSortTripsComponent();
    }
    if (sectionId === 'trips' && subsectionId === 'select-current-trip') {
      return this.loadSelectCurrentTripComponent();
    }
    if (sectionId === 'trip-participants' && subsectionId === 'participants-intro') {
      return this.loadUnderstandingTripParticipantsComponent();
    }
    if (sectionId === 'trip-participants' && subsectionId === 'add-participant') {
      return this.loadAddParticipantToTripComponent();
    }
    if (sectionId === 'trip-participants' && subsectionId === 'remove-participant') {
      return this.loadRemoveParticipantFromTripComponent();
    }
    if (sectionId === 'trip-participants' && subsectionId === 'participant-permissions') {
      return this.loadParticipantPermissionsComponent();
    }
    if (sectionId === 'trip-packs' && subsectionId === 'trip-packs-intro') {
      return this.loadUnderstandingTripBagsComponent();
    }
    if (sectionId === 'trip-packs' && subsectionId === 'add-bag-to-trip') {
      return this.loadAddBagToTripComponent();
    }
    if (sectionId === 'trip-packs' && subsectionId === 'edit-trip-bag') {
      return this.loadEditTripBagComponent();
    }
    if (sectionId === 'trip-packs' && subsectionId === 'remove-bag-from-trip') {
      return this.loadRemoveBagFromTripComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'shared-intro') {
      return this.loadUnderstandingSharedItemsComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'create-shared-item') {
      return this.loadCreateSharedItemComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'edit-shared-item') {
      return this.loadEditSharedItemComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'delete-shared-item') {
      return this.loadDeleteSharedItemComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'assign-shared-item') {
      return this.loadAssignSharedItemComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'unassign-shared-item') {
      return this.loadUnassignSharedItemComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'accept-shared-item') {
      return this.loadAcceptSharedItemComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'reject-shared-item') {
      return this.loadRejectSharedItemComponent();
    }
    if (sectionId === 'shared-things' && subsectionId === 'finish-shared-item') {
      return this.loadFinishSharedItemComponent();
    }
    if (sectionId === 'trip-comments' && subsectionId === 'comments-intro') {
      return this.loadUnderstandingCommentsComponent();
    }
    if (sectionId === 'trip-comments' && subsectionId === 'add-comment') {
      return this.loadAddCommentComponent();
    }
    if (sectionId === 'templates' && subsectionId === 'templates-intro') {
      return this.loadUnderstandingTemplatesComponent();
    }
    if (sectionId === 'templates' && subsectionId === 'item-templates') {
      return this.loadItemTemplatesComponent();
    }
    if (sectionId === 'templates' && subsectionId === 'public-templates') {
      return this.loadPublicTemplatesComponent();
    }
    if (sectionId === 'faq' && subsectionId === 'faq-general') {
      return this.loadFaqGeneralComponent();
    }
    if (sectionId === 'faq' && subsectionId === 'faq-account') {
      return this.loadFaqPlansComponent();
    }
    if (sectionId === 'faq' && subsectionId === 'faq-trips') {
      return this.loadFaqTripsComponent();
    }
    if (sectionId === 'faq' && subsectionId === 'faq-packing') {
      return this.loadFaqPackingComponent();
    }
    if (sectionId === 'faq' && subsectionId === 'faq-collaboration') {
      return this.loadFaqCollaborationComponent();
    }

    return Promise.resolve();
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

  private async loadLandingExplainedComponent() {
    if (this.landingExplainedComponent()) {
      return;
    }

    const module = await import('./landing-explained/landing-explained.component');
    this.landingExplainedComponent.set(module.LandingExplainedComponent);
  }

  private async loadDashboardOverviewComponent() {
    if (this.dashboardOverviewComponent()) {
      return;
    }

    const module = await import('./dashboard-overview/dashboard-overview.component');
    this.dashboardOverviewComponent.set(module.DashboardOverviewComponent);
  }

  private async loadTripUserInfoComponent() {
    if (this.tripUserInfoComponent()) {
      return;
    }

    const module = await import('./trip-user-info/trip-user-info.component');
    this.tripUserInfoComponent.set(module.TripUserInfoComponent);
  }

  private async loadTripAllUsersInfoComponent() {
    if (this.tripAllUsersInfoComponent()) {
      return;
    }

    const module = await import('./trip-all-users-info/trip-all-users-info.component');
    this.tripAllUsersInfoComponent.set(module.TripAllUsersInfoComponent);
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

  private async loadUnderstandingTripBagsComponent() {
    if (this.understandingTripBagsComponent()) {
      return;
    }

    const module = await import('./understanding-trip-bags/understanding-trip-bags.component');
    this.understandingTripBagsComponent.set(module.UnderstandingTripBagsComponent);
  }

  private async loadAddBagToTripComponent() {
    if (this.addBagToTripComponent()) {
      return;
    }

    const module = await import('./add-bag-to-trip/add-bag-to-trip.component');
    this.addBagToTripComponent.set(module.AddBagToTripComponent);
  }

  private async loadEditTripBagComponent() {
    if (this.editTripBagComponent()) {
      return;
    }

    const module = await import('./edit-trip-bag/edit-trip-bag.component');
    this.editTripBagComponent.set(module.EditTripBagComponent);
  }

  private async loadRemoveBagFromTripComponent() {
    if (this.removeBagFromTripComponent()) {
      return;
    }

    const module = await import('./remove-bag-from-trip/remove-bag-from-trip.component');
    this.removeBagFromTripComponent.set(module.RemoveBagFromTripComponent);
  }

  private async loadUnderstandingSharedItemsComponent() {
    if (this.understandingSharedItemsComponent()) {
      return;
    }

    const module = await import('./understanding-shared-items/understanding-shared-items.component');
    this.understandingSharedItemsComponent.set(module.UnderstandingSharedItemsComponent);
  }

  private async loadCreateSharedItemComponent() {
    if (this.createSharedItemComponent()) {
      return;
    }

    const module = await import('./create-shared-item/create-shared-item.component');
    this.createSharedItemComponent.set(module.CreateSharedItemComponent);
  }

  private async loadEditSharedItemComponent() {
    if (this.editSharedItemComponent()) {
      return;
    }

    const module = await import('./edit-shared-item/edit-shared-item.component');
    this.editSharedItemComponent.set(module.EditSharedItemComponent);
  }

  private async loadDeleteSharedItemComponent() {
    if (this.deleteSharedItemComponent()) {
      return;
    }

    const module = await import('./delete-shared-item/delete-shared-item.component');
    this.deleteSharedItemComponent.set(module.DeleteSharedItemComponent);
  }

  private async loadAssignSharedItemComponent() {
    if (this.assignSharedItemComponent()) {
      return;
    }

    const module = await import('./assign-shared-item/assign-shared-item.component');
    this.assignSharedItemComponent.set(module.AssignSharedItemComponent);
  }

  private async loadUnassignSharedItemComponent() {
    if (this.unassignSharedItemComponent()) {
      return;
    }

    const module = await import('./unassign-shared-item/unassign-shared-item.component');
    this.unassignSharedItemComponent.set(module.UnassignSharedItemComponent);
  }

  private async loadAcceptSharedItemComponent() {
    if (this.acceptSharedItemComponent()) {
      return;
    }

    const module = await import('./accept-shared-item/accept-shared-item.component');
    this.acceptSharedItemComponent.set(module.AcceptSharedItemComponent);
  }

  private async loadRejectSharedItemComponent() {
    if (this.rejectSharedItemComponent()) {
      return;
    }

    const module = await import('./reject-shared-item/reject-shared-item.component');
    this.rejectSharedItemComponent.set(module.RejectSharedItemComponent);
  }

  private async loadFinishSharedItemComponent() {
    if (this.finishSharedItemComponent()) {
      return;
    }

    const module = await import('./finish-shared-item/finish-shared-item.component');
    this.finishSharedItemComponent.set(module.FinishSharedItemComponent);
  }

  private async loadUnderstandingCommentsComponent() {
    if (this.understandingCommentsComponent()) {
      return;
    }

    const module = await import('./understanding-comments/understanding-comments.component');
    this.understandingCommentsComponent.set(module.UnderstandingCommentsComponent);
  }

  private async loadAddCommentComponent() {
    if (this.addCommentComponent()) {
      return;
    }

    const module = await import('./add-comment/add-comment.component');
    this.addCommentComponent.set(module.AddCommentComponent);
  }

  private async loadUnderstandingTemplatesComponent() {
    if (this.understandingTemplatesComponent()) {
      return;
    }

    const module = await import('./understanding-templates/understanding-templates.component');
    this.understandingTemplatesComponent.set(module.UnderstandingTemplatesComponent);
  }

  private async loadItemTemplatesComponent() {
    if (this.itemTemplatesComponent()) {
      return;
    }

    const module = await import('./item-templates/item-templates.component');
    this.itemTemplatesComponent.set(module.ItemTemplatesComponent);
  }

  private async loadPublicTemplatesComponent() {
    if (this.publicTemplatesComponent()) {
      return;
    }

    const module = await import('./public-templates/public-templates.component');
    this.publicTemplatesComponent.set(module.PublicTemplatesComponent);
  }

  private async loadFaqGeneralComponent() {
    if (this.faqGeneralComponent()) {
      return;
    }

    const module = await import('./faq-general/faq-general.component');
    this.faqGeneralComponent.set(module.FaqGeneralComponent);
  }

  private async loadFaqPlansComponent() {
    if (this.faqPlansComponent()) {
      return;
    }

    const module = await import('./faq-plans/faq-plans.component');
    this.faqPlansComponent.set(module.FaqPlansComponent);
  }

  private async loadFaqTripsComponent() {
    if (this.faqTripsComponent()) {
      return;
    }

    const module = await import('./faq-trips/faq-trips.component');
    this.faqTripsComponent.set(module.FaqTripsComponent);
  }

  private async loadFaqPackingComponent() {
    if (this.faqPackingComponent()) {
      return;
    }

    const module = await import('./faq-packing/faq-packing.component');
    this.faqPackingComponent.set(module.FaqPackingComponent);
  }

  private async loadFaqCollaborationComponent() {
    if (this.faqCollaborationComponent()) {
      return;
    }

    const module = await import('./faq-collaboration/faq-collaboration.component');
    this.faqCollaborationComponent.set(module.FaqCollaborationComponent);
  }

  private async loadAskAiForItemsComponent() {
    if (this.askAiForItemsComponent()) {
      return;
    }

    const module = await import('./ai-recommendations/ask-ai-for-items/ask-ai-for-items.component');
    this.askAiForItemsComponent.set(module.AskAiForItemsComponent);
  }

  private async loadAddAiItemsToDictionaryComponent() {
    if (this.addAiItemsToDictionaryComponent()) {
      return;
    }

    const module = await import('./ai-recommendations/add-ai-items-to-dictionary/add-ai-items-to-dictionary.component');
    this.addAiItemsToDictionaryComponent.set(module.AddAiItemsToDictionaryComponent);
  }

  private async loadAddAiItemsToTripOwnComponent() {
    if (this.addAiItemsToTripOwnComponent()) {
      return;
    }

    const module = await import('./ai-recommendations/add-ai-items-to-trip-own/add-ai-items-to-trip-own.component');
    this.addAiItemsToTripOwnComponent.set(module.AddAiItemsToTripOwnComponent);
  }

  private async loadAddAiItemsToTripSharedComponent() {
    if (this.addAiItemsToTripSharedComponent()) {
      return;
    }

    const module = await import('./ai-recommendations/add-ai-items-to-trip-shared/add-ai-items-to-trip-shared.component');
    this.addAiItemsToTripSharedComponent.set(module.AddAiItemsToTripSharedComponent);
  }
}






