import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
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
import { Click, ClickTrackingResponse, ClickTemplate, ClickModelView, filterUser } from '../../models/clickTracking.model';
import { ClickTrackingService } from '../../services/click-tracking.service';
import { NotificationService } from '../../services/notification.service';
import { SimpleResponse } from '../../models/genericResponse.model';


@Component({
    selector: 'app-click-tracking',
    templateUrl: './click-tracking.component.html',
  styleUrls: ['./click-tracking.component.css'],
    providers: [GridConfigurationService]
})

export class ClickTrackingComponent {
  gridHeight;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  showSpinner: boolean = false;
  replacementURL: string;
  public clickTemplate: ClickTemplate[];
  public initClickTemplate: ClickTemplate;
  public clickUser: filterUser[];
  public initClickUser: filterUser;
  public clickTrackingDataList: ClickModelView[];
  public initclickTrackingDataList: ClickModelView[];
  public clickTrackingData: Click;
  actionRadio1: boolean = false;
  actionRadio2: boolean = false;
  actionRadio3: boolean = false;
  actionRadio4: boolean = false;
  actionRadio5: boolean = false;
  clickTrackingResponse: ClickTrackingResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  isEnableEdit: boolean = false;
  isEdit: boolean = false;
  user: CLPUser;
  columns = [{ field: '$', title: '', width: '40' },
    { field: 'destinationURL', title: 'Click', width: '200' },
    { field: 'clickURL', title: 'Replacement URL', width: '200' },
    { field: 'sfaSettings', title: 'SFA', width: '100' },
    { field: 'score', title: 'Score', width: '40' }];
  reorderColumnName: string = 'destinationURL,clickURL,sfaSettings,score';
  columnWidth: string = 'destinationURL:200,clickURL:200,sfaSettings:100,score:40';
  arrColumnWidth: any[] = ['destinationURL:200,clickURL:200,sfaSettings:100,score:40'];
  public formGroup: FormGroup;
  private editedRowIndex: number;
  clickTrackingForm: FormGroup
  Url: string = "";
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
    mobileColumnNames: string[];
  constructor(public _gridCnfgService: GridConfigurationService,
    private _notifyService: NotificationService,
    private fb: FormBuilder,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router,
    private _clickTrackingService: ClickTrackingService,
    public _gridColumnsConfigurationService: GridColumnsConfigurationService) {
    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('493px');
  }

