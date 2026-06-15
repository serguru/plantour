import { Injectable, inject } from '@angular/core';
import { Index, Charset } from 'flexsearch';
import { firstValueFrom } from 'rxjs';
import { TripService } from './trip-service';
import { ThingService } from './thing-service';
import { TodoService } from './todo-service';
import { PackageService } from './package-service';
import { AdminsParticipantService } from './admins-participant-service';
import { TemplateService } from './template-service';
import { UsersService } from './users-service';
import { HELP_SECTIONS } from '../components/help/help-content';

export interface SearchItem {
  id: number;
  entityId: string;
  category: string;
  fullText: string;
  displayText: string;
  route: string[];
  componentId: string | null;
}

export interface SearchResult {
  itemId: number;
  entityId: string;
  category: string;
  displayText: string;
  route: string[];
  componentId: string | null;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly tripService = inject(TripService);
  private readonly thingService = inject(ThingService);
  private readonly todoService = inject(TodoService);
  private readonly packageService = inject(PackageService);
  private readonly adminsParticipantService = inject(AdminsParticipantService);
  private readonly templateService = inject(TemplateService);
  private readonly usersService = inject(UsersService);

  private index: Index | null = null;
  private items = new Map<number, SearchItem>();
  private counter = 0;
  private _indexBuilt = false;
  private _building = false;
  private _builtWithAuth = false;

  isBuiltForCurrentAuth(): boolean {
    if (!this._indexBuilt) return false;
    const isAuth = !!this.usersService.isAuthenticatedSignal();
    return this._builtWithAuth === isAuth;
  }

  async buildIndex(): Promise<void> {
    const isAuth = !!this.usersService.isAuthenticatedSignal();

    // Rebuild if auth state changed since last build
    if (this._indexBuilt && this._builtWithAuth !== isAuth) {
      this.invalidateIndex();
    }

    if (this._indexBuilt || this._building) return;
    this._building = true;
    this.index = new Index({ tokenize: 'full', encoder: Charset.Exact });
    this.items.clear();
    this.counter = 0;

    try {
      this.indexHelpPages();
      this.indexStaticPages();

      if (isAuth) {
        await this.indexAuthenticatedData();
      }
    } finally {
      this._building = false;
    }

    this._builtWithAuth = isAuth;
    this._indexBuilt = true;
  }

  private indexHelpPages(): void {
    for (const section of HELP_SECTIONS) {
      for (const question of section.questions) {
        const fullText = [question.question, question.summary, question.searchText]
          .filter(Boolean).join(' ');
        const id = ++this.counter;
        const hasSummary = question.summary && question.summary !== question.question;
        const item: SearchItem = {
          id,
          entityId: question.pageId,
          category: 'Help',
          fullText,
          displayText: question.question + (hasSummary ? ' — ' + question.summary : ''),
          route: ['/help', question.sectionId, question.slug],
          componentId: null,
        };
        this.items.set(id, item);
        this.index!.add(id, fullText.toLowerCase());
      }
    }
  }

  private indexStaticPages(): void {
    const termsFullText = 'terms of usage about eligibility accounts trial access paid plans billing affiliate links amazon associates user content responsibility acceptable use intellectual property privacy summary disclaimer warranties limitation liability termination changes contact';
    const termsId = ++this.counter;
    this.items.set(termsId, {
      id: termsId, entityId: 'terms', category: 'Terms of Usage',
      fullText: termsFullText,
      displayText: 'Terms of Usage',
      route: ['/terms'], componentId: null,
    });
    this.index!.add(termsId, termsFullText);

    const refundFullText = 'refund policy refunds cancellation policy subscription cancel renewal current paid term billing contact';
    const refundId = ++this.counter;
    this.items.set(refundId, {
      id: refundId, entityId: 'refund', category: 'Refund Policy',
      fullText: refundFullText,
      displayText: 'Refund Policy',
      route: ['/refund'], componentId: null,
    });
    this.index!.add(refundId, refundFullText);

    const privacyFullText = 'privacy policy overview information we collect how we use sharing cookies payments data retention security children changes contact gdpr personal data';
    const privacyId = ++this.counter;
    this.items.set(privacyId, {
      id: privacyId, entityId: 'privacy', category: 'Privacy Policy',
      fullText: privacyFullText,
      displayText: 'Privacy Policy',
      route: ['/privacy'], componentId: null,
    });
    this.index!.add(privacyId, privacyFullText);
  }

