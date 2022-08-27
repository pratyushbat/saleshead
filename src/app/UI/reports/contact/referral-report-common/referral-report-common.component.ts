import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { ReferralReport, ReferralReportResponse, ReferrerReport } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'app-referral-report-common',
    templateUrl: './referral-report-common.component.html',
    styleUrls: ['./referral-report-common.component.css']
})
export class ReferralReportCommonComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  private encryptedUser: string = '';
  gridHeight;
  @Input() user: CLPUser;
  @Input() selectedUserId: number;
  @Input() contactID: number;
  @Input() startDate: Date;
  @Input() endDate: Date;
  public pageSizes: number = 10;
  referralResponse: ReferralReportResponse;
  referralList: ReferralReport[];

  columns = [{ field: '$', title: '', width: '20' },
  { field: 'firstName', title: 'Name', width: '450' },
  { field: 'email', title: '', width: '20' },
  { field: 'companyName', title: 'Company', width: '60' },
  { field: 'userName', title: 'User', width: '60' },
  { field: 'dtCreated', title: 'Date Created', width: '60' },];
  constructor(
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _reportService: ReportService,
    private datepipe: DatePipe,
    private _router: Router) {
    this.gridHeight = this._localService.getGridHeight('493px');

  }

  ngOnInit(): void {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");      
      if (!isNullOrUndefined(this.user)) {
        this.getReferralList();
      }    
    }
    else
      this._router.navigate(['/login']);
  }

  async getReferralList() {
    this.showSpinner = true;
    let startDate = this.datepipe.transform(this.startDate, 'MM/dd/yyyy')
    let endDate = this.datepipe.transform(this.endDate, 'MM/dd/yyyy')
    await this._reportService.getContactReferralReport(this.encryptedUser, this.user.cLPCompanyID, this.selectedUserId, this.contactID, startDate ? startDate : '', endDate ? endDate : '')
      .then(async (result: ReferralReportResponse) => {
        if (result) {
          this.referralResponse = UtilityService.clone(result);
          this.referralList = this.referralResponse?.referralReport;
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
