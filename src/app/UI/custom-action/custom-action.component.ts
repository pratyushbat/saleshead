import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../models/clpuser.model';
import { process } from '@progress/kendo-data-query';
import { eFeatures, eUserRole } from '../../models/enum.model';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';
import { GridColumnsConfigurationService } from '../../services/gridColumnsConfiguration.service';
import { GridConfigurationService } from '../../services/shared/gridConfiguration.service';
import { LocalService } from '../../services/shared/local.service';
import { UtilityService } from '../../services/shared/utility.service';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomActionService } from '../../services/custom-action.service';
import { CustomActionButtonResponse, CustomActionDD, CustomActionDDResponse, CustomActionScreen, CustomActionScreenResponse, CustomActionUser, CustomButton } from '../../models/customAction.model';
import { NotificationService } from '../../services/notification.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ClickTemplate, filterUser } from '../../models/clickTracking.model';
import { keyValue } from '../../models/search.model';
import { AutomationProcessDD, CustomActionScreenDD, LoadAutomationProcessDD, LoadCustomActionButton, RddEmailTemplateDD } from '../../models/campaignTemplate.model';
@Component({
  selector: 'app-custom-action',
  templateUrl: './custom-action.component.html',
  styleUrls: ['./custom-action.component.css'],
  providers: [GridConfigurationService]
})
export class CustomActionComponent {
  gridHeight;
  private encryptedUser: string = '';
  user: CLPUser;
  customActionResponse: CustomActionScreenResponse;
  customActionDataList: CustomActionScreen[];
  initCustomActionDataList: CustomActionScreen[];
  customActionUser: CustomActionUser[];
  customActionData: CustomActionScreen;
  customActionButtonList: CustomButton[] = [];
  customActionButtonData: CustomButton;
  initCustomActionUser: CustomActionUser;
  customActionDropdownResponse: LoadCustomActionButton;
  customActionDdItemList: CustomActionDD[];
  customActionDdItemData: CustomActionDD;
  public AutomationProcessDDResponse: LoadAutomationProcessDD[] = [];
  public customActionAutomationProcessDD: AutomationProcessDD[];
  public clickUser: keyValue[];
  public emailTemplate: RddEmailTemplateDD[];
  public customActionScreenDd: CustomActionScreenDD[];
  searchTitle: string = null;
  primarySecondary: string = 'Secondary';

  userResponse: UserResponse;
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  isEnableEdit: boolean = false;
  isDeleteEnable: boolean = false;
  isShowCustom: boolean = false;
  isShowButton: boolean = false;
  isShowDropdown: boolean = false;
  isEditDropdown: boolean = false;
  isPreviewButton: boolean = false;
  isAddItemDropDown: boolean = false;
  isPreviewDDItem: boolean = false;
  selectedUserId: number;
  columns = [{ field: '$', title: '', width: '40' },
  { field: 'formName', title: 'Name', width: '170' },
  { field: 'showEditContactLink', title: 'Show Edit Contact Button', width: '60' },
  { field: 'showAddToComments', title: 'Show Add To Comments Text Box', width: '60' },
  { field: 'showAddToHistory', title: 'Show Add To History Button', width: '60' },
  { field: 'bulkAppt', title: 'Bulk Appt', width: '30' },
  { field: 'user', title: 'User', width: '30' },
  { field: 'dtCreated', title: 'Created', width: '30' },
  ];
  reorderColumnName: string = 'formName,showEditContactLink,showAddToComments,showAddToHistory,bulkAppt,user,dtCreated';
  columnWidth: string = 'formName:170,showEditContactLink:60,showAddToComments:60,showAddToHistory:60,bulkAppt:30,user:30,dtCreated:30';
  arrColumnWidth: any[] = ['formName:170,showEditContactLink:60,showAddToComments:60,showAddToHistory:60,bulkAppt:30,user:30,dtCreated:30'];
  customActionForm: FormGroup;
  customActionButtonForm: FormGroup;
  customActionDropdownForm: FormGroup;
  customActionDdItemForm: FormGroup;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  mobileColumnNames: string[];
  constructor(public _gridCnfgService: GridConfigurationService,
    public _localService: LocalService,
    private _notifyService: NotificationService,
    private fb: FormBuilder,
    private _utilityService: UtilityService,
    private _customActionService: CustomActionService,
    private _router: Router,
    public _gridColumnsConfigurationService: GridColumnsConfigurationService) {
    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('493px');
  }

