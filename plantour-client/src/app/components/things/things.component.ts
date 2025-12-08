import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { ToolbarAware } from '../toolbar-aware';
import { ContentLayoutComponent } from '../layouts/content-layout.component';
import { ThingsUtilsComponent } from '../things-utils/things-utils.component';
import { UserThingDto, UserThingService } from '../../services/user-thing-service';
import { MessagesService } from '../../services/messages-service';

@Component({
  selector: 'app-things',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule, ThingsUtilsComponent, ContentLayoutComponent],
  templateUrl: './things.component.html',
  styleUrl: './things.component.scss'
})
export class ThingsComponent extends ToolbarAware implements OnInit {
  private userThingService = inject(UserThingService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  userThings: UserThingDto[] = [];
  selectedThing: UserThingDto | null = null;
  showToolbar: boolean = false;
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  filterText: string = '';
  selectedCategory: string | null = null;

  get categories(): string[] {
    const uniqueCategories = new Set<string>();
    
    this.userThings.forEach(thing => {
      if (thing.category) {
        uniqueCategories.add(thing.category);
      }
    });
    
    const sortedCategories = Array.from(uniqueCategories).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    
    return ['(No Category)', ...sortedCategories];
  }

  get sortedThings(): UserThingDto[] {
    let result = this.userThings;
    
    // Apply category filter
    if (this.selectedCategory !== null) {
      if (this.selectedCategory === '(No Category)') {
        result = result.filter(thing => !thing.category);
      } else {
        result = result.filter(thing => thing.category === this.selectedCategory);
      }
    }
    
    // Apply text filter
    if (this.filterText.trim()) {
      const filterLower = this.filterText.toLowerCase();
      result = result.filter(thing => 
        thing.name.toLowerCase().includes(filterLower) ||
        (thing.notes && thing.notes.toLowerCase().includes(filterLower))
      );
    }
    
    // Apply sort
    if (this.sortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (this.sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }
    
    return result;
  }

  highlightText(text: string): string {
    if (!this.filterText.trim() || !text) {
      return text;
    }
    
    const filterLower = this.filterText.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(filterLower);
    
    if (index === -1) {
      return text;
    }
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + this.filterText.length);
    const after = text.substring(index + this.filterText.length);
    
    return `${before}<mark>${match}</mark>${after}`;
  }

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

  toggleToolbar(): void {
    this.showToolbar = !this.showToolbar;
  }
}
