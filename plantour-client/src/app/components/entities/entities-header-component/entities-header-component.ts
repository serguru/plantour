import { Component, inject, input, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessagesService } from '../../../services/messages-service';

@Component({
  selector: 'app-entities-header',
  imports: [
    
  ],
  templateUrl: './entities-header-component.html',
  styleUrl: './entities-header-component.scss',
})
export class EntitiesHeaderComponent implements OnInit {
  @Input() entityIcon: string | null = null;
  @Input() title: string | null = null;
  @Input() isListReadOnly: boolean = false;
  @Input() addUrl: string | null = null;
  @Input() editUrl: string | null = null;
  @Input() delete: ((id: string) => void) | null = null;
  @Input() entityName: string = '';
  @Input() entityNameProp: string = 'name';

  useEntitiesActions = input<boolean>(true);
  componentService = inject(ComponentService);

  entitiesActionsVisible = toSignal(this.componentService.entitiesActionsVisible$, { initialValue: false });

  anyConditionSet = toSignal(this.componentService.conditionSet$, { initialValue: false });

  toggleEntitiesActions() {
    this.componentService.updateEntitiesActionsVisible(!this.entitiesActionsVisible());
  }

  router = inject(Router);
  route = inject(ActivatedRoute);
  messagesService = inject(MessagesService);

  selectedId = toSignal(this.componentService.selectedId$, { initialValue: null });

  
  ngOnInit(): void {

  }

  onAdd() {
    this.router.navigate([this.addUrl], { relativeTo: this.route });
  }

  onEdit() {
    if (!this.selectedId() || this.isListReadOnly || !this.editUrl) {
      return;
    }
    const id = this.selectedId();
    this.router.navigate([this.editUrl.replace(':id', id!)], { relativeTo: this.route });
  }

  async onDelete(): Promise<void> {

    if (!this.selectedId() || !this.delete) {
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: `Delete ${this.entityName}`,
      message: `Are you sure you want to delete this ${this.entityName}?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result !== 'ok') {
      return;
    }
    this.delete(this.selectedId()!);
  }

  getIconByActionType(type: string): string {
    switch (type) {
      case 'filtering': return 'pi pi-filter';
      case 'packing': return 'pi pi-box';
      case 'assigning': return 'pi pi-user';
      default: return '';
    } 
  }

  getEntitiesActionClass(): string {
    return this.entitiesActionsVisible() ? 'pi pi-chevron-up' : 'pi pi-chevron-down';
  }

}