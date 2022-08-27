import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { isNullOrUndefined, isNull, isNumber } from 'util';

import { pageAnimations, filterAnimation } from '../../../../animations/page.animation';

import { ContactSearchService } from '../../../../services/shared/contact-search.service';
import { NotificationService } from '../../../../services/notification.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { LocalService } from '../../../../services/shared/local.service';
import { SearchContactService } from '../../../../services/Searchcontact.service';
import { ContactService } from '../../../../services/contact.service';

import { SimpleResponse } from '../../../../models/genericResponse.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { ContactListResponse } from '../../../../models/contact.model';
import { Group, Item, keyValue, Search, SearchItem, SearchItemListResponse, SearchListResponse, SearchOperatorsMap, SearchQuery, SearchQueryResponse } from '../../../../models/search.model';
import { eFeatures } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';

declare var $: any;

@Component({
    selector: 'app-contact-search',
    templateUrl: './contact-search.component.html',
    styleUrls: ['./contact-search.component.css'],
    animations: [pageAnimations, filterAnimation]
})
/** contact-search component*/
export class ContactSearchComponent implements OnInit {
  //Animation
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  //Animation
  /** contact-search ctor */
  @Input() isEdit: boolean = false;

  IsSaveSearch: boolean = false;
  isDefaultSelection: boolean;
  isGroup: boolean = false;
  isSearchSubmit: boolean = false;
  showSpinner: boolean = false;
  isEditSavedSearch: boolean = false;

  private encryptedUser: string = '';
  delete_string: string = '';

  private getContactsSearchSubscription: Subscription;

  savedQuery_response: SimpleResponse;
  contactListResponse: ContactListResponse;
  user: CLPUser;
  searchQueryResponse: SearchQueryResponse;
  searchQueryList: SearchQuery[] = [];
  items: Item[] = <Item[]>{};
  searchQuery: SearchQuery = <SearchQuery>{};
  searchFilterItem: SearchItem[];
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  saveSearchForm: FormGroup;
  searchItemValue: FormControl = new FormControl();

  constructor(public _contactSearchService: ContactSearchService,
    private notifyService: NotificationService,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _searchContactService: SearchContactService,
    public _contactService: ContactService,
    private datePipe: DatePipe,
  ) {
  }

