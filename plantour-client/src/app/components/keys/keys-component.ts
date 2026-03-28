import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { KeyDto, KeyService } from '../../services/key-service';
import { ComponentService } from '../../services/component-service';
import { Condition } from '../../services/dynamic-query-service';
import { EntitiesComponent } from '../entities/entities-component';
import { EntitiesHeader, MenuConfig } from '../entities/entities-header-component/entities-header-component';
import { EntitiesActionsComponent } from '../entities/entities-actions-component/entities-actions-component';
import { LocalStorageService } from '../../services/local-storage-service';
import { UsersService } from '../../services/users-service';
import { KeyItemComponent } from './key-item/key-item-component';

@Component({
  selector: 'app-keys',
  imports: [
    EntitiesComponent,
    EntitiesHeader,
    EntitiesActionsComponent,
  ],
  templateUrl: './keys-component.html',
  styleUrl: './keys-component.scss',
})
export class KeysComponent implements OnInit {
  keyItemComponent = KeyItemComponent;
  componentId = 'keys';

  router = inject(Router);
  componentService = inject(ComponentService);
  keyService = inject(KeyService);
  localStorageService = inject(LocalStorageService);
  dynamicQueryService = inject(ComponentService).dynamicQueryService;
  usersService = inject(UsersService);

  private destroyRef = inject(DestroyRef);

  conditions: Condition[] = [
    {
      kind: 'sort',
      label: 'Sort by Name',
      icon: 'sort-alt',
      property: 'name',
      sortType: 'text',
      direction: 'none'
    },
    {
      kind: 'filter',
      property: 'name',
      label: 'Filter by Name',
      filterText: '',
      comparisonType: 'contains',
      icon: 'filter'
    }
  ];

  menuItems = computed<MenuConfig[]>(() => []);

  ngOnInit(): void {
    this.componentService.updateComponentId(this.componentId);
    this.initConditions(this.componentId);

    this.keyService.getAll().pipe(
      tap((keys: KeyDto[]) => {
        this.initSavedFeatures(keys);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(keys => this.componentService.updateEntities(keys || []));
  }

  initSavedFeatures(items: KeyDto[]) {
    const actionsVisible = !!this.localStorageService.getComponentKey(this.componentId, 'entitiesActionsVisible');
    this.componentService.updateEntitiesActionsVisible(actionsVisible);

    let id = this.localStorageService.getComponentKey(this.componentId, 'selectedId');
    if (!items || !items.find(x => x.id === id)) {
      id = null;
    }

    this.componentService.updateSelectedId(id);
  }

  initConditions(componentId: string | null): void {
    if (!componentId) {
      throw new Error('ComponentId is null');
    }

    const savedConditions = this.localStorageService.getComponentKeyObject(componentId, 'conditions') || [];
    const initialConditions = this.dynamicQueryService.initConditions(savedConditions, this.conditions);
    this.componentService.updateConditions(initialConditions);
    this.componentService.persistValue('conditions', initialConditions);
  }

  deleteKey(id: string): void {
    this.keyService.delete(id).pipe(
      switchMap(() => this.keyService.getAll()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((keys) => {
      this.componentService.updateEntities(keys);
    });
  }
}