import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HelpAnswerListSection } from '../help-content';

@Component({
  selector: 'app-help-list-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-answer-component.html',
  styleUrl: '../help-component.scss'
})
export class HelpListAnswerComponent {
  @Input() sections: HelpAnswerListSection[] = [];
}