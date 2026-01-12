import {
    Component,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    AfterViewInit,
    QueryList,
    ViewChildren,
    ElementRef,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    inject,
    ViewChild,
    ViewContainerRef,
    Type
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Button } from 'primeng/button';
import { TripPackageDto } from '../../services/trip-package-service';
import { UpperActionType } from '../../helpers/enums';
import { AppService } from '../../services/app-service';

@Component({
    selector: 'app-list-box',
    standalone: true,
    imports: [CommonModule, Button],
    templateUrl: './list-box.component.html',
    styleUrls: ['./list-box.component.scss']
})
export class ListBoxComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    appService = inject(AppService);

    @Input() items: any[] = [];
    @Input() itemMetaData: any | null = null;

    @Input() itemComponent!: Type<any>;

    @Input() packages: TripPackageDto[] = [];
    @Input() upperActionType: UpperActionType = UpperActionType.None;

    @Input() componentId: string | null = null;

    @Output() selectedChange = new EventEmitter<any | null>();
    @Output() addRemoveFromDic = new EventEmitter<any | null>();
    @Output() packUnpack = new EventEmitter<any | null>();

    @ViewChildren('listItem') listItemElements!: QueryList<ElementRef>;

    @ViewChildren('dynamicContainer', { read: ViewContainerRef })
    containers!: QueryList<ViewContainerRef>;

    ngOnInit(): void {
    }

    trackByFn(index: number, item: any): any {
        return item.id ?? index;
    }
    selectedItem: any | null = null;
    private destroy$ = new Subject<void>();
    private shouldScrollToSelected = false;
    private router = inject(Router);

    constructor(private route: ActivatedRoute) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.selectedItem || !changes['items']) {
            return;
        }
        const savedId = false //this.appService.getFromLocalStorage(this.componentId);
        if (!savedId) {
            return;
        }
        this.selectItemById(savedId);
    }

    getInputs(item: any) {
        const inputs: any = { item: item };

        if (this.itemMetaData) {
            inputs.itemMetaData = this.itemMetaData;
        }
        return inputs;
    }

    ngAfterViewInit(): void {
        this.listItemElements.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.shouldScrollToSelected) {
                    setTimeout(() => {
                        this.scrollToSelectedItem();
                    }, 0);
                }
            });

        if (this.shouldScrollToSelected) {
            setTimeout(() => {
                this.scrollToSelectedItem();
            }, 0);
        }
    }

    selectItem(item: any): void {
        if (this.selectedItem == item) {
            this.selectedItem = null;
        } else {
            this.selectedItem = item;
        }
        this.selectedChange.emit(this.selectedItem);
    }

    isSelected(item: any): boolean {
        return this.selectedItem?.id === item.id;
    }

    private selectItemById(id: string | number): void {
        const item = this.items.find(i => String(i.id) === String(id));
        if (item) {
            this.selectedItem = item;
            this.shouldScrollToSelected = true;
            this.selectedChange.emit(item);
        }
    }

    private scrollToSelectedItem(): void {

        if (!this.selectedItem) {
            this.shouldScrollToSelected = false;
            return;
        }

        const index = this.items.findIndex(item => item.id === this.selectedItem!.id);
        if (index === -1) {
            this.shouldScrollToSelected = false;
            return;
        }

        const elementsArray = this.listItemElements.toArray();
        const element = elementsArray[index];

        if (element?.nativeElement) {
            element.nativeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            this.shouldScrollToSelected = false;
        }
    }

    icon(item: any) {
        return (
            this.upperActionType == UpperActionType.Dic2Trip && item.inTripId) ||
            (this.upperActionType == UpperActionType.Thing2Pack && item.tripUserPackageId) ||
            (this.upperActionType == UpperActionType.Thing2Participant && item.assignedByUserId)
            ?
            'pi pi-check' : 'pi pi-plus';
    }

    onIconClick(item: any, event: MouseEvent) {
        event.stopPropagation();
        if (this.upperActionType == UpperActionType.Dic2Trip) {
            this.addRemoveFromDic.emit(item);
            return;
        }
        if (this.upperActionType == UpperActionType.Thing2Pack) {
            this.packUnpack.emit(item);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    packageChange(item: any) {
        this.packUnpack.emit({ item, alreadyChanged: true });
    }

    showDic2TripRightSection(): boolean {
        return this.upperActionType == UpperActionType.Dic2Trip;
    }

    get showRightSection(): boolean {
        return this.upperActionType == UpperActionType.Thing2Pack ||
            this.upperActionType == UpperActionType.Thing2Participant ||

            this.showDic2TripRightSection();
    }

    get rightSectionDisabled(): boolean {
        return this.upperActionType == UpperActionType.Dic2Trip;
    }

}