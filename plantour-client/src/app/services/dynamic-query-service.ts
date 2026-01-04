import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, shareReplay } from 'rxjs';
import { EntitiesService } from './entities-service';

/* =======================
   Types
   ======================= */

export type FilterComparisonType = 'contains' | 'exact';
export type SortType = 'text' | 'number';
export type SortDirection = 'asc' | 'desc' | 'none';
export type FilterCondition = {
  kind: 'filter';
  property: string;
  label: string;
  icon?: string;
  filterText: string;
  comparisonType: FilterComparisonType;
};
export type SortCondition = {
  kind: 'sort';
  property: string;
  sortType: SortType;
  direction: SortDirection;
};

// in the collection allowed only one sort condition and only one filter condition 
export type Condition = FilterCondition | SortCondition;


/* =======================
   Service
   ======================= */
@Injectable({
  providedIn: 'root'
})
export class DynamicQueryService {

  entitiesService = inject(EntitiesService);

  public data$ = this.entitiesService.entities$;

  private conditions$ = new BehaviorSubject<Condition[]>([]);
  setConditions(conditions: Condition[]): void {
    // in the collection allowed only one sort condition and only one filter condition 

    if (conditions.length === 0) {
      this.conditions$.next([]);
      return;
    }

    const sortConditions = conditions.filter(c => c.kind === 'sort') as SortCondition[];  
    if (sortConditions.length > 1) {
      throw new Error('Only one sort condition is allowed');
    }
    const filterConditions = conditions.filter(c => c.kind === 'filter' && c.comparisonType === 'contains') as FilterCondition[];  
    if (filterConditions.length > 1) {
      throw new Error('Only one "contains" filter condition is allowed');
    } 

    this.conditions$.next(conditions);
  }

  processedEntities$: Observable<any[] | null> = combineLatest([
    this.data$,
    this.conditions$
  ]).pipe(
    debounceTime(300),
    map(([data, conditions]) => this.applyConditions(data, conditions)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() { 
    this.processedEntities$.subscribe(entities => {
      this.entitiesService.updateProcessedEntities(entities);
    });
  }

  /* =======================
     Core logic
     ======================= */

  public applyConditions(
    source: any[] | null,
    conditions: Condition[] | null
  ): any[] {

    if (!source || source.length === 0) {
      return [];
    }

    if (!conditions || conditions.length === 0) {
      return [...source];
    }

    let filtered = [...source];

    for (const c of conditions) {
      if (c.kind === 'filter' && c.filterText) {
        filtered = filtered.filter(item =>
          this.matchesFilter(item, c)
        );
      }
    }

    const sort = conditions.find(
      (c): c is SortCondition =>
        c.kind === 'sort' && c.direction !== 'none'
    );

    if (sort) {
      filtered.sort((a, b) => this.compare(a, b, sort));
    }

    const containsFilters = conditions.filter(
      (c): c is FilterCondition =>
        c.kind === 'filter' && c.comparisonType === 'contains'
    );

    return filtered.map(item =>
      this.applyHighlighting(item, containsFilters)
    );
  }

  /* =======================
     Helpers
     ======================= */

  private matchesFilter(
    item: any,
    filter: FilterCondition
  ): boolean {
    const value = item[filter.property];
    if (value == null) return false;

    const left = String(value).toLowerCase();
    const right = filter.filterText.toLowerCase();

    return filter.comparisonType === 'contains'
      ? left.includes(right)
      : left === right;
  }

  private applyHighlighting(
    item: any,
    filters: FilterCondition[]
  ): any {
    const result: any = { ...item };

    for (const filter of filters) {
      const value = item[filter.property];
      if (value == null) continue;

      const text = String(value);
      const search = filter.filterText;
      const index = text.toLowerCase()
        .indexOf(search.toLowerCase());

      if (index === -1) continue;

      const before = text.slice(0, index);
      const match = text.slice(index, index + search.length);
      const after = text.slice(index + search.length);

      (result as any)[filter.property] =
        `${before}<mark>${match}</mark>${after}`;
    }

    return result;
  }

  private compare(
    a: any,
    b: any,
    sort: SortCondition
  ): number {
    const av = a[sort.property];
    const bv = b[sort.property];

    if (av == null || bv == null) return 0;

    let result =
      sort.sortType === 'number'
        ? Number(av) - Number(bv)
        : String(av).localeCompare(String(bv));

    return sort.direction === 'desc' ? -result : result;
  }
}
