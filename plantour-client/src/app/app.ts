import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsersService } from './services/users-service';
import { MessagesService } from './services/messages-service';
import { ButtonModule } from 'primeng/button';
import { ToastContainerComponent } from './components/shared/toast-container-component/toast-container-component';
import { ModalDialogComponent } from './components/shared/modal-dialog-component/modal-dialog-component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, ToastContainerComponent, ModalDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('plantour-client');
  protected readonly profile = signal<string>('');
  public usersService = inject(UsersService);
  public mwessagesService = inject(MessagesService);

  async delete() {
    const result = await this.mwessagesService.openYesNoCancel({
      title: 'Delete item',
      message: 'Do you really want to delete this item?'
    });

    if (result === 'yes') {
      // perform delete
      this.mwessagesService.showInfo('Deleted', 'Item was deleted.');
    } else if (result === 'no') {
      this.mwessagesService.showInfo('Skipped', 'Item was not deleted.');
    }
    // result === 'cancel' -> user escaped/closed dialog
  }

  async delete1() {
    const result = await this.mwessagesService.openOkCancel({
      title: 'Delete item',
      message: 'Do you really want to delete this item?'
    });

    if (result === 'ok') {
      // perform delete
      this.mwessagesService.showInfo('Deleted', 'Item was deleted.');
    } else if (result === 'cancel') {
      this.mwessagesService.showInfo('Skipped', 'Item was not deleted.');
    }
    // result === 'cancel' -> user escaped/closed dialog
  }


  show = () => {
    this.delete1();
  }

  getProfile = () => {
    this.usersService.getProfile().subscribe(p => this.profile.set(JSON.stringify(p)))
  }
}

