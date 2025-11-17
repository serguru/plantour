import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, Router, NavigationStart } from '@angular/router';

import { ToolbarModule } from 'primeng/toolbar';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

import { ToastContainerComponent } from './components/shared/toast-container/toast-container-component';
import { ModalDialogComponent } from './components/shared/modal-dialog/modal-dialog-component';
import { ToolbarMenuService } from './services/toolbar-menu.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    ToolbarModule,
    MenubarModule,
    MenuModule,
    ButtonModule,
    ToastContainerComponent,
    ModalDialogComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private toolbarMenu = inject(ToolbarMenuService);
  private router = inject(Router);

constructor() {
  this.router.events.subscribe(event => {
    if (event instanceof NavigationStart) {
      this.toolbarMenu.clearChildItems();
    }
  });
}  

  /** Consolidated menu: layout + active child component menu */
  mainMenu = this.toolbarMenu.allMenu;

  /** Static right-aligned menu (moved from LayoutComponent) */
  rightMenu: MenuItem[] = [
    { label: 'Notifications', icon: 'pi pi-bell' },
    { label: 'Help', icon: 'pi pi-question-circle' },
    { label: 'Privacy', icon: 'pi pi-file' },
    { label: 'User', icon: 'pi pi-user' }
  ];

  navigateHome() {
    this.router.navigateByUrl('/');
  }
}
