import { HttpErrorResponse } from '@angular/common/http';
import { Component, DoCheck, Inject, IterableChangeRecord, IterableDiffer, IterableDiffers, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { ContactList } from '../../../../models/contact.model';
import { eExportRequestObjectType, eExportRequestStatus, eFeatures, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { SearchQueryResponse } from '../../../../models/search.model';
import { ContactService } from '../../../../services/contact.service';
import { NotificationService } from '../../../../services/notification.service';
import { AppconfigService } from '../../../../services/shared/appconfig.service';
import { ContactCommonSearchService } from '../../../../services/shared/contact-common-search.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { process } from '@progress/kendo-data-query';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { ContactExportRequest, ContactExportRequestResponse } from '../../../../models/exportRequest.model';
declare var $: any;

@Component({
  selector: 'contact-map',
  templateUrl: './contact-map.component.html',
  styleUrls: ['./contact-map.component.css'],
  providers: [GridConfigurationService, ContactCommonSearchService]
})

export class ContactMapComponent implements OnInit {

  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  contactsMapData: ContactList[] = [];
  initContactsMapData: ContactList[] = [];
  mapRecentContact: ContactExportRequest[] = [];

  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  step = 1;
  gridHeight;
  soUrl: any;
  sendMailInfo: any = { isShow: false, contactId: 0 };
  queryDataLoaded: SearchQueryResponse;
  mapTitle: string;
  contactMapFailed: boolean = false;
  requestStatus = eExportRequestStatus;
  requestType = eExportRequestObjectType;

  private _differ: IterableDiffer<ContactExportRequest>;
  existingLength: number;
  isExisting: boolean = true;
  constructor(public _localService: LocalService,
    private _utilityService: UtilityService,
    private _notifyService: NotificationService,
    private _contactCommonSearchService: ContactCommonSearchService,
    private _ngZone: NgZone,
    private _appConfigService: AppconfigService,
    private _router: Router,
    public _gridCnfgService: GridConfigurationService,
    public _contactService: ContactService,
    differs: IterableDiffers
  ) {
    this._localService.isMenu = true;
    this.subscribeToEvents();
    this._differ = differs.find([]).create(null);
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



  private subscribeToEvents(): void {
    this._contactCommonSearchService.contactListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.contactsMapData = data;
        this.initContactsMapData = data;
        this.step = 2;
      })
    });
    this._contactCommonSearchService.queryListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.queryDataLoaded = data;
        this.step = 2;
      })
    });
  }

  async addMapContacts() {
    this.showSpinner = true;
    await this._contactService.contactMapRequest(this.encryptedUser, this.queryDataLoaded, this.mapTitle, this.user.cLPCompanyID, this.user.cLPUserID)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (!response.messageBool) {
            this.contactMapFailed = true;
            this._notifyService.showError('Could not Map contacts', response.messageString, 4000);
          }
          else {
            this.step = 4;
            this._notifyService.showSuccess('Contact Mapping Success', 'Contact Mapped Successfully', 3000);
          }


          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  onContactMapListFilter(inputValue: string): void {
    this.contactsMapData = process(this.initContactsMapData, {
      filter: {
        logic: "or",
        filters: [
          { field: 'name', operator: 'contains', value: inputValue },
          { field: 'email', operator: 'contains', value: inputValue }

        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }


}
