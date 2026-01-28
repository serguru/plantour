import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { REQUEST } from '@angular/core';
import { PublicTemplateThingDto, PublicTemplatesService } from '../../../../services/public-templates-service';
import { catchError, of, timeout } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

type DetailFilterKey = 'search' | 'category';

interface DetailFilterOption {
  key: DetailFilterKey;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-public-template-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Select, InputTextModule],
  templateUrl: './public-template-detail-component.html',
  styleUrl: './public-template-detail-component.scss'
})
export class PublicTemplateDetailComponent implements OnInit {
  private publicTemplatesService = inject(PublicTemplatesService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private sanitizer = inject(DomSanitizer);
  private request = inject(REQUEST, { optional: true });

  isLoading = signal(true);
  templateId = signal<string>('');
  templateItems = signal<PublicTemplateThingDto[]>([]);

  searchText = signal('');
  selectedCategory = signal<string | null>(null);

  filterOptions: DetailFilterOption[] = [
    { key: 'search', label: 'Search', icon: 'search' },
    { key: 'category', label: 'Category', icon: 'tag' }
  ];

  selectedFilterKey = signal<DetailFilterKey>('search');

  get selectedFilterOption(): DetailFilterOption {
    return this.filterOptions.find(option => option.key === this.selectedFilterKey()) ?? this.filterOptions[0];
  }

  templateName = computed(() => this.templateItems()[0]?.templateName ?? 'Template');
  activityName = computed(() => this.templateItems()[0]?.activityName ?? '');
  ageRangeName = computed(() => this.templateItems()[0]?.ageRangeName ?? '');
  temperatureRangeName = computed(() => this.templateItems()[0]?.temperatureRangeName ?? '');

  categories = computed(() => {
    const set = new Set<string>();
    for (const item of this.templateItems()) {
      set.add(item.category ?? 'Other');
    }
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  });

  filteredItems = computed(() => {
    const text = this.searchText().trim().toLowerCase();
    const category = this.normalize(this.selectedCategory());

    return this.templateItems().filter(item => {
      if (text) {
        const haystack = `${item.thingName} ${item.thingNotes ?? ''}`.toLowerCase();
        if (!haystack.includes(text)) {
          return false;
        }
      }

      if (category && this.normalize(item.category) !== category) {
        return false;
      }

      return true;
    });
  });

  groupedByCategory = computed(() => {
    const groups = new Map<string, PublicTemplateThingDto[]>();
    for (const item of this.filteredItems()) {
      const key = item.category ?? 'Other';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.thingName.localeCompare(b.thingName))
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const raw = params.get('templateId') ?? '';
      const id = this.extractTemplateId(raw);
      this.templateId.set(id);
      this.loadTemplate(id);
    });
  }

  private loadTemplate(id: string): void {
    this.isLoading.set(true);
    this.publicTemplatesService.getTemplateThingsByTemplateId(id).pipe(
      timeout({ first: 4000 }),
      catchError(() => of([]))
    ).subscribe({
      next: (items) => {
        this.templateItems.set(items);
        this.searchText.set('');
        this.selectedCategory.set(null);
        this.isLoading.set(false);
        if (items.length > 0) {
          this.setSeoMeta();
          this.setStructuredData();
        } else {
          this.setNotFoundMeta();
        }
      },
      error: () => {
        this.templateItems.set([]);
        this.isLoading.set(false);
        this.setNotFoundMeta();
      }
    });
  }

  onFilterKeyChange(key: DetailFilterKey): void {
    this.selectedFilterKey.set(key);
  }

  updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchText.set(target.value ?? '');
  }

  onLookupValueChange(value: string | null): void {
    this.selectedCategory.set(value || null);
  }

  getLookupOptions() {
    return this.categories().map(category => ({ name: category }));
  }

  getLookupValue(): string | null {
    return this.selectedCategory();
  }

  filterHasValue(key: DetailFilterKey): boolean {
    if (key === 'search') {
      return this.searchText().trim().length > 0;
    }
    return !!this.selectedCategory();
  }

  private setSeoMeta(): void {
    const title = `${this.templateName()} Packing Template | Plantour`;
    const description = `Detailed packing checklist for ${this.templateName()} with ${this.activityName()} activity and conditions. Explore recommended items, categories, and notes.`;

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'robots', content: 'index,follow' });

    const canonicalUrl = this.buildAbsoluteUrl(`/discover/packing-templates/${this.slugify(this.templateName())}~${this.templateId()}`);
    this.setCanonicalLink(canonicalUrl);
  }

  private setNotFoundMeta(): void {
    this.titleService.setTitle('Template not found | Plantour');
    this.metaService.updateTag({ name: 'robots', content: 'noindex' });
  }

  private setStructuredData(): void {
    const listItems = this.templateItems().map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.thingName
    }));

    const data = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: this.templateName(),
      itemListElement: listItems
    };

    this.injectJsonLd(data, 'public-template-detail-jsonld');
  }

  private normalize(value?: string | null): string {
    return (value ?? '').trim().toLowerCase();
  }

  highlightText(value: string): SafeHtml {
    const query = this.searchText().trim();
    const escaped = this.escapeHtml(value);
    if (!query) {
      return this.sanitizer.bypassSecurityTrustHtml(escaped);
    }

    const safeQuery = this.escapeRegExp(query);
    const regex = new RegExp(`(${safeQuery})`, 'ig');
    const highlighted = escaped.replace(regex, '<mark>$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private extractTemplateId(raw: string): string {
    const parts = raw.split('~');
    return parts.length > 1 ? parts[parts.length - 1] : raw;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 60);
  }

  private setCanonicalLink(url: string): void {
    if (!this.document?.head) {
      return;
    }

    const existing = this.document.head.querySelector('link[rel="canonical"]');
    if (existing) {
      existing.setAttribute('href', url);
      return;
    }

    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }

  private injectJsonLd(payload: unknown, id: string): void {
    if (!this.document?.head) {
      return;
    }

    const existing = this.document.getElementById(id);
    if (existing) {
      existing.textContent = JSON.stringify(payload);
      return;
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(payload);
    this.document.head.appendChild(script);
  }

  private buildAbsoluteUrl(path: string): string {
    let origin = '';
    if (this.request?.url) {
      try {
        origin = new URL(this.request.url).origin;
      } catch {
        origin = '';
      }
    }

    if (!origin) {
      origin = this.document?.location?.origin ?? '';
    }
    return origin ? `${origin}${path}` : path;
  }
}
