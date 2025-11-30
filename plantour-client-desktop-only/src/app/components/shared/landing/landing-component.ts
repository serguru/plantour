import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './landing-component.html',
  styleUrls: ['./landing-component.scss']
})
export class LandingComponent {
  constructor(private router: Router) {}

  start() {
    this.router.navigate(['/dashboard']);
  }
}
