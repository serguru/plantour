import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from './components/toolbar/toolbar-component';
import { ToastContainerComponent } from './components/toast-container/toast-container-component';
import { ModalDialogComponent } from './components/modal-dialog/modal-dialog-component';
import { ToolbarService } from './services/toolbar-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, ToastContainerComponent, ModalDialogComponent ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Mobile app works');

  toolbarService = inject(ToolbarService);

  onActivate($event) {
  }

  onDeactivate($event) {
    this.toolbarService.setCurrentButtons(null);
    this.toolbarService.setCurrentMenus(null);
  }
  
}