  private async indexAuthenticatedData(): Promise<void> {
    const isAdmin = this.usersService.isAdminSignal();

    const tripsObs = isAdmin
      ? this.tripService.getAll()
      : this.tripService.getAllWhereParticipant();

    const [trips, things, todos, packs, travelers, templates] = await Promise.all([
      firstValueFrom(tripsObs).catch(() => [] as any[]),
      firstValueFrom(this.thingService.getAll()).catch(() => [] as any[]),
      firstValueFrom(this.todoService.getAll()).catch(() => [] as any[]),
      firstValueFrom(this.packageService.getAll()).catch(() => [] as any[]),
      firstValueFrom(this.adminsParticipantService.getAll()).catch(() => [] as any[]),
      firstValueFrom(this.templateService.getAll()).catch(() => [] as any[]),
    ]);

    for (const trip of trips ?? []) {
      const fullText = [trip.name, trip.notes, trip.tripStatus].filter(Boolean).join(' ');
      const id = ++this.counter;
      this.items.set(id, {
        id, entityId: trip.id, category: 'Trip',
        fullText,
        displayText: trip.name + (trip.notes ? ' — ' + trip.notes : ''),
        route: ['/trips'], componentId: 'trips',
      });
      this.index!.add(id, fullText.toLowerCase());
    }

    for (const thing of things ?? []) {
      const fullText = [thing.name, thing.notes, thing.category].filter(Boolean).join(' ');
      const id = ++this.counter;
      this.items.set(id, {
        id, entityId: thing.id, category: 'Item',
        fullText,
        displayText: [thing.category, thing.name, thing.notes].filter(Boolean).join(' · '),
        route: ['/things'], componentId: 'things',
      });
      this.index!.add(id, fullText.toLowerCase());
    }

    for (const todo of todos ?? []) {
      const fullText = [todo.name, todo.notes, todo.category].filter(Boolean).join(' ');
      const id = ++this.counter;
      this.items.set(id, {
        id, entityId: todo.id, category: 'Todo',
        fullText,
        displayText: [todo.category, todo.name, todo.notes].filter(Boolean).join(' · '),
        route: ['/todos'], componentId: 'todos',
      });
      this.index!.add(id, fullText.toLowerCase());
    }

    for (const pack of packs ?? []) {
      const fullText = [pack.name, pack.notes].filter(Boolean).join(' ');
      const id = ++this.counter;
      this.items.set(id, {
        id, entityId: pack.id, category: 'Bag',
        fullText,
        displayText: pack.name + (pack.notes ? ' — ' + pack.notes : ''),
        route: ['/packs'], componentId: 'packs',
      });
      this.index!.add(id, fullText.toLowerCase());
    }

    for (const traveler of travelers ?? []) {
      const fullName = [traveler.firstName, traveler.lastName].filter(Boolean).join(' ');
      const fullText = [fullName, traveler.email, traveler.notes].filter(Boolean).join(' ');
      const id = ++this.counter;
      this.items.set(id, {
        id, entityId: traveler.id, category: 'Traveler',
        fullText,
        displayText: (fullName || traveler.email) + (traveler.email && fullName ? ' · ' + traveler.email : ''),
        route: ['/travelers'], componentId: 'travelers',
      });
      this.index!.add(id, fullText.toLowerCase());
    }

    // Templates: group by name to avoid duplicate entries for each item row
    const templateNames = new Map<string, string>();
    for (const t of templates ?? []) {
      if (t.templateName && t.templateId && !templateNames.has(t.templateId)) {
        templateNames.set(t.templateId, t.templateName);
      }
    }
    for (const t of templates ?? []) {
      const fullText = [t.name, t.templateName, t.activityName, t.temperatureRangeName, t.ageRangeName].filter(Boolean).join(' ');
      const id = ++this.counter;
      this.items.set(id, {
        id, entityId: t.id, category: 'Template',
        fullText,
        displayText: [t.templateName, t.name].filter(Boolean).join(' · '),
        route: ['/templates'], componentId: 'templates',
      });
      this.index!.add(id, fullText.toLowerCase());
    }

    // Profile
    const profileId = ++this.counter;
    this.items.set(profileId, {
      id: profileId, entityId: 'profile', category: 'Profile',
      fullText: 'Profile — manage your account, email, name, phone, billing and plan',
      displayText: 'Profile — manage your account, email, name, phone, billing and plan',
      route: ['/profile'], componentId: null,
    });
    this.index!.add(profileId, 'profile account email name phone plan billing manage settings user');
  }

  search(term: string): SearchResult[] {
    if (!this.index || !term?.trim()) return [];
    const ids = this.index.search(term.toLowerCase(), { limit: 200 }) as number[];
    return ids
      .map(id => this.items.get(id))
      .filter((item): item is SearchItem => item !== undefined)
      .map(item => {
        const displayText = this.termAppearsInText(item.displayText, term)
          ? item.displayText
          : this.buildSnippet(item.fullText, term);
        return { ...item, itemId: item.id, displayText };
      });
  }

  private termAppearsInText(text: string, term: string): boolean {
    const lower = text.toLowerCase();
    return term.toLowerCase().trim().split(/\s+/).filter(Boolean).every(word => lower.includes(word));
  }

  private buildSnippet(fullText: string, term: string, window = 70): string {
    const lower = fullText.toLowerCase();
    const words = term.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let best = -1;
    for (const word of words) {
      const idx = lower.indexOf(word);
      if (idx !== -1 && (best === -1 || idx < best)) best = idx;
    }
    if (best === -1) return fullText.slice(0, window * 2);
    const start = Math.max(0, best - window);
    const end = Math.min(fullText.length, best + window);
    return (start > 0 ? '\u2026' : '') + fullText.slice(start, end).trim() + (end < fullText.length ? '\u2026' : '');
  }

  private _lastSearchTerm = '';

  get lastSearchTerm(): string {
    return this._lastSearchTerm;
  }

  setLastSearchTerm(term: string): void {
    this._lastSearchTerm = term;
  }

  invalidateIndex(): void {
    this._indexBuilt = false;
    this._building = false;
    this.index = null;
    this.items.clear();
    this.counter = 0;
  }
}
