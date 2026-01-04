import { Component, computed, inject, input, Input, OnInit, signal, Type } from '@angular/core';
import { MessagesService } from '../../services/messages-service';
import { AppService } from '../../services/app-service';
import { EntitiesService } from '../../services/entities-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DynamicQueryService } from '../../services/dynamic-query-service';

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

  processedEntities = this.entitiesService.processedEntities$;

  entities$ = this.entitiesService.entities$;

  filterQuery = signal('');

  isSelected(entity: any): boolean {
    const selectedEntity = this.selected();
    if (!selectedEntity || !entity) {
      return false;
    }
    return selectedEntity.id === entity.id;
  }

  selectEntity(entity: any | null) {
    if (this.isSelected(entity)) {
      this.entitiesService.updateSelected(null);  
      return;
    }
    this.entitiesService.updateSelected(entity?.id);
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
