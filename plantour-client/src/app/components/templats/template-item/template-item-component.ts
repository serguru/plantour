import { Component, Input } from '@angular/core';
import { ThingDto } from '../../../services/thing-service';
import { VTemplateThingsFullDto } from '../../../services/template-service';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-template-item',
  imports: [
    Tag
  ],
  templateUrl: './template-item-component.html',
  styleUrl: './template-item-component.scss',
})
export class TemplateItemComponent {
  @Input() entity: VTemplateThingsFullDto = {} as VTemplateThingsFullDto;
}
