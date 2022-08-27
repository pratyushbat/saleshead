import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CompanyTwoDimensionResponse, userListResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-dist-two-dimensions',
  templateUrl: './dist-two-dimensions.component.html',
  styleUrls: ['./dist-two-dimensions.component.css']
})
export class DistTwoDimensionsComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  ddFieldsResponse: CompanyTwoDimensionResponse;
  columns = [];
  isSameRowCol: boolean = false;
  public formGroup: FormGroup;
  company2DForm: FormGroup;

  constructor(private fb: FormBuilder,
    private _reportService: ReportService,
    private datepipe: DatePipe,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
  }


  ngOnInit(): void {
    this.company2DForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.GetCompanyTwoDimensionDataDDFields();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  prepareTrackingForm() {
    return this.fb.group({
      startDate: new Date(),
      endDate: new Date(),
      rows: new FormControl(0),
      column: new FormControl(5),
      officeCode: new FormControl(0),
      teamCode: new FormControl(0),
      status: new FormControl(0),
      blnSetUser: new FormControl(false),
      isTeamChecked: new FormControl(false),
      isOfficedChecked: new FormControl(false),
      ddUser: new FormControl(this.user?.cLPUserID),
    });
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
              this.company2DForm = this.prepareTrackingForm();
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

  async getUserList() {
    await this._reportService.getCompany2DUsers(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.company2DForm.controls.officeCode.value, this.company2DForm.controls.teamCode.value, this.ddFieldsResponse?.userFilterData?.isMyOffice, this.ddFieldsResponse?.userFilterData?.isMyTeam, this.company2DForm.controls.isOfficedChecked.value, this.company2DForm.controls.isTeamChecked.value, this.company2DForm.controls.blnSetUser.value)
      .then(async (result: userListResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.ddFieldsResponse.userFilterData.userDD = response.userDD;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async GetCompanyTwoDimensionDataDDFields() {
    this.showSpinner = true;
    let startDate = this.datepipe.transform(this.company2DForm.controls.startDate.value, 'MM/dd/yyyy')
    let endDate = this.datepipe.transform(this.company2DForm.controls.endDate.value, 'MM/dd/yyyy')
    await this._reportService.getCompany2DList(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.company2DForm.controls.rows.value, this.company2DForm.controls.column.value, startDate, endDate, this.company2DForm.controls.ddUser.value)
      .then(async (result: CompanyTwoDimensionResponse) => {
        if (result) {
          this.ddFieldsResponse = UtilityService.clone(result);
          this.showSpinner = false;
          this.setGrid();
          this.company2DForm.get('column').setValue(this.ddFieldsResponse.ddRowsColumns[0].value)
          if (this.company2DForm.controls.rows.value == this.company2DForm.controls.column.value)
            this.isSameRowCol = true;
        } else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async updateCompanyTwoDimensionData() {
    if (this.company2DForm.controls.rows.value != this.company2DForm.controls.column.value) {
      this.isSameRowCol = false;
      this.showSpinner = true;
      let startDate = this.datepipe.transform(this.company2DForm.controls.startDate.value, 'MM/dd/yyyy')
      let endDate = this.datepipe.transform(this.company2DForm.controls.endDate.value, 'MM/dd/yyyy')
      await this._reportService.getCompany2dReport(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.company2DForm.controls.rows.value, this.company2DForm.controls.column.value, startDate ? startDate : null, endDate ? endDate : null, this.company2DForm.controls.ddUser.value)
        .then(async (result: CompanyTwoDimensionResponse) => {
          if (result) {
            let response = UtilityService.clone(result);
            this.ddFieldsResponse.companyTwoDimension = response.companyTwoDimension;
            this.company2DForm.get('column').setValue(this.ddFieldsResponse.ddRowsColumns[0].value)
            this.showSpinner = false;
            this.setGrid();
          } else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
    else {
      this.isSameRowCol = true;
    }
  }

  setGrid() {
    var i = 0;
    this.columns = [];
    if (!isNullOrUndefined(this.ddFieldsResponse?.companyTwoDimension)) {
      for (const property in this.ddFieldsResponse?.companyTwoDimension[0]) {
        i++;
        this.columns.push({ field: `field${i}`, title: property, width: '100' });
      }
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Company Distribution 2d`;
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
