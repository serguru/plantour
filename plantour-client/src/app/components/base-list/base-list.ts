import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CrudService, FromDicService, MultipleIdsRequest, PackingService } from '../../services/crud-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListActionsComponent } from '../list-actions/list-actions.component';
import { MessagesService } from '../../services/messages-service';
import { ButtonModule } from 'primeng/button';
import { ListBoxComponent } from '../list-box/list-box.component';
import { TripDto, TripService } from '../../services/trip-service';
import { finalize } from 'rxjs';
import { TripPanelComponent } from '../trip-panel/trip-panel-component/trip-panel-component';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PackingComponent } from '../packing/packing.component';
import { TripPackageDto, TripPackageService } from '../../services/trip-package-service';
import { TripThingDto } from '../../services/trip-thing-service';
import { UpperActionType } from '../../helpers/enums';
import { PopoverModule } from 'primeng/popover';
import { AppService } from '../../services/app-service';
import { PopoverComponent } from '../popover/popover-component';
import { LocalStorageService } from '../../services/local-storage-service';

export type Comparable = {
  name?: string;
  email?: string;
};

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ListActionsComponent,
    ButtonModule,
    ListBoxComponent,
    TripPanelComponent,
    MenuModule,
    PackingComponent,
    PopoverModule,
    PopoverComponent
  ],
  templateUrl: './base-list.html',
  styleUrl: './base-list.scss'
})
export class BaseListComponent<T> implements OnInit {
  UpperActionType = UpperActionType;

  @ViewChild('listboxPlantour', { read: ElementRef }) listboxRef!: ElementRef;

  private messagesService = inject(MessagesService);
  private tripPackageService = inject(TripPackageService);
  appService = inject(AppService);
  localStorageService = inject(LocalStorageService);

  @Input() service!: CrudService<any, any, any>;
  @Input() itemMetaData: any = null;
  @Input() tripDicService: CrudService<T, any, any> | null = null;
  @Input() fromDicService: FromDicService | null = null;
  @Input() packingService: PackingService | null = null;
  @Input() title: string | null = null;
  @Input() entityIcon: string | null = null;
  @Input() listActionsConfiguration: any[] = [];
  @Input() addUrl: string | null = null;
  @Input() editUrl: string | null = null;
  @Input() tripPanelVisible: boolean = false;
  @Input() upperActionType: UpperActionType = UpperActionType.None;
  @Input() isListReadOnly: boolean = false;
  @Input() entityNameProp: string = 'name';
  @Input() entityName: string = '';
  @Input() useTripId: boolean = false;
  @Input() componentId: string | null = null;
  @Input() itemComponent!: any;

  @Output() entitySelected = new EventEmitter<any | null>();

  @HostListener('window:keydown.escape', ['$event'])
  handleEsc(event: Event) {
  }

  thing2packVisible: boolean = false;
  tripEntities: any[] | null = null;
  entities: T[] | null = null;
  selected: T | null = null;
  isAnyFeatureActive: boolean = false;
  listToolsShown: boolean = false;
  dic2tripVisible: boolean = false;
  listToolsVisible: boolean = false;
  processedEntities: T[] | null = null;
  packages: TripPackageDto[] = [];
  menuItems: any[] = [];

  constructor() {
  }

  router = inject(Router);
  route = inject(ActivatedRoute);


  get tripId(): string | null {
    if (!this.useTripId) {
      return null;
    }
    return this.appService.tripSelectedValue()?.id || null;
  }

  selectedPack: TripPackageDto | null = null;

  ngOnInit() {

    this.appService.tripSelected$.subscribe((trip) => {
      this.onSelectedTripChanged(trip)
    });

    this.appService.packSelected$.subscribe((pack) => {
      this.selectedPack = pack;
    });

    this.getAll(null);
    this.restoreState();
  }

  get showThing2Pack(): boolean {
    return this.upperActionType === UpperActionType.Thing2Pack && this.thing2packVisible;
  }


  get showDic2Trip(): boolean {
    return this.upperActionType === UpperActionType.Dic2Trip && this.dic2tripVisible;
  }

