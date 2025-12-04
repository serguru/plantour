import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, UserThingService } from 'shared-lib';
import { ToolbarAware } from '../toolbar-aware';

@Component({
  selector: 'app-things',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule],
  templateUrl: './things.component.html',
  styleUrl: './things.component.scss'
})
export class ThingsComponent extends ToolbarAware implements OnInit {
  private userThingService = inject(UserThingService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  userThings: any[] = [];
  selectedThing: any = null;

  ngOnInit(): void {
    this.loadUserThings();
    this.setupToolbarButtons();
  }

  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        id: 'add-thing',
        icon: 'pi pi-plus',
        tooltip: 'Add Thing',
        command: () => this.onAddThing()
      },
      {
        id: 'edit-thing',
        icon: 'pi pi-pencil',
        tooltip: 'Edit Thing',
        command: () => this.onEditSelectedThing(),
        disabled: true // Initially disabled until something is selected
      },
      {
        id: 'delete-thing',
        icon: 'pi pi-trash',
        tooltip: 'Delete Thing',
        command: () => this.onDeleteSelectedThing(),
        disabled: true // Initially disabled until something is selected
      },
      {
        id: 'refresh-things',
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadUserThings()
      }
    ]);
  }

  private loadUserThings(): void {
    this.userThingService.getAll().subscribe({
      next: (things) => {
        this.userThings = things;
      },
      error: (error) => {
        console.error('Error loading user things:', error);
      }
    });
  }

  onSelectionChange(): void {
    // Update toolbar buttons based on selection state
    const hasSelection = this.selectedThing != null;
    
    this.updateToolbarButtons({
      'edit-thing': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Edit "${this.selectedThing?.shortDescription}"` : 'Edit Thing'
      },
      'delete-thing': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Delete "${this.selectedThing?.shortDescription}"` : 'Delete Thing'
      }
    });
  }

  onAddThing(): void {
    this.router.navigate(['/things/add']);
  }

  onEditSelectedThing(): void {
    if (this.selectedThing) {
      this.router.navigate(['/things/edit', this.selectedThing.id]);
    }
  }

  onEditThing(thing: any): void {
    this.router.navigate(['/things/edit', thing.id]);
  }

  async onDeleteSelectedThing(): Promise<void> {
    if (!this.selectedThing) {
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: 'Delete Thing',
      message: `Are you sure you want to delete "${this.selectedThing.shortDescription}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.userThingService.delete(this.selectedThing.id).subscribe({
        next: () => {
          this.selectedThing = null;
          this.onSelectionChange(); // Update toolbar state
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
          if (this.selectedThing?.id === thing.id) {
            this.selectedThing = null;
            this.onSelectionChange(); // Update toolbar state
          }
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
