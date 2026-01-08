import { Component, computed, DestroyRef, inject, input, model, OnInit } from '@angular/core';
import { EntitiesCounts, EntitiesService } from '../../../services/entities-service';
import { Condition, DynamicQueryService, FilterCondition, SortCondition, SortDirection, SortType } from '../../../services/dynamic-query-service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { ButtonModule } from 'primeng/button';

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
    RadioButton,
    ButtonModule
  ],
  templateUrl: './entities-actions-component.html',
  styleUrl: './entities-actions-component.scss',

})
export class EntitiesActionsComponent implements OnInit {

  entitiesService = inject(EntitiesService);

  targetCondition = toSignal(this.entitiesService.targetCondition$, { initialValue: null });

  onAddTargetClick = input<Function>();
  onDeleteTargetClick = input<Function>();

  thingsToSharedAllowed = toSignal(this.entitiesService.thingsToSharedAllowed$, { initialValue: false });

  thingsToSharedMode = toSignal(this.entitiesService.thingsToSharedMode$, { initialValue: false });

  private destroyRef = inject(DestroyRef);

  showThingsToShared = computed(() => {
    const x = this.thingsToSharedAllowed();
    const y = this.isSelectedModeTarget();
    return  x && y;
  });

  onThingsToSharedModeChange(value: boolean): void {
    this.entitiesService.updateThingsToSharedMode(value);
  }

  onAddClick(event: Event): void {
    event.preventDefault();
    if (!this.onAddTargetClick()) {
      throw new Error('onAddTargetClick is not provided');
    }

    this.onAddTargetClick()!();
  }

  onDeleteClick(event: Event): void {
    event.preventDefault();
    if (!this.onDeleteTargetClick()) {
      throw new Error('onDeleteTargetClick is not provided');
    }

    this.onDeleteTargetClick()!();
  }

  counts = toSignal(this.entitiesService.entitiesCounts$, {
    initialValue: {
      allTotal: 0,
      allTargeted: 0,
      allNotTargeted: 0,
      processedTotal: 0,
      processedTargeted: 0,
      processedNotTargeted: 0,
    } as EntitiesCounts
  });

  addTargetDisabled = computed(() => {
    return this.counts().processedNotTargeted === 0 || !this.targetCondition();
  });

  deleteTargetDisabled = computed(() => {
    return this.counts().processedTargeted === 0 || !this.targetCondition();
  });


  conditions: Condition[] = [];

  visible = toSignal(this.entitiesService.entitiesActionsVisible$, { initialValue: false });

  dynamicQueryService = inject(DynamicQueryService);
  lookups: any[] | null = null;

  modeOptions: ModeOption[] = [];
  selectedMode = model<ModeOption | null>(null);


  isSelectedModeTarget = computed(() => {
    const selectedMode = this.selectedMode();
    return selectedMode ? selectedMode.property === 'target' : false;
  });

  isOptionTarget(option: ModeOption): boolean {
    return option.property === 'target';
  }

  onOptionChange($event) {
    this.selectedMode.set($event.value);

    this.modeOptions.forEach(option => {
      option.condition.isSelected =
        $event.value.condition === option.condition;
    });


    this.updateConditions();
  }

  ngOnInit(): void {

    combineLatest([
      this.entitiesService.lookups$,
      this.entitiesService.conditions$
    ]).pipe(      
      takeUntilDestroyed(this.destroyRef)
      ).subscribe(([lookups, conditions]) => {
        this.conditions = conditions || [];
        this.lookups = lookups;
        this.modeOptions = this.buildModeOptions();
      });
  }

  resetConditions() {
    this.dynamicQueryService.resetConditions(this.conditions);
    this.updateConditions();
  }

  updateConditions(): void {
    this.entitiesService.updateConditions(this.conditions);
    this.entitiesService.persistValue('conditions', this.conditions);
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
          icon: `pi pi-${(c as FilterCondition).icon || 'tag'}`,
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
    return list;
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

  isActiveOption(option: ModeOption): boolean {
    if (option.condition.kind === 'sort') {
      return option.condition.direction !== 'none';
    }
    return !!option.condition.filterText;
  }

}
function compute(arg0: () => boolean, arg1: any, arg2: { this: any; }, arg3: any, arg4: undefined) {
  throw new Error('Function not implemented.');
}

