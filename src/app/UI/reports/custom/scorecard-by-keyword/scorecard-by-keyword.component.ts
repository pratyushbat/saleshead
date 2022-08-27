import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { CreateExportFor, eExportRequestObjectType, eExportRequestStatus, eUserRole } from '../../../../models/enum.model';
import { ScoreCardByKeyword, ScoreCardByKeywordData, ScorecardFilter } from '../../../../models/report.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { NotificationService } from '../../../../services/notification.service';
import { ReportService } from '../../../../services/report.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-scorecard-by-keyword',
  templateUrl: './scorecard-by-keyword.component.html',
  styleUrls: ['./scorecard-by-keyword.component.css']
})

export class ScorecardByKeywordComponent {
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  eStat: number = eExportRequestStatus.None;
  createExportFor: number = CreateExportFor.ScoreCardByKeyword;
  scorecardFilterResponse: ScorecardFilter
  scorecardKeywordResponse: ScoreCardByKeyword[];
  scoreCardByKeywordData: ScoreCardByKeywordData = <ScoreCardByKeywordData>{ }
  eType: number = eExportRequestObjectType.InventHelp_ScorecardByKeyword_Report;
  scoreCardKeywordForm: FormGroup;
  datePipe = new DatePipe('en-US');

  constructor(private fb: FormBuilder,
    private _reportService: ReportService,
    private _router: Router,
    private _utilityService: UtilityService,
    private _notifyService: NotificationService,
    public _localService: LocalService,) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.scoreCardKeywordForm = this.prepareScoreCardKeywordForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getScoreCardByFilterValues();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser,)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse?.user;
              this.roleFeaturePermissions = this.userResponse?.roleFeaturePermissions;
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
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
    this.showSpinner = false;
  }

  prepareScoreCardKeywordForm() {
    const date = new Date();
    return this.fb.group({
      startDate: new FormControl(new Date(date.getFullYear(), date.getMonth(), 1), [Validators.required]),
      endDate: new FormControl(new Date(date.getFullYear(), date.getMonth() + 1, 0), [Validators.required]),
      officeCode: new FormControl(0),
      class7Code: new FormControl(0),
      class8Code: new FormControl(0),
    });
  }

  async getScoreCardByFilterValues() {
    this.showSpinner = true;
    await this._reportService.getScoreCardByKeywordFilter(this.encryptedUser, this.user?.cLPCompanyID)
      .then(async (result: ScorecardFilter) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.scorecardFilterResponse = response;
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

  copyScoreCardByKeywordValue() {
    this.scoreCardByKeywordData.startDate = this.datePipe.transform(this.scoreCardKeywordForm?.value.startDate, 'yyyy-MM-dd');
    this.scoreCardByKeywordData.endDate = this.datePipe.transform(this.scoreCardKeywordForm?.value.endDate, 'yyyy-MM-dd');
    this.scoreCardByKeywordData.officeCode = this.scoreCardKeywordForm?.value.officeCode;
    this.scoreCardByKeywordData.class7Code = this.scoreCardKeywordForm?.value.class7Code;
    this.scoreCardByKeywordData.class8Code = this.scoreCardKeywordForm?.value.class8Code;
  }

  getScoreCardKeywordFormSubmit() {
    this._localService.validateAllFormFields(this.scoreCardKeywordForm);
    if (this.scoreCardKeywordForm.valid) {
      this, this.getScoreCardByKeywordResponse();
    }
    else
      this._notifyService.showError("Invalid Scorecard By Keyword Fields", "", 3000);
  }


  async getScoreCardByKeywordResponse() {
    this.showSpinner = true;
    this.copyScoreCardByKeywordValue();
    await this._reportService.getScoreCardByKeyword(this.encryptedUser, this.user?.cLPCompanyID, this.user?.cLPUserID, this.scoreCardByKeywordData.officeCode, this.scoreCardByKeywordData.class7Code, this.scoreCardByKeywordData.class8Code, this.scoreCardByKeywordData.startDate, this.scoreCardByKeywordData.endDate)
      .then(async (result: ScoreCardByKeyword[]) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.scorecardKeywordResponse = response;
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

}
