import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

type Comparable = {
  name?: string;
  email?: string;
};

type EntitiesActionType = 'filtering' | 'packing' | 'assigning';

export interface EntitiesAction {
  type: EntitiesActionType;
  shown: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EntitiesService {

  private actionsSubject: BehaviorSubject<EntitiesAction[] | null> = new BehaviorSubject<EntitiesAction[] | null>(null);
  actions$: Observable<EntitiesAction[] | null> = this.actionsSubject.asObservable();

  public updateActions(actions: EntitiesAction[] | null): void {
    this.actionsSubject.next(actions);
  }

  public updateAction(type: EntitiesActionType, shown: boolean): void {
    const actions = this.actionsSubject.getValue() || [];
    const action = actions.find(a => a.type === type);  
    if (action) {
      action.shown = shown;
    } else {
      throw new Error(`Action of type ${type} not found`);
    }
    this.actionsSubject.next(actions);
  }

  private entitiesSubject: BehaviorSubject<any[] | null> = new BehaviorSubject<any[] | null>(null);
  entities$: Observable<any[] | null> = this.entitiesSubject.asObservable();


  public updateEntities(entity: any | null): void {
    this.entitiesSubject.next(entity);
  }

  private selectedSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  selected$: Observable<any | null> = this.selectedSubject
    .pipe(
      map(selectedId => {
        const entities = this.entitiesSubject.getValue();
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
}
