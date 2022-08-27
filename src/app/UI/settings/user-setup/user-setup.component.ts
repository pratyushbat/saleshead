import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserListResponse, UserResponse, UserSetupResponse } from '../../../models/clpuser.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { NotificationService } from '../../../services/notification.service';

import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { UserService } from '../../../services/user.service';
import { process } from "@progress/kendo-data-query";
import { DataBindingDirective } from "@progress/kendo-angular-grid";
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SignupDuplicateCheck } from '../../../models/signupMsg.model';
import { SignupService } from '../../../services/signup.service';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
declare var $: any;
@Component({
  selector: 'user-setup',
  templateUrl: './user-setup.component.html',
  styleUrls: ['./user-setup.component.css'],
  providers: [GridConfigurationService]
})

export class UserSetupComponent implements OnInit {
  @Input() isNewUserList?: boolean;
  @Input() companyIdBilling: number;
  private encryptedUser: string = '';
  @Input() user: CLPUser;
  showSpinner: boolean = false;
  isTimeZoneTouch: boolean = false;
  public userData: CLPUser[];
  public userDataOriginal: CLPUser[];
  userObj: CLPUser;
  userResponse: UserResponse;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  dataItem;
  public teamCodeFilterList;
  public officeCodeFilterList;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  timezoneFilterList: Array<any> = [];
  userTypeFilterList: Array<any> = [];
  userStatusFilterList: Array<any> = [
    { key: 0, value: 'Active' },
    { key: 1, value: 'LockedOut' }

  ];
  public selectedUserName: string = '';
  public selectedValueTeamCode;
  public selectedValueOfficeCode;
  public selectedValueTimeZone;
  public selectedValueUserType;
  public selectedValueStatus;
  public selectedDateFormat: number;
  columns = [
    { field: 'cLPUserID', title: 'User Code', width: '200' },
    { field: 'lastName', title: 'Last Name', width: '100' },
    { field: 'firstName', title: 'First Name', width: '250' },
    { field: 'officeCode', title: 'Office', width: '250' },
    { field: 'teamCode', title: 'Team', width: '250' },
    { field: 'userName', title: 'User Name', width: '200' },
    { field: 'timeZone', title: 'Time Zone', width: '250' },
    { field: 'userRole', title: 'Type', width: '200' },
    { field: 'dateFormat', title: 'Date Format', width: '250' },
    { field: 'status', title: 'Status', width: '200' },
    { field: 'changePW', title: 'Change PW ', width: '200' },
    { field: 'isShowCP', title: 'Show CP ', width: '200' },
    { field: 'isAllowDownload', title: 'Allow Download  ', width: '200' }
  ];

  reorderColumnName: string = 'cLPUserID,lastName,firstName,officeCode,teamCode,userName,timeZone,dateFormat,userRole,status,changePW,isShowCP,isAllowDownload';
  columnWidth: string = 'cLPUserID:90,lastName:120,firstName:120,officeCode:110,teamCode:110,userName:190,timeZone:110,dateFormat:110,userRole:110,status:110,changePW:100,isShowCP:100,isAllowDownload:100';
  arrColumnWidth: any = ['cLPUserID:90,lastName:120,firstName:120,officeCode:110,teamCode:110,userName:190,timeZone:110,dateFormat:110,userRole:110,status:110,changePW:100,isShowCP:100,isAllowDownload:100'];

