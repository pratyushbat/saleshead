import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { ContactList } from '../../../models/contact.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SearchQueryResponse } from '../../../models/search.model';
import { ContactService } from '../../../services/contact.service';
import { ContactCommonSearchService } from '../../../services/shared/contact-common-search.service';
import { ContactSearchService } from '../../../services/shared/contact-search.service';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { BulckAction, BulkActionResponse } from '../../../models/bulkActionContact';
import { CustomActionService } from '../../../services/custom-action.service';
declare var $: any;

@Component({
  selector: 'app-bulk-contact-actions',
  templateUrl: './bulk-contact-actions.component.html',
  styleUrls: ['./bulk-contact-actions.component.css'],
  providers: [GridConfigurationService, ContactCommonSearchService]
})
export class BulkContactActionsComponent {
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  roleFeaturePermissions: RoleFeaturePermissions;
  contactsArchiveData: ContactList[] = [];
  bulkActionResponse: BulkActionResponse;
  public fieldDropdown: [];
  public editTypeDropdown: [];
  sendMailInfo: any = { isShow: false, contactId: 0 };
  userResponse: UserResponse;
  initContactsArchiveData: ContactList[];
  queryDataLoaded: SearchQueryResponse;
  constructor(
    public _contactService: ContactService,
    private _customActionService: CustomActionService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    private _contactCommonSearchService: ContactCommonSearchService,
    public _gridCnfgService: GridConfigurationService,
    public _contactSearchService: ContactSearchService,
    private _ngZone: NgZone) {
    this._localService.isMenu = true;
    this.subscribeToEvents();
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
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.BulkContactActions)
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
  private subscribeToEvents(): void {
    this._contactCommonSearchService.contactListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.contactsArchiveData = data;
        this.initContactsArchiveData = data;
        console.log(data);
      })
    });
    this._contactCommonSearchService.queryListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.queryDataLoaded = data;
        console.log(data);
      })
    });
  }
}
