import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
declare var $: any;

@Component({
    selector: 'app-appt-setters-activity',
    templateUrl: './appt-setters-activity.component.html',
    styleUrls: ['./appt-setters-activity.component.css']
})
export class ApptSettersActivityComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;


  public formGroup: FormGroup;
  apptSetterList = [];
  columns = [];
  apptSettersForm: FormGroup;
  mobileColumnNames: string[];
  isShowGrid: boolean = false;

  constructor(
    public _localService: LocalService,
    private fb: FormBuilder,
    private _reportService: ReportService,
    private _utilityService: UtilityService,
    private datepipe: DatePipe,
    private _router: Router,) {
    this._localService.isMenu = true;

  }

  ngOnInit(): void {
    this.apptSettersForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (isNullOrUndefined(this.user))      
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
              this.apptSettersForm = this.prepareTrackingForm();
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

  prepareTrackingForm() {
    const now = new Date();
    return this.fb.group({
      startDate: new FormControl(new Date(now.getFullYear(), now.getMonth(), 1), [Validators.required]),
      endDate: new FormControl(new Date(now.getFullYear(), now.getMonth()+1, 0), [Validators.required])
    });
  }

  async getApptSetterList() {
      this.showSpinner = true;
      this.isShowGrid = true;
      let startDate = this.datepipe.transform(this.apptSettersForm.controls.startDate.value, 'yyyy-MM-dd')
      let endDate = this.datepipe.transform(this.apptSettersForm.controls.endDate.value, 'yyyy-MM-dd')
    await this._reportService.getApptSetter(this.encryptedUser, this.user.cLPCompanyID, startDate ? startDate : '', endDate ? endDate : '')
        .then(async (result: []) => {
          if (result) {
            this.apptSetterList = UtilityService.clone(result);
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
    for (const property in this.apptSetterList[0]) {
      i++;
      this.columns.push({ field: `field${i}`, title: property, width: '100' });
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Appt Setters Activity`;
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
