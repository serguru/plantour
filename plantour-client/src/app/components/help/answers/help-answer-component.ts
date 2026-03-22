import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal, Type } from '@angular/core';
import { REQUEST } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SeoService } from '../../../services/seo-service';
import { HelpPage } from '../../../services/help-service';
import {
  HELP_HOME_PAGE_ID,
  HelpQuestionDefinition,
  findHelpPageByPath,
  getHelpAnswerPlainText,
  getHelpSection,
  getHelpPageUrl,
  getHelpQuestionByPageId
} from '../help-content';
import { HelpListAnswerComponent } from './list-answer-component';
import { HelpParagraphAnswerComponent } from './paragraph-answer-component';
import { HelpGetStartedGuestAccessAnswerComponent } from './get-started/help-get-started-guest-access-answer.component';

interface HelpAnswerRenderSpec {
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
}

@Component({
  selector: 'app-help-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-answer-component.html',
  styleUrl: '../help-component.scss'
})
export class HelpAnswerComponent {
  componentId = 'help';

  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  private readonly currentPath = signal<string[]>([]);
  readonly currentPage = computed<HelpPage>(() => findHelpPageByPath(this.currentPath()) ?? findHelpPageByPath([])!);
  readonly currentQuestion = computed<HelpQuestionDefinition | null>(() => getHelpQuestionByPageId(this.currentPage().id));
  readonly currentSection = computed(() => getHelpSection(this.currentQuestion()?.sectionId ?? this.currentPage().sectionId ?? null));
  readonly answerSpec = computed(() => this.buildAnswerSpec(this.currentQuestion()));

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
        canonicalUrl: this.buildAbsoluteUrl(this.pageUrl(page.id)),
        ogType: 'article',
        jsonLd: this.buildJsonLd(page, this.currentQuestion())
      });
    });
  }

  pageUrlById(pageId: string): string {
    return getHelpPageUrl(pageId);
  }

  pageUrl(pageId: string): string {
    return getHelpPageUrl(pageId);
  }

  homeUrl(): string {
    return getHelpPageUrl(HELP_HOME_PAGE_ID);
  }

  displayTitle(): string {
    return this.currentPage().title.replace(/\?+$/, '').trimEnd();
  }

  backLinkLabel(): string {
    const sectionTitle = this.currentSection()?.title;
    return sectionTitle ? `Back to ${sectionTitle}` : 'Back to Help';
  }

  backLinkFragment(): string | undefined {
    return this.currentSection()?.id;
  }

  navigateBack(event: Event): void {
    event.preventDefault();
    const urlTree = this.router.createUrlTree([this.homeUrl()], {
      fragment: this.backLinkFragment()
    });
    void this.router.navigateByUrl(urlTree);
  }

  private buildAnswerSpec(question: HelpQuestionDefinition | null): HelpAnswerRenderSpec | null {
    if (!question) {
      return null;
    }

    if (question.answer.kind === 'component') {
      if (question.answer.componentKey === 'get-started-guest-access') {
        return { component: HelpGetStartedGuestAccessAnswerComponent };
      }

      return null;
    }

    if (question.answer.kind === 'paragraph') {
      return {
        component: HelpParagraphAnswerComponent,
        inputs: {
          sections: question.answer.sections
        }
      };
    }

    return {
      component: HelpListAnswerComponent,
      inputs: {
        sections: question.answer.sections
      }
    };
  }

  private syncCurrentPathFromUrl(): void {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    const withoutLeadingSlash = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
    const segments = withoutLeadingSlash.split('/').filter((segment) => segment.length > 0);
    this.currentPath.set(segments[0] === 'help' ? segments.slice(1) : []);
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

  private buildJsonLd(page: HelpPage, question: HelpQuestionDefinition | null): Record<string, unknown> {
    const canonicalUrl = this.buildAbsoluteUrl(this.pageUrl(page.id));
    const homeUrl = this.buildAbsoluteUrl(getHelpPageUrl(HELP_HOME_PAGE_ID));
    const answerText = question && question.answer.kind !== 'component'
      ? getHelpAnswerPlainText(question.answer)
      : page.description;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: page.title,
              acceptedAnswer: {
                '@type': 'Answer',
                text: answerText || page.description
              }
            }
          ]
        },
        {
          '@type': 'WebPage',
          '@id': canonicalUrl,
          url: canonicalUrl,
          name: page.title,
          description: page.description,
          isPartOf: {
            '@type': 'WebSite',
            '@id': homeUrl,
            url: homeUrl,
            name: 'Plantour'
          }
        }
      ]
    };
  }
}