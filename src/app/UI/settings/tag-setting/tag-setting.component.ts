import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { TagsFields, TagsMgmt } from '../../../models/tag-settings.model';
import { GridColumnsConfigurationService } from '../../../services/gridColumnsConfiguration.service';
import { NotificationService } from '../../../services/notification.service';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { SignupService } from '../../../services/signup.service';
import { TagSettingService } from '../../../services/tag-setting.service';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-tag-setting',
  templateUrl: './tag-setting.component.html',
  styleUrls: ['./tag-setting.component.css'],
  providers: [GridConfigurationService]
})
export class TagSettingComponent implements OnInit {
  user: CLPUser;
  private editedRowIndex: number;
  showSpinner: boolean = false;
  public tagSettingsData: any;
  public initTagSettingsData: any;
  tagSettingsResponse: TagsMgmt;
  arrTagSettings: any[] = [{ value: 2, name: "Contacts" }, { value: 3, name: "Companies" }, { value: 4, name: "Leads" }];
  columns = [{ field: '$', title: '', width: '40' }, { field: 'tag', title: 'Tag', width: '800' }, { field: 'contact', title: 'Contact', width: '250' }];
  reorderColumnName: string = 'tag,contact';
  columnWidth: string = 'tag:800,contact:250';
  arrColumnWidth: any[] = ['tag:800,contact:250'];
  hiddenColumns: string[] = [];
  arrSortingColumn: any[] = [];
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  TagsFields: TagsFields;
  private encryptedUser: string = '';
  ownerType: number = 0;
  public formGroup: FormGroup;
  currentTagName: string = '';
  currentContactNo: number = 0;
  currentTagID: number = 0;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  mobileColumnNames: string[];
  constructor(public _gridCnfgService: GridConfigurationService, public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, private _notifyService: NotificationService, public _signupService: SignupService,
    private _tagsettingsrvc: TagSettingService, public _gridColumnsConfigurationService: GridColumnsConfigurationService) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
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

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'tag_setting_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('tag_setting_grid').subscribe((value) => this.tagGetListByCLPCompanyWithCount(2)));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'tag_setting_grid').subscribe((value) => this.getGridConfiguration());
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.TagSettings)
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
    this.showSpinner = true;
    let tagField: TagsFields = <TagsFields>{};
    tagField.cLPCompanyID = this.user.cLPCompanyID
    tagField.tag = dataItem.tag
    tagField.tagID = dataItem.tagID
    tagField.ownerType = this.ownerType
    this._tagsettingsrvc.tagUpdate(this.encryptedUser, tagField)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Tag Setting updated Successfully.", "", 3000);
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
    sender.closeRow(rowIndex);
  }

  public removeHandler({ dataItem }): void {
    if (dataItem != null)
      this.currentTagID = dataItem.tagID;
    this.currentTagName = dataItem.tag;
    this.currentContactNo = dataItem.contact;
  }

  deleteUser() {
    this.showSpinner = true;
    this._tagsettingsrvc.tagDelete(this.encryptedUser, this.currentTagID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.tagGetListByCLPCompanyWithCount(this.ownerType)
          this._notifyService.showSuccess('Tag Setting deleted successfuly', "", 3000);
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

  async tagGetListByCLPCompanyWithCount(ownerType) {
    this.showSpinner = true;
    await this._tagsettingsrvc.tagGetListByCLPCompanyWithCount(this.encryptedUser, this.user.cLPCompanyID, ownerType)
      .then(async (result: TagsMgmt) => {
        if (result) {
          this.tagSettingsResponse = UtilityService.clone(result);
          this.tagSettingsData = this.tagSettingsResponse;
          this.initTagSettingsData = this.tagSettingsResponse;
          this.ownerType = ownerType;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.tagSettingsResponse, "tag_setting_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('tag_setting_grid');
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

  onTagSettingFilter(inputValue: string): void {
    this.tagSettingsData = process(this.initTagSettingsData, {
      filter: {
        logic: "or",
        filters: [
          { field: 'tag', operator: 'contains', value: inputValue },
          { field: 'contact', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
}
