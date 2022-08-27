import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isNullOrUndefined } from 'util';

import { NotificationService } from '../../../services/notification.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { UserService } from '../../../services/user.service';
import { SignupService } from '../../../services/signup.service';
import { BilligService } from '../../../services/billing.service';
import { TxtMsgService } from '../../../services/textmsg.service';

import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { CLPAddOnBilling, CLPAddOnBillingShow } from '../../../models/clpBilling.model';
import { TxtMsgSettings, TxtMsgSettingsResponse, Status } from '../../../models/txtMsg.model';
import { EmailTemplate } from '../../../models/emailTemplate.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { keyValue } from '../../../models/search.model';

@Component({
  selector: 'text-msg-setting',
  templateUrl: './text-msg-setting.component.html',
  styleUrls: ['./text-msg-setting.component.css']
})
export class TextMsgSettingComponent {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() userId: number = 0;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  cLPCompanyID: number;
  clpAddPnBillingForm = new FormGroup({});
  txtMsgSettingForm = new FormGroup({});
  userResponse: UserResponse;
  showSpinner: boolean;
  public clpAddOnBillingData: CLPAddOnBilling
  public txtMsgSettingsDataResponse: TxtMsgSettingsResponse;
  public txtMsgSettingsData: TxtMsgSettings
  public emailTemplateData: EmailTemplate[];
  public userList: keyValue[];
  _status: string = "Active";
  setStatusValue: number;
  arrStatus: any[] = [{ value: 0, name: "Disabled" },
  { value: 1, name: "Active" },
  { value: 2, name: "Waiting To Be Configured" }];
  fullName: string;
  submitBtnAddOnBilling: boolean = true;
  submitTxtMsgSetting: boolean = true;
  editShow: boolean = false;
  edit2Show: boolean = false;
  toggleButton: boolean = false;
  toggle2Button: boolean = false;

  textColor = "red";
  constructor(private fb: FormBuilder, private userSvc: UserService, public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, private _notifyService: NotificationService, public _signupService: SignupService,
    private _billingService: BilligService, private _txtMsgSettingSrvc: TxtMsgService, private httpService: HttpClient) {
    this._localService.isMenu = true;
  }

  editData() {
    this.editShow = !this.editShow;
  }
  editPricingData() {
    this.edit2Show = !this.edit2Show;
  }

  toggle() {
    this.toggle2Button = !this.toggle2Button;
  }

  loadMessageSettings() {
    this.clpAddPnBillingForm = this.prepareClpAddOnBillinggForm();
    this.clpAddPnBillingForm.reset();
    this.txtMsgSettingForm = this.prepareTxtMsgSettingForm();
    this.txtMsgSettingForm.reset();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          /*     this.fullName = this.user.lastName + ' '.repeat(1) + this.user.firstName*/
          this.getClpAddOnBillingData();
          this.getTxtMsgSettingFormData();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }



