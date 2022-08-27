import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';

import { CLPOutlookUser, CLPOutlookUserResponse } from '../../../../models/clpOutlookUser';
import { CLPUser } from '../../../../models/clpuser.model';
import { eOSAddressType, eOSStatus, eUserRole } from '../../../../models/enum.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';

import { process } from "@progress/kendo-data-query";

import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { DataBindingDirective } from '@progress/kendo-angular-grid';

const createFormGroup = dataItem => new FormGroup({
  'ProductID': new FormControl(dataItem.ProductID),
  'ProductName': new FormControl(dataItem.ProductName, Validators.required),
  'UnitPrice': new FormControl(dataItem.UnitPrice),
  'UnitsInStock': new FormControl(dataItem.UnitsInStock, Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,3}')])),
  'CategoryID': new FormControl(dataItem.CategoryID, Validators.required)
});

@Component({
    selector: 'app-outlook-addin',
    templateUrl: './outlook-addin.component.html',
  styleUrls: ['./outlook-addin.component.css'],
  providers: [GridConfigurationService]
})
/** outlook-addin component*/
export class OutlookAddinComponent implements OnInit {
  /** outlook-addin ctor */
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  @Input() isUserCode: boolean = true;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  clpOutlookUserResponse: CLPOutlookUserResponse;
  clpOutlookUsers: CLPOutlookUser[] = [];
  initClpOutlookUsers: CLPOutlookUser[] = [];
  companyId: number;

  public formGroup: FormGroup;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  private editedRowIndex: number;
  private editedRowUserId: number = -1;

  //set for grid configuration
  columns = [
    { field: '$', title: '', width: '40' },
    { field: 'userCode', title: 'User Code', width: '90' },
    { field: 'lastFirst', title: 'User', width: '90' },
    { field: 'userRole', title: 'Type', width: '66' },
    { field: 'primaryAddMap', title: 'Primary Address Map', width: '110' },
    { field: 'otherAddMap', title: 'Other Address Map', width: '100' },
    { field: 'outlookPluginVersion', title: 'Version', width: '80' },
    { field: 'allowSyncContact', title: 'Allow Contact Sync', width: '130' },
    { field: 'allowSyncAppt', title: 'Allow Appt Sync', width: '115' },
    { field: 'allowSyncEmail', title: 'Allow Email Sync', width: '115' },
    { field: 'adminStatus', title: 'Status', width: '66' },
    { field: 'status', title: 'Status', width: '75' },
  ];
  reorderColumnName: string = 'userCode,lastFirst,userRole,primaryAddMap,otherAddMap,outlookPluginVersion,allowSyncContact,allowSyncAppt,allowSyncEmail,adminStatus,status';
  columnWidth: string = 'userCode:90,lastFirst:90,userRole:66,primaryAddMap:110,otherAddMap:100,outlookPluginVersion:80,allowSyncContact:130,allowSyncAppt:115,allowSyncEmail:115,adminStatus:66:status:75';
  arrColumnWidth: any[] = ['userCode:90,lastFirst:90,userRole:66,primaryAddMap:110,otherAddMap:100,outlookPluginVersion:80,allowSyncContact:130,allowSyncAppt:115,allowSyncEmail:115,adminStatus:66:status:75'];
    mobileColumnNames: string[];

