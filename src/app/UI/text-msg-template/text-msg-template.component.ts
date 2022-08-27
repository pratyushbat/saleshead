import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { AngularFileUploaderComponent } from 'angular-file-uploader';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../models/enum.model';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';
import { process } from '@progress/kendo-data-query';
import { keyValue } from '../../models/search.model';
import { TxtMsgTemplate, TxtMsgTemplateResponse } from '../../models/textMsgTemplate.model';
import { GridColumnsConfigurationService } from '../../services/gridColumnsConfiguration.service';
import { NotificationService } from '../../services/notification.service';
import { GridConfigurationService } from '../../services/shared/gridConfiguration.service';
import { LocalService } from '../../services/shared/local.service';
import { UtilityService } from '../../services/shared/utility.service';
import { TextMsgTemplateService } from '../../services/text-msg-template.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SimpleResponse } from '../../models/genericResponse.model';

declare var $: any;

@Component({
  selector: 'app-text-msg-template',
  templateUrl: './text-msg-template.component.html',
  styleUrls: ['./text-msg-template.component.css'],
  providers: [GridConfigurationService]
})
export class TextMsgTemplateComponent {
  gridHeight;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  textMsgTemplateResponse: TxtMsgTemplateResponse;
  textMsgTemplateList: TxtMsgTemplate[];
  textMsgTemplateData = <TxtMsgTemplate>{};
  public userList: keyValue[];
  initTextMsgTemplateList: TxtMsgTemplate[];
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  isEnableEdit: boolean = false;
  isPreview: boolean = false;
  isShowGrid: boolean = true;
  isDeleteEnable: boolean = false;
  public isShowImage: boolean = true;
  user: CLPUser;
  selectedValue: number = 0;
  selectedUserId: number;
  selectedUserName: string;
  strisAdvanced: string = '%20';
  filterData = [];

  columns = [{ field: '$', title: '', width: '20' },
  { field: 'templateName', title: 'Template Name', width: '120' },
  { field: 'messageText', title: 'Message Text', width: '300' },
  { field: 'userName', title: 'User', width: '40' },
  { field: 'shareable', title: 'Sharing', width: '40' },
  { field: 'dtCreated', title: 'Created', width: '30' },];
  reorderColumnName: string = 'templateName,messageText,userName,shareable,dtCreated';
  columnWidth: string = 'templateName:200,messageText:200,userName:40,shareable:40,dtCreated:40';
  arrColumnWidth: any[] = ['templateName:200,messageText:200,userName:40,shareable:40,dtCreated:40'];

