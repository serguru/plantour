import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlansPanelComponent } from '../plans-panel/plans-panel.component';
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
export class LandingNewUserComponent {
  plansPanelComponent = PlansPanelComponent;

  usersService = inject(UsersService);

  subSlogan = 'Never forget an item again. Organize your packing with smart lists, categories, and seamless group coordination. Get AI-powered packing recommendations tailored to your destination.';


  featureList: LandingFeature[] = [
    {
      icon: 'list',
      title: 'Planning',
      description: 'Create trips with clear structure, item lists, and participants, all in one place. Nothing important is missed before you go.'
    },
    {
      icon: 'building-columns',
      title: 'Organization',
      description: 'Keep travelers, items, and bags neatly structured and easy to manage. Everything has its place and is always up to date.'
    },
    {
      icon: 'share-alt',
      title: 'Sharing',
      description: 'Create shared packing lists for groups and families. Coordinate who brings what and avoid duplicates or missing items.'
    },
    {
      icon: 'shopping-bag',
      title: 'Packing',
      description: 'Build smart packing lists and track what is packed and what is missing. Use the unique Plantour "do many by one click" feature to pack faster.'
    },
    {
      icon: 'sun',
      title: 'AI',
      description: 'Get intelligent AI suggestions based on your trip destination and weather. Pack faster and avoid forgetting essentials.'
    },
    {
      icon: 'clone',
      title: 'Templates',
      description: 'Reuse proven packing setups for future journeys. Start in seconds instead of planning from scratch.'
    }
  ];


}
