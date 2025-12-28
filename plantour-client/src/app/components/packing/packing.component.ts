import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { MessagePanelComponent } from '../message-panel/message-panel-component/message-panel-component';
import { Button } from 'primeng/button';
import { TripPackageDto } from '../../services/trip-package-service';
import { TripThingDto } from '../../services/trip-thing-service';

@Component({
    selector: 'app-packing',
    standalone: true,
    imports: [CommonModule, FormsModule, Select, MessagePanelComponent, Button],
    templateUrl: './packing.component.html',
    styleUrls: ['./packing.component.scss'],
})
export class PackingComponent implements OnInit, OnDestroy {
    loading = false;

    selectedTripPackageId = signal<string | null>(null);
    selectedTripPackage = computed<TripPackageDto | null>(() => {
        const id = this.selectedTripPackageId();
        return id ? this.packages.find(t => t.id === id) ?? null : null;
    });
    @Input() packages: TripPackageDto[] = [];
    @Input() things: TripThingDto[] = [];
    @Input() pack!: ((ids: string[], id: string) => void);
    @Input() unpack!: ((ids: string[], id: string) => void);

    @Output() selectedTripPackageChanged = new EventEmitter<TripPackageDto | null>();
    @Output() registerGetter: EventEmitter<(() => TripPackageDto | null) | null> = new EventEmitter<(() => TripPackageDto | null) | null>();

    getCurrentTripPackage = (): TripPackageDto | null => {
        const result = this.selectedTripPackage();
        return result;
    };

    get addDisabled(): boolean {
        if (!this.things) {
            return true;
        }
        return this.things.filter(t => !t.tripUserPackageId).length === 0;
    }

    get removeDisabled(): boolean {
        if (!this.things) {
            return true;
        }
        return this.things.filter(t => t.tripUserPackageId === this.selectedTripPackageId()).length === 0;
    }

    ngOnDestroy(): void {
        this.registerGetter.emit(null);
    }

    ngOnInit() {
        this.registerGetter.emit(this.getCurrentTripPackage);

        if (this.packages.length === 0) {
            this.selectedTripPackageId.set(null);
            this.selectedTripPackageChanged.emit(null);
            return;
        }
        this.selectedTripPackageId.set(this.packages[0].id);
        this.selectedTripPackageChanged.emit(this.selectedTripPackage());


        //  this.loading = true;

        // this.tripPackageService.getAll(this.tripId)
        //     .pipe(
        //         catchError(error => {
        //             this.packages = [];
        //             this.selectedTripPackageId.set(null);
        //             this.selectedTripPackageChanged.emit(null);
        //             throw error;
        //         }),
        //         finalize(() => {
        //             this.loading = false;
        //         })
        //     )
        //     .subscribe(packages => {
        //         this.packages = packages;
        //         if (this.packages.length === 0) {
        //             this.selectedTripPackageId.set(null);
        //             this.selectedTripPackageChanged.emit(null);
        //             return;
        //         }
        //         this.selectedTripPackageId.set(this.packages[0].id);
        //         this.selectedTripPackageChanged.emit(this.selectedTripPackage());
        //     });
    }

    onSelectedTripPackageChange(id: string | null) {
        this.selectedTripPackageId.set(id);
        this.selectedTripPackageChanged.emit(this.selectedTripPackage());
    }

    getIds(added: boolean): string[] {
        if (!this.things || this.things.length === 0) {
            return [];
        }
        return this.things
            .filter(t => added ? t.tripUserPackageId && t.tripUserPackageId === this.selectedTripPackageId() : !t.tripUserPackageId)
            .map(t => t.id);
    }

    onAddAllClick() {
        const ids: string[] = this.getIds(false);
        if (ids.length === 0) {
            return;
        }
        this.pack(ids, this.selectedTripPackageId()!);
    }

    onRemoveAllClick() {
        const ids: string[] = this.getIds(true);
        if (ids.length === 0) {
            return;
        }
        this.unpack(ids, this.selectedTripPackageId()!);
    }
}