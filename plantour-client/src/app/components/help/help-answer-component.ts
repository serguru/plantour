import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal, Type } from '@angular/core';
import { REQUEST } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { SeoService } from '../../services/seo-service';
import { HELP_FAQ_SECTIONS, HELP_FUTURE_PAGES_PAGE_ID, HelpFaqSection, HELP_PAGES } from './help-content';
import { HelpPage } from './help.models';
import { HelpGetStartedGuestAccessAnswerComponent } from './answers/get-started/help-get-started-guest-access-answer.component';
import { HelpGetStartedFirstStepsAnswerComponent } from './answers/get-started/help-get-started-first-steps-answer.component';

const GUEST_ACCESS_ANSWER_PATH = 'get-started/no-account';
const FIRST_STEPS_ANSWER_PATH = 'get-started/first-steps';

@Component({
  selector: 'app-help-answer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="help-shell">
      <section class="help-answer-page">
        <div class="help-answer-toolbar">
          <a class="help-back-link" [routerLink]="pageUrlById(faqPageId)">
            Back to {{ currentSection()?.title }}
          </a>
        </div>

        <article class="help-page-content help-page-content--answer">
          <h1 class="help-answer-title">{{ currentPage().title }}</h1>
        </article>

        @if (answerComponent(); as component) {
          <ng-container *ngComponentOutlet="component"></ng-container>
        } @else {
          <article class="help-page-content help-page-content--answer">
            @for (block of currentPage().blocks; track $index) {
              <section class="no-component-text" [attr.id]="block.id">
                @if (block.kind === 'paragraphs') {
                  @if (block.title) {
                    <h2>{{ block.title }}</h2>
                  }
                  <ul>
                  @for (paragraph of block.paragraphs; track paragraph) {
                    <li>{{ paragraph }}</li>
                  }
                </ul>
                }
              </section>
            }
          </article>
        }
      </section>
    </div>
  `,
  styleUrl: './help-component.scss'
})
export class HelpAnswerComponent {
  componentId = 'help';
  readonly faqPageId = HELP_FUTURE_PAGES_PAGE_ID;

  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  private readonly currentPath = signal<string[]>([]);

  constructor() {
    this.syncCurrentPathFromUrl();

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncCurrentPathFromUrl();
    });

    effect(() => {
      const page = this.currentPage();
      this.seoService.setSeo({
        title: `${page.title} | Plantour Help`,
        description: page.description,
        canonicalUrl: this.buildAbsoluteUrl(this.pageUrl(page)),
        ogType: 'article',
        jsonLd: this.buildJsonLd(page)
      });
    });
  }

  pageUrl(page: HelpPage): string {
    return page.path.length === 0 ? '/help' : `/help/${page.path.join('/')}`;
  }

  pageUrlById(pageId: string): string {
    const page = HELP_PAGES.find((item) => item.id === pageId);
    return page ? this.pageUrl(page) : '/help';
  }

  currentPage(): HelpPage {
    const joinedPath = this.currentPath().join('/');
    const page = HELP_PAGES.find((item) => item.path.join('/') === joinedPath);
    return page ?? HELP_PAGES[0];
  }

  currentSection(): HelpFaqSection | null {
    const pageId = this.currentPage().id;
    return HELP_FAQ_SECTIONS.find((section) => section.questions.some((question) => question.pageId === pageId)) ?? null;
  }

  answerComponent(): Type<unknown> | null {
    const currentPath = this.currentPath().join('/');

    if (currentPath === GUEST_ACCESS_ANSWER_PATH) {
      return HelpGetStartedGuestAccessAnswerComponent;
    }

    if (currentPath === FIRST_STEPS_ANSWER_PATH) {
      return HelpGetStartedFirstStepsAnswerComponent;
    }

    return null;
  }

  private syncCurrentPathFromUrl(): void {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    const withoutLeadingSlash = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
    const segments = withoutLeadingSlash.split('/').filter((segment) => segment.length > 0);
    this.currentPath.set(segments[0] === 'help' ? segments.slice(1) : []);
  }

  private buildAbsoluteUrl(path: string): string {
    if (this.request?.url) {
      const protocol = this.request.headers?.get('x-forwarded-proto') ?? undefined;
      const host = this.request.headers?.get('x-forwarded-host') ?? this.request.headers?.get('host') ?? undefined;

      if (protocol && host) {
        return `${protocol}://${host}${path}`;
      }
    }

    if (typeof this.document?.location?.origin === 'string' && this.document.location.origin) {
      return `${this.document.location.origin}${path}`;
    }

    return path;
  }

  private buildJsonLd(page: HelpPage): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: page.title,
      description: page.description,
      url: this.buildAbsoluteUrl(this.pageUrl(page))
    };
  }
}