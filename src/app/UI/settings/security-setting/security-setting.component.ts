import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { CLPUser, FeatureAccess, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eReadWrite, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SimpleResponse } from '../../../models/genericresponse.model';
import { AccountSetupService } from '../../../services/accountSetup.service';
import { ClpCompany, CompanyResponse } from '../../../models/company.model';
import { SecuritySettingService } from '../../../services/security-setting.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { CLPRights } from '../../../models/securitySetting.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'security-setting',
  templateUrl: './security-setting.component.html',
  styleUrls: ['./security-setting.component.css']
})
export class SecuritySettingComponent implements OnInit {
  encryptedUser: string;
  user: CLPUser;
  userResponse: UserResponse;
  companyData: ClpCompany;
  roleFeaturePermissions: RoleFeaturePermissions;
  clpRights: CLPRights[] = [];
  showSpinner: boolean;
  isShowOfficeSection: boolean;
  isShowTeamSection: boolean;
  comManView: boolean;
  comManEdit: boolean;
  comGenView: boolean;
  comGenEdit: boolean;
  offManView: boolean;
  offManEdit: boolean;
  offGenView: boolean;
  offGenEdit: boolean;
  teamManView: boolean;
  teamManEdit: boolean;
  teamGenView: boolean;
  teamGenEdit: boolean;
  shareContacts: boolean;
  secOutlook: boolean;
  secExcel: boolean;
  secMarketingTool: boolean;
  checkedImagePath: string = ("../../../../assets/activity/config/greencheckwhite.svg");
  uncheckedImagePath: string = ("../../../../assets/activity/config/olbdelete.svg");
  isEditMode: boolean = false;
  isEditModeGeneralUser: boolean = false;
  status: string = '';
  featureAccess: FeatureAccess;
  constructor(private _notifyService: NotificationService, private _localService: LocalService, private _utilityService: UtilityService, private _router: Router, private _accountSetupService: AccountSetupService, private _securitySettingSrvc: SecuritySettingService) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getCompanyData();
          this.getUserRights();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
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
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async getCompanyData() {
    this.showSpinner = true;
    await this._accountSetupService.getClpCompany(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CompanyResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.companyData = response.company;
          this.setUpGeneralUser();
          this.isShowOfficeSection = response.company.showOfficeDD;
          this.isShowTeamSection = response.company.showTeamDD;
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

  editMode() {
    this.isEditMode = true;
  }

  createDefault() {
    let i;
    for (i = 0; i < 2; i++) {
      if (i == 0)
        this.clpRights.push({ cLPCompanyID: this.user.cLPCompanyID, userRole: eUserRole.Manager, companyReadWrite: eReadWrite.ViewAndEdit, officeReadWrite: eReadWrite.ViewAndEdit, teamReadWrite: eReadWrite.ViewAndEdit });
      else
        this.clpRights.push({ cLPCompanyID: this.user.cLPCompanyID, userRole: eUserRole.General, companyReadWrite: eReadWrite.ViewOnly, officeReadWrite: eReadWrite.ViewOnly, teamReadWrite: eReadWrite.ViewOnly });
    }
    this.createUserRights(this.clpRights, 'new');
  }

  setData() {
    switch (this.clpRights[1]?.companyReadWrite) {
      case 2: {
        this.comManView = true;
        this.comManEdit = true;
        break;
      }
      case 1: {
        this.comManView = true;
        this.comManEdit = false;
        break;
      }
      case 0: {
        this.comManView = false;
        this.comManEdit = false;
        break;
      }
      default: {
        break;
      }
    }
    switch (this.clpRights[0]?.companyReadWrite) {
      case 2: {
        this.comGenView = true;
        this.comGenEdit = true;
        break;
      }
      case 1: {
        this.comGenView = true;
        this.comGenEdit = false;
        break;
      }
      case 0: {
        this.comGenView = false;
        this.comGenEdit = false;
        break;
      }
      default: {
        break;
      }
    }
    if (this.isShowOfficeSection == true) {
      switch (this.clpRights[1]?.officeReadWrite) {
        case 2: {
          this.offManView = true;
          this.offManEdit = true;
          break;
        }
        case 1: {
          this.offManView = true;
          this.offManEdit = false;
          break;
        }
        case 0: {
          this.offManView = false;
          this.offManEdit = false;
          break;
        }
        default: {
          break;
        }
      }
      switch (this.clpRights[0]?.officeReadWrite) {
        case 2: {
          this.offGenView = true;
          this.offGenEdit = true;
          break;
        }
        case 1: {
          this.offGenView = true;
          this.offGenEdit = false;
          break;
        }
        case 0: {
          this.offGenView = false;
          this.offGenEdit = false;
          break;
        }
        default: {
          break;
        }
      }
    } else
      return;
    if (this.isShowTeamSection == true) {
      switch (this.clpRights[1]?.teamReadWrite) {
        case 2: {
          this.teamManView = true;
          this.teamManEdit = true;
          break;
        }
        case 1: {
          this.teamManView = true;
          this.teamManEdit = false;
          break;
        }
        case 0: {
          this.teamManView = false;
          this.teamManEdit = false;
          break;
        }
        default: {
          break;
        }
      }
      switch (this.clpRights[0]?.teamReadWrite) {
        case 2: {
          this.teamGenView = true;
          this.teamGenEdit = true;
          break;
        }
        case 1: {
          this.teamGenView = true;
          this.teamGenEdit = false;
          break;
        }
        case 0: {
          this.teamGenView = false;
          this.teamGenEdit = false;
          break;
        }
        default: {
          break;
        }
      }
    } else
      return;
  }

  async createUserRights(userRights, msg) {
    this.showSpinner = true;
    await this._securitySettingSrvc.createUserRights(userRights)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (msg == 'updated')
            this._notifyService.showSuccess(response.messageString ? response.messageString : "Security Setting Updated Successfully.", "", 3000);
          this.isEditMode = false;
          this.getUserRights();
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  async getUserRights() {
    this.showSpinner = true;
    await this._securitySettingSrvc.getUserRights(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CLPRights[]) => {
        if (result) {
          this.clpRights = UtilityService.clone(result);
          if (this.clpRights.length == 0) {
            this.createDefault();
          } else
            this.setData();
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  changeSettings(e, type: string) {
    switch (type) {
      case 'comManView': {
        switch (e) {
          case true: {
            this.offManView = true;
            this.teamManView = true;
            break;
          }
          case false: {
            this.comManEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'comManEdit': {
        switch (e) {
          case true: {
            this.comManView = true;
            this.offManView = true;
            this.offManEdit = true;
            this.teamManView = true;
            this.teamManEdit = true;
            break;
          }
          case false: {
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'comGenView': {
        switch (e) {
          case true: {
            this.offGenView = true;
            this.teamGenView = true;
            break;
          }
          case false: {
            this.comGenEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'comGenEdit': {
        switch (e) {
          case true: {
            this.comGenView = true;
            this.offGenView = true;
            this.offGenEdit = true;
            this.teamGenView = true;
            this.teamGenEdit = true;
            break;
          }
          case false: {
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'offManView': {
        switch (e) {
          case true: {
            break;
          }
          case false: {
            this.comManView = false;
            this.comManEdit = false;
            this.offManEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'offManEdit': {
        switch (e) {
          case true: {
            this.offManView = true;
            break;
          }
          case false: {
            this.comManEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'offGenView': {
        switch (e) {
          case true: {
            break;
          }
          case false: {
            this.comGenView = false;
            this.comGenEdit = false;
            this.offGenEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'offGenEdit': {
        switch (e) {
          case true: {
            this.offGenView = true;
            break;
          }
          case false: {
            this.comGenEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'teamManView': {
        switch (e) {
          case true: {
            break;
          }
          case false: {
            this.comManView = false;
            this.comManEdit = false;
            this.teamManEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'teamManEdit': {
        switch (e) {
          case true: {
            this.teamManView = true;
            break;
          }
          case false: {
            this.comManEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'teamGenView': {
        switch (e) {
          case true: {
            break;
          }
          case false: {
            this.comGenView = false;
            this.comGenEdit = false;
            this.teamGenEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case 'teamGenEdit': {
        switch (e) {
          case true: {
            this.teamGenView = true;
            break;
          }
          case false: {
            this.comGenEdit = false;
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      default: {
        break;
      }

    }
  }

  saveSecuritySetting() {
    this.clpRights[0].cLPCompanyID = this.user.cLPCompanyID;
    this.clpRights[0].userRole = eUserRole.Manager;
    if (this.comManEdit == true) {
      this.clpRights[0].companyReadWrite = eReadWrite.ViewAndEdit;
      if ((this.isShowOfficeSection == true)) {
        this.clpRights[0].officeReadWrite = eReadWrite.ViewAndEdit;
      }
      if (this.isShowTeamSection) {
        this.clpRights[0].teamReadWrite = eReadWrite.ViewAndEdit;
      }
    }
    else if (this.comManView == true) {
      this.clpRights[0].companyReadWrite = eReadWrite.ViewOnly;
      if ((this.isShowOfficeSection == true)) {
        if (this.offManEdit == true) {
          this.clpRights[0].officeReadWrite = eReadWrite.ViewAndEdit;
        }
        else {
          this.clpRights[0].officeReadWrite = eReadWrite.ViewOnly;
        }
      }
      if (this.isShowTeamSection) {
        if (this.teamManEdit == true) {
          this.clpRights[0].teamReadWrite = eReadWrite.ViewAndEdit;
        }
        else {
          this.clpRights[0].teamReadWrite = eReadWrite.ViewOnly;
        }
      }
    }
    else {
      this.clpRights[0].companyReadWrite = eReadWrite.None;
      if ((this.isShowOfficeSection == true)) {
        if (this.offManEdit == true) {
          this.clpRights[0].officeReadWrite = eReadWrite.ViewAndEdit;
        }
        else if (this.offManView == true) {
          this.clpRights[0].officeReadWrite = eReadWrite.ViewOnly;
        }
        else {
          this.clpRights[0].officeReadWrite = eReadWrite.None;
        }
      }
      if (this.isShowTeamSection) {
        if (this.teamManEdit == true) {
          this.clpRights[0].teamReadWrite = eReadWrite.ViewAndEdit;
        }
        else if (this.teamManView == true) {
          this.clpRights[0].teamReadWrite = eReadWrite.ViewOnly;
        }
        else {
          this.clpRights[0].teamReadWrite = eReadWrite.None;
        }
      }

    }
    this.clpRights[1].userRole = eUserRole.General;
    if (this.comGenEdit == true) {
      this.clpRights[1].companyReadWrite = eReadWrite.ViewAndEdit;
      if ((this.isShowOfficeSection == true)) {
        this.clpRights[1].officeReadWrite = eReadWrite.ViewAndEdit;
      }
      if (this.isShowTeamSection) {
        this.clpRights[1].teamReadWrite = eReadWrite.ViewAndEdit;
      }
    }
    else if (this.comGenView == true) {
      this.clpRights[1].companyReadWrite = eReadWrite.ViewOnly;
      if ((this.isShowOfficeSection == true)) {
        if (this.offGenEdit == true) {
          this.clpRights[1].officeReadWrite = eReadWrite.ViewAndEdit;
        }
        else {
          this.clpRights[1].officeReadWrite = eReadWrite.ViewOnly;
        }
      }
      if (this.isShowTeamSection) {
        if (this.teamGenEdit == true) {
          this.clpRights[1].teamReadWrite = eReadWrite.ViewAndEdit;
        }
        else {
          this.clpRights[1].teamReadWrite = eReadWrite.ViewOnly;
        }
      }
    }
    else {
      this.clpRights[1].companyReadWrite = eReadWrite.None;
      if ((this.isShowOfficeSection == true)) {
        if (this.offGenEdit == true) {
          this.clpRights[1].officeReadWrite = eReadWrite.ViewAndEdit;
        }
        else if (this.offGenView == true) {
          this.clpRights[1].officeReadWrite = eReadWrite.ViewOnly;
        }
        else {
          this.clpRights[1].officeReadWrite = eReadWrite.None;
        }
      }
      if (this.isShowTeamSection) {
        if (this.teamGenEdit == true) {
          this.clpRights[1].teamReadWrite = eReadWrite.ViewAndEdit;
        }
        else if (this.teamGenView == true) {
          this.clpRights[1].teamReadWrite = eReadWrite.ViewOnly;
        }
        else {
          this.clpRights[1].teamReadWrite = eReadWrite.None;
        }
      }
    }
    this.status = 'Save';
    this.createUserRights(this.clpRights, 'updated');
  }

  cancelSecuritySetting() {
    this.isEditMode = false;
    this.status = 'Cancel';
  }

  editSecuritySetting() {
    this.isEditMode = true;
  }
  editModeGeneralUser() {
    this.isEditModeGeneralUser = true;
  }

  cancelGeneralUser() {
    this.isEditModeGeneralUser = false;
  }

  setUpGeneralUser() {
    if (this.companyData.shareContacts == true)
      this.shareContacts = true;
    else
      this.shareContacts = false;

    if (this.companyData.secOutlook == 1)
      this.secOutlook = true;
    else
      this.secOutlook = false;

    if (this.companyData.secExcel == true)
      this.secExcel = true;
    else
      this.secExcel = false;

    if (this.companyData.secMarketingTool == 1)
      this.secMarketingTool = true;
    else
      this.secMarketingTool = false;
  }

  async saveCompanyData() {
    this.companyData.shareContacts = this.shareContacts;
    this.companyData.secOutlook = this.secOutlook == true ? 1 : 0;
    this.companyData.secExcel = this.secExcel;
    this.companyData.secMarketingTool = this.secMarketingTool == true ? 1 : 0;
    this.showSpinner = true;
    await this._accountSetupService.CLPCompany_Update(this.encryptedUser, this.companyData)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "General User Setting Updated Successfully.", "", 3000);
          this.isEditModeGeneralUser = false;
          this.getCompanyData();
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }


}

