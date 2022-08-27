import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { GoalSetupListComponent } from '../common/goal-setup-list/goal-setup-list.component';

@Component({
  selector: 'goals-setup',
  templateUrl: './goals-setup.component.html',
  styleUrls: ['./goals-setup.component.css']
})

export class GoalsSetupComponent implements OnInit {
  private encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  showSpinner: boolean = false;
  isExpdTypeGoals: boolean = false;
  expdTypeGoalsName: string = '';
  index: number;
  saveGoal: Subject<void> = new Subject<void>();
  @ViewChild('child') goalSetupList;
  isShowGoalsChild: boolean = true;

  constructor(private _router: Router, public _localService: LocalService,
    private _utilityService: UtilityService) {
  }
  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
        }
        else
          this._router.navigate(['/login']);
      });
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ContactList)
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

  expendStrip(name: string) {
    name != this.expdTypeGoalsName ? this.isExpdTypeGoals = true : this.saveGoal.next();
    this.expdTypeGoalsName == name ? console.log('goals') : this.expdTypeGoalsName = name;
  }

  refreshSetupGoals() {
    this.isShowGoalsChild = false;
    setTimeout(() => { this.isShowGoalsChild = true; }, 0);
  }

}
