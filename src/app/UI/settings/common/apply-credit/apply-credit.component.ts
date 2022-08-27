import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPTxn } from '../../../../models/clpTxn.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'app-apply-credit',
    templateUrl: './apply-credit.component.html',
    styleUrls: ['./apply-credit.component.css']
})
/** apply-credit component*/
export class ApplyCreditComponent implements OnInit {
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  /** apply-credit ctor */
  private encryptedUser: string = '';
  applyCreditForm = new FormGroup({});
  currentDate: string = '';
  showSpinner: boolean = false;

  clpTxn: CLPTxn;

  constructor(private fb: FormBuilder,
    public datepipe: DatePipe,
    public _router: Router,
    public _localService: LocalService,
    public _notifyService: NotificationService,
    public _utilityService: UtilityService,
    public _accountSetupService: AccountSetupService,
  ) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.currentDate = this.datepipe.transform(new Date(), 'MM/dd/yyyy HH:MM a');
      this.applyCreditForm = this.prepareApplyCreditForm();
      this.applyCreditForm.reset();
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  prepareApplyCreditForm() {
    return this.fb.group({
      txnDescription: [{ value: '' }],
      txnAmount: [{ value: '' }, [Validators.required]]
    });
  }

  get applyCreditFrm() {
    return this.applyCreditForm.controls;
  }

  applyCreditFormSubmit() {
    this._localService.validateAllFormFields(this.applyCreditForm);
    if (this.applyCreditForm.valid && this._localService.selectedAdminCompanyId >= 0) {
      this.applyCreditForm.markAsPristine();

      this.copyApplyCreditFormValueToDataObject();
      this.showSpinner = true;
      this._accountSetupService.saveCLPTxn(this.encryptedUser, this.clpTxn, this._localService.selectedAdminCompanyId)
        .then(async (result: SimpleResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            if (response.messageBool == false) {
              this._notifyService.showError(response.messageString ? response.messageString : 'Some error occured.', "", 3000);
              return;
            }
            this._notifyService.showSuccess(response.messageString ? response.messageString : "Apply credit transaction saved successfully.", "", 3000);
            this.applyCreditForm.reset();
            this.applyCreditForm.markAsPristine();
            this.applyCreditForm.markAsUntouched();
            this.showSpinner = false;
          }
          else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });

    }
    else
      this._notifyService.showError("Invalid Apply credit transaction Fields.", "", 3000);
  }

  copyApplyCreditFormValueToDataObject() {
    this.clpTxn = <CLPTxn>{};
    this.clpTxn.txnDescription = this.applyCreditForm.controls.txnDescription.value ? this.applyCreditForm.controls.txnDescription.value : '';
    this.clpTxn.txnAmount = this.applyCreditForm.controls.txnAmount.value ? this.applyCreditForm.controls.txnAmount.value : '';
    this.clpTxn.cCApprovalCode = '';
    this.clpTxn.cCTxnID = '';
    this.clpTxn.rawResponse = '';
    this.clpTxn.responseText = '';
  }

}
