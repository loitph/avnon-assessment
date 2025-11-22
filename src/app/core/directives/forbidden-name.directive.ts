import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const validName = nameRe.test(control.value);
    return validName ? null : {forbiddenName: {value: control.value}};
  };
}