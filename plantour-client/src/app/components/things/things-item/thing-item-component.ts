import { Component, Input } from '@angular/core';
import { ThingDto } from '../../../services/thing-service';

@Component({
  selector: 'app-things-item-component',
  imports: [],
  templateUrl: './thing-item-component.html',
  styleUrl: './thing-item-component.scss',
})
export class ThingItemComponent {
  @Input() data: ThingDto = {} as ThingDto;
  

}
