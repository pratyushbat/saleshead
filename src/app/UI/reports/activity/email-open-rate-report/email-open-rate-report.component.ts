import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { EmailOpenRateReportResponse, EmailOpenReportList, QualCallReportResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-email-open-rate-report',
  templateUrl: './email-open-rate-report.component.html',
  styleUrls: ['./email-open-rate-report.component.css'],
  providers: [GridConfigurationService]
})
export class EmailOpenRateReportComponent {

  gridHeight;
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  ddFieldsResponse: EmailOpenReportList[];
  userList: CLPUser[];
  public formGroup: FormGroup;
  emailOpenForm: FormGroup;
  columns = [
    { field: 'subject', title: 'Subject', width: '100' },
    { field: 'emailType', title: 'Email Type', width: '90' },
    { field: 'all', title: 'All', width: '40' },
    { field: 'opened', title: 'Opened', width: '40' },
    { field: 'openRate', title: 'Open Rate', width: '40' },
    { field: 'sentDate', title: 'Sent Date', width: '60' }];
  reorderColumnName: string = 'subject,emailType,all,opened,openRate,sentDate';
  columnWidth: string = 'subject:100,emailType:90,all:40,opened:40,openRate:40,sentDate:60';
  arrColumnWidth: any[] = ['subject:100,emailType:90,all:40,opened:40,openRate:40,sentDate:60'];
  mobileColumnNames: string[];

  constructor(public _gridCnfgService: GridConfigurationService,
    private _reportService: ReportService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
  }
  ngOnInit(): void {
    this.emailOpenForm = this.prepareTrackingForm();
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
    await this._localService.authenticateUser(this.encryptedUser)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this.selectedUserId = this.user.cLPUserID;
              this.emailOpenForm = this.prepareTrackingForm();
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
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'email_open_rate_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('email_open_rate_grid').subscribe((value) => this.getEmailOpenlist()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'email_open_rate_grid').subscribe((value) => this.getGridConfiguration());
  }

  prepareTrackingForm() {
    const now = new Date();
    return this.fb.group({
      startDate: new FormControl(new Date(now.getFullYear(), now.getMonth(), 1), [Validators.required]),
      endDate: new FormControl(new Date(now.getFullYear(), now.getMonth() + 1, 0), [Validators.required]),
      ddUser: new FormControl(this.selectedUserId),
      category: new FormControl(''),
    });
  }

  async getEmailOpenlist() {
    this.showSpinner = true;
    let startDate = this.datepipe.transform(this.emailOpenForm.controls.startDate.value, 'yyyy-MM-dd');
    let endDate = this.datepipe.transform(this.emailOpenForm.controls.endDate.value, 'yyyy-MM-dd');
    await this._reportService.getEmaiOpenReportList(this.encryptedUser, this.user.cLPCompanyID, this.emailOpenForm.controls.ddUser.value, startDate, endDate, this.emailOpenForm.controls.category.value)
      .then(async (result: EmailOpenRateReportResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.ddFieldsResponse = response.emailOpenReportList;
          this.userList = response.filterUserList;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('email_open_rate_grid');
            this._gridCnfgService.iterateConfigGrid(this.userList, "email_open_rate_grid");
          }
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

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `EmailOpenReport`;
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
