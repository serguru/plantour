import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CurrentTripService } from '../../services/current-trip-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { MessagesService } from '../../services/messages-service';
import { UsersService } from '../../services/users-service';
import { EntitiesHeader } from '../entities/entities-header-component/entities-header-component';

interface DashboardLink {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: string | null;
  action?: () => void | Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

interface DashboardSection {
  id: string;
  title: string;
  summary: string;
  icon: string;
  accent: string;
  links: DashboardLink[];
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, EntitiesHeader],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss']
})
export class DashboardComponent {
  componentId = 'dashboard';
  private readonly expandedSectionsStorageKey = 'expandedSections';

  private readonly usersService = inject(UsersService);
  private readonly currentTripService = inject(CurrentTripService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly messagesService = inject(MessagesService);

  readonly currentTrip = toSignal(this.currentTripService.currentTripDto$, { initialValue: null });
  readonly expandedSections = signal<Record<string, boolean>>({});

  readonly sections = computed<DashboardSection[]>(() => {
    const trip = this.currentTrip();
    const tripId = trip?.id;
    const hasTrip = !!tripId;
    const isAuthenticated = this.usersService.isAuthenticatedSignal();
    const participantOnlyDisabled = !hasTrip || !trip?.currentUserIncluded;

    return [
      {
        id: 'dictionary',
        title: 'Dictionary',
        summary: 'Build your reusable travelers, items, todos, bags, keys, templates, and AI prompts.',
        icon: 'pi pi-clone',
        accent: '#3a9aa8',
        links: [
          {
            id: 'travelers',
            title: 'Travelers',
            description: 'Manage people you can reuse in future trips.',
            icon: 'pi pi-compass',
            route: '/travelers'
          },
          {
            id: 'things',
            title: 'Items',
            description: 'Keep a personal item dictionary ready for any trip.',
            icon: 'pi pi-objects-column',
            route: '/things'
          },
          {
            id: 'todos',
            title: 'Todos',
            description: 'Save reusable tasks and reminders.',
            icon: 'pi pi-check-square',
            route: '/todos'
          },
          {
            id: 'packs',
            title: 'Bags',
            description: 'Prepare bag templates before you start packing.',
            icon: 'pi pi-shopping-bag',
            route: '/packs'
          },
          {
            id: 'keys',
            title: 'Keys',
            description: 'Store private keys and mark which ones are active.',
            icon: 'pi pi-key',
            route: '/keys'
          },
          {
            id: 'templates',
            title: 'Template items',
            description: 'Copy predefined packing ideas into your own data.',
            icon: 'pi pi-briefcase',
            route: '/templates'
          }
        ]
      },
      {
        id: 'trip',
        title: 'Trip',
        summary: hasTrip
          ? `Open the main trip pages for ${trip?.name}.`
          : 'Pick a current trip first, then return here for main trip pages.',
        icon: 'pi pi-compass',
        accent: '#2f7c87',
        links: [
          {
            id: 'trips',
            title: 'Trips',
            description: 'Create, choose, and review your trips.',
            icon: 'pi pi-compass',
            route: '/trips'
          },
          {
            id: 'trip-info',
            title: 'Trip info',
            description: 'Review quick trip summary panels for you and other users.',
            icon: 'pi pi-info-circle',
            route: '/trip-info'
          },
          {
            id: 'trip-itinerary',
            title: 'Itinerary',
            description: 'Arrange trip parts and see what happens when.',
            icon: 'pi pi-map',
            route: tripId ? `/trips/${tripId}/itinerary` : '/trips',
            disabled: participantOnlyDisabled,
            disabledReason: hasTrip
              ? 'Available only when you are included in the selected trip.'
              : 'Select a trip first.'
          },
          {
            id: 'trip-map',
            title: 'Map',
            description: 'View the current trip itinerary on the map.',
            icon: 'pi pi-map-marker',
            route: tripId ? `/trips/${tripId}/itinerary/map` : '/trips',
            disabled: !hasTrip,
            disabledReason: 'Select a trip first.'
          },
          {
            id: 'trip-participants',
            title: 'Participants',
            description: 'See who joins the current trip.',
            icon: 'pi pi-users',
            route: tripId ? `/trips/${tripId}/trip-participants` : '/trips',
            disabled: !hasTrip,
            disabledReason: 'Select a trip first.'
          }
        ]
      },
      {
        id: 'trip-personal',
        title: 'Trip personal',
        summary: hasTrip
          ? `Open your personal trip pages for ${trip?.name}.`
          : 'Pick a current trip first, then return here for your personal trip pages.',
        icon: 'pi pi-user',
        accent: '#3f8f6b',
        links: [
          {
            id: 'trip-packs',
            title: 'Bags',
            description: 'Pack the current trip using your bag setup.',
            icon: 'pi pi-shopping-bag',
            route: tripId ? `/trips/${tripId}/trip-packs` : '/trips',
            disabled: participantOnlyDisabled,
            disabledReason: hasTrip
              ? 'Available only when you are included in the selected trip.'
              : 'Select a trip first.'
          },
          {
            id: 'trip-things',
            title: 'Items',
            description: 'Work with personal items inside the trip.',
            icon: 'pi pi-objects-column',
            route: tripId ? `/trips/${tripId}/trip-things` : '/trips',
            disabled: participantOnlyDisabled,
            disabledReason: hasTrip
              ? 'Available only when you are included in the selected trip.'
              : 'Select a trip first.'
          },
          {
            id: 'trip-todos',
            title: 'Todos',
            description: 'Track trip-specific tasks for yourself.',
            icon: 'pi pi-check-square',
            route: tripId ? `/trips/${tripId}/trip-todos` : '/trips',
            disabled: participantOnlyDisabled,
            disabledReason: hasTrip
              ? 'Available only when you are included in the selected trip.'
              : 'Select a trip first.'
          },
          {
            id: 'trip-activities-personal',
            title: 'Activities',
            description: 'Keep your private activity plan for the trip.',
            icon: 'pi pi-user',
            route: tripId ? `/trips/${tripId}/trip-activities/personal` : '/trips',
            disabled: participantOnlyDisabled,
            disabledReason: hasTrip
              ? 'Available only when you are included in the selected trip.'
              : 'Select a trip first.'
          },
          {
            id: 'trip-expenses',
            title: 'Expenses',
            description: 'Track personal costs for the selected trip.',
            icon: 'pi pi-wallet',
            route: tripId ? `/trips/${tripId}/trip-expenses` : '/trips',
            disabled: participantOnlyDisabled,
            disabledReason: hasTrip
              ? 'Available only when you are included in the selected trip.'
              : 'Select a trip first.'
          },
          {
            id: 'trip-notes',
            title: 'Notes',
            description: 'Write personal rich-text notes and export marked notes to PDF.',
            icon: 'pi pi-book',
            route: tripId ? `/trips/${tripId}/trip-notes` : '/trips',
            disabled: participantOnlyDisabled,
            disabledReason: hasTrip
              ? 'Available only when you are included in the selected trip.'
              : 'Select a trip first.'
          }
        ]
      },
      {
        id: 'trip-shared-group',
        title: 'Trip Shared',
        summary: hasTrip
          ? `Open pages shared with other participants for ${trip?.name}.`
          : 'Pick a current trip first, then return here for shared trip pages.',
        icon: 'pi pi-users',
        accent: '#7a6bb8',
        links: [
          {
            id: 'trip-shared',
            title: 'Items',
            description: 'Manage items used together with other participants.',
            icon: 'pi pi-link',
            route: tripId ? `/trips/${tripId}/trip-shared` : '/trips',
            disabled: !hasTrip,
            disabledReason: 'Select a trip first.'
          },
          {
            id: 'trip-shared-todos',
            title: 'Todos',
            description: 'Coordinate shared tasks for the trip.',
            icon: 'pi pi-list-check',
            route: tripId ? `/trips/${tripId}/trip-shared-todos` : '/trips',
            disabled: !hasTrip,
            disabledReason: 'Select a trip first.'
          },
          {
            id: 'trip-activities-public',
            title: 'Activities',
            description: 'Review activities visible to the whole trip.',
            icon: 'pi pi-globe',
            route: tripId ? `/trips/${tripId}/trip-activities/public` : '/trips',
            disabled: participantOnlyDisabled,
            disabledReason: hasTrip
              ? 'Available only when you are included in the selected trip.'
              : 'Select a trip first.'
          },
          {
            id: 'trip-shared-expenses',
            title: 'Expenses',
            description: 'Track common trip spending and balances.',
            icon: 'pi pi-money-bill',
            route: tripId ? `/trips/${tripId}/trip-shared-expenses` : '/trips',
            disabled: !hasTrip,
            disabledReason: 'Select a trip first.'
          },
          {
            id: 'trip-comments',
            title: 'Comments',
            description: 'Keep trip discussion in one place.',
            icon: 'pi pi-comments',
            route: tripId ? `/trips/${tripId}/trip-comments` : '/trips',
            disabled: !hasTrip,
            disabledReason: 'Select a trip first.'
          }
        ]
      },
      {
        id: 'artificial-intelligence',
        title: 'Artifisial Intelligence',
        summary: 'Use Plantour AI tools to generate item ideas for your trip.',
        icon: 'pi pi-star',
        accent: '#8b6f2c',
        links: [
          {
            id: 'templates-ai',
            title: 'AI prompts',
            description: 'Ask Plantour AI for suggested items based on a trip idea.',
            icon: 'pi pi-star',
            route: '/templates-ai'
          },
          {
            id: 'trips-ai',
            title: 'AI trip plan',
            description: 'Generate and apply a full trip draft for any trip you choose on the page.',
            icon: 'pi pi-sparkles',
            route: '/trips-ai'
          }
        ]
      },
      {
        id: 'more',
        title: 'General',
        summary: 'Open account, support, search, public pages, and legal information.',
        icon: 'pi pi-bars',
        accent: '#245b64',
        links: [
          ...(isAuthenticated ? [{
            id: 'profile',
            title: 'Profile',
            description: 'Review your account data, role, and subscription details.',
            icon: 'pi pi-user',
            route: '/profile'
          } satisfies DashboardLink] : []),
          {
            id: 'help',
            title: 'Help',
            description: 'Read step-by-step guidance for Plantour pages and workflows.',
            icon: 'pi pi-question-circle',
            route: '/help'
          },
          {
            id: 'search',
            title: 'Search',
            description: 'Search across Plantour pages and visible content.',
            icon: 'pi pi-search',
            route: '/search'
          },
          {
            id: 'contact',
            title: 'Contact Us',
            description: 'Reach Plantour support and send a message.',
            icon: 'pi pi-envelope',
            route: '/contact'
          },
          {
            id: 'public-templates',
            title: 'Public Templates',
            description: 'Browse public packing templates shared on the site.',
            icon: 'pi pi-objects-column',
            route: '/packing-list-generator/templates'
          },
          {
            id: 'terms',
            title: 'Terms of Usage',
            description: 'Read plan, billing, and usage rules.',
            icon: 'pi pi-file',
            route: '/terms'
          },
          {
            id: 'privacy',
            title: 'Privacy Policy',
            description: 'See how Plantour handles your data.',
            icon: 'pi pi-shield',
            route: '/privacy'
          },
          ...(isAuthenticated
            ? [{
                id: 'sign-out',
                title: 'Sign Out',
                description: 'Leave your Plantour account on this device.',
                icon: 'pi pi-sign-out',
                route: '/sign-in',
                action: () => this.signOut()
              } satisfies DashboardLink]
            : [{
                id: 'sign-in',
                title: 'Sign In / Sign Up',
                description: 'Open the sign-in / sign-up page to access your Plantour account.',
                icon: 'pi pi-sign-in',
                route: '/sign-in'
              } satisfies DashboardLink])
        ]
      }
    ];
  });

  constructor() {
    this.expandedSections.set(this.getInitialExpandedSections());

    effect(() => {
      const normalizedState = this.getSanitizedExpandedSections(this.expandedSections(), this.sections());

      if (!this.areExpandedSectionsEqual(normalizedState, this.expandedSections())) {
        this.expandedSections.set(normalizedState);
        return;
      }

      this.localStorageService.setComponentKey(
        this.componentId,
        this.expandedSectionsStorageKey,
        normalizedState
      );
    });
  }

  toggleSection(sectionId: string): void {
    this.expandedSections.update((current) => {
      const sanitizedState = this.getSanitizedExpandedSections(current, this.sections());
      const isExpanded = !!sanitizedState[sectionId];

      return {
        ...sanitizedState,
        [sectionId]: !isExpanded
      };
    });
  }

  isSectionExpanded(sectionId: string): boolean {
    return !!this.expandedSections()[sectionId];
  }

  async onLinkClick(event: Event, link: DashboardLink): Promise<void> {
    if (link.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!link.action) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    await link.action();
  }

  private getInitialExpandedSections(): Record<string, boolean> {
    const storedState = this.localStorageService.getComponentKeyObject(
      this.componentId,
      this.expandedSectionsStorageKey
    ) as Record<string, boolean> | null;

    const sanitizedState = this.getSanitizedExpandedSections(storedState ?? {}, this.sections());

    return this.hasExpandedSection(sanitizedState)
      ? sanitizedState
      : this.getDefaultExpandedSections(this.sections());
  }

  private getSanitizedExpandedSections(
    state: Record<string, boolean>,
    sections: DashboardSection[]
  ): Record<string, boolean> {
    return Object.fromEntries(
      sections.map((section) => [section.id, !!state?.[section.id]])
    );
  }

  private getDefaultExpandedSections(
    sections: DashboardSection[]
  ): Record<string, boolean> {
    return Object.fromEntries(
      sections.map((section) => [section.id, section.id === 'trip'])
    );
  }

  private hasExpandedSection(state: Record<string, boolean>): boolean {
    return Object.values(state).some((value) => value);
  }

  private areExpandedSectionsEqual(
    left: Record<string, boolean>,
    right: Record<string, boolean>
  ): boolean {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

    for (const key of keys) {
      if (!!left[key] !== !!right[key]) {
        return false;
      }
    }

    return true;
  }

  private async signOut(): Promise<void> {
    if (this.usersService.isTemporarySignal()) {
      const result = await this.messagesService.openOkCancel({
        title: 'Sign Out',
        message: `If you sign out of your temporary account, you won't be able to return to it. To avoid losing your test data, we recommend opening your profile and entering your actual email instead ${this.usersService.userEmail()}. Do you still want to sign out?`,
        okLabel: 'Yes',
        cancelLabel: 'Cancel'
      });

      if (result !== 'ok') {
        return;
      }
    }

    this.usersService.signOut();
  }
}
