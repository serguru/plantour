import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Splitter } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { ListboxModule } from 'primeng/listbox';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    FormsModule,
    Splitter,
    ToolbarModule,
    ButtonModule,
    BadgeModule,
    MenubarModule,
    MenuModule,
    ListboxModule
  ],
  templateUrl: './layout-component.html',
  styleUrls: ['./layout-component.scss']
})
export class LayoutComponent {
  leftPanelVisible = signal(true);

  constructor(private router: Router) {}

  modules = [
    { label: 'Travelers', icon: 'pi pi-users', route: 'travelers' },
    { label: 'Things', icon: 'pi pi-box', route: 'things' },
    { label: 'Trips', icon: 'pi pi-map', route: 'trips' }
  ];

  activeModule = signal<string>('travelers');

  topMenuItems = computed<MenuItem[]>(() => {
    switch (this.activeModule()) {
      case 'travelers':
        return [
          { label: 'Add Traveler', icon: 'pi pi-user-plus' },
          { label: 'Groups', icon: 'pi pi-folder' }
        ];
      case 'things':
        return [
          { label: 'Add Thing', icon: 'pi pi-plus' },
          { label: 'Categories', icon: 'pi pi-tags' }
        ];
      case 'trips':
        return [
          { label: 'Add Trip', icon: 'pi pi-map-marker' },
          { label: 'Templates', icon: 'pi pi-clone' }
        ];
      default:
        return [];
    }
  });

  rightMenu: MenuItem[] = [
    { label: 'Notifications', icon: 'pi pi-bell', badge: '1' },
    { label: 'Help', icon: 'pi pi-question-circle' },
    { label: 'Privacy', icon: 'pi pi-file' },
    { label: 'User', icon: 'pi pi-user' }
  ];

  get selectedModuleRoute(): string {
    return this.activeModule();
  }

  set selectedModuleRoute(route: string) {
    this.selectModule(route);
  }

  selectModule(route: string) {
    this.activeModule.set(route);
    this.router.navigate([route]);
  }

  toggleLeftPanel() {
    this.leftPanelVisible.set(!this.leftPanelVisible());
  }
}
