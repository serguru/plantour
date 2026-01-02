import { Component, inject, Input } from '@angular/core';
import { MessagesService } from '../../services/messages-service';
import { AppService } from '../../services/app-service';

type Comparable = {
  name?: string;
  email?: string;
};


@Component({
  selector: 'app-entities',
  imports: [],
  templateUrl: './entities-component.html',
  styleUrl: './entities-component.scss',
})
export class EntitiesComponent {

  entities: any[] | null = null;

  @Input() entitiesService!: any;

  getAllEntities() {
    return this.entitiesService.getAll()
      .subscribe({
        next: (entities: any[]) => {
          this.entities = entities;
        }
      });
  }
}
