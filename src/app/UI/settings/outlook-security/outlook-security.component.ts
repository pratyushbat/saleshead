import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { OutlookRights } from '../../../models/securitySetting.model';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eReadWrite, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SecuritySettingService } from '../../../services/security-setting.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { NotificationService } from '../../../services/notification.service';
import { AccountSetupService } from '../../../services/accountSetup.service';
import { ClpCompany, CompanyResponse } from '../../../models/company.model';

@Component({
  selector: 'app-outlook-security',
  templateUrl: './outlook-security.component.html',
  styleUrls: ['./outlook-security.component.css']
})
export class OutlookSecurityComponent implements OnInit {
  encryptedUser: string;
  public user: CLPUser;
  companyResponse: ClpCompany;
  public roleFeaturePermissions: RoleFeaturePermissions;
  showSpinner: boolean;
  public outlookRights: OutlookRights[] = [];
  public initoutlookRights: OutlookRights[] = [];
  userResponse: UserResponse;
  isEditMode: boolean = false;
  status: string = '';
  checkedImagePath: string = ("../../../../assets/activity/config/greencheckwhite.svg");
  uncheckedImagePath: string = ("../../../../assets/activity/config/olbdelete.svg");

  constructor(
    private _notifyService: NotificationService,
    private _securitySettingSrvc: SecuritySettingService,
    private _localService: LocalService,
    private _router: Router,
    private _utilityService: UtilityService,
    private _accountSetupService: AccountSetupService) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getCompanyInformation();
          this.getOutlookRights();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.SecuritySettings)
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
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async getCompanyInformation() {
    await this._accountSetupService.getClpCompany(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CompanyResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.companyResponse = result.company;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getOutlookRights() {
    this.showSpinner = true;
    await this._securitySettingSrvc.getOutlookRights(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: OutlookRights[]) => {
        if (result) {
          this.outlookRights = UtilityService.clone(result);
          this.initoutlookRights = UtilityService.clone(result);
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  editMode() {
    this.isEditMode = true;

  }

  cancelSecuritySetting() {
    this.outlookRights = this.initoutlookRights;
    this.isEditMode = false;
    this.status = 'Cancel';
  }

  async saveSecuritySetting() {
    this.showSpinner = true;
    await this._securitySettingSrvc.saveOutlookRights(this.outlookRights)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Outlook Security Setting Updated Successfully.", "", 3000);
          this.isEditMode = false;
          this.getOutlookRights();
          this.status = 'Save';
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  changeSettings(changeBool, i, downloadbleName: string) {
    switch (downloadbleName) {
      case 'companyDownloadable':
        if (changeBool == false) {
          this.outlookRights[i].companyDownloadable = !changeBool;
          this.outlookRights[i].officeDownloadable = !changeBool;
          this.outlookRights[i].teamDownloadable = !changeBool;
        }
        else
          this.outlookRights[i].companyDownloadable = !changeBool;
        break;

      case 'officeDownloadable':
        this.outlookRights[i].officeDownloadable = !changeBool;
        break;

      case 'teamDownloadable':
        this.outlookRights[i].teamDownloadable = !changeBool;
        break;

    }
  }


}