  ngOnInit() {
    this.loadMessageSettings();
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.TextMessageSettings)
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
              this.showSpinner = false;
            }
          }
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async getClpAddOnBillingData() {
    this.showSpinner = true;
    await this._billingService.clpAddOnBilling_Load(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: CLPAddOnBilling) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.clpAddOnBillingData = response;
          this.patchClpAddOnBillingFormValue();
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

  patchClpAddOnBillingFormValue() {
    var clpAddOnBillingData = this.clpAddOnBillingData;
    for (let key in clpAddOnBillingData) {
      let value = clpAddOnBillingData[key];
      this.preparePatchFormControlValue(key, value);
    }
  }

  preparePatchFormControlValue(key, value) {
    if (this.clpAddPnBillingForm.get(key)) {
      if (value?.substring(0, 1) == "$") {
        value = value?.substring(1);
      }
      this.clpAddPnBillingForm.get(key).setValue(value);
    }
  }

  prepareClpAddOnBillinggForm() {
    return this.fb.group({
      perShortCodeTxtMsgPrice: [{ value: '' }],
      perLongCodeTxtMsgPrice: [{ value: '' }],
      perVoiceDropPrice: [{ value: '' }],
      perLineLongCode: [{ value: '' }],
      perLineCallForwarding: [{ value: '' }],
      perLIneVoiceDrop: [{ value: '' }],
      perLIneClickToCall: [{ value: '' }],
      perLIneKMLMapCreation: [{ value: '' }],
      perLIneVCR: [{ value: '' }],
      perLongCodeMMSTxtMsgPrice: [{ value: '' }],
      perUserAlertTxtMsgPrice: [{ value: '' }],
      perLineVIP: [{ value: '' }],
      perLineVirtualPhoneNumber: [{ value: '' }]
    });
  }

  copyeClpAddOnBillingFormValueToData() {
    this.clpAddOnBillingData.cLPCompanyID = this.user.cLPCompanyID;
    this.clpAddOnBillingData.perShortCodeTxtMsgPrice = (this.clpAddPnBillingForm.controls.perShortCodeTxtMsgPrice.value);
    this.clpAddOnBillingData.perLongCodeTxtMsgPrice = (this.clpAddPnBillingForm.controls.perLongCodeTxtMsgPrice.value);
    this.clpAddOnBillingData.perVoiceDropPrice = (this.clpAddPnBillingForm.controls.perVoiceDropPrice.value);
    this.clpAddOnBillingData.perLineLongCode = (this.clpAddPnBillingForm.controls.perLineLongCode.value);
    this.clpAddOnBillingData.perLineCallForwarding = (this.clpAddPnBillingForm.controls.perLineCallForwarding.value);
    this.clpAddOnBillingData.perLIneVoiceDrop = (this.clpAddPnBillingForm.controls.perLIneVoiceDrop.value);
    this.clpAddOnBillingData.perLIneClickToCall = (this.clpAddPnBillingForm.controls.perLIneClickToCall.value);
    this.clpAddOnBillingData.perLIneKMLMapCreation = (this.clpAddPnBillingForm.controls.perLIneKMLMapCreation.value);
    this.clpAddOnBillingData.perLIneVCR = (this.clpAddPnBillingForm.controls.perLIneVCR.value);
    this.clpAddOnBillingData.perLongCodeMMSTxtMsgPrice = (this.clpAddPnBillingForm.controls.perLongCodeMMSTxtMsgPrice.value);
    this.clpAddOnBillingData.perUserAlertTxtMsgPrice = (this.clpAddPnBillingForm.controls.perUserAlertTxtMsgPrice.value);
    this.clpAddOnBillingData.perLineVIP = (this.clpAddPnBillingForm.controls.perLineVIP.value);
    this.clpAddOnBillingData.perLineVirtualPhoneNumber = (this.clpAddPnBillingForm.controls.perLineVirtualPhoneNumber.value);
  }

  clpAddOnBillingFormSubmit() {
    this.showSpinner = true;
    this.submitBtnAddOnBilling = false;
    this.copyeClpAddOnBillingFormValueToData();
    this._billingService.clpAddOnBilling_Update(this.encryptedUser, this.clpAddOnBillingData)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Data updated Successfully.", "", 3000);
          this.getClpAddOnBillingData();
          this.submitBtnAddOnBilling = true;
          this.showSpinner = false;
          this.edit2Show = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });

  }

  onResetAddOnBillingForm() {
    this.getClpAddOnBillingData();
  }

  async getTxtMsgSettingFormData() {
    this.showSpinner = true;
    var companyId = this.userId != 0 ? this.userId : this.user.cLPCompanyID;
    await this._txtMsgSettingSrvc.txtMsgSettings_Load(this.encryptedUser, companyId, this.user.cLPUserID)
      .then(async (result: TxtMsgSettingsResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.txtMsgSettingsDataResponse = response;
          this.txtMsgSettingsData = response.txtMsgSettings;
          this.emailTemplateData = response.emailTemplates;
          this.userList = response.filterUser
          this.setStatusValue = this.txtMsgSettingsData.status;
          this.setStatus();
          this.patchTxtMsgSettingFormValue();
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

  patchTxtMsgSettingFormValue() {
    var txtMsgSettingsData = this.txtMsgSettingsData;
    for (let key in txtMsgSettingsData) {
      let value = txtMsgSettingsData[key];
      this.preparePatchTextMsgFormControlValue(key, value);
    }
  }

  preparePatchTextMsgFormControlValue(key, value) {
    if (this.txtMsgSettingForm.get(key))
      this.txtMsgSettingForm.get(key).setValue(value);
  }

  prepareTxtMsgSettingForm() {
    return this.fb.group({
      cLPCompanyID: [{ value: 0 }],
      cLPUserID: [{ value: '' }],
      aPIKey: [{ value: '' }],
      optInKeyword: [{ value: '' }],
      status: [{ value: '' }],
      isAllowFreeForm: [{ value: '' }],
      isShowContactIcon: [{ value: '' }],
      isEnableTxtBlast: [{ value: '' }],
      optInEmailTemplateID: [{ value: '' }],
      dtCreated: [{ value: '' }],
      tollFreeLongCode: [{ value: '' }],
      bWAPIVersion: [{ value: '' }],
      voiceAPIKey: [{ value: '' }],
      orgName: [{ value: '' }],
      supportNumber: [{ value: '' }],
      linkTC: [{ value: '' }],
      isEnableVoiceDropCampaign: [{ value: '' }]
    });
  }

  copyTextMsgFormValueToData() {
    this.txtMsgSettingsData.cLPCompanyID = this.userId != 0 ? this.userId : this.user.cLPCompanyID;
    if (this.roleFeaturePermissions?.isSuperAdmin)
      this.txtMsgSettingsData.cLPUserID = this.txtMsgSettingForm.controls.cLPUserID.value;
    else
      this.txtMsgSettingsData.cLPUserID = this.user.cLPUserID;

    this.txtMsgSettingsData.aPIKey = this.txtMsgSettingForm.controls.aPIKey.value;
    this.txtMsgSettingsData.optInKeyword = this.txtMsgSettingForm.controls.optInKeyword.value;
    this.txtMsgSettingsData.status = parseInt(this.txtMsgSettingForm.controls.status.value);
    this.txtMsgSettingsData.isAllowFreeForm = this.txtMsgSettingForm.controls.isAllowFreeForm.value;
    this.txtMsgSettingsData.isShowContactIcon = this.txtMsgSettingForm.controls.isShowContactIcon.value;
    this.txtMsgSettingsData.isEnableTxtBlast = this.txtMsgSettingForm.controls.isEnableTxtBlast.value;
    this.txtMsgSettingsData.optInEmailTemplateID = this.txtMsgSettingForm.controls.optInEmailTemplateID.value;
    this.txtMsgSettingsData.tollFreeLongCode = this.txtMsgSettingForm.controls.tollFreeLongCode.value;
    this.txtMsgSettingsData.bWAPIVersion = this.txtMsgSettingForm.controls.bWAPIVersion.value;
    this.txtMsgSettingsData.voiceAPIKey = this.txtMsgSettingForm.controls.voiceAPIKey.value;
    this.txtMsgSettingsData.orgName = this.txtMsgSettingForm.controls.orgName.value;
    this.txtMsgSettingsData.supportNumber = this.txtMsgSettingForm.controls.supportNumber.value;
    this.txtMsgSettingsData.linkTC = this.txtMsgSettingForm.controls.linkTC.value;
    this.txtMsgSettingsData.isEnableVoiceDropCampaign = this.txtMsgSettingForm.controls.isEnableVoiceDropCampaign.value;
  }

  txtMsgSettingFormSubmit() {
    this.showSpinner = true;
    this.submitTxtMsgSetting = false;
    this.copyTextMsgFormValueToData();
    this._txtMsgSettingSrvc.txtMsgSettings_Save(this.encryptedUser, this.txtMsgSettingsData)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Data updated Successfully.", "", 3000);
          this.getTxtMsgSettingFormData();
          this.editShow = false;
          this.submitTxtMsgSetting = true;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });

  }

  textMsgDelete() {
    if (this.user?.cLPCompanyID > 0) {
      if (this.user?.userRole >= 5) {
        this.showSpinner = true;
        this._txtMsgSettingSrvc.textMsgSettingDelete(this.encryptedUser, this.user.cLPCompanyID)
          .then(async (result: SimpleResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              this._notifyService.showSuccess(response.messageString ? response.messageString : "Data Deleted Successfully.", "", 3000);
              this.getTxtMsgSettingFormData();
              this.editShow = false;
              this.submitTxtMsgSetting = true;
              this.showSpinner = false;
            }
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this._utilityService.handleErrorResponse(err);
            this.showSpinner = false;
          });
      }
    }
  }

  setStatus() {
    switch (this.setStatusValue) {
      case 0: this._status = "Disabled"; break;
      case 1: this._status = "Active"; break;
      case 2: this._status = "Waiting to be configured"; break;
      default: break;
    }
  }

  changeStatus(e) {
    this.setStatusValue = parseInt(e.target.value);
    this.setStatus();
  }

  onResetTxtMsgSettingForm() {
    this.getTxtMsgSettingFormData();
  }

  getTemplateName(tempId) {
    var temp = this.emailTemplateData?.filter(e => e.emailTemplateID == tempId)
    return temp[0]?.templateName;
  }

  getResUser(userId) {
    var res = this.userList?.filter(e => e.key == userId)
    return res[0].value
  }

  backToView() {
    this.editShow = false;
  }
  backToView2() {
    this.edit2Show = false;
  }
}
