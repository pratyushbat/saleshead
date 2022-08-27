import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { CLPBilling } from '../../../../models/clpBilling.model';
import { CLPUser } from '../../../../models/clpuser.model';
import { Country, CountryListResponse } from '../../../../models/country.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ZipCodeResponse } from '../../../../models/zip.model';
import { BilligService } from '../../../../services/billing.service';
import { CountryService } from '../../../../services/country.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { ZipService } from '../../../../services/zip.service';

@Component({
    selector: 'account-credit-card',
    templateUrl: './account-credit-card.component.html',
    styleUrls: ['./account-credit-card.component.css']
})

export class AccountCreditCardComponent implements OnInit {
  encryptedUser: string;
  @Input() user: CLPUser;
  @Input() companyIdCredit: number;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  
  creditCardForm = new FormGroup({});
  countryCode: string = 'US';
  creditCardResponse: CLPBilling;
  countryListResponse: CountryListResponse;
  countryList: Country[];
  cLPBilling: CLPBilling = <CLPBilling>{};
  isCreditCard: boolean = false;
  showSpinner: boolean = false;
  sel_brand: string = 'unknown';

  constructor(public _localService: LocalService,
    private _utilityService: UtilityService,
    private notifyService: NotificationService,
    private _billigService: BilligService,
    private _zipService: ZipService,
    public _countryService: CountryService,
    private fb: FormBuilder) {
    this._localService.isMenu = true;
  }
  async getCreditCardInformation() {
    this.showSpinner = true;  
    this.companyIdCredit = (!!this.companyIdCredit && this.companyIdCredit > 0) ? this.companyIdCredit : this.user.cLPCompanyID;
    await this._billigService.CLPBilling_CreditCard_Get(this.encryptedUser, this.companyIdCredit)
      .then(async (result: CLPBilling) => {
        if (result) {
          this.showSpinner = false;
          var result = UtilityService.clone(result);
          this.creditCardResponse = result;
          this.patchFormControlValueCreditCard();
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  loadCreditCardData() {
    if (!isNullOrUndefined(this.user)) {
      if (!isNullOrUndefined(localStorage.getItem("token"))) {
        this.encryptedUser = localStorage.getItem("token");
        this.creditCardForm = this.prepareCreditCardForm();
        this.creditCardForm.reset();
        this.getCreditCardInformation();
        this.initialCountryCode();
      }
    }
  }


  ngOnInit() {  
      this.loadCreditCardData();
  }

  prepareCreditCardForm() {
    return this.fb.group({
      creditCard: [{ value: '' }, [Validators.required, Validators.minLength(14)]],
      cCExDate: [{ value: '' }, [Validators.required, Validators.pattern(/^0[1-9]|^(10)|^(11)|^(12)[0-9][0-9]*$/)]],
      securityCode: [{ value: '' }, [Validators.required, Validators.minLength(3), Validators.pattern(/^[0-9\s]{3,4}$/)]],
      name: [{ value: '' }, [Validators.required]],
      billingAddress: [{ value: '' }, [Validators.required]],
      address2: [{ value: '' }, [Validators.required]],
      city: [{ value: '' }, [Validators.required]],
      state: [{ value: '' }, [Validators.required]],
      zip: [{ value: '' }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]{3,10}$/), Validators.max(2147483647)]],
      country: [{ value: '' }, [Validators.required]],
    });
  }

  async initialCountryCode() {
    this._countryService.loadIpApi()
      .subscribe(
        (res: any) => {
          if (res) {
            this.countryCode = res.countrycode;
            this.loadCountries();
          }
          else
            console.log('account-setup-component.initialCountryCode', '[ENV] account-setup-component.initialCountryCode null response socid: ');
        },
        (error) => {
          this._utilityService.handleErrorResponse(error);
        }
      );
  }
  loadCountries() {
    this._countryService.getCountryList()
      .then((response: CountryListResponse) => {
        this.countryListResponse = UtilityService.clone(response);
        this.countryList = UtilityService.clone(this.countryListResponse.countries);
        this.countryList.map(val => {
          val.code2Lower = val.code2.toLowerCase();
        });
        var cObj = this.countryList.find(i => i.code2 == this.countryCode);
       /* if (!isNullOrUndefined(this.accountInformation) && (this.accountInformation.country == null || !this.accountInformation.country))
          this.accountInfoForm.controls.country.setValue(cObj.code2);*/
        if (!isNullOrUndefined(this.creditCardResponse) && (this.creditCardResponse.country == null || !this.creditCardResponse.country))
          this.creditCardForm.controls.country.setValue(cObj.code2);
      },
        (error) => {
          this._utilityService.handleErrorResponse(error);
        }
      );
  }
  patchFormControlValueCreditCard() {
    if (this.creditCardForm.get('creditCard'))
      this.creditCardForm.get('creditCard').setValue(this.creditCardResponse?.cCNumber);
    if (this.creditCardForm.get('securityCode'))
      this.creditCardForm.get('securityCode').setValue(this.creditCardResponse?.cCCid);
    if (this.creditCardForm.get('name'))
      this.creditCardForm.get('name').setValue(this.creditCardResponse?.cCName);
    if (this.creditCardForm.get('billingAddress'))
      this.creditCardForm.get('billingAddress').setValue(this.creditCardResponse?.add1);
    if (this.creditCardForm.get('address2'))
      this.creditCardForm.get('address2').setValue(this.creditCardResponse?.add2);
    if (this.creditCardForm.get('city'))
      this.creditCardForm.get('city').setValue(this.creditCardResponse?.city);
    if (this.creditCardForm.get('state'))
      this.creditCardForm.get('state').setValue(this.creditCardResponse?.state);
    if (this.creditCardForm.get('zip'))
      this.creditCardForm.get('zip').setValue(this.creditCardResponse?.zip);
    if (this.creditCardForm.get('country'))
      this.creditCardForm.get('country').setValue(this.creditCardResponse?.country);

    if (!isNullOrUndefined(this.creditCardResponse.cCExMonth) && !isNullOrUndefined(this.creditCardResponse.cCExYear) && this.creditCardResponse.cCExMonth > 0 && this.creditCardResponse.cCExYear > 0) {
      var cc = this.creditCardResponse.cCExMonth + '' + this.creditCardResponse.cCExYear;
      if (cc.length == 3)
        cc = '0' + this.creditCardResponse.cCExMonth + '' + this.creditCardResponse.cCExYear;
      else if (cc.length == 2)
        cc = '0' + this.creditCardResponse.cCExMonth + '0' + this.creditCardResponse.cCExYear;

      if (this.creditCardForm.get('cCExDate'))
        this.creditCardForm.get('cCExDate').setValue(cc);
    }
    else
      console.log('Month or Year is Null')
    this.cc_brand_id();
  }

  copyCreditFormValueToData() {
    var ccDate = this.creditCardForm.controls.cCExDate?.value;
    var cCExMonth: number = 0;
    var cCExYear: number = 0;
    if (ccDate) {
      cCExMonth = Number(ccDate.substring(0, 2));
      cCExYear = Number(ccDate.substring(2, 4));
    }
    this.cLPBilling = <CLPBilling>{
      cLPCompanyID: this.companyIdCredit,
      cLPUserID: this.user.cLPUserID,
      cCNumber: this.creditCardForm.controls.creditCard.value,
      cCExMonth: cCExMonth,
      cCExYear: cCExYear,
      cCCid: this.creditCardForm.controls.securityCode.value,
      cCName: this.creditCardForm.controls.name.value,
      add1: this.creditCardForm.controls.billingAddress.value,
      add2: this.creditCardForm.controls.address2.value,
      city: this.creditCardForm.controls.city.value,
      state: this.creditCardForm.controls.state.value,
      zip: this.creditCardForm.controls.zip.value,
      country: this.creditCardForm.controls.country.value,
      dtContractExpire: new Date(),
      dtNextBillDate: new Date(),
      dtPromoExpire: new Date()
    };
  }
  get creditCardFrm() {
    return this.creditCardForm.controls;
  }

  onResetCredit() {
    this.creditCardForm.reset();
    this.creditCardForm.markAsPristine();
    this.getCreditCardInformation();
  }



  creditCardFormSubmit() {
    if (this.creditCardForm.status == "INVALID") {
      this.creditCardForm.markAllAsTouched();
      return;
    }
    else {
      this._localService.validateAllFormFields(this.creditCardForm);
      if (this.creditCardForm.valid) {
        this.creditCardForm.markAsPristine();
        //Call API here
        this.isCreditCard = true;
        this.copyCreditFormValueToData();
        this.showSpinner = true;
        this._billigService.CLPBilling_CreditCard_Create(this.encryptedUser, this.cLPBilling)
          .then(async (result: SimpleResponse) => {
            if (result) {
              this.showSpinner = false;
              var result = UtilityService.clone(result);
              this.notifyService.showSuccess("Card information saved successfully", "", 3000);
              this.isCreditCard = false;
            }
            else {
              this.showSpinner = false;
              this.isCreditCard = false;
            }

          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this.isCreditCard = false;
            this.showSpinner = false;
            this._utilityService.handleErrorResponse(err);
          });
        this.creditCardForm.controls.creditCard.setValidators([Validators.required, Validators.minLength(14)]);
      }
      else
        console.log("Invalid form", this.creditCardForm);
    }
   
 
  }

  cc_brand_id(e?) {
    var jcb_regex = new RegExp('^(?:2131|1800|35)[0-9]{0,}$');
    var amex_regex = new RegExp('^3[47][0-9]{0,}$'); //34, 37
    var diners_regex = new RegExp('^3(?:0[0-59]{1}|[689])[0-9]{0,}$');
    var visa_regex = new RegExp('^4[0-9]{0,}$'); //4
    var mastercard_regex = new RegExp('^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)[0-9]{0,}$');
    var maestro_regex = new RegExp('^(5[06789]|6)[0-9]{0,}$');
    var discover_regex = new RegExp('^(6011|65|64[4-9]|62212[6-9]|6221[3-9]|622[2-8]|6229[01]|62292[0-5])[0-9]{0,}$');
    if (this.creditCardForm.controls.creditCard)
      var cur_val = this.creditCardForm.controls.creditCard.value ? this.creditCardForm.controls.creditCard.value : '';
    cur_val = cur_val.replace(/\D/g, '');
    var sel_brand = "unknown";
    if (cur_val.match(jcb_regex)) {
      sel_brand = "jcb";
    } else if (cur_val.match(amex_regex)) {
      sel_brand = "amex";
    } else if (cur_val.match(diners_regex)) {
      sel_brand = "diners-club";
    } else if (cur_val.match(visa_regex)) {
      sel_brand = "visa";
    } else if (cur_val.match(mastercard_regex)) {
      sel_brand = "mastercard";
    } else if (cur_val.match(discover_regex)) {
      sel_brand = "discover";
    } else if (cur_val.match(maestro_regex)) {
      if (cur_val[0] == '5') {
        sel_brand = "mastercard";
      } else {
        sel_brand = "stripe";
      }
    }
    this.sel_brand = sel_brand;
  }

  creditCardExp() {
    if (this.creditCardForm.controls['cCExDate'].errors?.required)
      return;
    var ccDate = this.creditCardForm.controls.cCExDate?.value;
    var ccMonth = ccDate.slice(0, 2);
    var ccYear = ccDate.slice(-2);
    var currentMonth = new Date().getMonth() + 1;
    var currentYear = new Date().getFullYear();
    var SplitCurrentYear = currentYear.toString().slice(-2);
    var cMonth;
     currentMonth < 10? cMonth = 0 + currentMonth.toString(): cMonth = currentMonth.toString();

    if ((ccMonth < cMonth.toString() && ccYear == SplitCurrentYear) || (ccYear < SplitCurrentYear)) {
      this.creditCardForm.controls['cCExDate'].setErrors({ incorrect: true, message: 'Invalid Expiry Date' });
      return;
    }
  }


  getCityState(e, formName) {
    var zipCode: any;
    zipCode = this.creditCardForm.controls.zip.value;
    if (zipCode && zipCode.length >= 3) {
      this.showSpinner = true;
      this._zipService.zip_Get(this.encryptedUser, zipCode)
        .then(async (result: ZipCodeResponse) => {
          if (result) {
            this.showSpinner = false;
            var result = UtilityService.clone(result);
            var zipCode = result.zipCode;
            switch (formName) {
              case 'creditCard':
                zipCode && zipCode.city ? this.creditCardForm.get('city').setValue(zipCode.city) : null;
                zipCode && zipCode.state ? this.creditCardForm.get('state').setValue(zipCode.state) : null;
                break;
              default: break;
            }
          }
          this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
  }
  changeCountry($event) {
  }

}
