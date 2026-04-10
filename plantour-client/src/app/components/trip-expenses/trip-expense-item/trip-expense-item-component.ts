import { Component, Input } from '@angular/core';
import { mapStatusToClass } from '../../../helpers/utils';
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
  @Input() itemMetaData: { assignmentsVisible?: () => boolean; lowerTextVisible?: () => boolean } | null = null;

  get statusToClassMap() {
    return mapStatusToClass(this.entity.assignmentStatus || null);
  }

  get amountText(): string {
    const amount = Number.isInteger(this.entity.amount) ? this.entity.amount.toString() : this.entity.amount.toFixed(2);
    const currency = this.entity.effectiveCurrency?.trim();
    return currency ? `${currency} ${amount}` : amount;
  }

  get secondaryText(): string | null {
    const values = [this.entity.paymentMethod, this.entity.recipientFullName, this.entity.shared ? 'Shared payment' : null].filter(Boolean);
    return values.length > 0 ? values.join(' · ') : null;
  }
}