  contactDocConfig;
  baseUrl: string;
  @ViewChild('imageUpload')
  private imageUpload: AngularFileUploaderComponent;
  textMsgForm: FormGroup;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  mobileColumnNames: string[];
  constructor(public _gridCnfgService: GridConfigurationService,
    @Inject('BASE_URL') _baseUrl: string,
    private _notifyService: NotificationService,
    private fb: FormBuilder,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router,
    private sanitizer: DomSanitizer,
    private _textMsgTemplateService: TextMsgTemplateService,
    public _gridColumnsConfigurationService: GridColumnsConfigurationService) {
    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('493px');
    this.baseUrl = _baseUrl;
  }
  apiResponse(event) {
    if (!isNullOrUndefined(event.body)) {
      this.textMsgForm.get('mediaURL').setValue(event.body.messageString2);
    }
  }
  ngOnInit(): void {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getGridConfiguration();
          this.selectedUserId = this.user.cLPUserID;
        }
        else
          this._router.navigate(['/login']);

      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.TextMessageTemplates)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this._gridCnfgService.user = this.user;
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

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'text_msg_template_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('text_msg_template_grid').subscribe((value) => this.getTextMsgList()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'text_msg_template_grid').subscribe((value) => this.getGridConfiguration());
  }

  prepareTextMsgForm() {
    return this.fb.group({
      templateName: new FormControl('', [Validators.required]),
      messageText: new FormControl(''),
      mediaURL: new FormControl(''),
      userName: new FormControl(''),
      shareable: new FormControl(false),
      cLPUserid: new FormControl(this.user.cLPUserID),
    });
  }

  async getTextMsgList() {
    this.showSpinner = true;
    this.isEnableEdit = false;
    await this._textMsgTemplateService.getTextMsgTemplateList(this.encryptedUser, this.user.cLPCompanyID, this.selectedUserId, this.strisAdvanced)
      .then(async (result: TxtMsgTemplateResponse) => {
        if (result) {
          this.textMsgTemplateResponse = UtilityService.clone(result);
          this.textMsgTemplateList = this.textMsgTemplateResponse.txtMsgTemplateList;
          this.userList = this.textMsgTemplateResponse.filterUser;
          this.initTextMsgTemplateList = this.textMsgTemplateList;
          this.textMsgForm = this.prepareTextMsgForm();
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('text_msg_template_grid');
            this._gridCnfgService.iterateConfigGrid(this.textMsgTemplateList, "text_msg_template_grid");
          }

          this.userList.forEach(item => {
            item.value = item.value.replace(' ', ', ');
          })
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  getTextMsgListByUser(userId) {
    this.selectedUserId = userId;
    this.getTextMsgList();
  }

  copytextMsgFormValueToData() {
    this.textMsgTemplateData.cLPCompanyID = this.user.cLPCompanyID;
    this.textMsgTemplateData.cLPUserid = this.textMsgForm.controls.cLPUserid.value;
    this.textMsgTemplateData.templateName = this.textMsgForm.controls.templateName.value;
    this.textMsgTemplateData.messageText = this.textMsgForm.controls.messageText.value;
    this.textMsgTemplateData.shareable = this.textMsgForm.controls.shareable.value;
    this.textMsgTemplateData.mediaURL = this.textMsgForm.controls.mediaURL.value;
    this.textMsgTemplateData.dtCreated = new Date();
    this.textMsgTemplateData.dtModified = new Date();
    this.filterData = this.userList.filter((data) => data.key == this.textMsgForm?.controls.cLPUserid.value);
    this.textMsgTemplateData.userName = this.filterData[0].value;
  }

  async updateTextMsgData() {
    this.textMsgForm.controls.templateName.markAsTouched();
    if (this.textMsgForm.valid) {
      this.showSpinner = true;
      this.copytextMsgFormValueToData();
      await this._textMsgTemplateService.saveTextMsgTemplate(this.encryptedUser, this.selectedValue, this.textMsgTemplateData)
        .then(async (result: SimpleResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.showSpinner = false;
            this.textMsgTemplateData.txtMsgTemplateID = response?.messageInt;
            this.getTextMsgList();
            this.isEnableEdit = false;
            this.isPreview = true;
          }
          else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
          this.showSpinner = false;
        });
    }
  }

  async textMsgDelete() {
    this.showSpinner = true;
    await this._textMsgTemplateService.textMsgTemplateDelete(this.encryptedUser, this.textMsgTemplateData.txtMsgTemplateID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Text Message Template Delete Successfully.", "", 3000);
          this.getTextMsgList();
          this.isEnableEdit = false;
          this.isDeleteEnable = false;
          this.isPreview = false;
          this.isShowGrid = true;
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
  }

  patchFormControlValue(dataItem) {
    var textMsgTemplateData = dataItem;
    for (let key in textMsgTemplateData) {
      let value = textMsgTemplateData[key];
      if (this.textMsgForm.get(key))
        this.textMsgForm.get(key).setValue(value);
    }
  }

  showTextMsgData(dataItem) {
    this.getTextMsgConfig();
    if ($(window).width() < 768)
      this.contactDocConfig.theme = '';
    this.textMsgTemplateData = dataItem;
    this.isPreview = true;
    this.isShowGrid = false;
    this.selectedUserName = dataItem.userName;
  }

  editTextMsgData() {
    this.patchFormControlValue(this.textMsgTemplateData);
    this.isEnableEdit = true;
    this.isPreview = false;
    this.isShowGrid = false;
    this.isDeleteEnable = true;
  }
  saveAsTextMsg() {
    this.editTextMsgData()
    this.textMsgForm.get('templateName').setValue('Copy of ' + this.textMsgForm.controls.templateName.value);
    this.textMsgTemplateData.txtMsgTemplateID = 0;
    this.isDeleteEnable = false;
  }

  backToList() {
    this.isEnableEdit = false;
    this.isPreview = false;
    this.isShowGrid = true;
    this.isDeleteEnable = false;
  }

  getTextMsgConfig() {
    this.contactDocConfig = {
      theme: 'dragNDrop',
      hideResetBtn: true,
      hideSelectBtn: false,
      maxSize: 10,
      uploadAPI: {
        url: this.baseUrl + 'api/TxtMsgTemplate/Upload_File/' + this.user.cLPCompanyID + '/' + this.user.cLPUserID,
        headers: {
        },
      },
      formatsAllowed: '.jpg, .png, .eps, .jpeg, .gif',
      multiple: false,
      replaceTexts: {
        selectFileBtn: 'Select Image',
        resetBtn: 'Reset',
        uploadBtn: 'Upload',
        afterUploadMsg_success: 'Successfully Uploaded!',
        afterUploadMsg_error: 'Upload Failed!',
      }
    };
  }
  addNew() {
    this.isEnableEdit = true;
    this.isShowImage = true;
    this.isPreview = false;
    this.isShowGrid = false;
    this.isDeleteEnable = false;
    this.getTextMsgConfig();
    if ($(window).width() < 768)
      this.contactDocConfig.theme = '';
    this.textMsgTemplateData.txtMsgTemplateID = 0;
    this.textMsgForm = this.prepareTextMsgForm();
  }
  cancelTextMsg() {
    this.isEnableEdit = false;
    if (this.textMsgTemplateData.txtMsgTemplateID == 0) {
      this.isPreview = false;
      this.isShowGrid = true;
    }
    else {
      this.isPreview = true;
      this.isShowGrid = false;
    }
  }


  onTextMsgFilter(inputValue: string): void {
    this.textMsgTemplateList = process(this.initTextMsgTemplateList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'templateName', operator: 'contains', value: inputValue },
          { field: 'messageText', operator: 'contains', value: inputValue },
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
}
