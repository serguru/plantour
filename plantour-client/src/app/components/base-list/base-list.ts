import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { CrudService } from '../../services/crud-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentLayoutComponent } from "../layouts/content-layout.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListActionsComponent } from '../list-actions/list-actions.component';
import { MessagesService } from '../../services/messages-service';
import { ButtonModule } from 'primeng/button';
import { ListBoxComponent } from '../list-box/list-box.component';
import { ToolbarAware } from '../toolbar-aware';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [
    ContentLayoutComponent,
    FormsModule,
    CommonModule,
    ListActionsComponent,
    ButtonModule,
    ListBoxComponent
  ],
  templateUrl: './base-list.html',
  styleUrl: './base-list.scss'
})
export class BaseListComponent<T> extends ToolbarAware implements OnInit {

  @ViewChild('listboxPlantour', { read: ElementRef }) listboxRef!: ElementRef;

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
  @Input() toolBarButtons: any[] | null = null;
  @Input() useTripId: boolean = false;
  @Output() entitySelected = new EventEmitter<any | null>();

  entities: T[] | null = null;
  selected: T | null = null;
  processedEntities: T[] | null = null;
  isAnyFeatureActive: boolean = false;

  listToolsShown: boolean = false;
  tripId: string | null = null;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    if (this.useTripId) {
      this.tripId = this.route.snapshot.paramMap.get('tripId');
    }
    const selectId = this.route.snapshot.queryParamMap.get('selectId') || null;
    this.getAll(selectId);
    this.setupToolbarButtons();
  }

  private setupToolbarButtons(): void {
    if (!this.toolBarButtons) return;

    this.setToolbarButtons(
      this.toolBarButtons
    );
  }

  getAll(selectId?: string | null) {
    this.service.getAll(this.tripId!).subscribe(list => {
      this.entities = list;
      this.processedEntities = this.entities;
      this.selectEntity(selectId);
    });
  }

  onSelectedChange(selected: any | null) {
    this.selected = selected;
    if (this.entitySelected) {
      this.entitySelected.emit(this.selected);
    } 
  }

  onSelectedChangeDblClick(selected: any | null) {
    this.selected = selected;
    this.onEdit();
  }

  selectEntity(id?: string | null): void {
    if (!this.processedEntities || !id) return;

    const entity = this.processedEntities.find(e => (e as any).id === id);
    if (entity) {
      this.selected = entity;
    }
  }

  onAdd() {
    this.router.navigate([this.addUrl],{relativeTo: this.route});
  }

  onEdit() {
    if (!this.selected || this.isListReadOnly || !this.editUrl) return;
    const id = (this.selected as any).id;
    this.router.navigate([this.editUrl.replace(':id', id)],{relativeTo: this.route});
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

  scrollToSelectedItem() {

    if (!this.listboxRef?.nativeElement) return;

    const el = this.listboxRef.nativeElement
      .querySelector('.p-listbox-option-selected') as HTMLElement;


    if (el) {
      el.scrollIntoView({
        block: 'center',
        behavior: 'instant'
      });
    }
  }
}