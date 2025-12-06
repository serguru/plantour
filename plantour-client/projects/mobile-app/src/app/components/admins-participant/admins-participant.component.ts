import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { MessagesService, AdminsParticipantService, AdminsParticipantDto, ThingsUtilsComponent, LookupService, ParticipantStatusDto } from 'shared-lib';
import { ToolbarAware } from '../toolbar-aware';

@Component({
  selector: 'app-admins-participant',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ListboxModule, ButtonModule, ThingsUtilsComponent],
  templateUrl: './admins-participant.component.html',
  styleUrl: './admins-participant.component.scss'
})
export class AdminsParticipantComponent extends ToolbarAware implements OnInit {
  private adminsParticipantService = inject(AdminsParticipantService);
  private lookupService = inject(LookupService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  participants: AdminsParticipantDto[] = [];
  selectedParticipant: AdminsParticipantDto | null = null;
  showToolbar: boolean = false;
  sortOrder: 'asc' | 'desc' | 'none' = 'none';
  filterText: string = '';
  selectedParticipantStatus: string | null = null;
  participantStatuses: ParticipantStatusDto[] = [];

  get participantStatusNames(): string[] {
    return this.participantStatuses.map(s => s.name);
  }

  get sortedParticipants(): AdminsParticipantDto[] {
    let result = this.participants;
    
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
    this.loadParticipantStatuses();
    this.loadParticipants();
    this.setupToolbarButtons();
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
        id: 'add-participant',
        icon: 'pi pi-plus',
        tooltip: 'Add Participant',
        command: () => this.onAddParticipant()
      },
      {
        id: 'edit-participant',
        icon: 'pi pi-pencil',
        tooltip: 'Edit Participant',
        command: () => this.onEditSelectedParticipant(),
        disabled: true
      },
      {
        id: 'delete-participant',
        icon: 'pi pi-trash',
        tooltip: 'Delete Participant',
        command: () => this.onDeleteSelectedParticipant(),
        disabled: true
      },
      {
        id: 'refresh-participants',
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadParticipants()
      }
    ]);
  }

  private loadParticipants(): void {
    this.adminsParticipantService.getAll().subscribe({
      next: (participants) => {
        this.participants = participants;
      },
      error: (error) => {
        console.error('Error loading participants:', error);
      }
    });
  }

  onSelectionChange(): void {
    const hasSelection = this.selectedParticipant != null;
    
    this.updateToolbarButtons({
      'edit-participant': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Edit "${this.selectedParticipant?.email}"` : 'Edit Participant'
      },
      'delete-participant': { 
        disabled: !hasSelection,
        tooltip: hasSelection ? `Delete "${this.selectedParticipant?.email}"` : 'Delete Participant'
      }
    });
  }

  onAddParticipant(): void {
    this.router.navigate(['/admins-participant/add']);
  }

  onEditSelectedParticipant(): void {
    if (this.selectedParticipant) {
      this.router.navigate(['/admins-participant/edit', this.selectedParticipant.id]);
    }
  }

  async onDeleteSelectedParticipant(): Promise<void> {
    if (!this.selectedParticipant) {
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: 'Delete Participant',
      message: `Are you sure you want to delete participant "${this.selectedParticipant.email}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.adminsParticipantService.delete(this.selectedParticipant.id).subscribe({
        next: () => {
          this.selectedParticipant = null;
          this.onSelectionChange();
          this.loadParticipants();
          this.messagesService.showInfo('Participant deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting participant:', error);
          this.messagesService.showError('Failed to delete participant');
        }
      });
    }
  }

  toggleToolbar(): void {
    this.showToolbar = !this.showToolbar;
  }
}