  ngOnInit(): void {
    this.clickTrackingForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this.getGridConfiguration();
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ClickTracking)
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
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'click_tracking_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('click_tracking_grid').subscribe((value) => this.getclickTrackingList()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'click_tracking_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getclickTrackingList() {
    this.showSpinner = true;
    this.isEnableEdit = false;
    this.isEdit = false;
    await this._clickTrackingService.getClickTrackingList(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: ClickModelView[]) => {
        if (result) {
          this.clickTrackingDataList = UtilityService.clone(result);
          this.initclickTrackingDataList = this.clickTrackingDataList;
          if (!isNullOrUndefined(this._gridCnfgService)) {
          this._gridCnfgService.iterateConfigGrid(this.clickTrackingDataList, "click_tracking_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('click_tracking_grid');
          }
          await this.getclickTrackingLoad(0);
          this.setTrackingList();
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

  async getclickTrackingLoad(dataItem) {
    this.showSpinner = true;
    await this._clickTrackingService.getClickTrackingLoad(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, dataItem)
      .then(async (result: ClickTrackingResponse) => {
        if (result) {
          this.clickTrackingResponse = UtilityService.clone(result);
          this.clickTrackingData = this.clickTrackingResponse.click;
          this.clickTemplate = this.clickTrackingResponse.clickTemplate;
          this.clickUser = this.clickTrackingResponse.filterUser;
          this.patchFormControlValue();
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

  prepareTrackingForm() {
    return this.fb.group({
      destinationURL: new FormControl('', [Validators.required]),
      cTCampaignTemplateID: new FormControl(0),
      cTCLPUserID: new FormControl(0),
      score: new FormControl('', [Validators.required, Validators.min(-100), Validators.max(100)])

    });
  }
  patchFormControlValue() {
    var clickTrackingData = this.clickTrackingData;
    for (let key in clickTrackingData) {
      let value = clickTrackingData[key];
      if (this.clickTrackingForm.get(key))
        this.clickTrackingForm.get(key).setValue(value);
    }
    this.setTrackingData();
  }

  setTrackingData() {
    switch (this.clickTrackingData.cTAction) {
      case 0:        
        this.actionRadio1 = true;
        this.actionRadio2 = false;
        this.actionRadio3 = false;
        this.actionRadio4 = false;
        this.actionRadio5 = false;
        break;

      case 1:        
        this.actionRadio1 = false;
        this.actionRadio2 = true;
        this.actionRadio3 = false;
        this.actionRadio4 = false;
        this.actionRadio5 = false;
        break;

      case 2:        
        this.actionRadio1 = false;
        this.actionRadio2 = false;
        this.actionRadio3 = true;
        this.actionRadio4 = false;
        this.actionRadio5 = false;
        break;

      case 3:        
        this.actionRadio1 = false;
        this.actionRadio2 = false;
        this.actionRadio3 = false;
        this.actionRadio4 = true;
        this.actionRadio5 = false;
        break;

      case 4:        
        this.actionRadio1 = false;
        this.actionRadio2 = false;
        this.actionRadio3 = false;
        this.actionRadio4 = false;
        this.actionRadio5 = true;
        break;
    }
  }

  setTrackingList() {
    for (let i = 0; i < this.clickTrackingDataList.length; i++) {
      if (this.clickTrackingDataList[i].destinationURL.length > 37)
        this.clickTrackingDataList[i].destinationURL = this.clickTrackingDataList[i].destinationURL.slice(0, 37) + "..." + this.clickTrackingDataList[i].destinationURL.slice(-10)
      switch (this.clickTrackingDataList[i].cTAction) {
        case 0:
          this.clickTrackingDataList[i].sfaSettings = "None";
          break;

        case 1:
          this.clickTrackingDataList[i].sfaSettings = "Start";
          break;

        case 2:
          this.clickTrackingDataList[i].sfaSettings = "Stop";
          break;

        case 3:
          this.clickTrackingDataList[i].sfaSettings = "Pause";
          break;

        case 4:
          this.clickTrackingDataList[i].sfaSettings = "Remove";
          break;
      }
      if (!isNullOrUndefined(this.clickTrackingDataList[i].cTCLPUserID) && this.clickTrackingDataList[i].cTCLPUserID != 0) {
        this.initClickUser = this.clickUser.filter((data) => data.key === this.clickTrackingDataList[i].cTCLPUserID)[0];
        this.clickTrackingDataList[i].userName = this.initClickUser?.value;
      }
    }
  }

  copyClickTrackingFormValueToData() {
    this.clickTrackingData.cLPUserID = this.user.cLPUserID;
    this.clickTrackingData.cLPCompanyID = this.user.cLPCompanyID;
    this.clickTrackingData.destinationURL = this.clickTrackingForm.controls.destinationURL.value;
    this.clickTrackingData.cTCampaignTemplateID = this.clickTrackingData.cTAction > 0 ? this.clickTrackingForm.controls.cTCampaignTemplateID.value : 0;
    this.clickTrackingData.cTCLPUserID = this.clickTrackingData.cTAction > 0 ? this.clickTrackingForm.controls.cTCLPUserID.value : 0;
    this.clickTrackingData.score = this.clickTrackingForm.controls.score.value;
  }
  onChangeAction(name: string) {
    switch (name) {
      case 'None':
        this.clickTrackingData.cTAction = 0;
        break;

      case 'Start':
        this.clickTrackingData.cTAction = 1;
        break;

      case 'Stop':
        this.clickTrackingData.cTAction = 2;
        break;

      case 'Pause':
        this.clickTrackingData.cTAction = 3;
        break;

      case 'Remove':
        this.clickTrackingData.cTAction = 4;
        break;
    }
  }

  addNew() {
    this.isEnableEdit = true;
    this.isEdit = false;
    this.getclickTrackingLoad(0);
    this.clickTrackingForm = this.prepareTrackingForm();
  }
  public cancelRep() {
    this.formGroup = null;
    this.isEnableEdit = false;
    this.isEdit = false;
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.isEdit = true;
    this.isEnableEdit = true;
    this.getclickTrackingLoad(dataItem.clickID);
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
  }
  public saveHandler({ sender, rowIndex, dataItem }) {
    this.showSpinner = true;
    sender.closeRow(rowIndex);
  }
  clickTrackingFormSubmit() {
    this.clickTrackingForm.controls.destinationURL.markAsTouched();
    if (this.clickTrackingForm.valid) {
      this.copyClickTrackingFormValueToData();
      this._clickTrackingService.saveClickTrackingData(this.encryptedUser, this.clickTrackingData)
        .then(async (result: ClickTrackingResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.getclickTrackingList();
            this._notifyService.showSuccess(response.messageString ? response.messageString : "Click Tracking Saved Successfully.", "", 3000);
            this.isEnableEdit = false;
            this.isEdit = false;
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
  async deleteclickTracking() {
    this.showSpinner = true;
    await this._clickTrackingService.deleteClickTrackingData(this.encryptedUser, this.clickTrackingData.clickID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getclickTrackingList();
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Click Tracking Data Deleted Successfully.", "", 3000);
          this.isEnableEdit = false;
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

  get clickTrackingFrm() {
    return this.clickTrackingForm.controls;
  }
  onClickTrackingFilter(inputValue: string): void {
    this.clickTrackingDataList = process(this.initclickTrackingDataList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'destinationURL', operator: 'contains', value: inputValue },
          { field: 'sfaSettings', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  geturl(url) {
    var path : string = '';
    if (!/^http[s]?:\/\//.test(url)) {
      path += 'http://';
    }
    path += url;
    this.Url = path;
  }
}

