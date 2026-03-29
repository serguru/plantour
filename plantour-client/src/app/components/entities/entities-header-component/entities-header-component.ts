import { Component, inject, input, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentService } from '../../../services/component-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessagesService } from '../../../services/messages-service';
import { Popover } from 'primeng/popover';
import { HelpService } from '../../../services/help-service';

export interface MenuConfig {
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  disabledIfNoSelection?: boolean;
}

export interface HeaderButtonConfig {
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
}

@Component({
  selector: 'app-entities-header',
  imports: [
    Popover
],
  templateUrl: './entities-header-component.html',
  styleUrl: './entities-header-component.scss',
})
export class EntitiesHeader implements OnInit {
  private readonly helpContextService = inject(HelpService);

  @Input() entityIcon: string | null = null;
  @Input() title: string | null = null;
  @Input() addUrl: string | Function | null = null;
  @Input() editUrl: string | Function | null = null;
  @Input() viewUrl: string | Function | null = null;
  @Input() delete: ((id: string) => void) | null = null;
  @Input() entityName: string = '';

  headerButtons = input<HeaderButtonConfig[]>([]);
  menuItems = input<MenuConfig[]>([]);
  helpPageId = input<string | null>(null);
  showHelpAction = input<boolean>(true);

  deleteMessage = input<string>('');
  
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
    if (!this.addUrl) {
      return;
    }
    if (typeof this.addUrl === 'function') {
      this.addUrl();
    } else {
      this.router.navigate([this.addUrl], { relativeTo: this.route });
    }
  }

  onEdit() {
    if (!this.editUrl) {
      return;
    }

    if (typeof this.editUrl === 'function') {
      this.editUrl();
      return;
    }

    if (!this.selectedId() || !this.editUrl) {
      return;
    }
    const id = this.selectedId();
    this.router.navigate([this.editUrl.replace(':id', id!)], { relativeTo: this.route });
  }

  onView() {
    if (!this.viewUrl) {
      return;
    }

    if (typeof this.viewUrl === 'function') {
      this.viewUrl();
      return;
    }

    if (!this.selectedId() || !this.viewUrl) {
      return;
    }
    const id = this.selectedId();
    this.router.navigate([this.viewUrl.replace(':id', id!)], { relativeTo: this.route });
  }

  async onDelete(): Promise<void> {

    if (!this.selectedId() || !this.delete) {
      return;
    }

    const result = await this.messagesService.openOkCancel({
      title: `Delete ${this.entityName}`,
      message: this.deleteMessage() || `Are you sure you want to delete this ${this.entityName}?`,
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
      case 'packing': return 'pi pi-shopping-bag';
      case 'assigning': return 'pi pi-user';
      default: return '';
    }
  }

  getEntitiesActionClass(): string {
    return this.entitiesActionsVisible() ? 'pi pi-chevron-up' : 'pi pi-chevron-down';
  }


  onMenuClick(event, item: MenuConfig, popover: Popover) {
    event.stopPropagation();
    if (item.disabled || (item.disabledIfNoSelection && !this.selectedId())) {
      return;
    }
    item.action();
    popover.hide();
  }

  getResolvedMenuItems(): MenuConfig[] {
    const items = [...this.menuItems()];
    const componentId = this.helpContextService.resolveComponentId(
      this.route.snapshot.pathFromRoot.map((snapshot) => snapshot.data['componentId'] as string | null | undefined)
    );
    const pageId = this.helpContextService.resolvePageId(this.router.url, this.helpPageId(), componentId);
    const helpUrl = this.showHelpAction() ? this.helpContextService.getPageUrl(pageId) : null;

    if (helpUrl) {
      items.push({
        label: 'Help',
        icon: 'question-circle',
        action: () => {
          void this.router.navigateByUrl(helpUrl);
        }
      });
    }

    return items;
  }

}