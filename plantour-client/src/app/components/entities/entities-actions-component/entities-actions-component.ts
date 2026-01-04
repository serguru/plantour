import { Component, inject, input, Input, model, OnInit } from '@angular/core';
import { EntitiesService } from '../../../services/entities-service';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { Condition, DynamicQueryService, FilterCondition, SortCondition, SortDirection, SortType } from '../../../services/dynamic-query-service';
import deepEqual from 'fast-deep-equal';
import { Select, SelectChangeEvent } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { toSignal } from '@angular/core/rxjs-interop';

type ModeType = 'lookup' | 'filter' | 'sort';

interface ModeOption {
  type: ModeType;
  label: string;
  icon: string;
  property?: string;
}

@Component({
  selector: 'app-entities-actions',
  imports: [
    Select,
    FormsModule,
    CommonModule,
    InputTextModule,
    RadioButton
  ],
  templateUrl: './entities-actions-component.html',
  styleUrl: './entities-actions-component.scss',

// animations: [
//     trigger('slideInOut', [
//       state('closed', style({
//         transform: 'translateY(-100%)',
//         opacity: 0
//       })),
//       state('open', style({
//         transform: 'translateY(0)',
//         opacity: 1
//       })),
//       transition('closed <=> open', [
//         animate('300ms ease-in-out')
//       ])
//     ])


})
export class EntitiesActionsComponent implements OnInit {
  conditions = input<Condition[]>([]);
  entitiesService = inject(EntitiesService);

  visible = toSignal(this.entitiesService.entitiesActionsVisible$, { initialValue: false });

  dynamicQueryService = inject(DynamicQueryService);
  lookups: any[] | null = null;

  modeOptions: ModeOption[] = [];
  selectedMode = model<ModeOption | null>(null);

  ngOnInit(): void {
    this.entitiesService.entities$.subscribe(entities => {
      this.setLookups(entities);
    });
    this.buildModeOptions();
    this.updateConditions();
  }

  private setLookups(entities: any[] | null): void {
    if (!entities) {
      this.lookups = null;
      return;
    }
    const lookups: any = {};
    this.conditions().forEach(condition => {
      if (condition.kind === 'filter' && condition.comparisonType === 'exact') {
        lookups[condition.property] =
          Array.from(new Set(entities.map(e => e[condition.property])))
            .filter(v => v != null)
            .sort((a, b) => a.toString().localeCompare(b.toString()))
      }
    });
    this.lookups = lookups;
  }

  updateConditions(): void {
    this.dynamicQueryService.setConditions(this.conditions());
  }

  private buildModeOptions(): void {

    const options: ModeOption[] = [];

    this.conditions()
      .filter(x => x.kind === 'filter' && x.comparisonType === 'exact')
      .sort((a, b) => (a as FilterCondition).label!.localeCompare((b as FilterCondition).label!))
      .forEach(c => {
        options.push({
          type: 'lookup',
          label: (c as FilterCondition).label!,
          property: c.property,
          icon: `pi pi-${(c as FilterCondition).icon}`
        });
      });

    if (this.conditions().find(x => x.kind === 'filter' && x.comparisonType === 'contains')) {
      options.push({
        type: 'filter',
        label: 'Filter',
        icon: 'pi pi-filter'
      });
    }

    if (this.conditions().find(x => x.kind === 'sort')) {
      options.push({
        type: 'sort',
        label: 'Sort',
        icon: 'pi pi-sort-alt'
      });
    }

    this.modeOptions = options;

    if (!this.selectedMode() && this.modeOptions.length) {
      this.selectedMode.set(this.modeOptions[0]);
    }
  }

  isOptionModeActive(option: ModeOption): boolean {
    return false;
  }

  getLookupOptions(property: string) {
    const list = this.lookups?.[property];
    if (!list) {
      return [];
    }
    return list.map(v => ({ label: v, value: v }));
  }

  getLookupValue(property: string) {
    const condition = this.conditions().find(c =>
      c.kind === 'filter' &&
      c.property === property &&
      c.comparisonType === 'exact'
    ) as FilterCondition | undefined;
    return condition ? condition.filterText : null;
  }

  getFilterValue(property: string) {
    const condition = this.conditions().find(c =>
      c.kind === 'filter' &&
      c.property === property &&
      c.comparisonType === 'contains'
    ) as FilterCondition | undefined;
    return condition ? condition.filterText : null;
  }

  onLookupChange(property: string, value: string | null): void {
    const condition = this.conditions()
      .find(x => x.kind === 'filter' && 
        x.comparisonType === 'exact' &&
        x.property === property) as FilterCondition;

    condition.filterText = value!;        

    this.updateConditions();
  }

  onFilterChange($event: Event): void {
    const condition = this.conditions()
      .find(x => x.kind === 'filter' && 
        x.comparisonType === 'contains') as FilterCondition;

    condition.filterText = ($event.target as HTMLInputElement).value;        

    this.updateConditions();
  }

  sortType() : SortDirection | null {
    const condition = this.conditions()
      .find(x => x.kind === 'sort') as SortCondition | undefined;
    return condition ? condition.direction : null;
  }

  onSortChange(sortType: SortDirection): void {
    const condition = this.conditions()
      .find(x => x.kind === 'sort') as SortCondition; 
    condition.direction = sortType;       
    
    this.updateConditions();
  }
}

function trigger(arg0: string, arg1: any[]): any {
  throw new Error('Function not implemented.');
}
function state(arg0: string, arg1: any): any {
  throw new Error('Function not implemented.');
}

