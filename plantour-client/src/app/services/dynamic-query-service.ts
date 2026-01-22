import { Injectable } from '@angular/core';
import { isNumber } from '../helpers/utils';

export type FilterComparisonType = 'contains' | 'exact';
export type SortType = 'text' | 'number';
export type SortDirection = 'asc' | 'desc' | 'none';

export enum TargetMode {
  TripThings = 1,
  TripShared = 2,
  DicThings = 3,
  Packing = 4,
  Assigning = 5
}

export type TargetOption = {
  label: string;
  mode: TargetMode;
}

export type Target = {
  id: string | null; // tripId or packId or participantId ...
  name: string | null;
  selectedMode?: TargetMode | null;
  options?: TargetOption[] | null;
}

export type FilterCondition = {
  kind: 'filter';
  label: string;
  icon: string;
  isSelected?: boolean;

  property: string;
  filterText: string;
  comparisonType: FilterComparisonType;
};
export type SortCondition = {
  kind: 'sort';
  label: string;
  icon: string;
  isSelected?: boolean;

  property: string;
  sortType: SortType;
  direction: SortDirection;
};
export type TargetCondition = {
  kind: 'target';
  label: string;
  icon: string;
  isSelected?: boolean;

  target: Target | null;
};

export type Condition = FilterCondition | SortCondition | TargetCondition;

