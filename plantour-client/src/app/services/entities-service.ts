import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinct, distinctUntilChanged, filter, map, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { Condition, DynamicQueryService } from './dynamic-query-service';
import { NavigationEnd, Router } from '@angular/router';
import { LocalStorageService, SettingsPersistenceService } from './settings-persistence-service';
import { isGuid } from '../helpers/utils';

export  interface EntitiesCounts {
  allTotal: number;
  allTargeted: number;
  allNotTargeted: number;

  processedTotal: number;
  processedTargeted: number;
  processedNotTargeted: number;
}

type ComponentInit = { 
  componentId: string;
  initialConditions: Condition[];
};

@Injectable({
  providedIn: 'root',
})
export class EntitiesService {

  settingsPersistenceService = inject(LocalStorageService);
  dynamicQueryService = inject(DynamicQueryService);
  router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.reset();
    });
  }

  // Component Init to identify which component is using the service and initialize its state
  private componentInitSubject: BehaviorSubject<ComponentInit | null> = new BehaviorSubject<ComponentInit | null>(null);
  componentInit$: Observable<ComponentInit | null> = this.componentInitSubject.asObservable();
  public updateComponentInit(componentInit: ComponentInit | null) {
    this.componentInitSubject.next(componentInit);
  }

  // Raw entities as fetched from the backend
  private entitiesSubject: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);
  entities$: Observable<any[] | null> = this.entitiesSubject.asObservable();
  public updateEntities(entities: any[] | null): void {
    this.entitiesSubject.next(entities);
  }

  saveValue(key: string, value: any): void {
    const componentId = this.componentInitSubject.getValue()?.componentId;  
    if (!componentId) { 
      return;
    } 
    this.settingsPersistenceService.setComponentKey(componentId, key, value);
  }

  // Current conditions: filtering, sorting, lookups and targets (i.e. for packing or assigning)
  private conditionsSubject: BehaviorSubject<Condition[] | null> = new BehaviorSubject<Condition[] | null>(null);
  conditions$: Observable<Condition[] | null> = this.conditionsSubject.asObservable();

  public updateConditions(conditions: Condition[] | null): void {
    this.conditionsSubject.next(conditions);
  }

  conditionSet$ = this.conditions$.pipe(
    map(conditions => this.dynamicQueryService.anyConditionSet(conditions))
  );

  targetCondition$ = this.conditions$.pipe(
    map(conditions => {
        if (!conditions || !conditions.length) {
          return null;
        }
        const target = conditions.find(x => x.property == 'target' && x.kind == 'filter' && x.comparisonType == 'exact');

        if (!target) {
          return null;
        }
        return (target as any).filterText;
    }),
    distinctUntilChanged()
  );

  private componentInitializer$ = this.componentInitSubject.pipe(
    distinctUntilChanged(),
    tap(init => {
      if (!init) {
        this.reset();
        return;
      }
      // 
      this.conditionsSubject.next(init.initialConditions);

      const savedSelectedId = this.settingsPersistenceService.getComponentKey(init.componentId, 'selectedId');
      if (isGuid(savedSelectedId)) {
        this.selectedSubject.next(savedSelectedId);
      } else {
        this.selectedSubject.next(null);
      }

      const savedEntitiesActionsVisible = this.settingsPersistenceService.getComponentKey(init.componentId, 'entitiesActionsVisible');
      this.entitiesActionsVisibleSubject.next(!!savedEntitiesActionsVisible);

    })
  );


  // Processed entities after componentId, conditions, raw entities 
  public processedEntities$: Observable<any[] | null> = this.componentInitializer$.pipe(
    switchMap(() => combineLatest([
      this.entities$,
      this.conditions$
    ])),
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

  // If entities actions panel is visible
  private entitiesActionsVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  entitiesActionsVisible$: Observable<boolean> = this.entitiesActionsVisibleSubject
  .pipe(
    tap(visible => {
      this.saveValue('entitiesActionsVisible', visible);
    })
  );

  public toggleEntitiesActionsVisible(): void {
    const current = this.entitiesActionsVisibleSubject.getValue();
    this.entitiesActionsVisibleSubject.next(!current);
  }


  // Currently selected entity ID, must be one of the processed entities
  private selectedSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  selectedId$: Observable<string | null> = this.selectedSubject.asObservable();
  public updateSelected(entityId: string | null): void {
    this.selectedSubject.next(entityId);
  }


  // A lookup list for the target-type condition
  private targetLookupSubject: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);
  targetLookup$: Observable<any | null> = this.targetLookupSubject.asObservable();
  public updateTargetLookup(lookup: any[] | null): void  {
    this.targetLookupSubject.next(lookup);
  }

  public lookups$: Observable<any[] | null> = this.componentInitializer$.pipe(
    switchMap(() => combineLatest([
      this.entities$,
      this.targetLookup$
    ])),
    map(([entities, targetLookup]) => {
      if (!entities || entities.length === 0) {
        return null;
      } 
      const lookups = this.dynamicQueryService.getLookupsFromEntities(entities, this.conditionsSubject.getValue() || []);

      if (targetLookup) {
        lookups['target'] = targetLookup;
      }
      return lookups;
    })
  );

  reset(): void {
    this.componentInitSubject.next(null);
    this.conditionsSubject.next(null);
    this.entitiesSubject.next(null);
    this.selectedSubject.next(null);
    this.entitiesActionsVisibleSubject.next(false);
  }

}
