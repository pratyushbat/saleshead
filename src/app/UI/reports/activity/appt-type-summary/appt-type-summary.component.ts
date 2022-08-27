import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { AppointmentData, ApptTypeSummaryResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-appt-type-summary',
  templateUrl: './appt-type-summary.component.html',
  styleUrls: ['./appt-type-summary.component.css'],
  providers: [{ provide: 'GridConfigurationService', useClass: GridConfigurationService },
  { provide: 'GridConfigurationService1', useClass: GridConfigurationService }]
})
export class ApptTypeSummaryComponent {

  gridHeight;
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  appointmentTypeDataYTD: AppointmentData[];
  appointmentTypeDataMonth: AppointmentData[];
  appointmentTypeResponse: ApptTypeSummaryResponse;
  public formGroup: FormGroup;
  appointmentTypeForm: FormGroup;
  ddField: number = 701;
  calType: number = 0;
  appCategoryYTD: number = 2;
  columns = [
    { field: 'display', title: 'Type', width: '200' },
    { field: 'pending', title: 'Pending', width: '40' },
    { field: 'completed', title: 'Completed', width: '40' },
    { field: 'cancelled', title: 'Cancelled', width: '40' }];
  reorderColumnName: string = 'display,pending,completed,cancelled';
  columnWidth: string = 'display:200,pending:40,completed:40,cancelled:40';
  arrColumnWidth: any[] = ['display:200,pending:40,completed:40,cancelled:40'];
  mobileColumnNames: string[];

  constructor(private _reportService: ReportService,
    private fb: FormBuilder,
    @Inject('GridConfigurationService') public _gridCnfgService: GridConfigurationService,
    @Inject('GridConfigurationService1') public _gridCnfgServiceYTD: GridConfigurationService,
    private datepipe: DatePipe,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router,) {
    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('493px');
  }
  ngOnInit(): void {
    this.appointmentTypeForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getYTDGridConfiguration();
          this.getGridConfiguration();
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
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.AppointmentTypeSummary)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this.selectedUserId = this.user.cLPUserID;
              this._gridCnfgService.user = this.user;
              this._gridCnfgServiceYTD.user = this.user;
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

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'appt_type_summary_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('appt_type_summary_grid').subscribe((value) => this.getApptTypeSummary(this.appointmentTypeForm.controls.appCategory.value, true, true)));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'appt_type_summary_grid').subscribe((value) => this.getGridConfiguration());
  }
  getYTDGridConfiguration() {
    this._gridCnfgServiceYTD.columns = this.columns;
    this._gridCnfgServiceYTD.reorderColumnName = this.reorderColumnName;
    this._gridCnfgServiceYTD.columnWidth = this.columnWidth;
    this._gridCnfgServiceYTD.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgServiceYTD.getGridColumnsConfiguration(this.user.cLPUserID, 'appt_type_summary_YTD_grid').subscribe((value) => this._gridCnfgServiceYTD.createGetGridColumnsConfiguration('appt_type_summary_YTD_grid').subscribe((value) => this.getApptTypeSummary(this.appCategoryYTD, true, true)));
  }
  resetYTDGridSetting() {
    this._gridCnfgServiceYTD.deleteColumnsConfiguration(this.user.cLPUserID, 'appt_type_summary_YTD_grid').subscribe((value) => this.getYTDGridConfiguration());
  }

  prepareTrackingForm() {
    const now = new Date();
    return this.fb.group({
      fromDate: new FormControl(new Date(now.getFullYear(), now.getMonth(), 1), [Validators.required]),
      toDate: new FormControl(new Date(), [Validators.required]),
      appCategory: new FormControl(2),
    });
  }

  async getApptTypeSummary(appCategory, isYTD, isMonth) {
    this.showSpinner = true
    this.setDDFields(appCategory);
    let fromDate = this.datepipe.transform(this.appointmentTypeForm.controls.fromDate.value, 'MM/dd/yyyy')
    let toDate = this.datepipe.transform(this.appointmentTypeForm.controls.toDate.value, 'MM/dd/yyyy')
    await this._reportService.getApptTypeSummary(this.encryptedUser, this.selectedUserId, this.user.cLPCompanyID, fromDate, toDate, this.calType, appCategory, this.ddField)
      .then(async (result: ApptTypeSummaryResponse) => {
        if (result) {
          this.appointmentTypeResponse = UtilityService.clone(result);
          if (isYTD)
            this.appointmentTypeDataYTD = this.appointmentTypeResponse.appointmentDataYTD.appointmentData;
          if (isMonth)
            this.appointmentTypeDataMonth = this.appointmentTypeResponse.appointmentDataMonth.appointmentDataMonth;
          this.showSpinner = false;
        }
        if (!isNullOrUndefined(this._gridCnfgService)) {
          this._gridCnfgService.iterateConfigGrid(this.appointmentTypeResponse, "appt_type_summary_YTD_grid");
          this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('appt_type_summary_YTD_grid');
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

  setAppCategoryfields(categoryId) {
    switch (categoryId) {
      case 1:
        this.ddField = 700;
        this.appointmentTypeForm.get('appCategory').setValue(1);
        this.appCategoryYTD = 1;
        break;
      case 2:
        this.ddField = 701;
        this.appointmentTypeForm.get('appCategory').setValue(2);
        this.appCategoryYTD = 2;
        break;
      case 3:
        this.ddField = 702;
        this.appointmentTypeForm.get('appCategory').setValue(3);
        this.appCategoryYTD = 3;
        break;
    }
    this.getApptTypeSummary(this.appCategoryYTD, true, true);
  }

  setDDFields(id) {
    switch (id) {
      case '1':
        this.ddField = 700;
        break;
      case '2':
        this.ddField = 701;
        break;
      case '3':
        this.ddField = 702;
        break;
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Appointment List`;
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
