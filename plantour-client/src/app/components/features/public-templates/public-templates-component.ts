import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { catchError, forkJoin, of, timeout } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import {
  PublicActivityDto,
  PublicAgeRangeDto,
  PublicTemplateThingDto,
  PublicTemperatureRangeDto,
  PublicTemplatesService
} from '../../../services/public-templates-service';
import { REQUEST } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { EntitiesHeader, MenuConfig } from '../../entities/entities-header-component/entities-header-component';
import { SeoService } from '../../../services/seo-service';

type FilterKey = 'search' | 'activity' | 'age' | 'temperature' | 'category';

interface FilterOption {
  key: FilterKey;
  label: string;
  icon: string;
}

interface TemplateGroup {
  templateId: string;
  templateName: string;
  activityName: string;
  temperatureRangeName?: string | null;
  ageRangeName?: string | null;
  fromTemp?: number | null;
  toTemp?: number | null;
  fromAge?: number | null;
  toAge?: number | null;
  items: PublicTemplateThingDto[];
  categories: string[];
}

@Component({
  selector: 'app-public-templates',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Select, InputTextModule, ButtonModule, EntitiesHeader],
  templateUrl: './public-templates-component.html',
  styleUrl: './public-templates-component.scss'
})
export class PublicTemplatesComponent implements OnInit {
  componentId = 'public-templates';
  private publicTemplatesService = inject(PublicTemplatesService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private sanitizer = inject(DomSanitizer);
  private request = inject(REQUEST, { optional: true });

  isLoading = signal(true);
  templates = signal<PublicTemplateThingDto[]>([]);
  ageRanges = signal<PublicAgeRangeDto[]>([]);
  temperatureRanges = signal<PublicTemperatureRangeDto[]>([]);
  activities = signal<PublicActivityDto[]>([]);

  searchText = signal('');
  selectedActivity = signal<string | null>(null);
  selectedAgeRange = signal<string | null>(null);
  selectedTemperatureRange = signal<string | null>(null);
  selectedCategory = signal<string | null>(null);

  menuItems = computed<MenuConfig[]>(() => {
    return [
      {
        label: 'Help',
        icon: 'question-circle',
        action: () => {
          this.router.navigate(['/help/packing-list-generator/public-templates-intro']);
        }
      }
    ];
  });

  filterOptions: FilterOption[] = [
    { key: 'search', label: 'Search', icon: 'search' },
    { key: 'activity', label: 'Activity', icon: 'map' },
    { key: 'age', label: 'Age range', icon: 'users' },
    { key: 'temperature', label: 'Temperature', icon: 'sun' },
    { key: 'category', label: 'Category', icon: 'tag' }
  ];

  selectedFilterKey = signal<FilterKey>('search');

  categories = computed(() => {
    const set = new Set<string>();
    for (const item of this.templates()) {
      if (item.category) {
        set.add(item.category);
      }
    }
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  });

  get selectedFilterOption(): FilterOption {
    return this.filterOptions.find(option => option.key === this.selectedFilterKey()) ?? this.filterOptions[0];
  }

  templateGroups = computed<TemplateGroup[]>(() => {
    const text = this.searchText().trim().toLowerCase();
    const activity = this.normalize(this.selectedActivity());
    const ageRange = this.normalize(this.selectedAgeRange());
    const temperatureRange = this.normalize(this.selectedTemperatureRange());
    const category = this.normalize(this.selectedCategory());

    const groups = new Map<string, TemplateGroup>();

    for (const item of this.templates()) {
      if (text) {
        const haystack = `${item.templateName} ${item.thingName} ${item.activityName}`.toLowerCase();
        if (!haystack.includes(text)) {
          continue;
        }
      }

      if (activity && this.normalize(item.activityName) !== activity) {
        continue;
      }

      if (ageRange && this.normalize(item.ageRangeName) !== ageRange) {
        continue;
      }

      if (temperatureRange && this.normalize(item.temperatureRangeName) !== temperatureRange) {
        continue;
      }

      if (category && this.normalize(item.category) !== category) {
        continue;
      }

      const key = item.templateId;
      if (!groups.has(key)) {
        groups.set(key, {
          templateId: item.templateId,
          templateName: item.templateName,
          activityName: item.activityName,
          temperatureRangeName: item.temperatureRangeName ?? null,
          ageRangeName: item.ageRangeName ?? null,
          fromTemp: item.fromTemp ?? null,
          toTemp: item.toTemp ?? null,
          fromAge: item.fromAge ?? null,
          toAge: item.toAge ?? null,
          items: [],
          categories: []
        });
      }
      const group = groups.get(key)!;
      group.items.push(item);
      if (item.category && !group.categories.includes(item.category)) {
        group.categories.push(item.category);
      }
    }

    return Array.from(groups.values()).map(group => ({
      ...group,
      items: group.items.sort((a, b) => a.thingName.localeCompare(b.thingName)),
      categories: group.categories.sort((a, b) => a.localeCompare(b))
    })).sort((a, b) => a.templateName.localeCompare(b.templateName));
  });

  ngOnInit(): void {
    // Ensure crawlers get stable metadata even if API calls fail.
    this.applySeo(false);

    forkJoin({
      templates: this.publicTemplatesService.getTemplateThings().pipe(
        timeout({ first: 4000 }),
        catchError(() => of([]))
      ),
      ageRanges: this.publicTemplatesService.getAgeRanges().pipe(
        timeout({ first: 4000 }),
        catchError(() => of([]))
      ),
      temperatureRanges: this.publicTemplatesService.getTemperatureRanges().pipe(
        timeout({ first: 4000 }),
        catchError(() => of([]))
      ),
      activities: this.publicTemplatesService.getActivities().pipe(
        timeout({ first: 4000 }),
        catchError(() => of([]))
      )
    }).subscribe({
      next: ({ templates, ageRanges, temperatureRanges, activities }) => {
        this.templates.set(templates);
        this.ageRanges.set(ageRanges);
        this.temperatureRanges.set(temperatureRanges);
        this.activities.set(activities);
        this.applySeo(true);
        this.isLoading.set(false);
      },
      error: () => {
        this.applySeo(false);
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchText.set(target.value ?? '');
  }

  onFilterKeyChange(key: FilterKey): void {
    this.selectedFilterKey.set(key);
  }

  onLookupValueChange(value: string | null): void {
    const key = this.selectedFilterKey();
    if (key === 'activity') {
      this.selectedActivity.set(value || null);
      return;
    }
    if (key === 'age') {
      this.selectedAgeRange.set(value || null);
      return;
    }
    if (key === 'temperature') {
      this.selectedTemperatureRange.set(value || null);
      return;
    }
    if (key === 'category') {
      this.selectedCategory.set(value || null);
    }
  }

  clearFilters(): void {
    this.searchText.set('');
    this.selectedActivity.set(null);
    this.selectedAgeRange.set(null);
    this.selectedTemperatureRange.set(null);
    this.selectedCategory.set(null);
  }

  goToTemplate(template: TemplateGroup): void {
    const slug = this.slugify(template.templateName);
    this.router.navigate(['/packing-list-generator/templates', `${slug}~${template.templateId}`]);
  }

  goToGuestAccess(): void {
    this.router.navigate(['/help'], { queryParams: { start: 'guest' } });
  }

  getLookupOptions() {
    const key = this.selectedFilterKey();
    if (key === 'activity') {
      return this.activities().map(activity => ({ name: activity.name }));
    }
    if (key === 'age') {
      return this.ageRanges().map(range => ({ name: range.name }));
    }
    if (key === 'temperature') {
      return this.temperatureRanges().map(range => ({ name: range.name }));
    }
    if (key === 'category') {
      return this.categories().map(category => ({ name: category }));
    }
    return [];
  }

  getLookupValue(): string | null {
    const key = this.selectedFilterKey();
    if (key === 'activity') {
      return this.selectedActivity();
    }
    if (key === 'age') {
      return this.selectedAgeRange();
    }
    if (key === 'temperature') {
      return this.selectedTemperatureRange();
    }
    if (key === 'category') {
      return this.selectedCategory();
    }
    return null;
  }

  filterHasValue(key: FilterKey): boolean {
    if (key === 'search') {
      return this.searchText().trim().length > 0;
    }
    if (key === 'activity') {
      return !!this.selectedActivity();
    }
    if (key === 'age') {
      return !!this.selectedAgeRange();
    }
    if (key === 'temperature') {
      return !!this.selectedTemperatureRange();
    }
    if (key === 'category') {
      return !!this.selectedCategory();
    }
    return false;
  }

  private applySeo(includeStructuredData: boolean): void {
    const canonicalUrl = this.buildAbsoluteUrl('/packing-list-generator/templates');
    const title = 'Plantour Packing Templates by Activity, Age & Temperature';
    const description =
      'Explore public packing templates curated by activity, age range, and temperature. Use Plantour templates to plan your trip faster.';

    const jsonLd = includeStructuredData
      ? this.publicTemplatesJsonLd({ canonicalUrl, title, description })
      : null;

    this.seoService.setSeo({
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      jsonLd,
    });
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

  slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 60);
  }

  private publicTemplatesJsonLd(input: {
    canonicalUrl: string;
    title: string;
    description: string;
  }): Record<string, unknown> {
    const homeUrl = this.buildAbsoluteUrl('/');
    const templatesUrl = input.canonicalUrl;

    const listItems = this.templateGroups().map((group, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: group.templateName,
      url: this.buildAbsoluteUrl(
        `/packing-list-generator/templates/${this.slugify(group.templateName)}~${group.templateId}`,
      ),
    }));

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
              name: 'Packing Templates',
              item: templatesUrl,
            },
          ],
        },
        {
          '@type': 'WebPage',
          '@id': templatesUrl,
          url: templatesUrl,
          name: input.title,
          description: input.description,
          isPartOf: {
            '@type': 'WebSite',
            '@id': homeUrl,
            url: homeUrl,
            name: 'Plantour',
          },
        },
        {
          '@type': 'ItemList',
          name: 'Plantour Packing Templates',
          itemListElement: listItems,
        },
      ],
    };
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
