import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { ClickCount, ClickCountResponse, ClickTrackingData } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eUserRole, SearchContactBy } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-click-tracking-report',
  templateUrl: './click-tracking-report.component.html',
  styleUrls: ['./click-tracking-report.component.css'],
  providers: [GridConfigurationService]
})

export class ClickTrackingReportComponent {
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  isShowContactList: boolean = false;
  public isShowGridData: number = 0;
  clickId: number = 0;
  searchBy: number = 0;
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  clickTrackingForm: FormGroup;
  clickCountResponse: ClickCount[];
  initClickCountResponse: ClickCount[];
  clickTrackingData: ClickTrackingData = <ClickTrackingData>{};
  datePipe = new DatePipe('en-US');

  columns = [
    { field: '$', title: '', width: '40' },
    { field: 'destinationUrl', title: 'Destination Url', width: '200' },
    { field: 'count', title: 'Type', width: '50' },
    { field: 'search', title: '', width: '20' },
  ];
  reorderColumnName: string = 'destinationUrl,count,search';
  arrColumnWidth: string[] = ['destinationUrl:200,count:50,search:20'];
  columnWidth: string = 'destinationUrl:200,count:50,search:20';

  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;

  constructor(private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    public _gridCnfgService: GridConfigurationService,
    private _reportService: ReportService,
    private _notifyService: NotificationService,
    private fb: FormBuilder) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.clickTrackingForm = this.prepareClickTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
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
    await this._localService.authenticateUser(this.encryptedUser,)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse?.user;
              this.roleFeaturePermissions = this.userResponse?.roleFeaturePermissions;
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
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
    this.showSpinner = false;
  }
  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'click_tracking_report_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('click_tracking_report_grid').subscribe((value) => { }));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'click_tracking_report_grid').subscribe((value) => this.getGridConfiguration());
  }

  prepareClickTrackingForm() {
    return this.fb.group({
      startDt: '',
      endDt: '',
    })
  }

  copyClickTrackingFormValue() {
    this.clickTrackingData.startDt = this.datePipe.transform(this.clickTrackingForm.value.startDt, 'yyyy-MM-dd');
    this.clickTrackingData.endDt = this.datePipe.transform(this.clickTrackingForm.value.endDt, 'yyyy-MM-dd');
  }

  clickTrackingFormSubmit() {
    this._localService.validateAllFormFields(this.clickTrackingForm);
    if (this.clickTrackingForm.valid) {
      this.copyClickTrackingFormValue();
      this.getClickTrackingResponse();
    }
    else
      this._notifyService.showError("Invalid Click Tracking Fields", "", 3000);
  }

  async getClickTrackingResponse() {
    if (!isNullOrUndefined(this.clickTrackingData.startDt) && !isNullOrUndefined(this.clickTrackingData.endDt)) {
      if (this.clickTrackingData.startDt > this.clickTrackingData.endDt) {
        this.isShowGridData = 3
      }
      else
        this.isShowGridData = 1;
      this.showSpinner = true;
      await this._reportService.getClickCountData(this.encryptedUser, this.user.cLPCompanyID, this.clickTrackingData?.startDt, this.clickTrackingData?.endDt)
        .then(async (result: ClickCountResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.clickCountResponse = response?.clickCount;
            this.initClickCountResponse = response?.clickCount;
            console.log(response)
            this.showSpinner = false
          }
          else
            this.showSpinner = false
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
          this.showSpinner = false;
        });
    }
    else
      this.isShowGridData = 2;
  }

  onClickSearch(getClickId: ClickCount) {    
    this.isShowContactList = false;  
    setTimeout(() => {                          
      this.isShowContactList = true;
    }, 500);
    this.searchBy = SearchContactBy.ClickTracking;
    this.clickId = getClickId.clickId;
    
  }

  saveClickTrackingExl(component) {
    this.saveExcel(component, 'Click Tracking List');
  }

  saveExcel(component, sheetName) {
    const options = component.workbookOptions();
    options.sheets[0].name = sheetName;
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

  onClickTrackingFilter(inputValue: string): void {
    this.clickCountResponse = process(this.initClickCountResponse, {
      filter: {
        logic: "or",
        filters: [
          { field: 'destinationUrl', operator: 'contains', value: inputValue },
          { field: 'count', operator: 'contains', value: inputValue },
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }


}
