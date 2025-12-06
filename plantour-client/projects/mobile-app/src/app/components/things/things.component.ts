import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, UserThingService, UserThingDto } from 'shared-lib';
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

  userThings: UserThingDto[] = [];
  selectedThing: UserThingDto | null = null;

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
        disabled: true
      },
      {
        id: 'delete-thing',
        icon: 'pi pi-trash',
        tooltip: 'Delete Thing',
        command: () => this.onDeleteSelectedThing(),
        disabled: true
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
    const hasSelection = this.selectedThing != null;
    
    this.updateToolbarButtons({
      'edit-thing': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Edit "${this.selectedThing?.name}"` : 'Edit Thing'
      },
      'delete-thing': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Delete "${this.selectedThing?.name}"` : 'Delete Thing'
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

  async onDeleteSelectedThing(): Promise<void> {
    if (!this.selectedThing) {
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: 'Delete Thing',
      message: `Are you sure you want to delete "${this.selectedThing.name}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.userThingService.delete(this.selectedThing.id).subscribe({
        next: () => {
          this.selectedThing = null;
          this.onSelectionChange();
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