  onShowHideMenu(name: string, popup?: any) {

    switch (name) {
      case 'trips':
        this.dic2tripVisible = !this.dic2tripVisible;
        this.localStorageService.setItem(`base-list-${name}`, this.dic2tripVisible ? '1' : '0');
        break;
      case 'tools':
        this.listToolsVisible = !this.listToolsVisible;
        this.localStorageService.setItem(`base-list-${name}`, this.listToolsVisible ? '1' : '0');
        break;
      case 'packs':
        this.thing2packVisible = !this.thing2packVisible;
        this.localStorageService.setItem(`base-list-${name}`, this.thing2packVisible ? '1' : '0');
        break;
      default:
        break;
    }

    if (popup) {
      popup.hide();
    }
  }

  get entitiesToDisplay(): any | null {
    const result: any = {};

    if (!this.processedEntities) {
      result.list = [];
      result.addedCount = 0;
      result.notAddedCount = 0;
      return result;
    }

    if (this.upperActionType !== UpperActionType.Thing2Pack && this.upperActionType !== UpperActionType.Dic2Trip) {
      result.list = this.processedEntities;
      result.addedCount = 0;
      result.notAddedCount = 0;
      return result;
    }

    if (this.upperActionType === UpperActionType.Dic2Trip) {
      if (!this.processedEntities || !this.tripEntities || this.tripEntities.length === 0) {
        result.list = this.processedEntities;
        result.addedCount = this.processedEntities?.filter(entity => (entity as any).inTripId).length || 0;
        result.notAddedCount = (this.processedEntities?.length || 0) - result.addedCount;
        return result;
      };

      const newItems = this.processedEntities!.map(entity => {

        const tripEntity = this.tripEntities!.find(x => this.equalsByName(entity as any, x as any));

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

    if (!this.selectedPack) {
      result.list = this.processedEntities;
      return result;
    }

    result.list = this.processedEntities.filter(entity => {
      return (entity as any).tripUserPackageId === this.selectedPack!.id || !(entity as any).tripUserPackageId;
    });
    return result;
  }


  equalsByName(
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
        'Both objects must contain "name" or "email" property'
      );
    }

    if (hasEmail) {
      return a.email!.localeCompare(b.email!, locale, {
        sensitivity: 'accent',
        usage: 'search',
      }) === 0;
    }

    return a.name!.localeCompare(b.name!, locale, {
      sensitivity: 'accent',
      usage: 'search',
    }) === 0;

  }

  checkSelectedTrip() {
    return this.appService.tripSelectedValue();
  }

  onSelectedTripChanged(trip: any | null) {
    if (!this.tripDicService) {
      return;
    }
    this.refreshTripEntities(trip?.id)
  }

  refreshTripEntities(id: string | null) {
    if (!this.tripDicService) {
      throw new Error('tripDicService is not set');
    }

    if (!id) {
      this.tripEntities = [];
      return;
    }

    this.tripDicService.getAll(id).subscribe(entities => {
      this.tripEntities = entities;
    });
  }


  restoreState() {
    const dic2tripState = this.localStorageService.getItem(`base-list-trips`);
    this.dic2tripVisible = dic2tripState === '1';
    const listToolsState = this.localStorageService.getItem(`base-list-tools`);
    this.listToolsVisible = listToolsState === '1';
  }


  getAll(id?: string | null) {
    this.service.getAll(this.tripId).subscribe(list => {
      this.entities = list;
      this.processedEntities = this.entities;
      this.selectEntity(id);
    });
    if (this.useTripId && this.tripId) {
      this.tripPackageService.getAll(this.tripId).subscribe(packages => {
        this.packages = packages;
      });
    }
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
      return;
    }


    this.addFromDic(data);

  }

