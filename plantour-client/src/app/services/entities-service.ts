import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { DynamicQueryService } from './dynamic-query-service';
import { NavigationEnd, Router } from '@angular/router';


type EntitiesActionType = 'filtering' | 'packing' | 'assigning';

@Injectable({
  providedIn: 'root',
})
export class EntitiesService {

  router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.reset();
    });
  }

  // Component ID to identify which component is using the service
  private componentIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  componentId$: Observable<string | null> = this.componentIdSubject.asObservable();
  public updateComponentId(componentId: string | null) {
    this.componentIdSubject.next(componentId);
  }

  // Processed entities after filtering, sorting, etc.
  private processedEntitiesSubject: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);
  processedEntities$: Observable<any[] | null> = this.processedEntitiesSubject.asObservable();

  public updateProcessedEntities(entities: any[] | null): void {
    this.processedEntitiesSubject.next(entities);
  }

  // If entities actions panel is visible
  private entitiesActionsVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  entitiesActionsVisible$: Observable<boolean> = this.entitiesActionsVisibleSubject.asObservable();

  public toggleEntitiesActionsVisible(): void {
    const current = this.entitiesActionsVisibleSubject.getValue();
    this.entitiesActionsVisibleSubject.next(!current);
  }


  private entitiesSubject: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);
  entities$: Observable<any[] | null> = this.entitiesSubject.asObservable();

  public updateEntities(entities: any[] | null): void {
    this.entitiesSubject.next(entities);
  }

  private selectedSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  selected$: Observable<any | null> = this.selectedSubject
    .pipe(
      map(selectedId => {
        const entities = this.processedEntitiesSubject.getValue();
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
    this.processedEntitiesSubject.next(null);
    this.entitiesSubject.next(null);
    this.selectedSubject.next(null);
    this.entitiesActionsVisibleSubject.next(false);
  }
}
