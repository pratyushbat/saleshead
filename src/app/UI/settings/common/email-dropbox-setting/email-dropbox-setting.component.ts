import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../../models/clpuser.model';
import { CLPEmailDropbox, EmailDropboxSettingsResponse } from '../../../../models/emailDropbox.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { keyValue } from '../../../../models/search.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { SignupService } from '../../../../services/signup.service';
import { UserService } from '../../../../services/user.service';
import { process } from "@progress/kendo-data-query";
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
declare var $: any;
@Component({
    selector: 'email-dropbox-setting',
    templateUrl: './email-dropbox-setting.component.html',
  styleUrls: ['./email-dropbox-setting.component.css'],
  providers: [GridConfigurationService, FormBuilder]
})
/** email-dropbox-setting component*/
export class EmailDropboxSettingComponent {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  userList: keyValue[];
  emailDropboxList: CLPEmailDropbox[];
  initEmailDropboxList: CLPEmailDropbox[];
  emailDropboxResponse: EmailDropboxSettingsResponse;
  showSpinner: boolean = false;
  emailDropboxForm = new FormGroup({});
  editableData: any;
  isShowEditableSection: boolean = false;
  confirmOperation: string = '';
  isProcessDelete: boolean = false;
  columns = [{ field: '$', title: '', width: '40' },
    { field: 'name', title: 'Name', width: '60' },
    { field: 'username', title: 'User Name', width: '100' },
    { field: 'cLPEmailDropBoxID', title: 'Email Dropbox ID', width: '60' },
    { field: 'cLPCompanyID', title: 'Company ID', width: '60' },
    { field: 'cLPUserID', title: 'User ID', width: '60' },
    { field: 'dropBox', title: 'Dropbox', width: '200' },
    { field: 'processor', title: 'Processor', width: '60' },
    { field: 'status', title: 'Status', width: '60' }];
  reorderColumnName: string = 'name,username,cLPEmailDropBoxID,cLPCompanyID,cLPUserID,dropBox,processor,status';
  columnWidth: string = 'name:60,username:100,cLPEmailDropBoxID:60,cLPCompanyID:60,cLPUserID:60,dropBox:200,processor:60,status:60';
  arrColumnWidth: any[] = ['name:60,username:100,cLPEmailDropBoxID:60,cLPCompanyID:60,cLPUserID:60,dropBox:200,processor:60,status:60'];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  constructor(private fb: FormBuilder, private _route: ActivatedRoute, public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, public _signupService: SignupService,
    private _accountSetupService: AccountSetupService, private _notifyService: NotificationService, private userSvc: UserService, public _gridCnfgService: GridConfigurationService) {

  }

  ngOnInit(): void {
    this.emailDropboxForm = this.prepareemailDropboxForm();
    this.emailDropboxForm.reset();
    this.getGridConfiguration();
    }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'email_dropbox_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('email_dropbox_grid').subscribe((value) => this.getEmailDropboxList()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'email_dropbox_grid').subscribe((value) => this.getGridConfiguration());
  }

  patchemailDropboxFormValue() {
    var editableData = this.editableData;
    for (let key in editableData) {
      let value = editableData[key];
      this.preparePatchFormControlValue(key, value);
    }
  }

  preparePatchFormControlValue(key, value) {
    if (this.emailDropboxForm.get(key))
      this.emailDropboxForm.get(key).setValue(value);
    else {
      return;
    }
  }

  prepareemailDropboxForm() {
    return this.fb.group({
      user: [''],
      processor: [0],
      status: [0]
    });
  }

  async getEmailDropboxList() {
    this.showSpinner = true;
    await this._accountSetupService.getEmailDropboxList(this.encryptedUser, this._localService.selectedAdminCompanyId)
      .then(async (result: EmailDropboxSettingsResponse) => {
        if (result) {
          this.emailDropboxResponse = UtilityService.clone(result);
          this.userList = this.emailDropboxResponse.filterUser
          this.emailDropboxList = this.emailDropboxResponse.cLPEmailDropbox
          this.initEmailDropboxList = this.emailDropboxResponse.cLPEmailDropbox
          this._gridCnfgService.iterateConfigGrid(this.emailDropboxResponse, "email_dropbox_grid");
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

  public onEmailDropboxFilter(inputValue: string): void {
    this.emailDropboxList = process(this.initEmailDropboxList, {
      filter: {
        logic: "or",
        filters: [
          { field: "name", operator: "contains", value: inputValue},
          { field: "username", operator: "contains", value: inputValue},
          { field: "cLPEmailDropBoxID", operator: "contains", value: inputValue },
          { field: "cLPCompanyID", operator: "contains", value: inputValue },
          { field: "cLPUserID", operator: "contains", value: inputValue },
          { field: "dropBox", operator: "contains", value: inputValue },
          { field: "processor", operator: "contains", value: inputValue },
          { field: "status", operator: "contains", value: inputValue }
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }

  async getEmailDropboxListByUser(e) {
    this.showSpinner = true;
    await this._accountSetupService.getEmailDropboxListByUser(this.encryptedUser, e)
      .then(async (result: EmailDropboxSettingsResponse) => {
        if (result) {
          this.editableData = UtilityService.clone(result);
          if (this.editableData.cLPEmailDropBoxID == 0)
            this.isProcessDelete = false;
          else
            this.isProcessDelete = true;
          var username = this.userList.filter(item => { return item.key == e })[0];
          this.emailDropboxForm.get('user').setValue(username.value);
            this.patchemailDropboxFormValue();
            this.isShowEditableSection = true;
        
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

  onDeleteDropboxSetting() {
    if (this.isProcessDelete == true) {
      this.confirmOperation = 'delete';
      $('#emailDropboxModal').modal('show');
    } else {
      this._notifyService.showSuccess("There is no data to delete.", "", 3000);
    }
    
  }

  emailDropboxFormSubmit() {
    this.confirmOperation = 'save';
  }

  onCancelDropboxSetting() {
    this.isShowEditableSection = false;
  }

  async onConfirmOperation() {
    switch (this.confirmOperation) {
      case 'delete': {
          var cLPEmailDropBoxID = this.editableData.cLPEmailDropBoxID
           this.showSpinner = true;
          await this._accountSetupService.deleteEmailDropboxList(this.encryptedUser, cLPEmailDropBoxID)
          .then(async (result: SimpleResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              this._notifyService.showSuccess(response.messageString ? response.messageString : "Email Dropbox Setting Deleted Successfully.", "", 3000);
              this.getEmailDropboxList();
              this.isShowEditableSection = false;
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
      case 'save': {
        var name = this.userList.filter(item => { return item.value == this.emailDropboxForm.controls['user'].value; })[0]
        let CLPEmailDropbox: CLPEmailDropbox = <CLPEmailDropbox>{};
        CLPEmailDropbox.cLPCompanyID = this._localService.selectedAdminCompanyId
        CLPEmailDropbox.cLPUserID = name.key
        CLPEmailDropbox.processor = this.emailDropboxForm.controls['processor'].value;
        switch (this.emailDropboxForm.controls['status'].value) {
          case (false): {
            CLPEmailDropbox.status = 0
            break;
          } case (true): {
            CLPEmailDropbox.status = 1
            break;
          }
        }
        this.showSpinner = true;
        await this._accountSetupService.updateEmailDropbox(this.encryptedUser, CLPEmailDropbox)
          .then(async (result: SimpleResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              this.getEmailDropboxList();
              this.isShowEditableSection = false;
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
      default: {
        break;
      }
    }
  }

}
