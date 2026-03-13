import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { removeMark } from '../../helpers/utils';
import { ThingDto } from '../../services/thing-service';

@Component({
  selector: 'amazon-link',
  imports: [],
  templateUrl: './amazon-link-component.html',
  styleUrl: './amazon-link-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmazonLinkComponent {
  item = input<string | null>(null);
  associateTag = input('plantourclien-20');
  marketplace = input('ca');
  linkText = input<any>('Search on Amazon');

  query = computed(() => {
    const item = this.item();

    if (!item) {
      return '';
    }

    let result = removeMark(item).trim();

    return result;
  });

  amazonSearchUrl = computed(() => {
    const params = new URLSearchParams({ k: this.query() });
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
}
