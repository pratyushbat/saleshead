import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process, SortDescriptor } from '@progress/kendo-data-query';
import { isNullOrUndefined } from 'util';
import { CLPLog, CLPLogListResponse, CLPLogParameters, CLPUserPref, CLPUserPrefList } from '../../../../models/accountInformation.model';
import { CLPUser, UserSetupResponse } from '../../../../models/clpuser.model';
import { ITeamOfficeCode } from '../../../../models/emailTemplate.model';
import { GenericRequest } from '../../../../models/genericRequest.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { LogType } from '../../../../models/logType.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { SignupService } from '../../../../services/signup.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.css'],
  providers: [GridConfigurationService]
})
/** activity-log component*/
export class ActivityLogComponent {
  /** activity-log ctor */
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  cLPCompanyID: number;
  logTypeList: LogType[];
  activityLog: CLPLog[];
  initActivityLog: CLPLog[];
  activityLogResponse: CLPLogListResponse
  userList: any = [];
  showSpinner: boolean = false;
  public formGroup: FormGroup;
  public format = "MM/dd/yyyy";
  activityForm = new FormGroup({});
  columns = [
    { field: '$', title: '', width: '40' },
    { field: 'dtCreated', title: 'Log Time', width: '100' },
    { field: 'userName', title: 'User Name', width: '60' },
    { field: 'clpLogType', title: 'Type', width: '40' },
    { field: 'cLPSSID', title: 'CLPSSID', width: '40' },
    { field: 'isSupportLogin', title: 'By Support', width: '60' },
    { field: 'note', title: 'Note', width: '300' }];
  reorderColumnName: string = 'dtCreated,userName,clpLogType,cLPSSID,isSupportLogin,note';
  columnWidth: string = 'dtCreated:100,userName:60,clpLogType:40,cLPSSID:40,isSupportLogin:60,note:300';
  arrColumnWidth: any[] = ['dtCreated:100,userName:60,clpLogType:40,cLPSSID:40,isSupportLogin:60,note:300'];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
    mobileColumnNames: string[];
  constructor(private _route: ActivatedRoute, public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, public _signupService: SignupService,
    private _accountSetupService: AccountSetupService, private _notifyService: NotificationService, private userSvc: UserService, private fb: FormBuilder, public _gridCnfgService: GridConfigurationService) {

  }

  ngOnInit(): void {
    this._localService.changedCompanyId.subscribe(id => {
      if (id !== this.cLPCompanyID) {
        this.activityForm = this.prepareactivityForm();
        this.activityForm.reset();
        this.cLPCompanyID = id;
        this.getGridConfiguration();
       }
    });
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'activity_log_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('activity_log_grid').subscribe((value) => this.getActivityLog()));
 }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'activity_log_grid').subscribe((value) => this.getGridConfiguration());
  }

  prepareactivityForm() {
    return this.fb.group({
      user: [-1],
      logType: [-1],
      dtFrom: [new Date()],
      dtTo: [new Date()],
      supportLogin: [0]
    });
  }

  async getActivityLog() {
    this.showSpinner = true;
    let clpLogParameters: CLPLogParameters = <CLPLogParameters>{};
    clpLogParameters.clpCompanyId = this.cLPCompanyID
    await this._accountSetupService.getActivityLog(this.encryptedUser, clpLogParameters)
      .then(async (result: CLPLogListResponse) => {
        if (result) {
          this.activityLogResponse = UtilityService.clone(result);
          this.logTypeList = this.activityLogResponse.filterLogType;
          this.userList = this.activityLogResponse.filterUser;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.activityLogResponse, "activity_log_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('activity_log_grid');
          }
          this.activityForm = this.prepareactivityForm();
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

  async searchLog() {
    this.showSpinner = true;
    let clpLogParameters: CLPLogParameters = <CLPLogParameters>{};
    clpLogParameters.clpCompanyId = this.cLPCompanyID
      clpLogParameters.clpLogTypeID = this.activityForm.get('logType').value
    clpLogParameters.clpUserId = this.activityForm.get('user').value
    clpLogParameters.dtfromDate = this.activityForm.get('dtFrom').value
    clpLogParameters.dtToDate = this.activityForm.get('dtTo').value
    clpLogParameters.supportLogin = this.activityForm.get('supportLogin').value
    await this._accountSetupService.getActivityLog(this.encryptedUser, clpLogParameters)
      .then(async (result: CLPLogListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.activityLog = response.activityLogs
          this.initActivityLog = response.activityLogs
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

  onActivityLogFilter(inputValue: string): void {
    this.activityLog = process(this.initActivityLog, {
      filter: {
        logic: "or",
        filters: [
          { field: 'dtCreated', operator: 'contains', value: inputValue },
          { field: 'userName', operator: 'contains', value: inputValue },
          { field: 'clpLogType', operator: 'contains', value: inputValue },
          { field: 'cLPSSID', operator: 'contains', value: inputValue },
          { field: 'isSupportLogin', operator: 'contains', value: inputValue },
          { field: 'note', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
}
