import { Component, inject, input, Input, OnInit } from '@angular/core';
import { EntitiesService } from '../../../services/entities-service';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { Condition, DynamicQueryService, FilterCondition } from '../../../services/dynamic-query-service';
import deepEqual from 'fast-deep-equal';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    CommonModule
  ],
  templateUrl: './entities-actions-component.html',
  styleUrl: './entities-actions-component.scss',
})
export class EntitiesActionsComponent implements OnInit {

  conditions = input<Condition[]>([]);
  entitiesService = inject(EntitiesService);
  dynamicQueryService = inject(DynamicQueryService);
  lookups: any[] | null = null;

  modeOptions: ModeOption[] = [];
  selectedMode: ModeOption | null = null;

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

    // 1. lookups first
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

    // 2. filter icon (if at least one filterable property)
    if (this.conditions().find(x => x.kind === 'filter' && x.comparisonType === 'contains')) {
      options.push({
        type: 'filter',
        label: 'Filter',
        icon: 'pi pi-filter'
      });
    }

    // 3. sort icon (if at least one sortable property)
    if (this.conditions().find(x => x.kind === 'sort')) {
      options.push({
        type: 'sort',
        label: 'Sort',
        icon: 'pi pi-sort-alt'
      });
    }

    this.modeOptions = options;
    if (!this.selectedMode && this.modeOptions.length) {
      this.selectedMode = this.modeOptions[0];
    }
  }

  isOptionModeActive(option: ModeOption): boolean {
    return false;
  }
}
