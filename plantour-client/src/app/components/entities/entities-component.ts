import { Component, computed, inject, input, Input, OnInit, signal, Type } from '@angular/core';
import { MessagesService } from '../../services/messages-service';
import { AppService } from '../../services/app-service';
import { EntitiesService } from '../../services/entities-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DynamicQueryService } from '../../services/dynamic-query-service';
import { map } from 'rxjs';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-entities',
  imports: [CommonModule, Button],
  templateUrl: './entities-component.html',
  styleUrl: './entities-component.scss',
})
export class EntitiesComponent implements OnInit {

  @Input() itemComponent!: Type<any>;
  @Input() itemMetaData: any | null = null;

  
  targetEntityClick = input<Function | null>(null);

  onTargetEntityClick(entity: any, event: Event) {
    event.stopPropagation();
    if (!this.targetEntityClick()) {
      throw new Error('targetEntityClick is not defined');
    } 
    this.targetEntityClick()!(this.targetId(), entity);
  }

  entitiesService = inject(EntitiesService);


  showEntityButton = computed(() => {
    const x = this.targetEntityClick;
    const y = this.targetId();
    return x !== null && y;
  });

  selectedId = toSignal(this.entitiesService.selectedId$, { initialValue: null });

  processedEntities = this.entitiesService.processedEntities$;

  //entities$ = this.entitiesService.entities$;

  filterQuery = signal('');

  targetId = toSignal(this.entitiesService.targetCondition$, { initialValue: null });

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

   icon(item: any) {
          return (item.isTargeted) ? 'pi pi-check' : 'pi pi-plus';
   }

}
