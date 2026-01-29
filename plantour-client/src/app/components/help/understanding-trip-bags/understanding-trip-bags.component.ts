import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TripBagFeature {
  icon: string;
  title: string;
  description: string;
}

interface TripBagBenefit {
  title: string;
  description: string;
}

@Component({
  selector: 'app-understanding-trip-bags',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './understanding-trip-bags.component.html',
  styleUrl: './understanding-trip-bags.component.scss'
})
export class UnderstandingTripBagsComponent {
  features: TripBagFeature[] = [
    {
      icon: 'pi pi-link',
      title: 'Link Bags to Trips',
      description: 'Connect your existing bags to specific trips to track luggage for each journey.'
    },
    {
      icon: 'pi pi-user',
      title: 'Assign to Travelers',
      description: 'Specify which traveler owns or carries each bag in the trip context.'
    },
    {
      icon: 'pi pi-box',
      title: 'Track Trip-Specific Bags',
      description: 'See all bags associated with a trip in one view, making packing coordination easier.'
    },
    {
      icon: 'pi pi-calendar',
      title: 'Context-Based Management',
      description: 'Same bag can be used in multiple trips with different owners or purposes.'
    }
  ];

  benefits: TripBagBenefit[] = [
    {
      title: 'Organized Luggage',
      description: 'Keep track of who is bringing which bags on each trip.'
    },
    {
      title: 'Better Planning',
      description: 'Ensure all necessary luggage is accounted for before departure.'
    },
    {
      title: 'Flexible Assignments',
      description: 'Easily reassign bags between travelers as plans change.'
    },
    {
      title: 'Complete Visibility',
      description: 'See all trip bags in one place, making coordination with other participants seamless.'
    }
  ];

  keyPoints: string[] = [
    'Trip bags are instances of your bags within a specific trip',
    'You can assign each trip bag to a traveler participating in the trip',
    'The same physical bag can be used in multiple trips',
    'Trip bags help coordinate luggage among all trip participants',
    'You can view and manage all bags for a trip from the Trip Bags section'
  ];
}
