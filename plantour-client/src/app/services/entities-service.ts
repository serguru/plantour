import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinct, distinctUntilChanged, filter, map, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { Condition, DynamicQueryService, Target, TargetCondition } from './dynamic-query-service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocalStorageService, SettingsPersistenceService } from './settings-persistence-service';
import { isGuid } from '../helpers/utils';
import { UsersService } from './users-service';
import { AppService } from './app-service';

export interface EntitiesCounts {
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
  usersService = inject(UsersService);
  appService = inject(AppService);

  router = inject(Router);

  route = inject(ActivatedRoute);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.route.snapshot.root;
        while (child.firstChild) {
          child = child.firstChild;
        }
        return child.data;
      })

    ).subscribe(data => {
      const componentId = data ? data['componentId'] : null;
      this.updateComponentId(componentId);
    });
  }


  // ComponentId to identify which component is using the service
  public componentIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  componentId$: Observable<string | null> = this.componentIdSubject.asObservable();
  public updateComponentId(componentId: string | null) {
    if (componentId === this.componentIdSubject.value) {
      return;
    }
    this.reset();
    this.componentIdSubject.next(componentId);
  }



  // helpers to persist values per component
  persistValue(key: string, value: any): void {
    const componentId = this.componentInitSubject.getValue()?.componentId;
    if (!componentId) {
      return;
    }
    this.settingsPersistenceService.setComponentKey(componentId, key, value);
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
  updateEntities(entities: any[] | null): void {
    this.entitiesSubject.next(entities);
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

  selectedCondition$ = this.conditions$.pipe(
    map(conditions => {
      if (!conditions || !conditions.length) {
        return null;
      }
      const result = conditions.find(x => x.isSelected);
      return result || null;
    }),
    distinctUntilChanged()
  );

  targetCondition$ = this.selectedCondition$.pipe(
    map(condition => {
      if (condition && condition.kind === 'target') {
        return condition as TargetCondition;
      }
      return null;
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
        this.persistValue('entitiesActionsVisible', visible);
      })
    );

  public toggleEntitiesActionsVisible(): void {
    const current = this.entitiesActionsVisibleSubject.getValue();
    this.entitiesActionsVisibleSubject.next(!current);
  }


  // Currently selected entity ID
  private selectedSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  selectedId$: Observable<string | null> = this.selectedSubject.asObservable();
  public updateSelected(entityId: string | null): void {
    this.selectedSubject.next(entityId);
  }


  // A lookup list for the target-type condition
  private targetLookupSubject: BehaviorSubject<Target[] | null> = new BehaviorSubject<Target[] | null>(null);
  targetLookup$: Observable<Target[] | null> = this.targetLookupSubject.asObservable();
  public updateTargetLookup(lookup: any[] | null): void {
    this.targetLookupSubject.next(lookup);
  }

  public lookups$: Observable<any[] | null> = this.componentInitializer$.pipe(
    switchMap(() => combineLatest([
      this.entities$,
      this.targetLookup$
    ])),
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

  // thingsToSharedAllowed$: Observable<boolean> = combineLatest([this.usersService.isAdmin$,
  // this.componentInit$]).pipe(
  //   map(([isAdmin, componentInit]) => isAdmin && componentInit?.componentId == 'things')
  // );

  // private thingsToSharedModeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // thingsToSharedMode$: Observable<boolean> = this.thingsToSharedModeSubject.pipe(
  //   switchMap(value => this.thingsToSharedAllowed$.pipe(
  //     map(allowed => allowed ? value : false)
  //   )
  //   ));

  // public updateThingsToSharedMode(value: boolean): void {
  //   this.settingsPersistenceService.setComponentKey('things', 'thingsToSharedMode', value);
  //   this.thingsToSharedModeSubject.next(value);
  // }

  reset(): void {
    this.componentInitSubject.next(null);
    this.entitiesSubject.next(null);
    this.conditionsSubject.next(null);
    this.entitiesActionsVisibleSubject.next(false);
    this.selectedSubject.next(null);
    this.targetLookupSubject.next(null);
    //this.thingsToSharedModeSubject.next(false);
  }

}
