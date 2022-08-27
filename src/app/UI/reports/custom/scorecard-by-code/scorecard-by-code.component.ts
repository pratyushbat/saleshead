import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { ScoreCardByCode } from '../../../../models/report.model';
import { CLPUser, OfficeCodeResponseIEnumerable, OfficeCodes, UserResponse } from '../../../../models/clpuser.model';
import { ContactUploadMoreFilters, LookUpItem } from '../../../../models/contactExcelUpload';
import { CreateExportFor, eExportRequestObjectType, eExportRequestStatus, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { ContactService } from '../../../../services/contact.service';
import { OfficeSetupService } from '../../../../services/officeCode.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
@Component({
    selector: 'app-scorecard-by-code',
    templateUrl: './scorecard-by-code.component.html',
  styleUrls: ['./scorecard-by-code.component.css']
})
export class ScorecardByCodeComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  eStat: number = eExportRequestStatus.None;
  createExportFor: number = CreateExportFor.ScoreCardByCode;
  eType: number = eExportRequestObjectType.InventHelp_ScorecardByCode_Report;
  userFilterDD: LookUpItem[] = [];
  officeFilterDD: OfficeCodes[];
  isShowScoreCardGrid: boolean = false;
  scoreCardCodeList: ScoreCardByCode[]
  headerTitle: string = '';
  scoreCardCodeForm: FormGroup;
  mobileColumnNames: string[];
  hiddenColumns: string[] = [];

  constructor(
    private fb: FormBuilder,
    private _reportService: ReportService,
    private _officeCodeservice: OfficeSetupService,
    private _contactService: ContactService,
    private datepipe: DatePipe,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router,) {
    this._localService.isMenu = true;
  }
  ngOnInit(): void {
    this.scoreCardCodeForm = this.prepareScoreCardForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          if (this.user?.cLPCompanyID == 1226) {
            this.onUsersDD();
            this.onOfficeDD();
          }
          else
            this._router.navigate(['/report/rptuseractivity']);
        }          
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser)
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
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this.scoreCardCodeForm = this.prepareScoreCardForm();
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

  prepareScoreCardForm() {
    const now = new Date();
    return this.fb.group({
      startDate: new FormControl(new Date(now.getFullYear(), now.getMonth(), 1), [Validators.required]),
      endDate: new FormControl(new Date(now.getFullYear(), now.getMonth() + 1, 0), [Validators.required]),
      officeCode: new FormControl(0),
      ddUser: new FormControl(this.user?.cLPUserID),
    });
  }

  async onUsersDD() {
    this.showSpinner = true;
    await this._contactService.contactUploadGetMoreFilters(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: ContactUploadMoreFilters) => {
      if (result) {
        var res = UtilityService.clone(result);
        this.userFilterDD = res.filter_Manager;
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

  async getScoreCardCodeList() {
    this.scoreCardCodeForm.markAllAsTouched();
    if (this.scoreCardCodeForm.valid) {
      this.showSpinner = true;
      var startDate = this.datepipe.transform(this.scoreCardCodeForm.controls.startDate.value, 'yyyy-MM-dd')
      var endDate = this.datepipe.transform(this.scoreCardCodeForm.controls.endDate.value, 'yyyy-MM-dd')
      this.selectedUserId = this.scoreCardCodeForm.controls.ddUser.value ? this.scoreCardCodeForm.controls.ddUser.value : this.user.cLPUserID;
      await this._reportService.getScoreCardByCode(this.encryptedUser, this.user?.cLPCompanyID, this.selectedUserId, this.scoreCardCodeForm.controls.officeCode.value, startDate ? startDate : '', endDate ? endDate : '')
        .then(async (result: ScoreCardByCode[]) => {
          if (result) {
            this.headerTitle = `Scorecard By Lead Source Report From: ${startDate} To: ${endDate}`
            this.isShowScoreCardGrid = true;
            this.scoreCardCodeList = UtilityService.clone(result);
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
}
