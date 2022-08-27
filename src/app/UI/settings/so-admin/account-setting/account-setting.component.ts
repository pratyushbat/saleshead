import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, FeatureAccess, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.css']
})

export class AccountSettingComponent implements OnInit {
  showSpinner: boolean = false;
  reloadAccount: boolean = true;
  selectedTab = 0;
  isLoadMore: boolean = false;
  toggleCommon: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  password: string = '';
  adminIdSelected: any;
  companyName: string;

  constructor(
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _notifyService: NotificationService,
    private _router: Router
  ) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this.getAccountSetting();
        else
          this._router.navigate(['/login']);
      });
    }
    else
      this._router.navigate(['/login']);
  }

  public onTabSelect(e) {
    this.selectedTab = e.index

  }
  getSelectedCompanyName(event: string) {

    this.companyName = event;
    this._localService.sendCompanyName(this.companyName);
  }
  openApproachTab(event) {
    this.selectedTab = 0;
    this.adminIdSelected = event;
    this.reloadAccount = false;
    setTimeout(() => {
      this.reloadAccount = true;
    }, 0);

  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.SOAccountSetup)
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

  async getAccountSetting() {

  }
  onLessTabs() {
    if (this.selectedTab > 10)
      this.selectedTab = 0
    else
      return;
  }
}
