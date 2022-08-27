import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataBindingDirective, SelectAllCheckboxState } from '@progress/kendo-angular-grid';
import { parseDate } from '@progress/kendo-angular-intl';
import { isNullOrUndefined } from 'util';
import { ClassCodes } from '../../../models/classCodes.model';
import { CLPUser } from '../../../models/clpuser.model';
import { Company, CompanyListResponse, ContactFilters, ddField, ddFieldRespone, UploadCompanyBulkAction, UserCompanyBulkAction } from '../../../models/company.model';
import { ContactUploadFieldMappingResponse, LookUpItem } from '../../../models/contactExcelUpload';
import { eEditType } from '../../../models/enum.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SearchQuery, SearchQueryResponse } from '../../../models/search.model';
import { AccountSetupService } from '../../../services/accountSetup.service';
import { ContactService } from '../../../services/contact.service';
import { NotificationService } from '../../../services/notification.service';
import { SearchContactService } from '../../../services/Searchcontact.service';
import { ContactCommonSearchService } from '../../../services/shared/contact-common-search.service';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { CompanyCreateComponent } from '../company-create/company-create.component';

declare var $: any;

@Component({
  selector: 'company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css'],
  providers: [GridConfigurationService]
})
/** company component*/
export class CompanyComponent implements OnInit, OnDestroy, AfterViewInit {
  recentDocConfig;
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  @Input() user: CLPUser;
  @Input() isBulkCompany?: boolean = false;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;

  queryDataLoaded: SearchQueryResponse = <SearchQueryResponse>{};
  step: number = 1;
  subscriptionQueryList: any;
  stepper: string = 'view';

  columns = [
    { field: 'companyName', title: 'Company', width: '250' },
    { field: 'webSite', title: 'webSite', width: '250' },
    { field: 'phone', title: 'phone', width: '50' },
    { field: 'numContacts', title: '# of Contacts', width: '50' },
    { field: 'city', title: 'city', width: '50' },
    { field: 'state', title: 'state', width: '50' },
    { field: 'cLPUserID', title: 'User', width: '50' },
    { field: 'dtModified', title: 'Modified', width: '50' },
    { field: 'dtCreated', title: 'Created', width: '50' }
  ];
  reorderColumnName: string = 'companyName,webSite,phone,numContacts,city,state,cLPUserID,dtModified,dtCreated';
  columnWidth: string = 'companyName:150,webSite:150,phone:90,numContacts:90,city:90,state:90,cLPUserID:90,dtModified:90,dtCreated:90';
  arrColumnWidth: any[] = ['companyName:150,webSite:150,phone:90,numContacts:90,city:90,state:90,cLPUserID:90,dtModified:90,dtCreated:90']
  gridHeight;
  pageSize: number = 10;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  companyList: Company[];
  companyId: number = 0;
  baseUrl: string;
  @ViewChild(CompanyCreateComponent) companyCreateRef;
  companyUserList: ContactFilters[];
  mobileColumnNames: string[];

  /*bulk company*/
  formeFilledLevel: number;
  userFilterAssign: CLPUser[];
  isEditField: boolean = false;
  editMode: boolean = false;
  uploadEditFieldForm: FormGroup;
  messageStep3: string = "";
  enumForEditType; s
  editTypeKeys: unknown[];
  initEditTypeKeys: unknown[];
  lookUpFields: ddField[] = [];
  saveConfirmation: boolean = false;
  classCode: ClassCodes[];
  tagList: LookUpItem[];
  tagData: LookUpItem[];
  contactUploadFieldMapResponse: ContactUploadFieldMappingResponse;
  actionPerformdType: number = -1;
  assignedUserTransfer = -1;
  public selectAllState: SelectAllCheckboxState = "unchecked";
  public mySelection: number[] = [];

  ngAfterViewInit() {
    this.companyUserList = this.companyCreateRef?.companyUserList;
  }
  constructor(private cd: ChangeDetectorRef, @Inject('BASE_URL') _baseUrl: string, private _localService: LocalService, private _notifyService: NotificationService, private _searchContactService: SearchContactService, private fb: FormBuilder, private _utilityService: UtilityService, public notifyService: NotificationService, public _contactCommonSearchService: ContactCommonSearchService, private _ngZone: NgZone, public _gridCnfgService: GridConfigurationService, private _accountSetupService: AccountSetupService) {

    this.gridHeight = this._localService.getGridHeight('464px');
    this._localService.isMenu = true;
    this.baseUrl = _baseUrl;
  }

