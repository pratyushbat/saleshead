import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';

import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { ClpCompany, CompanyResponse } from '../../../models/company.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';

import { AccountSetupService } from '../../../services/accountSetup.service';
import { BilligService } from '../../../services/billing.service';
import { NotificationService } from '../../../services/notification.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';

@Component({
  selector: 'app-company-setup',
  templateUrl: './company-setup.component.html',
  styleUrls: ['./company-setup.component.css']
})
/** company-setup component*/
export class CompanySetupComponent {
  /** company-setup ctor */
  private encryptedUser: string = '';
  user: CLPUser;
  accountInfoForm = new FormGroup({});
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  companyResponse: ClpCompany;

  isAccountInfo: boolean = false;

  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private notifyService: NotificationService,
    private _accountSetupService: AccountSetupService,
    private _billigService: BilligService,
  ) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    this.accountInfoForm = this.prepareAccountInfoForm();
    this.accountInfoForm.reset();

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getAccountInformation();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.CompanySetup)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              if (this.user?.userRole <= eUserRole.Administrator) {
                if (this.roleFeaturePermissions?.view == false)
                  this._router.navigate(['/unauthorized'], { state: { isMenu: true } });
              }
            }
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  prepareAccountInfoForm() {
    return this.fb.group({
      cLPCompanyID: [{ value: 0 }],
      companyName: [{ value: '' }, [Validators.required]],
      companyDesc: [{ value: '' }],
      companyAddress: [{ value: '' }],
      companyURL: [{ value: '' }],
      cLPRole: [{ value: '' }],
      status: [{ value: '' }],
      maxContacts: [{ value: '' }],
      maxEblast: [{ value: '' }],
      shareContacts: [{ value: false }],
      editOtherContacts: [{ value: false }],
      companyStorageLimit: [{ value: '' }],
      userStorageLimit: [{ value: '' }],
      fileSizeLimit: [{ value: '' }],
      attachmentSizeLimit: [{ value: '' }],
      blnLogSkypeCalls: [{ value: false }],
      blnEnableiPhone: [{ value: false }],
      logoURL: [{ value: '' }, [Validators.required]],
      useCompanyModule: [{ value: false }],
      isBrandingIncluded: [{ value: false }],
      isMobileIncluded: [{ value: false }],
      isHTMLEmailIncluded: [{ value: false }],
      isOutlookIncluded: [{ value: false }],
      isMultipleFromAddresses: [{ value: false }],
      enableMoreFields: [{ value: false }],
    });
  }

  async getAccountInformation() {
    await this._accountSetupService.getClpCompany(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CompanyResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.companyResponse = result.company;
          this.patchFormControlValue();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  patchFormControlValue() {
    var companyResponse = this.companyResponse;
    for (let key in companyResponse) {
      let value = companyResponse[key];
      //Set the validation and render the control
      this.preparePatchFormControlValue(key, value);
      //}
    }
  }

  preparePatchFormControlValue(key, value) {
    if (this.accountInfoForm.get(key))
      this.accountInfoForm.get(key).setValue(value);
  }

  accountFormSubmit() {
    this._localService.validateAllFormFields(this.accountInfoForm);
    if (this.accountInfoForm.valid) {
      this.accountInfoForm.markAsPristine();
      this.isAccountInfo = true;
      this.copyAcountFormValueToData();

      this._accountSetupService.CLPCompany_Update(this.encryptedUser, this.companyResponse)
        .then(async (result: CompanyResponse) => {
          if (result) {
            var result = UtilityService.clone(result);
            this.notifyService.showSuccess("Account information saved successfully", "", 3000);
            this.isAccountInfo = false;
          }
          else
            this.isAccountInfo = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.isAccountInfo = false;
          this._utilityService.handleErrorResponse(err);
        });

    }
    else
      return;
  }

  copyAcountFormValueToData() {
    this.companyResponse.companyName = this.accountInfoForm.controls.companyName.value;
    this.companyResponse.companyDesc = this.accountInfoForm.controls.companyDesc.value;
    this.companyResponse.companyAddress = this.accountInfoForm.controls.companyAddress.value;
    this.companyResponse.companyURL = this.accountInfoForm.controls.companyURL.value;
    this.companyResponse.cLPRole = this.accountInfoForm.controls.cLPRole.value;
    this.companyResponse.status = this.accountInfoForm.controls.status.value;
    this.companyResponse.maxContacts = this.accountInfoForm.controls.maxContacts.value;
    this.companyResponse.maxEblast = this.accountInfoForm.controls.maxEblast.value;
    this.companyResponse.shareContacts = this.accountInfoForm.controls.shareContacts.value;
    this.companyResponse.editOtherContacts = this.accountInfoForm.controls.editOtherContacts.value;
    this.companyResponse.companyStorageLimit = this.accountInfoForm.controls.companyStorageLimit.value;
    this.companyResponse.userStorageLimit = this.accountInfoForm.controls.userStorageLimit.value;
    this.companyResponse.fileSizeLimit = this.accountInfoForm.controls.fileSizeLimit.value;
    this.companyResponse.attachmentSizeLimit = this.accountInfoForm.controls.attachmentSizeLimit.value;
    this.companyResponse.blnLogSkypeCalls = this.accountInfoForm.controls.blnLogSkypeCalls.value;
    this.companyResponse.blnEnableiPhone = this.accountInfoForm.controls.blnEnableiPhone.value;
    this.companyResponse.logoURL = this.accountInfoForm.controls.logoURL.value;
    this.companyResponse.useCompanyModule = this.accountInfoForm.controls.useCompanyModule.value;
    this.companyResponse.isBrandingIncluded = this.accountInfoForm.controls.isBrandingIncluded.value;
    this.companyResponse.isMobileIncluded = this.accountInfoForm.controls.isMobileIncluded.value;
    this.companyResponse.isHTMLEmailIncluded = this.accountInfoForm.controls.isHTMLEmailIncluded.value;
    this.companyResponse.isOutlookIncluded = this.accountInfoForm.controls.isOutlookIncluded.value;
    this.companyResponse.isMultipleFromAddresses = this.accountInfoForm.controls.isMultipleFromAddresses.value;
    this.companyResponse.enableMoreFields = this.accountInfoForm.controls.enableMoreFields.value;
  }

  get accountInfoFrm() {
    return this.accountInfoForm.controls;
  }
  onreset() {
    this.getAccountInformation();
  }

}
