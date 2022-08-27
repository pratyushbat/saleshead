import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { RevenueByManagerList, RevenueByManagerResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eReportTimePeriod, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { ReportService } from '../../../../services/report.service';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { formatDate } from '@angular/common';
import { ClpCompany, CompanyResponse } from '../../../../models/company.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';

@Component({
  selector: 'project-revenue-manager',
  templateUrl: './project-revenue-manager.component.html',
  styleUrls: ['./project-revenue-manager.component.css'],
  providers: [GridConfigurationService]
})
/** project-revenue-manager component*/
export class ProjectRevenueManagerComponent {
  /** project-revenue-manager ctor */

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  isSpecificDate: boolean = false;
  companyResponse: ClpCompany;
  public initProjectRevenueManager: RevenueByManagerList[];
  projectRevenueManagerResponse: RevenueByManagerList[];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  distributedBy: any = [];
  distributeName: string = 'Manager'
  timePeriod: any[] = [
    { value: 1, name: "0-3 months" },
    { value: 2, name: "3-6 months" },
    { value: 3, name: "6-12 months" },
    { value: 4, name: "Year to Date" },
    { value: 5, name: "This Year" },
    { value: 6, name: "Last Year" },
    { value: 7, name: "Specific Dates" },
  ];
  columns = [
    { field: '$', title: '', width: '40' },
    { field: 'split', title: 'Manager ', width: '250' },
    { field: 'leads', title: '# Leads', width: '80' },
    { field: 'revenue', title: 'Estimated Revenue', width: '100' },
    { field: 'probability', title: 'Win Probability', width: '100' },
    { field: 'projected', title: 'Projected Revenue', width: '100' },
  ];
  total = [];
  reorderColumnName: string = 'split,leads,revenue,probability,projected';
  arrColumnWidth: any[] = ['split:250,leads:80,revenue:100,probability:100,projected:100'];
  columnWidth: string = 'split:250,leads:80,revenue:100,probability:100,projected:100';
  date = new Date();
  splitId: number;
  dateAfterName = '(0 to 3 months)';
  startDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy-MM-dd', 'en-US');
  startDtName: string = '';
  endDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'yyyy-MM-dd', 'en-US');
  endDtName: string = '';
  showStartDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'MMM yyyy', 'en-US');
  showEndDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'MMM yyyy', 'en-US');
  mobileColumnNames: string[];

  constructor(public _localService: LocalService,
    private _utilityService: UtilityService,
    public _gridCnfgService: GridConfigurationService,
    private _reportService: ReportService,
    private _accountSetupService: AccountSetupService,
    private _router: Router) {
    this._localService.isMenu = true;
  }


  ngOnInit(): void {
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
    await this._localService.authenticateUser(this.encryptedUser,)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
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
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'project_manager_revenue_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('project_manager_revenue_grid').subscribe((value) => this.getCompanyFilterInformation()));
  }

  async getCompanyFilterInformation() {
    this.showSpinner = true;
    await this._accountSetupService.getClpCompany(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CompanyResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.companyResponse = result.company;
          this.showSpinner = false;

          this.distributedBy = [];
          if (this.user?.userRole > eUserRole.General) {
            this.distributedBy.push({ id: 0, name: '-All-' }, { id: 1, name: 'User' })
            if (this.companyResponse?.showTeamDD === true) {
              this.distributedBy.push({ id: 2, name: 'Team' })
            }
            if (this.companyResponse?.showOfficeDD === true) {
              this.distributedBy.push({ id: 3, name: 'Office' })
            }
            this.splitId = 0;
            this.getProjectManagerRevenue(this.splitId);
          }
          else {
            this.distributedBy.push({ id: 1, name: 'User' })
            this.splitId = 0;
            this.getProjectManagerRevenue(this.splitId);
          }
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

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'project_manager_revenue_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getProjectManagerRevenue(split: number) {
    this.showSpinner = true;
    await this._reportService.getProjectRevenueManager(this.encryptedUser, this.user.cLPCompanyID, split, this.startDt, this.endDt, this.user.timeZone ? this.user.timeZone.toString() : 'UTC-08', split, this.user.cLPUserID)
      .then(async (result: RevenueByManagerResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.projectRevenueManagerResponse = res?.revenueManagerList;
          this.initProjectRevenueManager = this.projectRevenueManagerResponse;
          this.setTotalInGrid();
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('project_manager_revenue_grid');
            this._gridCnfgService.iterateConfigGrid(this.projectRevenueManagerResponse, "project_manager_revenue_grid");
          }
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  getSplitId(id: number) {
    switch (id.toString()) {
      case '0': {
        this.distributeName = 'Company';
        break;
      }
      case '1': {
        this.distributeName = 'Manager';
        break;
      }
      case '2': {
        this.distributeName = 'Team';
        break;
      }
      case '3': {
        this.distributeName = 'Office';
        break;
      }
      default: {
        break;
      }
    }
    this.splitId = id;
    this.getProjectManagerRevenue(this.splitId);
  }
  setTotalInGrid() {
    this.total = [];
    for (let j = 0; j < this.projectRevenueManagerResponse?.length; j++) {
      var k = 0;
      for (const property in this.projectRevenueManagerResponse[j]) {
        if (j == 0) {
          this.total.push(this.projectRevenueManagerResponse[j][property]);
        }
        else {
          this.total.push(this.projectRevenueManagerResponse[j][property] + this.total[k]);
        }
        k++;
      }
      if (j != 0)
        this.total.splice(0, k);
    }

  }

  getTimePeriod(timePeriodId: string) {
    this.isSpecificDate = false;
    switch (timePeriodId) {
      case eReportTimePeriod.n0to3.toString(): {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(0 to 3 months)';
        break;
      }
      case eReportTimePeriod.n3to6.toString(): {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(3 to 6 months)';
        break;
      }
      case eReportTimePeriod.n6to12.toString(): {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 6, 1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 12, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 6), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 12), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(6 to 12 months)';
        break;
      }
      case eReportTimePeriod.nYTD.toString(): {
        this.startDt = formatDate(new Date(this.date.getFullYear(), 0), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), 0), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(YTD)';
        break;
      }
      case eReportTimePeriod.nThisYear.toString(): {
        this.startDt = formatDate(new Date(this.date.getFullYear(), 0), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), 12, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), 0), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear(), 12, 0), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(This Year)';
        break;
      }
      case eReportTimePeriod.nLastYear.toString(): {
        this.startDt = formatDate(new Date(this.date.getFullYear() - 1, 0), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear() - 1, 12, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear() - 1, 0), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear() - 1, 12, 0), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(Last Year)';
        break;
      }
      case eReportTimePeriod.nSpecificDates.toString(): {
        this.isSpecificDate = true;
        break;
      }
      default: {
        break;
      }
    }
    this.getProjectManagerRevenue(this.splitId);
  }

  onProjectRevenueManagerFilter(inputValue: string): void {
    this.projectRevenueManagerResponse = process(this.initProjectRevenueManager, {
      filter: {
        logic: "or",
        filters: [
          { field: 'split', operator: 'contains', value: inputValue },
          { field: 'lead', operator: 'contains', value: inputValue },
          { field: 'revenue', operator: 'contains', value: inputValue },
          { field: 'probability', operator: 'contains', value: inputValue },
          { field: 'projected', operator: 'contains', value: inputValue },
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  onStartDate(value: string) {
    this.startDt = formatDate(value, 'yyyy-MM-dd', 'en-US');
    this.startDtName = formatDate(value, 'MM/dd/yyyy', 'en-US');
    if (this.endDtName != '') {
      this.showEndDt = this.endDtName;
      this.showStartDt = formatDate(value, 'MM/dd/yyyy', 'en-US');
      this.dateAfterName = '';
    }
    this.getProjectManagerRevenue(this.splitId);

  }

  onEndDate(value: string) {

    this.endDt = formatDate(value, 'yyyy-MM-dd', 'en-US');
    this.endDtName = formatDate(value, 'MM/dd/yyyy', 'en-US');
    if (this.startDtName != '') {
      this.showEndDt = formatDate(value, 'MM/dd/yyyy', 'en-US');
      this.showStartDt = this.startDtName;
      this.dateAfterName = '';
    }
    this.getProjectManagerRevenue(this.splitId);
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Project Manager Revenue List`;
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
