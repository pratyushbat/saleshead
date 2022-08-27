import { Injectable, Inject, EventEmitter } from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../models/appConfig.model';
import * as $ from "jquery";
import { CLPUser, UserResponse } from '../../models/clpuser.model';
import { catchError } from 'rxjs/operators';
import { SearchContactService } from '../Searchcontact.service';
import { Group, Item, keyValue, SearchItem, SearchItemListResponse, SearchQueryResponse } from '../../models/search.model';
import { UtilityService } from './utility.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactList, ContactListResponse } from '../../models/contact.model';
import { NotificationService } from '../notification.service';

import { isNullOrUndefined, isNull, isNumber } from 'util';
import { LocalService } from './local.service';
import { ContactService } from '../contact.service';
import { eFeatures } from '../../models/enum.model';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';

//$(document.body).click(function () {
//  $(".menu-show").removeClass("menu-show");
//});

@Injectable()
export class ContactSearchService {

  contactListChanged = new EventEmitter();

  private baseUrl: string;
  private api: string = "api/Authentication";

  savedQueryValue: string = '0';
  isDrpSavedQueryChanged: boolean = false;
  isSearchEditClick: boolean = false;
  showSpinner: boolean = false;
  savedsearchQueryResponse: SearchQueryResponse;
  contactListResponse: ContactListResponse;
  public encryptedUser: string = '';
  searchQueriesForm: FormGroup;
  groups: Group[] = [];
  isNewRowsAddedOnLoad: any;
  contactsData: ContactList[] = [];
  public initContactsData: ContactList[] = [];
  private getContactsSearchSubscription: Subscription;
  isNewRowAdded: boolean = false;
  savedQuery_Filter: keyValue[] = [];
  searchItemListResponse: SearchItemListResponse;
  searchItems: SearchItem[] = <SearchItem[]>{};
  itemData_user_all: Item[] = <Item[]>{};
  user: CLPUser;

  routeUserId: number;
  routeContactId: number;

  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  constructor(private _router: Router,
    private _route: ActivatedRoute,
    private httpClient: HttpClient,
    private _searchContactService: SearchContactService,
    private _utilityService: UtilityService,
    private notifyService: NotificationService,
    private _localService: LocalService,
    public _contactService: ContactService,
    public fb: FormBuilder,
    @Inject('BASE_URL') _baseUrl: string) {
    this.baseUrl = _baseUrl + this.api;

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");

        this.authenticateR(() => {
          if (!isNullOrUndefined(this.user)) {
            this.searchQueriesForm = this.prepareSearchQueriesForm();
            this.getContactSearch();
          }
          else {
            this._router.navigate(['/unauthorized']);
          }
        })
      }
      else {
        this._router.navigate(['/unauthorized']);
      }
  
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ContactCreate)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async getContactSearch() {
    await this._searchContactService.getSearchFields(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: SearchItemListResponse) => {
        if (result) {
          this.searchItemListResponse = UtilityService.clone(result);
          this.searchItems = this.searchItemListResponse.searchItems;
          this.savedQuery_Filter = this.searchItemListResponse.savedQueries;
          this.itemData_user_all = this.searchItems.filter(i => i.displayValue == "User").length > 0 ? this.searchItems.filter(i => i.displayValue == "User")[0].itemData : [];
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getContacts() {
    var userId = this.user.cLPUserID;
    await this._contactService.getContacts(this.encryptedUser, this.routeUserId)
      .then(async (result: ContactListResponse) => {
        if (result) {
          this.contactListResponse = UtilityService.clone(result);
          this.contactListChanged.emit(this.contactListResponse.contactList);
          this.contactsData = this.contactListResponse.contactList;
          this.initContactsData = this.contactListResponse.contactList;
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  private prepareSearchQueriesForm(): FormGroup {
    this.isNewRowAdded = true;
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
  }

  get searchQueriesCtls() {
    return this.searchQueriesForm.get('searchQueries') as FormArray;
  }

  drpSavedQueries_onChange(event) {
    this.isSearchEditClick = false;
    this.showSpinner = true;
    $("td[id^=tdAddGroup]").remove();
    var selectValue = $('#drpSavedQueries').val();
    this.savedQueryValue = selectValue;
    if ((selectValue != "0") && (selectValue != "-2")) {
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
            /*this.showSpinner = false;*/
            this.isNewRowsAddedOnLoad = true;
            this.isDrpSavedQueryChanged = false;
            this.btnRunSavedSearch_click();
          }
          else {
            this.isDrpSavedQueryChanged = false;
            this.showSpinner = false;
          }
        }).catch((err: HttpErrorResponse) => {
          this._utilityService.handleErrorResponse(err);
          this.isDrpSavedQueryChanged = false;
          this.showSpinner = false;
        });

    }
    else {
      this.getContacts();
      if (this.savedQueryValue == "-2")
        this.setSavedSearchDropDown();
      //TODO - Check for all savedQueryValue (Handling for -2 same as 0)
      this.showSpinner = false;
    }
  }

  setSavedSearchDropDown() {
    setTimeout(() => {
      var savedValue = this.savedQueryValue;
      $("#drpSavedQueries").val(savedValue);
      $("#drpSavedQueries option[value=" + savedValue + "]");
    }, 1000);
  }

  btnRunSavedSearch_click() {
    var selectValue = $('#drpSavedQueries').val();
    if (selectValue != "0") {
      this._searchContactService.executeSavedQuery(this.encryptedUser, +selectValue)
        .then(res => {
          if (res) {
            this.contactListResponse = UtilityService.clone(res);
            this.contactListChanged.emit(this.contactListResponse.contactList);
            this.contactsData = this.contactListResponse.contactList;
            this.initContactsData = this.contactListResponse.contactList;
            this.getContactsSearchSubscription = null as Subscription;
            this.showSpinner = false;
          }
          else {
            this.showSpinner = false;
            this.notifyService.showError("Error during Fetching data. Please contact administrator!", "", 3000);
          }
        }).catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  //Edit Search
  editSavedQuery() {
    var selectValue = $('#drpSavedQueries').val();
    if (selectValue != "0" && !isNullOrUndefined(this.savedsearchQueryResponse)) {
      this.isSearchEditClick = true;
    }
  }
  //Edit Search

}
