import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
@Component({
    selector: 'app-contract-signup',
    templateUrl: './contract-signup.component.html',
    styleUrls: ['./contract-signup.component.css']
})
/** contract-signup component*/
export class ContractSignupComponent {
  /** contract-signup ctor */
  public formGroup: FormGroup;
  userSignupForm: FormGroup;
  userSignupFormSetup(): FormGroup {
    return new FormGroup({
      userName: new FormControl('')
    });
  }
  contractSignupForm: FormGroup;
  contractSignupFormSetup(): FormGroup {
    return new FormGroup({
      nameFranchise: new FormControl(''),
      nameSignatory: new FormControl(''),
      titleSignatory: new FormControl(''),
      date: new FormControl(''),
      signCheck: new FormControl('')
    });
  }
    constructor() {

  }

  ngOnInit(): void {
    this.userSignupForm = this.userSignupFormSetup();
    this.contractSignupForm = this.contractSignupFormSetup();
  }

  userSignupFormSubmit() {
    return;
  }

  contractSignupFormSubmit() {
    return;
  }

}
