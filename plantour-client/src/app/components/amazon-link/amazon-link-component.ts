import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, input, ViewChild } from '@angular/core';
import { PopoverComponent } from '../popover/popover-component';
import { removeMark } from '../../helpers/utils';

@Component({
  selector: 'amazon-link',
  imports: [PopoverComponent],
  templateUrl: './amazon-link-component.html',
  styleUrl: './amazon-link-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmazonLinkComponent {
  @ViewChild('origin', { read: ElementRef }) originRef?: ElementRef<HTMLElement>;
  @ViewChild('popover') popover?: PopoverComponent;
  @ViewChild('popupAction', { read: ElementRef }) popupActionRef?: ElementRef<HTMLButtonElement>;

  item = input<string | null>(null);
  associateTag = input('plantourcli07-20');
  marketplace = input('com');
  linkText = input<any>('Search on Amazon');

  itemLabel = computed(() => {
    return this.item()?.trim() || this.query();
  });

  query = computed(() => {
    const item = this.item();

    if (!item) {
      return '';
    }

    let result = removeMark(item).trim();

    return result;
  });

  amazonSearchUrl = computed(() => {
    const query = this.query();

    if (!query) {
      return '';
    }

    const params = new URLSearchParams({ k: query });
    const associateTag = this.associateTag().trim();

    if (associateTag) {
      params.set('tag', associateTag);
    }

    return `https://www.amazon.${this.marketplace().trim() || 'com'}/s?${params.toString()}`;
  });

  resolvedLinkText = computed(() => {
    const customLinkText = this.linkText().trim();

    if (customLinkText) {
      return customLinkText;
    }

    return this.query() ? `Search Amazon for ${this.query()}` : 'Search on Amazon';
  });

  ariaLabel = computed(() => {
    return this.query() ? `Search Amazon for ${this.query()}` : 'Search on Amazon';
  });

  popupLabel = computed(() => {
    const itemLabel = this.itemLabel();

    return itemLabel ? `Find ${itemLabel} on Amazon` : 'Find on Amazon';
  });

  onLinkClick(event: Event) {
    const url = this.amazonSearchUrl();
    const origin = this.originRef?.nativeElement ?? (event.currentTarget as HTMLElement | null);

    event.preventDefault();
    event.stopPropagation();

    if (!url || !origin) {
      return;
    }

    if (this.popover?.isOpen()) {
      this.popover.hide();
      return;
    }

    this.popover?.show(origin);
  }

  onLinkActivate(event: Event) {
    const origin = this.originRef?.nativeElement;

    event.preventDefault();
    event.stopPropagation();

    if (!origin || !this.amazonSearchUrl()) {
      return;
    }

    if (this.popover?.isOpen()) {
      this.openAmazon();
      return;
    }

    this.popover?.show(origin);
  }

  onPopupClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.openAmazon();
  }

  onPopupActivate(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.openAmazon();
  }

  onPopoverShow() {
    setTimeout(() => {
      this.popupActionRef?.nativeElement.focus();
    });
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscape(event: Event) {
    if (!this.popover?.isOpen()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.popover.hide();
  }

  private openAmazon() {
    const url = this.amazonSearchUrl();

    if (!url) {
      return;
    }

    this.popover?.hide();

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
