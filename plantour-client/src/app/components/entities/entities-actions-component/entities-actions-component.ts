import { Component, inject, input, Input, OnInit } from '@angular/core';
import { EntitiesService } from '../../../services/entities-service';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { Condition, DynamicQueryService } from '../../../services/dynamic-query-service';
import deepEqual from 'fast-deep-equal';


@Component({
  selector: 'app-entities-actions',
  imports: [],
  templateUrl: './entities-actions-component.html',
  styleUrl: './entities-actions-component.scss',
})
export class EntitiesActionsComponent implements OnInit {

  conditions = input<Condition[]>([]);  
  entitiesService = inject(EntitiesService);
  dynamicQueryService = inject(DynamicQueryService);
  lookups: any[] | null = null;

  ngOnInit(): void {
    this.entitiesService.entities$.subscribe(entities => {
      this.setLookups(entities);
    });
  }

  private setLookups(entities: any[] | null): void {
    if (!entities) {
      this.lookups = null;
      return;
    }
    const lookups: any = {};
    this.conditions().forEach(condition => {
      if (condition.kind === 'filter' && condition.comparisonType === 'exact') {
        lookups[condition.property] = 
          Array.from(new Set(entities.map(e => e[condition.property])))
          .filter(v => v != null)
          .sort((a, b) => a.toString().localeCompare(b.toString()))
      }
    });
    this.lookups = lookups;
  }


  updateConditions(): void {
    this.dynamicQueryService.setConditions(this.conditions());
  }
}
