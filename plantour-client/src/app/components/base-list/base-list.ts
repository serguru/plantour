import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest } from '../../services/crud-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentLayoutComponent } from "../layouts/content-layout.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListActionsComponent } from '../list-actions/list-actions.component';
import { MessagesService } from '../../services/messages-service';
import { ButtonModule } from 'primeng/button';
import { ListBoxComponent } from '../list-box/list-box.component';
import { ToolbarAware } from '../toolbar-aware';
import { DicTripComponent } from '../dic-trip/dic-trip.component';
import { TripDto, TripService } from '../../services/trip-service';
import { finalize } from 'rxjs';

export type Comparable = {
  name?: string;
  email?: string;
};

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [
    ContentLayoutComponent,
    FormsModule,
    CommonModule,
    ListActionsComponent,
    ButtonModule,
    ListBoxComponent,
    DicTripComponent
  ],
  templateUrl: './base-list.html',
  styleUrl: './base-list.scss'
})
export class BaseListComponent<T> extends ToolbarAware implements OnInit {

  @ViewChild('listboxPlantour', { read: ElementRef }) listboxRef!: ElementRef;

  private messagesService = inject(MessagesService);

  @Input() service!: CrudService<any, any, any>;
  @Input() tripDicService: CrudService<T, any, any> | null = null;
  @Input() fromDicService: FromDicService | null = null;
  @Input() itemTemplate!: TemplateRef<any>;
  @Input() title: string | null = null;
  @Input() entityIcon: string | null = null;
  @Input() listActionsConfiguration: any[] = [];
  @Input() addUrl: string | null = null;
  @Input() editUrl: string | null = null;
  @Input() dic2trip: boolean = false;
  @Input() isListReadOnly: boolean = false;
  @Input() entityNameProp: string = 'name';
  @Input() entityName: string = '';
  @Input() toolBarButtons: any[] | null = null;
  @Input() useTripId: boolean = false;
  @Output() entitySelected = new EventEmitter<any | null>();

  tripEntities: any[] | null = null;
  entities: T[] | null = null;
  selected: T | null = null;
  isAnyFeatureActive: boolean = false;

  listToolsShown: boolean = false;
  tripId: string | null = null;

  dic2tripVisible: boolean = false;

  processedEntities: T[] | null = null;


  constructor(
    protected router: Router,
    protected route: ActivatedRoute
  ) {
    super();
  }

  get entitiesToDisplay(): any | null {

    const result: any = {};

    if (!this.processedEntities || !this.tripEntities || this.tripEntities.length === 0) {
      result.list = this.processedEntities;
      result.addedCount = this.processedEntities?.filter(entity => (entity as any).inTripId).length || 0;
      result.notAddedCount = (this.processedEntities?.length || 0) - result.addedCount;
      return result;
    };

    const newItems = this.processedEntities!.map(entity => {

      const tripEntity = this.tripEntities!.find(x => this.equalsByNameOrEmail(entity as any, x as any));

      if (tripEntity) {
        return { ...entity as any, inTripId: tripEntity.id };
      }

      return entity;
    });

    result.list = newItems;
    result.addedCount = newItems.filter(entity => (entity as any).inTripId).length || 0;
    result.notAddedCount = (newItems?.length || 0) - result.addedCount;
    return result;
  }


  equalsByNameOrEmail(
    a: Comparable,
    b: Comparable,
    locale: string = 'en'
  ): boolean {
    const hasName =
      typeof a.name === 'string' &&
      typeof b.name === 'string';

    const hasEmail =
      typeof a.email === 'string' &&
      typeof b.email === 'string';

    if (!hasName && !hasEmail) {
      throw new Error(
        'Both objects must contain either "name" or "email" property'
      );
    }

    if (hasName) {
      return a.name!.localeCompare(b.name!, locale, {
        sensitivity: 'accent',
        usage: 'search',
      }) === 0;
    }

    return a.email!.localeCompare(b.email!, locale, {
      sensitivity: 'accent',
      usage: 'search',
    }) === 0;
  }


  checkSelectedTrip: (() => TripDto | null) | null = null;

  setCheckSelectedTrip(getter: (() => TripDto | null) | null) {
    this.checkSelectedTrip = getter;
  }

  onSelectedTripChanged(trip: any | null) {
    this.refreshTripEntities(trip.id)
  }

  refreshTripEntities(id: string | null) {
    if (!id) {
      this.tripEntities = [];
      return;
    }

    if (!this.tripDicService) {
      throw new Error('tripDicService is not set');
    }

    this.tripDicService.getAll(id).subscribe(entities => {
      this.tripEntities = entities;
    });
  }

  onToggleTrip() {
    if (!this.dic2trip) return;
    this.dic2tripVisible = !this.dic2tripVisible;
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

  processInTrip(tripDto: TripDto, item: any) {

    if (!item || !this.tripDicService || !this.fromDicService) return;

    const data: MultipleIdsRequest = {
      collectionId: tripDto.id,
      ids: [item.id]
    };

    if (item.inTripId) {
      this.deleteFromDic(data);
//       this.tripDicService!.delete(item.inTripId)
//         .pipe(
//           finalize(() => {
//             this.refreshTripEntities(tripDto.id);
//           })
//         )
//         .subscribe({
//           next: () => {
// //            this.messagesService.showInfo(`${this.entityName} deleted from trip "${tripDto.name}" successfully`);
//           },
//           error: (e) => {
//             this.messagesService.showError(`Failed deleting ${this.entityName} from trip "${tripDto.name} with error: ${e.message}`);
//           }
//         });
      return;
    }


    this.addFromDic(data);

  }

  addFromDic(data: MultipleIdsRequest) {
    this.fromDicService!.addFromDic(data)
      .pipe(
        finalize(() => {
          this.refreshTripEntities(data.collectionId);
        })
      )
      .subscribe({
        next: (processedCount: number) => {
        },
        error: (e) => {
          this.messagesService.showError(`Failed adding to trip with error: ${e.message}`);
        }

      });
  }

  deleteFromDic(data: MultipleIdsRequest) {
    this.fromDicService!.deleteFromDic(data)
      .pipe(
        finalize(() => {
          this.refreshTripEntities(data.collectionId);
        })
      )
      .subscribe({
        next: (processedCount: number) => {
        },
        error: (e) => {
          this.messagesService.showError(`Failed deleting from trip with error: ${e.message}`);
        }
      });
  }


  onAddRemoveFromDic(item: any) {
    if (!this.dic2tripVisible || !this.checkSelectedTrip || !this.tripDicService) {
      return;
    }
    const tripDto = this.checkSelectedTrip!();
    if (!tripDto) {
      return;
    }
    this.processInTrip(tripDto, item);
  }

  selectEntity(id?: string | null): void {
    if (!this.processedEntities || !id) return;

    const entity = this.processedEntities.find(e => (e as any).id === id);
    if (entity) {
      this.selected = entity;
    }
  }

  onAdd() {
    this.router.navigate([this.addUrl], { relativeTo: this.route });
  }

  onEdit() {
    if (!this.selected || this.isListReadOnly || !this.editUrl) return;
    const id = (this.selected as any).id;
    this.router.navigate([this.editUrl.replace(':id', id)], { relativeTo: this.route });
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