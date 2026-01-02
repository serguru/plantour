import { Component, computed, inject, Input, OnInit, signal, Type } from '@angular/core';
import { MessagesService } from '../../services/messages-service';
import { AppService } from '../../services/app-service';
import { EntitiesService } from '../../services/entities-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entities',
  imports: [CommonModule],
  templateUrl: './entities-component.html',
  styleUrl: './entities-component.scss',
})
export class EntitiesComponent implements OnInit {
  @Input() itemComponent!: Type<any>;
  @Input() itemMetaData: any | null = null;


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

  getEntityInputs(entity: any) {
    const inputs: any = { entity: entity };

    if (this.itemMetaData) {
      inputs.itemMetaData = this.itemMetaData;
    }
    return inputs;
  }

}
