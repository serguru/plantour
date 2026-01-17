import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export function allTogetherValidator(controlNames: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    
    const values = controlNames.map(name => formGroup.get(name)?.value);

    const filledCount = values.filter(value => value !== null && value !== undefined && value !== '').length;

    const isValid = filledCount === 0 || filledCount === controlNames.length;

    return isValid ? null : { allTogether: true };
  };
}