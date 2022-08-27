import { Component, Input, NgZone, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UniqueURLExistCheck, WebForm, WebFormResponse } from '../../../models/webForm.model';
import { isNullOrUndefined } from 'util';
import { NotificationService } from '../../../services/notification.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { WebformService } from '../../../services/webform.service';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process } from '@progress/kendo-data-query';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { GridColumnsConfigurationService } from '../../../services/gridColumnsConfiguration.service';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { eFeatures } from '../../../models/enum.model';

declare var $: any;

@Component({
  selector: 'webform',
  templateUrl: './webform.component.html',
  styleUrls: ['./webform.component.css'],
  providers: [GridConfigurationService]
})
/** webform component*/
export class WebformComponent {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  showSpinner: boolean = false;
  webFormList: WebForm[] = [];
  webFormListUser: WebForm[] = [];
  initWebFormList: WebForm[] = [];
  webFormData: WebForm;
  pageSize: number = 10;
  isEditWebForm: number = 0;
  inputEdit: boolean = false;

  webForm = new FormGroup({});
  webFormEditMode: boolean;
  autoProcessList: Array<any> = [];
  clpUserList: Array<any> = [];
  roundRobinList: Array<any> = [];
  campaignList: Array<any> = [];
  statusList: Array<any> = [{ key: 1, value: 'Draft' },
  { key: 2, value: 'Self Published' },
  { key: 3, value: 'Published By salesoptima' }
  ];
  userResponse: UserResponse;
  columns = [
    { field: 'formName', title: 'Form Name', width: '150' },
    { field: 'link', title: 'Link Code', width: '100' },
    { field: 'cTCampaignTemplateID', title: 'Campaign Trigger Settings', width: '200' },
    { field: 'allowDuplicates', title: 'Dupicates', width: '60' },
    { field: 'cLPUserID', title: 'Default Owners', width: '60' },
    { field: 'status', title: 'Status', width: '60' },
    { field: 'dtCreated', title: 'Created', width: '60' },
    { field: 'dupsActivateCampaign:h', title: '', width: '' },
    { field: 'cTCLPUserID:h', title: '', width: '' },
  ];
  reorderColumnName: string = 'formName,link,cTCampaignTemplateID,allowDuplicates,cLPUserID,status,dtCreated';
  sortingColumn: string = '';
  columnWidth: string = 'formName:150,link:100,cTCampaignTemplateID:200,allowDuplicates:60,cLPUserID:60,status:60,dtCreated:60';
  arrColumnWidth: any[] = ['formName:150,link:100,cTCampaignTemplateID:200,allowDuplicates:60,cLPUserID:60,status:60,dtCreated:60'];
  webFormResponse: WebFormResponse;
  gridHeight;
  isCopied: boolean = false;
  isEditWebFrm: boolean = false;
    mobileColumnNames: string[];


  constructor(private _webFormSvc: WebformService, public _gridCnfgService: GridConfigurationService, private fb: FormBuilder, private _localService: LocalService, private _router: Router, private _utilityService: UtilityService, private _notifyService: NotificationService, public _gridColumnsConfigurationService: GridColumnsConfigurationService, private _ngZone: NgZone) {
    this.gridHeight = this._localService.getGridHeight('432px');
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.webForm = this.prepareWebForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this.getGridConfiguration();
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.WebForm)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            this._gridCnfgService.user = this.user;
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
  getGridConfiguration() {
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'webform_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('webform_grid').subscribe((value) => this.getWebFormData()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'webform_grid').subscribe((value) => this.getGridConfiguration());
  }

