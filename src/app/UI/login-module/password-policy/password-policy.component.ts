import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatInput } from '@angular/material/input';

import { UtilityService } from '../../../services/shared/utility.service';
import { UserService } from '../../../services/user.service';
import { PasswordPolicyService } from '../../../services/password-policy.service';
import { NotificationService } from '../../../services/notification.service';
import { GlobalService } from '../../../services/global.service';

import { PasswordPolicy, PasswordPolicyListResponse } from '../../../models/passwordPolicy.model';
import { CLPUser, UserResponse, UserListResponse } from '../../../models/clpuser.model';
import { isNullOrUndefined } from 'util';
import { LocalService } from '../../../services/shared/local.service';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { eFeatures } from '../../../models/enum.model';

declare var $: any;

@Component({
    selector: 'app-password-policy',
    templateUrl: './password-policy.component.html',
    styleUrls: ['./password-policy.component.css']
})
export class PasswordPolicyComponent implements OnInit {

  userResponse: UserListResponse;
  _userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  clpUsers: CLPUser[] = [];
  user: CLPUser = <CLPUser>{};
  passwordPolicyListResponse: PasswordPolicyListResponse;
  PasswordPolicies: PasswordPolicy[] = [];
  private encryptedUser: string = '';
  editRowID: number = -1;
  isCancel: boolean = false;
  adminDisable: boolean = false;
  highlightedRows = [];
  highlightedRowsTemplate = [];

  displayedColumns: string[] = ['clpcompanyId', 'companyName', 'minLength', 'specialCharCount', 'digitCount', 'capitalCount', 'smallAlphabetCount', 'expiration', 'pwdReuseCount', 'maxFailedAttempts', 'maxPwdChangeInDay', 'lockOutDuration', 'isMFAEnabled', 'mfaMethod', 'mfaExpiration', 'maxMFADevicesAllowed', 'action'];
  dataSource = new MatTableDataSource<PasswordPolicy>();
  displayedColumnsClpUser: string[] = ['clpUserId', 'companyName', 'userName', 'isPasswordAdmin'];
  dataSourceClpUser = new MatTableDataSource<CLPUser>();

