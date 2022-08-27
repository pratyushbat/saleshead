import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { QualCallReportResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
declare var $: any;
@Component({
  selector: 'app-qualification-call-report',
  templateUrl: './qualification-call-report.component.html',
  styleUrls: ['./qualification-call-report.component.css'],
  providers: [GridConfigurationService]
})
export class QualificationCallReportComponent {

  gridHeight;
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  columns = [];
  ddFieldsResponse: QualCallReportResponse[];
  userList: CLPUser[];
  spanTitleText: string;
  public formGroup: FormGroup;
  qualCallForm: FormGroup;
  isWeekView: string = 'true';
  weekView: boolean = false;
  mobileColumnNames: string[];

  constructor(public _gridCnfgService: GridConfigurationService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    private _reportService: ReportService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.qualCallForm = this.prepareQualCallForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this.getQualCallList();
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.QualificationCallReport)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse?.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this.selectedUserId = this.user.cLPUserID;
              this.qualCallForm = this.prepareQualCallForm();
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

  prepareQualCallForm() {
    return this.fb.group({
      startDate: new FormControl(new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), [Validators.required]),
      endDate: new FormControl(new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)), [Validators.required]),
      ddUser: new FormControl(this.selectedUserId)
    });
  }

  async getQualCallList() {
    this.showSpinner = true;
    let startDate = this.datepipe.transform(this.qualCallForm.controls.startDate.value, 'yyyy-MM-dd');
    let endDate = this.datepipe.transform(this.qualCallForm.controls.endDate.value, 'yyyy-MM-dd');
    if (this.isWeekView == 'true')
      this.weekView = true
    else
      this.weekView = false;
    await this._reportService.getApptQualCallList(this.encryptedUser, this.user.cLPCompanyID, this.qualCallForm.controls.ddUser.value, startDate ? startDate : '', endDate ? endDate : '', this.weekView)
      .then(async (result: QualCallReportResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.ddFieldsResponse = response.qualCallList;
          this.spanTitleText = response.spanTitleText;
          this.userList = response.filterUserList;
          this.showSpinner = false;
          this.setGrid();
          if ($(window).width() >= 768 && $(window).width() <= 1024)
            this.mobileColumnNames = ['field1', 'field2', 'field3', 'field10'];
          else if ($(window).width() < 768)
            this.mobileColumnNames = ['field1', 'field2'];
          else
            this.mobileColumnNames = ['field1', 'field2'];
        } else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  setGrid() {
    var i = 0;
    this.columns = [];
    for (const property in this.ddFieldsResponse[0]) {
      i++;
      this.columns.push({ field: `field${i}`, title: property, width: '100' });
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `QualificationCallReport`;
    let rows = options.sheets[0].rows;
    rows.forEach((row, index) => {
      if (row && row.type == "data") {
        for (const property in component.data[index - 1]) {
          var i = 0;
          rows[0].cells.forEach((cell) => {
            if (property == cell.value) {
              row.cells[i].value = component.data[index - 1][property];
              if (row.cells[i] && row.cells[i].value && row.cells[i].value.includes("<br>"))
                row.cells[i].value = row.cells[i].value.replace(/<br\s*\/?>/gi, ' ');
            }
            i++;
          });
        }
      }
    });
    Array.prototype.unshift.apply(rows);
    component.save(options);
  }
}