  public formGroup: FormGroup;
  private editedRowIndex: number;
  public isNew: boolean;
  public type = "input";
  public info = true;
  public pageSizes = true;
  public previousNext = true;
  currentUserToDelete;
  initUserData: CLPUser[];
  public isMobileValidate;
  public defaultItem: { key: number; value: string } = { key: -1, value: "None Selected" };
  public defaultItemTeamCodeTop = -1;
  public defaultItemOfficeCodeTop = -1
  public currentUserUserName: any;
  dateFormatList: any;
  //New User 
  userSetupListResponse: UserSetupResponse;
  newUsersList: CLPUser[];
  newUserColumns = [
    { field: '$', title: ' ', width: '40' },
    { field: 'email', title: 'Email', width: '200' },
    { field: 'lastName', title: 'Last Name', width: '250' },
    { field: 'firstName', title: 'First Name', width: '250' },
    { field: 'status', title: 'Status', width: '250' }
  ];
  gridHeight;
  mobileColumnNames: string[];
  constructor(public _gridCnfgService: GridConfigurationService, private ngZone: NgZone, private userSvc: UserService, public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, private _notifyService: NotificationService, public _signupService: SignupService) {
    this.gridHeight = this._localService.getGridHeight('482px');
    this._localService.isMenu = true;
  }

  loadUserSetup() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.companyIdBilling = (!isNullOrUndefined(this.companyIdBilling) && this.companyIdBilling > 0) ? this.companyIdBilling : this.user.cLPCompanyID;
          if (this.isNewUserList)
            this.getNewUserList();
          this.getGridConfiguration();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  addNewUser() {
    $("#btnForNewUser").click();
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'user_setup_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('user_setup_grid').subscribe((value) => this.getUserSetupData()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'user_setup_grid').subscribe((value) => this.getGridConfiguration());
  }



  public ngOnInit(): void {
    this.loadUserSetup();
  }

