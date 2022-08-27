import { NgModule, Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormControl, FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { isNullOrUndefined, isNull, isNumber } from 'util';

import { DataBindingDirective, DataStateChangeEvent, NumericFilterCellComponent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { process, SortDescriptor, State, DataResult } from '@progress/kendo-data-query';
import { observe } from '@progress/kendo-angular-grid/dist/es2015/utils';

import { ContactService } from '../../../services/contact.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { LocalService } from '../../../services/shared/local.service';
import { GridColumnsConfigurationService } from '../../../services/gridColumnsConfiguration.service';
import { SearchContactService } from '../../../services/Searchcontact.service';
import { NotificationService } from '../../../services/notification.service';
import { AppconfigService } from '../../../services/shared/appconfig.service';

import { ContactList, ContactListResponse } from '../../../models/contact.model';
import { CLPUser, FeatureAccess, UserResponse } from '../../../models/clpuser.model';
import { GridColumnsConfiguration, GridColumnsConfigurationByUserResponse, GridColumnsConfigurationResponse } from '../../../models/gridColumnsConfiguration.model';
import { Group, Item, keyValue, Search, SearchItem, SearchItemListResponse, SearchListResponse, SearchOperatorsMap, SearchQuery, SearchQueryResponse } from '../../../models/search.model';
import { ConfigDetails } from '../../../models/appConfig.model';
import { SimpleResponse } from '../../../models/genericResponse.model';

import { Key } from 'readline';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { ContactSearchService } from '../../../services/shared/contact-search.service';
import { EventStyleArgs, SchedulerEvent } from '@progress/kendo-angular-scheduler';
declare var $: any;

@Component({
  selector: 'app-contact-list',
  templateUrl: './contactList.component.html',
  styleUrls: ['./contactList.component.css']
})

export class ContactListComponent implements OnInit {
  public downloadFileName: string = "ContactsList.xlsx";
  public downloadPdfFileName: string = "ContactsList.pdf";
  exportColumnName = [
    { field: 'name', title: 'Name', width: '200' },
    { field: 'emailAddress', title: 'Email Address', width: '400' },
    { field: 'companyName', title: 'Company', width: '200' },
    { field: 'address', title: 'Address', width: '200' },
    { field: 'city', title: 'City', width: '100' },
    { field: 'state', title: 'State', width: '100' },
    { field: 'country', title: 'Country', width: '100' },
    { field: 'zip', title: 'Zip', width: '80' },
    { field: 'phone', title: 'Phone', width: '100' },
    { field: 'userName', title: 'User', width: '150' },
    { field: 'dtModifiedDisplay', title: 'Modified', width: '100' },
    { field: 'dtCreatedDisplay', title: 'Created', width: '100' },
  ]
  showSpinner: boolean = false;
  loadContacts: boolean = false;
  loadRecentContacts: boolean = false;
  public contactsData: any[];
  public initContactsData: any[];
  public gridDataCount: DataResult;
  public mySelection: string[] = [];
  public sort: SortDescriptor[] = [];
  public recentSelectionKey: string[] = [];
  public recentContactsData: any[];
  public initRecentContactsData: any[];
  public recentSort: SortDescriptor[] = [];

  private encryptedUser: string = '';
  currentUrl: string = '';
  contactListResponse: ContactListResponse;
  recentContactListResponse: ContactListResponse;
  contactList: ContactList[] = [];
  recentContactList: ContactList[] = [];
  item: Item;
  items: Item[] = <Item[]>{};
  search: Search;
  searchItemListResponse: SearchItemListResponse;
  searchListResponse: SearchListResponse;
  searchQuery: SearchQuery = <SearchQuery>{};
  searchQueries: SearchQuery[];
  searchQueryList: SearchQuery[] = [];
  searchQueriesForm: FormGroup;
  saveSearchForm: FormGroup;
  searchItems: SearchItem[] = <SearchItem[]>{};
  searchFilterItem: SearchItem[];
  groups: Group[] = [];
  searchQueryResponse: SearchQueryResponse;
  savedsearchQueryResponse: SearchQueryResponse;
  isGroup: boolean = false;
  savedQuery_Filter: keyValue[] = [];
  savedQuery_response: SimpleResponse;
  IsSaveSearch: boolean = false;
  isDefaultSelection: boolean;

  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  sendMailInfo: any = { isShow: false, contactId: 0 };

  gridColumnsConfiguration: GridColumnsConfiguration;
  gridColumnsConfigurationResponse: GridColumnsConfigurationResponse;
  gridColumnsConfig: GridColumnsConfiguration;
  gridColumnsConfigurationResponseRecent: GridColumnsConfigurationResponse;
  gridColumnsConfigRecent: GridColumnsConfiguration;
  reorderColumnName: string = 'name,email,companyName,address:h,city:h,state:h,country:h,zip:h,emailAddress:h,phone,userName,dtModifiedDisplay,dtCreatedDisplay';
  reorderColumnNameRecent: string = 'name,email,companyName,address:h,city:h,state:h,country:h,zip:h,emailAddress:h,phone,userName,dtModifiedDisplay,dtCreatedDisplay';
  columnWidth: string = 'name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90';
  recentColumnWidth: string = 'name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90';
  arrColumnWidth: any[] = ['name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90'];
  arrColumnWidthRecent: any[] = ['name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90'];
  sortingColumn: string = 'dtCreatedDisplay:desc';
  recentSortingColumn: string = 'dtCreatedDisplay:desc';
  arrSortingColumn: any[] = [];
  arrSortingColumnRecent: any[] = [];
  pageSize: number = 10;
  recentPageSize: number = 10;

  _colSpan: number = 0;

  //For dynamic columns
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

  searchItemValue: FormControl = new FormControl();
  kv_MultiSelect: keyValue[] = [];
  searchOperators: SearchOperatorsMap[] = [];

  recentColumns: any[] = [];
  contactColumnMenuRemovedArr: any[] = [];
  recentColumnMenuRemovedArr: any[] = [];
  hiddenColumns: string[] = [];
  hiddenColumnsRecent: string[] = [];
  valueSelected: string;

  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  @ViewChild(DataBindingDirective) dataBindingRecent: DataBindingDirective;

  isSearchSubmit: boolean = false;
  group = <Group>{ items: [] };
  delete_string: string = '';
  savedQueryValue: string = '0';
  isDrpSavedQueryChanged: boolean = false;
  isEditSavedSearch: boolean = false;
  soUrl: any;
  mySOUrl: any;
  isNewRowAdded: any;
  itemData_user_all: Item[] = <Item[]>{};
  isNewRowsAddedOnLoad: any;
  private getContactsSearchSubscription: Subscription;
  featureAccess: FeatureAccess;
  public state: State = {
    skip: 0,
    take: 1000
  };
  gridHeight;
  mobileColumnNames: string[] = [];

  //Calender
  public isShowFirstMonth: boolean = false;
  public isshowSecondMonth: boolean = false;
  public nextMonthDate: Date;

  constructor(
    private fb: FormBuilder,
    public _contactService: ContactService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    private _route: ActivatedRoute,
    public _gridColumnsConfigurationService: GridColumnsConfigurationService,
    private _searchContactService: SearchContactService,
    private _appConfigService: AppconfigService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef,
    private notifyService: NotificationService,
    public _contactSearchService: ContactSearchService,
    private ngZone: NgZone
  ) {
  
    if ($(window).width() >= 768 && $(window).width() <= 1024)
      this.mobileColumnNames = ['phone', 'name', 'email', 'companyName'];
    else if ($(window).width() < 768)
      this.mobileColumnNames = ['phone', 'name'];
    else
      this.mobileColumnNames = ['phone', 'name'];

    this.gridHeight = this._localService.getGridHeight('499px');

    this._localService.isMenu = true;
    this._appConfigService.getAppConfigValue(this.encryptedUser, "SO_Site")
      .then(async (result: ConfigDetails) => {
        this.soUrl = result.configValue;
      })
    this._appConfigService.getAppConfigValue(this.encryptedUser, "MySO_URL").
      then(async (result: ConfigDetails) => {
        this.mySOUrl = result.configValue;
      })
    _router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        var url = event.url;
        var splitUrl = url?.split('/', 4);
        this.currentUrl = splitUrl.length > 0 ? splitUrl[1] : '';
      }
    });
  }

  ngOnInit() {
    var self = this;
    $(function () {
      $('body').on('click', 'td', function (e) {
        if (e.currentTarget.className == "group-column group-column-start" || e.currentTarget.className == "even-grouping group-column-start") {
          var current = self._router.url;
          var splitUrl = current ? current.split('/', 4) : '';
          var splitUrl2 = splitUrl.length > 0 ? splitUrl[1].split('?', 2) : '';
          var currentUrl = splitUrl2.length > 0 ? splitUrl2[0] : 'contacts';
          var grpToDelete = e.currentTarget.id.split("-")[1];
          if (isNumber(+grpToDelete)) {
            self.groups.splice(+grpToDelete, 1);
            self.resetColspanForAllItems();
            self.drawGroup();
            if (currentUrl == 'contacts')
              self.notifyService.showSuccess("Group has been deleted successfully!", "", 2000);
          }
        }
      });
    });

    this.showSpinner = true;
    this.searchQueriesForm = this.prepareSearchQueriesForm();

    this.saveSearchForm = this.prepareSaveSearchForm();
    this.saveSearchForm.reset();
    this.recentColumns = this.columns;
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getAllGridColumnsConfigurationByUser();
          this.getGridColumnsConfiguration(this.user.cLPUserID, 'contactGrid');
          this.getGridColumnsConfiguration(this.user.cLPUserID, 'recentContactGrid');

          this.getContactSearch();
        }
        else
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

  async getContacts() {
    this.loadContacts = true;
    var userId = this.user.cLPUserID;
    await this._contactService.getContacts(this.encryptedUser, userId)
      .then(async (result: ContactListResponse) => {
        if (result) {
          this.contactListResponse = UtilityService.clone(result);
          this.configContactsGrid();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.loadContacts = false;
        this.showSpinner = false;
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
            this.columns = [
              { field: '$', title: ' ', width: '40' },
              { field: '$', title: '  ', width: '40' },
            ];
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              var width: string = '';
              for (var j = 0; j < columnWidthsArr.length; j++) {
                if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                  width = columnWidthsArr[j].split(':')[1];
                }
              }
              if (width == '')
                reorderColumnsArr[i] == 'name' ? width = '250' : reorderColumnsArr[i] == 'email' ? width = '70' : reorderColumnsArr[i] == 'companyName' ? width = '350' : reorderColumnsArr[i] == 'address' ? width = '120' : reorderColumnsArr[i] == 'city' ? width = '80' : reorderColumnsArr[i] == 'state' ? width = '80' : reorderColumnsArr[i] == 'country' ? width = '80' : reorderColumnsArr[i] == 'zip' ? width = '60' : reorderColumnsArr[i] == 'emailAddress' ? width = '140' : reorderColumnsArr[i] == 'phone' ? width = '120' : reorderColumnsArr[i] == 'userName' ? width = '120' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? width = '90' : '';
              this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
            }
          }
          else if (isHiddenColumn) {
            this.columns = [
              { field: '$', title: ' ', width: '40' },
              { field: '$', title: '  ', width: '40' },
            ];
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              var width: string = '';
              for (var j = 0; j < columnWidthsArr.length; j++) {
                if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                  width = columnWidthsArr[j].split(':')[1];
                }
              }
              if (width == '')
                reorderColumnsArr[i].split(':')[0] == 'name' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '350' : reorderColumnsArr[i].split(':')[0] == 'address' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'city' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'state' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'country' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'zip' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? width = '140' : reorderColumnsArr[i].split(':')[0] == 'phone' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? width = '90' : '';
              this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
            }
          }


          if (sortingColumnsArr.length > 0) {
            for (var k = 0; k < sortingColumnsArr.length; k++) {
              var dir: any = sortingColumnsArr[k].split(':')[1];
              if (dir == 'undefined')
                dir = undefined;
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
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < actualColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].includes(actualColumnsArr[i])) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              actualColumnsArr[i] == 'name' ? width = '250' : actualColumnsArr[i] == 'email' ? width = '70' : actualColumnsArr[i] == 'companyName' ? width = '350' : actualColumnsArr[i] == 'address' ? width = '120' : actualColumnsArr[i] == 'city' ? width = '80' : actualColumnsArr[i] == 'state' ? width = '80' : actualColumnsArr[i] == 'country' ? width = '80' : actualColumnsArr[i] == 'zip' ? width = '60' : actualColumnsArr[i] == 'emailAddress' ? width = '140' : actualColumnsArr[i] == 'phone' ? width = '120' : actualColumnsArr[i] == 'userName' ? width = '120' : actualColumnsArr[i] == 'dtModifiedDisplay' ? width = '100' : actualColumnsArr[i] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: actualColumnsArr[i], title: actualColumnsArr[i] == 'companyName' ? 'Company' : actualColumnsArr[i] == 'userName' ? 'User' : actualColumnsArr[i] == 'emailAddress' ? 'Email Address' : actualColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : actualColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : actualColumnsArr[i], width: width != '' ? width : '' });
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
      this.contactsData = this.contactList;
      this.initContactsData = this.contactList;
      this.loadContacts = false;
      this.showSpinner = false;
      this.contactColumnMenuRemovedArr = this.columns;
    } else {
      this.loadContacts = false;
      this.showSpinner = false;
      this.contactColumnMenuRemovedArr = this.columns;
    }
  }

  async getRecentContacts() {
    this.loadRecentContacts = true;
    var userId = this.user.cLPUserID;
    await this._contactService.getRecentContacts(this.encryptedUser, userId)
      .then(async (result: ContactListResponse) => {
        if (result) {
          this.recentContactListResponse = UtilityService.clone(result);
          this.configRecentGrid();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.loadRecentContacts = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  configRecentGrid() {
    if (!isNullOrUndefined(this.recentContactListResponse) && !isNullOrUndefined(this.recentContactListResponse.contactList)) {

      //Check here reorder have the value or not
      if (this.gridColumnsConfigRecent) {
        if (this.gridColumnsConfigRecent.reorderColumnName) {
          this.hiddenColumnsRecent = [];
          var reorderColumns = this.gridColumnsConfigRecent.reorderColumnName;
          var reorderColumnsArr = reorderColumns.split(',');
          var columnWidths = this.gridColumnsConfigRecent.columnWidth;
          var columnWidthsArr = columnWidths.split(',');
          var sortingColumns = this.gridColumnsConfigRecent.sortingColumn;
          var sortingColumnsArr = [];
          if (sortingColumns)
            sortingColumnsArr = sortingColumns.split(',');
          var isHiddenColumn: boolean = false;
          if (reorderColumnsArr.length > 0) {
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              if (reorderColumnsArr[i].includes(':h')) {
                isHiddenColumn = true;
                var field = reorderColumnsArr[i].split(':')[0];
                this.hiddenColumnsRecent.push(field);
              }
            }
          }

          if (!isHiddenColumn) {
            this.recentColumns = [
              { field: '$', title: ' ', width: '40' },
              { field: '$', title: '  ', width: '40' },
            ];
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              var width: string = '';
              for (var j = 0; j < columnWidthsArr.length; j++) {
                if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                  width = columnWidthsArr[j].split(':')[1];
                }
              }
              if (width == '')
                reorderColumnsArr[i] == 'name' ? width = '250' : reorderColumnsArr[i] == 'email' ? width = '70' : reorderColumnsArr[i] == 'companyName' ? width = '350' : reorderColumnsArr[i] == 'address' ? width = '120' : reorderColumnsArr[i] == 'city' ? width = '80' : reorderColumnsArr[i] == 'state' ? width = '80' : reorderColumnsArr[i] == 'country' ? width = '80' : reorderColumnsArr[i] == 'zip' ? width = '60' : reorderColumnsArr[i] == 'emailAddress' ? width = '140' : reorderColumnsArr[i] == 'phone' ? width = '120' : reorderColumnsArr[i] == 'userName' ? width = '120' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? width = '90' : '';
              this.recentColumns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
            }
          }
          else if (isHiddenColumn) {
            this.recentColumns = [
              { field: '$', title: ' ', width: '40' },
              { field: '$', title: '  ', width: '40' },
            ];
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              var width: string = '';
              for (var j = 0; j < columnWidthsArr.length; j++) {
                if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                  width = columnWidthsArr[j].split(':')[1];
                }
              }
              if (width == '')
                reorderColumnsArr[i].split(':')[0] == 'name' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '350' : reorderColumnsArr[i].split(':')[0] == 'address' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'city' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'state' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'country' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'zip' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? width = '140' : reorderColumnsArr[i].split(':')[0] == 'phone' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? width = '90' : '';
              this.recentColumns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
            }
          }

          if (sortingColumnsArr.length > 0) {
            for (var k = 0; k < sortingColumnsArr.length; k++) {
              var dir: any = sortingColumnsArr[k].split(':')[1];
              if (dir == 'undefined')
                dir = undefined;
              this.recentSort.push({ field: sortingColumnsArr[k].split(':')[0], dir: dir });
            }
          }

        }
        else if (this.gridColumnsConfigRecent.actualColumns) {
          var actualColumn = this.gridColumnsConfigRecent.actualColumns;
          var actualColumnsArr = actualColumn.split(',');
          var columnWidths = this.gridColumnsConfigRecent.columnWidth;
          var columnWidthsArr = columnWidths.split(',');
          var sortingColumns = this.gridColumnsConfigRecent.sortingColumn;
          var sortingColumnsArr = [];
          if (sortingColumns)
            sortingColumnsArr = sortingColumns.split(',');
          this.recentColumns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < actualColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].includes(actualColumnsArr[i])) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              actualColumnsArr[i] == 'name' ? width = '250' : actualColumnsArr[i] == 'email' ? width = '70' : actualColumnsArr[i] == 'companyName' ? width = '350' : actualColumnsArr[i] == 'address' ? width = '120' : actualColumnsArr[i] == 'city' ? width = '80' : actualColumnsArr[i] == 'state' ? width = '80' : actualColumnsArr[i] == 'country' ? width = '80' : actualColumnsArr[i] == 'zip' ? width = '60' : actualColumnsArr[i] == 'emailAddress' ? width = '140' : actualColumnsArr[i] == 'phone' ? width = '120' : actualColumnsArr[i] == 'userName' ? width = '120' : actualColumnsArr[i] == 'dtModifiedDisplay' ? width = '100' : actualColumnsArr[i] == 'dtCreatedDisplay' ? width = '90' : '';
            this.recentColumns.push({ field: actualColumnsArr[i], title: actualColumnsArr[i] == 'companyName' ? 'Company' : actualColumnsArr[i] == 'userName' ? 'User' : actualColumnsArr[i] == 'emailAddress' ? 'Email Address' : actualColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : actualColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : actualColumnsArr[i], width: width != '' ? width : '' });
          }
          if (sortingColumnsArr.length > 0) {
            for (var k = 0; k < sortingColumnsArr.length; k++) {
              var dir: any = sortingColumnsArr[k].split(':')[1];
              this.recentSort.push({ field: sortingColumnsArr[k].split(':')[0], dir: dir });
            }
          }
        }
      }

      this.recentContactList = this.recentContactListResponse.contactList;
      this.recentContactsData = this.recentContactList;
      this.initRecentContactsData = this.recentContactList;
      this.recentColumnMenuRemovedArr = this.recentColumns;
      this.loadRecentContacts = false;
    } else {
      this.loadRecentContacts = false;
      this.recentColumnMenuRemovedArr = this.recentColumns;
    }
  }

  public onTabSelect(e) {
    if (e.title == "My Contacts") {
      if (this.savedQueryValue != '0' || (!isNullOrUndefined(this.getContactsSearchSubscription)))
        this.configContactsGrid();
      else
        this.getContacts();
    }
    else {
      if (this.savedQueryValue != '0' || (!isNullOrUndefined(this.getContactsSearchSubscription)))
        this.configRecentGrid();
      else
        this.getRecentContacts();
    }
  }

  public onContactsFilter(inputValue: string): void {
    this.contactsData = process(this.initContactsData, {
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
            field: 'zip',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'emailAddress',
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
          },
          {
            field: 'dtModifiedDisplay',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'dtCreatedDisplay',
            operator: 'contains',
            value: inputValue
          }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  public onRecentContactsFilter(inputValue: string): void {
    this.recentContactsData = process(this.initRecentContactsData, {
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
            field: 'zip',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'emailAddress',
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
          },
          {
            field: 'dtModifiedDisplay',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'dtCreatedDisplay',
            operator: 'contains',
            value: inputValue
          }
        ],
      }
    }).data;
    this.dataBindingRecent.skip = 0;
  }

  getGridColumnsConfiguration(clpUserId, tableName) {
    this._gridColumnsConfigurationService.getGridColumnsConfiguration(this.encryptedUser, clpUserId, tableName)
      .then(result => {
        if (result) {
          if (tableName == 'contactGrid') {
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
            this.createGetGridColumnsConfiguration(tableName).subscribe((value) => this.getContacts());
          }
          else if (tableName == 'recentContactGrid') {
            this.gridColumnsConfigurationResponseRecent = UtilityService.clone(result);
            this.gridColumnsConfigRecent = this.gridColumnsConfigurationResponseRecent.gridColumnsConfiguration;
            if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.reorderColumnName)
              this.reorderColumnNameRecent = this.gridColumnsConfigRecent.reorderColumnName;
            if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.sortingColumn)
              this.recentSortingColumn = this.gridColumnsConfigRecent.sortingColumn;
            if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.columnWidth)
              this.recentColumnWidth = this.gridColumnsConfigRecent.columnWidth;
            if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.pageSize)
              this.recentPageSize = this.gridColumnsConfigRecent.pageSize;
            this.createGetGridColumnsConfiguration(tableName).subscribe((value) => this.getRecentContacts());
          }
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  /*get all tables configuration below*/
  getAllGridColumnsConfigurationByUser() {
    this._gridColumnsConfigurationService.getGridColumnsConfigurationUser(this.encryptedUser, this.user.cLPUserID)
      .then(async (result: GridColumnsConfigurationByUserResponse) => {
        if (result) {
        }
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
      });
  }

  createGetGridColumnsConfiguration(gridType) {
    return new Observable(observer => {
      this.copyDataObjectToAPIObject(gridType);
      this._gridColumnsConfigurationService.createGridColumnsConfiguration(this.encryptedUser, this.gridColumnsConfiguration)
        .then(result => {
          if (result) {
            this._gridColumnsConfigurationService.getGridColumnsConfiguration(this.encryptedUser, this.user.cLPUserID, gridType)
              .then(result => {
                if (result) {
                  if (gridType == 'contactGrid') {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                  }
                  else if (gridType == 'recentContactGrid') {
                    this.gridColumnsConfigurationResponseRecent = UtilityService.clone(result);
                    this.gridColumnsConfigRecent = this.gridColumnsConfigurationResponseRecent.gridColumnsConfiguration;
                  }
                }
                observer.next("success");
              }).catch((err: HttpErrorResponse) => {
                console.log(err);
              });
          }
          else
            this.showSpinner = false;
        }).catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          console.log(err);
        });
    });
  }

  gridColumnsConfigurationCreate(gridType) {
    this.copyDataObjectToAPIObject(gridType);
    this._gridColumnsConfigurationService.createGridColumnsConfiguration(this.encryptedUser, this.gridColumnsConfiguration)
      .then(result => {
        if (result) {
          this._gridColumnsConfigurationService.getGridColumnsConfiguration(this.encryptedUser, this.user.cLPUserID, gridType)
            .then(result => {
              if (result) {
                if (gridType == 'contactGrid') {
                  this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                  this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                  this.loadContacts = false;
                  this.loadRecentContacts = false;
                }
                else if (gridType == 'recentContactGrid') {
                  this.gridColumnsConfigurationResponseRecent = UtilityService.clone(result);
                  this.gridColumnsConfigRecent = this.gridColumnsConfigurationResponseRecent.gridColumnsConfiguration;
                  this.loadContacts = false;
                  this.loadRecentContacts = false;
                }
              }
              else {
                this.loadContacts = false;
                this.loadRecentContacts = false;
              }
            }).catch((err: HttpErrorResponse) => {
              this.loadContacts = false;
              this.loadRecentContacts = false;
              console.log(err);
            });
        }
        else {
          this.loadContacts = false;
          this.loadRecentContacts = false;
        }
      }).catch((err: HttpErrorResponse) => {
        this.loadContacts = false;
        this.loadRecentContacts = false;
        console.log(err);
      });

  }

  columnsOrderChanged(gridType, e) {
    if (gridType == 'contactGrid') {
      this.loadContacts = true;
      var columnsArr = this.columns;

      var initColumnsArr = this.columns;
      var mappedinitColumnsArr = initColumnsArr.map(a => a.field);
      var self = this;
      var array3 = mappedinitColumnsArr.filter(function (obj) { return self.hiddenColumns.indexOf(obj) == -1; });
      var oldField = array3[e.oldIndex];
      var newField = array3[e.newIndex];
      var oldIndex = columnsArr.findIndex(obj => obj.field == oldField);
      var newIndex = columnsArr.findIndex(obj => obj.field == newField);

      var element = columnsArr[oldIndex];
      columnsArr.splice(oldIndex, 1);
      columnsArr.splice(newIndex, 0, element);
      var mappedArr = columnsArr.map(a => a.field);
      if (this.hiddenColumns.length > 0) {
        for (var i = 0; i < this.hiddenColumns.length; i++) {
          for (var j = 0; j < mappedArr.length; j++) {
            if (mappedArr[j] == this.hiddenColumns[i]) {
              mappedArr[j] = mappedArr[j] + ':h';
            }
          }
        }
      }
      var result = mappedArr.filter(e => !e.includes('$'));
      var reorderStr = result.join();

      var columnWidthArr = [];
      var widthColumnArr = this.columns;
      for (var i = 0; i < widthColumnArr.length; i++) {
        if (widthColumnArr[i].field && widthColumnArr[i].field != '$')
          columnWidthArr.push(widthColumnArr[i].field + ':' + widthColumnArr[i].width);
      }
      var widthColumnsStr = columnWidthArr.join();

      this.columnWidth = widthColumnsStr;
      this.reorderColumnName = reorderStr;
    }
    else if (gridType == 'recentContactGrid') {
      this.loadRecentContacts = true;
      var columnsArrs = this.recentColumns;

      var initRecentColumnsArr = this.recentColumns;
      var mappedinitRecentColumnsArr = initRecentColumnsArr.map(a => a.field);
      var self = this;
      var recentArray3 = mappedinitRecentColumnsArr.filter(function (obj) { return self.hiddenColumnsRecent.indexOf(obj) == -1; });
      var recentOldField = recentArray3[e.oldIndex];
      var recentNewField = recentArray3[e.newIndex];
      var recentOldIndex = columnsArrs.findIndex(obj => obj.field == recentOldField);
      var recentNewIndex = columnsArrs.findIndex(obj => obj.field == recentNewField);

      var elementR = columnsArrs[recentOldIndex];
      columnsArrs.splice(recentOldIndex, 1);
      columnsArrs.splice(recentNewIndex, 0, elementR);
      var mappedArrR = columnsArrs.map(a => a.field);
      if (this.hiddenColumnsRecent.length > 0) {
        for (var i = 0; i < this.hiddenColumnsRecent.length; i++) {
          for (var j = 0; j < mappedArrR.length; j++) {
            if (mappedArrR[j] == this.hiddenColumnsRecent[i]) {
              mappedArrR[j] = mappedArrR[j] + ':h';
            }
          }
        }
      }
      var resultR = mappedArrR.filter(e => !e.includes('$'));
      var reorderStr = resultR.join();

      var columnWidthArr = [];
      var widthColumnArrR = this.recentColumns;
      for (var i = 0; i < widthColumnArrR.length; i++) {
        if (widthColumnArrR[i].field && widthColumnArrR[i].field != '$')
          columnWidthArr.push(widthColumnArrR[i].field + ':' + widthColumnArrR[i].width);
      }
      var widthColumnsStr = columnWidthArr.join();

      this.recentColumnWidth = widthColumnsStr;
      this.reorderColumnNameRecent = reorderStr;
    }
    this.gridColumnsConfigurationCreate(gridType);
  }

  sortChange(gridType, e) {
    this.arrSortingColumn = [];
    this.arrSortingColumnRecent = [];
    if (gridType == 'contactGrid') {
      this.loadContacts = true;
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
    else if (gridType == 'recentContactGrid') {
      this.loadRecentContacts = true;
      if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.reorderColumnName)
        this.reorderColumnNameRecent = this.gridColumnsConfigRecent.reorderColumnName;
      if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.pageSize)
        this.recentPageSize = this.gridColumnsConfigRecent.pageSize;
      if (e.length > 0) {
        for (var j = 0; j < e.length; j++) {
          if (e[j].field != '$')
            this.arrSortingColumnRecent.push(e[j].field + ':' + e[j].dir);
        }
        var result = this.arrSortingColumnRecent.filter(e => !e.includes('$'));
        result = result.filter((a, b) => result.indexOf(a) === b)
        var sortingStr = result.join();
        this.recentSortingColumn = sortingStr;
      }
    }
    this.gridColumnsConfigurationCreate(gridType);
  }

  columnResize(gridType, e) {
    var diffColWidth = 0;
    var hiddenColLen = gridType == 'contactGrid' ? this.hiddenColumns.length : this.hiddenColumnsRecent.length;
    var totalColumns = 12 - (hiddenColLen ? hiddenColLen : 0);
    if (e.length > 0) {
      var diff = e[0].newWidth - e[0].oldWidth;
      diffColWidth = Math.floor(diff / totalColumns);
    }
    if (gridType == 'contactGrid') {
      this.loadContacts = true;
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
        //this.autoFitColumns(this.columnWidth, gridType);
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
        // this.autoFitColumns(this.columnWidth, gridType);
      }
    }
    else if (gridType == 'recentContactGrid') {
      this.loadRecentContacts = true;
      if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.reorderColumnName)
        this.reorderColumnNameRecent = this.gridColumnsConfigRecent.reorderColumnName;
      if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.pageSize)
        this.recentPageSize = this.gridColumnsConfigRecent.pageSize;
      if (this.gridColumnsConfigRecent.columnWidth) {
        var columnWidths = this.gridColumnsConfigRecent.columnWidth;
        var recentColumnWidthsArr = columnWidths.split(',');
        for (var j = 0; j < recentColumnWidthsArr.length; j++) {
          var splitRecentField = recentColumnWidthsArr[j].split(':');
          if (splitRecentField.length > 0 && splitRecentField[0] == e[0].column.field)
            recentColumnWidthsArr[j] = e[0].column.field + ':' + e[0].newWidth;
          else {
            var field: any = recentColumnWidthsArr[j].split(':')[0];
            var width = recentColumnWidthsArr[j].split(':')[1];
            var diffWidth: any = Math.floor(Number(width) - diffColWidth);
            recentColumnWidthsArr[j] = field + ":" + diffWidth;
          }
        }
        var resultRecent = recentColumnWidthsArr.filter(x => !x.includes('$'));
        resultRecent = resultRecent.filter((a, b) => resultRecent.indexOf(a) === b)
        var recentResizeStr = resultRecent.join();
        this.recentColumnWidth = recentResizeStr;
        //     this.autoFitColumns(this.recentColumnWidth, gridType);
      }
      else {
        for (var j = 0; j < this.arrColumnWidthRecent.length; j++) {
          var splitArrRecentField = this.arrColumnWidthRecent[j].split(':');
          if (splitArrRecentField.length > 0 && splitArrRecentField[0] == e[0].column.field)
            this.arrColumnWidthRecent[j] = e[0].column.field + ':' + e[0].newWidth;
          else {
            var field: any = this.arrColumnWidthRecent[j].split(':')[0];
            var widthRc = this.arrColumnWidthRecent[j].split(':')[1];
            var diffWidth: any = Math.floor(Number(widthRc) - diffColWidth);
            this.arrColumnWidthRecent[j] = field + ":" + diffWidth;
          }
        }
        var recentColumnWidthresult = this.arrColumnWidthRecent.filter(x => !x.includes('$'));
        recentColumnWidthresult = recentColumnWidthresult.filter((a, b) => recentColumnWidthresult.indexOf(a) === b)
        var recentResizeStrResult = recentColumnWidthresult.join();
        this.recentColumnWidth = recentResizeStrResult;
        // this.autoFitColumns(this.recentColumnWidth, gridType);
      }
    }

    this.gridColumnsConfigurationCreate(gridType);
  }

  autoFitColumns(columnArr, gridType) {
    if (gridType == 'contactGrid') {
      this.columns = [
        { field: '$', title: ' ', width: '40' },
        { field: '$', title: '  ', width: '40' },
      ];

      var columnWidthsArr = columnArr.split(',');
      for (var j = 0; j < columnWidthsArr.length; j++) {
        var fieldN = columnWidthsArr[j].split(':')[0];
        var width = columnWidthsArr[j].split(':')[1];
        this.columns.push({ field: fieldN, title: fieldN == 'companyName' ? 'Company' : fieldN == 'userName' ? 'User' : fieldN == 'emailAddress' ? 'Email Address' : fieldN == 'dtModifiedDisplay' ? 'Modified' : fieldN == 'dtCreatedDisplay' ? 'Created' : fieldN, width: width != '' ? width : '' });
      }
    }
    else if (gridType == 'recentContactGrid') {
      this.recentColumns = [
        { field: '$', title: ' ', width: '40' },
        { field: '$', title: '  ', width: '40' },
      ];

      var columnWidthsArr = columnArr.split(',');
      for (var j = 0; j < columnWidthsArr.length; j++) {
        var fieldN = columnWidthsArr[j].split(':')[0];
        var width = columnWidthsArr[j].split(':')[1];
        this.recentColumns.push({ field: fieldN, title: fieldN == 'companyName' ? 'Company' : fieldN == 'userName' ? 'User' : fieldN == 'emailAddress' ? 'Email Address' : fieldN == 'dtModifiedDisplay' ? 'Modified' : fieldN == 'dtCreatedDisplay' ? 'Created' : fieldN, width: width != '' ? width : '' });
      }
    }
  }

  pageChange(event: PageChangeEvent): void {
    this.loadContacts = true;
    if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
      this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
    if (this.gridColumnsConfig && this.gridColumnsConfig.sortingColumn)
      this.sortingColumn = this.gridColumnsConfig.sortingColumn
    if (this.gridColumnsConfig && this.gridColumnsConfig.columnWidth)
      this.columnWidth = this.gridColumnsConfig.columnWidth;

    var gridType = 'contactGrid';
    this.pageSize = event.take;
    this.gridColumnsConfigurationCreate(gridType);
  }

  recentPageChange(event: PageChangeEvent): void {
    this.loadRecentContacts = true;
    if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.reorderColumnName)
      this.reorderColumnNameRecent = this.gridColumnsConfigRecent.reorderColumnName;
    if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.sortingColumn)
      this.recentSortingColumn = this.gridColumnsConfigRecent.sortingColumn;
    if (this.gridColumnsConfigRecent && this.gridColumnsConfigRecent.columnWidth)
      this.recentColumnWidth = this.gridColumnsConfigRecent.columnWidth;

    var gridType = 'recentContactGrid';
    this.recentPageSize = event.take;
    this.gridColumnsConfigurationCreate(gridType);
  }

  public onVisibilityChange(e: any, gridType, grid): void {
    if (gridType == 'contactGrid') {
      this.loadContacts = true;

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
              //var index = this.columns.indexOf(this.columns[j]);
              //this.contactColumnMenuRemovedArr.splice(index, 0, this.columns[j])
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
    else if (gridType == 'recentContactGrid') {
      this.loadRecentContacts = true;

      e.columns.forEach(column => {
        if (column.hidden == true) {
          var obj = this.recentColumnMenuRemovedArr.find(col => col.field === column.field);
          this.hiddenColumnsRecent.push(obj.field);
          obj.field = obj.field + ':h';

        }
        else if (column.hidden == false) {
          for (var j = 0; j < this.recentColumns.length; j++) {
            if (this.recentColumns[j].title.charAt(0).toUpperCase() + this.recentColumns[j].title.slice(1) == column.title) {
              var splitValueArr = this.recentColumnMenuRemovedArr[j].field.split(':');
              if (splitValueArr.length > 0) {
                this.recentColumnMenuRemovedArr[j].field = this.recentColumnMenuRemovedArr[j].field.split(':')[0];
                var index = this.hiddenColumnsRecent.indexOf(this.recentColumnMenuRemovedArr[j].field);
                this.hiddenColumnsRecent.splice(index, 1);
              }

            }
          }
        }

        if (this.hiddenColumnsRecent.length > 0) {
          for (var i = 0; i < this.hiddenColumnsRecent.length; i++) {
            for (var j = 0; j < this.recentColumnMenuRemovedArr.length; j++) {
              if (this.recentColumnMenuRemovedArr[j].field === this.hiddenColumnsRecent[i]) {
                var field = this.hiddenColumnsRecent[i];
                this.recentColumnMenuRemovedArr[j].field = field + ':h';
              }
            }
          }
        }

      });

      var mappedArr = this.recentColumnMenuRemovedArr.map(a => a.field);
      var result = mappedArr.filter(e => !e.includes('$'));
      var reorderStr = result.join();

      if (this.hiddenColumnsRecent.length > 0) {
        this.hiddenColumnsRecent.forEach(column => {
          for (var j = 0; j < this.recentColumns.length; j++) {
            var splitRecentField = this.recentColumns[j].field.split(':');
            if (splitRecentField.length > 0 && splitRecentField[0] == column) {
              this.recentColumns[j].field = column;
            }
          }
        });
      }

      var columnWidthArr = [];
      var widthColumnArr = this.recentColumnMenuRemovedArr;
      for (var i = 0; i < widthColumnArr.length; i++) {
        if (widthColumnArr[i].field)
          columnWidthArr.push(widthColumnArr[i].field + ':' + widthColumnArr[i].width);
      }
      var result = columnWidthArr.filter(e => !e.includes('$'));
      var widthColumnsStr = result.join();

      this.recentColumnWidth = widthColumnsStr;
      this.reorderColumnNameRecent = reorderStr;
    }
    this.gridColumnsConfigurationCreate(gridType);
    this.ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      grid.autoFitColumns();
      grid.resizeColumn;
    });
  }

  copyDataObjectToAPIObject(Action: string) {
    switch (Action) {
      case "contactGrid":
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'contactGrid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,email,companyName,address,city,state,country,zip,emailAddress,phone,userName,dtModifiedDisplay,dtCreatedDisplay",
          panelsSize: ''
        }
        break;
      case "recentContactGrid":
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'recentContactGrid',
          sortingColumn: this.recentSortingColumn,
          reorderColumnName: this.reorderColumnNameRecent,
          columnWidth: this.recentColumnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,email,companyName,address,city,state,country,zip,emailAddress,phone,userName,dtModifiedDisplay,dtCreatedDisplay",
          panelsSize: ''
        }
        break;
      default:
        break;
    }
  }

  showColumn(columnDef): boolean {
    var value = true;
    if (columnDef) {
      (columnDef == 'email') || (columnDef == 'phone') ? value = false : value = true;
    }
    return value;
  }

  async getContactSearch() {
    await this._searchContactService.getSearchFields(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: SearchItemListResponse) => {
        if (result) {
          this.searchItemListResponse = UtilityService.clone(result);
          this.searchItems = this.searchItemListResponse.searchItems;
          this.savedQuery_Filter = this.searchItemListResponse.savedQueries;
          this.itemData_user_all = this.searchItems.filter(i => i.displayValue == "User").length > 0 ? this.searchItems.filter(i => i.displayValue == "User")[0].itemData : <Item[]>{};;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  private prepareSearchQueriesForm(): FormGroup {
    return new FormGroup({
      searchQueries: this.fb.array([this.fb.group({
        cLPUserID: '-1',
        searchItem: [-1, Validators.required],
        operator: ['', Validators.required],
        searchItemValue: '',
        groupBy: '',
        mainOperator: ['', Validators.required],
        action: '',
        isSelected: false,
        tableName: '',
        columnName: '',
        dtStart: '',
        dtEnd: '',
        selectedValueForMultiSelect: '',
        txtRangeFrom: '',
        txtRangeTo: ''
      })]),
    });
    this.isNewRowAdded = true;
  }

  private prepareSaveSearchForm(): FormGroup {
    return this.fb.group({
      SearchQueryName: [{ value: '' }, [Validators.required]]
    });
  }

  addSearchQuery() {
    this.isNewRowAdded = true;
    let ctrCount: number = 0;
    let ctrColSpan: number = 0;
    this.searchQueriesCtls.push(this.fb.group({
      cLPUserID: '-1',
      searchItem: [-1, Validators.required],
      operator: ['', Validators.required],
      searchItemValue: '',
      groupBy: '',
      mainOperator: ['', Validators.required],
      action: '',
      isSelected: false,
      tableName: '',
      columnName: '',
      dtStart: '',
      dtEnd: '',
      selectedValueForMultiSelect: '',
      txtRangeFrom: '',
      txtRangeTo: ''
    }))
    this.isSearchSubmit = false;
  }

  deleteSearchQuery(index, isDelete: boolean = false) {
    this.searchQueriesCtls.removeAt(index);
    if (this.searchQueriesCtls.controls.length === 0)
      this.addSearchQuery();
    else if (isDelete)
      this.notifyService.showSuccess("Row has been deleted!", "", 3000);
    this.groups = [];
    $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
    $("td[id^=tdAddGroup]").remove();
    var allRows = $("#tblSearch")[0].rows;
    if (!isNullOrUndefined(allRows) && allRows.length > 0) {
      for (var rowIndex = 1; rowIndex <= allRows.length; rowIndex++) {
        $("#tdGroup" + this.minTwoDigits((rowIndex - 1))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((rowIndex - 1)) + "-NoGroup" + "" + '" colspan="' + this.calCulateMaxColSpan() + '"></td>');
      }
      setTimeout(() => {
        if (this.searchQueriesCtls.controls.length > 0)
          this.selectGroupRow(this.searchQueriesCtls.controls.length);
      }, 0);
    }
  }

  deleteAllSearchQuery() {
    for (var i = 0; i < this.searchQueriesCtls.controls.length; i++)
      this.deleteSearchQuery(i);
  }

  get searchQueriesCtls() {
    return this.searchQueriesForm.get('searchQueries') as FormArray;
  }

  showSearch(isAdd: boolean = false) {
    if (isAdd) {
      this.groups = [];
      $("td[id^=tdAddGroup]").remove();
      this.searchQueriesCtls.controls = [];
      $('#drpSavedQueries option[value=0] ').prop("selected", true);
      this.IsSaveSearch = false;
      this.addDefaultSearchFilters();
    }

    $('#modalSearchContact').modal('show');
  }

  addDefaultSearchFilters() {
    var searchQueriesCtls_length = this.searchQueriesCtls.controls.length;
    for (var index = 0; index < searchQueriesCtls_length; index++)
      this.searchQueriesCtls.removeAt(index);
    this.searchQueriesCtls.removeAt(this.searchQueriesCtls.length - 1);
    var defaultItems = [];

    if (!isNullOrUndefined(this.user) && this.user.officeCode != 0) {
      var officeCodeObj = this.searchItems.find(a => a.displayValue.includes('Office'));
      if (!isNullOrUndefined(officeCodeObj))
        defaultItems.push(officeCodeObj);
    }
    if (!isNullOrUndefined(this.user) && this.user.teamCode != 0) {
      var teamCodeObj = this.searchItems.find(a => a.displayValue.includes('Team'));
      if (!isNullOrUndefined(teamCodeObj))
        defaultItems.push(teamCodeObj);
    }

    defaultItems.push(this.searchItems.find(a => a.displayValue.includes('User')));

    for (var i = 0; i < defaultItems.length; i++) {
      this.searchQueriesCtls.push(this.fb.group({
        cLPUserID: '-1',
        searchItem: [-1, Validators.required],
        operator: ['', Validators.required],
        searchItemValue: '',
        groupBy: '',
        mainOperator: ['', Validators.required],
        action: '',
        isSelected: false,
        tableName: '',
        columnName: '',
        dtStart: '',
        dtEnd: '',
        selectedValueForMultiSelect: '',
        txtRangeFrom: '',
        txtRangeTo: ''
      }))
    }
    this.isNewRowsAddedOnLoad = true;
    this.isDefaultSelection = true;
  }

  hideSearch() {
    $('#modalSearchContact').modal('hide');
    if (this.savedQueryValue == '0') {
      $('#drpSavedQueries option[value=0] ').prop("selected", true);
      this.deleteAllSearchQuery();
    }
    if (this.savedQueryValue != '0') {
      var savedValue = this.savedQueryValue;
      $("#drpSavedQueries").val(savedValue).change();
      this.setSearchQueriesCtls();
    }
    if (this.isSearchSubmit) {
      this.showSpinner = false;
      this.isSearchSubmit = false;
      this.isEditSavedSearch = false;
      if (!isNullOrUndefined(this.getContactsSearchSubscription))
        this.getContactsSearchSubscription.unsubscribe();
    }
    this.isSearchSubmit = false;
    this.isEditSavedSearch = false;
    this.isGroup = false;
  }

  setSearchQueriesCtls() {
    if (!isNullOrUndefined(this.savedsearchQueryResponse)) {
      var _searchQueryList = this.savedsearchQueryResponse.searchQueryList;
      if (_searchQueryList.length > 0) {
        $("td[id^=tdAddGroup]").remove();
        this.searchQueriesCtls.controls = [];
        this.groups = this.savedsearchQueryResponse.group;
        for (var i = 0; i < _searchQueryList.length; i++) {
          this.searchQueriesCtls.push(this.fb.group({
            cLPUserID: '-1',
            searchItem: [-1, Validators.required],
            operator: ['', Validators.required],
            searchItemValue: '',
            groupBy: '',
            mainOperator: ['', Validators.required],
            action: '',
            isSelected: false,
            tableName: '',
            columnName: '',
            dtStart: '',
            dtEnd: '',
            selectedValueForMultiSelect: '',
            txtRangeFrom: '',
            txtRangeTo: ''
          }))
        }
        this.isNewRowsAddedOnLoad = true;
      }
    }
  }

  getFieldValueData(i) {
    if (this.searchItems[this.searchQueriesCtls.controls[i].get('searchItem').value])
      return this.searchItems[this.searchQueriesCtls.controls[i].get('searchItem').value].itemData
    else
      return this.items;
  }

  clearValidation(i) {
    if (this.searchQueriesCtls.controls.length > 0) {
      const control = this.searchQueriesCtls.controls[i].get('mainOperator');
      if (control) {
        control.clearValidators();
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    }
  }

  clearAllValidation() {
    return new Observable(observer => {
      this.searchItemValue.clearValidators();
      this.searchItemValue.markAsTouched();
      this.searchItemValue.updateValueAndValidity();
      for (var k = 0; k < this.searchQueriesCtls.controls.length; k++) {
        var searchItemCtrl = this.searchQueriesCtls.controls[k].get('searchItemValue');
        if (!isNullOrUndefined(searchItemCtrl)) {
          searchItemCtrl.clearValidators();
          searchItemCtrl.markAsTouched();
          searchItemCtrl.updateValueAndValidity();
        }
        var dtStartCtrl = this.searchQueriesCtls.controls[k].get('dtStart');
        if (!isNullOrUndefined(dtStartCtrl)) {
          dtStartCtrl.clearValidators();
          dtStartCtrl.markAsTouched();
          dtStartCtrl.updateValueAndValidity();
        }
        var dtEndCtrl = this.searchQueriesCtls.controls[k].get('dtEnd');
        if (!isNullOrUndefined(dtEndCtrl)) {
          dtEndCtrl.clearValidators();
          dtEndCtrl.markAsTouched();
          dtEndCtrl.updateValueAndValidity();
        }
        var txtRangeFrom = this.searchQueriesCtls.controls[k].get('txtRangeFrom');
        if (!isNullOrUndefined(txtRangeFrom)) {
          txtRangeFrom.clearValidators();
          txtRangeFrom.markAsTouched();
          txtRangeFrom.updateValueAndValidity();
        }
        var txtRangeTo = this.searchQueriesCtls.controls[k].get('txtRangeTo');
        if (!isNullOrUndefined(txtRangeTo)) {
          txtRangeTo.clearValidators();
          txtRangeTo.markAsTouched();
          txtRangeTo.updateValueAndValidity();
        }
        var selectedValueForMultiSelect = this.searchQueriesCtls.controls[k].get('selectedValueForMultiSelect');
        if (!isNullOrUndefined(selectedValueForMultiSelect)) {
          selectedValueForMultiSelect.clearValidators();
          selectedValueForMultiSelect.markAsTouched();
          selectedValueForMultiSelect.updateValueAndValidity();
        }
      }
      observer.next("success");
    });
  }

  setValidation() {
    if (this.searchQueriesCtls.controls.length > 0) {
      let control: AbstractControl;
      for (var i = 0; i < this.searchQueriesCtls.controls.length; i++) {
        let ct: string = $("#txtControlType" + i).val();
        switch (ct) {
          case 't':
          case 'd':
          case 'dtCustom':
            control = this.searchQueriesCtls.controls[i].get('searchItemValue');
            control.setValidators([Validators.required]);
            break;
          case 'r':
            var controlFrom = this.searchQueriesCtls.controls[i].get('txtRangeFrom');
            controlFrom.setValidators([Validators.required]);
            var controlTo = this.searchQueriesCtls.controls[i].get('txtRangeTo');
            controlTo.setValidators([Validators.required]);
            controlFrom.updateValueAndValidity();
            controlTo.updateValueAndValidity();
            break;
          case 'md':
            control = this.searchQueriesCtls.controls[i].get('selectedValueForMultiSelect');
            control.setValidators([Validators.required]); break;
          case 'dt':
            var controlStart = this.searchQueriesCtls.controls[i].get('dtStart');
            controlStart.setValidators([Validators.required]);
            var controlEnd = this.searchQueriesCtls.controls[i].get('dtEnd');
            controlEnd.setValidators([Validators.required]);
            controlStart.updateValueAndValidity();
            controlEnd.updateValueAndValidity();
            break;
          default: break;
        }
        if (ct != "" && ct != 'dt')
          control.updateValueAndValidity();
      }
    }
  }

  runSearch() {
    this.clearValidation(0);
    this.isSearchSubmit = true;
    if ((this.searchQueriesCtls.status != 'INVALID')) {
      this.showSpinner = true;
      this.createSearchQueryList();
      this.getContactsSearchSubscription = this._searchContactService.getContactSearchAsync(this.encryptedUser, this.searchQueryResponse)
        .subscribe(res => {
          if (res) {
            this.contactListResponse = UtilityService.clone(res);
            this.savedQueryValue = '0';
            this.hideSearch();
            this.contactsData = this.contactListResponse.contactList;
            this.initContactsData = this.contactListResponse.contactList;
            this.showSpinner = false;
            this.isSearchSubmit = false;
            this.isEditSavedSearch = false;
            $('#drpSavedQueries option[value=0] ').prop("selected", true);
          }
        },
          (error) => {
            this.showSpinner = false;
            this.isSearchSubmit = false;
            this.isEditSavedSearch = false;
            this._utilityService.handleErrorResponse(error);
          }
        );
    }
  }

  saveSearch() {
    this.IsSaveSearch = !this.IsSaveSearch;
    this.isEditSavedSearch = false;
    var selectValueText = $("#drpSavedQueries option:selected").text();
    var selectValue = $("#drpSavedQueries  option:selected").val();
    this.saveSearchForm.reset();
    this.saveSearchForm.get('SearchQueryName').setValue('');
    this.savedQuery_response = {} as SimpleResponse;
  }

  changeMenuColumn(e, gridType) {
    if (e.srcElement) {
      if (e.srcElement.className && e.srcElement.className == "k-button") {
        if (gridType == 'contactGrid') {
          this.columns = [
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
            { field: 'dtModifiedDisplay', title: 'Modified', width: '100' },
            { field: 'dtCreatedDisplay', title: 'Created', width: '90' },
          ];
          this.contactsData = this.contactList;

          var columnWidthArr = [];
          var widthColumnArr = this.columns;
          for (var i = 0; i < widthColumnArr.length; i++) {
            if (widthColumnArr[i].field && widthColumnArr[i].field != '$')
              columnWidthArr.push(widthColumnArr[i].field + ':' + widthColumnArr[i].width);
          }
          var widthColumnsStr = columnWidthArr.join();

          this.columnWidth = widthColumnsStr;
          this.reorderColumnName = '';
        }
        else if (gridType == 'recentContactGrid') {

          this.recentColumns = [
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
            { field: 'dtModifiedDisplay', title: 'Modified', width: '100' },
            { field: 'dtCreatedDisplay', title: 'Created', width: '90' },
          ];
          this.recentContactsData = this.recentContactList;

          var columnWidthArr = [];
          var widthColumnArrR = this.recentColumns;
          for (var i = 0; i < widthColumnArrR.length; i++) {
            if (widthColumnArrR[i].field && widthColumnArrR[i].field != '$')
              columnWidthArr.push(widthColumnArrR[i].field + ':' + widthColumnArrR[i].width);
          }
          var widthColumnsStr = columnWidthArr.join();

          this.recentColumnWidth = widthColumnsStr;
          this.reorderColumnNameRecent = '';
        }
        this.gridColumnsConfigurationCreate(gridType);
      }
    }

  }

  validation() {
    this.clearAllValidation().subscribe((value) => this.setValidation());
  }

  drpFields_onChange(id: any) {
    var dd = this.searchQueriesCtls;
    this.items = [];
    this.searchFilterItem = this.searchItems.filter(x => x.displayValue === $('#drpFields' + id + ' :selected').text().trim());
    $("#txtControlType" + id).val(this.searchFilterItem[0].controlType);
    $('#txtTableName' + id).val(this.searchFilterItem[0].itemData[0].tableName);
    $('#txtColumnName' + id).val(this.searchFilterItem[0].itemData[0].columnName);

    switch (this.searchFilterItem[0].controlType) {
      case 't': case 'd': this.searchQueriesCtls.controls[id].get('searchItemValue').setValue(''); break;
      case 'md': this.searchQueriesCtls.controls[id].get('selectedValueForMultiSelect').setValue([]); break;
      case 'r': this.searchQueriesCtls.controls[id].get('txtRangeFrom').setValue(''); this.searchQueriesCtls.controls[id].get('txtRangeTo').setValue(''); break;
      case 'dt': this.searchQueriesCtls.controls[id].get('dtStart').setValue(new Date()); this.searchQueriesCtls.controls[id].get('dtEnd').setValue((new Date())); break;
      default: break;
    }
    var searchItemIdx = this.searchQueriesCtls.controls[id].get('searchItem').value;
    this.searchQueriesCtls.controls[id].get('operator').setValue(this.searchItems[searchItemIdx].searchOperators[0].value);
    this.validation();
  }

  drpMultiFieldData_onChange(event: any, id: any) {
    if (!event) {
    }
    this.validation();
  }

  selectGroupRow(k) {
    let ctr: number = 0;
    let lastRow: number = 0;
    let currenrRow: number = 0;
    let selectedRows: string = "";
    let arrSelectedRows: string[];
    this.isGroup = true;

    for (var i = 0; i < this.searchQueriesCtls.controls.length; i++) {
      if ($("#chkIschecked" + i).prop('checked') == true) {
        (selectedRows == "") ? selectedRows = i.toString() : selectedRows += "," + i.toString();
      }
    }

    if (!isNullOrUndefined(selectedRows))
      arrSelectedRows = selectedRows.split(',');

    if (arrSelectedRows.length >= 2) {
      for (var j = 0; j < arrSelectedRows.length; j++) {
        if (ctr > 0) {
          if (parseInt(arrSelectedRows[j]) - parseInt(arrSelectedRows[j - 1]) != 1) {
            this.isGroup = false;
            break;
          }
        }
        ctr++;
      }
    } else
      this.isGroup = false;
  }

  createGroups() {
    let chkDup: boolean = false;
    let ctrRows: number = 1;
    let cntGroups: number = this.groups.length;

    if (this.isGroup) {
      let group: Group = <Group>{ items: [], colSpan: 0 };
      for (var i = 0; i < this.searchQueriesCtls.controls.length; i++) {
        var isSelected = this.searchQueriesCtls.controls[i].get('isSelected');

        if (isSelected.value)
          group.items.push(i);
        else if (group.items.length > 1) {
          chkDup = false;
          if (!chkDup) {
            this.groups.push(group);
          }
          group = <Group>{ items: [], colSpan: 0 };
        }
        else
          group = <Group>{ items: [], colSpan: 0 };

        this.searchQueriesCtls.controls[i].get('isSelected').setValue(false);
      }

      if (group.items.length > 1) {
        chkDup = false;
        if (!chkDup) {
          if (group.items.length > 1) {
            this.groups.push(group);
          }
        }
      }

      this.groups[this.groups.length - 1].colSpan = this.calCulateGroupColSPan(this.groups[this.groups.length - 1]);
      let flag: boolean = true;
      if (!isNullOrUndefined(this.groups) && this.groups.length > 0) {
        var lastGroupAdded = this.groups[this.groups.length - 1];

        for (var i = 0; i < this.groups.length - 1; i++) {

          var firstItem_lastGroup = lastGroupAdded.items[0];
          var lastItem_lastGroup = lastGroupAdded.items[lastGroupAdded.items.length - 1];

          var firstItem_current = this.groups[i].items[0];
          var lastItem_current = this.groups[i].items[this.groups[i].items.length - 1]

          //Starting within
          if ((firstItem_lastGroup > firstItem_current && firstItem_lastGroup <= lastItem_current)
            && (lastItem_lastGroup > lastItem_current) && (flag)) {
            flag = false;
            this.groups.pop();
            this.notifyService.showError("Intersecting Groups are not allowed!", "", 3000);
          }

          //Starting before
          if ((firstItem_lastGroup < firstItem_current && (lastItem_lastGroup >= firstItem_current && lastItem_lastGroup < lastItem_current) && (flag))) {
            flag = false;
            this.groups.pop();
            this.notifyService.showError("Intersecting Groups are not allowed!", "", 3000);
          }

          if (firstItem_lastGroup == firstItem_current && lastItem_lastGroup == lastItem_current && flag) {
            flag = false;
            this.groups.pop();
            this.notifyService.showError("Intersecting Groups are not allowed!", "", 3000);
          }
        }
      }
      this.isGroup = false;
      if (flag)
        this.drawGroup();
    }
  }

  ngAfterViewChecked() {
    if (this.isNewRowsAddedOnLoad) {
      this.isNewRowsAddedOnLoad = false;
      this.isNewRowAdded = false;
      $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
      for (var i = 0; i < this.searchQueriesCtls.controls.length; i++) {
        $("#tdGroup" + this.minTwoDigits((i))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((i)) + "-NoGroup" + "" + '" colspan="' + this.calCulateMaxColSpan() + '"></td>');
      }
    }
    else if (this.isNewRowAdded) {
      this.isNewRowAdded = false;
      $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
      $("#tdGroup" + this.minTwoDigits((this.searchQueriesCtls.controls.length - 1))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((this.searchQueriesCtls.controls.length - 1)) + "-NoGroup" + "" + '" colspan="' + this.calCulateMaxColSpan() + '"></td>');
    }
    if (this.isDefaultSelection) {
      this.isDefaultSelection = false;

      var defaultItems = [];


      if (this.user && this.user.officeCode != 0) {
        var officeCodeObj = this.searchItems.find(a => a.displayValue.includes('Office'));
        if (!isNullOrUndefined(officeCodeObj))
          defaultItems.push(officeCodeObj);
      }

      if (this.user && this.user.teamCode != 0) {
        var teamCodeObj = this.searchItems.find(a => a.displayValue.includes('Team'));
        if (!isNullOrUndefined(teamCodeObj))
          defaultItems.push(teamCodeObj);
      }

      if (this.searchItems.find(a => a.displayValue.includes('User')))
        defaultItems.push(this.searchItems.find(a => a.displayValue.includes('User')));

      for (var i = 0; i < defaultItems.length; i++) {
        let idx: number = this.findIndexByKeyValue(this.searchItems, 'displayValue', defaultItems[i].displayValue);
        if (idx != -1)
          this.setDefaultSearchFilters(idx, i);
      }
      this.cdRef.detectChanges();
    }
  }

  setDefaultSearchFilters(index_searchItem: number, index_formArray) {
    let _searchItem: SearchItem = this.searchItems[index_searchItem];
    this.searchQueriesCtls.controls[index_formArray].get('searchItem').setValue(index_searchItem);
    this.searchQueriesCtls.controls[index_formArray].get('operator').setValue("IN");
    this.searchQueriesCtls.controls[index_formArray].get('mainOperator').setValue("AND");

    $("#txtControlType" + index_formArray).val(_searchItem.controlType);
    this.searchQueriesCtls.controls[index_formArray].get('columnName').setValue(_searchItem.columnName);
    this.searchQueriesCtls.controls[index_formArray].get('tableName').setValue(_searchItem.tableName);

    let selectedItem: number[] = [];
    if (_searchItem.displayValue == "Team") {
      var findValueInSearchItem = _searchItem.itemData.filter(i => i.value == this.user.teamCode);
      if (!isNullOrUndefined(findValueInSearchItem) && findValueInSearchItem.length > 0) {
        selectedItem.push(this.user.teamCode);
      }
    }
    else if (_searchItem.displayValue == "Office") {
      var findValueInSearchItem = _searchItem.itemData.filter(i => i.value == this.user.officeCode);
      if (!isNullOrUndefined(findValueInSearchItem) && findValueInSearchItem.length > 0) {
        selectedItem.push(this.user.officeCode);
      }
    }
    else if (_searchItem.displayValue == "User")
      var findValueInSearchItem = _searchItem.itemData.filter(i => i.value == this.user.cLPUserID);
    if (!isNullOrUndefined(findValueInSearchItem) && findValueInSearchItem.length > 0) {
      selectedItem.push(this.user.cLPUserID);
    }
    this.searchQueriesCtls.controls[index_formArray].get('selectedValueForMultiSelect').setValue(selectedItem);
  }

  ngAfterViewInit() {
    $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
    $("#tdGroup" + this.minTwoDigits((this.searchQueriesCtls.controls.length - 1))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((this.searchQueriesCtls.controls.length - 1)) + "-NoGroup" + "" + '" colspan="' + this.calCulateMaxColSpan() + '"></td>');
  }

  drawGroup() {
    $("td[id^=tdAddGroup]").remove();

    let colSpan: number = 1;
    this.groups.sort((a, b) => a.items.length < b.items.length ? -1 : a.items.length > b.items.length ? 1 : 0);
    let sortedGroups = this.groups;
    let color_flg: boolean = true;

    for (var grpId = 0; grpId < sortedGroups.length; grpId++) {
      var grp = sortedGroups[grpId];
      var grpRows = grp.items;
      colSpan = grp.colSpan;
      var color_class = color_flg ? "even-grouping" : "group-column";
      var color_classRunning = color_flg ? "even-running" : "group-column";
      color_flg = !color_flg;

      for (var rowId = 0; rowId < grpRows.length; rowId++) {

        var tdAdd_id = (this.minTwoDigits(grpRows[rowId]).toString() + "-" + grpId.toString());
        var tdbefore = $("td[id^=tdAddGroup" + this.minTwoDigits(grpRows[rowId]) + "]");

        if (rowId == 0) { //Start the group
          if (!isNullOrUndefined(tdbefore) && tdbefore.length > 0)
            $("#" + tdbefore[0].id).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + tdAdd_id + '" class="' + color_class + ' group-column-start"  click="deleteGroup($event)" title="Click to delete group"></td>');
          else
            $("#tdGroup" + this.minTwoDigits(grpRows[rowId])).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + tdAdd_id + '" class="' + color_class + ' group-column-start"  click="deleteGroup($event)" title="Click to delete group"></td>');
        }

        if (grpRows.length > 2 && (rowId > 0 && rowId < grpRows.length - 1)) { //Between Rows
          var tdbefore_groupColumn = $("td[id^=tdAddGroup" + this.minTwoDigits(grpRows[rowId]) + "]");
          if (!isNullOrUndefined(tdbefore_groupColumn) && tdbefore_groupColumn.length > 0)
            $("#" + tdbefore_groupColumn[0].id).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + tdAdd_id + '" class="' + color_classRunning + '" click="deleteGroup($event)" title="Click to delete group"></td>');
          else
            $("#tdGroup" + this.minTwoDigits(grpRows[rowId])).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + tdAdd_id + '" class="' + color_classRunning + '" click="deleteGroup($event)" title="Click to delete group"></td>');
        }

        if (rowId == grpRows.length - 1) { //End the group
          if (!isNullOrUndefined(tdbefore) && tdbefore.length > 0)
            $("#" + tdbefore[0].id).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + tdAdd_id + '" class="' + color_classRunning + ' group-column-end"  click="deleteGroup($event)" title="Click to delete group"></td>');
          else
            $("#tdGroup" + this.minTwoDigits(grpRows[rowId])).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + tdAdd_id + '" class="' + color_classRunning + ' group-column-end" click="deleteGroup($event)" title="Click to delete group"></td>');
        }
      }
      $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
    }

    var allRows = $("#tblSearch")[0].rows;
    var maxColspan = this.calCulateMaxColSpan();

    if (!isNullOrUndefined(allRows) && allRows.length > 0) {
      for (var rowIndex = 1; rowIndex <= allRows.length; rowIndex++) {

        var tdAddCnt = $("td[id^=tdAddGroup" + this.minTwoDigits((rowIndex - 1)) + "]").length;
        if (tdAddCnt > 0) {
          if (tdAddCnt < maxColspan) {
            if (tdAddCnt == 1) {
              var strGroupId = $("td[id^=tdAddGroup" + this.minTwoDigits((rowIndex - 1)) + "]")[0].id.split("-")[1];
              let isOverLappinng: boolean = false;
              if (!isNaN(strGroupId)) {
                for (var i = 0; i < this.groups.length; i++) {
                  if (i == +strGroupId) {
                    continue;
                  }
                  if (!(this.groups[strGroupId].items[this.groups[strGroupId].items.length - 1] < this.groups[i].items[0]
                    || this.groups[strGroupId].items[0] > this.groups[i].items[this.groups[i].items.length - 1]
                  )) {
                    isOverLappinng = true;
                  }
                }
              }
              if (!isOverLappinng) {
                for (var i = 0; i < maxColspan - 1; i++) {
                  var id_noOverlap = this.minTwoDigits((rowIndex - 1)) + "-" + grpId.toString();
                  $("#" + $("td[id^=tdAddGroup" + this.minTwoDigits((rowIndex - 1)) + "]")[0].id).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + id_noOverlap + "-NoOverlapping" + "" + '" colspan=0></td>');
                }
                $("#" + $("td[id^=tdAddGroup" + this.minTwoDigits((rowIndex - 1)) + "]")[0].id).attr('colspan', 0);
              } else $("#" + $("td[id^=tdAddGroup" + this.minTwoDigits((rowIndex - 1)) + "]")[0].id).attr('colspan', maxColspan);
            }
            else if (tdAddCnt > 1) {
              for (var i = 0; i < tdAddCnt; i++) { $("#" + $("td[id^=tdAddGroup" + this.minTwoDigits((rowIndex - 1)) + "]")[i].id).attr('colspan', 0); }
              $("#" + $("td[id^=tdAddGroup" + this.minTwoDigits((rowIndex - 1)) + "]")[tdAddCnt - 1].id).attr('colspan', (maxColspan - tdAddCnt) + 1);
            }
          }
        }
        else
          $("#tdGroup" + this.minTwoDigits((rowIndex - 1))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((rowIndex - 1)) + "-NoGroup" + "" + '" colspan="' + maxColspan + '"></td>');
      }
    }
  }

  minTwoDigits(n) {
    return (n < 10 ? '0' : '') + n;
  }

  calCulateGroupColSPan(group: Group): any {
    let colSpan: number = 1;
    let colspan_list: number[] = [];
    for (var grpId = 0; grpId < this.groups.length; grpId++) {
      if (this.groups[grpId].items[0] == group.items[0] && (group.items[group.items.length - 1] == this.groups[grpId].items[this.groups[grpId].items.length - 1])) {
        continue;
      }
      var result = this.groups[grpId].items.filter(item => group.items.includes(item));
      if (!isNullOrUndefined(result) && result.length > 0)
        colspan_list.push(this.groups[grpId].colSpan)
    }
    colSpan = colspan_list.length > 0 ? Math.max.apply(Math, colspan_list.map(function (o) { return o; })) + 1 : 1;
    return colSpan;
  }

  calCulateMaxColSpan() {
    let colspan_list: number[] = [];
    for (var i = 0; i < this.groups.length; i++)
      colspan_list.push(this.groups[i].colSpan);

    return Math.max.apply(Math, colspan_list.map(function (o) { return o; }));
  }

  resetColspanForAllItems() {
    if (!isNullOrUndefined(this.groups) && this.groups.length > 0) {
      for (var i = 0; i < this.groups.length; i++) {
        this.groups[i].colSpan = 0;
      }
      for (var i = 0; i < this.groups.length; i++) {
        this.groups[i].colSpan = this.calCulateGroupColSPan(this.groups[i]);
      }
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.updateValueAndValidity();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  get saveSearchFrm() {
    return this.saveSearchForm.controls;
  }

  updateSearch() {
    this.savedQuery_response = {} as SimpleResponse;
    var selectValueText = $("#drpSavedQueries option:selected").text();
    var selectValue = $("#drpSavedQueries  option:selected").val();
    if (selectValue != "0") {
      this.SubmitSearch();
    }
  }

  SubmitSearch() {

    this.setValidation();
    this.clearValidation(0);
    this.isSearchSubmit = true;
    this.savedQuery_response = {} as SimpleResponse;

    if ((this.saveSearchForm.valid) && (this.searchQueriesCtls.status != 'INVALID')) {
      this.showSpinner = true;
      this.createSearchQueryList();

      var drpSavedQueries_selectValue = $('#drpSavedQueries').val();
      var selectValueQuery = drpSavedQueries_selectValue == '' || isNullOrUndefined(drpSavedQueries_selectValue) ? 0 : +drpSavedQueries_selectValue;
      this._searchContactService.SavedSearchQueries_Update(this.encryptedUser, this.searchQueryResponse, this.user.cLPUserID, selectValueQuery, this.saveSearchForm.get('SearchQueryName').value)
        .then(res => {
          if (res) {
            var response = UtilityService.clone(res);
            this.savedQuery_response = response;

            this.showSpinner = false;
            this.isSearchSubmit = false;
            if (response.errorMsg == "" && response.messageBool == false) {
              this.savedQuery_Filter = this.savedQuery_response.list;
              this.savedQueryValue = this.savedQuery_Filter.length > 0 ? this.savedQuery_Filter[this.savedQuery_Filter.length - 1].key.toString() : '0';
              var msg = this.isEditSavedSearch ? 'updated' : 'added';
              this.hideSearch();
              this.IsSaveSearch = false;
              this.getContactsSearchSubscription = null as Subscription;
              this.isEditSavedSearch = false;
              this.saveSearchForm.reset();
              this.saveSearchForm.get('SearchQueryName').setValue('');
              this.notifyService.showSuccess("Query " + msg + " successfully!", "", 3000);
              this.setSavedSearchDropDown();
            }
            else {
              if (this.savedQueryValue != '0') {
                var savedValue = this.savedQueryValue;
                $("#drpSavedQueries").val(savedValue);
              }
            }
          }
          else {
            this.notifyService.showError("Error during Submitting Search. Please contact administrator!", "", 3000);
            this.showSpinner = false;
          }
        }).catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          this.isSearchSubmit = false;
          this.isEditSavedSearch = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
    else {
      if (!this.saveSearchForm.valid)
        this.validateAllFormFields(this.saveSearchForm);
    }
  }

  setSavedSearchDropDown() {
    setTimeout(() => {
      var savedValue = this.savedQueryValue;
      $("#drpSavedQueries").val(savedValue);
      $("#drpSavedQueries option[value=" + savedValue + "]");
      this.drpSavedQueries_onChange('e');
    }, 100);
  }

  createSearchQueryList() {

    this.searchQueryList = [];
    for (var i = 0; i < this.searchQueriesCtls.controls.length; i++) {

      this.searchQuery = <SearchQuery>{};
      this.searchQuery.cLPUserID = this.user.cLPUserID;
      this.searchQuery.searchItem = $('#txtColumnName' + i).val();
      this.searchQuery.operator = this.searchQueriesCtls.controls[i].get('operator').value;
      this.searchQuery.controlType = $("#txtControlType" + i).val();

      if ($("#txtControlType" + i).val() == 'd')
        this.searchQuery.searchItemValue = $('#drpFieldData' + i + ' :selected').val();
      else
        this.searchQuery.searchItemValue = $('#txtFieldData' + i).val();

      let ct: string = $("#txtControlType" + i).val();

      switch (ct) {
        case 't': this.searchQuery.searchItemValue = $('#txtFieldData' + i).val(); break;
        case 'd': this.searchQuery.searchItemValue = $('#drpFieldData' + i + ' :selected').val(); break;
        case 'md':
          this.searchQuery.searchItemValue = this.searchQueriesCtls.controls[i].get('selectedValueForMultiSelect').value.join(); break;
        case 'r':
          this.searchQuery.searchItemValue = this.searchQueriesCtls.controls[i].get('txtRangeFrom').value + ',' + this.searchQueriesCtls.controls[i].get('txtRangeTo').value;
          break;
        case 'dt':
          this.searchQuery.strDtStart = this.datePipe.transform(this.searchQueriesCtls.controls[i].get('dtStart').value, 'MM-dd-yyyy');
          this.searchQuery.strDtEnd = this.datePipe.transform(this.searchQueriesCtls.controls[i].get('dtEnd').value, 'MM-dd-yyyy');
          this.searchQuery.dtStart = this.searchQueriesCtls.controls[i].get('dtStart').value;
          this.searchQuery.dtEnd = this.searchQueriesCtls.controls[i].get('dtEnd').value;
        case 'dtCustom':
          this.searchQuery.searchItemValue = this.datePipe.transform(this.searchQueriesCtls.controls[i].get('searchItemValue').value, "MM-dd-yyyy");
          break;
        default:
      }
      this.searchQuery.groupBy = '';
      if (i.toString() == "0")
        this.searchQuery.mainOperator = '';
      else
        this.searchQuery.mainOperator = this.searchQueriesCtls.controls[i].get('mainOperator').value;
      this.searchQuery.tableName = $('#txtTableName' + i).val();
      this.searchQueryList.push(this.searchQuery);
    }
    this.searchQueryResponse = <SearchQueryResponse>{ group: [], searchQueryList: [] };
    this.searchQueryResponse.searchQueryList = this.searchQueryList;
    this.searchQueryResponse.group = this.groups;
  }

  drpSavedQueries_onChange(event) {
    $("td[id^=tdAddGroup]").remove();
    var selectValue = $('#drpSavedQueries').val();
    this.savedQueryValue = selectValue;
    if (selectValue != "0") {
      this.isDrpSavedQueryChanged = true;
      this._searchContactService.getSavedSearhById(this.encryptedUser, +selectValue)
        .then(res => {
          if (res) {
            this.savedsearchQueryResponse = UtilityService.clone(res);
            var _searchQueryList = this.savedsearchQueryResponse.searchQueryList;
            var searchQueriesCtls_length = this.searchQueriesCtls.controls.length;
            this.searchQueriesCtls.controls = [];
            this.groups = this.savedsearchQueryResponse.group;
            for (var i = 0; i < _searchQueryList.length; i++) {
              this.searchQueriesCtls.push(this.fb.group({
                cLPUserID: '-1',
                searchItem: [-1, Validators.required],
                operator: ['', Validators.required],
                searchItemValue: '',
                groupBy: '',
                mainOperator: ['', Validators.required],
                action: '',
                isSelected: false,
                tableName: '',
                columnName: '',
                dtStart: '',
                dtEnd: '',
                selectedValueForMultiSelect: '',
                txtRangeFrom: '',
                txtRangeTo: ''
              }))
            }
            this.isNewRowsAddedOnLoad = true;
            this.isDrpSavedQueryChanged = false;
            this.btnRunSavedSearch_click();
          }
          else
            this.isDrpSavedQueryChanged = false;
        }).catch((err: HttpErrorResponse) => {
          this._utilityService.handleErrorResponse(err);
          this.isDrpSavedQueryChanged = false;
        });

    }
    else {
      this.getContacts();
      this.getRecentContacts();
    }
  }

  btnRunSavedSearch_click() {
    var selectValue = $('#drpSavedQueries').val();
    if (selectValue != "0") {
      this.showSpinner = true;
      this._searchContactService.executeSavedQuery(this.encryptedUser, +selectValue)
        .then(res => {
          if (res) {
            this.contactListResponse = UtilityService.clone(res);
            this.contactsData = this.contactListResponse.contactList;
            this.initContactsData = this.contactListResponse.contactList;
            this.showSpinner = false;
            this.getContactsSearchSubscription = null as Subscription;
          }
          else {
            this.notifyService.showError("Error during Fetching data. Please contact administrator!", "", 3000);
            this.showSpinner = false;
          }
        }).catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  editSavedQuery() {
    var selectValue = $('#drpSavedQueries').val();
    if (selectValue != "0" && !isNullOrUndefined(this.savedsearchQueryResponse)) {
      this.savedQuery_response = {} as SimpleResponse;
      this.isEditSavedSearch = true;
      this.IsSaveSearch = true;
      var _searchQueryList = this.savedsearchQueryResponse.searchQueryList;

      for (var i = 0; i < _searchQueryList.length; i++) {

        var idx = this.findIndexByKeyValue(this.searchItems, 'columnName', _searchQueryList[i].searchItem);
        this.searchQueriesCtls.controls[i].get('searchItem').setValue(idx);

        this.searchQueriesCtls.controls[i].get('operator').setValue(_searchQueryList[i].operator);
        this.searchQueriesCtls.controls[i].get('mainOperator').setValue(_searchQueryList[i].mainOperator);

        $("#txtControlType" + i).val(_searchQueryList[i].controlType);
        this.searchQueriesCtls.controls[i].get('columnName').setValue(_searchQueryList[i].searchItem);
        this.searchQueriesCtls.controls[i].get('tableName').setValue(_searchQueryList[i].tableName);

        switch (_searchQueryList[i].controlType) {
          case 't':
          case 'd':
            this.searchQueriesCtls.controls[i].get('searchItemValue').setValue(_searchQueryList[i].searchItemValue);
            break;
          case 'md':
            var selectedValues = _searchQueryList[i].searchItemValue.split(",").map(Number);
            this.searchQueriesCtls.controls[i].get('selectedValueForMultiSelect').setValue(selectedValues);
            break;
          case 'r':
            var rangeValues = _searchQueryList[i].searchItemValue.split(",");
            if (!isNullOrUndefined(rangeValues)) {
              this.searchQueriesCtls.controls[i].get('txtRangeFrom').setValue(rangeValues[0]);
              this.searchQueriesCtls.controls[i].get('txtRangeTo').setValue(rangeValues[1]);
            }
            break;
          case 'dt':
            this.searchQueriesCtls.controls[i].get('dtStart').setValue(_searchQueryList[i].dtStart);
            this.searchQueriesCtls.controls[i].get('dtEnd').setValue(_searchQueryList[i].dtEnd);
            break;
          default:
            break;
        }
      }
      this.showSearch();
      var selectValueText = $("#drpSavedQueries option:selected").text();
      var selectValue = $("#drpSavedQueries  option:selected").val();
      if (selectValue != "0") {
        this.saveSearchForm.reset();
        this.saveSearchForm.get('SearchQueryName').setValue(selectValueText);
      }

      if (this.groups.length > 0) {
        this.resetColspanForAllItems();
        this.drawGroup();
      }
    }
  }

  deleteSavedQuery() {
    var drpSavedQueries_selectValue = $('#drpSavedQueries').val();
    if (drpSavedQueries_selectValue != 0) {
      this.isEditSavedSearch = false;
      this.hideDeleteSearch();
      var selectValueQuery = drpSavedQueries_selectValue == '' || isNullOrUndefined(drpSavedQueries_selectValue) ? 0 : +drpSavedQueries_selectValue;
      this._searchContactService.savedSearchQueries_Delete(this.encryptedUser, this.user.cLPUserID, selectValueQuery)
        .then(res => {
          if (res) {
            var response = UtilityService.clone(res);
            this.savedQuery_Filter = response.list;
            this.getContacts();
            this.getRecentContacts();
            this.hideSearch();
            this.notifyService.showSuccess("Query deleted successfully!", "", 3000);
          } else {
            this.notifyService.showError("Error during Removing Search. Please contact administrator!", "", 3000);
            this.showSpinner = false;
          }
        }).catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          this.hideDeleteSearch();
          this._utilityService.handleErrorResponse(err);
        });
    }
    else
      this.notifyService.showSuccess("Please select query for delete.", "", 3000);
  }

  showDeleteSearch() {
    var drpSavedQueries_selectValue = $('#drpSavedQueries').val();

    if (drpSavedQueries_selectValue != 0) {
      var drpSavedQueries_selectedVal = '';
      drpSavedQueries_selectedVal = $('#drpSavedQueries').find(":selected").text();
      this.delete_string = "Do you want to delete Saved Search - " + drpSavedQueries_selectedVal + '?';
      $('#modalDeleteSearch').modal('show');
    }
    else
      alert("Please select query for delete.");
  }

  hideDeleteSearch() {
    $('#modalDeleteSearch').modal('hide');
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
            if (confirm("Please select your timezone to view contact detail."))
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
        //case "address-card": {
        //  var addreddUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/view.aspx?cid=" + dataItem.contactID + "&mde=e");
        //  window.open(addreddUrl, '_blank');
        //  break;
        //}
        case "email": {
          $('#sendEmailModal').modal('show');
          this.sendMailInfo.isShow = true;
          this.sendMailInfo.contactId = dataItem?.contactID;

          //var goTo = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/clpemail.aspx?cid=" + dataItem.contactID);
          //window.open(goTo, '', 'width=800,height=800,left=-10');
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  hideSendMail() {
    $('#sendEmailModal').modal('hide');
    this.sendMailInfo.isShow = false;
    this.sendMailInfo.contactId = 0;
  }

  addNewContact() {
    this._router.navigate(['/contact-create']);
  }

  findIndexByKeyValue(_array, key, value) {
    for (var i = 0; i < _array.length; i++) {
      if (_array[i][key] == value) {
        return i;
      }
    }
    return -1;
  }

  drpOperator_onChange(id: any) {
    var searchItem = this.searchItems[this.searchQueriesCtls.controls[id].get('searchItem').value];
    var selectedItem: any[] = [];

    if (this.searchQueriesCtls.controls[id].get('operator').value == "CA") {
      for (var i = 0; i < searchItem.itemData.length; i++)
        selectedItem.push(searchItem.itemData[i].value);
      this.searchQueriesCtls.controls[id].get('selectedValueForMultiSelect').setValue(selectedItem);
    }
    else {
      selectedItem = [];
      this.searchQueriesCtls.controls[id].get('selectedValueForMultiSelect').setValue(selectedItem);
    }
  }


  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Contact List`;
    let rows = options.sheets[0].rows;
    rows.forEach((row) => {
      if (row && row.type == "data") {
        row.cells.forEach((cell) => {
          if (cell && cell.value && cell.value.includes("<br>")) {
            cell.value = cell.value.replace(/<br\s*\/?>/gi, ' ');
          }
        });
      }
    });
    Array.prototype.unshift.apply(rows);
    component.save(options);
  }
  resetGridSetting(gridType) {
    if (gridType == 'contactGrid') {
      this.deleteColumnsConfiguration(this.user.cLPUserID, 'contactGrid').subscribe((value) => {
        this.showSpinner = false;
        this.sortingColumn = '';
        this.reorderColumnName = 'name,email,companyName,address:h,city:h,state:h,country:h,zip:h,emailAddress:h,phone,userName,dtModifiedDisplay,dtCreatedDisplay';
        this.columnWidth = 'name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90';
        this.pageSize = 10;
        this.getGridColumnsConfiguration(this.user.cLPUserID, 'contactGrid');
      });
    }
    else if (gridType == 'recentContactGrid') {
      this.deleteColumnsConfiguration(this.user.cLPUserID, 'recentContactGrid').subscribe((value) => {
        this.showSpinner = false;
        this.recentSortingColumn = '';
        this.reorderColumnNameRecent = 'name,email,companyName,address:h,city:h,state:h,country:h,zip:h,emailAddress:h,phone,userName,dtModifiedDisplay,dtCreatedDisplay';
        this.recentColumnWidth = 'name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90';
        this.recentPageSize = 10;
        this.getGridColumnsConfiguration(this.user.cLPUserID, 'recentContactGrid');
      });
    }


  }
  deleteColumnsConfiguration(clpUserId, tableName) {
    return new Observable(observer => {
      this.showSpinner = true;
      this._gridColumnsConfigurationService.deleteGridColumnsConfiguration(this.encryptedUser, clpUserId, tableName)
        .then(result => {
          observer.next("success");
        }).catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
        });
    });
  }

  public getEventStyles = (args: EventStyleArgs) => {
    return { backgroundColor: args.event.dataItem.color };
  }

  giveAccessContact() {
    if (this.roleFeaturePermissions?.isAdmin)
      return !((this.roleFeaturePermissions?.create || this.roleFeaturePermissions?.edit) && this.roleFeaturePermissions?.isAdmin)
    else
      return !(this.roleFeaturePermissions?.create || this.roleFeaturePermissions?.edit)
  }
}
