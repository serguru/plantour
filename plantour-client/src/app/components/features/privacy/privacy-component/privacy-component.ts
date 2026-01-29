import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-component',
  imports: [],
  templateUrl: './privacy-component.html',
  styleUrl: './privacy-component.scss',
})
export class PrivacyComponent {
  componentId = 'privacy';
  appName = 'Plantour';
  lastUpdated = 'January 28, 2026';
  supportContact = 'the support channel available in the app';
}
