import { Component, Input } from '@angular/core';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';
import { TodoDto } from '../../../services/todo-service';

@Component({
  selector: 'app-todo-item-component',
  imports: [AmazonLinkComponent],
  templateUrl: './todo-item-component.html',
  styleUrl: './todo-item-component.scss',
})
export class TodoItemComponent {
  @Input() entity: TodoDto = {} as TodoDto;
}