  getNewUserList() {
    this.showSpinner = true;
    this.userSvc.getNewUserList(this.encryptedUser, this.companyIdBilling)
      .then(async (result: UserListResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.newUsersList = result.clpUsers;
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

  public teamCodeDDChange(dataItem) {
    this.selectedValueTeamCode = +this.selectedValueTeamCode;
    this.patchFormValue('teamCode');
  }
  public officeCodeDDChange(dataItem) {
    this.selectedValueOfficeCode = +this.selectedValueOfficeCode;
    this.patchFormValue('officeCode');
  }

  public timeZoneDDChange(dataItem) {
    this.selectedValueTimeZone = +this.selectedValueTimeZone;
    this.patchFormValue('timeZone');
  }

  public userTypeDDChange(dataItem) {
    this.selectedValueUserType = +this.selectedValueUserType;
    this.patchFormValue('userRole');
  }
  public userStatusDDChange(dataItem) {
    this.selectedValueStatus = +this.selectedValueStatus;
    this.patchFormValue('status');
  }
  public dateFormatDDChange(ev) {
    this.selectedDateFormat = +this.selectedDateFormat;
    this.patchFormValue('dateFormat');

  }

  patchFormValue(fieldName, value?) {
    this.formGroup.patchValue({
      cLPUserID: this.formGroup.value['cLPUserID'],
      changePW: fieldName == 'changePW' ? value : this.formGroup.value['changePW'],
      firstName: this.formGroup.value['firstName'],
      isAllowDownload: fieldName == 'allowDownload' ? value : this.formGroup.value['isAllowDownload'],
      isShowCP: fieldName == 'isShowCP' ? value : this.formGroup.value['isShowCP'],
      lastName: this.formGroup.value['lastName'],
      password: this.formGroup.value['password'],
      status: fieldName == 'status' ? this.selectedValueStatus : this.formGroup.value['status'],
      timeZone: fieldName == 'timeZone' ? this.selectedValueTimeZone : this.formGroup.value['timeZone'],
      teamCode: fieldName == 'teamCode' ? this.selectedValueTeamCode : this.formGroup.value['teamCode'],
      userName: this.selectedUserName,
      userRole: fieldName == 'userRole' ? this.selectedValueUserType : this.formGroup.value['userRole'],
      dateFormat: fieldName == 'dateFormat' ? this.selectedDateFormat : this.formGroup.value['dateFormat'],
      officeCode: fieldName == 'officeCode' ? this.selectedValueOfficeCode : this.formGroup.value['officeCode'],

    });
  }

  public getSelectedOfficeCode(officeCode) {
    let userOfficeCodeSelected = this.officeCodeFilterList.filter((data) => data.key === officeCode)[0];
    return userOfficeCodeSelected?.key;
  }

  public convertOfficeCode(officeCode) {
    let officeCodeselected = this.officeCodeFilterList.filter((data) => data.key === officeCode)[0];
    return officeCodeselected ? officeCodeselected.value : null;
  }

  public getSelectedTeamCode(teamCode) {
    let userTeamCodeSelected = this.teamCodeFilterList.filter((data) => data.key === teamCode)[0];
    return userTeamCodeSelected?.key;
  }

  public convertTeamCode(teamCode) {
    let teamCodeselected = this.teamCodeFilterList.filter((data) => data.key === teamCode)[0];
    return teamCodeselected ? teamCodeselected.value : null;
  }

  public getSelectedTimeZone(timeZone) {
    let usertimeZoneSelected = this.timezoneFilterList.filter((data) => data.id === timeZone)[0];;
    return usertimeZoneSelected?.id;
  }

  public convertTimeZone(timeZone) {
    let timeZoneSelected = this.timezoneFilterList.filter((data) => data.id === timeZone)[0];
    return timeZoneSelected ? timeZoneSelected.standardName : null;
  }

  public getUserType(userType) {
    let usertypeResult = this.userTypeFilterList.filter((data) => data.key === userType)[0];
    return usertypeResult?.key;
  }

  public convertUserType(userType) {
    let userTypeSelected = this.userTypeFilterList.filter((data) => data.key === userType)[0];
    return userTypeSelected ? userTypeSelected.value : null;
  }


  public getUserDateFormat(userDate) {
    let userDateArraySelected = this.dateFormatList.filter((data) => data.id === userDate)[0];
    return userDateArraySelected?.id;
  }

  public convertUserDateFormat(userDate) {
    let userDateSelected = this.dateFormatList.filter((data) => data.id === userDate)[0];
    return userDateSelected ? userDateSelected.dateFormat : null;
  }

  public getUserStatus(status) {
    let userStatusResult = this.userStatusFilterList.filter((data) => data.key === status)[0];
    return userStatusResult?.key;
  }

  public convertUserStatus(status) {
    let userStatusSelected = this.userStatusFilterList.filter((data) => data.key === status)[0];
    return userStatusSelected ? userStatusSelected.value : null;
  }



  async getUserSetupData() {
    this.showSpinner = true;
    await this.userSvc.getUsersSetup(this.encryptedUser, this.companyIdBilling, this.user.cLPUserID)
      .then(async (result: UserSetupResponse) => {
        if (result) {
          this.userSetupListResponse = UtilityService.clone(result);
          this.userDataOriginal = this.userSetupListResponse.users;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.userDataOriginal, "user_setup_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('user_setup_grid');
          }
          this.initUserData = Object.assign([], this.userDataOriginal);
          this.dateFormatList = this.userSetupListResponse.dateFormat;
          let filterTeam: any = this.userSetupListResponse.filterTeam;
          let filterOffice: any = this.userSetupListResponse.filterOffice;
          this.teamCodeFilterList = this._localService.convertDictionaryToAnyType(filterTeam);
          this.officeCodeFilterList = this._localService.convertDictionaryToAnyType(filterOffice);
          this.userTypeFilterList = this._localService.convertDictionaryToAnyType(this.userSetupListResponse.filterRoles);
          this.timezoneFilterList = this.userSetupListResponse.timeZoneWin;
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

  private async authenticateR(callback) {
    if (!isNullOrUndefined(this.user)) {
      this._gridCnfgService.user = this.user;
      this.showSpinner = false;
    }
    else {
      this.showSpinner = true;
      await this._localService.authenticateUser(this.encryptedUser, eFeatures.Usersetup)
        .then(async (result: UserResponse) => {
          if (result) {
            this.userResponse = UtilityService.clone(result);
            if (!isNullOrUndefined(this.userResponse)) {
              if (!isNullOrUndefined(this.userResponse?.user)) {
                this.user = this.userResponse.user;
                this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
                this._gridCnfgService.user = this.user;
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
          this.showSpinner = false;
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    }
    callback();
  }

  public addHandler({ sender }) {
    this.isTimeZoneTouch = false;
    this.selectedValueTeamCode = 0;
    this.selectedValueOfficeCode = 0;
    this.selectedValueTimeZone = 0;
    this.selectedValueUserType = -1;
    this.selectedValueStatus = 0;
    this.selectedDateFormat = 0;
    this.selectedUserName = '';
    this.closeEditor(sender);
    this.formGroup = new FormGroup({
      cLPUserID: new FormControl(""),
      lastName: new FormControl("", Validators.required),
      firstName: new FormControl(""),
      officeCode: new FormControl(0),
      teamCode: new FormControl(0),
      userName: new FormControl("", Validators.required),
      password: new FormControl(""),
      timeZone: new FormControl(0),
      dateFormat: new FormControl(0),
      userRole: new FormControl(-1, Validators.required),
      status: new FormControl(0),
      changePW: new FormControl(false, Validators.required),
      isShowCP: new FormControl(false),
      isAllowDownload: new FormControl(false)
    });
    this.isNew = true;
    sender.addRow(this.formGroup);

  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.isTimeZoneTouch = false;
    this.setDropDownvalues(dataItem);
    this.isNew = false;
    this.selectedUserName = dataItem.userName;
    this.closeEditor(sender);
    this.updateUserFormValues(dataItem);
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
    this.isMobileValidate = 0;
  }

  public updateUserFormValues(dataItem) {
    this.isTimeZoneTouch = false;
    this.formGroup = new FormGroup({
      cLPUserID: new FormControl(dataItem.cLPUserID),
      lastName: new FormControl(dataItem.lastName, Validators.required),
      firstName: new FormControl(dataItem.firstName),
      officeCode: new FormControl(dataItem.officeCode),
      teamCode: new FormControl(dataItem.teamCode),
      userName: new FormControl(dataItem.userName, Validators.required),
      password: new FormControl(dataItem.password),
      timeZone: new FormControl(dataItem.timeZoneWinId),
      dateFormat: new FormControl(dataItem.dateFormatId),
      userRole: new FormControl(dataItem.userRole, Validators.required),
      status: new FormControl(dataItem.status),
      changePW: new FormControl(dataItem.changePW, Validators.required),
      isShowCP: new FormControl(dataItem.isShowCP),
      isAllowDownload: new FormControl(dataItem.isAllowDownload),
    });
  }

  public cancelHandler({ sender, rowIndex }) {
    this.isTimeZoneTouch = false;
    this.selectedValueTeamCode = null;
    this.selectedValueOfficeCode = null;
    this.selectedValueTimeZone = null;
    this.selectedValueUserType = null;
    this.selectedValueStatus = null;
    this.selectedDateFormat = null;
    this.selectedUserName = '';
    this.formGroup = null;
    this.closeEditor(sender, rowIndex);
    this.isMobileValidate = 0;
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew, dataItem }): void {
    this.showSpinner = true;
    dataItem.teamCode = this.formGroup.value['teamCode'];
    dataItem.officeCode = this.formGroup.value['officeCode'];
    dataItem.timeZoneWinId = this.formGroup.value['timeZone'];
    dataItem.userRole = this.formGroup.value['userRole'];
    dataItem.status = this.formGroup.value['status'];
    dataItem.isShowCP = this.formGroup.value['isShowCP'];
    dataItem.changePW = this.formGroup.value['changePW'];
    dataItem.isAllowDownload = this.formGroup.value['isAllowDownload'];
    dataItem.dateFormatId = this.formGroup.value['dateFormat'];
    dataItem.userName = this.selectedUserName;
    sender.closeRow(rowIndex);
    if (isNew) {
      let newClpUser: CLPUser = <CLPUser>{};
      newClpUser.teamCode = dataItem.teamCode == null ? -1 : dataItem.teamCode;
      newClpUser.officeCode = dataItem.officeCode == null ? -1 : dataItem.officeCode;
      newClpUser.timeZoneWinId = dataItem.timeZoneWinId;
      newClpUser.userRole = dataItem.userRole;
      newClpUser.status = dataItem.status;
      newClpUser.isShowCP = dataItem.isShowCP;
      newClpUser.changePW = dataItem.changePW ? 1 : 0;
      newClpUser.isAllowDownload = dataItem.isAllowDownload;
      newClpUser.userName = this.selectedUserName;
      newClpUser.firstName = dataItem.firstName;
      newClpUser.lastName = dataItem.lastName;
      newClpUser.permissions = 1;
      newClpUser.password = dataItem.password;
      newClpUser.email = this.selectedUserName;
      newClpUser.dateFormatId = dataItem.dateFormatId;

      delete newClpUser.cLPUserID;
      this.userSvc.createUser(this.encryptedUser, newClpUser, this.companyIdBilling)
        .then(async (result: SimpleResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            /*  this.sort = [{ field: "dtCreated", dir: "desc" }];*/
            this.getUserSetupData();
            this.showSpinner = false;
            this.isMobileValidate = 0;
            this._notifyService.showSuccess('User added successfuly', "", 3000);

          }
          else {
            this.showSpinner = false;
            this.isMobileValidate = 0;
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this.isMobileValidate = 0;
          this._utilityService.handleErrorResponse(err);
        });

    }
    else {
      let clpuser: CLPUser = <CLPUser>{};
      clpuser = dataItem;
      clpuser.changePW = clpuser.changePW ? 1 : 0;
      clpuser.password = "";
      this.userSvc.updateUser(this.encryptedUser, clpuser, this.companyIdBilling, this.user.cLPUserID)
        .then(async (result: UserSetupResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.getUserSetupData();
            this.showSpinner = false;
            this.isMobileValidate = 0;
            this._notifyService.showSuccess('User updated successfuly', "", 3000);
          } else {
            this.showSpinner = false;
            this.isMobileValidate = 0;
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this.isMobileValidate = 0;
          this._utilityService.handleErrorResponse(err);
        });
    }
  }


  setDropDownvalues(dataItem) {
    this.selectedValueTeamCode = this.getSelectedTeamCode(dataItem.teamCode);
    if (isNullOrUndefined(this.selectedValueTeamCode)) {
      this.selectedValueTeamCode = 0;
    }
    this.selectedValueTimeZone = this.getSelectedTimeZone(dataItem.timeZoneWinId);
    if (isNullOrUndefined(this.selectedValueTimeZone)) {
      this.selectedValueTimeZone = 0;
    }
    this.selectedValueOfficeCode = this.getSelectedOfficeCode(dataItem.officeCode);
    if (isNullOrUndefined(this.selectedValueOfficeCode)) {
      this.selectedValueOfficeCode = 0;
    }

    this.selectedValueUserType = this.getUserType(dataItem.userRole);
    if (isNullOrUndefined(this.selectedValueUserType)) {
      this.selectedValueUserType = -1;
    }


    this.selectedValueStatus = this.getUserStatus(dataItem.status);
    if (isNullOrUndefined(this.selectedValueStatus)) {
      this.selectedValueStatus = 0;
    }

    this.selectedDateFormat = this.getUserDateFormat(dataItem.dateFormatId);
    if (isNullOrUndefined(this.selectedDateFormat)) {
      this.selectedDateFormat = 0;
    }

  }
  changeCheckbox(field, e) {
    var value = e.target.checked;
    this.patchFormValue(field, value);
  }

  public removeHandler({ dataItem }): void {
    if (dataItem != null)
      this.currentUserToDelete = dataItem.cLPUserID;
    this.currentUserUserName = dataItem.firstName + ' ' + dataItem.lastName;
  }

  deleteUser() {
    this.showSpinner = true;
    this.userSvc.deleteUser(this.encryptedUser, this.currentUserToDelete)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getUserSetupData();
          this.showSpinner = false;
          this._notifyService.showSuccess('User deleted successfuly', "", 3000);
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

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }


  /*savi*/
  public onFilter(inputValue: string): void {
    this.userDataOriginal = process(this.initUserData, {
      filter: {
        logic: "or",
        filters: [
          {
            field: "userName",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "lastName",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "firstName",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "cLPUserID",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "officeCode",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "teamCode",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "userRole",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "status",
            operator: "contains",
            value: inputValue,
          }
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }
  /*savi*/

  teamCodeTopDDChange(data) {
    if (this.defaultItemTeamCodeTop) {
      if (this.defaultItemTeamCodeTop == -1) {
        this.userDataOriginal = this.initUserData;
      } else {
        this.userDataOriginal = this.initUserData.filter(item => {
          return item.teamCode == this.defaultItemTeamCodeTop;
        });
      }
    }
  }

  officeCodeTopDDChange(data) {
    if (this.defaultItemOfficeCodeTop) {
      if (this.defaultItemOfficeCodeTop == -1) {
        this.userDataOriginal = this.initUserData;
      } else {
        this.userDataOriginal = this.initUserData.filter(item => {
          return item.officeCode == this.defaultItemOfficeCodeTop;
        });
      }
    }
  }


  showColumns(column) {
    if (column.field != 'firstName' && column.field != 'dateFormat' && column.field != 'lastName' && column.field != 'teamCode' && column.field != 'timeZone' && column.field != 'userRole' && column.field != 'status' && column.field != 'officeCode' && column.field != 'cLPUserID')
      return true;
    else
      return false;
  }

  async checkDuplicate(email: string, oldEmail: string) {
    if (email != oldEmail) {
      if (email.length > 0) {
        this.isMobileValidate = 1;
        let signupDuplicate: SignupDuplicateCheck = <SignupDuplicateCheck>{};
        signupDuplicate.email = email;
        signupDuplicate.mobile = "";
        signupDuplicate.country = "";
        await this._signupService.cLPUser_DuplicateCheck(signupDuplicate)
          .then((result: SimpleResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              if ((response && response.statusCode == 201 && response.messageInt > 0)) {
                this.isMobileValidate = 1; //is exist
                this._notifyService.showError('Email is already registered', "Email unavailable", 3000)
              }
              else if (((/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$/).test(email) == false)) {
                this.isMobileValidate = 1; //Wrong Formate
                this._notifyService.showError('Email Format is Wrong', "Email Invalid", 3000)
              } else {
                this.isMobileValidate = 2; //not exist
                this._notifyService.showSuccess('Email is available', "Email available", 3000)
              }
            }
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this.isMobileValidate = 0;
            this._utilityService.handleErrorResponse(err);
          });
      }
    }
  }

  public checkColumn(column) {
    if (column.field != 'teamCode' && column.field != 'timeZone' && column.field != 'userRole' &&
      column.field != 'status' && column.field != 'officeCode' && column.field != 'cLPUserID' && column.field != '$'
      && column.field != 'lastName' && column.field != 'firstName' && column.field != 'userName' && column.field != 'changePW'
      && column.field != 'isShowCP' && column.field != 'isAllowDownload' && column.field != 'dateFormat')
      return true;
    else
      return false;
  }
  public disableAddUpdate(formGroup) {
    if (formGroup?.invalid || this.isMobileValidate === 1 || this.selectedValueUserType == -1 || this.selectedDateFormat == 0 || this.selectedValueTimeZone == 0)
      return true;
    else
      return false;
  }

  get f() { return this.formGroup.controls; }

  get mob() {
    return this.isMobileValidate === 1 ? true : false;
  }
  get mobin() {
    return this.isMobileValidate === 2 ? true : false;
  }

}