  processPacking(tripUserPackageId: string, item: TripThingDto) {

    if (!item || !this.packingService) return;


    if (!item.tripUserPackageId) {
      this.pack([item.id], tripUserPackageId);
      return;
    }

    this.unpack([item.id], tripUserPackageId);
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

  onPackUnpack(data: any) {

    let tripUserPackageId: string;
    let item: any;

    if (data.alreadyChanged) {
      item = this.entities?.find((x: any) => x.id === data.item.id);

      if (!item.tripUserPackageId && !data.item.tripUserPackageId || item.tripUserPackageId === data.item.tripUserPackageId) {
        return;
      }

      if (data.item.tripUserPackageId && item.tripUserPackageId && item.tripUserPackageId !== data.item.tripUserPackageId) {
        item.tripUserPackageId = null;
      }

      tripUserPackageId = data.item.tripUserPackageId || item.tripUserPackageId;

    } else {
      if (!this.thing2packVisible || !this.packingService) {
        return;
      }
      const tripPackageDto: any = this.selectedPack;
      if (!tripPackageDto) {
        return;
      }
      tripUserPackageId = tripPackageDto!.id;
      item = data.item;
    }

    this.processPacking(tripUserPackageId, item);
  }

  onAddRemoveFromDic(item: any) {
    if (!this.dic2tripVisible || !this.tripDicService) {
      return;
    }
    const tripDto = this.checkSelectedTrip();
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
      this.service.delete((this.selected as any)["id"], this.tripId)
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

  pack(ids: string[], id: string) {
    if (!this.useTripId || !this.tripId || this.packages.length === 0) {
      return;
    }
    this.packingService!.pack({
      collectionId: this.tripId,
      ids: ids,
      id: id
    }).subscribe({
      next: () => {
        this.getAll(this.selected ? (this.selected as any).id : null);
      },
      error: (error) => {
        this.messagesService.showError(`Failed to initiate packing: ${error.message}`);
      }
    });

  }

  unpack(ids: string[], id: string) {
    if (!this.useTripId || !this.tripId || this.packages.length === 0) {
      return;
    }
    this.packingService!.unpack({
      collectionId: this.tripId,
      ids: ids,
      id: id
    }).subscribe({
      next: () => {
        this.getAll(this.selected ? (this.selected as any).id : null);
      },
      error: (error) => {
        this.messagesService.showError(`Failed to initiate unpacking: ${error.message}`);
      }
    });

  }

  get addFromDicDisabled(): boolean {
    if (!this.entitiesToDisplay) {
      return true;
    }
    return this.entitiesToDisplay.notAddedCount === 0 || !this.appService.tripSelectedValue();

  }

  get addAllText(): string {
    if (this.addFromDicDisabled) {
      return 'Nothing to add to trip';
    }
    return `Add ${this.entitiesToDisplay.notAddedCount} to trip`;
  }


  get removeFromDicDisabled(): boolean {
    if (!this.entitiesToDisplay) {
      return true;
    }
    return this.entitiesToDisplay.addedCount === 0 || !this.appService.tripSelectedValue();
  }

  get removeAllText(): string {
    if (this.removeFromDicDisabled) {
      return 'Nothing to remove from trip';
    }
    return `Remove ${this.entitiesToDisplay.addedCount} from trip`;
  }

  getFromDicIds(added: boolean): string[] {
    if (!this.entitiesToDisplay || !this.entitiesToDisplay.list || this.entitiesToDisplay.list.length === 0) {
      return [];
    }
    return this.entitiesToDisplay.list
      .filter(item => added ? item.inTripId : !item.inTripId)
      .map(item => item.id);
  }

  onAddFromDicAllClick() {
    const ids: string[] = this.getFromDicIds(false);
    if (ids.length === 0 || !this.checkSelectedTrip()?.id || !this.addFromDic) {
      return;
    }
    this.addFromDic({ collectionId: this.checkSelectedTrip()!.id, ids });
  }

  onRemoveFromDicAllClick() {
    const ids: string[] = this.getFromDicIds(true);
    if (ids.length === 0 || !this.checkSelectedTrip()?.id || !this.deleteFromDic) {
      return;
    }
    this.deleteFromDic({ collectionId: this.checkSelectedTrip()!.id, ids });
  }

  onListFeaturesShow() {
  }

  onListFeaturesHide() {
  }

  showAddAllToTrip(): boolean {
    return this.upperActionType === UpperActionType.Dic2Trip &&
      this.appService.getTripTextVisible();
  }

}