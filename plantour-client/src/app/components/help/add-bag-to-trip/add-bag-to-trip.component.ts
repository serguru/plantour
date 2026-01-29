import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AddBagStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

interface TripBagField {
  name: string;
  description: string;
  required: boolean;
}

@Component({
  selector: 'app-add-bag-to-trip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-bag-to-trip.component.html',
  styleUrl: './add-bag-to-trip.component.scss'
})
export class AddBagToTripComponent {
  steps: AddBagStep[] = [
    {
      number: 1,
      title: 'Navigate to Trip Bags',
      description: 'Select your trip and go to the Trip Bags section from the trip menu.',
      icon: 'pi pi-map'
    },
    {
      number: 2,
      title: 'Click Add Bag',
      description: 'Click the "Add Bag" or "+" button to open the bag selection dialog.',
      icon: 'pi pi-plus'
    },
    {
      number: 3,
      title: 'Select a Bag',
      description: 'Choose from your existing bags. Only bags not already in the trip will be shown.',
      icon: 'pi pi-briefcase'
    },
    {
      number: 4,
      title: 'Assign to Traveler',
      description: 'Select which traveler will own or carry this bag during the trip.',
      icon: 'pi pi-user'
    },
    {
      number: 5,
      title: 'Save Trip Bag',
      description: 'Click Save to add the bag to your trip. It will now appear in the Trip Bags list.',
      icon: 'pi pi-check'
    }
  ];

  fields: TripBagField[] = [
    {
      name: 'Bag',
      description: 'Select from your existing bags',
      required: true
    },
    {
      name: 'Traveler',
      description: 'Assign the bag to a trip participant',
      required: true
    }
  ];

  tips: string[] = [
    'You must create bags in the Bags module before adding them to a trip',
    'Each bag can only be added once per trip',
    'You can reassign bags to different travelers later by editing the trip bag',
    'The same physical bag can be used in multiple trips',
    'Only travelers who are participants in the trip can be assigned bags'
  ];
}
