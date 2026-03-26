import { Component, Input } from '@angular/core';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';
import { TodoDto } from '../../../services/todo-service';
import { formatDate } from '../../../helpers/utils';

@Component({
  selector: 'app-todo-item-component',
  imports: [AmazonLinkComponent],
  templateUrl: './todo-item-component.html',
  styleUrl: './todo-item-component.scss',
})
export class TodoItemComponent {
  @Input() entity: TodoDto = {} as TodoDto;

  get scheduleText(): string | null {
    if (this.entity.startDate && this.entity.endDate) {
      return `${formatDate(this.entity.startDate)} - ${formatDate(this.entity.endDate)}`;
    }

    return null;
  }
}