  pageSize: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatInput) searchPP: MatInput;
  @ViewChild(MatInput) searchPassAdmin: MatInput;
  @ViewChild('dataSort', { static: false }) dataSort: MatSort;
  @ViewChild('userSort', { static: false }) userSort: MatSort;

  matInputSearchPAField: any;
  @ViewChild('matInputSearchPA') set matInputSearch(matInputSearch: ElementRef) {
    this.matInputSearchPAField = matInputSearch;
  }

  pageEvent: any = PageEvent;

  isMFAEnabled: boolean = false;
  maxFailedAttemptsValue: number = 0;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _passwordPolicyService: PasswordPolicyService,
    private _userService: UserService,
    private _snackBar: MatSnackBar,
    private _utilityService: UtilityService,
    public globalService: GlobalService,
    private notifyService: NotificationService,
    private _localService: LocalService,
  ) { this._localService.isMenu = true; }

  ngOnInit() {

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.loadPasswordPolicy();
          this.loadClpUsers();
          this.globalService.loadAppConfig(this.encryptedUser);
        }
        else
          this._router.navigate(['/unauthorized']);
      })
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.SOSecurity)
      .then(async (result: UserResponse) => {
        if (result) {
          this._userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this._userResponse) && this._userResponse.roleFeaturePermissions && (this._userResponse.roleFeaturePermissions.view || this._userResponse.roleFeaturePermissions.isAdmin)) {
            this.user = this._userResponse.user;
            this.roleFeaturePermissions = this._userResponse.roleFeaturePermissions;
          }
          else
            this._router.navigate(['/unauthorized']);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  highlight(row) {
    if (this.editRowID != row.clpCompanyId) {
      this.isMFAEnabled = row.isMFAEnabled;
      this.maxFailedAttemptsValue = row.maxFailedAttempts;
    }

    if (!this.isCancel) {
      this.highlightedRows = [];
      this.highlightedRows.push(row);
      this.editRowID = row.clpCompanyId;
    }
    else {
      this.editRowID = -1;
      this.isCancel = false;
    }
  }

  private async loadPasswordPolicy() {
    await this._passwordPolicyService.getPasswordPolicies(this.encryptedUser)
      .then(async (result: PasswordPolicyListResponse) => {
        if (result) {
          if (result.statusCode == 401)
            this._router.navigate(['/unauthorized']);
          else {
            this.passwordPolicyListResponse = UtilityService.clone(result);
            //this.user = this.passwordPolicyListResponse.currentUser;
            this.PasswordPolicies = this.passwordPolicyListResponse.passwordPolicies;
            const ELEMENT_PP: PasswordPolicy[] = this.PasswordPolicies;
            this.dataSource = new MatTableDataSource(ELEMENT_PP);
            this.dataSource.paginator = this.paginator;
            if (localStorage.getItem('passwordPolicy_pageSize')) {
              let pageSizeVal: string = "";
              pageSizeVal = localStorage.getItem('passwordPolicy_pageSize');
              this.paginator.pageSize = parseInt(pageSizeVal);
            } else
              this.paginator.pageSize = 50;
            this.dataSource.sort = this.dataSort;
            this.applyFilterTemplateConfiguration(this.searchPP.value);
          }
        }
        else this._router.navigate(['/unauthorized']);
      })
      .catch((err: HttpErrorResponse) => {
        this._utilityService.handleErrorResponse(err);
      });
  }

  private async loadClpUsers() {
    await this._passwordPolicyService.getClpUsers(this.encryptedUser)
      .then(async (result: UserListResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          this.clpUsers = this.userResponse.clpUsers;
          const ELEMENT_CLPUSERS: CLPUser[] = this.clpUsers;
          this.dataSourceClpUser = new MatTableDataSource(ELEMENT_CLPUSERS);
          this.dataSourceClpUser.sort = this.userSort;
          this.applyFilterPA(this.matInputSearchPAField.nativeElement.value);
        }
        else this._router.navigate(['/unauthorized']);
      })
      .catch((err: HttpErrorResponse) => {
        this._utilityService.handleErrorResponse(err);
      });
  }

  public async updateClpUser_PA(userId: number) {
    if (!isNullOrUndefined(this.clpUsers)) {
      var user = this.clpUsers.filter(i => i.cLPUserID == userId)[0];
      if (user)
        user.isPasswordAdmin = user.isPasswordAdmin == false ? true : false;
      this.adminDisable = true;
      await this._passwordPolicyService.clpUser_Update_PA(this.encryptedUser, user)
        .then(result => {
          if (result) {
            if (result.statusCode == 401)
              this._router.navigate(['/unauthorized']);
            else {
              this.adminDisable = false;
              this.loadClpUsers();
              this.notifyService.showSuccess("User updated successfully!", "",3000);
            }
          }
        }).catch((err: HttpErrorResponse) => {
          this.adminDisable = false;
          console.log(err);
        });
    }
  }

  applyFilterPA(filterValuePA: string) {
    this.dataSourceClpUser.filterPredicate = function (data, filter: string): boolean {
      return data.cLPCompanyID.toFixed().includes(filter) || data.firstName.toLowerCase().includes(filter) || data.lastName.toLowerCase().includes(filter) || data.userName.toLowerCase().includes(filter) || data.companyName.toLowerCase().includes(filter);
    };
    this.dataSourceClpUser.filter = filterValuePA.trim().toLowerCase();
  }

  editRow(id: number) {
    this.editRowID = id;
  }

  resetGrid() {
    this.isCancel = true;
  }

  applyFilterTemplateConfiguration(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private async updatePasswordPolicy(companyid: number) {
    const minLength_id = "minLength_" + companyid;
    const specialCharCount_id = "specialCharCount_" + companyid;
    const digitCount_id = "digitCount_" + companyid;
    const capitalCount_id = "capitalCount_" + companyid;
    const smallAlphabetCount_id = "smallAlphabetCount_" + companyid;
    const expiration_id = "expiration_" + companyid;
    const pwdReuseCount_id = "pwdReuseCount_" + companyid;
    const maxFailedAttempts_id = "maxFailedAttempts_" + companyid;
    const maxPwdChangeInDay_id = "maxPwdChangeInDay_" + companyid;
    const lockOutDuration_id = "lockOutDuration_" + companyid;
    const maxMFADevicesAllowed_id = "maxMFADevicesAllowed_" + companyid;
    const mfaEnable_id = "mfaEnable_" + companyid;
    const mfaMethod_id = "mfaMethod_" + companyid;
    const mFAExpiration_id = "mfaExpiration_" + companyid;

    const minLength = $("#" + minLength_id).val();
    const specialCharCount = $("#" + specialCharCount_id).val();
    const digitCount = $("#" + digitCount_id).val();
    const capitalCount = $("#" + capitalCount_id).val();
    const smallAlphabetCount = $("#" + smallAlphabetCount_id).val();
    const expiration = $("#" + expiration_id).val();
    const pwdReuseCount = $("#" + pwdReuseCount_id).val();
    const maxFailedAttempts = $("#" + maxFailedAttempts_id).val();
    const maxPwdChangeInDay = $("#" + maxPwdChangeInDay_id).val();
    const lockOutDuration = $("#" + lockOutDuration_id).val();
    const maxMFADevicesAllowed = $("#" + maxMFADevicesAllowed_id).val();
    const mfaEnable = $("#" + mfaEnable_id)[0].checked;
    const mfaMethod = $("#" + mfaMethod_id).val();
    const mFAExpiration = $("#" + mFAExpiration_id).val();

    var pp = null;

    if (!isNullOrUndefined(this.PasswordPolicies))
      pp = this.PasswordPolicies.filter(i => i.clpCompanyId == companyid)[0];

    if (pp) {
      pp.minLength = +minLength;
      pp.specialCharCount = +specialCharCount;
      pp.digitCount = +digitCount;
      pp.capitalCount = +capitalCount;
      pp.smallAlphabetCount = +smallAlphabetCount;
      pp.expiration = +expiration;
      pp.pwdReuseCount = +pwdReuseCount;
      pp.maxFailedAttempts = +maxFailedAttempts;
      pp.maxPwdChangeInDay = +maxPwdChangeInDay;
      pp.lockOutDuration = pp.maxFailedAttempts == 0 ? 0 : +lockOutDuration;
      pp.isMFAEnabled = mfaEnable;

      if (companyid > 0)
        pp.modifiedBy = this.user.cLPUserID;
      else
        pp.createdBy = this.user.cLPUserID;

      if (mfaEnable == false) {
        pp.mfaMethod = -1;
        pp.mfaExpiration = 0;
        pp.maxMFADevicesAllowed = 0;
      } else {
        pp.mfaMethod = mfaMethod == -1 ? 0 : mfaMethod; //Default to 0 or SMS
        pp.mfaExpiration = mFAExpiration <= 0 || mFAExpiration == "" ? 3 : mFAExpiration; //Default to 3
        pp.maxMFADevicesAllowed = maxMFADevicesAllowed <= 0 ? 2 : +maxMFADevicesAllowed; //Default to 2
      }
    }
    var status = this.validatePasswordPolicy(pp);
    if (!status) {
      await this._passwordPolicyService.passWordPolicy_Update(this.encryptedUser, pp)
        .then(result => {
          if (result) {
            if (result.statusCode == 401)
              this._router.navigate(['/unauthorized']);
            else {
              this.editRowID = -1;
              this.loadPasswordPolicy();
              this.notifyService.showSuccess("Password Policy saved successfully!", "", 3000);
            }
          }
        }).catch((err: HttpErrorResponse) => {
          console.log(err);
        });
    }
  }

  allowNumeric(e) {
    if (e.ctrlKey || e.altKey)
      e.preventDefault();
    else {
      var key = e.keyCode;
      if (key != 8 && key != 0 && (key < 48 || key > 57)) {
        e.preventDefault();
      }
    }
  }

  public handlePage(e: any) {
    localStorage.setItem('passwordPolicy_pageSize', e.pageSize);
  }

  changeMaxFailedAttempt(companyid: number) {
    const maxFailedAttempts_id = "maxFailedAttempts_" + companyid;
    const maxFailedAttempts = $("#" + maxFailedAttempts_id).val();
    this.maxFailedAttemptsValue = maxFailedAttempts;
  }

  validatePasswordPolicy(passwordPolicy) {
    var isValid: boolean = false;
    if (passwordPolicy.maxFailedAttempts > 0 && passwordPolicy.lockOutDuration == 0) {
      this.notifyService.showError("Please enter lockout duration.", "", 4000);
      isValid = true;
    }
    return isValid;
  }

  changeMFAEnable(companyid) {
    const mfaEnable_id = "mfaEnable_" + companyid;
    const mfaEnable = $("#" + mfaEnable_id)[0].checked;
    this.isMFAEnabled = mfaEnable;
  }
}
