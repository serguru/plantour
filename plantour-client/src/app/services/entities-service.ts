import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { Condition, DynamicQueryService } from './dynamic-query-service';
import { NavigationEnd, Router } from '@angular/router';
import { LocalStorageService, SettingsPersistenceService } from './settings-persistence-service';
import { isGuid } from '../helpers/utils';


type EntitiesActionType = 'filtering' | 'packing' | 'assigning';

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

  private componentInitializer$ = this.componentInitSubject.pipe(
    distinctUntilChanged(),
    tap(init => {
      if (!init) {
        this.reset();
        return;
      }
      const savedConditions = this.settingsPersistenceService.getComponentKey(init.componentId, 'conditions');
      const initialConditions = this.dynamicQueryService.initConditions(savedConditions, init.initialConditions);
      this.conditionsSubject.next(initialConditions);

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

  processedEntities: any[] | null = null;

  // Processed entities after componentId, conditions, raw entities 
  public processedEntities$: Observable<any[] | null> = this.componentInitializer$.pipe(
    switchMap(() => combineLatest([
      this.entities$,
      this.conditions$
    ])),
    map(([entities, conditions]) => {
      const processed = this.dynamicQueryService.applyConditions(entities, conditions);
      this.processedEntities = processed;
      return processed;
    } )
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

  getSavedSelectedId() {
    const componentId = this.componentInitSubject.getValue()?.componentId;
    if (!componentId) {
      return null;
    }
    const key = this.settingsPersistenceService.getComponentKey(componentId, 'selectedId');

    if (!isGuid(key)) {
      return null;
    }
    return key;
  }

  // Currently selected entity ID, must be one of the processed entities
  private selectedSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  selected$: Observable<any | null> = this.selectedSubject
    .pipe(
      tap(selectedId => {
        this.saveValue('selectedId', selectedId);
      }),
      map(selectedId => {
        const entities = this.processedEntities;
        if (!entities || !selectedId) {
          return null;
        }
        return entities.find(e => e.id === selectedId) || null;
      }
      )
    );

  public updateSelected(id: string | null): void {
    if (!id) {
      this.selectedSubject.next(null);
      return;
    }
    const entities = this.entitiesSubject.getValue();
    if (!entities) {
      this.selectedSubject.next(null);
      return;
    }
    this.selectedSubject.next(id);
  }

  public selected() {
    const selectedId = this.selectedSubject.getValue();
    if (!selectedId) {
      return null;
    }
    const entities = this.entitiesSubject.getValue();
    if (!entities) {
      return null;
    }
    return entities.find(e => e.id === selectedId) || null;
  }

  public get isSelected() {
    return this.selected() !== null;
  }

  reset(): void {
    this.componentInitSubject.next(null);
    this.conditionsSubject.next(null);
    this.entitiesSubject.next(null);
    this.selectedSubject.next(null);
    this.entitiesActionsVisibleSubject.next(false);
  }

  saveConfig() {
    const componentId = this.componentInitSubject.getValue()?.componentId;
    if (!componentId) {
      return;
    }
    const conditions = this.conditionsSubject.getValue();
    this.settingsPersistenceService.setComponentKey(componentId, 'conditions', conditions);

    const selectedId = this.selectedSubject.getValue();
    this.settingsPersistenceService.setComponentKey(componentId, 'selectedId', selectedId);

    const visible = this.entitiesActionsVisibleSubject.getValue();
    this.settingsPersistenceService.setComponentKey(componentId, 'entitiesActionsVisible', visible);
  }
}
