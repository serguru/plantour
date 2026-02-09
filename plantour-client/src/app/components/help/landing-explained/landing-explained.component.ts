import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-explained',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-explained.component.html',
  styleUrls: ['./landing-explained.component.scss']
})
export class LandingExplainedComponent {
  mainHeading = 'Landing explained';

  intro =
    'The Landing page is the first screen for new users. It explains what Plantour does, highlights key benefits, and shows the available plans.';

  sections = [
    {
      title: 'What you see on the Landing page',
      paragraphs: [
        'A short headline (“Pack smart. Travel better.”) and a short description of Plantour.',
        'A “Why Plantour?” block with feature cards (Planning, Organization, Sharing, Packing, AI, Templates).',
        'A “Try” card that highlights no-registration usage with prefilled test data.',
        'A pricing grid where each plan lists limits and included features.'
      ]
    },
    {
      title: 'How this connects to the rest of the app',
      paragraphs: [
        'The Landing page is informational: it helps you understand the product and choose how to start.',
        'Once you start using Plantour, your day-to-day work typically happens inside a Trip and on the Dashboard.'
      ],
      list: [
        'If you are evaluating the app, start with the “Try” card and use test data to explore.',
        'If you already have an account and trips, go to the Dashboard to see trip summaries.'
      ]
    }
  ];
}