  ngOnInit() {
    var self = this;
    $(function () {
      $('body').unbind().on('click', 'td', function (e) {
        if (e.currentTarget.className == "group-column group-column-start" || e.currentTarget.className == "even-grouping group-column-start") {
          var current = self._router.url;
          var splitUrl = current ? current.split('/', 4) : '';
          var currentUrl = splitUrl.length > 0 ? splitUrl[1] : 'contact';
          var grpToDelete = e.currentTarget.id.split("-")[1];
          if (isNumber(+grpToDelete)) {
            self._contactSearchService.groups.splice(+grpToDelete, 1);
            self.resetColspanForAllItems();
            self.drawGroup();
            if (currentUrl == 'contact')
              self.notifyService.showSuccess("Group has been deleted successfully!", "", 2000);
          }
        }
      });
    });

    this.saveSearchForm = this.prepareSaveSearchForm();
    this.saveSearchForm.reset();

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");

        this.authenticateR(() => {
          if (!isNullOrUndefined(this.user)) {

            if (!this.isEdit)
              this.showSearch(true);
            else
              this.editSavedQuery();

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

  ngOnChanges() {
    if ((!this.isEdit) && (!isNullOrUndefined(this.user)))
      this.showSearch(true);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ContactList)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            if (this.user?.userRole <= 3) {
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              if (this.roleFeaturePermissions?.view == false)
                this._router.navigate(['/unauthorized', true]);
            }

            this.showSpinner = false;
          }
          else
            this._router.navigate(['/unauthorized']);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  private prepareSaveSearchForm(): FormGroup {
    return this.fb.group({
      SearchQueryName: [{ value: '' }, [Validators.required]]
    });
  }

  get saveSearchFrm() {
    return this.saveSearchForm.controls;
  }

  resetColspanForAllItems() {
    if (!isNullOrUndefined(this._contactSearchService.groups) && this._contactSearchService.groups.length > 0) {
      for (var i = 0; i < this._contactSearchService.groups.length; i++) {
        this._contactSearchService.groups[i].colSpan = 0;
      }
      for (var i = 0; i < this._contactSearchService.groups.length; i++) {
        this._contactSearchService.groups[i].colSpan = this.calCulateGroupColSPan(this._contactSearchService.groups[i]);
      }
    }
  }

  createGroups() {
    let chkDup: boolean = false;
    let ctrRows: number = 1;
    let cntGroups: number = this._contactSearchService.groups.length;

    if (this.isGroup) {
      let group: Group = <Group>{ items: [], colSpan: 0 };
      for (var i = 0; i < this._contactSearchService.searchQueriesCtls.controls.length; i++) {
        var isSelected = this._contactSearchService.searchQueriesCtls.controls[i].get('isSelected');

        if (isSelected.value)
          group.items.push(i);
        else if (group.items.length > 1) {
          chkDup = false;
          if (!chkDup) {
            this._contactSearchService.groups.push(group);
          }
          group = <Group>{ items: [], colSpan: 0 };
        }
        else
          group = <Group>{ items: [], colSpan: 0 };

        this._contactSearchService.searchQueriesCtls.controls[i].get('isSelected').setValue(false);
      }

      if (group.items.length > 1) {
        chkDup = false;
        if (!chkDup) {
          if (group.items.length > 1) {
            this._contactSearchService.groups.push(group);
          }
        }
      }

      this._contactSearchService.groups[this._contactSearchService.groups.length - 1].colSpan = this.calCulateGroupColSPan(this._contactSearchService.groups[this._contactSearchService.groups.length - 1]);
      let flag: boolean = true;
      if (!isNullOrUndefined(this._contactSearchService.groups) && this._contactSearchService.groups.length > 0) {
        var lastGroupAdded = this._contactSearchService.groups[this._contactSearchService.groups.length - 1];

        for (var i = 0; i < this._contactSearchService.groups.length - 1; i++) {

          var firstItem_lastGroup = lastGroupAdded.items[0];
          var lastItem_lastGroup = lastGroupAdded.items[lastGroupAdded.items.length - 1];

          var firstItem_current = this._contactSearchService.groups[i].items[0];
          var lastItem_current = this._contactSearchService.groups[i].items[this._contactSearchService.groups[i].items.length - 1]

          //Starting within
          if ((firstItem_lastGroup > firstItem_current && firstItem_lastGroup <= lastItem_current)
            && (lastItem_lastGroup > lastItem_current) && (flag)) {
            flag = false;
            this._contactSearchService.groups.pop();
            this.notifyService.showError("Intersecting Groups are not allowed!", "", 3000);
          }

          //Starting before
          if ((firstItem_lastGroup < firstItem_current && (lastItem_lastGroup >= firstItem_current && lastItem_lastGroup < lastItem_current) && (flag))) {
            flag = false;
            this._contactSearchService.groups.pop();
            this.notifyService.showError("Intersecting Groups are not allowed!", "", 3000);
          }

          if (firstItem_lastGroup == firstItem_current && lastItem_lastGroup == lastItem_current && flag) {
            flag = false;
            this._contactSearchService.groups.pop();
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
    if (this._contactSearchService.isNewRowsAddedOnLoad) {
      this._contactSearchService.isNewRowsAddedOnLoad = false;
      this._contactSearchService.isNewRowAdded = false;
      $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
      for (var i = 0; i < this._contactSearchService.searchQueriesCtls.controls.length; i++) {
        $("#tdGroup" + this.minTwoDigits((i))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((i)) + "-NoGroup" + "" + '" colspan="' + this.calCulateMaxColSpan() + '"></td>');
      }
    }
    else if (this._contactSearchService.isNewRowAdded) {
      this._contactSearchService.isNewRowAdded = false;
      $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
      $("#tdGroup" + this.minTwoDigits((this._contactSearchService.searchQueriesCtls.controls.length - 1))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((this._contactSearchService.searchQueriesCtls.controls.length - 1)) + "-NoGroup" + "" + '" colspan="' + this.calCulateMaxColSpan() + '"></td>');
    }
    if (this.isDefaultSelection) {
      this.isDefaultSelection = false;

      var defaultItems = [];


      if (this._contactSearchService.user && this._contactSearchService.user.officeCode != 0) {
        var officeCodeObj = this._contactSearchService.searchItems.find(a => a.displayValue.includes('Office'));
        if (!isNullOrUndefined(officeCodeObj))
          defaultItems.push(officeCodeObj);
      }

      if (this._contactSearchService.user && this._contactSearchService.user.teamCode != 0) {
        var teamCodeObj = this._contactSearchService.searchItems.find(a => a.displayValue.includes('Team'));
        if (!isNullOrUndefined(teamCodeObj))
          defaultItems.push(teamCodeObj);
      }

      if (this._contactSearchService.searchItems.find(a => a.displayValue.includes('User')))
        defaultItems.push(this._contactSearchService.searchItems.find(a => a.displayValue.includes('User')));

      for (var i = 0; i < defaultItems.length; i++) {
        let idx: number = this.findIndexByKeyValue(this._contactSearchService.searchItems, 'displayValue', defaultItems[i].displayValue);
        if (idx != -1)
          this.setDefaultSearchFilters(idx, i);
      }
      this.cdRef.detectChanges();
    }
  }

  findIndexByKeyValue(_array, key, value) {
    for (var i = 0; i < _array.length; i++) {
      if (_array[i][key] == value) {
        return i;
      }
    }
    return -1;
  }

  setDefaultSearchFilters(index_searchItem: number, index_formArray) {
    let _searchItem: SearchItem = this._contactSearchService.searchItems[index_searchItem];
    this._contactSearchService.searchQueriesCtls.controls[index_formArray].get('searchItem').setValue(index_searchItem);
    this._contactSearchService.searchQueriesCtls.controls[index_formArray].get('operator').setValue("IN");
    this._contactSearchService.searchQueriesCtls.controls[index_formArray].get('mainOperator').setValue("AND");

    $("#txtControlType" + index_formArray).val(_searchItem.controlType);
    this._contactSearchService.searchQueriesCtls.controls[index_formArray].get('columnName').setValue(_searchItem.columnName);
    this._contactSearchService.searchQueriesCtls.controls[index_formArray].get('tableName').setValue(_searchItem.tableName);

    let selectedItem: number[] = [];
    if (_searchItem.displayValue == "Team") {
      var findValueInSearchItem = _searchItem.itemData.filter(i => i.value == this._contactSearchService.user.teamCode);
      if (!isNullOrUndefined(findValueInSearchItem) && findValueInSearchItem.length > 0) {
        selectedItem.push(this._contactSearchService.user.teamCode);
      }
    }
    else if (_searchItem.displayValue == "Office") {
      var findValueInSearchItem = _searchItem.itemData.filter(i => i.value == this._contactSearchService.user.officeCode);
      if (!isNullOrUndefined(findValueInSearchItem) && findValueInSearchItem.length > 0) {
        selectedItem.push(this._contactSearchService.user.officeCode);
      }
    }
    else if (_searchItem.displayValue == "User")
      var findValueInSearchItem = _searchItem.itemData.filter(i => i.value == this._contactSearchService.user.cLPUserID);
    if (!isNullOrUndefined(findValueInSearchItem) && findValueInSearchItem.length > 0) {
      selectedItem.push(this._contactSearchService.user.cLPUserID);
    }
    this._contactSearchService.searchQueriesCtls.controls[index_formArray].get('selectedValueForMultiSelect').setValue(selectedItem);
  }

  ngAfterViewInit() {
    if (!this._contactSearchService.isSearchEditClick) {
      $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
      $("#tdGroup" + this.minTwoDigits((this._contactSearchService.searchQueriesCtls.controls.length - 1))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((this._contactSearchService.searchQueriesCtls.controls.length - 1)) + "-NoGroup" + "" + '" colspan="' + this.calCulateMaxColSpan() + '"></td>');
    }
  }

  drawGroup() {
    $("td[id^=tdAddGroup]").remove();

    let colSpan: number = 1;
    this._contactSearchService.groups.sort((a, b) => a.items.length < b.items.length ? -1 : a.items.length > b.items.length ? 1 : 0);
    let sortedGroups = this._contactSearchService.groups;
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
                for (var i = 0; i < this._contactSearchService.groups.length; i++) {
                  if (i == +strGroupId) {
                    continue;
                  }
                  if (!(this._contactSearchService.groups[strGroupId].items[this._contactSearchService.groups[strGroupId].items.length - 1] < this._contactSearchService.groups[i].items[0]
                    || this._contactSearchService.groups[strGroupId].items[0] > this._contactSearchService.groups[i].items[this._contactSearchService.groups[i].items.length - 1]
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

  showSearch(isAdd: boolean = false) {
    if (isAdd) {
      this.isEditSavedSearch = false;
      this._contactSearchService.groups = [];
      $("td[id^=tdAddGroup]").remove();
      this._contactSearchService.searchQueriesCtls.controls = [];
      $('#drpSavedQueries option[value=0] ').prop("selected", true);
      this.IsSaveSearch = false;
      this.addDefaultSearchFilters();
    }
  }

  addDefaultSearchFilters() {
    var searchQueriesCtls_length = this._contactSearchService.searchQueriesCtls.controls.length;
    for (var index = 0; index < searchQueriesCtls_length; index++)
      this._contactSearchService.searchQueriesCtls.removeAt(index);
    this._contactSearchService.searchQueriesCtls.removeAt(this._contactSearchService.searchQueriesCtls.length - 1);
    var defaultItems = [];

    if (!isNullOrUndefined(this._contactSearchService.user) && this._contactSearchService.user.officeCode != 0) {
      var officeCodeObj = this._contactSearchService.searchItems.find(a => a.displayValue.includes('Office'));
      if (!isNullOrUndefined(officeCodeObj))
        defaultItems.push(officeCodeObj);
    }
    if (!isNullOrUndefined(this._contactSearchService.user) && this._contactSearchService.user.teamCode != 0) {
      var teamCodeObj = this._contactSearchService.searchItems.find(a => a.displayValue.includes('Team'));
      if (!isNullOrUndefined(teamCodeObj))
        defaultItems.push(teamCodeObj);
    }

    defaultItems.push(this._contactSearchService.searchItems.find(a => a.displayValue.includes('User')));

    for (var i = 0; i < defaultItems.length; i++) {
      this._contactSearchService.searchQueriesCtls.push(this._contactSearchService.fb.group({
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
    this._contactSearchService.isNewRowsAddedOnLoad = true;
    this.isDefaultSelection = true;
  }

  hideSearch(isHide: boolean = false) {
    if (isHide) {
      this._contactSearchService.savedQueryValue = '0';
      this._contactSearchService.isSearchEditClick = false;
      this._contactSearchService.getContacts();
    }
    if (this._contactSearchService.savedQueryValue == '0') {
      $('#drpSavedQueries option[value=0] ').prop("selected", true);
      this.deleteAllSearchQuery();
    }
    if (this._contactSearchService.savedQueryValue != '0') {
      var savedValue = this._contactSearchService.savedQueryValue;
      $("#drpSavedQueries").val(savedValue).change();
      this.setSearchQueriesCtls();
    }
    if (this.isSearchSubmit) {
      this.showSpinner = false;
      this.isSearchSubmit = false;
      this.isEditSavedSearch = false;
      this.getContactsSearchSubscription ? this.getContactsSearchSubscription.unsubscribe() : null;
    }
    this.isSearchSubmit = false;
    this.isEditSavedSearch = false;
    this.isGroup = false;
  }

  setSearchQueriesCtls() {
    if (!isNullOrUndefined(this._contactSearchService.savedsearchQueryResponse)) {
      var _searchQueryList = this._contactSearchService.savedsearchQueryResponse.searchQueryList;
      if (_searchQueryList.length > 0) {
        $("td[id^=tdAddGroup]").remove();
        this._contactSearchService.searchQueriesCtls.controls = [];
        this._contactSearchService.groups = this._contactSearchService.savedsearchQueryResponse.group;
        for (var i = 0; i < _searchQueryList.length; i++) {
          this._contactSearchService.searchQueriesCtls.push(this._contactSearchService.fb.group({
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
        this._contactSearchService.isNewRowsAddedOnLoad = true;
      }
    }
  }

  deleteSearchQuery(index, isDelete: boolean = false) {
    this._contactSearchService.searchQueriesCtls.removeAt(index);
    if (this._contactSearchService.searchQueriesCtls.controls.length === 0)
      this.addSearchQuery();
    else if (isDelete)
      this.notifyService.showSuccess("Row has been deleted!", "", 3000);
    this._contactSearchService.groups = [];
    $("#thGroup").attr('colspan', this.calCulateMaxColSpan());
    $("td[id^=tdAddGroup]").remove();
    var allRows = $("#tblSearch")[0].rows;
    if (!isNullOrUndefined(allRows) && allRows.length > 0) {
      for (var rowIndex = 1; rowIndex <= allRows.length; rowIndex++) {
        $("#tdGroup" + this.minTwoDigits((rowIndex - 1))).before('<td _ngcontent-ng-cli-universal-c1 id="tdAddGroup' + this.minTwoDigits((rowIndex - 1)) + "-NoGroup" + "" + '" colspan="' + this.calCulateMaxColSpan() + '"></td>');
      }
      setTimeout(() => {
        if (this._contactSearchService.searchQueriesCtls.controls.length > 0)
          this.selectGroupRow(this._contactSearchService.searchQueriesCtls.controls.length);
      }, 0);
    }
  }

  calCulateGroupColSPan(group: Group): any {
    let colSpan: number = 1;
    let colspan_list: number[] = [];
    for (var grpId = 0; grpId < this._contactSearchService.groups.length; grpId++) {
      if (this._contactSearchService.groups[grpId].items[0] == group.items[0] && (group.items[group.items.length - 1] == this._contactSearchService.groups[grpId].items[this._contactSearchService.groups[grpId].items.length - 1])) {
        continue;
      }
      var result = this._contactSearchService.groups[grpId].items.filter(item => group.items.includes(item));
      if (!isNullOrUndefined(result) && result.length > 0)
        colspan_list.push(this._contactSearchService.groups[grpId].colSpan)
    }
    colSpan = colspan_list.length > 0 ? Math.max.apply(Math, colspan_list.map(function (o) { return o; })) + 1 : 1;
    return colSpan;
  }

  calCulateMaxColSpan() {
    let colspan_list: number[] = [];
    for (var i = 0; i < this._contactSearchService.groups.length; i++)
      colspan_list.push(this._contactSearchService.groups[i].colSpan);

    return Math.max.apply(Math, colspan_list.map(function (o) { return o; }));
  }

  minTwoDigits(n) {
    return (n < 10 ? '0' : '') + n;
  }

  addSearchQuery() {
    this._contactSearchService.isNewRowAdded = true;
    let ctrCount: number = 0;
    let ctrColSpan: number = 0;
    this._contactSearchService.searchQueriesCtls.push(this._contactSearchService.fb.group({
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

  deleteAllSearchQuery() {
    for (var i = 0; i < this._contactSearchService.searchQueriesCtls.controls.length; i++)
      this.deleteSearchQuery(i);
  }

  selectGroupRow(k) {
    let ctr: number = 0;
    let lastRow: number = 0;
    let currenrRow: number = 0;
    let selectedRows: string = "";
    let arrSelectedRows: string[];
    this.isGroup = true;

    for (var i = 0; i < this._contactSearchService.searchQueriesCtls.controls.length; i++) {
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

  setValidation() {
    if (this._contactSearchService.searchQueriesCtls.controls.length > 0) {
      let control: AbstractControl;
      for (var i = 0; i < this._contactSearchService.searchQueriesCtls.controls.length; i++) {
        let ct: string = $("#txtControlType" + i).val();
        switch (ct) {
          case 't':
          case 'd':
          case 'dtCustom':
            control = this._contactSearchService.searchQueriesCtls.controls[i].get('searchItemValue');
            control.setValidators([Validators.required]);
            break;
          case 'r':
            var controlFrom = this._contactSearchService.searchQueriesCtls.controls[i].get('txtRangeFrom');
            controlFrom.setValidators([Validators.required]);
            var controlTo = this._contactSearchService.searchQueriesCtls.controls[i].get('txtRangeTo');
            controlTo.setValidators([Validators.required]);
            controlFrom.updateValueAndValidity();
            controlTo.updateValueAndValidity();
            break;
          case 'md':
            control = this._contactSearchService.searchQueriesCtls.controls[i].get('selectedValueForMultiSelect');
            control.setValidators([Validators.required]); break;
          case 'dt':
            var controlStart = this._contactSearchService.searchQueriesCtls.controls[i].get('dtStart');
            controlStart.setValidators([Validators.required]);
            var controlEnd = this._contactSearchService.searchQueriesCtls.controls[i].get('dtEnd');
            controlEnd.setValidators([Validators.required]);
            controlStart.updateValueAndValidity();
            controlEnd.updateValueAndValidity();
            break;
          default: break;
        }
        if (control && ct != "" && ct != 'dt')
          control.updateValueAndValidity();
      }
    }
  }

  clearValidation(i) {
    if (this._contactSearchService.searchQueriesCtls.controls.length > 0) {
      const control = this._contactSearchService.searchQueriesCtls.controls[i].get('mainOperator');
      if (control) {
        control.clearValidators();
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    }
  }
  //Search Submit Functions
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

    if ((this.saveSearchForm.valid) && (this._contactSearchService.searchQueriesCtls.status != 'INVALID')) {
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
              this._contactSearchService.savedQuery_Filter = this.savedQuery_response.list;
              this._contactSearchService.isSearchEditClick = false;
              if (this._contactSearchService.savedQueryValue == '-2')
                this._contactSearchService.savedQueryValue = this._contactSearchService.savedQuery_Filter.length > 0 ? this._contactSearchService.savedQuery_Filter[this._contactSearchService.savedQuery_Filter.length - 1].key.toString() : '0';
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
              if (this._contactSearchService.savedQueryValue != '0') {
                var savedValue = this._contactSearchService.savedQueryValue;
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
      var savedValue = this._contactSearchService.savedQueryValue;
      $("#drpSavedQueries").val(savedValue);
      $("#drpSavedQueries option[value=" + savedValue + "]");
      this._contactSearchService.drpSavedQueries_onChange('e');
    }, 100);
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

  createSearchQueryList() {

    this.searchQueryList = [];
    for (var i = 0; i < this._contactSearchService.searchQueriesCtls.controls.length; i++) {

      this.searchQuery = <SearchQuery>{};
      this.searchQuery.cLPUserID = this.user.cLPUserID;
      this.searchQuery.searchItem = $('#txtColumnName' + i).val();
      this.searchQuery.operator = this._contactSearchService.searchQueriesCtls.controls[i].get('operator').value;
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
          this.searchQuery.searchItemValue = this._contactSearchService.searchQueriesCtls.controls[i].get('selectedValueForMultiSelect').value.join(); break;
        case 'r':
          this.searchQuery.searchItemValue = this._contactSearchService.searchQueriesCtls.controls[i].get('txtRangeFrom').value + ',' + this._contactSearchService.searchQueriesCtls.controls[i].get('txtRangeTo').value;
          break;
        case 'dt':
          this.searchQuery.strDtStart = this.datePipe.transform(this._contactSearchService.searchQueriesCtls.controls[i].get('dtStart').value, 'MM-dd-yyyy');
          this.searchQuery.strDtEnd = this.datePipe.transform(this._contactSearchService.searchQueriesCtls.controls[i].get('dtEnd').value, 'MM-dd-yyyy');
          this.searchQuery.dtStart = this._contactSearchService.searchQueriesCtls.controls[i].get('dtStart').value;
          this.searchQuery.dtEnd = this._contactSearchService.searchQueriesCtls.controls[i].get('dtEnd').value;
        case 'dtCustom':
          this.searchQuery.searchItemValue = this.datePipe.transform(this._contactSearchService.searchQueriesCtls.controls[i].get('searchItemValue').value, "MM-dd-yyyy");
          break;
        default:
      }
      this.searchQuery.groupBy = '';
      if (i.toString() == "0")
        this.searchQuery.mainOperator = '';
      else
        this.searchQuery.mainOperator = this._contactSearchService.searchQueriesCtls.controls[i].get('mainOperator').value;
      this.searchQuery.tableName = $('#txtTableName' + i).val();
      this.searchQueryList.push(this.searchQuery);
    }
    this.searchQueryResponse = <SearchQueryResponse>{ group: [], searchQueryList: [] };
    this.searchQueryResponse.searchQueryList = this.searchQueryList;
    this.searchQueryResponse.group = this._contactSearchService.groups;
  }

  runSearch() {
    this.clearValidation(0);
    this.isSearchSubmit = true;
    if ((this._contactSearchService.searchQueriesCtls.status != 'INVALID')) {
      this.showSpinner = true;
      this.createSearchQueryList();
      this.getContactsSearchSubscription = this._searchContactService.getContactSearchAsync(this.encryptedUser, this.searchQueryResponse)
        .subscribe(res => {
          if (res) {
            this._contactSearchService.contactListResponse = UtilityService.clone(res);
            if (this._contactSearchService.savedQueryValue == '-2')
              this._contactSearchService.savedQueryValue = '0';
            this._contactSearchService.isSearchEditClick = false;
            this.hideSearch();
            this._contactSearchService.contactsData = this._contactSearchService.contactListResponse.contactList;
            this._contactSearchService.contactListChanged.emit(this._contactSearchService.contactListResponse.contactList);
            this._contactSearchService.initContactsData = this._contactSearchService.contactListResponse.contactList;
            this.showSpinner = false;
            this.isSearchSubmit = false;
            this.isEditSavedSearch = false;
            if (this._contactSearchService.savedQueryValue == '-2')
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
  //SearchSubmit Functions

  //Delete Search Functionality
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
            this._contactSearchService.savedQuery_Filter = response.list;
            this._contactSearchService.getContacts();
            //Extra Code for hide the contact search component
            this._contactSearchService.savedQueryValue = '0';
            this._contactSearchService.isSearchEditClick = false;
            //Extra Code for hide the contact search component
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
  //Delete Search Functionality

  //change events
  validation() {
    this.clearAllValidation().subscribe((value) => this.setValidation());
  }

  clearAllValidation() {
    return new Observable(observer => {
      this.searchItemValue.clearValidators();
      this.searchItemValue.markAsTouched();
      this.searchItemValue.updateValueAndValidity();
      for (var k = 0; k < this._contactSearchService.searchQueriesCtls.controls.length; k++) {
        var searchItemCtrl = this._contactSearchService.searchQueriesCtls.controls[k].get('searchItemValue');
        if (!isNullOrUndefined(searchItemCtrl)) {
          searchItemCtrl.clearValidators();
          searchItemCtrl.markAsTouched();
          searchItemCtrl.updateValueAndValidity();
        }
        var dtStartCtrl = this._contactSearchService.searchQueriesCtls.controls[k].get('dtStart');
        if (!isNullOrUndefined(dtStartCtrl)) {
          dtStartCtrl.clearValidators();
          dtStartCtrl.markAsTouched();
          dtStartCtrl.updateValueAndValidity();
        }
        var dtEndCtrl = this._contactSearchService.searchQueriesCtls.controls[k].get('dtEnd');
        if (!isNullOrUndefined(dtEndCtrl)) {
          dtEndCtrl.clearValidators();
          dtEndCtrl.markAsTouched();
          dtEndCtrl.updateValueAndValidity();
        }
        var txtRangeFrom = this._contactSearchService.searchQueriesCtls.controls[k].get('txtRangeFrom');
        if (!isNullOrUndefined(txtRangeFrom)) {
          txtRangeFrom.clearValidators();
          txtRangeFrom.markAsTouched();
          txtRangeFrom.updateValueAndValidity();
        }
        var txtRangeTo = this._contactSearchService.searchQueriesCtls.controls[k].get('txtRangeTo');
        if (!isNullOrUndefined(txtRangeTo)) {
          txtRangeTo.clearValidators();
          txtRangeTo.markAsTouched();
          txtRangeTo.updateValueAndValidity();
        }
        var selectedValueForMultiSelect = this._contactSearchService.searchQueriesCtls.controls[k].get('selectedValueForMultiSelect');
        if (!isNullOrUndefined(selectedValueForMultiSelect)) {
          selectedValueForMultiSelect.clearValidators();
          selectedValueForMultiSelect.markAsTouched();
          selectedValueForMultiSelect.updateValueAndValidity();
        }
      }
      observer.next("success");
    });
  }

  drpFields_onChange(id: any) {
    var dd = this._contactSearchService.searchQueriesCtls;
    this.items = [];
    this.searchFilterItem = this._contactSearchService.searchItems.filter(x => x.displayValue === $('#drpFields' + id + ' :selected').text().trim());
    $("#txtControlType" + id).val(this.searchFilterItem[0].controlType);
    $('#txtTableName' + id).val(this.searchFilterItem[0].itemData[0].tableName);
    $('#txtColumnName' + id).val(this.searchFilterItem[0].itemData[0].columnName);

    switch (this.searchFilterItem[0].controlType) {
      case 't': case 'd': this._contactSearchService.searchQueriesCtls.controls[id].get('searchItemValue').setValue(''); break;
      case 'md': this._contactSearchService.searchQueriesCtls.controls[id].get('selectedValueForMultiSelect').setValue([]); break;
      case 'r': this._contactSearchService.searchQueriesCtls.controls[id].get('txtRangeFrom').setValue(''); this._contactSearchService.searchQueriesCtls.controls[id].get('txtRangeTo').setValue(''); break;
      case 'dt': this._contactSearchService.searchQueriesCtls.controls[id].get('dtStart').setValue(new Date()); this._contactSearchService.searchQueriesCtls.controls[id].get('dtEnd').setValue((new Date())); break;
      default: break;
    }
    var searchItemIdx = this._contactSearchService.searchQueriesCtls.controls[id].get('searchItem').value;
    this._contactSearchService.searchQueriesCtls.controls[id].get('operator').setValue(this._contactSearchService.searchItems[searchItemIdx].searchOperators[0].value);
    this.validation();
  }

  drpOperator_onChange(id: any) {
    var searchItem = this._contactSearchService.searchItems[this._contactSearchService.searchQueriesCtls.controls[id].get('searchItem').value];
    var selectedItem: any[] = [];

    if (this._contactSearchService.searchQueriesCtls.controls[id].get('operator').value == "CA") {
      for (var i = 0; i < searchItem.itemData.length; i++)
        selectedItem.push(searchItem.itemData[i].value);
      this._contactSearchService.searchQueriesCtls.controls[id].get('selectedValueForMultiSelect').setValue(selectedItem);
    }
    else {
      selectedItem = [];
      this._contactSearchService.searchQueriesCtls.controls[id].get('selectedValueForMultiSelect').setValue(selectedItem);
    }
  }

  drpMultiFieldData_onChange(event: any, id: any) {
    if (!event) {
    }
    this.validation();
  }
  //change events

  //Edit functionality here
  editSavedQuery() {
    var selectValue = $('#drpSavedQueries').val();
    if (selectValue != "0" && !isNullOrUndefined(this._contactSearchService.savedsearchQueryResponse)) {
      this.savedQuery_response = {} as SimpleResponse;
      this.isEditSavedSearch = true;
      this.IsSaveSearch = true;
      var _searchQueryList = this._contactSearchService.savedsearchQueryResponse.searchQueryList;

      for (var i = 0; i < _searchQueryList.length; i++) {

        var idx = this.findIndexByKeyValue(this._contactSearchService.searchItems, 'columnName', _searchQueryList[i].searchItem);
        this._contactSearchService.searchQueriesCtls.controls[i].get('searchItem').setValue(idx);

        this._contactSearchService.searchQueriesCtls.controls[i].get('operator').setValue(_searchQueryList[i].operator);
        this._contactSearchService.searchQueriesCtls.controls[i].get('mainOperator').setValue(_searchQueryList[i].mainOperator);

        $("#txtControlType" + i).val(_searchQueryList[i].controlType);
        this._contactSearchService.searchQueriesCtls.controls[i].get('columnName').setValue(_searchQueryList[i].searchItem);
        this._contactSearchService.searchQueriesCtls.controls[i].get('tableName').setValue(_searchQueryList[i].tableName);

        switch (_searchQueryList[i].controlType) {
          case 't':
          case 'd':
            this._contactSearchService.searchQueriesCtls.controls[i].get('searchItemValue').setValue(_searchQueryList[i].searchItemValue);
            break;
          case 'md':
            var selectedValues = _searchQueryList[i].searchItemValue.split(",").map(Number);
            this._contactSearchService.searchQueriesCtls.controls[i].get('selectedValueForMultiSelect').setValue(selectedValues);
            break;
          case 'r':
            var rangeValues = _searchQueryList[i].searchItemValue.split(",");
            if (!isNullOrUndefined(rangeValues)) {
              this._contactSearchService.searchQueriesCtls.controls[i].get('txtRangeFrom').setValue(rangeValues[0]);
              this._contactSearchService.searchQueriesCtls.controls[i].get('txtRangeTo').setValue(rangeValues[1]);
            }
            break;
          case 'dt':
            this._contactSearchService.searchQueriesCtls.controls[i].get('dtStart').setValue(_searchQueryList[i].dtStart);
            this._contactSearchService.searchQueriesCtls.controls[i].get('dtEnd').setValue(_searchQueryList[i].dtEnd);
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

      if (this._contactSearchService.groups.length > 0) {
        this.resetColspanForAllItems();
        this.drawGroup();
      }
    }
  }
  //Edit functionality here


}
