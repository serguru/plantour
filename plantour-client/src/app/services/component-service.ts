import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, withLatestFrom, distinct, distinctUntilChanged, filter, map, Observable, of, ReplaySubject, switchMap, tap, Subject, throwError, concatMap } from 'rxjs';
import { Condition, DynamicQueryService, Target, TargetCondition } from './dynamic-query-service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocalStorageService, SettingsPersistenceService } from './settings-persistence-service';
import { isGuid } from '../helpers/utils';
import { UsersService } from './users-service';
import { AppService } from './app-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface EntitiesCounts {
  allTotal: number;
  allTargeted: number;
  allNotTargeted: number;

  processedTotal: number;
  processedTargeted: number;
  processedNotTargeted: number;
}


@Injectable({
  providedIn: 'root',
})
export class ComponentService {

  router = inject(Router);
  route = inject(ActivatedRoute);
  dynamicQueryService = inject(DynamicQueryService);
  settingsPersistenceService = inject(LocalStorageService);


  constructor() {
  }

  //#region Raw subjects

  // ComponentId to identify which component is using the service
  private componentIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  componentId$: Observable<string | null> = this.componentIdSubject.asObservable();
  updateComponentId(componentId: string | null) {
    if (componentId === this.componentIdSubject.value) {
      return;
    }
    this.componentIdSubject.next(componentId);
  }

  private persistAction$ = new Subject<{ key: string, value: any }>();

  persistValue$ = this.persistAction$.pipe(
    withLatestFrom(this.componentId$),
    concatMap(componentId => {
      if (!componentId) {
        return throwError(() => new Error('Cannot persist a value - no componentId'));
      }
      return of(componentId);
    }),
    takeUntilDestroyed()
  ).subscribe(([action, componentId]) => {
    this.settingsPersistenceService.setComponentKey(
      componentId!,
      action.key,
      action.value
    );
  })

  persistValue(key: string, value: any): void {
    this.persistAction$.next({ key, value });
  }

  // Raw entities as fetched from the backend
  private entitiesSubject: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);
  entities$: Observable<any[] | null> = this.entitiesSubject.asObservable();
  updateEntities(entities: any[] | null): void {
    this.entitiesSubject.next(entities);
  }

  // Current conditions: filtering, sorting, lookups and targets for packing or assigning
  private conditionsSubject: BehaviorSubject<Condition[] | null> = new BehaviorSubject<Condition[] | null>(null);
  conditions$: Observable<Condition[] | null> = this.conditionsSubject.asObservable();
  updateConditions(conditions: Condition[] | null): void {
    this.conditionsSubject.next(conditions);
  }

  // A lookup list for the target condition
  private targetLookupSubject: BehaviorSubject<Target[] | null> = new BehaviorSubject<Target[] | null>(null);
  targetLookup$: Observable<Target[] | null> = this.targetLookupSubject.asObservable();
  updateTargetLookup(lookup: any[] | null): void {
    this.targetLookupSubject.next(lookup);
  }

  // Currently selected entity ID
  private selectedIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  selectedId$: Observable<string | null> = this.selectedIdSubject.asObservable();
  updateSelectedId(selectedId: string | null): void {
    this.selectedIdSubject.next(selectedId);
  }
  saveSelectedId(selectedId: string | null): void {
    this.persistValue('selectedId', selectedId);
  }

  // Is entities actions panel visible
  private entitiesActionsVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  entitiesActionsVisible$: Observable<boolean> = this.entitiesActionsVisibleSubject.asObservable();
  updateEntitiesActionsVisible(visible: boolean): void {
    this.persistValue('entitiesActionsVisible', visible);
    this.entitiesActionsVisibleSubject.next(visible);
  }


  //#endregion

  //#region Derivative subjects
  // Processed entities after componentId, conditions, raw entities 
  processedEntities$: Observable<any[] | null> =
    combineLatest([
      this.entities$,
      this.conditions$
    ]).pipe(
      map(([entities, conditions]) => {
        const processed = this.dynamicQueryService.applyConditions(entities, conditions);
        return processed;
      })
    );

  targetedIds$: Observable<string[]> = this.processedEntities$.pipe(
    map(entities => {
      if (!entities) {
        return [];
      }
      return entities.filter(x => x && x.isTargeted).map(x => x.id);
    })
  );

  notTargetedIds$: Observable<string[]> = this.processedEntities$.pipe(
    map(entities => {
      if (!entities) {
        return [];
      }
      return entities.filter(x => x && !x.isTargeted).map(x => x.id);
    })
  );

  entitiesCounts$ = combineLatest([
    this.entities$,
    this.processedEntities$])
    .pipe(
      map(([entities, processedEntities]) => {
        const allTotal = entities ? entities.length : 0;
        const allTargeted = processedEntities ? processedEntities.filter(x => x.isTargeted).length : 0;
        const allNotTargeted = allTotal - allTargeted;

        const processedTotal = processedEntities ? processedEntities.length : 0;
        const processedTargeted = processedEntities ? processedEntities.filter(x => x.isTargeted).length : 0;
        const processedNotTargeted = processedTotal - processedTargeted;

        return {
          allTotal,
          allTargeted,
          allNotTargeted,
          processedTotal,
          processedTargeted,
          processedNotTargeted
        };
      }
      )
    );



  lookups$: Observable<any[] | null> =
    combineLatest([
      this.entities$,
      this.targetLookup$
    ]).pipe(
      map(([entities, targetLookup]) => {
        let lookups = []

        if (entities && entities.length > 0) {
          lookups = this.dynamicQueryService.getLookupsFromEntities(entities, this.conditionsSubject.getValue() || []);
        }

        if (targetLookup) {
          lookups['target'] = targetLookup;
        }
        return lookups;
      })
    );


  selectedCondition$ = this.conditions$.pipe(
    map(conditions => {
      if (!conditions || !conditions.length) {
        return null;
      }
      const result = conditions.find(x => x.isSelected);
      if (!result) {
        return conditions[0];
      }
      return result;
    }),
    //distinctUntilChanged()
  );

  targetCondition$ = this.selectedCondition$.pipe(
    map(condition => {
      if (condition && condition.kind === 'target') {
        return condition as TargetCondition;
      }
      return null;
    }),
    //distinctUntilChanged()
  );

  target$ = this.targetCondition$.pipe(
    map(condition => {
      if (condition && condition.kind === 'target') {
        return condition.target as Target;
      }
      return null;
    }),
    //distinctUntilChanged()
  );



  conditionSet$ = this.conditions$.pipe(
    map(conditions => this.dynamicQueryService.anyConditionSet(conditions))
  );

  //#endregion



}
