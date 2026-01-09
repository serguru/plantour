import { Component, Input } from '@angular/core';
import { ThingDto } from '../../../services/thing-service';
import { VTemplateThingsFullDto } from '../../../services/template-service';

@Component({
  selector: 'app-template-item',
  imports: [],
  templateUrl: './template-item-component.html',
  styleUrl: './template-item-component.scss',
})
export class TemplateItemComponent {
  @Input() entity: VTemplateThingsFullDto = {} as VTemplateThingsFullDto;
}
