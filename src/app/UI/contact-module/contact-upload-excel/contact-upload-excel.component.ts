import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataBindingDirective, SelectAllCheckboxState } from '@progress/kendo-angular-grid';
import { AngularFileUploaderComponent } from 'angular-file-uploader';
import { isNullOrUndefined } from 'util';
import { ClassCodes, ClassCodesListResponse } from '../../../models/classCodes.model';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { ContactUploadFieldMapping, ContactUploadFieldMappingResponse, ContactUploadMoreFilters, LookUpItem, Map_Filter_Item, ProcessStep2Resonse, UploadContactSummary } from '../../../models/contactExcelUpload';
import { eEditType, eFeatures, eUploadContactActionToTake, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { UploadCompany, UploadCompanyRespone } from '../../../models/uploadCompany.model';
import { UploadComppanyBulkActionResponse, UploadContactBulkAction, UploadContactBulkActionResponse, UploadContactVM, UploadContactVMResponse } from '../../../models/uploadContacts.model';
import { ClassCodeService } from '../../../services/classCode.service';
import { ContactService } from '../../../services/contact.service';
import { NotificationService } from '../../../services/notification.service';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { process } from '@progress/kendo-data-query';
import { parseDate } from '@progress/kendo-angular-intl';
import { UploadMapping, UploadMappingResponse } from '../../../models/uploadMapping.model';

declare var $: any;

@Component({
  selector: 'app-contact-upload-excel',
  templateUrl: './contact-upload-excel.component.html',
  styleUrls: ['./contact-upload-excel.component.css'],
  providers: [{ provide: 'GridConfigurationService', useClass: GridConfigurationService },
  { provide: 'GridConfigurationService1', useClass: GridConfigurationService }]
})
export class ContactUploadExcelComponent implements OnInit {
  private encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  showSpinner: boolean = false;
  step: number = 1;
  contactDocConfig;
  @ViewChild('excelUpload')
  private excelUpload: AngularFileUploaderComponent;
  classCodes: ClassCodes[] = [];
  groupByClassCode: Map<string, ClassCodes[]>;
  contactSheets = [];
  sheetSelected;
  showWorkSheet;
  confirmMessage: string;
  stepTwoMessage: string;
  contactUploadFieldMapResponse: ContactUploadFieldMappingResponse;
  contactUploadFieldMappings: ContactUploadFieldMapping;
  excelFileName: any;
  sheetSelectedData: any[];
  sheetSelectedValue: string;
  lookUpNoteTypeCode: Map_Filter_Item[];
  lookUpFields: LookUpItem[];
  lookUpExistingMappings: LookUpItem[];
  contactUploadForm = new FormGroup({});
  useLastName: boolean = false;
  cbContactID: boolean = false;
  isFindDuplicate: boolean = false;
  addMapComments: any = [];
  historyEntry: any[] = [];
  baseUrl: string;
  selectedNames: [] = [];
  uploadSessionId: number;
  processStep2Resonse: ProcessStep2Resonse;
  uploadContactSummary: UploadContactSummary;
  isEditField: boolean = false;
  uploadEditFieldForm: FormGroup;

  isProcessedListContacts: boolean = false;
  public mySelection: number[] = [];
  public contactsUploaded: number[] = [];
  public companySelection: number[] = [];
  selectAllContacts: boolean = false;

  /* grid*/

  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: 'name', title: 'Name', width: '250' },
    { field: 'address', title: 'Address', width: '250' },
    { field: 'email', title: 'Email', width: '80' },
    { field: 'classification', title: 'Classification', width: '80' },
    { field: 'owner', title: 'Owner', width: '80' },
    { field: 'statusCode', title: 'System Message', width: '60' },
    { field: 'actionToTake', title: 'Action', width: '140' }
  ];
  reorderColumnName: string = 'name,address,email,classification,owner,statusCode,actionToTake';
  columnWidth: string = 'name:250,address:250,email:70,classification:250,owner:120,statusCode:120,actionToTake:120';
  arrColumnWidth: any[] = ['name:250,address:250,email:70,classification:250,owner:120,statusCode:120,actionToTake:120'];
  gridHeight;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  isDuplicateContact: boolean = false;
  isDuplicateCompany: boolean = false;
  contactProcessedList: UploadContactVM[] = [];
  initContactProcessedList: UploadContactVM[] = [];
  contactDuplicateList: UploadContactVM[];
  initContactDuplicateList: UploadContactVM[];
  /* grid*/

  /* grid Company*/

  columnsCmp = [
    { field: '$', title: ' ', width: '40' },
    { field: 'companyName', title: 'Company', width: '250' },
    { field: 'addressDisplay', title: 'Address', width: '250' },
    { field: 'webSite', title: 'Website', width: '80' },
    { field: 'clpUserDisplay', title: 'Created By', width: '80' },
    { field: 'systemNote', title: 'System Message', width: '60' },
    { field: 'actionToTake', title: 'Action', width: '140' }
  ];

  reorderColumnNameCmp: string = 'companyName,addressDisplay,webSite,clpUserDisplay,systemNote,actionToTake';
  columnWidthCmp: string = 'companyName:250,addressDisplay:250,webSite:70,clpUserDisplay:250,systemNote:120,actionToTake:120';
  arrColumnWidthCmp: any[] = ['companyName:250,addressDisplay:250,webSite:70,clpUserDisplay:250,systemNote:120,actionToTake:120'];
  @ViewChild(DataBindingDirective) dataBindingCmp: DataBindingDirective;
  isDuplicateContactCmp: boolean = false;
  companyDuplicateList: UploadCompany[];
  initCompanyDuplicateList: UploadCompany[];
  companyProcessedList: UploadCompany[];
  initCompanyProcessedList: UploadCompany[];
  /* grid Company*/

  uploadContactVMResponse: UploadContactVMResponse;
  messageStep3: string = "";
  editMode: boolean = false;
  /*enums*/
  enumForEditType;
  editTypeKeys: unknown[];
  initEditTypeKeys: unknown[];
  enumActionToTake;
  /*enums*/
  classCode: ClassCodes[];
  tagList: LookUpItem[];
  tagData: LookUpItem[];

  /**/

  searchScopeList: { value: number; text: string; }[] = [];
  messageTransfer: string = "Please select the new owner of all checked contacts.";
  isToTransferFieldContact = '0';
  filterManagerTransfer: LookUpItem[];
  newManagerId: number = 0;
  searchScope: number;
  processGridType: number = 0;
  uploadMappingID: number;
  uploadCompanyResponse: UploadCompanyRespone;
  cbOPtin: boolean = false;
  reUploadMappingFields: UploadMapping;
  messageToShowAfter: string;
  transferConfirmation: boolean = false;
  saveConfirmation: boolean = false;
  loadStep4: boolean = false;
  step4Complete: boolean = false;
  mobileColumnNames: string[];
  mobileCompanyColumnNames: string[];


  constructor(public _localService: LocalService, @Inject('BASE_URL') _baseUrl: string, public _contactService: ContactService, public _classCodeService: ClassCodeService, private fb: FormBuilder, private _utilityService: UtilityService, private cdRef: ChangeDetectorRef, private _notifyService: NotificationService,
    private notifyService: NotificationService,
    private ngZone: NgZone,
    @Inject('GridConfigurationService') public _gridCnfgService: GridConfigurationService,
    @Inject('GridConfigurationService1') public _gridCnfgServiceCompany: GridConfigurationService,
    private _router: Router) {
    this.gridHeight = this._localService.getGridHeight('432px');
    this._localService.isMenu = true;
    this.baseUrl = _baseUrl;
  }

  apiResponse(event) {
    let list1;
    if (!isNullOrUndefined(event.body) && !isNullOrUndefined(event.body.list)) {
      list1 = event.body.list[0];
      this.contactSheets = event.body.list;
      this.sheetSelected = this.contactSheets[0]?.key;
      this.showWorkSheet = true;
      this.confirmMessage = event.body.messageString;
      this.excelFileName = event.body.messageString2;
    }
  }
  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getExcelUploadData();
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
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ExcelUploadWizard)
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

  groupBy<K, V>(array: V[], grouper: (item: V) => K) {
    return array.reduce((store, item) => {
      var key = grouper(item)
      if (!store.has(key)) {
        store.set(key, [item])
      } else {
        store.get(key).push(item)
      }
      return store
    }, new Map<K, V[]>())
  }

  async getExcelUploadData() {
    this.getUploadExcelConfig();
    if ($(window).width() < 768)
      this.contactDocConfig.theme = '';
    this.showSpinner = true;
    await this._classCodeService.getClassCodes(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: ClassCodesListResponse) => {
        if (result) {
          this.classCodes = UtilityService.clone(result.classCodes);

          for (var i = 0; i < this.classCodes.length; i++) {
            this.classCodes[i].key = this.classCodes[i].tableName + " : " + this.classCodes[i].classCodeTitle;
          }
          this.groupByClassCode = this.groupBy(this.classCodes, x => x.key);
          console.log(this.groupByClassCode)
          this.getUploadExcelConfig();
          if ($(window).width() < 768)
            this.contactDocConfig.theme = '';
          this.showSpinner = false;
        }
        else {
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });

  }

  getSheetSelectedName() {
    if (!isNullOrUndefined(this.sheetSelected)) {
      this.sheetSelectedData = this.contactSheets?.filter(data => data.key == this.sheetSelected);
      this.sheetSelectedValue = this.sheetSelectedData[0].value;
    }
  }
  uploadFailHandle() {
    this.step = 1;
    this.contactSheets = null;
    this.sheetSelected = null;
    this.showWorkSheet = false;
    this.confirmMessage = null;
    this.excelFileName = null;

  }
  async contactUploadStep1() {
    this.getSheetSelectedName();
    if (isNullOrUndefined(this.sheetSelectedValue)) {
      this.notifyService.showError('Could not found Uploaded File', '', 3000);
      this.uploadFailHandle();
    }
    else {
      this.showSpinner = true;
      await this._contactService.contactUploadProcessStep1(this.encryptedUser, this.excelFileName, this.user.cLPCompanyID, this.user.cLPUserID, this.sheetSelectedValue)
        .then(async (result: ContactUploadFieldMappingResponse) => {
          if (result) {
            this.contactUploadFieldMapResponse = UtilityService.clone(result);
            this.contactUploadFieldMappings = this.contactUploadFieldMapResponse.contactUploadFieldMappings;
            this.uploadSessionId = this.contactUploadFieldMapResponse.uploadSessionId;
            this.showSpinner = false;
            if (!isNullOrUndefined(this.contactUploadFieldMappings))
              this.contactMappingView();
            else {
              this.notifyService.showError('Could Not get File data', '', 3000);
              this.uploadFailHandle();
            }
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

  }

  copyValueFromContactUploadFormToData() {
    this.copyObjectBeforeSave();
    this.contactUploadFieldMappings.mapAdd1.fieldValue = this.contactUploadForm.controls.mapAdd1.value;
    this.contactUploadFieldMappings.mapAdd2.fieldValue = this.contactUploadForm.controls.mapAdd2.value;
    this.contactUploadFieldMappings.mapAdd3.fieldValue = this.contactUploadForm.controls.mapAdd3.value;
    this.contactUploadFieldMappings.mapAltPhone.fieldValue = this.contactUploadForm.controls.mapAltPhone.value;
    this.contactUploadFieldMappings.mapCity.fieldValue = this.contactUploadForm.controls.mapCity.value;
    this.contactUploadFieldMappings.mapComments.fieldValue = "";
    this.contactUploadFieldMappings.mapHistory.fieldValue = "";
    this.contactUploadFieldMappings.mapCompany.fieldValue = this.contactUploadForm.controls.mapCompany.value;
    this.contactUploadFieldMappings.mapCountry.fieldValue = this.contactUploadForm.controls.mapCountry.value;
    this.contactUploadFieldMappings.mapCustomDate1.fieldValue = this.contactUploadForm.controls.mapCustomDate1.value;
    this.contactUploadFieldMappings.mapCustomDate1Title.fieldValue = this.contactUploadForm.controls.mapCustomDate1Title.value;
    this.contactUploadFieldMappings.mapCustomDate2.fieldValue = this.contactUploadForm.controls.mapCustomDate2.value;
    this.contactUploadFieldMappings.mapCustomDate2Title.fieldValue = this.contactUploadForm.controls.mapCustomDate2Title.value;
    this.contactUploadFieldMappings.mapCustomDate3.fieldValue = this.contactUploadForm.controls.mapCustomDate3.value;
    this.contactUploadFieldMappings.mapCustomDate3Title.fieldValue = this.contactUploadForm.controls.mapCustomDate3Title.value;
    this.contactUploadFieldMappings.mapCustomText1.fieldValue = this.contactUploadForm.controls.mapCustomText1.value;
    this.contactUploadFieldMappings.mapCustomText2.fieldValue = this.contactUploadForm.controls.mapCustomText2.value;
    this.contactUploadFieldMappings.mapCustomText3.fieldValue = this.contactUploadForm.controls.mapCustomText3.value;
    this.contactUploadFieldMappings.mapEmail.fieldValue = this.contactUploadForm.controls.mapEmail.value;
    this.contactUploadFieldMappings.mapEmail2.fieldValue = this.contactUploadForm.controls.mapEmail2.value;
    this.contactUploadFieldMappings.mapEmail3.fieldValue = this.contactUploadForm.controls.mapEmail3.value;
    this.contactUploadFieldMappings.mapFax.fieldValue = this.contactUploadForm.controls.mapFax.value;
    this.contactUploadFieldMappings.mapFirstName.fieldValue = this.contactUploadForm.controls.mapFirstName.value;
    this.contactUploadFieldMappings.mapHistoryNotes.fieldValue = this.contactUploadForm.controls.mapHistoryNotes.value;
    this.contactUploadFieldMappings.mapHomePhone.fieldValue = this.contactUploadForm.controls.mapHomePhone.value;
    this.contactUploadFieldMappings.mapLastName.fieldValue = this.contactUploadForm.controls.mapLastName.value;
    this.contactUploadFieldMappings.mapMobile.fieldValue = this.contactUploadForm.controls.mapMobile.value;
    this.contactUploadFieldMappings.mapOtherFax.fieldValue = this.contactUploadForm.controls.mapOtherFax.value;
    this.contactUploadFieldMappings.mapSalutation.fieldValue = this.contactUploadForm.controls.mapSalutation.value;
    this.contactUploadFieldMappings.mapShare.fieldValue = this.contactUploadForm.controls.mapShare.value;
    this.contactUploadFieldMappings.mapState.fieldValue = this.contactUploadForm.controls.mapState.value;
    this.contactUploadFieldMappings.mapTitle.fieldValue = this.contactUploadForm.controls.mapTitle.value;
    this.contactUploadFieldMappings.mapUserCode.fieldValue = this.contactUploadForm.controls.mapUserCode.value;
    this.contactUploadFieldMappings.mapWebSite.fieldValue = this.contactUploadForm.controls.mapWebSite.value;
    this.contactUploadFieldMappings.mapZip.fieldValue = this.contactUploadForm.controls.mapZip.value;
    /*    this.contactUploadFieldMappings.mapcompanyClass1.fieldValue = this.contactUploadForm.controls.mapcompanyClass1.value;*/
    this.contactUploadFieldMappings.mapdtCreated.fieldValue = this.contactUploadForm.controls.mapdtCreated.value;
    this.contactUploadFieldMappings.mapdtLastModified.fieldValue = this.contactUploadForm.controls.mapdtLastModified.value;
    this.contactUploadFieldMappings.phone.fieldValue = this.contactUploadForm.controls.phone.value;
    this.contactUploadFieldMappings.mapWebSite.fieldValue = this.contactUploadForm.controls.mapWebSite.value;
    this.contactUploadFieldMappings.mappingName = this.contactUploadForm.controls.mappingName.value;
    if (this.cbContactID)
      this.contactUploadFieldMappings.cbContactID.fieldValue = this.contactUploadForm.controls.cbContactID.value;

  }

  contactUploadFormSubmit() {
    this._localService.validateAllFormFields(this.contactUploadForm);
    if (this.contactUploadForm.valid) {
      this.contactUploadForm.markAsPristine();
      this.updateContactUploadFormStep2();
    }
    else
      this._notifyService.showError("Invalid Excel Upload Fields", "", 3000);

  }
  updateContactUploadFormStep2() {
    this.copyValueFromContactUploadFormToData();
    if (!isNullOrUndefined(this.uploadSessionId))
      this.contactUploadStep2();
    else {
      this.contactUploadStep1();
      this._notifyService.showError('Could not find the upload Session', 2000);
    }

  }

  async contactUploadStep2() {
    this.showSpinner = true;
    await this._contactService.contactUploadProcessStep2(this.encryptedUser, this.user.cLPUserID, this.uploadSessionId, this.user.cLPCompanyID, this.excelFileName, this.sheetSelectedValue, 0, this.contactUploadFieldMappings)
      .then(async (result: ProcessStep2Resonse) => {
        if (result) {
          this.processStep2Resonse = UtilityService.clone(result);
          this.uploadContactSummary = this.processStep2Resonse.uploadContactSummary;
          this.uploadMappingID = this.processStep2Resonse.uploadMappingID;
          this.step = 3;
          this.searchScope = 1;
          this.editField();
          this.contactUploadGetMoreFilters();
          this.getGridConfiguration();
          this.getCompanyGridConfiguration();
          this.companiesListDuplicate();
          this.contactGetListDuplicate();
          this.commonEditTypeForm();
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

  contactMappingView() {
    this.contactUploadFieldMappings.cbContactID ? this.cbContactID = true : this.cbContactID = false;
    this.lookUpNoteTypeCode = this.contactUploadFieldMapResponse.lookUp_NoteTypecode;
    this.lookUpExistingMappings = this.contactUploadFieldMapResponse.lookUp_ExistingMappings;
    this.lookUpFields = this.contactUploadFieldMapResponse.lookUp_fields;
    this.step = 2;
    this.stepTwoMessage = this.contactUploadFieldMapResponse.messageString;
    if (!isNullOrUndefined(this.contactUploadFieldMappings))
      this.contactUploadFieldMappings.mappingName = "";
    this.removeNullProperties(this.contactUploadFieldMappings);
    if (!isNullOrUndefined(this.contactUploadFieldMappings)) {
      this.setValidation();
      this.patchContactUploadFormValue();
      this.updateDataContacts();
      this.renderLastName();
    }
  }

  renderLastName() {
    this.contactUploadForm.controls["splitFirstName"].valueChanges.subscribe(country => {
      this.useLastName = country;
    });
  }
  updateDataContacts() {
    Object.keys(this.contactUploadForm.controls).forEach(key => {
      var handleMappingkeys = ["splitFirstName", "mapHistoryNotes", "cbContactID", "mappingName"]
      if (!handleMappingkeys.includes(key))
        this.iterateAndSubControls(key);
    });
  }
  setValidation() {
    var conatactsUploadFields = this.contactUploadFieldMappings;
    for (let key in conatactsUploadFields) {
      let value = conatactsUploadFields[key];
      if (!isNullOrUndefined(value))
        this.prepareContactUploadForm(key, value);
    }
  }
  private prepareContactUploadForm(key, value) {
    this.contactUploadForm.addControl(key, new FormControl(key == 'splitFirstName' ? false : ''))
  }

  patchContactUploadFormValue() {
    var conatactsUploadFields = this.contactUploadFieldMappings;
    for (let key in conatactsUploadFields) {

      if (key == 'cbContactID' || key == 'splitFirstName') {
        key == 'cbContactID' ? this.preparePatchContactFormValue(key, true) : this.preparePatchContactFormValue(key, false);
      }
      else {
        let value = conatactsUploadFields[key];
        if (!isNullOrUndefined(value)) {
          let items: Map_Filter_Item[] = value.items;
          let selectedItems = items?.filter(val => val.isselected == true);
          if (!isNullOrUndefined(selectedItems) && selectedItems.length >= 1) {
            selectedItems.length == 1 ? value.fieldValue = selectedItems[0].value : console.log(value);
          }
        }
        this.preparePatchContactFormValue(key, value);
      }
    }
  }

  iterateAndSubControls(formKey: string) {
    this.contactUploadForm.controls[formKey].valueChanges.subscribe(country => {
      this.contactUploadFieldMappings[formKey].fieldValue = country;
      this.contactUploadFieldMappings[formKey].items.forEach(value => {
        if (value.value === country)
          value.isselected = true;
        else
          value.isselected = false;
      })

    }
    );
  }

  preparePatchContactFormValue(key, value) {
    if (key == 'cbContactID' || key == 'splitFirstName' || key == 'mappingName')
      this.contactUploadForm.get(key).setValue(value);
    else
      this.contactUploadForm.get(key).setValue(value.fieldValue);
  }


  recentUpload: number = 0;

  public onValueChangeMulti(value, type) {
    switch (type) {
      case 'historyEntry':
        this.historyEntry = value;
        break;
      case 'mapComments':
        this.addMapComments = value;
        break;
      case 'recentUploads':
        this.reUploadMapping(this.recentUpload);

        break;
      default:
        console.log("No such case exists!");
        break;

    }
  }

  async reUploadMapping(recentUpload: number) {

    this.showSpinner = true;
    await this._contactService.uploadMappingLoad(this.encryptedUser, recentUpload)
      .then(async (result: UploadMappingResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.reUploadMappingFields = res.UploadMapping;
          this.showSpinner = false;
          this.rePatchContactUploadFormValue();
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }
  rePatchContactUploadFormValue() {
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.add1);
    this.contactUploadForm.controls.mapAdd2?.setValue(this.reUploadMappingFields.add2);
    this.contactUploadForm.controls.mapAdd3?.setValue(this.reUploadMappingFields.add3);
    this.contactUploadForm.controls.mapAltPhone?.setValue(this.reUploadMappingFields.altPhone);
    this.contactUploadForm.controls.check1?.setValue(this.reUploadMappingFields.check1);
    this.contactUploadForm.controls.check2?.setValue(this.reUploadMappingFields.check2);
    this.contactUploadForm.controls.check3?.setValue(this.reUploadMappingFields.check3);
    this.contactUploadForm.controls.check4?.setValue(this.reUploadMappingFields.check4);
    this.contactUploadForm.controls.check5?.setValue(this.reUploadMappingFields.check5);
    this.contactUploadForm.controls.check6?.setValue(this.reUploadMappingFields.check6);

    this.contactUploadForm.controls.mapCity?.setValue(this.reUploadMappingFields.city);
    this.contactUploadForm.controls.mapClass1Code?.setValue(this.reUploadMappingFields.class1Code);
    this.contactUploadForm.controls.mapClass2Code?.setValue(this.reUploadMappingFields.class2Code);
    this.contactUploadForm.controls.mapClass3Code?.setValue(this.reUploadMappingFields.class3Code);
    this.contactUploadForm.controls.mapClass4Code?.setValue(this.reUploadMappingFields.class4Code);
    this.contactUploadForm.controls.mapClass5Code?.setValue(this.reUploadMappingFields.class5Code);
    this.contactUploadForm.controls.mapClass6Code?.setValue(this.reUploadMappingFields.class6Code);
    this.contactUploadForm.controls.mapClass7Code?.setValue(this.reUploadMappingFields.class7Code);
    this.contactUploadForm.controls.mapClass8Code?.setValue(this.reUploadMappingFields.class8Code);

    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coCheck1);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coCheck2);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coCheck3);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coCheck4);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coClass1Code);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coClass2Code);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coClass3Code);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coClass4Code);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coClass5Code);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coClass6Code);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coClass7Code);
    this.contactUploadForm.controls.mapAdd1?.setValue(this.reUploadMappingFields.coClass8Code);

    /*this.contactUploadForm.controls.mapcompanyCustom1.setValue(this.reUploadMappingFields.coCustom1);   missing value*/
    this.contactUploadForm.controls.mapcompanyCustom2?.setValue(this.reUploadMappingFields.coCustom2);
    this.contactUploadForm.controls.mapcompanyCustom3?.setValue(this.reUploadMappingFields.coCustom3);
    this.contactUploadForm.controls.mapcompanyCustom4?.setValue(this.reUploadMappingFields.coCustom4);
    this.contactUploadForm.controls.mapcompanyCustom5?.setValue(this.reUploadMappingFields.coCustom5);
    this.contactUploadForm.controls.mapcompanyCustom6?.setValue(this.reUploadMappingFields.coCustom6);
    this.contactUploadForm.controls.mapcompanyCustom7?.setValue(this.reUploadMappingFields.coCustom7);
    this.contactUploadForm.controls.mapcompanyCustom8?.setValue(this.reUploadMappingFields.coCustom8);

    this.contactUploadForm.controls.mapComments?.setValue(this.reUploadMappingFields.comments);
    /*check*/
    this.contactUploadForm.controls.mapCompany?.setValue(this.reUploadMappingFields.companyName);
    this.contactUploadForm.controls.mapCompanyCustom1?.setValue(this.reUploadMappingFields.companyName);
    /*check*/
    this.contactUploadForm.controls.mapCountry?.setValue(this.reUploadMappingFields.country);
    this.contactUploadForm.controls.mapcustom1?.setValue(this.reUploadMappingFields.custom1);
    this.contactUploadForm.controls.mapcustom2?.setValue(this.reUploadMappingFields.custom2);
    this.contactUploadForm.controls.mapcustom3?.setValue(this.reUploadMappingFields.custom3);
    this.contactUploadForm.controls.mapcustom4?.setValue(this.reUploadMappingFields.custom4);
    this.contactUploadForm.controls.mapcustom5?.setValue(this.reUploadMappingFields.custom5);
    this.contactUploadForm.controls.mapcustom6?.setValue(this.reUploadMappingFields.custom6);

    this.contactUploadForm.controls.mapCustomDate1?.setValue(this.reUploadMappingFields.customDate1);
    this.contactUploadForm.controls.mapCustomDate1Title?.setValue(this.reUploadMappingFields.customDate1Title);
    this.contactUploadForm.controls.mapCustomDate2?.setValue(this.reUploadMappingFields.customDate2);
    this.contactUploadForm.controls.mapCustomDate2Title?.setValue(this.reUploadMappingFields.customDate2Title);
    this.contactUploadForm.controls.mapCustomDate3?.setValue(this.reUploadMappingFields.customDate3);
    this.contactUploadForm.controls.mapCustomDate3Title?.setValue(this.reUploadMappingFields.customDate3Title);
    this.contactUploadForm.controls.mapCustomText1?.setValue(this.reUploadMappingFields.customText1);
    this.contactUploadForm.controls.mapCustomText2?.setValue(this.reUploadMappingFields.customText2);
    this.contactUploadForm.controls.mapCustomText3?.setValue(this.reUploadMappingFields.customText3);

    this.contactUploadForm.controls.mapdtCreated?.setValue(this.reUploadMappingFields.dateCreated);
    this.contactUploadForm.controls.mapdtLastModified?.setValue(this.reUploadMappingFields.dateModified);
    /* this.contactUploadForm.controls.mapdtCreated?.setValue(this.reUploadMappingFields.dtCreated); not nedeed*/

    this.contactUploadForm.controls.mapEmail?.setValue(this.reUploadMappingFields.email);
    this.contactUploadForm.controls.mapEmail2?.setValue(this.reUploadMappingFields.email2);
    this.contactUploadForm.controls.mapEmail3?.setValue(this.reUploadMappingFields.email3);
    this.contactUploadForm.controls.mapFax?.setValue(this.reUploadMappingFields.fax);
    this.contactUploadForm.controls.mapFirstName?.setValue(this.reUploadMappingFields.firstName);
    this.contactUploadForm.controls.mapHistoryNotes?.setValue(this.reUploadMappingFields.historyNote);
    this.contactUploadForm.controls.mapHomePhone?.setValue(this.reUploadMappingFields.homePhone);
    this.contactUploadForm.controls.mapLastName?.setValue(this.reUploadMappingFields.lastName);
    /**/
    this.contactUploadForm.controls.mappingName?.setValue(this.reUploadMappingFields.mappingName);
    /**/
    this.contactUploadForm.controls.mapMobile?.setValue(this.reUploadMappingFields.mobile);

    /*
        this.contactUploadForm.controls.mapNotes?.setValue(this.reUploadMappingFields.otherFax);
    Not Found
    */

    this.contactUploadForm.controls.mapSalutation?.setValue(this.reUploadMappingFields.salutation);
    this.contactUploadForm.controls.mapOtherFax?.setValue(this.reUploadMappingFields.otherFax);
    this.contactUploadForm.controls.mapShare?.setValue(this.reUploadMappingFields.shareable);
    this.contactUploadForm.controls.splitFirstName?.setValue(this.reUploadMappingFields.splitFirstName);
    this.contactUploadForm.controls.mapState?.setValue(this.reUploadMappingFields.state);
    this.contactUploadForm.controls.mapTitle?.setValue(this.reUploadMappingFields.title);
    this.contactUploadForm.controls.mapUserCode?.setValue(this.reUploadMappingFields.userCode);
    this.contactUploadForm.controls.mapWebSite?.setValue(this.reUploadMappingFields.webSite);
    this.contactUploadForm.controls.mapZip?.setValue(this.reUploadMappingFields.zip);

  }

  copyObjectBeforeSave() {
    if (!isNullOrUndefined(this.contactUploadFieldMappings.mapHistory.items)) {
      this.contactUploadFieldMappings.mapHistory.items.filter(element => {
        this.historyEntry.forEach(historyValue => {
          if (historyValue == element.value)
            element.isselected = true;
        })
      });
    }
    if (!isNullOrUndefined(this.contactUploadFieldMappings.mapComments.items)) {
      this.contactUploadFieldMappings.mapComments.items.filter(element => {
        this.addMapComments.forEach(commVal => {
          if (commVal == element.value)
            element.isselected = true;
        })
      });
    }
    if (this.useLastName) {
      this.contactUploadFieldMappings.mapLastName = null;
    }
  }

  removeNullProperties(obj) {
    Object.keys(obj).forEach(key => {
      let value = obj[key];
      if (value === null) {
        delete obj[key];
      }
    });
    return obj;
  }
  getUploadExcelConfig() {
    this.contactDocConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 10,
      uploadAPI: {
        url: this.baseUrl + 'api/Contact/Contact_Upload_Excel/' + this.user.cLPCompanyID + '/' + this.user.cLPUserID,
        headers: {
        },
      },
      formatsAllowed: '.xlsx, .csv',
      multiple: false,
      replaceTexts: {
        selectFileBtn: 'Select Excel',
        resetBtn: 'Reset',
        uploadBtn: 'Validate File',
        dragNDropBox: 'Drag and Drop your file here',
        attachPinBtn: 'Attach Files...',
        afterUploadMsg_success: 'Successfully Uploaded!',
        afterUploadMsg_error: 'Upload Failed!',
      }
    };
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


  updateContactUploadFormStep3Main() {
    if (this.mySelection.length <= 0) {
      this._notifyService.showWarning('Select Contact Before Save', 'No Contacts Selected');
      return;
    }
    else {
      var uploadContactBulkActionFinal: UploadContactBulkAction = this.copyValueFromBulkEditToData();
      if (!isNullOrUndefined(this.uploadSessionId))
        this.contactUploadStep3Main(uploadContactBulkActionFinal);
      else
        this._notifyService.showError('Could not upload this step due to Session', 2000);
    }

  }
  public selectAllState: SelectAllCheckboxState = "unchecked";
  public onSelectedKeysChange(): void {
    const len = this.mySelection.length;

    if (len === 0) {
      this.selectAllState = "unchecked";
    } else if (len > 0 && len < (this.isDuplicateContact ? this.contactDuplicateList.length : this.contactProcessedList.length)) {
      this.selectAllState = "indeterminate";
    } else {
      this.selectAllState = "checked";
    }
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState): void {
    if (checkedState === "checked") {
      this.mySelection = this.isDuplicateContact ? this.contactDuplicateList.map((item) => item.uploadContactID) : this.contactProcessedList.map((item) => item.uploadContactID);
      this.selectAllState = "checked";
    } else {
      this.mySelection = [];
      this.selectAllState = "unchecked";
    }
  }

  public selectAllCompanyState: SelectAllCheckboxState = "unchecked";
  public onSelectedCompanyKeysChange(): void {
    const len = this.companySelection.length;

    if (len === 0)
      this.selectAllCompanyState = "unchecked";
    else if (len > 0 && len < this.companyProcessedList.length)
      this.selectAllCompanyState = "indeterminate";
    else
      this.selectAllCompanyState = "checked";

  }

  public onSelectAllChangeCompany(checkedState: SelectAllCheckboxState): void {
    if (checkedState === "checked") {
      this.companySelection = this.companyProcessedList.map((item) => item.uploadCompanyID);
      this.selectAllCompanyState = "checked";
    } else {
      this.companySelection = [];
      this.selectAllCompanyState = "unchecked";
    }
  }

  copyValueFromBulkEditToData() {
    var uploadContactBulkActionFinal: UploadContactBulkAction = <UploadContactBulkAction>{};
    uploadContactBulkActionFinal.uploadSessionID = this.uploadSessionId;
    uploadContactBulkActionFinal.uploadContactIdsToProcess = this.processGridType === 1 ? this.mySelection : this.processGridType === 2 ? this.companySelection : [];
    uploadContactBulkActionFinal.isProcessAll = false;
    uploadContactBulkActionFinal.eEdit = +this.uploadEditFieldForm.controls.editType.value;
    uploadContactBulkActionFinal.fieldName = this.uploadEditFieldForm.controls.ddField.value;
    uploadContactBulkActionFinal.fieldvalue = this.uploadEditFieldForm.controls.textValue.value;
    return uploadContactBulkActionFinal;
  }

  async contactUploadStep3Main(uploadContactBulkActionFinal: UploadContactBulkAction) {

    this.showSpinner = true;
    var editBulkContact: number = this.isDuplicateContact ? 1 : 0;
    await this._contactService.uploadContactEditBulk(this.encryptedUser, editBulkContact, uploadContactBulkActionFinal)
      .then(async (result: UploadContactBulkActionResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this._notifyService.showSuccess(result.messageString, '', 4000);
          this.showSpinner = false;
          this.isEditField = false;
          this.mySelection = [];
          this.companySelection = [];
          this.saveConfirmation = false;
          this.uploadEditFieldForm.controls['textValue'].enable();
          this.messageToShowAfter = res.messageString;
          this.contactGetListProcessed();
          this.contactGetListDuplicate();
          this.companiesListProcessed();
          this.companiesListDuplicate();
        }
        else
          this.showSpinner = false;
        this.isEditField = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  changeField() {
    this.renderConditionalType(this.uploadEditFieldForm.controls.ddField.value, this.uploadEditFieldForm.controls.editType.value)
  }

  renderConditionalType(ddField: any, editType: any) {
    switch (editType) {
      case "0": this.messageStep3 = "Please select the new value.";
      case "1": this.messageStep3 = "Please select the value you would like to add.";
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


  configureContactList(value: boolean) {
    this.companySelection = [];
    this.mySelection = [];
    this.isEditField = false;
    this.isDuplicateContact = value;
    this.processGridType = 1;
  }

  configureCompanyList(value: boolean) {
    this.mySelection = [];
    this.companySelection = [];
    this.isEditField = false;
    this.isDuplicateCompany = value;
    this.processGridType = 2;

  }

  commonEditTypeForm() {
    this.enumForEditType = eEditType;
    this.editTypeKeys = Object.values(this.enumForEditType).filter(k => !isNaN(Number(k)));
    this.initEditTypeKeys = this.editTypeKeys;
  }

  async contactGetListProcessed() {
    this.showSpinner = true;
    await this._contactService.uploadContactGetListProcessed(this.encryptedUser, this.uploadSessionId, this.user.cLPCompanyID)
      .then(async (result: UploadContactVMResponse) => {
        if (result) {
          this.uploadContactVMResponse = UtilityService.clone(result);
          this._gridCnfgService.iterateConfigGrid(this.uploadContactVMResponse, "contact_excel_process_grid");
          this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('contact_excel_process_grid');
          this.contactProcessedList = this.uploadContactVMResponse.uploadContacts;
          this.initContactProcessedList = this.contactProcessedList;
          this.enumActionToTake = eUploadContactActionToTake;
          this.searchScopeList = [];
          this.searchScopeList.push({ text: 'Entire account', value: 1 }, { text: 'My contacts Only', value: 2 })
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }
  async contactGetListDuplicate() {
    this.showSpinner = true;
    await this._contactService.uploadContactGetListDuplicate(this.encryptedUser, this.uploadSessionId)
      .then(async (result: UploadContactVMResponse) => {
        if (result) {
          this.uploadContactVMResponse = UtilityService.clone(result);
          this.contactDuplicateList = this.uploadContactVMResponse.uploadContacts;
          this.initContactDuplicateList = this.contactProcessedList;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async companiesListProcessed() {
    this.showSpinner = true;
    await this._contactService.uploadCompaniesListProcessed(this.encryptedUser, this.uploadSessionId, this.user.cLPUserID)
      .then(async (result: UploadCompanyRespone) => {
        if (result) {
          this.uploadCompanyResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgServiceCompany.iterateConfigGrid(this.uploadCompanyResponse, "company_excel_process_grid");
            this.mobileCompanyColumnNames = this._gridCnfgService.getResponsiveGridColums('company_excel_process_grid');
          }

          this.companyProcessedList = this.uploadCompanyResponse.uploadCompanies;
          this.initCompanyProcessedList = this.companyProcessedList;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async companiesListDuplicate() {
    this.showSpinner = true;
    await this._contactService.uploadCompaniesDuplicateList(this.encryptedUser, this.uploadSessionId, this.user.cLPUserID)
      .then(async (result: UploadCompanyRespone) => {
        if (result) {
          this.uploadCompanyResponse = UtilityService.clone(result);
          this.companyDuplicateList = this.uploadCompanyResponse.uploadCompanies;
          this.initCompanyDuplicateList = this.companyProcessedList;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async transferOwnerShip() {
    var isProcessAll: boolean = false;
    if (this.mySelection.length <= 0) {
      this._notifyService.showWarning('Select Contact Before Transfer', 'No Contacts Selected');
      return;
    }
    else {
      this.showSpinner = true;
      await this._contactService.uploadContactTransferOwnerShip(this.encryptedUser, this.uploadSessionId, this.newManagerId, isProcessAll, this.isDuplicateContact ? 1 : 0, this.mySelection)
        .then(async (result: UploadContactBulkActionResponse) => {
          if (result) {
            var res = UtilityService.clone(result);
            this.messageToShowAfter = res.messageString;
            this._notifyService.showSuccess(res.messageString, '', 3000);
            this.isEditField = false;
            this.mySelection = [];
            this.companySelection = [];
            this.transferConfirmation = false;
            this.newManagerId = 0;

          }
          this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }

  }

  async uploadContactUpdateAction(eUploadAction: number) {

    if (this.processGridType === 1) {
      if (this.mySelection?.length <= 0) {
        this._notifyService.showWarning('Select Contact Before Upload', 'No Contacts Selected');
        return;
      }
      else {
        this.showSpinner = true;
        await this._contactService.uploadContactUpdateAction(this.encryptedUser, this.mySelection, this.isDuplicateContact, this.uploadSessionId, 0, eUploadAction)
          .then(async (result: UploadContactBulkActionResponse) => {
            if (result) {
              var res = UtilityService.clone(result);
              this._notifyService.showSuccess(res.messageString, '', 3000);
              this.isEditField = false;
              this.contactsUploaded.length += this.mySelection?.length;
              this.mySelection = [];
              this.companySelection = [];
              this.loadStep4 = true;
              this.messageToShowAfter = res.messageString;
              this.contactGetListProcessed();
              this.contactGetListDuplicate();
            }
            this.showSpinner = false;
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this.showSpinner = false;
            this._utilityService.handleErrorResponse(err);
          });
      }


    }
    else if (this.processGridType === 2) {
      if (this.companySelection?.length <= 0) {
        this._notifyService.showWarning('Select Contact Before Upload', 'No Company Selected');
        return;
      }
      else {
        this.showSpinner = true;
        await this._contactService.uploadCompanyUpdateAction(this.encryptedUser, this.companySelection, this.isDuplicateCompany, this.uploadSessionId, 0, eUploadAction)
          .then(async (result: UploadComppanyBulkActionResponse) => {
            if (result) {
              var res = UtilityService.clone(result);
              this._notifyService.showSuccess(res.messageString, '', 3000);
              this.isEditField = false;
              this.mySelection = [];
              this.companySelection = [];
              this.loadStep4 = true;
              this.messageToShowAfter = res.messageString;
              this.companiesListProcessed();
              this.companiesListDuplicate();
            }
            this.showSpinner = false;
            this.loadStep4 = false;
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this.showSpinner = false;
            this.loadStep4 = false;
            this._utilityService.handleErrorResponse(err);
          });
      }

    }
    else {
      console.log('No Grid Found for contact excel upload')
      this.notifyService.showError('No Grid Found', 'Please select a Table', 2000);
    }

  }

  async dupCheckUploadSummary() {
    this.showSpinner = true;
    await this._contactService.runDupCheckWithUploadSummary(this.encryptedUser, this.user.cLPCompanyID, this.uploadSessionId, this.user.cLPUserID, this.searchScope.toString())
      .then(async (result: UploadContactSummary) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.uploadContactSummary = res;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async contactUploadGetMoreFilters() {
    this.showSpinner = true;
    await this._contactService.contactUploadGetMoreFilters(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: ContactUploadMoreFilters) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.filterManagerTransfer = res.filter_Manager;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async excelStep4Load() {
    if (!this.loadStep4) {
      this._notifyService.showWarning('There are no items to upload.', 'Select Items');
    }
    else {
      this.showSpinner = true;
      await this._contactService.uploadContactProcessStep4Load(this.encryptedUser, this.uploadSessionId, this.user.cLPCompanyID)
        .then(async (result: ProcessStep2Resonse) => {
          if (result) {
            var res = UtilityService.clone(result);
            this.uploadContactSummary = res.uploadContactSummary;
            this.step = 4;
            this.loadStep4 = false;
          }
          this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });

    }


  }

  async step4Upload() {
    this.showSpinner = true;
    await this._contactService.processStep4UploadContacts(this.encryptedUser, this.uploadSessionId, this.user.cLPCompanyID, this.uploadMappingID, this.cbOPtin, 0, this.user.cLPUserID)
      .then(async (result: ProcessStep2Resonse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this._notifyService.showSuccess('Congratulations. Your data has been uploaded successfully.', 'Congratulations!', 3000);
          this.step4Complete = true;
          this.contactsUploaded=[];
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this.step4Complete = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  /* grid*/
  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'contact_excel_process_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('contact_excel_process_grid').subscribe((value) => this.contactGetListProcessed()));
  }
  getCompanyGridConfiguration() {
    this._gridCnfgServiceCompany.columns = this.columnsCmp;
    this._gridCnfgServiceCompany.reorderColumnName = this.reorderColumnNameCmp;
    this._gridCnfgServiceCompany.columnWidth = this.columnWidthCmp;
    this._gridCnfgServiceCompany.arrColumnWidth = this.arrColumnWidthCmp;
    this._gridCnfgServiceCompany.user = this.user;
    this._gridCnfgServiceCompany.getGridColumnsConfiguration(this.user.cLPUserID, 'company_excel_process_grid').subscribe((value) => this._gridCnfgServiceCompany.createGetGridColumnsConfiguration('company_excel_process_grid').subscribe((value) => this.companiesListProcessed()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'contact_excel_process_grid').subscribe((value) => this.getGridConfiguration());
  }
  resetCmpGridSetting() {
    this._gridCnfgServiceCompany.deleteColumnsConfiguration(this.user.cLPUserID, 'company_excel_process_grid').subscribe((value) => this.getCompanyGridConfiguration());
  }

  onContactProcessListFilter(inputValue: string): void {
    this.contactProcessedList = process(this.initContactProcessedList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'name', operator: 'contains', value: inputValue },
          { field: 'address', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  onCompanyProcessListFilter(inputValue: string): void {
    this.companyProcessedList = process(this.initCompanyProcessedList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'companyName', operator: 'contains', value: inputValue },
          { field: 'addressDisplay', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBindingCmp.skip = 0;
  }
  /* grid*/

  handleTagFilter(value) {
    this.tagData = this.tagList.filter(
      (s) => s.text.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
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
  }

  getClassificationData(classifcation: any[]) {
    var strClassification = "";
    if (!isNullOrUndefined(classifcation))
      classifcation.forEach(value => strClassification = strClassification + "" + value)
    return strClassification;
  }

  getActionToTakeData(value: number): string {
    return this.enumActionToTake[value] ? this.enumActionToTake[value] : "";
  }

  showToSuperUser() {
    return this.user?.slurpyUserId > 0 || this.user?.userRole >= eUserRole["SuperUser"] ? true : false;

  }

  cancelTransfer() {
    this.isEditField = false;
    this.transferConfirmation = false;
    this.mySelection = [];
    this.newManagerId = 0;
  }
  cancelSaveContact() {
    this.isEditField = false;
    this.saveConfirmation = false;
    this.uploadEditFieldForm.controls['textValue'].enable();
  }

  preTransferContact() {
    if (!isNullOrUndefined(this.newManagerId)) {
      if (this.newManagerId == 0 || this.mySelection?.length <= 0) {
        this._notifyService.showWarning('Select New Owner and atleast one contact before transfer', 'No Contact or New Owner Selected');
        return;
      }
      else {
        this.transferConfirmation = true;
      }
    }
    else {
      console.log('No manager Id is found')
    }
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
      }

    }
  }

  getDuplicatesOnly() {
    return this.uploadContactSummary?.totDuplicateContacts != null && +this.uploadContactSummary?.totDuplicateContacts > 0;
  }
}
