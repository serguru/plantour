import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HelpAnswerListSection } from '../help-content';

@Component({
  selector: 'app-help-list-answer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="help-list-answer">
      @for (section of sections; track $index) {
        <section class="help-list-answer__section">
          @if (section.title) {
            <p class="help-list-answer__caption">{{ section.title }}</p>
          }

          @if (section.listStyle === 'ordered') {
            <ol class="help-list-answer__list help-list-answer__list--ordered">
              @for (item of section.items; track item) {
                <li>{{ item }}</li>
              }
            </ol>
          } @else {
            <ul class="help-list-answer__list help-list-answer__list--unordered">
              @for (item of section.items; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          }
        </section>
      }
    </article>
  `,
  styleUrl: '../help-component.scss'
})
export class HelpListAnswerComponent {
  @Input() sections: HelpAnswerListSection[] = [];
}