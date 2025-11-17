import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

import { Splitter } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    Splitter,
    ToolbarModule,
    ButtonModule,
    BadgeModule
  ],
  templateUrl: './layout-component.html',
  styleUrls: ['./layout-component.scss']
})
export class LayoutComponent {

  leftPanelVisible = signal(true);

  modules = [
    { label: 'Travelers', icon: 'pi pi-users', route: 'travelers' },
    { label: 'Things', icon: 'pi pi-box', route: 'things' },
    { label: 'Trips', icon: 'pi pi-map', route: 'trips' }
  ];

  activeModule = signal<string>('travelers');

  topMenuItems = computed(() => {
    switch (this.activeModule()) {
      case 'travelers':
        return [
          { label: 'Add traveler', icon: 'pi pi-user-plus' },
          { label: 'Groups', icon: 'pi pi-folder' }
        ];
      case 'things':
        return [
          { label: 'Add thing', icon: 'pi pi-plus' },
          { label: 'Categories', icon: 'pi pi-tags' }
        ];
      case 'trips':
        return [
          { label: 'Add trip', icon: 'pi pi-map-marker' },
          { label: 'Templates', icon: 'pi pi-clone' }
        ];
      default:
        return [];
    }
  });

  rightMenu = [
    { label: 'Notifications', icon: 'pi pi-bell', badge: 1 },
    { label: 'Help', icon: 'pi pi-question-circle' },
    { label: 'Privacy', icon: 'pi pi-file' },
    { label: 'User', icon: 'pi pi-user' }
  ];

  selectModule(route: string) {
    this.activeModule.set(route);
  }
}
