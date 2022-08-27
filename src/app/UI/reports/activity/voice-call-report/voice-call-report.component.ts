import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { VoiceCallRptResponse, VoiceCallRpt, VoiceCallCancelRpt} from '../../../../models/report.model';
import { CLPUser, OfficeCodeResponseIEnumerable, OfficeCodes, TeamCodeResponseIEnumerable, TeamCodes, UserResponse } from '../../../../models/clpuser.model';
import { CompanyFieldsResponse } from '../../../../models/company.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { ContactService } from '../../../../services/contact.service';
import { OfficeSetupService } from '../../../../services/officeCode.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { TeamOfficeSetupService } from '../../../../services/teamoffice.service';

@Component({
  selector: 'app-voice-call-report',
  templateUrl: './voice-call-report.component.html',
  styleUrls: ['./voice-call-report.component.css'],
  providers: [GridConfigurationService]
})
export class VoiceCallReportComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  userList = [];
  voiceCallResponse: VoiceCallRptResponse;
  voiceCallCancelRpt: VoiceCallCancelRpt[] = [];
  totalVoiceRpt: VoiceCallRpt[] = [];
  inboundRpt: VoiceCallRpt[] = [];
  outScheduledRpt: VoiceCallRpt[] = [];
  outClickToCallRpt: VoiceCallRpt[] = [];
  teamFilterDD: TeamCodes[];
  officeFilterDD: OfficeCodes[];
  voiceCallForm: FormGroup;
  columns = [
    { field: 'user', title: 'User', width: '100' },
    { field: 'team', title: 'Team', width: '100' },
    { field: 'office', title: 'Office', width: '80' },
    { field: 'contacts', title: 'Contacts', width: '40' },
    { field: 'calls', title: 'Calls', width: '40' },
    { field: 'noRing', title: '	No Ring', width: '40' },
    { field: 'connected', title: 'Connected', width: '40' },
    { field: 'less2min', title: '< 2 min', width: '40' },
    { field: 'bt2to5min', title: '2 to 5 min', width: '40' },
    { field: 'bt5to15min', title: '5 to 15 min', width: '40' },
    { field: 'bt15to30min', title: '15 to 30 min', width: '40' },
    { field: 'greater30min', title: '> 30 min', width: '40' },
    { field: 'answerRate', title: 'Answer Rate', width: '60' },
    { field: 'pitchRate', title: 'Pitch Rate', width: '60' },
    { field: 'averageLength', title: 'Avg Call', width: '60' },
    { field: 'cpd', title: 'Connected Per Day', width: '100' },
  ];
  reorderColumnName: string = 'user,team,office,contacts,calls,noRing,connected,less2min,bt2to5min,bt5to15min,bt15to30min,greater30min,answerRate,pitchRate,averageLength,cpd';
  columnWidth: string = 'user:100,team:100,office:80,contacts:40,calls:40,noRing:40,connected:40,less2min:40,bt2to5min:40,bt5to15min:40,bt15to30min:40,greater30min:40,answerRate:60,pitchRate:60,averageLength:60,cpd:100';
  arrColumnWidth: any[] = ['user:100,team:100,office:80,contacts:40,calls:40,noRing:40,connected:40,less2min:40,bt2to5min:40,bt5to15min:40,bt15to30min:40,greater30min:40,answerRate:60,pitchRate:60,averageLength:60,cpd:100'];
  mobileColumnNames: string[];

  constructor(private fb: FormBuilder,
    private _reportService: ReportService,
    public _contactService: ContactService,
    private _officeCodeservice: OfficeSetupService,
    private _teamOfficeService: TeamOfficeSetupService,
    private datepipe: DatePipe,
    public _gridCnfgService: GridConfigurationService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.voiceCallForm = this.prepareTextMsgLogForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getGridConfiguration();
          this.onTeamDD();
          this.onOfficeDD();
        }
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
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'voice_call_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('voice_call_grid').subscribe((value) => this.getVoiceCallList()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'voice_call_grid').subscribe((value) => this.getGridConfiguration());
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser,)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this._gridCnfgService.user = this.user;
              this.voiceCallForm = this.prepareTextMsgLogForm();
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
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async onTeamDD() {
    this.showSpinner = true;
    await this._teamOfficeService.teamCode_GetList(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: TeamCodeResponseIEnumerable) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.teamFilterDD = res?.teamCodes;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }
  async onOfficeDD() {
    this.showSpinner = true;
    await this._officeCodeservice.OfficeCode_GetList(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: OfficeCodeResponseIEnumerable) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.officeFilterDD = res?.officeCodes;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async getVoiceCallList() {
    this.showSpinner = true;
    let startDate = this.datepipe.transform(this.voiceCallForm.controls.startDate.value, 'MM/dd/yyyy')
    let endDate = this.datepipe.transform(this.voiceCallForm.controls.endDate.value, 'MM/dd/yyyy')
    await this._reportService.getVoiceCallSummaryReport(this.encryptedUser, this.user.cLPCompanyID, startDate, endDate, this.user.cLPUserID, this.voiceCallForm.controls.ddOffice.value, this.voiceCallForm.controls.ddTeam.value, this.voiceCallForm.controls.groupBy.value)
      .then(async (result: VoiceCallRptResponse) => {
        if (result) {
          this.voiceCallResponse = UtilityService.clone(result);
          this.totalVoiceRpt = this.voiceCallResponse._totalVoiceCallRptList
          this.inboundRpt = this.voiceCallResponse.AllUserVoiceCallRptList
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.voiceCallResponse, "voice_call_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('voice_call_grid');
          }

          this.voiceCallResponse._voiceCallRptList.forEach(item => {
            if (item.direction == true && item.isscheduled == true)
              this.outScheduledRpt.push(item);
            else if (item.direction == true && item.isscheduled == false)
              this.outClickToCallRpt.push(item);
          })
          this.showSpinner = false;
        } else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }


  prepareTextMsgLogForm() {
    const now = new Date();
    return this.fb.group({
      startDate: new FormControl(new Date(now.getFullYear(), now.getMonth() - 1, 1), [Validators.required]),
      endDate: new FormControl(new Date(now.getFullYear(), now.getMonth(), 0), [Validators.required]),
      ddTeam: new FormControl(0),
      ddOffice: new FormControl(0),
      groupBy: new FormControl('CLPUser'),
    });
  }


  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Voice Call List`;
    let rows = options.sheets[0].rows;
    rows.forEach((row) => {
      if (row && row.type == "data") {
        row.cells.forEach((cell) => {
          if (cell && cell.value && cell.value.includes("<br>")) {
            cell.value = cell.value.replace(/<br\s*\/?>/gi, ' ');
          }
        });
      }
    });
    Array.prototype.unshift.apply(rows);
    component.save(options);
  }
}