  constructor(private fb: FormBuilder,
    public _router: Router,
    public _localService: LocalService,
    public _notifyService: NotificationService,
    public _utilityService: UtilityService,
    public _accountSetupService: AccountSetupService,
    public _gridCnfgService: GridConfigurationService,
  ) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      //Set for grid configuration
      this.getGridConfiguration();
     }
    else
      this._router.navigate(['/unauthorized']);
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'outlook_addin_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('outlook_addin_grid').subscribe((value) => this.getCLPOutlookUser()));
     }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'outlook_addin_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getCLPOutlookUser() {
    this.showSpinner = true;
    this.companyId =   this._localService.selectedAdminCompanyId == -1 ?  this.user.cLPCompanyID :  this._localService.selectedAdminCompanyId;
    await this._accountSetupService.getCLPOutlookUser(this.encryptedUser, this.companyId)
      .then(async (result: CLPOutlookUserResponse) => {
      if (result) {
        this.clpOutlookUserResponse = UtilityService.clone(result);
        this.clpOutlookUsers = this.clpOutlookUserResponse.cLPOutlookUser;
        this.initClpOutlookUsers = this.clpOutlookUserResponse.cLPOutlookUser;
        if (!isNullOrUndefined(this._gridCnfgService)) {
        this._gridCnfgService.iterateConfigGrid(this.clpOutlookUserResponse, "outlook_addin_grid");
        this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('outlook_addin_grid');
        }
        this.showSpinner = false;
      }
      else
        this.showSpinner = false;
    }).catch((err: HttpErrorResponse) => {
      console.log(err);
      this.showSpinner = false;
    });
  }

  getEnumValue(eName, value) {
    var result = '--'
    if (eName) {
      switch (eName) {
        case 'userRole': result = eUserRole[value]; break;
        case 'primaryAddMap': result = eOSAddressType[value]; break;
        case 'otherAddMap': result = eOSAddressType[value]; break;
        case 'status': result = eOSStatus[value]; break;
      }
    }
    return result;
  }

  showColumns(column) {
    if (column.field == 'userCode' || column.field == 'lastFirst' || column.field == 'outlookPluginVersion')
      return true;
    else
      return false;
  }

  public onFilter(inputValue: string): void {

    this.clpOutlookUsers = process(this.initClpOutlookUsers, {
      filter: {
        logic: "or",
        filters: [
          {
            field: "userCode",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "lastFirst",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "userRole",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "outlookPluginVersion",
            operator: "contains",
            value: inputValue,
          }
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);
    this.updateUserFormValues(dataItem);
    this.editedRowIndex = rowIndex;
    this.editedRowUserId = dataItem.cLPUserID;
    sender.editRow(rowIndex, this.formGroup);
  }

  public updateUserFormValues(dataItem) {
    this.formGroup = new FormGroup({
      userCode: new FormControl(dataItem.userCode),
      lastFirst: new FormControl(dataItem.lastFirst),
      userRole: new FormControl(dataItem.userRole),
      primaryAddMap: new FormControl(dataItem.primaryAddMap),
      otherAddMap: new FormControl(dataItem.otherAddMap),
      outlookPluginVersion: new FormControl(dataItem.outlookPluginVersion),
      allowSyncContact: new FormControl(dataItem.allowSyncContact),
      allowSyncAppt: new FormControl(dataItem.allowSyncAppt),
      allowSyncEmail: new FormControl(dataItem.allowSyncEmail),
      adminStatus: new FormControl(dataItem.adminStatus),
      status: new FormControl(dataItem.status),
    });
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowUserId = -1;
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  public cancelHandler({ sender, rowIndex }) {
    this.editedRowUserId = -1;
    this.formGroup = null;
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew, dataItem }): void {
    this.showSpinner = true;
    dataItem.userCode = this.formGroup.value['userCode'];
    dataItem.lastFirst = this.formGroup.value['lastFirst'];
    dataItem.userRole = this.formGroup.value['userRole'];
    dataItem.primaryAddMap = this.formGroup.value['primaryAddMap'];
    dataItem.otherAddMap = this.formGroup.value['otherAddMap'];
    dataItem.outlookPluginVersion = this.formGroup.value['outlookPluginVersion'];
    dataItem.allowSyncContact = this.formGroup.value['allowSyncContact'];
    dataItem.allowSyncAppt = this.formGroup.value['allowSyncAppt'];
    dataItem.allowSyncEmail = this.formGroup.value['allowSyncEmail'];
    dataItem.status = this.formGroup.value['status'];

    sender.closeRow(rowIndex);

    let cLPOutlookUser: CLPOutlookUser = <CLPOutlookUser>{};
    cLPOutlookUser = dataItem;
    cLPOutlookUser.cLPUserID = this.editedRowUserId;
    cLPOutlookUser.cLPCompanyID = this.companyId;
    this._accountSetupService.updateCLPOutlookUser(this.encryptedUser, cLPOutlookUser)
      .then(async (result: SimpleResponse) => {
      if (result) {
        var response = UtilityService.clone(result);
        this.getCLPOutlookUser();
        this.showSpinner = false;
        this._notifyService.showSuccess('Outlook user updated successfuly', "", 3000);
      } else
        this.showSpinner = false;
    })
    .catch((err: HttpErrorResponse) => {
      console.log(err);
      this.showSpinner = false;
      this._utilityService.handleErrorResponse(err);
    });
    
  }

  public disableAddUpdate(formGroup) {
    if (formGroup?.invalid)
      return true;
    else
      return false;
  }

}
