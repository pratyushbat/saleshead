import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { CLPUser } from '../../../../models/clpuser.model';
import { HTMLEmailLogGetMonth, HTMLEmailLogGetMonthListResponse, HTMLEmailLogUsageByMonth, HTMLEmailLogUsageByMonthListResponse, HTMLEmailPricing } from '../../../../models/htmlEmailPricing.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { htmlEmailPricingService } from '../../../../services/htmlEmailPricing.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'account-html-email',
    templateUrl: './account-html-email.component.html',
    styleUrls: ['./account-html-email.component.css']
})

export class AccountHtmlEmailComponent implements OnInit {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  showSpinner: boolean = false;
  public htmlEmailLogGetMonths: HTMLEmailLogGetMonth[];
  public htmlEmailLogUsageByMonth: HTMLEmailLogUsageByMonth[];
  mthNmeEml: string;
  selYear: string;
  _mthNmeEml: string;
  mthNme: string;
  hideUserCnt: boolean = true;
  public htmlEmailPricing: HTMLEmailPricing;
  htmlEmailPricingForm = new FormGroup({});
  showSpinnerSendEmail: boolean = false;
  showNewPricing: boolean = true;
  arrEmailChoice: any[] = [{ "value": 1, "name": "per Email" }, { "value": 2, "name": "per Contact" }];

  constructor(private fb: FormBuilder, public _localService: LocalService,private _htmlEmailPricingService: htmlEmailPricingService, private _utilityService: UtilityService, private notifyService: NotificationService) {

  }
  ngOnInit() {
    this.htmlEmailPricingForm = this.prepareHtmlEmailPricingForm();
    this.htmlEmailPricingForm.reset();
    this.htmlEmailLogGetMonthList();
    this.clpHtmlBillingGet().subscribe((value) => null);
  }

  prepareHtmlEmailPricingForm() {
    return this.fb.group({
      cLPCompanyID: [{ value: 0 }],
      emailChoice: [{ value: 0 }],
      tierOver25000: [{ value: 0 }],
      tierUpTo100: [{ value: 0 }],
      tierUpTo1000: [{ value: 0 }],
      tierUpTo2500: [{ value: 0 }],
      tierUpTo5000: [{ value: 0 }],
      tierUpTo10000: [{ value: 0 }],
      tierUpTo25000: [{ value: 0 }]
    });
  }

  copyHtmlEmailPricingFormValueToData() {
    this.htmlEmailPricing.cLPCompanyID = this.user.cLPCompanyID;
    this.htmlEmailPricing.emailChoice = (this.htmlEmailPricingForm.controls.emailChoice.value);
    this.htmlEmailPricing.tierOver25000 = (this.htmlEmailPricingForm.controls.tierOver25000.value);
    this.htmlEmailPricing.tierUpTo100 = (this.htmlEmailPricingForm.controls.tierUpTo100.value);
    this.htmlEmailPricing.tierUpTo1000 = (this.htmlEmailPricingForm.controls.tierUpTo1000.value);
    this.htmlEmailPricing.tierUpTo2500 = (this.htmlEmailPricingForm.controls.tierUpTo2500.value);
    this.htmlEmailPricing.tierUpTo5000 = (this.htmlEmailPricingForm.controls.tierUpTo5000.value);
    this.htmlEmailPricing.tierUpTo10000 = (this.htmlEmailPricingForm.controls.tierUpTo10000.value);
    this.htmlEmailPricing.tierUpTo25000 = (this.htmlEmailPricingForm.controls.tierUpTo25000.value);
  }

  saveNewEmailPricing() {
    this.copyHtmlEmailPricingFormValueToData();
 /*   this.showSpinnerSendEmail = true;*/
    this._htmlEmailPricingService.clpHtmlBillingCreate(this.encryptedUser, this.htmlEmailPricing)
      .then(async (result: HTMLEmailPricing) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.notifyService.showSuccess("Data Saved successfully", "", 3000);
          this.showSpinner = true;
          this.clpHtmlBillingGet().subscribe((value) => this.showSpinner = false);
          this.showNewPricing = true;

    /*      this.showSpinnerSendEmail = false;*/
        }
        /*else*/
        /*  this.showSpinnerSendEmail = false;*/
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  patchHtmlEmailPricingFormValue() {
    var htmlEmailPricing = this.htmlEmailPricing;
    for (let key in htmlEmailPricing) {
      let value = htmlEmailPricing[key];
      this.preparePatchHtmlEmailPricingFormControlValue(key, value);
    }
  }

  preparePatchHtmlEmailPricingFormControlValue(key, value) {
    if (this.htmlEmailPricingForm.get(key))
      this.htmlEmailPricingForm.get(key).setValue(value);
  }

  clpHtmlBillingGet() {
    return new Observable(observer => {
      /*this.showSpinner = true;*/
      this._htmlEmailPricingService.clpHtmlBillingGet(this.encryptedUser, this.user.cLPCompanyID)
        .then(async (result: HTMLEmailPricing) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.htmlEmailPricing = response;
            this.patchHtmlEmailPricingFormValue();
            /*this.showSpinner = false;*/
          }
          else
            this.showSpinner = false;
          observer.next("success");
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
          this.showSpinner = false;
        });
    });
  }

  async soHtmlEmailLogUsageByMonth(dtmth, dtyr) {
    this.showSpinner = true;
    await this._htmlEmailPricingService.htmlEmailLogUsageByMonth(this.encryptedUser, this.user.cLPCompanyID, dtmth, dtyr)
      .then(async (result: HTMLEmailLogUsageByMonthListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.htmlEmailLogUsageByMonth = response.hTMLEmailLogUsageByMonths
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async htmlEmailLogGetMonthList() {
    //this.showSpinner = true;
    await this._htmlEmailPricingService.htmlEmailLogGetMonthList(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: HTMLEmailLogGetMonthListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.htmlEmailLogGetMonths = response.hTMLEmailLogGetMonths
          this.htmlEmailLogGetMonths.forEach(e => {
            e.Mth = moment.monthsShort(e.Mth - 1);
          })
          if (this.htmlEmailLogGetMonths.length > 0) {
            this.setMonth(this.htmlEmailLogGetMonths[0]?.Mth + " " + this.htmlEmailLogGetMonths[0]?.yr);
          }
          
          //this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  setMonth(e) {
    if (e != "0") {
      var mth = e.split(/\s(.+)/)[0];
      this.selYear = e.split(/\s(.+)/)[1];
      var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      mth = mth.toLowerCase();
      mth = months.indexOf(mth);
      this.hideUserCnt = false;
      this.mthNme = moment.months(mth);
      this.mthNmeEml = "for" + ' '.repeat(1) + this.mthNme;
      this._mthNmeEml = "HTML Email Usage for" + ' '.repeat(1) + this.mthNme;
      this.soHtmlEmailLogUsageByMonth(mth + 1, parseInt(this.selYear));
    } else {
      this.mthNmeEml = "";
      this._mthNmeEml = "";
      this.selYear = "";
      this.hideUserCnt = true;;
    }
  }

  getTotal(marks) {
    if (marks != undefined) {
      let total = 0;
      this.htmlEmailLogUsageByMonth.forEach((item) => {
        total += Number(item.cnt);
      });
      return total;
    } else
      return;
  }

  onEdit() {
    this.showNewPricing = false;
  }

  onCancel() {
    this.showNewPricing = true;
  }

}
