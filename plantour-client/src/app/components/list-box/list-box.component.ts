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
    inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Button } from 'primeng/button';


@Component({
    selector: 'app-list-box',
    standalone: true,
    imports: [CommonModule, Button],
    templateUrl: './list-box.component.html',
    styleUrls: ['./list-box.component.scss']
})
export class ListBoxComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    @Input() items: any[] = [];
    @Input() itemTemplate!: TemplateRef<any>;
    @Input() dic2tripVisible: boolean = false;
    @Output() selectedChange = new EventEmitter<any | null>();
    @Output() addRemoveFromDic = new EventEmitter<any | null>();

    @ViewChildren('listItem') listItemElements!: QueryList<ElementRef>;

    trackByFn(index: number, item: any): any {
        return item.id ?? index;
    }
    selectedItem: any | null = null;
    private destroy$ = new Subject<void>();
    private shouldScrollToSelected = false;
    private selectedIdFromUrl: string | number | null = null;
    private router = inject(Router);

    constructor(private route: ActivatedRoute) { }


    removeQueryParameter(paramName: string): void {
        this.router.navigate([], {
            relativeTo: this.route,

            queryParams: {
                [paramName]: null,
            },

            queryParamsHandling: 'merge',
        });
    }

    private setSelectedFromUrl() {
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                const selectedId = params['selectId'];
                if (selectedId) {
                    this.selectedIdFromUrl = selectedId;
                    this.selectItemById(selectedId);
                }
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['items']) {
            this.setSelectedFromUrl();
        }
    }

    ngOnInit(): void {
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


        this.removeQueryParameter('selectId');

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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}