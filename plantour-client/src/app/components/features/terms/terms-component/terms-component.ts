import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-component',
  imports: [],
  templateUrl: './terms-component.html',
  styleUrl: './terms-component.scss',
})
export class TermsComponent {
  componentId = 'terms';
  appName = 'Plantour';
  lastUpdated = 'January 28, 2026';
  supportContact = 'the support channel available in the app';
}
