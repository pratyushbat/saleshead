import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, ChangeDetectorRef, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { APIKey, APIKeyLoadResponse, GenerateKeyResponse, WebFormList } from '../../../../models/accountInformation.model';
import { CLPUser } from '../../../../models/clpuser.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
declare var $: any;

@Component({
    selector: 'app-api-setting',
    templateUrl: './api-setting.component.html',
  styleUrls: ['./api-setting.component.css']
})
/** api-setting component*/
export class ApiSettingComponent implements OnInit, AfterContentChecked {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  apiSettingForm = new FormGroup({});
  apiKeyResponse: APIKeyLoadResponse;
  showSpinner: boolean = false;
  cLPCompanyID: number;
  apiKey: APIKey;
  webFormList: WebFormList;
  isOperationPerformed: boolean = false;
  isConfirm: boolean = false;
  confirmOperation: string = '';
    /** api-setting ctor */
  constructor(private cdRef: ChangeDetectorRef, private fb: FormBuilder, public _localService: LocalService, private _accountSetupService: AccountSetupService, private _utilityService: UtilityService, private _notifyService: NotificationService) {
  }

  ngOnInit(): void {
        this.cLPCompanyID = this._localService.selectedAdminCompanyId
    this.apiSettingForm = this.prepareapiSettingForm();
    this.apiSettingForm.reset();
        this.getApiSetting() 
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  patchapiSettingFormValue() {
    var apiKey = this.apiKey;
    for (let key in apiKey) {
      let value = apiKey[key];
      this.preparePatchFormControlValue(key, value);
    }
  }

  preparePatchFormControlValue(key, value) {
    if (this.apiSettingForm.get(key))
      this.apiSettingForm.get(key).setValue(value);
  }

  prepareapiSettingForm() {
    return this.fb.group({
      clientId: [''],
      clientSecret: [''],
      redirectURI: [''],
      webFormId: ['']
    });
  }

  async getApiSetting() {
    this.showSpinner = true;
    await this._accountSetupService.getApiSetting(this.encryptedUser, this.cLPCompanyID)
      .then(async (result: APIKeyLoadResponse) => {
        if (result) {
          this.apiKeyResponse = UtilityService.clone(result);
          this.apiKey = this.apiKeyResponse.aPIKey[0]
          this.webFormList = this.apiKeyResponse.webFormList
          this.patchapiSettingFormValue();
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

  onEditApiSetting() {
    this.isOperationPerformed = true;
  }

  onDeleteApiSetting() {
    if (!isNullOrUndefined(this.apiSettingForm.get('clientId').value)) {
      this.confirmOperation = 'delete';
      $('#apiSettingModal').modal('show');
    } else {
      this._notifyService.showSuccess("There is no data to delete.", "", 3000);
    }
  }

  apiSettingFormSubmit() {
    this.confirmOperation = 'save';
  }

  onCancelApiSetting() {
    this.isConfirm = false;
    this.isOperationPerformed = false;
    this.apiSettingForm.reset();
    this.getApiSetting();
  }

  async onGenerateKey() {
    this.showSpinner = true;
    await this._accountSetupService.generateApiKey(this.encryptedUser)
      .then(async (result: GenerateKeyResponse) => {
        if (result) {
          var response = UtilityService.clone(result)
          this.apiSettingForm.get('clientId').setValue(response.clientIDKey);
          this.apiSettingForm.get('clientSecret').setValue(response.clientSecretKey);
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

   async onConfirmOperation() {
    switch (this.confirmOperation) {
      case 'delete': {
        this.showSpinner = true;
        await this._accountSetupService.deleteApiKey(this.encryptedUser, this.cLPCompanyID)
          .then(async (result: SimpleResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              this._notifyService.showSuccess(response.messageString ? response.messageString : "Api Setting Deleted Successfully.", "", 3000);
              this.isOperationPerformed = false;
              this.isConfirm = false;
              this.apiSettingForm.reset();
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
        break;
      } default: {
        this.showSpinner = true;
        let apiKey: APIKey = <APIKey>{};
       apiKey.clientId = this.apiSettingForm.controls['clientId'].value;
        apiKey.clientSecret = this.apiSettingForm.controls['clientSecret'].value;
        apiKey.redirectURI = this.apiSettingForm.controls['redirectURI'].value;
        apiKey.webFormId = this.apiSettingForm.controls['webFormId'].value;
        apiKey.cLPCompanyID = this.cLPCompanyID
        await this._accountSetupService.updateApiSetting(this.encryptedUser, apiKey)
          .then(async (result: SimpleResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              this._notifyService.showSuccess(response.messageString ? response.messageString : "Api Setting Saved Successfully.", "", 3000);
              this.isOperationPerformed = false;
              this.isConfirm = false;
              this.getApiSetting();
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
        break;
      }
    }
  }
}
