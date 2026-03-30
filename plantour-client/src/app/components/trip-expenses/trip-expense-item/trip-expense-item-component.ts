import { Component, Input } from '@angular/core';
import { formatDate, mapStatusToClass } from '../../../helpers/utils';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';
import { TripExpenseDto } from '../../../services/trip-expense-service';

@Component({
  selector: 'app-trip-expense-item-component',
  imports: [AmazonLinkComponent],
  templateUrl: './trip-expense-item-component.html',
  styleUrl: './trip-expense-item-component.scss',
})
export class TripExpenseItemComponent {
  @Input() entity: TripExpenseDto = {} as TripExpenseDto;
  @Input() itemMetaData: any | null = null;

  get statusToClassMap() {
    return mapStatusToClass(this.entity.assignmentStatus || null);
  }

  get amountText(): string {
    const effectiveCurrency = this.entity.effectiveCurrency || '';
    const source = `${this.entity.amount} ${effectiveCurrency}`.trim();
    const converted = this.entity.amountInTripCurrency !== this.entity.amount || this.entity.currencyId
      ? ` (${this.entity.amountInTripCurrency} trip currency)`
      : '';
    return `${source}${converted}`;
  }

  get secondaryText(): string | null {
    const values = [this.entity.paymentMethod, this.entity.recipientFullName].filter(Boolean);
    return values.length > 0 ? values.join(' · ') : null;
  }

  get assignmentDateText(): string | null {
    return this.entity.assignedAt ? `Assigned ${formatDate(this.entity.assignedAt)}` : null;
  }
}