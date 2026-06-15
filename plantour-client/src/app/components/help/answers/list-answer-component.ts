
import { Component, Input, inject } from '@angular/core';
import { HelpAnswerListSection } from '../help-content';
import { UsersService } from '../../../services/users-service';
import { YoutubeComponent } from '../../youtube/youtube-component';

@Component({
  selector: 'app-help-list-answer',
  standalone: true,
  imports: [YoutubeComponent],
  templateUrl: './list-answer-component.html',
  styleUrl: '../help-component.scss',
})
export class HelpListAnswerComponent {
  @Input() sections: HelpAnswerListSection[] = [];

  private readonly usersService = inject(UsersService);
  private readonly publicPathPrefixes = [
    '/help',
    '/sign-in',
    '/signin-token',
    '/contact',
    '/privacy',
    '/terms',
    '/refund',
    '/search',
    '/checkout'
  ];

  renderHtml(value: string | undefined): string {
    if (!value) {
      return '';
    }

    if (this.usersService.isAuthenticatedSignal()) {
      return value.replace(
        /<a\s+[^>]*href=(['"])(?:\/sign-in|\/sign-in\/participant)\1[^>]*>(.*?)<\/a>/gi,
        '$2'
      );
    }

    return value.replace(
      /<a\s+[^>]*href=(['"])(\/[^'">#?]*)[^>]*>(.*?)<\/a>/gi,
      (_match, _quote, href: string, text: string) => this.isPublicHelpLink(href) ? _match : text
    );
  }

  private isPublicHelpLink(href: string): boolean {
    return this.publicPathPrefixes.some((prefix) => href === prefix || href.startsWith(`${prefix}/`));
  }
}