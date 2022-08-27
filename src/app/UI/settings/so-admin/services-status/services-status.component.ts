import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { HttpErrorResponse } from '@angular/common/http';

import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eServiceType, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';

import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { ServicesStatusService } from '../../../../services/services-status.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CLPFramework, ServiceStatusResponse } from '../../../../models/services-status.model';
import { NotificationService } from '../../../../services/notification.service';
import { SortDescriptor } from '@progress/kendo-data-query';
import { GridColumnsConfigurationService } from '../../../../services/gridColumnsConfiguration.service';

import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';

declare var $: any;

@Component({
  selector: 'app-services-status',
  templateUrl: './services-status.component.html',
  styleUrls: ['./services-status.component.css'],
  providers: [GridConfigurationService]
})
/** services-status component*/
export class ServicesStatusComponent implements OnInit {
  /** services-status ctor */
  isExpProcessors: boolean = true;
  isExpTxtMsg: boolean = true;
  isExpVoicCall: boolean = true;
  isExpDrops: boolean = true;
  isExpCallRec: boolean = true;
  isExpRec: boolean = true;

  showSpinner: boolean = false;
  private encryptedUser: string = '';
  resetPro: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  serviceStatusResponse: ServiceStatusResponse;

  mailingContactData: any[] = [];
  initMailingContactData: any[] = [];
  processors: any;
  txtMsgs: any;
  voiceCalls: any;
  drop: any;
  voiceCallRec: any;
  recording: any;

  isExpdMailsQueue: boolean = false;
  pageSize: number = 10;
  public sort: SortDescriptor[] = [];
  columns = [
    { field: '$', title: '', width: '60' },
    { field: 'user', title: 'User', width: '510' },
    { field: 'account', title: 'Account', width: '510' },
    { field: 'mailing', title: 'Mailing', width: '640' },
    { field: 'cnt', title: 'Count', width: '110' },
  ];
  reorderColumnName: string = 'user,account,mailing,cnt';
  columnWidth: string = 'user:510,account:510,mailing:640,cnt:110';
  arrColumnWidth: any[] = ['user:510,account:510,mailing:640,cnt:110'];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  gridHeight;
  mobileColumnNames: string[];

  constructor(public _localService: LocalService,
    private _utilityService: UtilityService,
    private _servicesStatusService: ServicesStatusService,
    private _notifyService: NotificationService,
    private _gridColumnsConfigurationService: GridColumnsConfigurationService,
    public datepipe: DatePipe,
    private _router: Router,
    private ngZone: NgZone,
    public _gridCnfgService: GridConfigurationService
  ) {
    this.gridHeight = this._localService.getGridHeight('464px');
    this._localService.isMenu = true;
  }

  ngOnInit() {
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
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'mailing_queue_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('mailing_queue_grid').subscribe((value) => this.getServiceStatus()));
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.SOServicesStatus)
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

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'mailing_queue_grid').subscribe((value) => this.getGridConfiguration());
  }

  serviceStatusFilter(inputValue: string): void {
    this.mailingContactData = process(this.initMailingContactData, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'user',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'account',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'mailing',
            operator: 'contains',
            value: inputValue
          }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
  async getServiceStatus() {
    this.showSpinner = true;
    var currentTime = new Date();
    let converted_date = this.datepipe.transform(currentTime, 'yyyy-MM-yy hh:mm:ss');
    await this._servicesStatusService.getAdminServiceStatus(this.encryptedUser, converted_date)
      .then(async (result: ServiceStatusResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.serviceStatusResponse = UtilityService.clone(result);

          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.serviceStatusResponse, "mailing_queue_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('mailing_queue_grid');
          }

          this.mailingContactData = this.serviceStatusResponse.mailingContactData.length > 0 ? this.serviceStatusResponse.mailingContactData : [];
          this.initMailingContactData = this.mailingContactData;
          this.processors = result.processersStatuData.length > 0 ? result.processersStatuData[0] : null;
          this.txtMsgs = {
            manualInQueue: result.commonTableData.length > 0 ? result.commonTableData[0].manualInQueue_TxtMsg : null,
            sFAInQueue: result.commonTableData.length > 0 ? result.commonTableData[0].sFAInQueue_TxtMsg : null,
            wizardryInQueue: result.commonTableData.length > 0 ? result.commonTableData[0].wizardryInQueue_TxtMs : null,
          }
          this.voiceCalls = {
            being: result.commonTableData.length > 0 ? result.commonTableData[0].beingHandled_VoiceCall : null,
            manualInQueue: result.commonTableData.length > 0 ? result.commonTableData[0].manualInQueue_VoiceCall : null,
            remindersInQueue: result.commonTableData.length > 0 ? result.commonTableData[0].remindersInQueue_VoiceCall : null,
            sFAInQueue: result.commonTableData.length > 0 ? result.commonTableData[0].sFAInQueue_VoiceCall : null,
          }
          this.drop = {
            being: result.commonTableData.length > 0 ? result.commonTableData[0].beingHandled_VoiceDrop : null,
            inQueue: result.commonTableData.length > 0 ? result.commonTableData[0].inQueue_VoiceDrop : null,
          }
          this.voiceCallRec = {
            being: result.commonTableData.length > 0 ? result.commonTableData[0].beingHandled_VoiceCallRecording : null,
            inQueue: result.commonTableData.length > 0 ? result.commonTableData[0].inQueue_VoiceCallRecording : null,
          }
          this.recording = {
            being: result.commonTableData.length > 0 ? result.commonTableData[0].beingHandled_VoiceRecording : null,
            inQueue: result.commonTableData.length > 0 ? result.commonTableData[0].inQueue_VoiceRecording : null,
          }
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



  resetProcessor(processor: string) {
    this.resetPro = processor;
    $('#processorResetModal').modal('show');
  }

  async confirmResetProcessor() {
    var serviceType = this.getServiceType();
    if (serviceType > -1) {
      this.showSpinner = true;
      await this._servicesStatusService.resetCLPFramework(this.encryptedUser, serviceType)
        .then(async (result: CLPFramework) => {
          if (result) {
            var result = UtilityService.clone(result);
            this.showSpinner = false;
            $('#processorResetModal').modal('hide');
            if (result.errorMsg) {
              this._notifyService.showError(result.errorMsg ? result.errorMsg : "Some error occured. Please contact administrator.", "", 3000);
              return;
            }
            this.resetPro = '';
            this.getServiceStatus();
            this._notifyService.showSuccess("Processor reset successfully", "", 3000);
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

  getServiceType() {
    var serviceType: number = -1;
    switch (this.resetPro) {
      case 'email':
        serviceType = eServiceType.EmailServ;
        break;
      case 'text':
        serviceType = eServiceType.TxtMsgServ;
        break;
      case 'voice':
        serviceType = eServiceType.VoiceServ;
        break;
      default: serviceType = -1; break;
    }
    return serviceType;
  }
}
