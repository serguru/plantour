import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, REQUEST } from '@angular/core';
import { PlansPanelComponent } from '../plans-panel/plans-panel.component';
import { SeoService } from '../../services/seo-service';
import { UsersService } from '../../services/users-service';

interface LandingFeature {
  eyebrow: string;
  icon: string;
  title: string;
  description: string;
  highlights: string[];
  tone: 'lagoon' | 'citrus' | 'forest' | 'sunrise' | 'sky' | 'midnight';
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

  subSlogan = 'Plantour is your mobile-first travel assistant for planning trips, coordinating people, packing smart, and keeping the whole journey in one place.';


  featureList: LandingFeature[] = [
    {
      eyebrow: 'Mobile-first base',
      icon: 'mobile',
      title: 'Run the whole trip from your phone',
      description: 'Plantour is built mobile first, so you can create trips, switch contexts, check lists, update plans, and keep moving without waiting to get back to a laptop.',
      highlights: ['100% mobile-first workflow', 'Trips stay easy to manage on the road', 'Fast updates for live travel days'],
      tone: 'lagoon'
    },
    {
      eyebrow: 'Route and schedule',
      icon: 'map',
      title: 'Shape itineraries, activities, and maps together',
      description: 'Build a real travel plan with itinerary stops, activities, timing, and maps, so the trip is not just a list of things to pack but a clear plan everyone can follow.',
      highlights: ['Trip itinerary planning', 'Activities and timing in one flow', 'Maps for route context'],
      tone: 'sky'
    },
    {
      eyebrow: 'Packing control',
      icon: 'shopping-bag',
      title: 'Track bags, personal items, and shared gear',
      description: 'Organize bags, personal items, and shared items in one system, then use templates to fill common needs faster and keep every traveler accountable for what they carry.',
      highlights: ['Bags with packed-state tracking', 'Personal and shared item lists', 'AI and predefined item templates'],
      tone: 'forest'
    },
    {
      eyebrow: 'Shared coordination',
      icon: 'users',
      title: 'Coordinate work, responsibilities, and trip spending',
      description: 'Keep personal todos, shared todos, and shared expenses visible in the same workspace, so group travel stays transparent instead of disappearing into chat threads.',
      highlights: ['Personal and shared todos', 'Shared expenses for group trips', 'Clear ownership across travelers'],
      tone: 'citrus'
    },
    {
      eyebrow: 'Capture the journey',
      icon: 'file-edit',
      title: 'Save travel notes, images, and printable reports',
      description: 'Write rich-text travel notes, attach images, and finish with PDF reports, so your trip stays useful before departure, during the journey, and after it is done.',
      highlights: ['Rich-text notes with images', 'Useful during and after the trip', 'PDF reports for sharing or print'],
      tone: 'sunrise'
    },
    {
      eyebrow: 'AI assistant',
      icon: 'sparkles',
      title: 'Generate a full trip from your requirements',
      description: 'Tell Plantour what kind of trip you want, who is going, what matters, and what constraints you have. AI can turn that into a full trip setup instead of just offering one small suggestion.',
      highlights: ['AI full trip generation', 'Requirements-driven planning', 'Faster setup from blank page to ready plan'],
      tone: 'midnight'
    }
  ];

  ngOnInit(): void {
    const canonicalUrl = this.buildAbsoluteUrl('/');
    const imageUrl = this.buildAbsoluteUrl('/android-chrome-512x512.png');
    const title = 'Plantour Travel Assistant for Trips, Packing, Itineraries and AI';
    const description = this.trimDescription(
      'Plantour is a mobile-first travel assistant for trips, itineraries, activities, maps, packing, shared planning, notes, expenses, AI trip generation, and PDF reports.',
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
