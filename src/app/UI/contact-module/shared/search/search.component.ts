import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { isNullOrUndefined, isNull, isNumber } from 'util';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { SearchContactService } from '../../../../services/Searchcontact.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { LocalService } from '../../../../services/shared/local.service';

import { Item, Search, SearchItem, SearchItemListResponse, SearchListResponse, SearchQuery } from '../../../../models/search.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';

//For jquery
declare var $: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
/** search component*/
export class SearchComponent implements OnInit {

  private encryptedUser: string = '';
  item: Item;
  items: Item[] = [];
  search: Search;
  searchItemListResponse: SearchItemListResponse;
  searchListResponse: SearchListResponse;
  user: CLPUser;
  searchQueries: SearchQuery[];

  searchQueriesForm: FormGroup;
  searchItems: SearchItem[];
  searchFilterItem: SearchItem[];
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  constructor(
    private fb: FormBuilder,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _searchContactService: SearchContactService
  ) {

  }

  ngOnInit() {
    this.searchQueriesForm = this.prepareSearchQueriesForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
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
            }
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
        searchItem: '',
        operator: '',
        searchItemValue: '',
        groupBy: '',
        mainOperator: '',
        action: '',
        isSelected: false
      })]),
    });
  }

  addSearchQuery() {
    this.searchQueriesCtls.push(this.fb.group({
      cLPUserID: '-1', searchItem: '',
      operator: '',
      searchItemValue: '',
      groupBy: '',
      mainOperator: '',
      action: '',
      isSelected: false
    }))
  }

  deleteSearchQuery(index) {
    this.searchQueriesCtls.removeAt(index);
    if (this.searchQueriesCtls.controls.length === 0) {
      this.addSearchQuery();
    }
  }

  get searchQueriesCtls() {
    return this.searchQueriesForm.get('searchQueries') as FormArray;
  }

  drpFields_onChange(id: any) {
    var dd = this.searchQueriesCtls;
    this.items = [];
    this.searchFilterItem = this.searchItems.filter(x => x.displayValue === $('#drpFields' + id).val());
    $("#drpFieldData" + id).empty();

    if (this.searchFilterItem[0].controlType == 'd') {
      $("#drpFieldData" + id).show();
      $("#txtFieldData" + id).hide();
      for (var i = 0; i < this.searchFilterItem[0].itemData.length; i++) {
        $("#drpFieldData" + id).append($("<option></option>").val(this.searchFilterItem[0].itemData[i].value).html(this.searchFilterItem[0].itemData[i].display));
      }
      $("#txtFieldData" + id).val("");
    } else {
      $("#drpFieldData" + id).hide();
      $("#txtFieldData" + id).show();
      $("#txtFieldData" + id).val("");
    }
  }

}
