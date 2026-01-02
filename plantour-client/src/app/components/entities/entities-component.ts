import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { MessagesService } from '../../services/messages-service';
import { AppService } from '../../services/app-service';
import { EntitiesService } from '../../services/entities-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-entities',
  imports: [],
  templateUrl: './entities-component.html',
  styleUrl: './entities-component.scss',
})
export class EntitiesComponent implements OnInit {
  entitiesService = inject(EntitiesService);

  selected = toSignal(this.entitiesService.selected$, { initialValue: null });

  entities = toSignal(this.entitiesService.entities$, { initialValue: null });

  filterQuery = signal('');

  isSelected(entity: any): boolean {
    const selectedEntity = this.selected();
    if (!selectedEntity || !entity) {
      return false;
    }
    return selectedEntity.id === entity.id;
  }

  selectEntity(entity: any | null) {
    this.entitiesService.updateSelected(entity?.id);
  }

  processedEntities = computed(() => {
    const query = this.filterQuery().toLowerCase();
    const allEntities = this.entities();

    if (!query || !allEntities) {
      return allEntities;
    }

    return allEntities.filter(entity =>
      entity.name?.toLowerCase().includes(query)
    );
  });

  updateFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterQuery.set(input.value);
  }

  ngOnInit(): void {
  }
}
