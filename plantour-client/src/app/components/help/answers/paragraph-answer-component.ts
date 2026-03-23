
import { Component, Input } from '@angular/core';
import { HelpAnswerParagraphSection } from '../help-content';

@Component({
  selector: 'app-help-paragraph-answer',
  standalone: true,
  imports: [],
  templateUrl: './paragraph-answer-component.html',
  styleUrl: '../help-component.scss'
})
export class HelpParagraphAnswerComponent {
  @Input() sections: HelpAnswerParagraphSection[] = [];
}