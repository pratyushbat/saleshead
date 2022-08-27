import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { AccountInformation, AccountInformationRespone } from '../../../../models/accountInformation.model';
import { CLPUser, SFAResponse } from '../../../../models/clpuser.model';
import { Country, CountryListResponse } from '../../../../models/country.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ZipCodeResponse } from '../../../../models/zip.model';
import { BilligService } from '../../../../services/billing.service';
import { ContactService } from '../../../../services/contact.service';
import { CountryService } from '../../../../services/country.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { ZipService } from '../../../../services/zip.service';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { keyValue } from '../../../../models/search.model';

@Component({
  selector: 'account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css']
})
export class AccountInfoComponent implements OnInit {
  @Input() user: CLPUser;
  @Input() companyId: number;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  encryptedUser: string;
  userList: keyValue[];
  accountInfoForm = new FormGroup({});
  accountInformation: AccountInformation;
  sFAResponse: SFAResponse;
  showSpinner: boolean = false;
  creditCardName: string;
  creditCardNumber: string;
  creditCardExMonth: number;
  creditCardExYear: number;
  companyModuleValue: boolean;
  countryCode: string = 'US';
  countryListResponse: CountryListResponse;
  countryList: Country[];
  public total: any;
  public datePickerformat = "yyyy-MM-ddTHH:mm:ss";
  userToName: string;
  isInit: boolean = false;
  constructor(private fb: FormBuilder,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private notifyService: NotificationService,
    private _zipService: ZipService,
    public _countryService: CountryService,
    public _contactService: ContactService,
    private _billigService: BilligService,
    public router: Router,
    public _accountSetupService: AccountSetupService,
  ) {

  }

 async loadAccountDetails() {
    if (!isNullOrUndefined(this.user)) {
      if (!isNullOrUndefined(localStorage.getItem("token")))
        this.encryptedUser = localStorage.getItem("token");
      this.companyId = (!!this.companyId && this.companyId > 0) ? this.companyId : this.user.cLPCompanyID;
      this.accountInfoForm.reset();
      this.accountInfoForm = this.prepareAccountInfoForm();
      this.accountInfoForm.reset();
      await this.getAccountInformation();
      this.getloadUsers();
      this.isInit = true;
    }
  }


  ngOnInit() {
      this.loadAccountDetails();
  }

  prepareAccountInfoForm() {
    return this.fb.group({
      cLPCompanyID: [{ value: 0 }],
      companyName: [{ value: '' }, [Validators.required]],
      add1: [{ value: '' }, [Validators.required]],
      add2: [{ value: '' }],
      city: [{ value: '' }, [Validators.required]],
      state: [{ value: '' }, [Validators.required]],
      zip: [{ value: '' }, [Validators.required, Validators.max(2147483647)]],
      country: [{ value: '' }],
      companyURL: [{ value: '' }],
      logoURL: [{ value: '' }],

      feeSetup: [{ value: '' }],
      supportCredit: [{ value: '' }],
      feeSupportHour: [{ value: '' }],
      feeUser: [{ value: '' }],
      dtPromoExpire: [{ value: '' }],
      discountUser: [{ value: '' }],
      dtContractExpire: [{ value: '' }],
      dtNextBillDate: [{ value: '' }],
      feeCompany: [{ value: '' }],
      additionalContactsIncrements: [{ value: '' }],
      isOnPromo: [{ value: '' }],
      feeAdditionalContacts: [{ value: '' }],
      cLPVARID: [{ value: '' }],
      comments: [{ value: '' }],
      contract: [{ value: '' }],
      billingName: [{ value: '' }],
      status: [{ value: '' }],
      cLPUserID: [{ value: '' }],

      isMobileIncluded: [{ value: '' }],
      isSFAIncluded: [{ value: '' }],
      isHTMLEmailIncluded: [{ value: '' }],
      isOutlookIncluded: [{ value: '' }],
      isBrandingIncluded: [{ value: '' }],
      enableMoreFields: [{ value: '' }],
      enableCLPSS: [{ value: '' }],
      isMultipleFromAddresses: [{ value: '' }],
      isEmailValidation: [{ value: '' }],
      useCompanyModule: [{ value: '' }],
      blnLogSkypeCalls: [{ value: '' }],
      blnMailingFromType: [{ value: '' }],
      blnEnableiPhone: [{ value: '' }],
      isProjectModuleInstalled: [{ value: '' }],
      maxEblast: [{ value: '' }],
      maxContacts: [{ value: '' }],
      isSOCRM: [{ value: '' }],
      isSODigital: [{ value: '' }],
      isSOProServ: [{ value: '' }],
    });
  }

