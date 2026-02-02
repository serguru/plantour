import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PopoverComponent } from '../popover/popover-component';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, PopoverComponent],
  templateUrl: './dropdown-component.html',
  styleUrl: './dropdown-component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Dropdown),
      multi: true
    }
  ]
})
export class Dropdown implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select...';
  @Input() emptyText = 'No options';
  @Input() disabled = false;
  @Input() options: string[] = [];
  @Input()
  set value(nextValue: string | null) {
    this._value = nextValue;
    this.syncTextareaHeight();
  }
  get value(): string | null {
    return this._value;
  }
  @Input() compareWith: (a: string | null, b: string | null) => boolean = (a, b) => a === b;

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() optionSelected = new EventEmitter<string>();

  @ViewChild('popover') popover?: PopoverComponent;
  @ViewChild('origin') originRef?: ElementRef<HTMLElement>;
  @ViewChild('displayArea') displayArea?: ElementRef<HTMLTextAreaElement>;

  private _value: string | null = null;
  private resizeObserver?: ResizeObserver;
  private resizeScheduled = false;
  private lastObservedWidth: number | null = null;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit() {
    this.syncTextareaHeight();
    this.observeResize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] || changes['options']) {
      this.syncTextareaHeight();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.syncTextareaHeight();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  get displayText(): string {
    return this.value ?? '';
  }

  togglePopover(event: MouseEvent) {
    if (this.disabled) {
      return;
    }

    event.stopPropagation();
    const origin = this.originRef?.nativeElement ?? (event.currentTarget as HTMLElement);
    if (this.popover?.isOpen()) {
      this.popover.hide();
    } else {
      this.popover?.show(origin);
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    if (event.key === 'Escape') {
      this.popover?.hide();
    }
  }

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (!target) {
      return;
    }

    this.value = target.value;
    this.onChange(target.value);
    this.valueChange.emit(target.value);
    this.syncTextareaHeight();
  }

  onBlur() {
    this.onTouched();
  }

  clearValue(event?: Event) {
    if (this.disabled) {
      return;
    }

    if (event) {
      event.stopPropagation();
    }

    this.value = '';
    this.onChange('');
    this.onTouched();
    this.valueChange.emit('');
    this.syncTextareaHeight();
  }

  selectOption(option: string) {
    this.value = option;
    this.onChange(option);
    this.onTouched();
    this.valueChange.emit(option);
    this.optionSelected.emit(option);
    this.popover?.hide();
    this.syncTextareaHeight();
  }

  trackByOption(index: number, option: string) {
    return option ?? index;
  }

  private syncTextareaHeight() {
    const textarea = this.displayArea?.nativeElement;
    if (!textarea) {
      return;
    }

    queueMicrotask(() => {
      textarea.style.height = 'auto';
      const computed = window.getComputedStyle(textarea);
      const lineHeight = Number.parseFloat(computed.lineHeight || '0');
      const paddingTop = Number.parseFloat(computed.paddingTop || '0');
      const paddingBottom = Number.parseFloat(computed.paddingBottom || '0');
      const maxHeight = lineHeight ? lineHeight * 3 + paddingTop + paddingBottom : textarea.scrollHeight;
      const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${nextHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    });
  }

  private observeResize() {
    const origin = this.originRef?.nativeElement;
    if (!origin || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width ?? null;
      if (width === null || width === this.lastObservedWidth) {
        return;
      }

      this.lastObservedWidth = width;
      this.scheduleResizeSync();
    });
    this.resizeObserver.observe(origin);
  }

  private scheduleResizeSync() {
    if (this.resizeScheduled) {
      return;
    }

    this.resizeScheduled = true;
    requestAnimationFrame(() => {
      this.resizeScheduled = false;
      this.syncTextareaHeight();
    });
  }

  writeValue(value: string | null): void {
    this.value = value;
    this.syncTextareaHeight();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
