import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SearchQueryResponse } from '../../../models/search.model';
import { ContactService } from '../../../services/contact.service';
import { CustomActionService } from '../../../services/custom-action.service';
import { ContactCommonSearchService } from '../../../services/shared/contact-common-search.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';

@Component({
    selector: 'manage-duplicate',
    templateUrl: './manage-duplicate.component.html',
    styleUrls: ['./manage-duplicate.component.css']
})
export class ManageDuplicateComponent {
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  roleFeaturePermissions: RoleFeaturePermissions;
  userResponse: UserResponse;
  queryDataLoaded: SearchQueryResponse;
  constructor(
    public _contactService: ContactService,
    private _customActionService: CustomActionService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    public _contactCommonSearchService: ContactCommonSearchService,
    private _ngZone: NgZone) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (isNullOrUndefined(this.user))
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }
  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ManageDuplicates)
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
  
}
