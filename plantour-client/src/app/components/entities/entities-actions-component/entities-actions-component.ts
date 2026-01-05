import { Component, inject, input, model, OnInit } from '@angular/core';
import { EntitiesService } from '../../../services/entities-service';
import { Condition, DynamicQueryService, FilterCondition, SortCondition, SortDirection, SortType } from '../../../services/dynamic-query-service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

type ModeType = 'lookup' | 'filter' | 'sort';

interface ModeOption {
  type: ModeType;
  label: string;
  icon: string;
  property?: string;
  condition: FilterCondition | SortCondition;
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

})
export class EntitiesActionsComponent implements OnInit {
  entitiesService = inject(EntitiesService);
  conditions: Condition[] = [];

  visible = toSignal(this.entitiesService.entitiesActionsVisible$, { initialValue: false });

  dynamicQueryService = inject(DynamicQueryService);
  lookups: any[] | null = null;

  modeOptions: ModeOption[] = [];
  selectedMode = model<ModeOption | null>(null);

  onOptionChange($event)  {
    this.selectedMode.set($event.value);

    this.modeOptions.forEach(option => {
      option.condition.isSelected =
        $event.value.condition === option.condition;
    });


    this.updateConditions();
  }

  ngOnInit(): void {

    combineLatest([
      this.entitiesService.entities$,
      this.entitiesService.conditions$
    ])
      .subscribe(([entities, conditions]) => {
        this.conditions = conditions || [];
        this.setLookups(entities);
        this.modeOptions = this.buildModeOptions();
      });
  }

  private setLookups(entities: any[] | null): void {
    if (!entities || entities.length === 0 || !this.conditions.length) {
      this.lookups = null;
      return;
    }
    const lookups: any = {};

    this.conditions.forEach(condition => {
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
    this.entitiesService.updateConditions(this.conditions);
    this.entitiesService.saveValue('conditions', this.conditions);
  }

  private buildModeOptions(): ModeOption[] {

    if (!this.conditions.length) {
      return [];
    }

    const options: ModeOption[] = [];

    this.conditions
      .filter(x => x.kind === 'filter' && x.comparisonType === 'exact')
      .sort((a, b) => (a as FilterCondition).label!.localeCompare((b as FilterCondition).label!))
      .forEach(c => {
        options.push({
          type: 'lookup',
          label: (c as FilterCondition).label!,
          property: c.property,
          icon: `pi pi-${(c as FilterCondition).icon}`,
          condition: c
        });
      });


    const filterCondition = this.conditions.find(x => x.kind === 'filter' && x.comparisonType === 'contains');
    if (filterCondition) {
      options.push({
        type: 'filter',
        label: 'Filter',
        icon: 'pi pi-filter',
        condition: filterCondition
      });
    }


    const sortCondition = this.conditions.find(x => x.kind === 'sort');
    if (sortCondition) {
      options.push({
        type: 'sort',
        label: 'Sort',
        icon: 'pi pi-sort-alt',
        condition: sortCondition
      });
    }

    if (!this.selectedMode() && options.length) {
      const option = options.find(o => o.condition.isSelected) || options[0];
      this.selectedMode.set(option);
    }

    return options;
  }

  getLookupOptions(property: string) {
    const list = this.lookups?.[property];
    if (!list) {
      return [];
    }
    return list.map(v => ({ label: v, value: v }));
  }

  getLookupValue(property: string) {

    if (!this.conditions.length) {
      return null;
    }

    const condition = this.conditions.find(c =>
      c.kind === 'filter' &&
      c.property === property &&
      c.comparisonType === 'exact'
    ) as FilterCondition | undefined;
    return condition ? condition.filterText : null;
  }

  getFilterValue() {
    if (!this.conditions.length) {
      return null;
    }
    const condition = this.conditions.find(c =>
      c.kind === 'filter' &&
      c.comparisonType === 'contains'
    ) as FilterCondition | undefined;
    return condition ? condition.filterText : null;
  }

  onLookupChange(property: string, value: string | null): void {
    if (!this.conditions.length) {
      return;
    }
    const condition = this.conditions
      .find(x => x.kind === 'filter' &&
        x.comparisonType === 'exact' &&
        x.property === property) as FilterCondition;

    condition.filterText = value!;

    this.updateConditions();
  }

  onFilterChange($event: Event): void {
    if (!this.conditions.length) {
      return;
    }
    const condition = this.conditions
      .find(x => x.kind === 'filter' &&
        x.comparisonType === 'contains') as FilterCondition;

    condition.filterText = ($event.target as HTMLInputElement).value;

    this.updateConditions();
  }

  sortType(): SortDirection | null {
    if (!this.conditions.length) {
      return null;
    }
    const condition = this.conditions
      .find(x => x.kind === 'sort') as SortCondition | undefined;
    return condition ? condition.direction : null;
  }

  onSortChange(sortType: SortDirection): void {
    if (!this.conditions.length) {
      return;
    }
    const condition = this.conditions
      .find(x => x.kind === 'sort') as SortCondition;
    condition.direction = sortType;

    this.updateConditions();
  }
}