export function isTargetMode(targetMode: TargetMode): boolean {
  return isNumber(targetMode) &&  Object.values(TargetMode).includes(targetMode);
}

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

    const value = item[filter.property];
    if (value == null || value == undefined) return false;

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

      // TODO: why empty <mark> is inserted sometimes?
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

  initConditions(saved: any[], conditions: Condition[]): Condition[] {
    if (!saved || !Array.isArray(saved) || saved.length === 0 || !conditions || conditions.length === 0) {
      return conditions;
    }

    let alreadySelected = false;

    saved.forEach((sc: any) => {

      const isSelected = !alreadySelected && sc.isSelected;

      if (isSelected) {
        alreadySelected = true;
      }

      switch (sc.kind) {
        case 'filter': {

          let ft = '';
          if (sc.filterText && typeof sc.filterText === 'string') {
            ft = sc.filterText.trim();
          }

          if (sc.comparisonType == 'contains') {
            const cond: any = conditions.find(x => x.kind == 'filter' && x.comparisonType == "contains");
            if (!cond) {
              break;
            }
            cond.filterText = ft;
            cond.isSelected = isSelected;
            break;

          }

          if (sc.comparisonType == 'exact') {
            const cond: any = conditions.find(x => x.kind == 'filter' && x.comparisonType == "exact" && x.property == sc.property);
            if (!cond) {
              break;
            }
            cond.filterText = ft;
            cond.isSelected = isSelected;
            break;

          }

          break;
        }
        case 'target': {
          const cond = conditions.find(c => c.kind === 'target');
          if (!cond) {
            break;
          }
          cond.isSelected = isSelected;
          if (sc.target == null || typeof sc.target !== 'object') {
            cond.target = null;
            cond.isSelected = isSelected;
            break;
          }

          let options = sc.target.options; 
          if (!options || !Array.isArray(options) || options.find((x: any) => !isTargetMode(x.mode)))
          {
            options = null;
          }

          let selectedMode = sc.target.selectedMode;
          if (!isTargetMode(selectedMode) || (options && !options.find((x: any) => x.mode === sc.target.selectedMode))) {
            selectedMode = null;
          }

          cond.target = {
            id: sc.target.id && typeof sc.target.id === 'string' ? sc.target.id : null,
            name: sc.target.name && typeof sc.target.name === 'string' ? sc.target.name : null,
            selectedMode: selectedMode,
            options: options
          };
          cond.isSelected = isSelected;
          break;
        }
        case 'sort': {
          const cond = conditions.find(c => c.kind === 'sort');
          if (!cond) {
            break;
          }
          cond.direction = sc.direction && ["asc", "desc", "none"].includes(sc.direction) ? sc.direction : 'none';
          cond.isSelected = isSelected;
        }
      }
    });

    return conditions;
  }
  // initConditions(saved: any[], conditions: Condition[]): Condition[] {
  //   if (!saved || !Array.isArray(saved) || saved.length === 0 || !conditions || conditions.length === 0) {
  //     return conditions;
  //   }

  //   conditions.forEach((cond: any) => {

  //     let alreadySelected = false;

  //     const savedCond = saved.find((sc: any) =>
  //       sc.kind === cond.kind &&
  //       (
  //         ['target', 'sort'].includes(cond.kind) ||
  //         (cond.kind === 'filter' && cond.comparisonType === 'contains') ||
  //         (cond.kind === 'filter' && cond.comparisonType === 'exact' && sc.property == cond.property)
  //       )
  //     );

  //     if (!savedCond) {
  //       return;
  //     }


  //     cond.isSelected = savedCond.isSelected && !alreadySelected;

  //     if (cond.isSelected) {
  //       alreadySelected = true;
  //     }


  //     if (cond.kind === 'filter' && (cond.comparisonType === 'contains' || (cond.comparisonType === 'exact' && savedCond.property === cond.property))) {
  //       (cond as FilterCondition).filterText = savedCond.filterText && typeof savedCond.filterText === 'string' ? savedCond.filterText : '';
  //     } else if (cond.kind === 'sort') {
  //       (cond as SortCondition).direction = savedCond.direction && ["asc", "desc", "none"].includes(savedCond.direction) ? savedCond.direction : 'none';
  //     } else if (cond.kind === 'target') {

  //       if (savedCond.target && typeof savedCond.target === 'object') {
  //         cond.target = {
  //           id: savedCond.target.id && typeof savedCond.target.id === 'string' ? savedCond.target.id : null,
  //           name: savedCond.target.name && typeof savedCond.target.name === 'string' ? savedCond.target.name : null,
  //           selectedMode: savedCond.target.selectedMode && Object.values(TargetMode).includes(savedCond.target.selectedMode) ? savedCond.target.selectedMode : null,
  //           options: Array.isArray(savedCond.target.options) ? savedCond.target.options.map((opt: any) => ({
  //             label: opt.label && typeof opt.label === 'string' ? opt.label : '',
  //             mode: Object.values(TargetMode).includes(opt.mode) ? opt.mode : TargetMode.TripThings
  //           })) : null
  //         };
  //       } else {
  //         cond.target = null;
  //       }
  //     }

  //   });
  //   return conditions;
  // }

  anyConditionSet(conditions: Condition[] | null): boolean {
    if (!conditions || conditions.length === 0) {
      return false;
    }
    return conditions.some(c => {
      if (c.kind === 'filter') {
        return !!(c as FilterCondition).filterText;
      } else if (c.kind === 'sort') {
        return (c as SortCondition).direction !== 'none';
      } else if (c.kind === 'target') {
        return (c as TargetCondition).target !== null;
      }
      return false;
    });
  }


  resetConditions(conditions: Condition[]): void {
    conditions.forEach(cond => {
      //cond.isSelected = false;
      if (cond.kind === 'filter') {
        (cond as FilterCondition).filterText = '';
      } else if (cond.kind === 'sort') {
        (cond as SortCondition).direction = 'none';
      } else if (cond.kind === 'target') {
        cond.target = null;
      }
    });
  }

  public getLookupsFromEntities(entities: any[], conditions: Condition[]) {
    const result: any = {};

    conditions.filter(x => x.kind !== 'target')
      .forEach(condition => {
        if (condition.kind === 'filter' && condition.comparisonType === 'exact') {
          const values = Array.from(new Set(entities.map(e => e[condition.property])))
            .filter(v => v != null)
            .sort((a, b) => a.toString().localeCompare(b.toString()))
            .map(x => ({ id: x.toString(), name: x.toString() }));
          result[condition.property] = values;
        }
      });
    return result;
  }



}