  async getAccountInformation() {
    this.showSpinner = true;
    await this._billigService.accountInformation_Get(this.encryptedUser, this.companyId)
      .then(async (result: AccountInformation) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.accountInformation = result;
          this.patchFormControlValue();
          await this.initialCountryCode();
          this.getPayment();
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getloadUsers() {
    await this._accountSetupService.loadUsers(this.encryptedUser, this.companyId)
      .then(async (result: SFAResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.userList = response.filterUser;
          if (typeof (this.userList?.filter(i => i.key == this.accountInfoForm.controls.cLPUserID.value)[0]) != 'undefined') 
              this.userToName = this.userList?.filter(i => i.key == this.accountInfoForm.controls.cLPUserID.value)[0].value;          
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  patchFormControlValue() {
    var accountInformation = this.accountInformation;
    this.accountInformation.dtNextBillDate = new Date(this.accountInformation.dtNextBillDate);
    this.accountInformation.dtContractExpire = new Date(this.accountInformation.dtContractExpire);
    this.accountInformation.dtPromoExpire = new Date(this.accountInformation.dtPromoExpire);
    for (let key in accountInformation) {
      let value = accountInformation[key];
      //Set the validation and render the control
      this.preparePatchFormControlValue(key, value);
    }
  }
  getPayment() {
    this.companyModuleValue = this.accountInformation.useCompanyModule;
    this.companyModuleValue = this.accountInformation.useCC;
    this.creditCardName = this.accountInformation.cCName;
    if (!isNullOrUndefined(this.accountInformation.cCNumber))
      this.creditCardNumber = this.accountInformation.cCNumber.slice(-4);
    this.creditCardExMonth = this.accountInformation.cCExMonth;
    this.creditCardExYear = this.accountInformation.cCExYear;
  }

  preparePatchFormControlValue(key, value) {
    if (this.accountInfoForm.get(key)) 
      this.accountInfoForm.get(key).setValue(value);
  }

  accountFormSubmit() {
    this.showSpinner = true;
    this._localService.validateAllFormFields(this.accountInfoForm);
    if (this.accountInfoForm.valid) {
      this.accountInfoForm.markAsPristine();
      this.copyAccountFormValueToData();

      this._billigService.accountInformation_Update(this.encryptedUser, this.accountInformation)
        .then(async (result: SimpleResponse) => {
          if (result) {
            this.showSpinner = false;
            var result = UtilityService.clone(result);
            this.notifyService.showSuccess("Account information saved successfully", "", 3000);
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
    else {
      this.showSpinner = false;
    }

  }

  copyAccountFormValueToData() {
    this.accountInformation.clpCompanyID = this.companyId;
    this.accountInformation.companyName = this.accountInfoForm.controls.companyName.value;
    this.accountInformation.add1 = this.accountInfoForm.controls.add1.value;
    this.accountInformation.add2 = this.accountInfoForm.controls.add2.value;
    this.accountInformation.city = this.accountInfoForm.controls.city.value;
    this.accountInformation.state = this.accountInfoForm.controls.state.value;
    this.accountInformation.zip = this.accountInfoForm.controls.zip.value;
    this.accountInformation.country = this.accountInfoForm.controls.country.value;
    this.accountInformation.companyURL = this.accountInfoForm.controls.companyURL.value;
    this.accountInformation.logoURL = this.accountInfoForm.controls.logoURL.value;

    this.accountInformation.feeSetup = this.accountInfoForm.controls.feeSetup.value;
    this.accountInformation.supportCredit = this.accountInfoForm.controls.supportCredit.value;
    this.accountInformation.feeSupportHour = this.accountInfoForm.controls.feeSupportHour.value;
    this.accountInformation.feeUser = this.accountInfoForm.controls.feeUser.value;
    this.accountInformation.dtPromoExpire = this.accountInfoForm.controls.dtPromoExpire.value;
    this.accountInformation.discountUser = this.accountInfoForm.controls.discountUser.value;
    this.accountInformation.dtContractExpire = this.accountInfoForm.controls.dtContractExpire.value;
    this.accountInformation.dtNextBillDate = this.accountInfoForm.controls.dtNextBillDate.value;
    this.accountInformation.feeCompany = this.accountInfoForm.controls.feeCompany.value;
    this.accountInformation.additionalContactsIncrements = this.accountInfoForm.controls.additionalContactsIncrements.value;
    this.accountInformation.isOnPromo = this.accountInfoForm.controls.isOnPromo.value;
    this.accountInformation.feeAdditionalContacts = this.accountInfoForm.controls.feeAdditionalContacts.value;
    this.accountInformation.cLPVARID = this.accountInfoForm.controls.cLPVARID.value;
    this.accountInformation.comments = this.accountInfoForm.controls.comments.value;
    this.accountInformation.contract = this.accountInfoForm.controls.contract.value;
    this.accountInformation.billingName = this.accountInfoForm.controls.billingName.value;
    this.accountInformation.status = this.accountInfoForm.controls.status.value;
    this.accountInformation.cLPUserID = this.accountInfoForm.controls.cLPUserID.value;
    this.accountInformation.isMobileIncluded = this.accountInfoForm.controls.isMobileIncluded.value;
    this.accountInformation.isSFAIncluded = this.accountInfoForm.controls.isSFAIncluded.value;
    this.accountInformation.isHTMLEmailIncluded = this.accountInfoForm.controls.isHTMLEmailIncluded.value;
    this.accountInformation.isOutlookIncluded = this.accountInfoForm.controls.isOutlookIncluded.value;
    this.accountInformation.isBrandingIncluded = this.accountInfoForm.controls.isBrandingIncluded.value;
    this.accountInformation.enableMoreFields = this.accountInfoForm.controls.enableMoreFields.value;
    this.accountInformation.enableCLPSS = this.accountInfoForm.controls.enableCLPSS.value;
    this.accountInformation.isMultipleFromAddresses = this.accountInfoForm.controls.isMultipleFromAddresses.value;
    this.accountInformation.isEmailValidation = this.accountInfoForm.controls.isEmailValidation.value;
    this.accountInformation.useCompanyModule = this.accountInfoForm.controls.useCompanyModule.value;
    this.accountInformation.blnLogSkypeCalls = this.accountInfoForm.controls.blnLogSkypeCalls.value;
    this.accountInformation.blnMailingFromType = this.accountInfoForm.controls.blnMailingFromType.value;
    this.accountInformation.blnEnableiPhone = this.accountInfoForm.controls.blnEnableiPhone.value;
    this.accountInformation.isProjectModuleInstalled = this.accountInfoForm.controls.isProjectModuleInstalled.value;
    this.accountInformation.maxEblast = this.accountInfoForm.controls.maxEblast.value;
    this.accountInformation.maxContacts = this.accountInfoForm.controls.maxContacts.value;
    this.accountInformation.isSOCRM = this.accountInfoForm.controls.isSOCRM.value;
    this.accountInformation.isSODigital = this.accountInfoForm.controls.isSODigital.value;
    this.accountInformation.isSOProServ = this.accountInfoForm.controls.isSOProServ.value;



  }

  get accountInfoFrm() {
    return this.accountInfoForm.controls;
  }

  onreset() {
    this.getAccountInformation();
  }

  getCityState(e, formName) {
    var zipCode: any;
    zipCode = this.accountInfoForm.controls.zip.value;
    if (zipCode && zipCode.length >= 3) {
      this._zipService.zip_Get(this.encryptedUser, zipCode)
        .then(async (result: ZipCodeResponse) => {
          if (result) {
            var result = UtilityService.clone(result);
            var zipCode = result.zipCode;
            switch (formName) {
              case 'account':
                zipCode && zipCode.city ? this.accountInfoForm.get('city').setValue(zipCode.city) : null;
                zipCode && zipCode.state ? this.accountInfoForm.get('state').setValue(zipCode.state) : null;
                break;
              default: break;
            }
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  async initialCountryCode() {
    this.showSpinner = true;
    this._countryService.loadIpApi()
      .subscribe(
        (res: any) => {
          if (res) {
            this.showSpinner = false;
            this.countryCode = res.countrycode;

            this.loadCountries();
          }
          else {
            console.log('account-setup-component.initialCountryCode', '[ENV] account-setup-component.initialCountryCode null response socid: ');
            this.showSpinner = false;
          }
        },
        (error) => {
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(error);
        }
      );
  }

  loadCountries() {
    this._countryService.getCountryList()
      .then(async (response: CountryListResponse) => {
        if (response) {
          this.countryListResponse = UtilityService.clone(response);
          this.loadCountriesWorking();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  loadCountriesWorking() {
    this.countryList = UtilityService.clone(this.countryListResponse.countries);
    var countryObj = this.countryList?.filter((data) => data.code2 === this.accountInfoForm.get('country').value)[0];
    !isNullOrUndefined(countryObj) ? this.accountInfoForm.get('country').setValue(countryObj.code2) : this.accountInfoForm.get('country').setValue("");

    this.countryList.map(val => {
      val.code2Lower = val.code2.toLowerCase();
    });
    var cObj = this.countryList.find(i => i.code2 == this.countryCode);
    if (!isNullOrUndefined(this.accountInfoForm) && (this.accountInfoForm.get('country').value == null || !this.accountInfoForm.get('country').value))
      this.accountInfoForm.controls.country.setValue(cObj.code2);
  }
}
