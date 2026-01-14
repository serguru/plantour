import { Component, computed, inject, input, Input, OnInit, signal, Type } from '@angular/core';
import { MessagesService } from '../../services/messages-service';
import { AppService } from '../../services/app-service';
import { ComponentService } from '../../services/component-service';
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

  disableSelection = input<boolean>(false);

  
  targetEntityClick = input<Function | null>(null);

  onTargetEntityClick(entity: any, event: Event) {
    event.stopPropagation();
    if (!this.targetEntityClick()) {
      throw new Error('targetEntityClick is not defined');
    } 
    this.targetEntityClick()!(entity);
  }

  componentService = inject(ComponentService);
  showEntityButton = computed(() => {
    const x = this.targetEntityClick;
    const y = this.targetCondition();
    return x !== null && y;
  });

  entityButtonDisabled = computed(() => {
    const target = this.target();
    return !target;
  });


  selectedId = toSignal(this.componentService.selectedId$, { initialValue: null });

  processedEntities = this.componentService.processedEntities$;

  //entities$ = this.componentService.entities$;

  filterQuery = signal('');

  targetCondition = toSignal(this.componentService.targetCondition$, { initialValue: null });
  target = toSignal(this.componentService.target$, { initialValue: null });
  

  loading = toSignal(this.componentService.loading$, { initialValue: false });

  emptyText = computed(() => {
    if (this.loading()) {
      return '';
    } 
    return 'No rows';
  });

  


  isSelected(entity: any): boolean {
    if(this.disableSelection()) {
      return false;
    }
    const selectedId = this.selectedId();
    if (!selectedId || !entity) {
      return false;
    }
    return selectedId === entity.id;
  }

  selectEntity(entity: any | null) {
    if (this.disableSelection()) {
      return;
    }
    if (this.isSelected(entity)) {
      this.componentService.updateSelectedId(null);  
      this.componentService.saveSelectedId(null);
      return;
    }
    this.componentService.updateSelectedId(entity?.id);
    this.componentService.saveSelectedId(entity?.id);
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
