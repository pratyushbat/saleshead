import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { process } from '@progress/kendo-data-query';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { MailMergeTemplateDropDown, SOSC, SOSCResponse } from '../../../models/repSettings.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { GridColumnsConfigurationService } from '../../../services/gridColumnsConfiguration.service';
import { NotificationService } from '../../../services/notification.service';
import { RepSettingService } from '../../../services/repSettings.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { SignupService } from '../../../services/signup.service';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { DataBindingDirective } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-rep-settings',
  templateUrl: './rep-settings.component.html',
  styleUrls: ['./rep-settings.component.css'],
  providers: [GridConfigurationService]
})
/** rep-settings component*/
export class RepSettingsComponent {
  gridHeight;
  user: CLPUser;
  public repSettingsData: SOSC[];
  public initRepSettingsData: SOSC[];
  repSettingResponse: SOSCResponse
  showSpinner: boolean = false;
  columns = [{ field: '$', title: '', width: '40' },
  { field: 'sOSCID:h', title: 'Soscid', width: '40' },
  { field: 'contractName', title: 'Contract', width: '200' },
  { field: 'mailMergeTemplateID', title: 'Mail Merge Template', width: '200' }];
  reorderColumnName: string = 'contractName,mailMergeTemplateID';
  userResponse: UserResponse;
  columnWidth: string = 'contractName:200,mailMergeTemplateID:200';
  arrColumnWidth: any[] = ['contractName:200,mailMergeTemplateID:200'];
  roleFeaturePermissions: RoleFeaturePermissions;
  private editedRowIndex: number;
  private encryptedUser: string = '';
  public formGroup: FormGroup;
  repSettingForm: FormGroup
  mobileColumnNames: string[];
  repSettingFormSetup(): FormGroup {
    return new FormGroup({
      contractName: new FormControl('', [Validators.required]),
      mailMergeTemplateID: new FormControl(0),
      soScId: new FormControl(0)
    });
  }
  isEnableEdit: boolean = false;
  public mailMergeTemplateDropDown: MailMergeTemplateDropDown[];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  constructor(public _gridCnfgService: GridConfigurationService, public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, private _notifyService: NotificationService, public _signupService: SignupService,
    private _repSettingService: RepSettingService, public _gridColumnsConfigurationService: GridColumnsConfigurationService) {
    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('493px');
  }

  ngOnInit(): void {
    this.repSettingForm = this.repSettingFormSetup();
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
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.SORepSettings)
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
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'rep_setting_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('rep_setting_grid').subscribe((value) => this.getRepSettingList()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'rep_setting_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getRepSettingList() {
    this.showSpinner = true;
    this.isEnableEdit = false;
    await this._repSettingService.getRepSettingList(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: SOSCResponse) => {
        if (result) {
          this.repSettingResponse = UtilityService.clone(result);
          this.repSettingsData = this.repSettingResponse.sOSC
          this.initRepSettingsData = this.repSettingResponse.sOSC
          this.mailMergeTemplateDropDown = this.repSettingResponse.mailMergeTemplateDropDown;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('rep_setting_grid');
            this._gridCnfgService.iterateConfigGrid(this.repSettingResponse, "rep_setting_grid");
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

  public cancelRep() {
    this.formGroup = null;
    this.isEnableEdit = false;
  }

  public convertEmailTemplate(templateId) {
    let templateName = this.mailMergeTemplateDropDown.filter((data) => data.mailMergeTemplateID === templateId)[0];
    return templateName ? templateName.templateName : null;
  }

  public saveHandler({ sender, rowIndex, dataItem }): void {
    this.showSpinner = true;
    let repSettingsField: SOSC = <SOSC>{};
    repSettingsField.sOSCID = dataItem.sOSCID
    repSettingsField.contractName = dataItem.contractName
    repSettingsField.mailMergeTemplateID = dataItem.mailMergeTemplateID
    this._repSettingService.updateRepSettings(this.encryptedUser, repSettingsField)
      .then(async (result: SOSCResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getRepSettingList();
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Rep Setting Updated Successfully.", "", 3000);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    sender.closeRow(rowIndex);
  }

  addNew() {
    this.isEnableEdit = true;
    this.repSettingForm = this.repSettingFormSetup();
  }

  repSettingFormSubmit() {
    this.repSettingForm.controls.contractName.markAsTouched();
    this.repSettingForm.controls.mailMergeTemplateID.markAsTouched();
    if (this.repSettingForm.valid && this.repSettingForm.controls.mailMergeTemplateID.value != 0) {
      this.showSpinner = true;
      this._repSettingService.updateRepSettings(this.encryptedUser, this.repSettingForm.value)
        .then(async (result: SOSCResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.getRepSettingList();
            this._notifyService.showSuccess(response.messageString ? response.messageString : "Rep Setting Saved Successfully.", "", 3000);
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

  get repSettingFrm() {
    return this.repSettingForm.controls;
  }

  onRepSettingFilter(inputValue: string): void {
    this.repSettingsData = process(this.initRepSettingsData, {
      filter: {
        logic: "or",
        filters: [
          { field: 'sOSCID', operator: 'contains', value: inputValue },
          { field: 'contractName', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

}
