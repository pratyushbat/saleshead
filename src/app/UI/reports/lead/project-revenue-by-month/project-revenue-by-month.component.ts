import { DatePipe, formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { RevenueByMonth, RevenueByMonthResponse, userListResponse } from '../../../../models/report.model';
import { CLPUser, OfficeCodeResponseIEnumerable, OfficeCodes, TeamCodeResponseIEnumerable, TeamCodes, UserResponse } from '../../../../models/clpuser.model';
import { ClpCompany, CompanyResponse } from '../../../../models/company.model';
import { ContactUploadMoreFilters, LookUpItem } from '../../../../models/contactExcelUpload';
import { eReportTimePeriod, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { ReportService } from '../../../../services/report.service';
import { OfficeSetupService } from '../../../../services/officeCode.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { TeamOfficeSetupService } from '../../../../services/teamoffice.service';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process } from '@progress/kendo-data-query';
import { ContactService } from '../../../../services/contact.service';

@Component({
  selector: 'app-project-revenue-by-month',
  templateUrl: './project-revenue-by-month.component.html',
  styleUrls: ['./project-revenue-by-month.component.css'],
  providers: [GridConfigurationService]
})
/** Project Revenue By Month component*/
export class ProjectRevenueByMonthComponent {
  isTimePeriodForm: FormGroup;
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  nameChangeOnTable: boolean = false;
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  companyResponse: ClpCompany;
  projectRevenueByMonthResponse: RevenueByMonth[];
  public initProjectRevenueByMonth: RevenueByMonth[];
  teamFilterDD: TeamCodes[];
  officeFilterDD: OfficeCodes[];
  total = [];
  mobileColumnNames: string[];
  nameOnTable: string = '';
  officeCode: number = 0;
  teamCode: number = 0;
  isFilterValue: number = 0;
  isFilterBy: number = 0;
  isUserDD: LookUpItem[];
  date = new Date();
  dateAfterName = '(0 to 3 months)';
  startDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy-MM-dd', 'en-US');
  startDtName: string = '';
  endDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'yyyy-MM-dd', 'en-US');
  endDtName: string = '';
  showStartDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'MMM yyyy', 'en-US');
  showEndDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'MMM yyyy', 'en-US');
  timePeriodId: number;
  datePipe = new DatePipe('en-US');
  selectedValueUser: number = 0;
  selectedValueTeam: number = 0;
  selectedValueOffice: number = 0;

  columns = [
    { field: '$', title: '', width: '40' },
    { field: 'displayMonth', title: '', width: '100' },
    { field: 'leads', title: 'Leads', width: '100' },
    { field: 'projected', title: 'Projected Revenue', width: '100' },
    { field: 'revenue', title: 'Net Revenue', width: '100' },
    { field: 'volume', title: 'Gross Revenue', width: '100' },
    { field: 'probability', title: 'Win Probability', width: '100' },
  ];
  reorderColumnName: string = 'displayMonth,leads,projected,revenue,volume,probability';
  arrColumnWidth: any[] = ['displayMonth:250,leads:80,projected:100,revenue:100,volume:80,probability:100'];
  columnWidth: string = 'displayMonth:250,leads:80,projected:100,revenue:100,volume:100,probability:100';
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;

  constructor(private fb: FormBuilder,
    private _router: Router,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _contactService: ContactService,
    private _officeCodeservice: OfficeSetupService,
    private _teamOfficeService: TeamOfficeSetupService,
    public _gridCnfgService: GridConfigurationService,
    private _reportService: ReportService,
    private _accountSetupService: AccountSetupService,
  ) {
    this._localService.isMenu = true;

  }
  ngOnInit(): void {
    this.isTimePeriodForm = new FormGroup({
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
    })

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getCompanyFilterInformation();
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
    this.showSpinner = false;
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'project_revenue_month_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('project_revenue_month_grid').subscribe((value) => this.getProjectRevenueByMonth()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'project_revenue_month_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getCompanyFilterInformation() {
    await this._accountSetupService.getClpCompany(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CompanyResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.companyResponse = result?.company;
          this.contactUploadGetMoreFilters();
          if (this.user?.userRole > eUserRole.General) {
            if (this.companyResponse?.showTeamDD)
              this.onTeamDD();
            if (this.companyResponse?.showOfficeDD)
              this.onOfficeDD();
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }


  async getProjectRevenueByMonth() {
    this.showSpinner = true;
    await this._reportService.getProjectRevenueByMonth(this.encryptedUser, this.user.cLPCompanyID, this.startDt, this.endDt, this.isFilterBy, this.isFilterValue)
      .then(async (result: RevenueByMonthResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.projectRevenueByMonthResponse = res?.revenueByMonthList;
          this.initProjectRevenueByMonth = this.projectRevenueByMonthResponse;
          this.setTotalInGrid();
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('project_revenue_month_grid');
            this._gridCnfgService.iterateConfigGrid(this.projectRevenueByMonthResponse, "project_revenue_month_grid");
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

  setTotalInGrid() {
    this.total = [];
    for (let j = 0; j < this.projectRevenueByMonthResponse?.length; j++) {
      var k = 0;
      for (const property in this.projectRevenueByMonthResponse[j]) {
        if (j == 0) {
          this.total.push(this.projectRevenueByMonthResponse[j][property]);
        }
        else {
          this.total.push(this.projectRevenueByMonthResponse[j][property] + this.total[k]);
        }
        k++;
      }
      if (j != 0)
        this.total.splice(0, k);
    }
  }

  async getUserList() {
    await this._reportService.getUsersDD(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.officeCode, this.teamCode)
      .then(async (result: userListResponse) => {
        if (result) {
          this.isUserDD = [];
          let response = UtilityService.clone(result);
          response.userDD.forEach(item => {
            this.isUserDD.push({ value: item.key.toString(), text: item.value, lookupName: '' });
          })
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async contactUploadGetMoreFilters() {
    this.showSpinner = true;
    await this._contactService.contactUploadGetMoreFilters(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: ContactUploadMoreFilters) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.isUserDD = res?.filter_Manager;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }


  async onTeamDD() {
    this.showSpinner = true;
    await this._teamOfficeService.teamCode_GetList(this.encryptedUser, this.user.cLPCompanyID).then(async (result: TeamCodeResponseIEnumerable) => {
      if (result) {
        var res = UtilityService.clone(result);
        this.teamFilterDD = res?.teamCodes;
        this.showSpinner = false;
      }
    })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }
  async onOfficeDD() {
    this.showSpinner = true;
    await this._officeCodeservice.OfficeCode_GetList(this.encryptedUser, this.user.cLPCompanyID).then(async (result: OfficeCodeResponseIEnumerable) => {
      if (result) {
        var res = UtilityService.clone(result);
        this.officeFilterDD = res?.officeCodes;
        this.showSpinner = false;
      }
    })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  getUserDD(filterValue: string, id: number) {
    switch (filterValue) {
      case 'user': {
        this.isFilterBy = 1;
        this.isFilterValue = id;
        this.nameChangeOnTable = true;
        this.nameOnTable = 'by user : ' + this.isUserDD.filter(item => item.value == id.toString())[0].text;
        this.getProjectRevenueByMonth();
        this.selectedValueTeam = 0;
        this.selectedValueOffice = 0;
        break;
      }
      case 'team': {
        this.isFilterBy = 2;
        this.isFilterValue = id;
        this.teamCode = id;
        this.nameChangeOnTable = true;
        this.nameOnTable = 'by team : ' + this.teamFilterDD.filter(item => item.teamCode == id)[0].display;
        this.getUserList();
        this.getProjectRevenueByMonth();
        this.selectedValueUser = 0;
        this.selectedValueOffice = 0;
        break;
      }
      case 'office': {
        this.isFilterBy = 3;
        this.isFilterValue = id;
        this.officeCode = id;
        this.nameChangeOnTable = true;
        this.nameOnTable = 'by office : ' + this.officeFilterDD.filter(item => item.officeCode == id)[0].display;
        this.getUserList();
        this.getProjectRevenueByMonth();
        this.selectedValueUser = 0;
        this.selectedValueTeam = 0;
        break;
      }
      default: {
        break;
      }
    }
  }

  onProjectRevenueByMonthFilter(inputValue: string): void {
    this.projectRevenueByMonthResponse = process(this.initProjectRevenueByMonth, {
      filter: {
        logic: "or",
        filters: [
          { field: 'displayMonth', operator: 'contains', value: inputValue },
          { field: 'lead', operator: 'contains', value: inputValue },
          { field: 'revenue', operator: 'contains', value: inputValue },
          { field: 'probability', operator: 'contains', value: inputValue },
          { field: 'projected', operator: 'contains', value: inputValue },
          { field: 'volume', operator: 'contains', value: inputValue },
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
  onTimePeriod(timePeriodId: number) {
    switch (timePeriodId) {
      case eReportTimePeriod.n0to3: {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(0 to 3 months)';
        this.getProjectRevenueByMonth();
        break;
      }
      case eReportTimePeriod.n3to6: {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 6, 0), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(3 to 6 months)';
        this.getProjectRevenueByMonth();
        break;
      }
      case eReportTimePeriod.n6to12: {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 6, 1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 12, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 6), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 12), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(6 to 12 months)';
        this.getProjectRevenueByMonth();
        break;
      }
      case eReportTimePeriod.nYTD: {
        this.startDt = formatDate(new Date(this.date.getFullYear(), 0), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), 0), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(YTD)';
        this.getProjectRevenueByMonth();
        break;
      }
      case eReportTimePeriod.nThisYear: {
        this.startDt = formatDate(new Date(this.date.getFullYear(), 0), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), 12, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear(), 0), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear(), 12, 0), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(This Year)';
        this.getProjectRevenueByMonth();
        break;
      }
      case eReportTimePeriod.nLastYear: {
        this.startDt = formatDate(new Date(this.date.getFullYear() - 1, 0), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear() - 1, 12, 0), 'yyyy-MM-dd', 'en-US');
        this.showStartDt = formatDate(new Date(this.date.getFullYear() - 1, 0), 'MMM yyyy', 'en-US');
        this.showEndDt = formatDate(new Date(this.date.getFullYear() - 1, 12, 0), 'MMM yyyy', 'en-US');
        this.dateAfterName = '(Last Year)';
        this.getProjectRevenueByMonth();
        break;
      }
      default: {
        break;
      }
    }
  }

  onSpecificDate() {
    this.startDt = this.datePipe.transform(this.isTimePeriodForm.value.fromDate, 'yyyy-MM-dd');
    this.endDt = this.datePipe.transform(this.isTimePeriodForm.value.toDate, 'yyyy-MM-dd');
    this.dateAfterName = '';
    this.getProjectRevenueByMonth();

  }

  showRevenueFilterDropdown(dropdownType: string): boolean {
    if (dropdownType == 'office')
      return (this.companyResponse?.showOfficeDD && this.user?.userRole > eUserRole.General);
    else if (dropdownType == 'team')
      return (this.companyResponse?.showTeamDD && this.user?.userRole > eUserRole.General);
    else
      return false;
  }


  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Project Manager Month List`;
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
