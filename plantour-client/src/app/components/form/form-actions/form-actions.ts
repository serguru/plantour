import { Component, input } from '@angular/core';
import { AppButton } from '../../button/button-component';

@Component({
  selector: 'app-form-actions',
  imports: [
    AppButton
  ],
  templateUrl: './form-actions.html',
  styleUrl: './form-actions.scss',
})
export class FormActions {
  onCancel = input<Function | null>(null);
  cancelLabel = input<string>('Cancel');
  cancelIcon = input<string>('times');
  cancelDisabled = input<boolean>(false);
  
  onSubmit = input<Function | null>(null);
  submitLabel = input<string>('Submit');
  submitIcon = input<string>('save');
  submitDisabled = input<boolean>(false);

  isLoading = input<boolean>(false);


  cancelClick(event: Event): void {
    event.preventDefault();
    if (this.onCancel) {
      this.onCancel()!(event);
    }
  }
  submitClick(event: Event): void {
    event.preventDefault();
    if (this.onSubmit) {
      this.onSubmit()!(event);
    }
  }


}
