import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ContentLayoutComponent } from '../layouts/content-layout.component';

@Component({
  selector: 'app-test-layout',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ContentLayoutComponent],
  templateUrl: './test-layout.component.html',
  styleUrl: './test-layout.component.scss'
})
export class TestLayoutComponent {
  items = Array.from({ length: 3 }, (_, i) => i + 1);
}
