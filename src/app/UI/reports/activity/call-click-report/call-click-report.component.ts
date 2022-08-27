import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CallActionScreenResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
declare var $: any;
@Component({
  selector: 'app-call-click-report',
  templateUrl: './call-click-report.component.html',
  styleUrls: ['./call-click-report.component.css']
})
export class CallClickReportComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  columns = [];
  clickReportList: {}[];
  userList: CLPUser[];
  spanTitleText: string;
  public formGroup: FormGroup;
  callClickReportForm: FormGroup;
  mobileColumnNames: string[];

  constructor(private fb: FormBuilder,
    private datepipe: DatePipe,
    private _reportService: ReportService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.callClickReportForm = this.prepareCallClickReportForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this.getCallReportList();
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
          this.user = this.userResponse.user;
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.selectedUserId = this.user?.cLPUserID;
              this.callClickReportForm = this.prepareCallClickReportForm();
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

  prepareCallClickReportForm() {
    return this.fb.group({
      date: new FormControl(new Date()),
      ddUser: new FormControl(this.selectedUserId)
    });
  }
  async getCallReportList() {
    this.showSpinner = true;
    let date = this.datepipe.transform(this.callClickReportForm.controls.date.value, 'MM/dd/yyyy');
    await this._reportService.getClickReportList(this.encryptedUser, this.user.cLPCompanyID, this.callClickReportForm.controls.ddUser.value, date)
      .then(async (result: CallActionScreenResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.clickReportList = response.clickReport;
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
    for (const property in this.clickReportList[0]) {
      i++;
      this.columns.push({ field: `field${i}`, title: property, width: '100' });
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `CallClick List`;
    let rows = options.sheets[0].rows;
    rows.forEach((row, index) => {
      if (row && row.type == "data") {
        for (const property in component.data[index - 1]) {
          var i = 0;
          rows[0].cells.forEach((cell) => {
            if (property == cell.value) {
              row.cells[i].value = component.data[index - 1][property];
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
