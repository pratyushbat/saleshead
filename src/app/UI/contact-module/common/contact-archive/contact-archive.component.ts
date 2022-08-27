import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { isNullOrUndefined } from 'util';
import { ConfigDetails } from '../../../../models/appConfig.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { ContactList, ContactRestore } from '../../../../models/contact.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
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
declare var $: any;

@Component({
  selector: 'contact-archive',
  templateUrl: './contact-archive.component.html',
  styleUrls: ['./contact-archive.component.css'],
  providers: [GridConfigurationService, ContactCommonSearchService]
})

export class ContactArchiveComponent implements OnInit {
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  contactsArchiveData: ContactList[] = [];
  initContactsArchiveData: ContactList[];
  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: '$', title: '  ', width: '40' },
    { field: 'name', title: 'Name', width: '250' },
    { field: 'email', title: 'Email', width: '70' },
    { field: 'companyName', title: 'Company', width: '350' },
    { field: 'address', title: 'Address', width: '120' },
    { field: 'city', title: 'City', width: '80' },
    { field: 'state', title: 'State', width: '80' },
    { field: 'country', title: 'Country', width: '80' },
    { field: 'zip', title: 'Zip', width: '60' },
    { field: 'emailAddress', title: 'Email Address', width: '140' },
    { field: 'phone', title: 'Phone', width: '120' },
    { field: 'userName', title: 'User', width: '120' },
    { field: 'dtModifiedDisplay', title: 'Modified', width: '100' },
    { field: 'dtCreatedDisplay', title: 'Created', width: '90' },
  ];
  reorderColumnName: string = 'name,email,companyName,address:h,city:h,state:h,country:h,zip:h,emailAddress:h,phone,userName,dtModifiedDisplay,dtCreatedDisplay';
  columnWidth: string = 'name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90';
  arrColumnWidth: any[] = ['name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90'];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;

  public mySelection: number[] = [];
  step = 1;
  gridHeight;
  soUrl: any;
  queryDataLoaded: SearchQueryResponse;
  restoreAllContacts: boolean = false;


  sendMailInfo: any = { isShow: false, contactId: 0 };
  mobileColumnNames: string[];
  constructor(public _localService: LocalService,
    private _utilityService: UtilityService,
    private _notifyService: NotificationService,
    private _contactCommonSearchService: ContactCommonSearchService,
    private _ngZone: NgZone,
    private _appConfigService: AppconfigService,
    private _router: Router,
    public _gridCnfgService: GridConfigurationService,
    public _contactService: ContactService
  ) {
    this.gridHeight = this._localService.getGridHeight('499px');
    this._localService.isMenu = true;
    this.subscribeToEvents();
    this._appConfigService.getAppConfigValue(this.encryptedUser, "SO_Site")
      .then(async (result: ConfigDetails) => {
        this.soUrl = result.configValue;
      })
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this.getGridConfiguration();
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }



  private subscribeToEvents(): void {
    this._contactCommonSearchService.contactListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.contactsArchiveData = data;
        this.initContactsArchiveData = data;
        this.step = 2;
        this.restoreAllContacts = false;
      })
    });
    this._contactCommonSearchService.queryListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.queryDataLoaded = data;
        this.step = 2;
        this.restoreAllContacts = false;
      })
    });
  }

  showColumn(columnDef): boolean {
    var value = true;
    if (columnDef) {
      (columnDef == 'email') || (columnDef == 'phone') ? value = false : value = true;
    }
    return value;
  }
  gotoLink(columnName, dataItem) {
    var url = this.soUrl;
    if (columnName) {
      switch (columnName) {
        case "address-card":
        case "name": {
          if (this.user.timeZoneWinId != 0)
            this._router.navigate(['/contact', dataItem.clpUserId, dataItem.contactID]);
          else {
            if (confirm("First , Please select your timezone!!!"))
              this._router.navigate(['/edit-profile', dataItem.clpUserId]);
            else
              return;
          }
          break;
        }
        case "userName": {
          this._router.navigate(['/edit-profile', dataItem.clpUserId]);
          break;
        }
        case "email": {
          $('#sendEmailModal').modal('show');
          this.sendMailInfo.isShow = true;
          this.sendMailInfo.contactId = dataItem?.contactID;
          break;
        }
        default: {
          break;
        }
      }
    }
  }
  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'contact_restore_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('contact_restore_grid').subscribe((value) => this.getArchiveContacts()));

  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'contact_restore_grid').subscribe((value) => this.getGridConfiguration());
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.RestoreContact)
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

  getArchiveContacts() {
    if (!isNullOrUndefined(this._gridCnfgService)) {
      this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('contact_restore_grid');
      this._gridCnfgService.iterateConfigGrid(true, "contact_restore_grid");
    }

  }

  restoreContacts() {
    if (this.restoreAllContacts) {
      if (!isNullOrUndefined(this.queryDataLoaded)) {
        let contactRestoreSelected: ContactRestore = <ContactRestore>{};
        contactRestoreSelected.isRestoreAll = true;
        contactRestoreSelected.contactsToRestore = [];
        contactRestoreSelected.searchQuery = this.queryDataLoaded;
        this.restoreContactApi(contactRestoreSelected);
      }
      else {
        this._notifyService.showError('Could not find the Searched Data', 'Please Try again');
      }
    }
    else {
      let contactRestoreSelected: ContactRestore = <ContactRestore>{};
      contactRestoreSelected.isRestoreAll = false;
      contactRestoreSelected.contactsToRestore = this.mySelection;
      contactRestoreSelected.searchQuery = null;
      this.restoreContactApi(contactRestoreSelected);
    }

  }

  async restoreContactApi(restoreContact: ContactRestore) {
    this.showSpinner = true;

    await this._contactService.restoreContacts(this.encryptedUser, restoreContact, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this.step = 1;
          this._notifyService.showSuccess(result.messageString, 'Contact Restore Successful');
          this.showSpinner = false;
          this.restoreAllContacts = false;
          this.contactsArchiveData = [];
          this.mySelection = [];
        }
        else {
          this.showSpinner = false;
          this.restoreAllContacts = false;
          this.contactsArchiveData = [];
          this.mySelection = [];
        }

      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
        this.restoreAllContacts = false;
        this.contactsArchiveData = [];
        this.mySelection = [];
        this._notifyService.showError('Could not Archived selected Data', 'Some Error Occured');
        this.step = 2;
      });
  }

  cancelArchive() {
    this.step = 2;
    this.restoreAllContacts = false;
    this.contactsArchiveData = [];
    this.mySelection = [];
  }

  onContactArchiveListFilter(inputValue: string): void {
    this.contactsArchiveData = process(this.initContactsArchiveData, {
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
