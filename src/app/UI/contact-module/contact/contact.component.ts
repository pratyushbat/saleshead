import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { CLPUser, FeatureAccess, UserResponse } from '../../../models/clpuser.model';
import { ContactFields, ContactFieldsResponse, ContactLimitedFields, ContactListResponseLtd } from '../../../models/contact.model';
import { ContactHistory, ContactHistoryListResponse } from '../../../models/contactHistory.model';
import { GridColumnsConfiguration, GridColumnsConfigurationResponse } from '../../../models/gridColumnsConfiguration.model';
import { ContactService } from '../../../services/contact.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { ContactSearchService } from '../../../services/shared/contact-search.service';
import { NotificationService } from '../../../services/notification.service';
import { GridColumnsConfigurationService } from '../../../services/gridColumnsConfiguration.service';
import { process, SortDescriptor } from '@progress/kendo-data-query';
import { DataBindingDirective, RowClassArgs } from '@progress/kendo-angular-grid';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SimpleResponse } from '../../../models/genericResponse.model';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./contact.component.css']
})
/** contact component*/
export class ContactComponent implements OnInit {

  showContactDetail: boolean = false;
  showEmailComponent: boolean = false;
  showTextComponent: boolean = false;
  showNoteComponent: boolean = false;
  showTaskComponent: boolean = false;
  loadOtherComponents: boolean = false;
  resetDetailSubject: Subject<boolean> = new Subject<boolean>();

  /** contact ctor */
  routeUserId: number;
  routeContactId: number;
  selectedContactId: number;

  private encryptedUser: string = '';

  showSpinner: boolean = false;
  showContactChecked: boolean = false;
  user: CLPUser;
  contactId;

  contactListResponse: ContactListResponseLtd;
  selectedContact: ContactLimitedFields;

  contactList: ContactLimitedFields[] = [];
  public initContactsData: ContactLimitedFields[] = [];
  contactFieldsResponse: ContactFieldsResponse;
  contactFields: ContactFields;
  contactHistory: ContactHistory[];
  initContactHistory: ContactHistory[];

  //For listView
  public mySelection: number[] = [];
  public sort: SortDescriptor[] = [];
  pageSize: number = 10;
  public skip = 0;
  public isResponsive = true;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;

  columns = [
    { field: 'name', title: 'Name', width: '140' },
    { field: 'handled', title: 'handled', width: '80' }
  ];
  columnWidth: string = 'name:140,handled:80';
  arrColumnWidth: any[] = ['name:140,handled:80'];
  reorderColumnName: string = 'name,handled';
  hiddenColumns: string[] = [];
  arrSortingColumn: any[] = [];
  contactColumnMenuRemovedArr: any[] = [];
  gridColumnsConfigurationResponse: GridColumnsConfigurationResponse;
  contactPanelSizeConfigurationResponse: GridColumnsConfigurationResponse;
  gridColumnsConfig: GridColumnsConfiguration;
  contactPanelSizeConfig: GridColumnsConfiguration;
  gridColumnsConfiguration: GridColumnsConfiguration;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  sortingColumn: string = '';
  featureAccess: FeatureAccess;
  private _leftPanelSize: string = '20%';
  private _rightPanelSize: string = '15%';
  panelsSize: string = 'left:20%,right:15%';
  @ViewChild('activeDashboardId') activeDashboardId: ElementRef;
  contactHistoryListResponse: ContactHistoryListResponse;


  constructor(private fb: FormBuilder,
    public _contactService: ContactService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    public _contactSearchService: ContactSearchService,
    private _route: ActivatedRoute,
    private notifyService: NotificationService,
    public _gridColumnsConfigurationService: GridColumnsConfigurationService,
    private _ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private _router: Router
  ) {
    this._localService.isMenu = true;
    this._contactSearchService.isSearchEditClick = false;
    //Get route Parameters
    this._route.paramMap.subscribe(async params => {
      if (params.has('clpUserId')) {
        this.routeUserId = +params.get('clpUserId');
        this._contactSearchService.routeUserId = this.routeUserId;
      }
      if (params.has('contactID')) {
        this.routeContactId = +params.get('contactID');
        this._contactSearchService.routeContactId = this.routeContactId;
      }
    });
    this.subscribeToEvents();
    this.getContactHistory(this.routeContactId, this.routeUserId);
    //Get route Parameters
  }

