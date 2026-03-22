import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { REQUEST } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { LocalStorageService } from '../../services/local-storage-service';
import { SearchService } from '../../services/search-service';
import { SeoService } from '../../services/seo-service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EntitiesHeader],
  templateUrl: './search-component.html',
  styleUrl: './search-component.scss'
})
export class SearchComponent {
  componentId = 'search';

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly seoService = inject(SeoService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  readonly searchInput = signal('');
  readonly searchQuery = signal('');
  readonly highlightMatches = signal(true);
  readonly menuItems = computed<MenuConfig[]>(() => [
    {
      label: this.highlightMatches() ? 'Hide Highlights' : 'Show Highlights',
      icon: 'check',
      action: () => this.toggleHighlightMatches()
    }
  ]);
  readonly searchResults = computed(() => {
    this.searchService.indexRevision();
    return this.searchService.search(this.searchQuery(), this.highlightMatches());
  });
  readonly isLoading = computed(() => this.searchService.isDynamicSourcesLoading());

  constructor() {
    this.highlightMatches.set(
      this.localStorageService.getComponentBooleanKey(this.componentId, 'highlightMatches', true)
    );

    this.searchInput$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        this.searchQuery.set(query);
        void this.router.navigate(['/search'], {
          queryParams: query ? { q: query } : {},
          replaceUrl: true
        });
      });

    this.activatedRoute.queryParamMap.subscribe((params) => {
      const query = params.get('q')?.trim() ?? '';
      this.searchInput.set(query);
      this.searchQuery.set(query);
    });

    this.searchService.ensureDynamicSourcesLoaded();

    effect(() => {
      const query = this.searchQuery();
      const canonicalUrl = this.buildAbsoluteUrl('/search');
      const description = query
        ? `Search results for ${query} across Plantour public pages, help pages, and public templates.`
        : 'Search Plantour public pages, help pages, and public templates.';

      this.seoService.setSeo({
        title: query ? `Search: ${query} | Plantour` : 'Search | Plantour',
        description,
        canonicalUrl,
        ogType: 'website',
        robots: 'noindex,follow',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'SearchResultsPage',
          '@id': canonicalUrl,
          url: canonicalUrl,
          name: 'Plantour Search',
          description,
        }
      });
    });
  }

  onSearchInput(value: string): void {
    const trimmedValue = value ?? '';
    this.searchInput.set(trimmedValue);
    this.searchInput$.next(trimmedValue.trim());
  }

  toggleHighlightMatches(): void {
    const nextValue = !this.highlightMatches();
    this.highlightMatches.set(nextValue);
    this.localStorageService.setComponentKey(this.componentId, 'highlightMatches', nextValue);
  }

  private buildAbsoluteUrl(path: string): string {
    const protocol = this.request?.headers?.get('x-forwarded-proto') ?? undefined;
    const host = this.request?.headers?.get('x-forwarded-host') ?? this.request?.headers?.get('host') ?? undefined;
    if (protocol && host) {
      return `${protocol}://${host}${path}`;
    }

    try {
      return new URL(path, this.document.baseURI).toString();
    } catch {
      return path;
    }
  }
}