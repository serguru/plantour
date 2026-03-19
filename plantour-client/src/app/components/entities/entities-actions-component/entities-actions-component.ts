import { Component, computed, DestroyRef, inject, input, model, OnInit } from '@angular/core';
import { EntitiesCounts, ComponentService } from '../../../services/component-service';
import { Condition, DynamicQueryService, FilterCondition, SortCondition, SortDirection, Target, TargetCondition, TargetMode } from '../../../services/dynamic-query-service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { ButtonModule } from 'primeng/button';

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

  componentService = inject(ComponentService);

  targetCondition = toSignal(this.componentService.targetCondition$, { initialValue: null });
  target = toSignal(this.componentService.target$, { initialValue: null });
  selectedCondition = toSignal(this.componentService.selectedCondition$, { initialValue: null });

  onAddTargetClick = input<Function>();
  onDeleteTargetClick = input<Function>();
  private destroyRef = inject(DestroyRef);
  visible = toSignal(this.componentService.entitiesActionsVisible$, { initialValue: false });
  dynamicQueryService = inject(DynamicQueryService);

  conditions: Condition[] = [];
  lookups: any[] | null = null;

  ngOnInit(): void {
    combineLatest([
      this.componentService.lookups$,
      this.componentService.conditions$
    ]).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([lookups, conditions]) => {
      this.conditions = conditions ? [...conditions] : [];
      this.lookups = lookups;
    });
  }

  showRadios = computed(() => {
    const target = this.target();
    return target?.options?.length! > 0;
  });


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

  counts = toSignal(this.componentService.entitiesCounts$, {
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
    return this.counts().processedNotTargeted === 0 || !this.target();
  });

  deleteTargetDisabled = computed(() => {
    return this.counts().processedTargeted === 0 || !this.target();
  });

  updateConditions(): void {
    this.componentService.updateConditions(this.conditions);
    this.componentService.persistValue('conditions', this.conditions);
  }

  setSelectedCondition(condition: Condition): void {
    this.conditions.forEach(c => {
      c.isSelected = c === condition;
    });
    this.updateConditions();
  }

  resetConditions() {
    this.dynamicQueryService.resetConditions(this.conditions);
    this.updateConditions();
  }

  // Get lookup options for the selected condition 
  getLookupOptions() {
    if (!this.lookups || !this.conditions.length) {
      return [];
    }

    if (this.targetCondition()) {
      return this.lookups['target'];
    }

    const condition = this.selectedCondition();
    if (!condition || condition.kind !== 'filter' || condition.comparisonType !== 'exact') {
      return [];
    }

    const list = this.lookups[condition.property];
    if (!list) {
      return [];
    }
    return list;
  }

  getLookupValue() {

    if (this.targetCondition()) {
      const v = this.targetCondition();
      return v ? v.target : null;
    }


    const condition = this.selectedCondition();
    const property = condition && condition.kind === 'filter' && condition.comparisonType === 'exact'
      ? (condition as FilterCondition).property
      : null;

    if (!this.conditions.length || !property) {
      return null;
    }

    return condition ? (condition as FilterCondition).filterText : null;
  }

  conditionIsTarget(condition: Condition): boolean {
    return condition.kind === 'target';
  }

  onLookupValueChange(value: any | null): void {

    if (this.targetCondition()) {
      const v = this.targetCondition();
      if (!v) {
        return;
      }
      v.target = value as Target;
    } else {

      const condition = this.selectedCondition();
      const property = condition && condition.kind === 'filter' && condition.comparisonType === 'exact'
        ? (condition as FilterCondition).property
        : null;

      if (!this.conditions.length || !property) {
        return;
      }
      (condition as FilterCondition).filterText = value as string || '';
    }

    this.updateConditions();
  }

  getFilterValue() {
    const condition = this.selectedCondition();
    const property = condition && condition.kind === 'filter' && condition.comparisonType === 'contains'
      ? (condition as FilterCondition).property
      : null;

    if (!this.conditions.length || !property) {
      return null;
    }
    return condition ? (condition as FilterCondition).filterText : '';
  }


  onFilterChange($event: Event): void {
    const condition = this.selectedCondition();
    const property = condition && condition.kind === 'filter' && condition.comparisonType === 'contains'
      ? (condition as FilterCondition).property
      : null;

    if (!this.conditions.length || !property) {
      return;
    }

    (condition as FilterCondition).filterText = ($event.target as HTMLInputElement).value || '';

    this.updateConditions();
  }

  sortType(): SortDirection | null {
    const condition = this.selectedCondition();
    const property = condition && condition.kind === 'sort'
      ? (condition as SortCondition).property
      : null;

    if (!this.conditions.length || !property) {
      return null;
    }
    return condition ? (condition as SortCondition).direction : null;
  }

  onSortChange(sortType: SortDirection): void {
    const condition = this.selectedCondition();
    const property = condition && condition.kind === 'sort'
      ? (condition as SortCondition).property
      : null;

    if (!this.conditions.length || !property) {
      return;
    }

    (condition as SortCondition).direction = sortType;

    this.updateConditions();
  }

  conditionHasValue(condition: Condition): boolean {
    if (condition.kind === 'sort') {
      return condition.direction !== 'none';
    }
    if (condition.kind === 'filter') {
      return !!(condition as FilterCondition).filterText;
    }
    if (condition.kind === 'target') {
      return !!(condition as TargetCondition).target;
    }
    throw new Error('Unknown condition kind');

  }

  selectedConditionToOptionType = computed(() => {

    const condition = this.selectedCondition();

    if (!condition) {
      return null;
    }
    if (condition && condition.kind === 'sort') {
      return 'sort';
    }
    if (condition && condition.kind === 'filter' && condition.comparisonType === 'contains') {
      return 'filter';
    }
    if (condition && condition.kind === 'filter' && condition.comparisonType === 'exact') {
      return 'lookup';
    }
    if (condition.kind === 'target') {
      return 'target';
    }
    return null;
  });

  onTargetOptionClick(mode: TargetMode): void {
    const target = this.target();
    if (!target) {
      return;
    }
    target.selectedMode = mode;
    this.updateConditions();
  }
  
}