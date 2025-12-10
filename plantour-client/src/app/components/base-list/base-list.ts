import { Component, inject, Input, OnInit, TemplateRef } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentLayoutComponent } from "../layouts/content-layout.component";
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListActionsComponent } from '../list-actions/list-actions.component';
import { MessagesService } from '../../services/messages-service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [
    ContentLayoutComponent,
    FormsModule,
    ListboxModule,
    CommonModule,
    ListActionsComponent,
    ButtonModule
  ],
  templateUrl: './base-list.html',
  styleUrl: './base-list.scss'
})
export class BaseListComponent<T> implements OnInit {
  private messagesService = inject(MessagesService);

  @Input() service!: CrudService<T, any, any>;
  @Input() itemTemplate!: TemplateRef<any>;
  @Input() title: string | null = null;
  @Input() entityIcon: string | null = null;
  @Input() listActionsConfiguration: any[] = [];
  @Input() addUrl: string | null = null;
  @Input() editUrl: string | null = null;
  @Input() isListReadOnly: boolean = false;
  @Input() entityNameProp: string = 'name';
  @Input() entityName: string = '';


  entities: T[] | null = null;
  selected: T | null = null;
  processedEntities: T[] | null = null;
  isAnyFeatureActive: boolean = false;

  listToolsShown: boolean = false;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getAll();
  }

  getAll() {
    this.service.getAll().subscribe(list => {
      this.entities = list;
      this.processedEntities = this.entities;
    });
  }

  onAdd() {
    this.router.navigate([this.addUrl]);
  }

  onEdit() {
    if (!this.selected) return;
    const id = (this.selected as any).id;
    this.router.navigate([this.editUrl, id]);
  }

  get listNotEmpty(): boolean {
    return (this.entities?.length ?? 0) > 0;
  }

  onEntitiesChanged(response: any): void {
    this.processedEntities = response.processedEntities;
    this.isAnyFeatureActive = response.isAnyFeatureActive;
  }

  showListActions() {
    this.listToolsShown = true;
  }

  hideListActions() {
    this.listToolsShown = false;
  }

  get list(): T[] {
    return this.processedEntities ? this.processedEntities : this.entities || [];
  }

  async onDelete(): Promise<void> {

    if (!this.selected) return;

    const result = await this.messagesService.openOkCancel({
      title: `Delete ${this.entityName}`,
      message: `Are you sure you want to delete "${(this.selected as any)[this.entityNameProp]}"?`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });

    if (result === 'ok') {
      this.service.delete((this.selected as any)["id"])
        .subscribe({
          next: () => {
            this.getAll();
          },
          error: (error) => {
            this.messagesService.showError(`Failed to delete ${this.entityName}`);
          }
        });
    }
  }
}