  ngOnInit() {
    if (this.routeContactId > 0) {
      this._localService.showCommonComp = 'contact-detail';
      this.selectedContactId = this.routeContactId;
    } else
      this._localService.showCommonComp = '';

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getGridColumnsConfiguration(this.user.cLPUserID, 'contact_contact_list');
          this.getGridColumnsConfiguration(this.user.cLPUserID, 'contact_panel_size');
          this.showContactDetail = false;
          this._localService.getContactFields(this.encryptedUser, this.routeContactId, this.user.cLPCompanyID, this.user.cLPUserID, true).subscribe((value) => console.log());
        }
        else {
          this._contactSearchService.showSpinner = false;
          this._router.navigate(['/login']);
        }
      })
    }
    else {
      this._contactSearchService.showSpinner = false;
      this._router.navigate(['/login']);
    }
  }

  private async authenticateR(callback) {
    this._contactSearchService.showSpinner = true;
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
          this._contactSearchService.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this._contactSearchService.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  getGridColumnsConfiguration(clpUserId, tableName) {
    this._gridColumnsConfigurationService.getGridColumnsConfiguration(this.encryptedUser, clpUserId, tableName)
      .then(result => {
        if (result) {
          if (tableName == 'contact_contact_list') {
            this.gridColumnsConfigurationResponse = UtilityService.clone(result);
            this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
            if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
              this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
            if (this.gridColumnsConfig && this.gridColumnsConfig.sortingColumn)
              this.sortingColumn = this.gridColumnsConfig.sortingColumn
            if (this.gridColumnsConfig && this.gridColumnsConfig.columnWidth)
              this.columnWidth = this.gridColumnsConfig.columnWidth;
            if (this.gridColumnsConfig && this.gridColumnsConfig.pageSize)
              this.pageSize = this.gridColumnsConfig.pageSize;

            this.createGetGridColumnsConfiguration(tableName).subscribe((value) =>
              this.getContacts()
            );
          }
          else if (tableName == 'contact_panel_size') {
            this.contactPanelSizeConfigurationResponse = UtilityService.clone(result);
            this.contactPanelSizeConfig = this.contactPanelSizeConfigurationResponse.gridColumnsConfiguration;
            if (this.contactPanelSizeConfig && this.contactPanelSizeConfig.panelsSize)
              this.panelsSize = this.contactPanelSizeConfig.panelsSize;
            this.createGetGridColumnsConfiguration(tableName).subscribe((value) => this.configContactPanelSize());
          }
        }
        else
          this._contactSearchService.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this._contactSearchService.showSpinner = false;
      });
  }

  createGetGridColumnsConfiguration(gridType) {
    return new Observable(observer => {
      this.copyDataObjectToAPIObject(gridType);
      this._gridColumnsConfigurationService.createGridColumnsConfiguration(this.encryptedUser, this.gridColumnsConfiguration)
        .then(result => {
          if (result) {
            if (gridType == 'contact_contact_list') {
              this.gridColumnsConfigurationResponse = UtilityService.clone(result);
              this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
            }
            if (gridType == 'contact_panel_size') {
              this.contactPanelSizeConfigurationResponse = UtilityService.clone(result);
              this.contactPanelSizeConfig = this.contactPanelSizeConfigurationResponse.gridColumnsConfiguration;
            }
          }
          else
            this._contactSearchService.showSpinner = false;
          observer.next("success");
        }).catch((err: HttpErrorResponse) => {
          this._contactSearchService.showSpinner = false;
          console.log(err);
        });
    });
  }

  async getContacts() {
    this._contactService.getContactsLtdFields(this.encryptedUser, this.routeUserId, this.routeContactId)
      .then(async (result: ContactListResponseLtd) => {
        if (result) {
          this.contactListResponse = UtilityService.clone(result);
          this.contactList = this.contactListResponse.contactList;
          this.selectedContact = this.contactList.find(i => i.contactID == this.routeContactId);
          this.showCommonComponent();
          this.configContactsGrid();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._contactSearchService.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async deleteContacts() {
    this.showSpinner = true;
    this._contactService.deleteContact(this.encryptedUser, this.selectedContact.contactID, this.routeUserId, this.user.slurpyUserId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          console.log(result);
          this.notifyService.showSuccess('Contact deleted successfully', 'Deleted Contact' + this.selectedContact.name, 3000);
          this._router.navigate(['/contacts']);
        }
        else
          this.notifyService.showError('Contact could not be deleted', 'Unable to deleted contact' + this.selectedContact.name, 3000);

        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.notifyService.showError('Contact could not be deleted', 'Unable to deleted contact' + this.selectedContact.name, 3000);
        this.showSpinner = false;
        this._contactSearchService.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }



  showCommonComponent(component?) {
    this.showEmailComponent = false; this.showTextComponent = false; this.showNoteComponent = false; this.showTaskComponent = false;
    var commonComponent = this._localService.showCommonComp;
    switch (commonComponent) {
      case 'email':
        this.showContactDetail = false;
        this.showEmailComponent = true;
        break;
      case 'sms':
        this.showContactDetail = false;
        this.showTextComponent = true;
        break;
      case 'note':
        this.showContactDetail = false;
        this.showNoteComponent = true;
        break;
      case 'task':
        this.showContactDetail = false;
        this.showTaskComponent = true;
        break;
      default:
        break;
    }
  }

  async getContactFields(contactId, companyID, userId, isLoad: string = '') {
    this._contactSearchService.showSpinner = true;
    this.contactHistory = undefined;
    this._contactService.contactFields_Get(this.encryptedUser, contactId, companyID, userId)
      .then(async (result: ContactFieldsResponse) => {
        if (result) {
          this.contactFieldsResponse = UtilityService.clone(result);
          this.contactFields = this.contactFieldsResponse.contactFields;
          this.sendemaildatato_sendemail()
          if (isLoad == '')
            this.mySelection[0] = this.contactFields.contactID.fieldValue;
          this._contactSearchService.showSpinner = false;
        }
        else {
          this._contactSearchService.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._contactSearchService.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getContactHistory(contactId: number, userId: number) {
    this._contactSearchService.showSpinner = true;

    this._contactService.contactHistory_Get(this.encryptedUser, contactId, userId)
      .then(async (result: ContactHistoryListResponse) => {
        if (result) {
          this.contactHistoryListResponse = UtilityService.clone(result);
          this.contactHistory = this.contactHistoryListResponse.contactHistory;
          this.initContactHistory = this.contactHistoryListResponse.contactHistory;
          //this._contactSearchService.showSpinner = false;
        }
        else {
          this._contactSearchService.showSpinner = false;
          this.contactHistory = this.initContactHistory;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._contactSearchService.showSpinner = false;
        this.contactHistory = this.initContactHistory;
        this._utilityService.handleErrorResponse(err);
      });
  }

  configContactsGrid() {
    if (!isNullOrUndefined(this.contactListResponse) && !isNullOrUndefined(this.contactListResponse.contactList)) {
      if (this.gridColumnsConfig) {
        if (this.gridColumnsConfig.reorderColumnName) {
          this.hiddenColumns = [];
          var reorderColumns = this.gridColumnsConfig.reorderColumnName;
          var reorderColumnsArr = reorderColumns.split(',');
          var columnWidths = this.gridColumnsConfig.columnWidth;
          var columnWidthsArr = columnWidths.split(',');
          var sortingColumns = this.gridColumnsConfig.sortingColumn;
          var sortingColumnsArr = [];
          if (sortingColumns)
            sortingColumnsArr = sortingColumns.split(',');
          var isHiddenColumn: boolean = false;
          if (reorderColumnsArr.length > 0) {
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              if (reorderColumnsArr[i].includes(':h')) {
                isHiddenColumn = true;
                var field = reorderColumnsArr[i].split(':')[0];
                this.hiddenColumns.push(field);
              }
            }
          }
          if (!isHiddenColumn) {
            this.columns = [];
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              var width: string = '';
              for (var j = 0; j < columnWidthsArr.length; j++) {
                if (columnWidthsArr[j].includes(reorderColumnsArr[i])) {
                  width = columnWidthsArr[j].split(':')[1];
                }
              }
              if (width == '')
                reorderColumnsArr[i] == 'name' ? width = '140' : reorderColumnsArr[i] == 'handled' ? width = '80' : '';
              this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i], width: width != '' ? width : '' });
            }
          }
          else if (isHiddenColumn) {
            this.columns = [];
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              var width: string = '';
              for (var j = 0; j < columnWidthsArr.length; j++) {
                if (columnWidthsArr[j].includes(reorderColumnsArr[i])) {
                  width = columnWidthsArr[j].split(':')[1];
                }
              }
              if (width == '')
                reorderColumnsArr[i].split(':')[0] == 'name' ? width = '140' : reorderColumnsArr[i].split(':')[0] == 'handled' ? width = '80' : '';
              this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
            }
          }


          if (sortingColumnsArr.length > 0) {
            for (var k = 0; k < sortingColumnsArr.length; k++) {
              var dir: any = sortingColumnsArr[k].split(':')[1];
              this.sort.push({ field: sortingColumnsArr[k].split(':')[0], dir: dir });
            }
          }

        }
        else if (this.gridColumnsConfig.actualColumns) {
          var actualColumn = this.gridColumnsConfig.actualColumns;
          var actualColumnsArr = actualColumn.split(',');
          var columnWidths = this.gridColumnsConfig.columnWidth;
          var columnWidthsArr = columnWidths.split(',');
          var sortingColumns = this.gridColumnsConfig.sortingColumn;
          var sortingColumnsArr: any[] = [];
          if (sortingColumns)
            sortingColumnsArr = sortingColumns.split(',');
          this.columns = [];
          for (var i = 0; i < actualColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].includes(actualColumnsArr[i])) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              actualColumnsArr[i] == 'name' ? width = '140' : actualColumnsArr[i] == 'handled' ? width = '80' : '';
            this.columns.push({ field: actualColumnsArr[i], title: actualColumnsArr[i], width: width != '' ? width : '' });
          }

          if (sortingColumnsArr.length > 0) {
            for (var k = 0; k < sortingColumnsArr.length; k++) {
              var dir: any = sortingColumnsArr[k].split(':')[1];
              this.sort.push({ field: sortingColumnsArr[k].split(':')[0], dir: dir });
            }
          }

        }
      }

      this.contactList = this.contactListResponse.contactList;
      this.initContactsData = this.contactList;
      //this._contactSearchService.showSpinner = false;
      this.contactColumnMenuRemovedArr = this.columns;
    } else {
      this._contactSearchService.showSpinner = false;
      this.contactColumnMenuRemovedArr = this.columns;
    }
  }

  configContactPanelSize() {
    if (this.contactPanelSizeConfig) {
      var panelsSize = this.contactPanelSizeConfig.panelsSize;
      var panelsSizeArr = panelsSize.split(',');

      var leftSize = '';
      var rightSize = '';
      for (var j = 0; j < panelsSizeArr.length; j++) {
        var splitArr = panelsSizeArr[j].split(':');
        if (splitArr.length > 0 && splitArr[0].includes('left'))
          leftSize = splitArr[1];
        if (splitArr.length > 0 && splitArr[0].includes('right'))
          rightSize = splitArr[1];
      }
      this._leftPanelSize = leftSize ? leftSize : '20%';
      this._rightPanelSize = rightSize ? rightSize : '15%';
    }
  }

  rowSelectionChange(e) {
    if (e.selectedRows && e.selectedRows.length > 0) {
      var selecteRow = e.selectedRows[0].dataItem;
      var userId = this.user.cLPUserID;
      var companyID = this.user.cLPCompanyID;
      this.routeContactId = selecteRow.contactID;
      this.selectedContactId = +selecteRow.contactID;
      this._localService.sendcontactId(this.selectedContactId);
      this.showContactChecked = false;
      this.resetDetailSubject.next(true);
      //this._localService.showCommonComp = '';
      //this._localService.showCommonComp == 'contact-detail' ? this._localService.showCommonComp = 'already-detail' : null;
      this.getContacts();
      this.getContactHistory(this.routeContactId, userId);
    }
  }

  public onPageChange(state: any): void {
    if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
      this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
    if (this.gridColumnsConfig && this.gridColumnsConfig.sortingColumn)
      this.sortingColumn = this.gridColumnsConfig.sortingColumn
    if (this.gridColumnsConfig && this.gridColumnsConfig.columnWidth)
      this.columnWidth = this.gridColumnsConfig.columnWidth;

    var gridType = 'contact_contact_list';
    this.pageSize = state.take;
    this.gridColumnsConfigurationCreate(gridType);
  }

  public onContactsFilter(inputValue: string): void {
    this.contactList = process(this.initContactsData, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'name',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'email',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'companyName',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'address',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'city',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'state',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'country',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'phone',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'userName',
            operator: 'contains',
            value: inputValue
          }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  changeContactSort(event) {
    if (event) {
      var selectedValue = event.target.value;
      var result = { data: [] };
      switch (selectedValue) {
        case "created":
          result = {
            data: process(this.contactList, { sort: [{ field: 'dtCreated', dir: 'desc' }] }).data,
          };
          this.contactList = result.data;
          this.notifyService.showSuccess("Contacts sorted on " + selectedValue + "!", "", 3000);
          break;
        case "updated":
          result = {
            data: process(this.contactList, { sort: [{ field: 'dtModified', dir: 'desc' }] }).data,
          };
          this.contactList = result.data;
          this.notifyService.showSuccess("Contacts sorted on " + selectedValue + "!", "", 3000);
          break;
        default:
          this.contactList = this.initContactsData;
          break;
      }
    }
  }

  private subscribeToEvents(): void {
    this._contactSearchService.contactListChanged.subscribe((data) => {
      this._ngZone.run(() => {
        this.contactList = data;
        this.initContactsData = data;
      })
    })

    this._localService.handledReceived.subscribe((value: boolean) => {
      this._ngZone.run(() => {
        this.showContactChecked = value;
        this.getContactHistory(this.routeContactId, this.routeUserId);
      });
    });

    this._localService.hideCommonComponent.subscribe((value: string) => {
      this._ngZone.run(() => {
        switch (value) {
          case 'email':
            this.showEmailComponent = false;
            break;
          case 'sms':
            this.showTextComponent = false;
            break;
          case 'note':
            this.showNoteComponent = false;
            break;
          case 'task':
            this.showTaskComponent = false;
            break;
          case 'contact-detail':
            this.showContactDetail = false;
            break;
          default:
            break;
        }
      });
    });
  }

  copyDataObjectToAPIObject(Action: string) {
    switch (Action) {
      case "contact_contact_list":
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'contact_contact_list',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,handled",
          panelsSize: ''
        }
        break;
      case "contact_panel_size":
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'contact_panel_size',
          sortingColumn: '',
          reorderColumnName: '',
          columnWidth: '',
          pageSize: 0,
          actualColumns: '',
          panelsSize: this.panelsSize
        }
        break;
      default:
        break;
    }
  }

  gridColumnsConfigurationCreate(gridType) {
    this.copyDataObjectToAPIObject(gridType);
    this._gridColumnsConfigurationService.createGridColumnsConfiguration(this.encryptedUser, this.gridColumnsConfiguration)
      .then(result => {
        if (result) {
          this._gridColumnsConfigurationService.getGridColumnsConfiguration(this.encryptedUser, this.user.cLPUserID, gridType)
            .then(result => {
              if (result) {
                if (gridType == 'contact_contact_list') {
                  this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                  this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                }
              }
              else {
              }
            }).catch((err: HttpErrorResponse) => {
              console.log(err);
            });
        }
        else {
        }
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
      });

  }

  sortChange(gridType, e) {
    this.arrSortingColumn = [];
    if (gridType == 'contact_contact_list') {
      if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
        this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
      if (this.gridColumnsConfig && this.gridColumnsConfig.pageSize)
        this.pageSize = this.gridColumnsConfig.pageSize;
      if (e.length > 0) {
        for (var i = 0; i < e.length; i++) {
          if (e[i].field != '$')
            this.arrSortingColumn.push(e[i].field + ':' + e[i].dir);
        }
        var result = this.arrSortingColumn.filter(e => !e.includes('$'));
        result = result.filter((a, b) => result.indexOf(a) === b)
        var sortingStr = result.join();
        this.sortingColumn = sortingStr;
      }
    }
    this.gridColumnsConfigurationCreate(gridType);
  }

  columnResize(gridType, e) {
    var diffColWidth = 0;
    var hiddenColLen = gridType == 'contact_contact_list' ? this.hiddenColumns.length : 0;
    var totalColumns = 6 - (hiddenColLen ? hiddenColLen : 0);
    if (e.length > 0) {
      var diff = e[0].newWidth - e[0].oldWidth;
      diffColWidth = Math.floor(diff / totalColumns);
    }
    if (gridType == 'contact_contact_list') {
      if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
        this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
      if (this.gridColumnsConfig && this.gridColumnsConfig.pageSize)
        this.pageSize = this.gridColumnsConfig.pageSize;
      if (this.gridColumnsConfig.columnWidth) {
        var columnWidths = this.gridColumnsConfig.columnWidth;
        var columnWidthsArr = columnWidths.split(',');
        for (var j = 0; j < columnWidthsArr.length; j++) {
          var splitField = columnWidthsArr[j].split(':');
          if (splitField.length > 0 && splitField[0] == e[0].column.field)
            columnWidthsArr[j] = e[0].column.field + ':' + e[0].newWidth;
          else {
            var field: any = columnWidthsArr[j].split(':')[0];
            var width = columnWidthsArr[j].split(':')[1];
            var diffWidth: any = Math.floor(Number(width) - diffColWidth);
            columnWidthsArr[j] = field + ":" + diffWidth;
          }

        }
        var result = columnWidthsArr.filter(x => !x.includes('$'));
        result = result.filter((a, b) => result.indexOf(a) === b)
        var resizeStr = result.join();
        this.columnWidth = resizeStr;
      }
      else {
        for (var j = 0; j < this.arrColumnWidth.length; j++) {
          var arrSplitField = this.arrColumnWidth[j].split(':');
          if (arrSplitField.length > 0 && arrSplitField[0] == e[0].column.field)
            this.arrColumnWidth[j] = e[0].column.field + ':' + e[0].newWidth;
          else {
            var field: any = this.arrColumnWidth[j].split(':')[0];
            var widthR = this.arrColumnWidth[j].split(':')[1];
            var diffWidth: any = Math.floor(Number(widthR) - diffColWidth);
            this.arrColumnWidth[j] = field + ":" + diffWidth;
          }
        }
        var columnWidthresult = this.arrColumnWidth.filter(x => !x.includes('$'));
        columnWidthresult = columnWidthresult.filter((a, b) => columnWidthresult.indexOf(a) === b)
        var resizeStrResult = columnWidthresult.join();
        this.columnWidth = resizeStrResult;
      }
    }
    this.gridColumnsConfigurationCreate(gridType);
  }

  public onVisibilityChange(e: any, gridType, grid): void {
    if (gridType == 'contact_contact_list') {
      e.columns.forEach(column => {
        if (column.hidden == true) {
          var obj = this.contactColumnMenuRemovedArr.find(col => col.field === column.field);
          this.hiddenColumns.push(obj.field);
          obj.field = obj.field + ':h';

        }
        else if (column.hidden == false) {
          for (var j = 0; j < this.columns.length; j++) {
            if (this.columns[j].title.charAt(0).toUpperCase() + this.columns[j].title.slice(1) == column.title) {
              var splitValueArr = this.contactColumnMenuRemovedArr[j].field.split(':');
              if (splitValueArr.length > 0) {
                this.contactColumnMenuRemovedArr[j].field = this.contactColumnMenuRemovedArr[j].field.split(':')[0];

                var index = this.hiddenColumns.indexOf(this.contactColumnMenuRemovedArr[j].field);
                this.hiddenColumns.splice(index, 1);
              }
            }
          }

        }

        if (this.hiddenColumns.length > 0) {
          for (var i = 0; i < this.hiddenColumns.length; i++) {
            for (var j = 0; j < this.contactColumnMenuRemovedArr.length; j++) {
              if (this.contactColumnMenuRemovedArr[j].field === this.hiddenColumns[i]) {
                var field = this.hiddenColumns[i];
                this.contactColumnMenuRemovedArr[j].field = field + ':h';
              }
            }
          }
        }

      });

      var mappedArr = this.contactColumnMenuRemovedArr.map(a => a.field);
      var result = mappedArr.filter(e => !e.includes('$'));
      var reorderStr = result.join();

      if (this.hiddenColumns.length > 0) {
        this.hiddenColumns.forEach(column => {
          for (var j = 0; j < this.columns.length; j++) {
            var splitField = this.columns[j].field.split(':');
            if (splitField.length > 0 && splitField[0] == column) {
              this.columns[j].field = column;
            }
          }
        });
      }

      var columnWidthArr = [];
      var widthColumnArr = this.contactColumnMenuRemovedArr;
      for (var i = 0; i < widthColumnArr.length; i++) {
        if (widthColumnArr[i].field)
          columnWidthArr.push(widthColumnArr[i].field + ':' + widthColumnArr[i].width);
      }
      var result = columnWidthArr.filter(e => !e.includes('$'));
      var widthColumnsStr = result.join();

      this.columnWidth = widthColumnsStr;
      this.reorderColumnName = reorderStr;
    }

    this.gridColumnsConfigurationCreate(gridType);
    this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      grid.autoFitColumns();
      grid.resizeColumn;
    });
  }

  //For Panels size configuration
  public get leftPanelSize(): string {
    return this._leftPanelSize;
  }

  public set leftPanelSize(newSize: string) {
    this._leftPanelSize = newSize;
  }

  public get rightPanelSize(): string {
    return this._rightPanelSize;
  }

  public set rightPanelSize(newSize: string) {
    this._rightPanelSize = newSize;
  }

  panelSizeChange(panelName, size) {
    if (panelName == 'left') {
      var leftPanelSize = this._leftPanelSize.slice(0, 5);
      this._leftPanelSize = leftPanelSize.includes('%') ? leftPanelSize : leftPanelSize + '%';
    }
    else if (panelName == 'right') {
      var rightPanelSize = this._rightPanelSize.slice(0, 5);
      this._rightPanelSize = rightPanelSize.includes('%') ? rightPanelSize : rightPanelSize + '%';
    }
    var gridType = 'contact_panel_size';
    this.panelsSize = 'left:' + this._leftPanelSize + ',' + 'right:' + this.rightPanelSize;
    this.gridColumnsConfigurationCreate(gridType);
  }
  //For Panels size configuration
  sendemaildatato_sendemail() {
    if (this.contactFields.eBlastAddress.fieldValue == 0 || this.contactFields.eBlastAddress.fieldValue == 1) {
      this._localService.sendEmlIdToEmail(this.contactFields.email.fieldValue);
    } else if (this.contactFields.eBlastAddress.fieldValue == 2) {
      this._localService.sendEmlIdToEmail(this.contactFields.email2.fieldValue);
    } else {
      this._localService.sendEmlIdToEmail(this.contactFields.email2.fieldValue);
    }
  }

  public rowCallback(context: RowClassArgs): any {
    if (context.dataItem.contactID == this.routeContactId) {
      return {
        passive: true
      };
    }
  }

  editContact(activeDashboardId) {
    this._localService.showCommonComp = 'contact-detail';
    this.showCommonComponent();
    this._localService.scrollTop(activeDashboardId);
    this.showContactDetail = true;
    this._localService.showMoreOrLess();
  }



}
