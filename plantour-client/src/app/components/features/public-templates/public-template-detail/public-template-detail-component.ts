import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { REQUEST } from '@angular/core';
import { PublicTemplateThingDto, PublicTemplatesService } from '../../../../services/public-templates-service';
import { catchError, of, timeout } from 'rxjs';

@Component({
  selector: 'app-public-template-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-template-detail-component.html',
  styleUrl: './public-template-detail-component.scss'
})
export class PublicTemplateDetailComponent implements OnInit {
  private publicTemplatesService = inject(PublicTemplatesService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private request = inject(REQUEST, { optional: true });

  isLoading = signal(true);
  templateId = signal<string>('');
  templateItems = signal<PublicTemplateThingDto[]>([]);

  templateName = computed(() => this.templateItems()[0]?.templateName ?? 'Template');
  activityName = computed(() => this.templateItems()[0]?.activityName ?? '');
  ageRangeName = computed(() => this.templateItems()[0]?.ageRangeName ?? '');
  temperatureRangeName = computed(() => this.templateItems()[0]?.temperatureRangeName ?? '');

  groupedByCategory = computed(() => {
    const groups = new Map<string, PublicTemplateThingDto[]>();
    for (const item of this.templateItems()) {
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
