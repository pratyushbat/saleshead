import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { ExportRequest, ExportRequestResponse } from '../../../../models/exportRequest.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { LinkContactExtended, LinkContactExtendedListResponse } from '../../../../models/link-contact.model';
import { ModelLink } from '../../../../models/link-group.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { Search, SearchListResponse } from '../../../../models/search.model';
import { LinkGroupService } from '../../../../services/link-group.service';
import { NotificationService } from '../../../../services/notification.service';
import { SearchContactService } from '../../../../services/Searchcontact.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'link-group',
    templateUrl: './link-group.component.html',
    styleUrls: ['./link-group.component.css']
})
/** link-group component*/
export class LinkGroupComponent {
  user: CLPUser;
  roleFeaturePermissions: RoleFeaturePermissions;
  private editedRowIndex: number;
  showExports: boolean = false;
  contactId: number;
  contactSearchList: Search[] = [];
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  linkGroupForm: FormGroup;
  dtCreated = new Date();
  isLinkGroupSubmit: boolean = false;
  linkId: number = 0;
  showViewMode: boolean = false;
  linkData: ModelLink = <ModelLink>{};
  linkContactList: LinkContactExtended[];
  exportRequestList: ExportRequest[];
  public formGroup: FormGroup;
  columns = [{ field: '$', title: '', width: '40' }
    , { field: 'lastFirst', title: 'Name', width: '60' }
    , { field: 'relationship', title: 'Relationship', width: '40' }
    , { field: 'email', title: 'Email', width: '60' }
    , { field: 'title', title: 'Title', width: '60' }
    , { field: 'companyName', title: 'Company', width: '60' }
    , { field: 'phone', title: 'Phone', width: '60' }
    , { field: 'ufirstName', title: 'User', width: '60' }
    , { field: 'dtModified', title: 'Modified', width: '60' }
    , { field: 'dtCreated', title: 'Created', width: '60' }];
  reorderColumnName: string = 'lastFirst,relationship,email,title,companyName,phone,ufirstName,dtModified,dtCreated';
  public mySelection: number[] = [];
    /** link-group ctor */
  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    public _linkGroupSrvc: LinkGroupService,
    public notifyService: NotificationService,
    private srchContactSrvc: SearchContactService
  ) {
    this._localService.isMenu = true;
    this._route.paramMap.subscribe(async params => {
      if (params.has('linkId')) {
        this.linkId = +params.get('linkId');
      }
    });
  }

  ngOnInit() {
    this.linkGroupForm = this.preparelinkGroupFormForm();
    this.linkGroupForm.reset();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          if (this.linkId > 0) {
            this.showViewMode = true;
            this.loadLinkData(this.linkId);
            this.getLinkContactList(this.linkId);
            this.exportRequestGetList();
          } else {
          }
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.MyLead)
      .then(async (result: UserResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (!isNullOrUndefined(response)) {
            if (!isNullOrUndefined(response?.user)) {
              this.user = response.user;
                this.roleFeaturePermissions = response.roleFeaturePermissions;
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
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

 async loadLinkData(linkId) {
   await this._linkGroupSrvc.linkLoad(this.encryptedUser, linkId)
      .then(async (result: ModelLink) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.linkData = response;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  private preparelinkGroupFormForm(): FormGroup {
    return this.fb.group({
      linkName: [{ value: '' }, [Validators.required]],
      isShareable: [false]
    });
  }

  get linkGroupFrm() {
    return this.linkGroupForm.controls;
  }

  linkGroupFormSubmit() {
    this._localService.validateAllFormFields(this.linkGroupForm);
    if (this.linkGroupForm.valid) {
      this.linkGroupForm.markAsPristine();
      this.createLink();
    }
  }

  createLink() {
    this.copyDataObjectToLinkObject();
    this.isLinkGroupSubmit = true;
    this._linkGroupSrvc.linkUpdate(this.encryptedUser, this.linkData)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.linkId = response.messageInt;
          this.loadLinkData(response.messageInt);
          this.showViewMode = true;
          this.notifyService.showSuccess(this.linkId > 0 ? "Link updated successfully" : "Link created successfully", "", 5000);
          this.linkGroupForm.reset();
          this.preparelinkGroupFormForm();
          this.showExports = true;
          this.exportRequestGetList();
        }
        this.isLinkGroupSubmit = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.isLinkGroupSubmit = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  copyDataObjectToLinkObject() {
    if (this.linkId > 0) {
      this.linkData.linkID = this.linkId;
      this.linkData.linkName = this.linkGroupForm.controls.linkName.value;
      this.linkData.isShareable = this.linkGroupForm.controls.isShareable.value ? this.linkGroupForm.controls.isShareable.value : false;
    } else {
      this.linkData.linkID = 0;
      this.linkData.cLPUserID = this.user?.cLPUserID;
      this.linkData.cLPCompanyID = this.user?.cLPCompanyID;
      this.linkData.linkName = this.linkGroupForm.controls.linkName.value;
      this.linkData.isShareable = this.linkGroupForm.controls.isShareable.value ? this.linkGroupForm.controls.isShareable.value : false;
    }
  }

  editLink() {
    this.linkGroupForm.get('linkName').setValue(this.linkData.linkName);
    this.linkGroupForm.get('isShareable').setValue(this.linkData.isShareable);
    this.showViewMode = false;
  }

  onCancel() {
    if (this.linkId > 0)
      this.showViewMode = true;
  }

  getContactId(value) {
    this.contactId = parseInt(this.contactSearchList.find(item => item.searchText === value)?.searchValue);
    this._linkGroupSrvc.linkContactUpdate(this.encryptedUser, this.linkId, this.contactId ? this.contactId : 0)
      .then(async (result: LinkContactExtendedListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getLinkContactList(this.linkId);
          this.notifyService.showSuccess("Link contact updated successfully", "", 5000);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });

  }

  getContactSearch(searchData: Search) {
    this.srchContactSrvc.getContactSearchData(this.encryptedUser, this.user?.cLPUserID, searchData)
      .then(async (result: SearchListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.contactSearchList = response.searchList.filter(i => i.searchValue.includes("ct"));
          for (var i = 0; i < this.contactSearchList.length; i++) {
            this.contactSearchList[i].searchValue = this.contactSearchList[i].searchValue.split("ct")[1]
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  getSearchData(txt) {
    let Search: Search = <Search>{};
    Search.searchText = txt;
    Search.searchValue = "";
    this.getContactSearch(Search);
  }

  async getLinkContactList(linkId) {
   await this._linkGroupSrvc.linkContactGetList(this.encryptedUser, linkId)
      .then(async (result: LinkContactExtendedListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.linkContactList = response.linkContactList;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

 async exportRequestGetList() {
   await this._linkGroupSrvc.exportRequestsGetList(this.encryptedUser, this.user?.cLPCompanyID, this.user?.cLPUserID, 1, 2)
      .then(async (result: ExportRequestResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.exportRequestList = response.exportRequests;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.formGroup = null;
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, dataItem }): void {
  }
}
