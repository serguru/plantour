import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-list-box',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './list-box.component.html',
  styleUrls: ['./list-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListBoxComponent<T> implements AfterViewInit, OnChanges {
  @Input() items: T[] = [];
  @Input() selected: T | null = null;
  @Output() selectedChange = new EventEmitter<T>();

  @ViewChildren('itemRow', { read: ElementRef })
  itemElements!: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit(): void {
    // Прокручиваем, если selected установлен программно после загрузки
    this.scrollToSelected();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected'] && !changes['selected'].firstChange) {
      // Ждём рендера DOM после изменения selected
      queueMicrotask(() => this.scrollToSelected());
    }

    if (changes['items'] && !changes['items'].firstChange) {
      queueMicrotask(() => this.scrollToSelected());
    }
  }

  onItemClick(item: T): void {
    this.selected = item;
    this.selectedChange.emit(item);

    // После клика элемент уже в DOM, safe scroll
    this.scrollToSelected();
  }

  private scrollToSelected(): void {
    if (!this.selected || !this.itemElements?.length) return;

    const item = this.items.find(i => (i as any).id === (this.selected as any).id);
    if (!item) return;
    const index = this.items.indexOf(item);

    const el = this.itemElements.toArray()[index]?.nativeElement;
    if (!el) return;

    el.scrollIntoView({
      block: 'center',
      behavior: 'smooth'
    });
  }

  trackByIndex(i: number): number {
    return i;
  }
}
