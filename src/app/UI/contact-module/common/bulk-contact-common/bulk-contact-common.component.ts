import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, NgZone, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { isNullOrUndefined } from 'util';
import { process } from '@progress/kendo-data-query';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CLPUser, SFAResponse, UserResponse } from '../../../../models/clpuser.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ContactList } from '../../../../models/contact.model';
import { BulckAction, BulkActionResponse } from '../../../../models/bulkActionContact';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { ContactCommonSearchService } from '../../../../services/shared/contact-common-search.service';
import { keyValue, SearchQueryResponse } from '../../../../models/search.model';
import { BulkActionContactService } from '../../../../services/bulk-action-contact.service';
import { ContactService } from '../../../../services/contact.service';
import { CustomActionService } from '../../../../services/custom-action.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { LocalService } from '../../../../services/shared/local.service';
import { NotificationService } from '../../../../services/notification.service';
import { ContactSearchService } from '../../../../services/shared/contact-search.service';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
declare var $: any;

@Component({
    selector: 'bulk-contact-common',
    templateUrl: './bulk-contact-common.component.html',
  styleUrls: ['./bulk-contact-common.component.css'],
  providers: [GridConfigurationService, ContactCommonSearchService]
})
export class BulkContactCommonComponent {   
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  @Input() contactsArchiveData: ContactList[] = [];
  @Input() queryDataLoaded: SearchQueryResponse;
  bulkActionResponse: BulkActionResponse;
  public clickUser: keyValue[];
  public fieldDropdown: [];
  public editTypeDropdown: [];
  userResponse: UserResponse;
  @Input() initContactsArchiveData: ContactList[];
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
  gridHeight;
  soUrl: any;
  @Output() sendMailInfo: EventEmitter<{ isShow: boolean, contactId: 0 }> = new EventEmitter<any>();
  selectAllContacts: boolean = false;
  isSelectAction: boolean = false;
  isDeleteContact: boolean = false;
  isSelectActionButton: boolean = false;
  transferOwner: boolean = false;
  isEditField: boolean = false;
  isTagSelected: boolean = false;
  isMoreFieldSelected: boolean = false;
  bulkEditFieldForm: FormGroup;
  bulkTransferFieldForm: FormGroup;
    mobileColumnNames: string[];
  constructor(
    public _bulkActionContactService: BulkActionContactService,
    public _contactService: ContactService,
    private _customActionService: CustomActionService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    private fb: FormBuilder,
    private _contactCommonSearchService: ContactCommonSearchService,
    public _gridCnfgService: GridConfigurationService,
    private _notifyService: NotificationService,
    public _contactSearchService: ContactSearchService,
    public _accountSetupService: AccountSetupService,
    private _ngZone: NgZone) {
    this.gridHeight = this._localService.getGridHeight('499px');
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token")) && !isNullOrUndefined(this.user)) {
      this.encryptedUser = localStorage.getItem("token");
          this.getGridConfiguration();
    }
    else {
      this.showSpinner = false;
      this._router.navigate(['/unauthorized']);
    }
  }
  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'contact_bulk_action_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('contact_bulk_action_grid').subscribe((value) => this.getArchiveContacts()));

  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'contact_bulk_action_grid').subscribe((value) => this.getGridConfiguration());
  }

  getArchiveContacts() {
    if (!isNullOrUndefined(this._gridCnfgService)) {
    this._gridCnfgService.iterateConfigGrid(true, "contact_bulk_action_grid");
      this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('contact_bulk_action_grid');
    }
  }

  prepareBulkEditFieldForm() {
    return this.fb.group({
      ddField: new FormControl(''),
      editType: new FormControl(-1),
      textValue: new FormControl(''),
    });
  }
  prepareBulkTransferFieldForm() {
    return this.fb.group({
      ddValue: new FormControl('1'),
      trTransferSFA: new FormControl(false),
      cbTransferSFA: new FormControl(false),
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
          this.sendMailInfo.emit({ isShow: true, contactId: dataItem?.contactID });
         
          break;
        } 
        default: {
          break;
        }
      }
    }
  }

  async getBulkActionDropdown() {
    this.showSpinner = true;
    await this._bulkActionContactService.getBulkActionDropdown(this.encryptedUser)
      .then(async (result: BulkActionResponse) => {
        if (result) {
          this.bulkActionResponse = UtilityService.clone(result);
          this.fieldDropdown = this.bulkActionResponse.field;
          this.editTypeDropdown = this.bulkActionResponse.eEditTypeName;
          this.showSpinner = false;
        } else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async updateContactApi(updateContact: BulckAction) {
    this.showSpinner = true;
    await this._bulkActionContactService.updateBulkContacts(this.encryptedUser, this.user.cLPUserID, 0, updateContact.editType, this.user.cLPCompanyID, updateContact)
      .then(async (result: BulkActionResponse) => {
          this._notifyService.showSuccess('', 'Contact Update Successful', 3000);
          this.showSpinner = false;
          this.contactsArchiveData = [];
          this.mySelection = [];
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
        this.contactsArchiveData = [];
        this.mySelection = [];
      });
  }
  async deleteContactApi(updateContact: BulckAction, supportLogin) {
    this.showSpinner = true;
     this._bulkActionContactService.getBulkContactsDelete(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID, supportLogin, this.user.cLPSSID, updateContact)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this._notifyService.showSuccess('', 'Contact Deleted Successful', 3000);
          this.showSpinner = false;
          this.contactsArchiveData = [];
          this.mySelection = [];
        }
        else {
          this.showSpinner = false;
          this.contactsArchiveData = [];
          this.mySelection = [];
        }
        this.cancelBulkAction();
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
        this.contactsArchiveData = [];
        this.mySelection = [];
      });
  }
  async transferContactApi(updateContact: BulckAction) {
    this.showSpinner = true;
    await this._bulkActionContactService.transferBulkContacts(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID, updateContact)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this._notifyService.showSuccess(result.messageString, 'Contact Transfered Successful', 3000);
          this.showSpinner = false;
          this.contactsArchiveData = [];
          this.mySelection = [];
        }
        else {
          this.showSpinner = false;
          this.contactsArchiveData = [];
          this.mySelection = [];
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
        this.contactsArchiveData = [];
        this.mySelection = [];
      });
  }
  async getDropdownFields() {
    this.showSpinner = true;
    await this._accountSetupService.loadUsers(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: SFAResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.clickUser = response.filterUser;
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
  updateContacts() {
    let contactUpdateSelected: BulckAction = <BulckAction>{};
    contactUpdateSelected.syncCode = null;
    contactUpdateSelected.cbAction = true;
    contactUpdateSelected.textValue = this.bulkEditFieldForm.controls.textValue.value;
    contactUpdateSelected.ddField = this.bulkEditFieldForm.controls.ddField.value;
    contactUpdateSelected.editType = this.bulkEditFieldForm.controls.editType.value;
    contactUpdateSelected.searchQuery = this.queryDataLoaded;
    if (this.selectAllContacts)
      contactUpdateSelected.processAll = true;
    else {
      contactUpdateSelected.processAll = false;
      contactUpdateSelected.bulkRequestID = this.mySelection;
    }
    this.updateContactApi(contactUpdateSelected);
    this.cancelBulkAction();
  }

  deleteContacts() {
    let contactUpdateSelected: BulckAction = <BulckAction>{};
    contactUpdateSelected.searchQuery = this.queryDataLoaded;
    let supportLogin = null;
    contactUpdateSelected.syncCode = null;
    if (this.selectAllContacts)
      contactUpdateSelected.processAll = true;
    else {
      contactUpdateSelected.processAll = false;
      contactUpdateSelected.bulkRequestID = this.mySelection;
    }
    this.deleteContactApi(contactUpdateSelected, supportLogin);
  }
  transferContacts() {
    let contactUpdateSelected: BulckAction = <BulckAction>{};
    contactUpdateSelected.syncCode = null;
    contactUpdateSelected.cbAction = true;
    contactUpdateSelected.ddValue = this.bulkTransferFieldForm.controls.ddValue.value;
    contactUpdateSelected.trTransferSFA = this.bulkTransferFieldForm.controls.trTransferSFA.value;
    contactUpdateSelected.cbTransferSFA = this.bulkTransferFieldForm.controls.cbTransferSFA.value;
    contactUpdateSelected.searchQuery = this.queryDataLoaded;
    if (this.selectAllContacts)
      contactUpdateSelected.processAll = true;
    else {
      contactUpdateSelected.processAll = false;
      contactUpdateSelected.bulkRequestID = this.mySelection;
    }
    this.transferContactApi(contactUpdateSelected);
    this.cancelBulkAction();
  }
  cancelBulkAction() {
    this.isSelectAction = false;
    this.isSelectActionButton = false;
    this.isEditField = false;
    this.contactsArchiveData = [];
    this.mySelection = [];
    this.transferOwner = false;
  }
  selectAction() {
    this.getBulkActionDropdown();
    this.isSelectAction = true;
    this.isSelectActionButton = true;
  }
  editField() {
    this.bulkEditFieldForm = this.prepareBulkEditFieldForm();
    this.isEditField = true;
    this.isSelectActionButton = false;
    this.transferOwner = false;
  }
  transferOwnerField() {
    this.bulkTransferFieldForm = this.prepareBulkTransferFieldForm();
    this.getDropdownFields();
    this.transferOwner = true;
    this.isEditField = false;
    this.isSelectActionButton = false;
  }
  onChangeField(e) {
    switch (e) {
      case "Shareable": case "Class1Code": case "Class2Code": case "Class3Code": case "Class4Code": case "Class5Code": case "Class6Code": case "Class7Code": case "Class8Code": case "OutlookSync": case "CMCustomDate1": case "CMCustomDate2": case "CMCustomDate1":
        this.isMoreFieldSelected = true;
        break;
      case "Tag":
        this.isTagSelected = true;
        this.isMoreFieldSelected = false;
        break;
      default:
        this.isTagSelected = false;
        this.isMoreFieldSelected = false;
    }
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
