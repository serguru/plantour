import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, Type } from '@angular/core';
import { AppButton } from '../../button/button-component';
import { HelpSection } from '../help-types';

@Component({
  selector: 'app-help-section',
  standalone: true,
  imports: [CommonModule, AppButton],
  templateUrl: './help-section.component.html',
  styleUrl: './help-section.component.scss'
})
export class HelpSectionComponent {
  @Input({ required: true }) section!: HelpSection;
  @Input() expanded = false;
  @Input() selectedSubsectionId: string | null = null;
  @Input() subsectionComponents: Record<string, Type<unknown> | null> = {};

  @Output() toggleExpanded = new EventEmitter<string>();
  @Output() selectSubsection = new EventEmitter<{ sectionId: string; subsectionId: string }>();
  @Output() startTestMode = new EventEmitter<void>();

  onToggle(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.toggleExpanded.emit(this.section.id);
  }

  onSelectSubsection(subsectionId: string) {
    // If clicking on the already selected subsection, collapse it
    if (this.selectedSubsectionId === subsectionId) {
      this.selectSubsection.emit({ sectionId: this.section.id, subsectionId: '' });
    } else {
      this.selectSubsection.emit({ sectionId: this.section.id, subsectionId });
    }
  }
}
