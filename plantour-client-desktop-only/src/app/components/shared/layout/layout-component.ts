import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Splitter } from 'primeng/splitter';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { MenuItem } from 'primeng/api';
import { ToolbarMenuService } from '../../../services/toolbar-menu.service';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    Splitter,
    ButtonModule,
    ListboxModule
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

  constructor(
    private router: Router,
    private toolbarMenu: ToolbarMenuService
  ) {
    this.updateLayoutToolbarMenu();
  }

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
    this.updateLayoutToolbarMenu();
  }

  /**
   * Layout-level toolbar menu: a single item that toggles
   * visibility of the side panel + splitter.
   */
  private updateLayoutToolbarMenu() {
    const visible = this.leftPanelVisible();

    const items: MenuItem[] = [
      {
        label: visible ? 'Hide side panel' : 'Show side panel',
        icon: visible ? 'pi pi-chevron-left' : 'pi pi-chevron-right',
        command: () => this.toggleLeftPanel()
      }
    ];

    this.toolbarMenu.setLayoutItems(items);
  }
}
