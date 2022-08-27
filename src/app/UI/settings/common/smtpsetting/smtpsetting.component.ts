import { KeyValue } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../../models/clpuser.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { CLPSMTP, CLPSMTPResponse } from '../../../../models/smtp.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'smtp-setting',
  templateUrl: './smtpsetting.component.html',
  styleUrls: ['./smtpsetting.component.css']
})

export class SmtpsettingComponent implements OnInit {
  @Input() user: CLPUser;
  @Input() companyIdSmtp: number;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  encryptedUser: string;
  showSpinner: boolean = false;
  smtpUserList: KeyValue<number, string>[] = [];
  smtpForm = new FormGroup({});
  smtpFormData: CLPSMTP;
  selectedUser = null;
  smtpEditMode: number = 0;
  cancelEditSmtp: boolean = false;
  smtpSettingresponse: CLPSMTPResponse;
 

  constructor(private _accountSetupService: AccountSetupService, private _notifyService: NotificationService, private fb: FormBuilder, public _localService: LocalService, private _utilityService: UtilityService) {

  }

  loadSmtpSettings() {
    if (!isNullOrUndefined(this.user)) {
      if (!isNullOrUndefined(localStorage.getItem("token"))) {
        this.encryptedUser = localStorage.getItem("token");
        this.getSmtpSettings();
      }
    }
  }



  ngOnInit() {
      this.loadSmtpSettings();
  }

  async getSmtpSettings() {
    this.showSpinner = true;
    this.companyIdSmtp = (!!this.companyIdSmtp && this.companyIdSmtp > 0) ? this.companyIdSmtp : this.user.cLPCompanyID;
    await this._accountSetupService.getClpSMTPList(this.encryptedUser, this.companyIdSmtp, this.user.cLPUserID)
      .then(async (result: CLPSMTPResponse) => {
        if (result) {
          this.smtpSettingresponse = UtilityService.clone(result);
          this.smtpUserList = this.smtpSettingresponse.filterUser;
          this.smtpForm = this.prepareSmtpForm();
          this.smtpForm.reset();
          this.showSpinner = false;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  smtpUserChange(selectUser: number) {
    console.log(selectUser)
    if (!isNullOrUndefined(selectUser) && selectUser > 0) {
      this.selectedUser = selectUser;
      this.smtpEditMode = 1;
      this.createWebFormUser();
    }
  }

  cancelSmtp() {
    this.cancelEditSmtp = true;
    this.selectedUser = null;
    this.smtpEditMode = 0;

  }

  prepareSmtpForm() {
    return this.fb.group({
      cLPUserID: [{ value: '' }],
      username: [{ value: '' }],
      password: [{ value: '' }],
      sMTPPort: [{ value: '' }],
      sMTPAuthenticate: [{ value: '' }],
      useSSL: [{ value: '' }],
      enableCLPSMTP: [{ value: '' }],
      sMTPServer: [{ value: '' }],

    });
  }

  get smtpFormFrm() {
    return this.smtpForm.controls;
  }

  createWebFormUser() {
    this.cancelEditSmtp = false;
    this.smtpForm.enable();
    this.smtpFormData = {
      cLPSMTPID: 0,
      cLPCompanyID: this.user.cLPCompanyID,
      cLPUserID: this.selectedUser ? this.selectedUser : this.user.cLPUserID,
      sMTPServer: '',
      sMTPPort: '25',
      sMTPAuthenticate: '',
      username: '',
      password: '',
      useSSL: false,
      name: '',
      email: '',
      enableCLPSMTP: false

    }
    this.patchSmtpFormValue();
  }

  patchSmtpFormValue() {
    var smtpFormDt = this.smtpFormData;
    for (let key in smtpFormDt) {
      let value = smtpFormDt[key];
      this.preparePatchFormControlValue(key, value);
    }
  }

  preparePatchFormControlValue(key, value) {
    if (this.smtpForm.get(key))
      this.smtpForm.get(key).setValue(value);
  }

  copyValueFromSmtpFormToData() {
    this.smtpFormData.cLPUserID = +this.smtpForm.controls.cLPUserID.value;
    this.smtpFormData.username = this.smtpForm.controls.username.value;
    this.smtpFormData.password = this.smtpForm.controls.password.value;
    this.smtpFormData.sMTPPort = this.smtpForm.controls.sMTPPort.value;
    this.smtpFormData.sMTPAuthenticate = this.smtpForm.controls.sMTPAuthenticate.value;
    this.smtpFormData.useSSL = this.smtpForm.controls.useSSL.value;
    this.smtpFormData.enableCLPSMTP = this.smtpForm.controls.enableCLPSMTP.value;
    this.smtpFormData.sMTPServer = this.smtpForm.controls.sMTPServer.value;
  }

  smtpFormSubmit() {
    this._localService.validateAllFormFields(this.smtpForm);
    if (this.smtpForm.valid) {
      this.smtpForm.markAsPristine();
      this.updateSmtpForm();
    }
    else
      this._notifyService.showError("Invalid Smtp Fields", "", 3000);

  }
  updateSmtpForm() {
    this.copyValueFromSmtpFormToData();
    this.showSpinner = true;
    this._accountSetupService.updateClpSMTP(this.encryptedUser, this.smtpFormData)
      .then(async (result: CLPSMTP) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.showSpinner = false;
          this.selectedUser = null;
          this.smtpEditMode = 2;
          this.smtpForm.disable();
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
}
