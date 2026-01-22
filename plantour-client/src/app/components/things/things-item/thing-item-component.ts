import { Component, Input } from '@angular/core';
import { ThingDto } from '../../../services/thing-service';
import { ThingTextPipe } from '../../../pipes/thing-text.pipe';


@Component({
  selector: 'app-things-item-component',
  imports: [
    ThingTextPipe
  ],
  templateUrl: './thing-item-component.html',
  styleUrl: './thing-item-component.scss',
})
export class ThingItemComponent {
  @Input() entity: ThingDto = {} as ThingDto;
}
