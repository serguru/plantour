import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentService } from '../../../services/component-service';
import { UsersService } from '../../../services/users-service';
import { mapStatusToClass } from '../../../helpers/utils';
import { AmazonLinkComponent } from '../../amazon-link/amazon-link-component';
import { TripSharedExpenseDto } from '../../../services/trip-shared-expense-service';

@Component({
  selector: 'app-trip-shared-expense-item-component',
  imports: [Select, FormsModule, Checkbox, AmazonLinkComponent],
  templateUrl: './trip-shared-expense-item-component.html',
  styleUrl: './trip-shared-expense-item-component.scss',
})
export class TripSharedExpenseItemComponent {
  @Input() entity: TripSharedExpenseDto = {} as TripSharedExpenseDto;
  @Input() itemMetaData: any | null = null;

  usersService = inject(UsersService);
  isAdminSignal = this.usersService.isAdminSignal;

  componentService = inject(ComponentService);
  targetCondition = toSignal(this.componentService.targetCondition$, { initialValue: null });

  get statusToClassMap() {
    return mapStatusToClass(this.entity.assignmentStatus || null);
  }

  get amountText(): string {
    const effectiveCurrency = this.entity.effectiveCurrency || '';
    const source = `${this.entity.amount} ${effectiveCurrency}`.trim();
    const converted = this.entity.amountInTripCurrency != null ? ` (${this.entity.amountInTripCurrency} trip currency)` : '';
    return `${source}${converted}`;
  }

  handleAcceptedClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.itemMetaData.toggleAccept(this.entity);
  }

  handleRejectedClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.itemMetaData.toggleReject(this.entity);
  }

  onAssigneeChange(id: string | null) {
    if (!this.isAdminSignal()) {
      return;
    }
    if (!this.itemMetaData?.assignOrUnassign) {
      return;
    }
    this.itemMetaData.assignOrUnassign(this.entity, id, true);
  }

  onAssigneeClick(event: Event) {
    event.stopPropagation();
  }
}