  defaultCompanySearch() {
    var searchQuery: SearchQuery = <SearchQuery>{};
    searchQuery.cLPUserID = this.user.cLPUserID;
    searchQuery.controlType = "md";
    searchQuery.operator = "IN";
    searchQuery.searchItem = "CLPUserID";
    searchQuery.searchItemValue = this.user.cLPUserID.toString();
    searchQuery.tableName = "clpuser";
    this.queryDataLoaded.searchQueryList = [];
    this.queryDataLoaded.searchQueryList.push(searchQuery);
    this.getQueryData();
  }

  ngOnInit() {
    this.editField();
    this.defaultCompanySearch();
    this.getCompanyGridConfiguration();
    this.getRecentDocumentsConfig();
    if ($(window).width() < 768)
      this.recentDocConfig.theme = '';
    this.getCompanyDropDownData();
    this.commonEditTypeForm();
  }


  editField() {
    this.messageStep3 = "Please select the value you would like to add.";
    this.editMode = false;
    setTimeout(() => {
      if (!isNullOrUndefined(this.uploadEditFieldForm)) {
        this.uploadEditFieldForm.reset();
        this.uploadEditFieldForm.markAsUntouched();
      }
      this.uploadEditFieldForm = this.prepareUploadEditFieldForm();
    }, 1);
  }

  prepareUploadEditFieldForm() {
    return this.fb.group({
      ddField: new FormControl(""),
      editType: new FormControl(-1),
      textValue: new FormControl("", [Validators.required]),
    });
  }

  changeDDFields() {
    this.editMode = true;
    switch (this.uploadEditFieldForm.controls.ddField.value) {
      case "Shareable": case "Class1Code": case "Class2Code": case "Class3Code": case "Class4Code": case "Class5Code": case "Class6Code": case "Class1Code : Status": case "Class2Code : Marketing Channel": case "Class3Code : Best time to call": case "Class4Code : DQ/Dead Factors": case "Class5Code : BEM ONLY (do not use)": case "Class6Code: Channel": case "Class7Code : Source": case "Class8Code : Campaign":
        this.editTypeKeys = this.initEditTypeKeys.filter(value => value != 1);
        break;
      case 'Tag':
        this.editTypeKeys = this.initEditTypeKeys.filter(value => value == 1);
        break;
      default:
        this.editTypeKeys = this.initEditTypeKeys.filter(value => value <= 2);
        break;

    }
    this.formeFilledLevel = 2;
  }

  changeField() {
    this.renderConditionalType(this.uploadEditFieldForm.controls.ddField.value, this.uploadEditFieldForm.controls.editType.value);
    this.formeFilledLevel = 3;
  }

  renderConditionalType(ddField: any, editType: any) {
      switch (editType) {
        case "0": this.messageStep3 = "Please select the new value."; break;
        case "1": this.messageStep3 = "Please select the value you would like to add."; break;
        case "2": this.messageStep3 = "Please confirm that you would like to CLEAR the selected field for all checked companies."; break;
      default:
        console.log(editType);
    }
    switch (ddField) {
      case "Shareable": case "Check1": case "Check2": case "Check3": case "Check4": case "Check5": case "Check6":
        this.messageStep3 = "Please select the new value.";
        this.uploadEditFieldForm.controls.textValue.setValue(false);
        break;
      case "Notes": case "Comments":
        console.log('Notes or comments');
        break;
      case "CMCustomDate1": case "CMCustomDate2": case "CMCustomDate3": case "CMCustomDate1 : Issue": case "CMCustomDate2 : Request Info": case "CMCustomDate3 : Expiration":
        this.uploadEditFieldForm.controls.textValue.setValue(parseDate(new Date()));
        break;
      case "Class1Code": case "Class1Code : Status":
        this.classCode = this.contactUploadFieldMapResponse.lookup_Class1Code.lookup;
        break;
      case "Class2Code": case "Class2Code : Marketing Channel":
        this.classCode = this.contactUploadFieldMapResponse.lookup_Class2Code.lookup;
        break;
      case "Class3Code": case "Class3Code : Best time to call":
        this.classCode = this.contactUploadFieldMapResponse.lookup_Class3Code.lookup;
        break;
      case "Class4Code": case "Class4Code : DQ/Dead Factors":
        this.classCode = this.contactUploadFieldMapResponse.lookup_Class4Code.lookup;
        break;
      case "Class5Code": case "Class5Code : BEM ONLY (do not use)":
        this.classCode = this.contactUploadFieldMapResponse.lookup_Class5Code.lookup;
        break;
      case "Class6Code": case "Class6Code : Channel":
        this.classCode = this.contactUploadFieldMapResponse.lookup_Class6Code.lookup;
        break;
      case "Class7Code": case "Class7Code : Source":
        this.classCode = this.contactUploadFieldMapResponse.lookup_Class7Code.lookup;
        break;
      case "Class8Code": case "Class8Code : Campaign":
        this.classCode = this.contactUploadFieldMapResponse.lookup_Class8Code.lookup;
        break;
      case "Tag":
        this.tagList = this.contactUploadFieldMapResponse.lookUpTags;
        this.tagData = this.tagList?.slice();
        if (editType === "1")
          this.messageStep3 = "Please select or enter a tag to add";
        break;
      default:
        console.log('Default');
    }
  }


