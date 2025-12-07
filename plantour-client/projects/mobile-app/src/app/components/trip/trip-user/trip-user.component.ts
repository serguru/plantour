import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, TripUserService, TripUserDto, ThingsUtilsComponent, LookupService, ParticipantStatusDto } from 'shared-lib';
import { ToolbarAware } from '../../toolbar-aware';
import { ContentLayoutComponent } from '../../layouts/content-layout.component';

@Component({
  selector: 'app-trip-user',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule, ThingsUtilsComponent,
      ContentLayoutComponent],
  templateUrl: './trip-user.component.html',
  styleUrl: './trip-user.component.scss'
})
export class TripUserComponent extends ToolbarAware implements OnInit {
  private tripUserService = inject(TripUserService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tripId: string = '';
  tripUsers: TripUserDto[] = [];
  selectedTripUser: TripUserDto | null = null;
  showToolbar: boolean = false;
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  filterText: string = '';
  selectedParticipantStatus: string | null = null;
  participantStatuses: ParticipantStatusDto[] = [];

  get participantStatusNames(): string[] {
    return this.participantStatuses.map(s => s.name);
  }

  get sortedTripUsers(): TripUserDto[] {
    let result = this.tripUsers;
    
    // Apply participant status filter
    if (this.selectedParticipantStatus !== null) {
      const statusId = this.participantStatuses.find(s => s.name === this.selectedParticipantStatus)?.id;
      if (statusId) {
        result = result.filter(p => p.participantStatus === statusId);
      }
    }
    
    // Apply text filter
    if (this.filterText.trim()) {
      const filterLower = this.filterText.toLowerCase();
      result = result.filter(p => 
        p.email.toLowerCase().includes(filterLower) ||
        (p.firstName && p.firstName.toLowerCase().includes(filterLower)) ||
        (p.lastName && p.lastName.toLowerCase().includes(filterLower)) ||
        (p.phone && p.phone.toLowerCase().includes(filterLower)) ||
        (p.notes && p.notes.toLowerCase().includes(filterLower))
      );
    }
    
    // Apply sort by email
    if (this.sortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        const emailA = a.email.toLowerCase();
        const emailB = b.email.toLowerCase();
        
        if (this.sortOrder === 'asc') {
          return emailA.localeCompare(emailB);
        } else {
          return emailB.localeCompare(emailA);
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

  getParticipantStatusName(statusId: string | null | undefined): string {
    if (!statusId) return '';
    const status = this.participantStatuses.find(s => s.id === statusId);
    return status ? status.name : '';
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      if (this.tripId) {
        this.loadParticipantStatuses();
        this.loadTripUsers();
        this.setupToolbarButtons();
      } else {
        this.messagesService.showError('Trip ID not provided');
        this.router.navigate(['/trips']);
      }
    });
  }

  private loadParticipantStatuses(): void {
    this.lookupService.getParticipantStatuses().subscribe({
      next: (statuses) => {
        this.participantStatuses = statuses;
      },
      error: (error) => {
        console.error('Error loading participant statuses:', error);
      }
    });
  }

  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        id: 'add-trip-user',
        icon: 'pi pi-plus',
        tooltip: 'Add Trip User',
        command: () => this.onAddTripUser()
      },
      {
        id: 'edit-trip-user',
        icon: 'pi pi-pencil',
        tooltip: 'Edit Trip User',
        command: () => this.onEditSelectedTripUser(),
        disabled: true
      },
      {
        id: 'delete-trip-user',
        icon: 'pi pi-trash',
        tooltip: 'Delete Trip User',
        command: () => this.onDeleteSelectedTripUser(),
        disabled: true
      },
      {
        id: 'refresh-trip-users',
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadTripUsers()
      }
    ]);
  }

  private loadTripUsers(): void {
    this.tripUserService.getAll(this.tripId).subscribe({
      next: (tripUsers) => {
        this.tripUsers = tripUsers;
      },
      error: (error) => {
        console.error('Error loading trip users:', error);
      }
    });
  }

  onSelectionChange(): void {
    const hasSelection = this.selectedTripUser != null;
    
    this.updateToolbarButtons({
      'edit-trip-user': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Edit "${this.selectedTripUser?.email}"` : 'Edit Trip User'
      },
      'delete-trip-user': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Delete "${this.selectedTripUser?.email}"` : 'Delete Trip User'
      }
    });
  }

  onAddTripUser(): void {
    this.router.navigate(['/trips', this.tripId, 'users', 'add']);
  }

  onEditSelectedTripUser(): void {
    if (this.selectedTripUser) {
      this.router.navigate(['/trips', this.tripId, 'users', 'edit', this.selectedTripUser.id]);
    }
  }

  async onDeleteSelectedTripUser(): Promise<void> {
    if (!this.selectedTripUser) {
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: 'Delete Trip User',
      message: `Are you sure you want to delete trip user "${this.selectedTripUser.email}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.tripUserService.delete(this.selectedTripUser.id).subscribe({
        next: () => {
          this.selectedTripUser = null;
          this.onSelectionChange();
          this.loadTripUsers();
          this.messagesService.showInfo('Trip user deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting trip user:', error);
          this.messagesService.showError('Failed to delete trip user');
        }
      });
    }
  }

  toggleToolbar(): void {
    this.showToolbar = !this.showToolbar;
  }
}
