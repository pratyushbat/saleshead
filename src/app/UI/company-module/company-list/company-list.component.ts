import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SearchQueryResponse } from '../../../models/search.model';
import { ContactService } from '../../../services/contact.service';
import { ContactCommonSearchService } from '../../../services/shared/contact-common-search.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';

@Component({
    selector: 'company-list',
    templateUrl: './company-list.component.html',
    styleUrls: ['./company-list.component.css']
})
/** company-list component*/
export class CompanyListComponent {
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  roleFeaturePermissions: RoleFeaturePermissions;
  userResponse: UserResponse;
  queryDataLoaded: SearchQueryResponse;
  showBulkCompany: boolean = false;
  constructor(
    public _contactService: ContactService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    public _contactCommonSearchService: ContactCommonSearchService,
    private _ngZone: NgZone, private router: Router) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        this.showSpinner = false;
        if (this.router.url.match('bulk-company')) { console.log('bulk'); this.showBulkCompany = true; }
      })
    }
    else {
      this.showSpinner = false;
      this._router.navigate(['/unauthorized']);
    }
  }
  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.CompanyList)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
            if (this.user?.userRole <= 3) {             
              if (this.roleFeaturePermissions?.view == false)
                this._router.navigate(['/unauthorized', true]);
            }
          }
          else
            this._router.navigate(['/unauthorized']);
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
