import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { RevenueByManagerList, RevenueByManagerResponse, userListResponse } from '../../../../models/report.model';
import { ContactUploadMoreFilters, LookUpItem } from '../../../../models/contactExcelUpload';
import { CLPUser, OfficeCodeResponseIEnumerable, OfficeCodes, TeamCodeResponseIEnumerable, TeamCodes, UserResponse } from '../../../../models/clpuser.model';
import { eReportTimePeriod, eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { formatDate } from '@angular/common';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { ContactService } from '../../../../services/contact.service';
import { TeamOfficeSetupService } from '../../../../services/teamoffice.service';
import { OfficeSetupService } from '../../../../services/officeCode.service';
import { ClpCompany, CompanyResponse } from '../../../../models/company.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { DropDownItem } from '../../../../models/genericResponse.model';
@Component({
  selector: 'project-revenue-classification',
  templateUrl: './project-revenue-classification.component.html',
  styleUrls: ['./project-revenue-classification.component.css'],
  providers: [GridConfigurationService]
})
/** project-revenue-classification component*/
export class ProjectRevenueClassificationComponent {
  showSpinner: boolean = false;
  isSpecificDate: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  companyResponse: ClpCompany;
  projectRevenueClassificationResponse: RevenueByManagerList[];
  classificationDD: DropDownItem[];
  classificationById: number = 0;
  public initProjectRevenueClassification: any;
  date = new Date();
  officeCode: number = 0;
  teamCode: number = 0;
  filterBy: number = 0;
  filterValue: number = 0;
  isClassificationChange: boolean = true;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  isTimePeriod: any[] = [
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
    { field: 'split', title: ' ', width: '250' },
    { field: 'leads', title: '#Leads', width: '80' },
    { field: 'revenue', title: 'Estimated Revenue', width: '100' },
    { field: 'probability', title: 'Win Probability', width: '100' },
    { field: 'projected', title: 'Projected Revenue', width: '100' },
  ];
  reorderColumnName: string = 'split,leads,revenue,probability,projected';
  arrColumnWidth: any[] = ['split:250,leads:80,revenue:100,probability:100,projected:100'];
  columnWidth: string = 'split:250,leads:80,revenue:100,probability:100,projected:100';
  total = [];
  userFilterDD: LookUpItem[] = [];
  nameOnTable: string = '';
  nameChangeOnTable: boolean = false;
  teamFilterDD: TeamCodes[];
  officeFilterDD: OfficeCodes[];
  dateAfterName = '(0 to 3 months)';
  startDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy-MM-dd', 'en-US');
  startDtName: string = '';
  endDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'yyyy-MM-dd', 'en-US');
  endDtName: string = '';
  showStartDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'MMM yyyy', 'en-US');
  showEndDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'MMM yyyy', 'en-US');
  selectedValueUser: number = 0;
  selectedValueTeam: number = 0;
  selectedValueOffice: number = 0;

  constructor(public _localService: LocalService,
    private _utilityService: UtilityService,
    public _gridCnfgService: GridConfigurationService,
    private _reportService: ReportService,
    private _officeCodeservice: OfficeSetupService,
    private _teamOfficeService: TeamOfficeSetupService,
    private _contactService: ContactService,
    private _accountSetupService: AccountSetupService,
    private _router: Router) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
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
    await this._localService.authenticateUser(this.encryptedUser,)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this.filterValue = this.user.cLPUserID;
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
    this.showSpinner = true;
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'project_revenue_classification_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('project_revenue_classification_grid').subscribe((value) => this.getProjectClassificationRevenue()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'project_revenue_classification_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getCompanyFilterInformation() {
    await this._accountSetupService.getClpCompany(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CompanyResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.companyResponse = result?.company;
          this.onUsersDD();
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

  async getProjectClassificationRevenue() {
    this.showSpinner = true;
    await this._reportService.getProjectRevenueManager(this.encryptedUser, this.user.cLPCompanyID, this.classificationById, this.startDt, this.endDt, this.user.timeZone ? this.user.timeZone.toString() : 'UTC-08', this.filterBy, this.filterValue)
      .then(async (result: RevenueByManagerResponse) => {
        if (result) {
          if (this.isClassificationChange === true) {
            var res = UtilityService.clone(result);
            this.classificationDD = res?.ddRowColumns;
            this.isClassificationChange = false;
          }
          var res = UtilityService.clone(result);
          this.projectRevenueClassificationResponse = res?.revenueManagerList;
          this.initProjectRevenueClassification = this.projectRevenueClassificationResponse;
          this.setTotalInGrid();
          this._gridCnfgService?.iterateConfigGrid(this.projectRevenueClassificationResponse, "project_revenue_classification_grid");
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async contactUploadGetMoreFilters() {
    this.showSpinner = true;
    await this._contactService.contactUploadGetMoreFilters(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: ContactUploadMoreFilters) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.userFilterDD = res?.filter_Manager;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }


  setTotalInGrid() {
    this.total = [];
    for (let j = 0; j < this.projectRevenueClassificationResponse?.length; j++) {
      var k = 0;
      for (const property in this.projectRevenueClassificationResponse[j]) {
        if (j == 0) {
          this.total.push(this.projectRevenueClassificationResponse[j][property]);
        }
        else {
          this.total.push(this.projectRevenueClassificationResponse[j][property] + this.total[k]);
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
          this.userFilterDD = [];
          let response = UtilityService.clone(result);
          response.userDD.forEach(item => {
            this.userFilterDD.push({ value: item.key.toString(), text: item.value, lookupName: '' });
          })
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async onUsersDD() {
    this.showSpinner = true;
    await this._contactService.contactUploadGetMoreFilters(this.encryptedUser, this.user.cLPCompanyID).then(async (result: ContactUploadMoreFilters) => {
      if (result) {
        var res = UtilityService.clone(result);
        this.userFilterDD = res.filter_Manager;
        this.showSpinner = false;
      }
    })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
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
      case 'classification': {
        this.classificationById = id;
        this.getProjectClassificationRevenue();
        break;
      }
      case 'user': {
        this.filterBy = 1;
        this.filterValue = id;
        this.nameChangeOnTable = true;
        this.nameOnTable = 'by user : ' + this.userFilterDD.filter(item => item.value == id.toString())[0].text;
        this.getProjectClassificationRevenue();
        this.selectedValueTeam = 0;
        this.selectedValueOffice = 0;
        break;
      }
      case 'team': {
        this.filterBy = 2;
        this.filterValue = id;
        this.teamCode = id;
        this.nameChangeOnTable = true;
        this.nameOnTable = 'by team : ' + this.teamFilterDD.filter(item => item.teamCode == id)[0].display;
        this.getUserList();
        this.getProjectClassificationRevenue();
        this.selectedValueUser = 0;
        this.selectedValueOffice = 0;
        break;
      }
      case 'office': {
        this.filterBy = 3;
        this.filterValue = id;
        this.officeCode = id;
        this.nameChangeOnTable = true;
        this.nameOnTable = 'by office : ' + this.officeFilterDD.filter(item => item.officeCode == id)[0].display;
        this.getUserList();
        this.getProjectClassificationRevenue();
        this.selectedValueUser = 0;
        this.selectedValueTeam = 0;
        break;
      }
      default: {
        break;
      }
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
        this.dateAfterName = '';
        break;
      }
      default: {
        break;
      }
    }
    this.getProjectClassificationRevenue();
  }

  onProjectRevenueManagerFilter(inputValue: string): void {
    this.projectRevenueClassificationResponse = process(this.initProjectRevenueClassification, {
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
    this.dateAfterName = '';
    this.startDt = formatDate(value, 'yyyy-MM-dd', 'en-US');
    this.startDtName = formatDate(value, 'MM/dd/yyyy', 'en-US');
    if (this.endDtName != '') {
      this.showEndDt = this.endDtName;
      this.showStartDt = formatDate(value, 'MM/dd/yyyy', 'en-US');
    }
    this.getProjectClassificationRevenue();
  }

  onEndDate(value: string) {
    this.dateAfterName = '';
    this.endDt = formatDate(value, 'yyyy-MM-dd', 'en-US');
    this.endDtName = formatDate(value, 'MM/dd/yyyy', 'en-US');
    if (this.startDtName != '') {
      this.showEndDt = formatDate(value, 'MM/dd/yyyy', 'en-US');
      this.showStartDt = this.startDtName;
    }
    this.getProjectClassificationRevenue();
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Project Revenue Classification List`;
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

  showRevenueFilterDropdown(dropdownType: string): boolean {
    if (dropdownType == 'office')
      return (this.companyResponse?.showOfficeDD && this.user?.userRole > eUserRole.General);
    else if (dropdownType == 'team')
      return (this.companyResponse?.showTeamDD && this.user?.userRole > eUserRole.General);
    else
      return false;
  }

}
