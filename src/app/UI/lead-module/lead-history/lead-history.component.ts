import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { LeadAppt, LeadHistoryListResponse, LeadNote, LeadTask } from '../../../models/lead.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { LeadSettingService } from '../../../services/leadSetting.service';
import { NotificationService } from '../../../services/notification.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
declare var $: any;
@Component({
  selector: 'lead-history',
  templateUrl: './lead-history.component.html',
  styleUrls: ['./lead-history.component.css']
})
/** lead-history component*/
export class LeadHistoryComponent {
  /** lead-history ctor */
  userResponse: UserResponse;
  user: CLPUser;
  roleFeaturePermissions: RoleFeaturePermissions;
  leadHistory: LeadHistoryListResponse;
  private encryptedUser: string = '';
  showSpinner: boolean;
  taskHistory: LeadTask[];
  noteHistory: LeadNote[];
  apptHistory: LeadAppt[];
  initTaskHistory: LeadTask[];
  initNoteHistory: LeadNote[];
  initApptHistory: LeadAppt[];
  @Input() leadIdReceive: number = 0;
  /** lead-list ctor */
  constructor(@Inject('BASE_URL') _baseUrl: string,
    private _ngZone: NgZone, public router: Router, private _router: Router, private _localService: LocalService, private leadSettingService: LeadSettingService, private _utilityService: UtilityService, public notifyService: NotificationService) {
    /*this._localService.isMenu = true;*/
    this.subscribeToEvents();
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getLeadHistory();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.MyLead)
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
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }
  async getLeadHistory() {
    this.showSpinner = true;
    await this.leadSettingService.getLeadHistory(this.encryptedUser, this.leadIdReceive, this.user.cLPUserID, this.user.cLPCompanyID)
      .then(async (result: LeadHistoryListResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.taskHistory = res.tasks;
          this.noteHistory = res.notes;
          this.apptHistory = res.appts;
          this.initTaskHistory = res.tasks;
          this.initNoteHistory = res.notes;
          this.initApptHistory = res.appts;
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  changeLeadActivitySort(event) {
    this.showSpinner = true;
    var selectedValue = event.target.value;
    switch (selectedValue) {
      case "newest":
        var resultNote = this.noteHistory.sort((x, y) => +new Date(y.strDay) - +new Date(x.strDay));
        this.noteHistory = resultNote;
        var resultTask = this.taskHistory.sort((x, y) => +new Date(y.strDay) - +new Date(x.strDay));
        this.taskHistory = resultTask;
        var resultAppt = this.apptHistory.sort((x, y) => +new Date(y.strDay) - +new Date(x.strDay));
        this.apptHistory = resultAppt;
        this.notifyService.showSuccess("Activity filtered on " + selectedValue + "!", "", 3000);
        this.showSpinner = false;
        break;
      case "oldest":
        var resultNote = this.noteHistory.sort((x, y) => +new Date(x.strDay) - +new Date(y.strDay));
        this.noteHistory = resultNote;
        var resultTask = this.taskHistory.sort((x, y) => +new Date(x.strDay) - +new Date(y.strDay));
        this.taskHistory = resultTask;
        var resultAppt = this.apptHistory.sort((x, y) => +new Date(x.strDay) - +new Date(y.strDay));
        this.apptHistory = resultAppt;
        this.notifyService.showSuccess("Activity filtered on " + selectedValue + "!", "", 3000);
        this.showSpinner = false;
        break;
      default:
        this.noteHistory = this.initNoteHistory;
        this.taskHistory = this.initTaskHistory;
        this.apptHistory = this.initApptHistory;
        this.showSpinner = false;
        break;
    }
  }

  private subscribeToEvents(): void {
    this._localService.handledReceived?.subscribe((value: boolean) => {
      this._ngZone.run(() => {
        this.getLeadHistory();
        $("#AllActivity").prop("checked", true);
      });
    });
  }
}
