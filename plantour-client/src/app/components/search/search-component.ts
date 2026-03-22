import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { SearchResult, SearchService } from '../../services/search.service';
import { SearchStateService } from '../../services/search-state.service';
import { LocalStorageService } from '../../services/local-storage-service';
import { HighlightPipe } from '../../pipes/highlight.pipe';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [EntitiesHeader, HighlightPipe],
  templateUrl: './search-component.html',
  styleUrl: './search-component.scss',
})
export class SearchComponent implements OnInit {
  componentId = 'search';

  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly searchStateService = inject(SearchStateService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly highlightEnabled = signal<boolean>(true);
  readonly searchTerm = signal<string>('');
  readonly searchResults = signal<SearchResult[]>([]);
  readonly isBuilding = signal<boolean>(false);

  readonly menuItems = computed<MenuConfig[]>(() => [
    {
      label: this.highlightEnabled() ? 'Highlight Off' : 'Highlight On',
      icon: this.highlightEnabled() ? 'eraser' : 'highlighter',
      action: () => this.highlightEnabled.set(!this.highlightEnabled()),
    },
  ]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const saved = this.searchService.lastSearchTerm;
    if (saved) {
      this.searchTerm.set(saved);
    }
    this.ensureIndex();
  }

  private async ensureIndex(): Promise<void> {
    if (this.searchService.isBuiltForCurrentAuth()) {
      if (this.searchTerm().trim()) {
        this.runSearch(this.searchTerm());
      }
      return;
    }
    this.isBuilding.set(true);
    await this.searchService.buildIndex();
    this.isBuilding.set(false);
    if (this.searchTerm().trim()) {
      this.runSearch(this.searchTerm());
    }
  }

  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.searchService.setLastSearchTerm(term);
    this.runSearch(term);
  }

  private runSearch(term: string): void {
    if (!term.trim()) {
      this.searchResults.set([]);
      return;
    }
    this.searchResults.set(this.searchService.search(term));
  }

  getCategoryClass(category: string): string {
    return 'cat-' + category.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  getPrimary(displayText: string): string {
    const dash = displayText.indexOf(' — ');
    if (dash !== -1) return displayText.slice(0, dash);
    const dot = displayText.indexOf(' · ');
    if (dot !== -1) return displayText.slice(0, dot);
    return displayText;
  }

  getSecondary(displayText: string): string {
    const dash = displayText.indexOf(' — ');
    if (dash !== -1) return displayText.slice(dash + 3);
    const dot = displayText.indexOf(' · ');
    if (dot !== -1) return displayText.slice(dot + 3);
    return '';
  }

  onResultClick(result: SearchResult): void {
    if (result.componentId) {
      this.localStorageService.setComponentKey(result.componentId, 'selectedId', result.entityId);
      this.searchStateService.setPendingScroll(result.entityId);
    }
    void this.router.navigate(result.route);
  }
}
