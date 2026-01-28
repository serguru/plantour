import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-new-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-new-user.component.html',
  styleUrls: ['./landing-new-user.component.scss']
})
export class LandingNewUserComponent {
  plans = [
    {
      name: 'Trial',
      price: '$0',
      period: 'Forever',
      features: ['10 items max', 'One click pack', 'Mobile friendly'],
      cta: 'Start Free',
      highlight: false
    },
    {
      name: 'Company',
      price: '$9.99',
      period: 'per year',
      features: ['5 travelers max', 'Shared items', 'Trip comments'],
      cta: 'Go Pro',
      highlight: true
    },
    {
      name: 'Expedition',
      price: '$19.99',
      period: 'per year',
      features: ['No limitations', 'Packing lists', 'Items templates'],
      cta: 'Join Expedition',
      highlight: false
    }
  ];
}