import { Injectable } from '@angular/core';

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
  isSelected?: boolean;
};
export type SortCondition = {
  kind: 'sort';
  property: string;
  sortType: SortType;
  direction: SortDirection;
  isSelected?: boolean;
};

// TODO: add bool
// TODO: add isTarget
export type Condition = FilterCondition | SortCondition;

@Injectable({
  providedIn: 'root'
})
export class DynamicQueryService {

  public applyConditions(
    rawEntities: any[] | null,
    conditions: Condition[] | null
  ): any[] {

    if (!rawEntities || rawEntities.length === 0) {
      return [];
    }

    if (!conditions || conditions.length === 0) {
      return [...rawEntities];
    }

    let filtered = [...rawEntities];

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

  private matchesFilter(
    item: any,
    filter: FilterCondition
  ): boolean {
    if (filter.property == 'target') {
      return true;
    }
        
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

  initConditions(saved: any, conditions: Condition[]): Condition[] {
    if (!saved || !Array.isArray(saved) || saved.length === 0 || !conditions || conditions.length === 0) {
      return conditions;
    }

    conditions.forEach(cond => {
      const savedCond = saved.find((sc: any) =>
        sc.kind === cond.kind &&
        sc.property === cond.property
      );
      if (savedCond) {
        cond.isSelected = savedCond.isSelected || false;
        if (cond.kind === 'filter') {
          (cond as FilterCondition).filterText = savedCond.filterText || '';
        } else if (cond.kind === 'sort') {
          (cond as SortCondition).direction = savedCond.direction || 'none';
        }
      }
    });
    return conditions;
  }

  anyConditionSet(conditions: Condition[] | null): boolean {
    if (!conditions || conditions.length === 0) {
      return false;
    }
    return conditions.some(c => {
      if (c.kind === 'filter') {
        return !!(c as FilterCondition).filterText;
      } else if (c.kind === 'sort') {
        return (c as SortCondition).direction !== 'none';
      }
      return false;
    });
  }


  resetConditions(conditions: Condition[]): void {
    conditions.forEach(cond => {
      cond.isSelected = false;
      if (cond.kind === 'filter') {
        (cond as FilterCondition).filterText = '';
      } else if (cond.kind === 'sort') {
        (cond as SortCondition).direction = 'none';
      }
    });
  }

  public getLookupsFromEntities(entities: any[], conditions: Condition[]) {
    const result: any = {};

    conditions.filter(x => x.property !== 'target')
      .forEach(condition => {
        if (condition.kind === 'filter' && condition.comparisonType === 'exact') {
          const values = Array.from(new Set(entities.map(e => e[condition.property])))
            .filter(v => v != null)
            .sort((a, b) => a.toString().localeCompare(b.toString()))
            .map(x => ({id: x.toString(), name: x.toString()}));
          result[condition.property] = values;
      }
      });
    return result;
  }



}