  ngOnInit(): void {
    this.customActionForm = this.prepareCustomActionForm();
    this.customActionButtonForm = this.prepareCustomActionButtonForm();
    this.customActionDropdownForm = this.prepareCustomActionButtonForm();
    this.customActionDdItemForm = this.prepareCustomActionDdItemForm();
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
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.CustomsActionScreens)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this._gridCnfgService.user = this.user;
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
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'custom_action_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('custom_action_grid').subscribe((value) => this.getCustomActionList()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'custom_action_grid').subscribe((value) => this.getGridConfiguration());
  }

  prepareCustomActionForm() {
    return this.fb.group({
      formName: new FormControl('', [Validators.required]),
      showEditContactLink: new FormControl(false),
      showAddToComments: new FormControl(false),
      showAddToHistory: new FormControl(false),
      cLPUserID: new FormControl(0)
    });
  }
  prepareCustomActionButtonForm() {
    return this.fb.group({
      buttonText: new FormControl('', [Validators.required]),
      instructions: new FormControl(''),
      foreColor: new FormControl('#ffffff'),
      isFontBold: new FormControl(false),
      fontSize: new FormControl(12),
      backColor: new FormControl('#0070c0'),
      height: new FormControl(30),
      width: new FormControl(200),
      ctClpUserId: new FormControl(0),
      ctCampaignTemplateId: new FormControl(0),
      secCtClpUserId: new FormControl(0),
      secCtCampaignTemplateId: new FormControl(0),
      setApptStatus: new FormControl(0),
      customActionScreenId: new FormControl(0),
      nextCustomActionScreenId: new FormControl(0),
      destinationUrl: new FormControl(''),
    });
  }
  prepareCustomActionDdItemForm() {
    return this.fb.group({
      itemText: new FormControl('', [Validators.required]),
      clClpUserId: new FormControl(0),
      ctCampaignTemplateId: new FormControl(0),
      secCtClpUserId: new FormControl(0),
      secCtCampaignTemplateId: new FormControl(0),
      setApptStatus: new FormControl(0),
      customActionScreenId: new FormControl(0),
      nextCustomActionScreenId: new FormControl(0),
      destinationUrl: new FormControl(''),
    });
  }

  patchFormControlValue() {
    var customActionData = this.customActionData;
    for (let key in customActionData) {
      let value = customActionData[key];
      if (this.customActionForm.get(key))
        this.customActionForm.get(key).setValue(value);
    }
    if (customActionData.cLPUserID == 0)
      this.customActionForm.get('cLPUserID').setValue(this.user.cLPUserID);
    if (this.customActionData.customActionScreenID != 0) {
      this.initCustomActionUser = this.customActionUser.filter((data) => data.cLPUserID === this.customActionData.cLPUserID)[0];
      this.customActionData.firstName = this.initCustomActionUser?.firstName;
      this.customActionData.lastName = this.initCustomActionUser?.lastName;
    }
  }
  patchButtonFormControlValue(formName: string) {
    var customActionButtonData = this.customActionButtonData;
    switch (formName) {
      case 'customActionButtonForm':
        for (let key in customActionButtonData) {
          let value = customActionButtonData[key];
          if (this.customActionButtonForm.get(key))
            this.customActionButtonForm.get(key).setValue(value);
        }
        break;
      case 'customActionDropdownForm':
        for (let key in customActionButtonData) {
          let value = customActionButtonData[key];
          if (this.customActionDropdownForm.get(key))
            this.customActionDropdownForm.get(key).setValue(value);
        }
        this.getCustomActionDropdownItemList();
        break;
    }

  }
  patchDdItemFormControlValue() {
    var customActionDdItemData = this.customActionDdItemData;
    for (let key in customActionDdItemData) {
      let value = customActionDdItemData[key];
      if (this.customActionDdItemForm.get(key))
        this.customActionDdItemForm.get(key).setValue(value);
    }
  }
  copyCustomActionFormValueToData() {
    this.customActionData.cLPUserID = this.customActionForm.controls.cLPUserID.value;
    this.customActionData.cLPCompanyID = this.user.cLPCompanyID;
    this.customActionData.showEditContactLink = this.customActionForm.controls.showEditContactLink.value;
    this.customActionData.showAddToComments = this.customActionForm.controls.showAddToComments.value;
    this.customActionData.showAddToHistory = this.customActionForm.controls.showAddToHistory.value;
    this.customActionData.formName = this.customActionForm.controls.formName.value;
    this.customActionData.dtCreated = new Date();
    this.customActionData.dtModified = new Date();
  }
  copyCustomActionButtonFormValueToData() {
    this.customActionButtonData.clpCompanyId = this.user.cLPCompanyID;
    this.customActionButtonData.customActionScreenId = this.customActionData.customActionScreenID;
    this.customActionButtonData.buttonText = this.customActionButtonForm.controls.buttonText.value;
    this.customActionButtonData.instructions = this.customActionButtonForm.controls.instructions.value;
    this.customActionButtonData.foreColor = this.customActionButtonForm.controls.foreColor.value;
    this.customActionButtonData.isFontBold = this.customActionButtonForm.controls.isFontBold.value;
    this.customActionButtonData.fontSize = this.customActionButtonForm.controls.fontSize.value;
    this.customActionButtonData.backColor = this.customActionButtonForm.controls.backColor.value;
    this.customActionButtonData.height = this.customActionButtonForm.controls.height.value;
    this.customActionButtonData.width = this.customActionButtonForm.controls.width.value;
    this.customActionButtonData.ctCampaignTemplateId = this.customActionButtonForm.controls.ctCampaignTemplateId.value;
    this.customActionButtonData.ctClpUserId = this.customActionButtonForm.controls.ctClpUserId.value;
    this.customActionButtonData.secCtCampaignTemplateId = this.customActionButtonForm.controls.secCtCampaignTemplateId.value;
    this.customActionButtonData.secCtClpUserId = this.customActionButtonForm.controls.secCtClpUserId.value;
    this.customActionButtonData.setApptStatus = this.customActionButtonForm.controls.setApptStatus.value;
    this.customActionButtonData.nextCustomActionScreenId = this.customActionButtonForm.controls.nextCustomActionScreenId.value;
    this.customActionButtonData.destinationUrl = this.customActionButtonForm.controls.destinationUrl.value;
  }
  copyCustomActionDropdpownFormValueToData() {
    this.customActionButtonData.clpCompanyId = this.user.cLPCompanyID;
    this.customActionButtonData.customActionScreenId = this.customActionData.customActionScreenID;
    this.customActionButtonData.instructions = this.customActionDropdownForm.controls.instructions.value;
    this.customActionButtonData.buttonText = 'Custom Dropdown';
    this.customActionButtonData.foreColor = '#ffffff';
    this.customActionButtonData.backColor = '#0070c0';
    this.customActionButtonData.fontSize = 12;
    this.customActionButtonData.height = 30;
    this.customActionButtonData.width = 200;

  }
  copyCustomActionDdItemFormValueToData() {
    this.customActionDdItemData.itemText = this.customActionDdItemForm.controls.itemText.value;
    this.customActionDdItemData.customActionButtonId = this.customActionButtonData.customActionButtonId;
    this.customActionDdItemData.customActionDdItemId = this.customActionDdItemData.customActionDdItemId;
    this.customActionDdItemData.ctCampaignTemplateId = this.customActionDdItemForm.controls.ctCampaignTemplateId.value;
    this.customActionDdItemData.clClpUserId = this.customActionDdItemForm.controls.clClpUserId.value;
    this.customActionDdItemData.secCtCampaignTemplateId = this.customActionDdItemForm.controls.secCtCampaignTemplateId.value;
    this.customActionDdItemData.secCtClpUserId = this.customActionDdItemForm.controls.secCtClpUserId.value;
    this.customActionDdItemData.setApptStatus = this.customActionDdItemForm.controls.setApptStatus.value;
    this.customActionDdItemData.nextCustomActionScreenId = this.customActionDdItemForm.controls.nextCustomActionScreenId.value;
    this.customActionDdItemData.destinationUrl = this.customActionDdItemForm.controls.destinationUrl.value;
  }
  addNew(iconSelect: number) {
    this.isEnableEdit = true;
    this.isDeleteEnable = false;
    this.isShowCustom = false;
    if (iconSelect == 0) {
      this.getCustomActionLoad(0);
      this.customActionForm = this.prepareCustomActionForm();
    }
    else {
      this.customActionForm.get('formName').setValue(this.user.firstName + '-' + this.customActionForm.controls.formName.value);
      this.customActionData.customActionScreenID = 0;
    }
  }
  public cancelRep() {
    if (this.customActionData?.customActionScreenID == 0)
      this.isShowCustom = false;
    else
      this.isShowCustom = true;
    this.isDeleteEnable = false;
    this.isEnableEdit = false;
    this.isEnableEdit = false;
    this.isDeleteEnable = false;
    this.isShowButton = false;
    this.isShowDropdown = false;
    this.isEditDropdown = false;
    this.isAddItemDropDown = false;
  }
  public cancelCustom() {
    this.isDeleteEnable = false;
    this.isEnableEdit = false;
    this.isShowCustom = false;
  }
  editCustomData() {
    this.isDeleteEnable = true;
    this.isEnableEdit = true;
    this.isShowCustom = false;
  }
  async showCustomData(dataItem) {
    await this.getCustomActionLoad(dataItem.customActionScreenID);
    this.getCustomActionButtonList();
    this.isEnableEdit = true;
    this.isShowCustom = true;
    this.isShowButton = false;
    this.isShowDropdown = false;
  }
  get customActionFrm() {
    return this.customActionForm.controls;
  }

  getCustomActionByUser(userId) {
    this.selectedUserId = userId;
    this.getCustomActionList();
  }

  async getCustomActionList() {
    this.showSpinner = true;
    this.isEnableEdit = false;
    await this._customActionService.getCustomActionList(this.encryptedUser, this.user.cLPCompanyID, this.selectedUserId)
      .then(async (result: CustomActionScreenResponse) => {
        if (result) {
          this.customActionResponse = UtilityService.clone(result);
          this.customActionDataList = this.customActionResponse.customActionScreen;
          this.initCustomActionDataList = this.customActionResponse.customActionScreen;
          this.customActionUser = this.customActionResponse.users;
          for (let i = 0; i < this.customActionDataList.length; i++) {
            if (!isNullOrUndefined(this.customActionDataList[i].cLPUserID) && !isNullOrUndefined(this.customActionUser)) {
              this.initCustomActionUser = this.customActionUser.filter((data) => data.cLPUserID === this.customActionDataList[i].cLPUserID)[0];
              this.customActionDataList[i].firstName = this.initCustomActionUser?.firstName;
              this.customActionDataList[i].lastName = this.initCustomActionUser?.lastName;
            }
          }
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('custom_action_grid');
            this._gridCnfgService.iterateConfigGrid(this.customActionResponse, "custom_action_grid");
          }

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
  async getCustomActionLoad(screenId) {
    this.showSpinner = true;
    await this._customActionService.getCustomActionLoad(this.encryptedUser, screenId)
      .then(async (result: CustomActionScreen) => {
        if (result) {
          this.customActionData = UtilityService.clone(result);
          this.patchFormControlValue();
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
  customActionFormSubmit() {
    this.customActionForm.controls.formName.markAsTouched();
    if (this.customActionForm.valid) {
      this.showSpinner = true;
      this.copyCustomActionFormValueToData();
      this._customActionService.saveCustomAction(this.encryptedUser, this.customActionData)
        .then(async (result: CustomActionScreenResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.getCustomActionLoad(response.messageInt != 0 ? response.messageInt : this.customActionData.customActionScreenID);
            this.getCustomActionButtonList();
            this._notifyService.showSuccess(response.messageString ? response.messageString : "Custom Action Saved Successfully.", "", 3000);
            this.isEnableEdit = false;
            this.isShowCustom = true;
            this.isDeleteEnable = false;
            this.showSpinner = false;
            this.getCustomActionList();
            this.initCustomActionUser = this.customActionUser.filter((data) => data.cLPUserID === this.customActionData.cLPUserID)[0];
            this.customActionData.firstName = this.initCustomActionUser?.firstName;
            this.customActionData.lastName = this.initCustomActionUser?.lastName;
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
  }
  async customActionDelete() {
    this.showSpinner = true;
    await this._customActionService.getCustomActionDelete(this.encryptedUser, this.customActionData.customActionScreenID)
      .then(async (result: CustomActionScreenResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getCustomActionList();
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Custom Action Delete Successfully.", "", 3000);
          this.isEnableEdit = false;
          this.isDeleteEnable = false;
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

  async getCustomActionButtonList() {
    this.showSpinner = true;
    await this._customActionService.getCustomActionButtonList(this.encryptedUser, this.customActionData.customActionScreenID)
      .then(async (result: CustomButton[]) => {
        if (result) {
          this.customActionButtonList = UtilityService.clone(result);
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
  async getCustomActionButtonLoad(buttonId) {
    this.showSpinner = true;
    await this._customActionService.getCustomActionButtonLoad(this.encryptedUser, buttonId)
      .then(async (result: CustomButton) => {
        if (result) {
          this.customActionButtonData = UtilityService.clone(result);
          await this.getDropdownFields();
          if (isNullOrUndefined(this.customActionButtonData.destinationUrl))
            this.customActionButtonData.destinationUrl = '';
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
  async saveCustomActionButton() {
    this.showSpinner = true;
    await this._customActionService.saveCustomActionButton(this.encryptedUser, this.customActionButtonData)
      .then(async (result: CustomActionButtonResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          await this.getCustomActionButtonList();
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Custom Action Button Added Successfully.", "", 3000);
          this.isShowButton = true;
          this.showSpinner = false;
          this.isPreviewButton = true;
          if (this.customActionButtonData.customActionButtonId == 0) {
            let i = Object.keys(this.customActionButtonList).length;
            this.getCustomActionButtonLoad(this.customActionButtonList[i - 1].customActionButtonId);
          }
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
  async customActionButtonDelete() {
    this.showSpinner = true;
    await this._customActionService.getCustomActionButtonDelete(this.encryptedUser, this.customActionButtonData.customActionButtonId)
      .then(async (result: CustomActionButtonResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getCustomActionButtonList();
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Custom Action Button Delete Successfully.", "", 3000);
          this.showSpinner = false;
          this.isShowButton = false;
          this.isShowDropdown = false;
          this.isEditDropdown = false;
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
  async getDropdownFields() {
    this.showSpinner = true;
    await this._customActionService.getCustomActionDropdown(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: LoadCustomActionButton) => {
        if (result) {
          this.customActionDropdownResponse = UtilityService.clone(result);
          this.clickUser = this.customActionDropdownResponse.filterUser;
          this.customActionScreenDd = this.customActionDropdownResponse.customActionScreenDd;
          this.emailTemplate = this.customActionDropdownResponse.rddEmailTemplateDd;
          this.patchFormControlValue();
          await this.getAutomationProcess(-1);
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async getAutomationProcess(item) {
    this.showSpinner = true;
    if (item != -1)
      this.searchTitle = this.AutomationProcessDDResponse[item].searchText;
    if (this.primarySecondary == 'Secondary')
      this.primarySecondary = 'Primary';
    else
      this.primarySecondary = 'Secondary';
    await this._customActionService.getCustomActionAutomationDropdown(this.encryptedUser, this.searchTitle, this.primarySecondary, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: LoadAutomationProcessDD) => {
        if (result) {
          if (item == -1) {
            for (let i = 0; i < 4; i++) {
              this.AutomationProcessDDResponse.push(UtilityService.clone(result));
            }
          }
          else
            this.AutomationProcessDDResponse[item] = UtilityService.clone(result);
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async getCustomActionDropdownItemList() {
    this.showSpinner = true;
    await this._customActionService.getCustomActionDropdownItemList(this.encryptedUser, this.customActionButtonData.customActionButtonId)
      .then(async (result: CustomActionDD[]) => {
        if (result) {
          this.customActionDdItemList = UtilityService.clone(result);
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
  async getCustomActionDropdownItemLoad(ItemId) {
    this.showSpinner = true;
    await this._customActionService.getCustomActionDropdownItemLoad(this.encryptedUser, ItemId)
      .then(async (result: CustomActionDD) => {
        if (result) {
          this.customActionDdItemData = UtilityService.clone(result);
          this.getDropdownFields();
          if (isNullOrUndefined(this.customActionDdItemData.destinationUrl))
            this.customActionDdItemData.destinationUrl = '';
          this.patchDdItemFormControlValue();
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
  customActionDdItemFormSubmit() {
    this.showSpinner = true;
    this.copyCustomActionDdItemFormValueToData();
    this._customActionService.saveCustomActionDdItem(this.encryptedUser, this.customActionDdItemData)
      .then(async (result: CustomActionDDResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          await this.getCustomActionDropdownItemList();
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Custom Action Dropdown Item Added Successfully.", "", 3000);
          this.showSpinner = false;
          this.isPreviewDDItem = true;
          this.isAddItemDropDown = true;
          // If we added new Item then for use delete & edit functionality we give last Item id 
          if (this.customActionDdItemData.customActionDdItemId == 0) {
            let i = this.customActionDdItemList?.length;
            this.getCustomActionDropdownItemLoad(this.customActionDdItemList[i - 1].customActionDdItemId);
          }
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
  async customActionDropdownItemDelete() {
    this.showSpinner = true;
    await this._customActionService.getCustomActionDdItemDelete(this.encryptedUser, this.customActionDdItemData.customActionDdItemId)
      .then(async (result: CustomActionDDResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getCustomActionDropdownItemList();
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Custom Action Dropdown Delete Successfully.", "", 3000);
          this.showSpinner = false;
          this.isShowButton = false;
          this.isShowDropdown = true;
          this.isEditDropdown = false;
          this.isAddItemDropDown = false;
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
  customActionButtonFormSubmit() {
    this.copyCustomActionButtonFormValueToData();
    this.saveCustomActionButton();
  }
  async customActionDropdownFormSubmit() {
    await this.copyCustomActionDropdpownFormValueToData();
    await this.saveCustomActionButton();
    var i = Object.keys(this.customActionButtonList).length;
    this.getCustomActionButtonLoad(this.customActionButtonList[i - 1].customActionButtonId);
    this.getCustomActionDropdownItemList();
    this.isShowButton = false;
    this.isShowDropdown = true;
    this.isEditDropdown = false;
    this.isAddItemDropDown = false;
  }
  async addCustomButton() {
    await this.getCustomActionButtonLoad(0);
    this.isShowButton = true;
    this.isShowDropdown = false;
    this.isEditDropdown = false;
    this.isPreviewButton = false;
    this.customActionButtonForm = this.prepareCustomActionButtonForm();
  }
  cancleCustomButton() {
    if (this.customActionButtonData.customActionButtonId == 0)
      this.isShowButton = false;
    else {
      this.isShowButton = true;
      this.isPreviewButton = true;
    }
  }
  async addCustomDropDown() {
    await this.getCustomActionButtonLoad(0);
    this.isShowButton = false;
    this.isShowDropdown = false;
    this.isEditDropdown = true;
    this.customActionDropdownForm = this.prepareCustomActionButtonForm();
  }
  cancelCustomDropDown() {
    this.isShowButton = false;
    this.isShowDropdown = false;
    this.isEditDropdown = false;
  }
  async addItemDropDown() {
    await this.getCustomActionDropdownItemLoad(0);
    this.isShowButton = false;
    this.isPreviewDDItem = false;
    this.isShowDropdown = true;
    this.isEditDropdown = false;
    this.isAddItemDropDown = true;
    this.customActionDdItemForm = this.prepareCustomActionDdItemForm();
  }
  editCustomDropdownData() {
    this.isShowButton = false;
    this.isShowDropdown = false;
    this.isEditDropdown = true;
    this.isAddItemDropDown = false;
  }
  cancelItemDropDown() {
    this.isShowButton = false;
    this.isShowDropdown = true;
    this.isEditDropdown = false;

    if (this.customActionDdItemData.customActionDdItemId == 0)
      this.isAddItemDropDown = false;
    else {
      this.isAddItemDropDown = true;
      this.isPreviewDDItem = true;
    }
  }
  identifyTeam(index, item) {
    return index;
  }
  async onCustomActionButton(buttonId: number, buttonText: string) {
    this.showSpinner = true;
    await this.getCustomActionButtonLoad(buttonId);
    switch (buttonText) {
      case 'Custom Dropdown':
        this.patchButtonFormControlValue('customActionDropdownForm');
        this.isShowButton = false;
        this.isShowDropdown = true;
        this.isEditDropdown = false;
        this.showSpinner = false;
        this.isAddItemDropDown = false;
        break;
      default:
        this.patchButtonFormControlValue('customActionButtonForm');
        this.isShowButton = true;
        this.isEditDropdown = false;
        this.isShowDropdown = false;
        this.showSpinner = false;
        this.isAddItemDropDown = false;
        this.isPreviewButton = false;
    }
  }
  async onCustomActionDdItem(ItemId: number) {
    await this.getCustomActionDropdownItemLoad(ItemId);
    this.isShowButton = false;
    this.isShowDropdown = true;
    this.isEditDropdown = false;
    this.isAddItemDropDown = true;
    this.isPreviewDDItem = false;
  }

  dropTeam(event: CdkDragDrop<string[]>) {
    if (Object.keys(this.customActionButtonList).length > 1) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
    }
  }
  dropTeamItem(event: CdkDragDrop<string[]>) {
    if (this.customActionDdItemList?.length > 1) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
    }
  }
  onChangeAction(name: string) {
    switch (name) {
      case 'None':
        this.customActionButtonData.ctAction = 0;
        break;
      case 'Start':
        this.customActionButtonData.ctAction = 1;
        break;
      case 'Stop':
        this.customActionButtonData.ctAction = 2;
        break;
      case 'Pause':
        this.customActionButtonData.ctAction = 3;
        break;
      case 'Remove':
        this.customActionButtonData.ctAction = 4;
        break;
    }
  }
  onChangeSecAction(name: string) {
    switch (name) {
      case 'None':
        this.customActionButtonData.secCtAction = 0;
        break;
      case 'Start':
        this.customActionButtonData.secCtAction = 1;
        break;
      case 'Stop':
        this.customActionButtonData.secCtAction = 2;
        break;
      case 'Pause':
        this.customActionButtonData.secCtAction = 3;
        break;
      case 'Remove':
        this.customActionButtonData.secCtAction = 4;
        break;
    }
  }
  onChangeItemAction(name: string) {
    switch (name) {
      case 'None':
        this.customActionDdItemData.ctAction = 0;
        break;
      case 'Start':
        this.customActionDdItemData.ctAction = 1;
        break;
      case 'Stop':
        this.customActionDdItemData.ctAction = 2;
        break;
      case 'Pause':
        this.customActionDdItemData.ctAction = 3;
        break;
      case 'Remove':
        this.customActionDdItemData.ctAction = 4;
        break;
    }
  }
  onChangeSecItemAction(name: string) {
    switch (name) {
      case 'None':
        this.customActionDdItemData.secCtAction = 0;
        break;
      case 'Start':
        this.customActionDdItemData.secCtAction = 1;
        break;
      case 'Stop':
        this.customActionDdItemData.secCtAction = 2;
        break;
      case 'Pause':
        this.customActionDdItemData.secCtAction = 3;
        break;
      case 'Remove':
        this.customActionDdItemData.secCtAction = 4;
        break;
    }
  }

  onCustomActionFilter(inputValue: string): void {
    this.customActionDataList = process(this.initCustomActionDataList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'formName', operator: 'contains', value: inputValue },
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
}
