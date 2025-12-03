import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { NavigationService } from '../../services/navigation.service';
import { MessagesService, UserThingService } from 'shared-lib';

@Component({
  selector: 'app-things',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule],
  templateUrl: './things.component.html',
  styleUrl: './things.component.scss'
})
export class ThingsComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private userThingService = inject(UserThingService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  userThings: any[] = [];
  selectedThing: any = null;

  ngOnInit(): void {
    this.navigationService.setCustomBackPath('/landing-registered', true);
    this.loadUserThings();
  }

  private loadUserThings(): void {
    this.userThingService.getAll().subscribe({
      next: (things) => {
        // things are automatically updated in the service
        this.userThings = things;
      },
      error: (error) => {
        console.error('Error loading user things:', error);
      }
    });
  }

  onAddThing(): void {
    this.router.navigate(['/things/add']);
  }

  onEditThing(thing: any): void {
    this.router.navigate(['/things/edit', thing.id]);
  }

  async onDeleteThing(thing: any): Promise<void> {
    const result = await this.messagesService.openOkCancel({
      title: 'Delete Thing',
      message: `Are you sure you want to delete "${thing.shortDescription}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.userThingService.delete(thing.id).subscribe({
        next: () => {
          this.loadUserThings();
          this.messagesService.showInfo('Thing deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting thing:', error);
          this.messagesService.showError('Failed to delete thing');
        }
      });
    }
  }
}
