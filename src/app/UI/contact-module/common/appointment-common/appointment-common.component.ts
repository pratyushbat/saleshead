import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { ClickTemplate, ClickTrackingResponse, filterUser } from '../../../../models/clickTracking.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ClickTrackingService } from '../../../../services/click-tracking.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-appointment-common',
  templateUrl: './appointment-common.component.html',
  styleUrls: ['./appointment-common.component.css']
})
export class AppointmentCommonComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;

  toUserlist: any[] = [];
  public clickUser: filterUser[];
  public clickTemplate: ClickTemplate[];
  fromUserlist: any[] = [];
  @ViewChild('selectedRole') elementRole: any;
  @ViewChild('frmList') elementFromListBox: any;

  constructor(private _notifyService: NotificationService,
    private fb: FormBuilder,
    public _localService: LocalService,
    private _clickTrackingService: ClickTrackingService,
    private _utilityService: UtilityService,
    private _router: Router,) {
    this._localService.isMenu = true;

  }

  ngOnInit(): void {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getclickTrackingLoad();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.None)
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

  async getclickTrackingLoad() {
    this.showSpinner = true;
    await this._clickTrackingService.getClickTrackingLoad(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, 0)
      .then(async (result: ClickTrackingResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.fromUserlist = response.filterUser;
          this.clickTemplate = response.clickTemplate;
          this.showSpinner = false;
          if (!isNullOrUndefined(this.fromUserlist))
            this.toUserlist.push(this.fromUserlist.filter(i => i.key == this.user.cLPUserID)[0]);
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

  cancelTextMsg() {

  }
  //For darg & drop user from One List To another  In Progress

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  selectAll() {
    for (var i = 0; i < this.fromUserlist.length; i++) {
      if (!this.toUserlist.includes(i => i.key == this.fromUserlist[i].key)) {
        this.toUserlist.push(this.fromUserlist[i]);
      }
    }
    this.fromUserlist = [];
  }

  unSelectAll() {
    for (var i = 0; i < this.toUserlist.length; i++) {
      if (!this.fromUserlist.includes(i => i.key == this.toUserlist[i].key)) {
        this.fromUserlist.push(this.toUserlist[i]);
      }
    }
    this.toUserlist = [];
  }

  fromList_Onclick(e: any) {
  }
}