  commonEditTypeForm() {
    this.enumForEditType = eEditType;
    this.editTypeKeys = Object.values(this.enumForEditType).filter(k => !isNaN(Number(k)));
    this.initEditTypeKeys = this.editTypeKeys;
  }

  cancelSaveCompany() {
    this.isEditField = false;
    this.saveConfirmation = false;
    this.uploadEditFieldForm.controls['textValue'].enable();
    this.actionPerformdType = -1;
  }

  preSaveContact() {
    if (this.mySelection?.length <= 0) {
      this._notifyService.showWarning('Select atleast one contact before transfer', 'No Contact Selected');
      return;
    }
    else {
      if (this.uploadEditFieldForm.controls.textValue.value == "")
        this.uploadEditFieldForm.controls.textValue.markAsTouched();
      else {
        this.saveConfirmation = true;
        this.uploadEditFieldForm.controls['textValue'].disable();
        this.formeFilledLevel = 4;
      }

    }
  }

  updateBulkCompanyForm() {
    if (this.mySelection.length <= 0) {
      this._notifyService.showWarning('Select Companies Before Save', 'No Companies Selected');
      return;
    }
    else {
      var uploadContactBulkActionFinal: UploadCompanyBulkAction = this.copyValueFromBulkEditToData();
      this.uploadCompanyEditBulk(uploadContactBulkActionFinal);
    }
  }

  copyValueFromBulkEditToData() {
    var uploadContactBulkActionFinal: UploadCompanyBulkAction = <UploadCompanyBulkAction>{};
    uploadContactBulkActionFinal.companyIdsToProcess = this.mySelection ? this.mySelection : [];
    uploadContactBulkActionFinal.isProcessAll = false;
    uploadContactBulkActionFinal.eEdit = +this.uploadEditFieldForm.controls.editType.value;
    uploadContactBulkActionFinal.fieldName = this.uploadEditFieldForm.controls.ddField.value;
    uploadContactBulkActionFinal.fieldvalue = this.uploadEditFieldForm.controls.textValue.value;
    return uploadContactBulkActionFinal;
  }

  copyValueFromTransferEditToData(type) {
    var userCompanyBulkActionTransfer: UserCompanyBulkAction = <UserCompanyBulkAction>{};
    userCompanyBulkActionTransfer.companyIds = this.mySelection ? this.mySelection : [];
    userCompanyBulkActionTransfer.isProcessAll = false;
    userCompanyBulkActionTransfer.clpuserID = (type == 'transfer') ? this.assignedUserTransfer : this.user.cLPUserID;
    console.log(userCompanyBulkActionTransfer);
    return userCompanyBulkActionTransfer;
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState): void {
    if (checkedState === "checked") {
      this.mySelection = this.companyList.map((item) => item.companyID);
      this.selectAllState = "checked";
    } else {
      this.mySelection = [];
      this.selectAllState = "unchecked";
    }
  }


  getCompanyGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'company_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('company_grid').subscribe((value) => {
      this.subscriptionQueryList = this._contactCommonSearchService.getqueryListChangedChangeEmitter().subscribe((data) => {
        this._ngZone.run(() => {
          this.queryDataLoaded = data;
          this.getQueryData();

        })
      });
    }));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'company_grid').subscribe((value) => this.getCompanyGridConfiguration());
  }

  ngOnDestroy() {
    this.subscriptionQueryList?.unsubscribe();
  }

  async getQueryData() {
    this.showSpinner = true;
    await this._searchContactService.searchSaveComany(this.encryptedUser, this.queryDataLoaded, this.user.cLPUserID)
      .then(async (result: CompanyListResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.companyList = res.companies
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.companyList, "company_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('company_grid');
          }
          else
            console.log('Could not load grid configuration for company')
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getCompanyDropDownData() {
    this.showSpinner = true;
    await this._accountSetupService.companyBulkUpdateDDFieldsGet(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: ddFieldRespone) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.lookUpFields = res.ddFields;
          this.userFilterAssign = res.filterUsers;
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async uploadCompanyEditBulk(userCompanyBulkAction: UploadCompanyBulkAction) {
    this.showSpinner = true;
    await this._accountSetupService.uploadCompanyEditBulk(this.encryptedUser, this.user.cLPUserID, userCompanyBulkAction)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.actionPerformdType = -1;
          this.mySelection = [];
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }


  async companyBulkDeleteByIds(userCompanyBulkAction: UserCompanyBulkAction) {
    this.showSpinner = true;
    await this._accountSetupService.companyBulkDeleteByIds(this.encryptedUser, this.user.cLPUserID, userCompanyBulkAction)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.actionPerformdType = -1;
          this.mySelection = [];
          if (!res.messageBool)
            this._notifyService.showWarning(res.messageString, 'Unable to delete');
          else
            this._notifyService.showSuccess('Select companies deleted', 'deleted successfully');
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }


  async companyBulkActionTransfer(userCompanyBulkAction: UserCompanyBulkAction) {
    this.showSpinner = true;
    await this._accountSetupService.companyBulkActionTransfer(this.encryptedUser, this.user.cLPUserID, userCompanyBulkAction)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          console.log(res);
          this.actionPerformdType = -1;
          this.mySelection = [];
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  viewCompanyList(eventData: { title: string, saved: boolean }) {
    this.stepper = eventData.title;
    if (eventData.saved)
      this.getQueryData();

  }

  rowSelectionCompanyChange(clpid) {
    this.companyId = clpid;
    this.stepper = 'create';
  }

  rowSelectionCompanyChangeFromBulk(clpid) {   
    this.companyId = clpid;
    this.stepper = 'create';
    this.isBulkCompany = false;
  }

  getRecentDocumentsConfig() {
    this.recentDocConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 10,
      uploadAPI: {
        url: this.baseUrl + 'api/Document/QuickFileUpload/' + this.user.cLPCompanyID + '/' + this.user.cLPUserID,
        headers: {
        },
      },
      formatsAllowed: '.jpg, .png, .eps, .jpeg, .gif, .pdf, .txt, .wpd, .doc, .docx, .xlsx, .csv',
      multiple: false,
      replaceTexts: {
        selectFileBtn: 'Select',
        resetBtn: 'Reset',
        uploadBtn: 'Save',
        afterUploadMsg_success: null,
        afterUploadMsg_error: 'Upload Failed!',
      }
    }
  }

  changeFileApiResponse(event) {
    if (!isNullOrUndefined(event.body))
      this._notifyService.showSuccess(event.body.messageString ? event.body.messageString : 'File Successfuly Uploaded', "", 3000);
  }

  createNewCompany() {
    this.stepper = 'create'; this.companyId = 0;
    this.companyCreateRef.isEditMode = false;
  }

  deleteBulkUser() {
    if (this.mySelection.length <= 0) {
      this._notifyService.showWarning('Select Companies Before Delete', 'No Companies Selected');
      return;
    }
    else {
      var uploadContactBulkTransferFinal: UserCompanyBulkAction = this.copyValueFromTransferEditToData('delete');
      this.companyBulkDeleteByIds(uploadContactBulkTransferFinal);
    }
  }

  transferBulkUser() {
    if (this.mySelection.length <= 0) {
      this._notifyService.showWarning('Select Companies Before Transfer', 'No Companies Selected');
      return;
    }
    else {
      if (this.assignedUserTransfer < 0) {
        this._notifyService.showWarning('Select User to be assigned', 'No User Selected');
        return;
      }
      else {
        var uploadContactBulkTransferFinal: UserCompanyBulkAction = this.copyValueFromTransferEditToData('transfer');
        this.companyBulkActionTransfer(uploadContactBulkTransferFinal);
      }
    }
  }

}
