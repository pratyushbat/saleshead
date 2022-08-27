import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { empty } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { ApptTwoDimensionResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { UserService } from '../../../../services/user.service';
declare var $: any;
@Component({
  selector: 'app-appt-two-dimensions',
  templateUrl: './appt-two-dimensions.component.html',
  styleUrls: ['./appt-two-dimensions.component.css']
})
export class ApptTwoDimensionsComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  ddFieldsResponse: ApptTwoDimensionResponse;
  isSameRowCol: boolean = false;
  columns = [];
  total = [];
  public formGroup: FormGroup;
  appointment2DForm: FormGroup;
  mobileColumnNames: string[];

  constructor(private _notifyService: NotificationService,
    private fb: FormBuilder,
    private _userService: UserService,
    private _reportService: ReportService,
    private datepipe: DatePipe,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router,) {
    this._localService.isMenu = true;
  }
  ngOnInit(): void {
    this.appointment2DForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this.getApptTwoDimensionDataDDFields();
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  prepareTrackingForm() {
    return this.fb.group({
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      rows: new FormControl(0),
      column: new FormControl(5),
      officeCode: new FormControl(0),
      teamCode: new FormControl(0),
      status: new FormControl(0),
      ddUser: new FormControl(this.user?.cLPUserID),
    });
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.AppointmentsbyTwoDimensions)
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
              this.appointment2DForm = this.prepareTrackingForm();
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

  async getApptTwoDimensionDataDDFields() {
    if (this.appointment2DForm.controls.rows.value != this.appointment2DForm.controls.column.value) {
      this.showSpinner = true;
      this.isSameRowCol = false;
      let startDate = this.datepipe.transform(this.appointment2DForm.controls.startDate.value, 'yyyy-MM-dd')
      let endDate = this.datepipe.transform(this.appointment2DForm.controls.endDate.value, 'yyyy-MM-dd')
      await this._reportService.getApptTwoDimensionFields(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.appointment2DForm.controls.rows.value, this.appointment2DForm.controls.column.value, startDate ? startDate : '', endDate ? endDate : '', this.appointment2DForm.controls.status.value, this.appointment2DForm.controls.ddUser.value)
        .then(async (result: ApptTwoDimensionResponse) => {
          if (result) {
            this.ddFieldsResponse = UtilityService.clone(result);
            this.showSpinner = false;
            this.setGrid();
            if ($(window).width() >= 768 && $(window).width() <= 1024)
              this.mobileColumnNames = ['field1', 'field2', 'field3', 'field10'];
            else if ($(window).width() < 768)
              this.mobileColumnNames = ['field1', 'field2'];
            else
              this.mobileColumnNames = ['field1', 'field2'];
            //this.clpuser_GetList_Lite();
          } else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
    else
      this.isSameRowCol = true;

  }

  async clpuser_GetList_Lite() {
    await this._userService.clpuser_GetList_Lite(this.encryptedUser, this.user.cLPCompanyID, this.appointment2DForm.controls.teamCode.value, this.appointment2DForm.controls.officeCode.value)
      .then(async (result: SimpleResponse) => {
        if (result) {
          let response: SimpleResponse = UtilityService.clone(result);
          this.ddFieldsResponse.ddUser = this.convertDictionaryToAnyType(response.dictionary);
          //this.ddFieldsResponse.ddUser
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  setGrid() {
    var i = 0;
    this.columns = [];
    this.total = [];
    for (const property in this.ddFieldsResponse.appointmentTwoDimension[0]) {
      i++;
      this.columns.push({ field: `field${i}`, title: property, width: '100' });
    }
    for (let j = 0; j < this.ddFieldsResponse?.appointmentTwoDimension?.length; j++) {
      var k = 0;
      for (const property in this.ddFieldsResponse.appointmentTwoDimension[j]) {
        if (j == 0) {
          this.total.push(this.ddFieldsResponse.appointmentTwoDimension[j][property]);
        }
        else {
          this.total.push(this.ddFieldsResponse.appointmentTwoDimension[j][property] + this.total[k]);
        }
        k++;
      }
      if (j != 0)
        this.total.splice(0, k);
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Appointment 2d`;
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

  convertDictionaryToAnyType(dictionary: any[]): any[] {
    let toList: any[] = [];
    for (let key in dictionary) {
      let value = dictionary[key];
      let anyTypeObject: any = { key: parseInt(key), value: value }
      toList.push(anyTypeObject);
    }
    return toList;
  }
}
