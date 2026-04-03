import { Component, Input } from '@angular/core';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';
import { TripSharedExpenseDto } from '../../../services/trip-shared-expense-service';

@Component({
  selector: 'app-trip-shared-expense-item-component',
  imports: [AmazonLinkComponent],
  templateUrl: './trip-shared-expense-item-component.html',
  styleUrl: './trip-shared-expense-item-component.scss',
})
export class TripSharedExpenseItemComponent {
  @Input() entity: TripSharedExpenseDto = {} as TripSharedExpenseDto;
  @Input() itemMetaData: { tripCurrencyAbbreviation?: string | null } | null = null;

  get amountText(): string {
    const amount = Number.isInteger(this.entity.amount) ? this.entity.amount.toString() : this.entity.amount.toFixed(2);
    const currency = this.itemMetaData?.tripCurrencyAbbreviation?.trim();
    return currency ? `${currency} ${amount}` : amount;
  }

  get categoryText(): string | null {
    return this.entity.category || null;
  }
}