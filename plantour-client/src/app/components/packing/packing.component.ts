import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { MessagePanelComponent } from '../message-panel/message-panel-component/message-panel-component';
import { Button } from 'primeng/button';
import { TripPackageDto } from '../../services/trip-package-service';
import { TripThingDto } from '../../services/trip-thing-service';
import { AppService } from '../../services/app-service';

@Component({
    selector: 'app-packing',
    standalone: true,
    imports: [CommonModule, FormsModule, Select, MessagePanelComponent, Button],
    templateUrl: './packing.component.html',
    styleUrls: ['./packing.component.scss'],
})
export class PackingComponent implements OnInit {

    appService = inject(AppService);

    loading = false;

    get selectedTripPackage(): TripPackageDto | null {
        return this.appService.packSelectedValue();
    }

    set selectedTripPackage(value: TripPackageDto | null) {
        this.appService.updatePackSelected(value);
    }

    @Input() packages: TripPackageDto[] = [];
    @Input() things: TripThingDto[] = [];
    @Input() pack!: ((ids: string[], id: string) => void);
    @Input() unpack!: ((ids: string[], id: string) => void);


    ngOnInit() {
    }

    get addDisabled(): boolean {
        if (!this.things || !this.selectedTripPackage) {
            return true;
        }

        return this.things.filter(t => !t.tripUserPackageId).length === 0;
    }

    get removeDisabled(): boolean {
        if (!this.things || !this.selectedTripPackage) {
            return true;
        }
        return this.things.filter(t => t.tripUserPackageId === this.selectedTripPackage!.id).length === 0;
    }

    getIds(added: boolean): string[] {
        if (!this.things || this.things.length === 0 || !this.selectedTripPackage) {
            return [];
        }
        return this.things
            .filter(t => added ? t.tripUserPackageId && t.tripUserPackageId === this.selectedTripPackage!.id : !t.tripUserPackageId)
            .map(t => t.id);
    }

    onAddAllClick() {
        const ids: string[] = this.getIds(false);
        if (ids.length === 0) {
            return;
        }
        this.pack(ids, this.selectedTripPackage!.id);
    }

    onRemoveAllClick() {
        const ids: string[] = this.getIds(true);
        if (ids.length === 0) {
            return;
        }
        this.unpack(ids, this.selectedTripPackage!.id);
    }
}