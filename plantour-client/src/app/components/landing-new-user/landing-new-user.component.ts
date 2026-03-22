import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, REQUEST } from '@angular/core';
import { PlansPanelComponent } from '../plans-panel/plans-panel.component';
import { SeoService } from '../../services/seo-service';
import { UsersService } from '../../services/users-service';

interface LandingFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing-new-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-new-user.component.html',
  styleUrl: './landing-new-user.component.scss'
})
export class LandingNewUserComponent implements OnInit {
  plansPanelComponent = PlansPanelComponent;

  usersService = inject(UsersService);
  private readonly seoService = inject(SeoService);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  subSlogan = 'Never forget an item again. Organize your packing with smart lists, categories, and seamless group coordination. Get AI-powered packing recommendations tailored to your destination.';


  featureList: LandingFeature[] = [
    {
      icon: 'building-columns',
      title: 'Organization',
      description: 'Keep travelers, items, todos, and bags neatly structured and easy to manage. Everything has its place and is always up to date.'
    },
    {
      icon: 'share-alt',
      title: 'Sharing',
      description: 'Create shared item lists and todo lists for groups and families. Coordinate who brings what and who does what.'
    },
    {
      icon: 'shopping-bag',
      title: 'Packing',
      description: 'Build packing lists and track what is packed and what is missing. Download and print packing lists as PDF files.'
    },
    {
      icon: 'sun',
      title: 'Artificial Intelligence',
      description: 'Get intelligent AI suggestions based on your trip destination and weather. Pack faster and avoid forgetting essentials.'
    },
    {
      icon: 'clone',
      title: 'Templates',
      description: 'Reuse proven packing setups for future journeys. Start in seconds instead of planning from scratch.'
    },
    {
      icon: 'bars',
      title: 'Coming soon',
      description: 'In the near future route planning, expense tracking, travel notes and activities will be implemented'
    }
  ];

  ngOnInit(): void {
    const canonicalUrl = this.buildAbsoluteUrl('/');
    const imageUrl = this.buildAbsoluteUrl('/android-chrome-512x512.png');
    const title = 'Plantour Packing Lists & Travel Planning App';
    const description = this.trimDescription(
      'Plan trips, build packing lists, coordinate group travel, and get AI-powered packing suggestions with Plantour.',
    );

    this.seoService.setSeo({
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      image: imageUrl,
      imageAlt: 'Plantour packing and travel planning app logo',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': canonicalUrl,
            url: canonicalUrl,
            name: 'Plantour',
            description,
          },
          {
            '@type': 'Organization',
            '@id': `${canonicalUrl}#organization`,
            name: 'Plantour',
            url: canonicalUrl,
            logo: {
              '@type': 'ImageObject',
              url: imageUrl,
            },
          },
          {
            '@type': 'WebApplication',
            name: 'Plantour',
            url: canonicalUrl,
            description,
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Any',
          },
        ],
      },
    });
  }

  private trimDescription(value: string, maxLen = 160): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLen) {
      return normalized;
    }

    return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
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
