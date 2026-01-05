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


  selectedId = toSignal(this.entitiesService.selected$, { initialValue: null });

  processedEntities = this.entitiesService.processedEntities$;

  entities$ = this.entitiesService.entities$;

  filterQuery = signal('');

  isSelected(entity: any): boolean {
    const selectedId = this.selectedId();
    if (!selectedId || !entity) {
      return false;
    }
    return selectedId === entity.id;
  }

  selectEntity(entity: any | null) {
    if (this.isSelected(entity)) {
      this.entitiesService.updateSelected(null);  
      this.entitiesService.saveValue('selectedId', null);
      return;
    }
    this.entitiesService.updateSelected(entity?.id);
    this.entitiesService.saveValue('selectedId', entity?.id);
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
