
import { NgModule, Component, OnInit, ViewChild, ChangeDetectorRef, NgZone, Input } from '@angular/core';
import { FormControl, FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { isNullOrUndefined, isNull, isNumber } from 'util';

import { DataBindingDirective, DataStateChangeEvent, NumericFilterCellComponent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { process, SortDescriptor, State, DataResult } from '@progress/kendo-data-query';
import { observe } from '@progress/kendo-angular-grid/dist/es2015/utils';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { Group, Item, keyValue, Search, SearchItem, SearchItemListResponse, SearchListResponse, SearchOperatorsMap, SearchQuery, SearchQueryResponse } from '../../../../models/search.model';
import { ContactList, ContactListResponse } from '../../../../models/contact.model';
import { ContactService } from '../../../../services/contact.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { LocalService } from '../../../../services/shared/local.service';
import { SearchContactService } from '../../../../services/Searchcontact.service';
import { AppconfigService } from '../../../../services/shared/appconfig.service';
import { NotificationService } from '../../../../services/notification.service';
import { ContactSearchService } from '../../../../services/shared/contact-search.service';
import { ConfigDetails } from '../../../../models/appConfig.model';
import { eFeatures } from '../../../../models/enum.model';
import { ContactCommonSearchService } from '../../../../services/shared/contact-common-search.service';
declare var $: any;

@Component({
  selector: 'contact-common-search',
  templateUrl: './contact-common-search.component.html',
  styleUrls: ['./contact-common-search.component.css']
})
/** contact-common-search component*/
export class ContactCommonSearchComponent {
  @Input() isArchive?: boolean;
  @Input() execMapDuplicate?: boolean = false;
  @Input() isCompany?: boolean = false;
  @Input() isLead?: boolean = false;
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  contactListResponse: ContactListResponse;
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

  @Input() sendMailInfo: any = { isShow: false, contactId: 0 };

  _colSpan: number = 0;


  searchItemValue: FormControl = new FormControl();
  kv_MultiSelect: keyValue[] = [];
  searchOperators: SearchOperatorsMap[] = [];
  valueSelected: string;

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

  constructor(
    private fb: FormBuilder,
    public _contactService: ContactService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _searchContactService: SearchContactService,
    public _contactSearchService: ContactCommonSearchService,
    private _appConfigService: AppconfigService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef,
    private notifyService: NotificationService,
    private ngZone: NgZone
  ) {
    this._localService.isMenu = true;
    this._appConfigService.getAppConfigValue(this.encryptedUser, "SO_Site")
      .then(async (result: ConfigDetails) => {
        this.soUrl = result.configValue;
      })
    this._appConfigService.getAppConfigValue(this.encryptedUser, "MySO_URL").
      then(async (result: ConfigDetails) => {
        this.mySOUrl = result.configValue;
      })
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
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.isCompany ? this.getCompanySearch() : this.isLead ? this.getLeadSearch() : this.getContactSearch();
        }
        else {
          this.showSpinner = false;
          this._router.navigate(['/unauthorized']);
        }
      })

    }
    else {
      this.showSpinner = false;
      this._router.navigate(['/unauthorized']);
    }
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ContactList)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse) && this.userResponse.roleFeaturePermissions) {
            this.user = this.userResponse.user;
            if (this.user?.userRole <= 3) {
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
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

  async getContacts() {
    /* this.loadContacts = true;*/
    var userId = this.user.cLPUserID;
    await this._contactService.getContacts(this.encryptedUser, userId)
      .then(async (result: ContactListResponse) => {
        if (result) {
          this.contactListResponse = UtilityService.clone(result);
          /*   this.contactListChanged.emit(this.contactListResponse.contactList);*/
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        /*    this.loadContacts = false;*/
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }



  showColumn(columnDef): boolean {
    var value = true;
    if (columnDef) {
      (columnDef == 'email') || (columnDef == 'phone') ? value = false : value = true;
    }
    return value;
  }

  async getContactSearch() {
    this.showSpinner = true;
    await this._searchContactService.getSearchFields(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: SearchItemListResponse) => {
        if (result) {
          this.searchItemListResponse = UtilityService.clone(result);
          this.searchItems = this.searchItemListResponse.searchItems;
          this.savedQuery_Filter = this.searchItemListResponse.savedQueries;
          this.itemData_user_all = this.searchItems.filter(i => i.displayValue == "User").length > 0 ? this.searchItems.filter(i => i.displayValue == "User")[0].itemData : <Item[]>{};;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getCompanySearch() {
    this.showSpinner = true;
    await this._searchContactService.getCompanySearchFields(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID)
      .then(async (result: SearchItemListResponse) => {
        if (result) {
          this.searchItemListResponse = UtilityService.clone(result);
          this.searchItems = this.searchItemListResponse.searchItems;
          this.savedQuery_Filter = [];
          this.itemData_user_all = this.searchItems.filter(i => i.displayValue == "User").length > 0 ? this.searchItems.filter(i => i.displayValue == "User")[0].itemData : <Item[]>{};;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getLeadSearch() {
    this.showSpinner = true;
    await this._searchContactService.getLeadSearchFields(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID)
      .then(async (result: SearchItemListResponse) => {
        if (result) {
          this.searchItemListResponse = UtilityService.clone(result);
          this.searchItems = this.searchItemListResponse.searchItems;
          this.savedQuery_Filter = [];
          this.itemData_user_all = this.searchItems.filter(i => i.displayValue == "User").length > 0 ? this.searchItems.filter(i => i.displayValue == "User")[0].itemData : <Item[]>{};;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
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
      this.getContactsSearchSubscription?.unsubscribe();
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
          case 'mt':
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
      if (this.execMapDuplicate) {
        this._contactSearchService.emitQueryListChangedChangeEvent(this.searchQueryResponse);
        this.showSpinner = false;
        this.hideSearch();
        this.isSearchSubmit = false;
        this.isEditSavedSearch = false;
      } else if (this.isLead) {
        this._contactSearchService.emitqueryLeadListChangedChangeEvent(this.searchQueryResponse);
        this.showSpinner = false;
        this.hideSearch();
        this.isSearchSubmit = false;
        this.isEditSavedSearch = false;
      }
      else {
        this.getContactsSearchSubscription = this._searchContactService.getContactSearchAsync(this.encryptedUser, this.searchQueryResponse, this.isArchive ? true : null)
          .subscribe(res => {
            if (res) {
              this.contactListResponse = UtilityService.clone(res);
              this.savedQueryValue = '0';
              this.hideSearch();
              this._contactSearchService.contactListChanged.emit(this.contactListResponse.contactList);
              this._contactSearchService.queryListChanged.emit(this.searchQueryResponse);
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



  validation() {
    this.clearAllValidation().subscribe((value) => this.setValidation());
  }

  drpFields_onChange(id: any) {
    var dd = this.searchQueriesCtls;
    this.items = [];
    this.searchFilterItem = this.searchItems.filter(x => x.displayValue === $('#drpFields' + id + ' :selected').text().trim());
    if (this.isLead == true) {
      $("#txtControlType" + id).val(this.searchFilterItem[0].controlType);
      $('#txtTableName' + id).val(this.searchFilterItem[0].tableName);
      $('#txtColumnName' + id).val(this.searchFilterItem[0].columnName);
    } else {
      $("#txtControlType" + id).val(this.searchFilterItem[0].controlType);
      $('#txtTableName' + id).val(this.searchFilterItem[0].itemData[0].tableName);
      $('#txtColumnName' + id).val(this.searchFilterItem[0].itemData[0].columnName);
    }


    switch (this.searchFilterItem[0].controlType) {
      case 't': case 'd': case 'mt': this.searchQueriesCtls.controls[id].get('searchItemValue').setValue(''); break;
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
      /*id- 0018*/
      this.drpFields_onChange(0);
      /* 0018*/
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
        case 't': case 'mt': this.searchQuery.searchItemValue = $('#txtFieldData' + i).val(); break;
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
            this._contactSearchService.queryListChanged.emit(this.savedsearchQueryResponse);
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
    }
  }

  btnRunSavedSearch_click() {
    var selectValue = $('#drpSavedQueries').val();
    if (selectValue != "0") {
      this.showSpinner = true;
      this._searchContactService.executeSavedQuery(this.encryptedUser, +selectValue, this.isArchive ? true : null)
        .then(res => {
          if (res) {
            this.contactListResponse = UtilityService.clone(res);
            this._contactSearchService.contactListChanged.emit(this.contactListResponse.contactList);


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
          case 'mt':
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


}