  prepareWebForm() {
    return this.fb.group({
      formName: [{ value: '' }, [Validators.required]],
      campaignID: [{ value: '' }],
      cLPUserID: [{ value: '' }],
      duplicateCampaignID: [{ value: '' }],
      useCTSettings: [{ value: '' }],
      cTAction: [{ value: '' }],
      cTCampaignTemplateID: new FormControl(0),
      cTCLPUserID: new FormControl(0),
      duplicateCTAction: [{ value: '' }],
      duplicateCTCampaignTemplateID: new FormControl(0) ,
      duplicateCTCLPUserID: new FormControl(0),
      allowDuplicates: [{ value: '' }],
      dupsActivateCampaign: [{ value: '' }],
      hTMLText: [{ value: '' }],
      otherPublishLink: [{ value: '' }],
      status: [{ value: '' }],
      alertStatus: [{ value: '' }],
      roundRobinID: [{ value: '' }],
      blnExists: [{ value: '' }],
      jSONText: [{ value: '' }],
      isUseBee: [{ value: '' }]
    });
  }

  async getWebFormData() {
    this.showSpinner = true;
    await this._webFormSvc.getWebForm(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: WebFormResponse) => {
        if (result) {
          this.webFormResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('webform_grid');
            this._gridCnfgService.iterateConfigGrid(this.webFormResponse, "webform_grid");
          }
       

          this.webFormList = this.webFormResponse.webForm;
          this.initWebFormList = this.webFormResponse.webForm;
          this.webFormListUser = this.webFormResponse.webForm;
          this.roundRobinList = this.webFormResponse.roundRobins;
          this.clpUserList = this.webFormResponse.cLPuser;
          this.autoProcessList = this.webFormResponse.CampaignTemplates;
          this.webForm = this.prepareWebForm();
          this.webForm.reset();

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

  get webFormFrm() {
    return this.webForm.controls;
  }

  async getWebFormGridData() {
    this.showSpinner = true;
    await this._webFormSvc.getWebFormGrid(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: WebFormResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.webFormList = result.webForm;
          this.initWebFormList = result.webForm;
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


  viewWebForm() {
    this.getWebFormGridData();
  }

  createWebFormUser() {
    this.isCopied = false;
    this.isEditWebForm = 1;
    this.webFormEditMode = true;
    this.webFormData = {
      webFormID: 0,
      cLPCompanyID: this.user.cLPCompanyID,
      formName: 'New Form',
      link: '',
      cLPUserID: this.user.cLPUserID,
      campaignID: 0,
      duplicateCampaignID: 0,
      useCTSettings: false,
      cTAction: 0,
      cTCampaignTemplateID: 0,
      cTCLPUserID: 0,
      duplicateCTAction: 0,
      duplicateCTCampaignTemplateID: 0,
      duplicateCTCLPUserID: 0,
      allowDuplicates: false,
      dupsActivateCampaign: false,
      hTMLText: '',
      otherPublishLink: '',
      status: 1,
      alertStatus: false,
      roundRobinID: 0,
      dtModified: new Date(),
      dtCreated: new Date(),
      blnExists: false,
      jSONText: '',
      isUseBee: false,
    }
    this.webForm.enable();
    this.patchWebFormValue();
  }

  onWebFormListFilter(inputValue: string): void {
    this.webFormList = process(this.initWebFormList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'formName', operator: 'contains', value: inputValue },
          { field: 'link', operator: 'contains', value: inputValue },
          { field: 'cTCampaignTemplateID', operator: 'contains', value: inputValue },
          { field: 'cLPUserID', operator: 'contains', value: inputValue },
          { field: 'status', operator: 'contains', value: inputValue },
          { field: 'dtCreated', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  editWebForm(dataItem: WebForm) {
    this.webFormData = dataItem;
    this.isEditWebFrm = true;
    this.isEditWebForm = 2;
    this.webFormEditMode = false;
    this.getWebFormLoad(dataItem.webFormID);
  }

  editCopyWebForm() {
    this.webFormData.webFormID = 0;
    this.webFormData.formName += ' copy';
    this.patchWebFormValue();
    this.editModeForm();
  }

  patchWebFormValue() {
    var webFormDt = this.webFormData;
    for (let key in webFormDt) {
      let value;
      switch (key) {
        case 'cTAction': case 'duplicateCTAction':
          value = '' + webFormDt[key];
          break;
        default:
          value = webFormDt[key];
      }
      this.preparePatchFormControlValue(key, value);
    }

    var cLPUserObj = this.clpUserList?.filter((data) => data.cLPUserID === this.webFormData.cLPUserID)[0];
    if (!isNullOrUndefined(cLPUserObj))
      this.webForm.get('cLPUserID').setValue(cLPUserObj.cLPUserID);
    else
      this.webForm.get('cLPUserID').setValue(0);

    var roundRobinObj = this.roundRobinList?.filter((data) => data.roundRobinID === this.webFormData.roundRobinID)[0];
    if (!isNullOrUndefined(roundRobinObj))
      this.webForm.get('roundRobinID').setValue(roundRobinObj.roundRobinID);
    else
      this.webForm.get('roundRobinID').setValue("");


    var autoProcessObj = this.autoProcessList?.filter((data) => data.campaignTemplateID === this.webFormData.cTCampaignTemplateID)[0];
    if (!isNullOrUndefined(autoProcessObj))
      this.webForm.get('cTCampaignTemplateID').setValue(autoProcessObj.campaignTemplateID);
    else
      this.webForm.get('cTCampaignTemplateID').setValue(0);

    var autoProcessObj = this.autoProcessList?.filter((data) => data.campaignTemplateID === this.webFormData.duplicateCTCampaignTemplateID)[0];
    if (!isNullOrUndefined(autoProcessObj))
      this.webForm.get('duplicateCTCampaignTemplateID').setValue(autoProcessObj.campaignTemplateID);
    else
      this.webForm.get('duplicateCTCampaignTemplateID').setValue(0);

    var clpUserObj = this.clpUserList?.filter((data) => data.cLPUserID === this.webFormData.cTCLPUserID)[0];
    if (!isNullOrUndefined(clpUserObj))
      this.webForm.get('cTCLPUserID').setValue(clpUserObj.cLPUserID);
    else
      this.webForm.get('cTCLPUserID').setValue(0);

    var clpUserObj = this.clpUserList?.filter((data) => data.cLPUserID === this.webFormData.duplicateCTCLPUserID)[0];
    if (!isNullOrUndefined(clpUserObj))
      this.webForm.get('duplicateCTCLPUserID').setValue(clpUserObj.cLPUserID);
    else
      this.webForm.get('duplicateCTCLPUserID').setValue(0);

    var statusObj = this.statusList?.filter((data) => data.key === this.webFormData.status)[0];
    if (!isNullOrUndefined(statusObj))
      this.webForm.get('status').setValue(statusObj.key);
    else
      this.webForm.get('status').setValue("");


  }

  preparePatchFormControlValue(key, value) {
    if (this.webForm.get(key))
      this.webForm.get(key).setValue(value);
  }

  editModeForm() {
    this.isEditWebForm = 1;
    this.webFormEditMode = true;
    this.webForm.enable();
  }

  copyValueFromWebFormToData() {
    this.webFormData.cLPCompanyID = this.user.cLPCompanyID;
    this.webFormData.cLPUserID = +this.webForm.controls.cLPUserID.value;
    this.webFormData.formName = this.webForm.controls.formName.value;
    this.webFormData.campaignID = this.webForm.controls.campaignID.value;
    this.webFormData.duplicateCampaignID = this.webForm.controls.duplicateCampaignID.value;
    this.webFormData.useCTSettings = this.webForm.controls.useCTSettings.value;
    this.webFormData.cTAction = +this.webForm.controls.cTAction.value;
    this.webFormData.cTCampaignTemplateID = +this.webForm.controls.cTCampaignTemplateID.value;
    this.webFormData.cTCLPUserID = +this.webForm.controls.cTCLPUserID.value;
    this.webFormData.duplicateCTAction = +this.webForm.controls.duplicateCTAction.value;
    this.webFormData.duplicateCTCampaignTemplateID = +this.webForm.controls.duplicateCTCampaignTemplateID.value;
    this.webFormData.duplicateCTCLPUserID = +this.webForm.controls.duplicateCTCLPUserID.value;
    this.webFormData.allowDuplicates = this.webForm.controls.allowDuplicates.value;
    this.webFormData.dupsActivateCampaign = this.webForm.controls.allowDuplicates.value ? false : this.webForm.controls.dupsActivateCampaign.value;
    this.webFormData.hTMLText = this.webForm.controls.hTMLText.value ? this.webForm.controls.hTMLText.value : '';
    this.webFormData.otherPublishLink = this.webForm.controls.otherPublishLink.value;
    this.webFormData.status = +this.webForm.controls.status.value;
    this.webFormData.alertStatus = this.webForm.controls.alertStatus.value;
    this.webFormData.blnExists = this.webForm.controls.blnExists.value;
    this.webFormData.jSONText = this.webForm.controls.jSONText.value;
    this.webFormData.roundRobinID = +this.webForm.controls.roundRobinID.value;
    this.webFormData.isUseBee = this.webForm.controls.isUseBee.value;
  }

  webFormSubmit() {
    this._localService.validateAllFormFields(this.webForm);
    if (this.webForm.valid) {
      this.webForm.markAsPristine();
      this.updateWebForm();
    }
    else
      this._notifyService.showError("Invalid WebForm Fields", "", 3000);

  }

  updateWebForm() {
    this.copyValueFromWebFormToData();
    this.showSpinner = true;
    this._webFormSvc.saveWebForm(this.encryptedUser, this.webFormData)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "WebForm updated Successfully.", "", 3000);
          this.webForm.reset();
          this.webForm.markAsPristine();
          this.webForm.markAsUntouched();
          this.showSpinner = false;
          this.getWebFormLoad(response.messageInt > 1 ? response.messageInt : this.webFormData.webFormID);
          this.isEditWebForm = 2;
          this.webFormEditMode = false;
          this.isCopied = false;
          this.webForm.disable();

        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.webFormEditMode = false;
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }


  async getWebFormLoad(webFormId: number) {
    this.showSpinner = true;
    await this._webFormSvc.getWebFormLoad(this.encryptedUser, webFormId)
      .then(async (result: WebForm) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.webFormData = result;
          this.patchWebFormValue();

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

  defaultListWebForm() {
    this.isCopied = false;
    this.isEditWebForm = 0;
    this.getWebFormData();
  }

  convertStatusToView(status) {
   
    if (!isNullOrUndefined(status)) {
      let statusSelected = this.statusList.filter((data) => data.key === status)[0];
      return statusSelected ? statusSelected.value : null;
    }
  }

  convertCapaignTriggerToView(id) {
    let campaignTriggerSelected = this.autoProcessList.filter((data) => data.campaignTemplateID === id)[0];
    return campaignTriggerSelected ? campaignTriggerSelected.campaignTemplateName : null;

  }

  getCtUserName(id) {
    let userSelected = this.clpUserList.filter((data) => data.cLPUserID === id)[0];
    return userSelected ? userSelected.fullName : null;
  }

  getRounRobinName(id) {
    let robinName = this.roundRobinList.filter((data) => data.roundRobinID === id)[0];
    return robinName ? robinName.roundRobinName : null;
  }

  async deleteWebForm() {
    this.showSpinner = true;
    await this._webFormSvc.webFormDelete(this.encryptedUser, this.webFormData.webFormID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "WebForm Deleted Successfully.", "", 3000);
          this.getWebFormData();
          this.isEditWebForm = 0;
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

  copyInputMessage(val: string) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  async checkUniqueUrl() {
    if (this.webForm.controls.otherPublishLink.value.length <= 0)
      return;

    var uiqueUrlObject: UniqueURLExistCheck = {
      webFormIDToExclude: this.webFormData.webFormID,
      uniqueURLName: this.webForm.controls.otherPublishLink.value
    };
    this.showSpinner = true;
    await this._webFormSvc.webFormIsUniqueURLExist(this.encryptedUser, uiqueUrlObject)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this.showSpinner = false;
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Unique URL name is available..", "", 10000);
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

  goToUserProfile(dataItem) {
    this._router.navigate(['/edit-profile', dataItem.cLPUserID]);
  }

  saveTopWeb() {
    $("#primarySaveWeb").click();
  }
}
