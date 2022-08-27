import { DatePipe, formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { isNullOrUndefined } from 'util';
import { clpUserFilterResponse, LeadTwoDimensionResponse, userListResponse } from '../../../../models/report.model';
import { CLPUser, OfficeCodeResponseIEnumerable, OfficeCodes, TeamCodeResponseIEnumerable, TeamCodes, UserResponse } from '../../../../models/clpuser.model';
import { ClpCompany, CompanyResponse } from '../../../../models/company.model';
import { ContactUploadMoreFilters, LookUpItem } from '../../../../models/contactExcelUpload';
import { eMeasure, eUserRole } from '../../../../models/enum.model';
import { DropDownItem } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { ReportService } from '../../../../services/report.service';
import { ContactService } from '../../../../services/contact.service';
import { OfficeSetupService } from '../../../../services/officeCode.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { TeamOfficeSetupService } from '../../../../services/teamoffice.service';

@Component({
  selector: 'app-distribution-by-two-dimensions',
  templateUrl: './distribution-by-two-dimensions.component.html',
  styleUrls: ['./distribution-by-two-dimensions.component.css'],
  providers: [GridConfigurationService]
})

export class DistributionByTwoDimensionsComponent {
  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  userResponse: UserResponse;
  companyResponse: ClpCompany;
  isUserDD: LookUpItem[];
  private encryptedUser: string = '';
  teamFilterDD: TeamCodes[];
  officeFilterDD: OfficeCodes[];
  ddRowsColumns: DropDownItem[];
  ddRows: DropDownItem[];
  ddMeasure: DropDownItem[];
  ddDateFilter: DropDownItem[];
  userFilterData: clpUserFilterResponse[];
  leadTwoDimensionResponse: [{}];
  leadSearchUserList: [];
  columns = [];
  getTwoDimensionsForm: FormGroup;
  datePipe = new DatePipe('en-US');
  date = new Date();
  startDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy/MM/dd', 'en-US');
  endDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy/MM/dd', 'en-US');
  strStart: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy/MM/dd', 'en-US');
  strEnd: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy/MM/dd', 'en-US');
  ur: number = 0;
  isMgrView: boolean = true;
  isSameRowCol: boolean = false;
  loggedInUserId: number = 0;
  strMeasure: string = '';
  strdim1: string = '';
  strdim1val: string = '';
  strdim2: string = '';
  strdim2val: string = '';
  strDateFilter: string = '';
  rpt: string = '';
  tableRowName: string = 'Users';
  tableColumnName: string = 'Lead Status';
  public isShowLadSearch: boolean = false;

  leadSearchColumn = [{ field: '$', title: '', width: '40' },
  { field: '$$', title: '', width: '40' },
  { field: 'LeadDesc', title: 'Lead', width: '50' },
  { field: 'ContactLast', title: 'Contract', width: '50' },
  { field: 'CompanyName', title: 'Company', width: '50' },
  { field: 'UserName', title: 'User', width: '50' },
  { field: 'NextTask', title: 'Next Task', width: '50' },
  { field: 'RevenueShow', title: 'Net Revenue', width: '50' },
  { field: 'NextTaskDateDisplay', title: 'Due Date', width: '50' },
  { field: 'dtStartShow', title: 'Start', width: '50' },
  { field: 'dtCustom1Show', title: 'Proposal', width: '50' },
  { field: 'dtEndShow', title: 'Close', width: '50' },
  { field: 'dtRevenueShow', title: 'Receive Revenue', width: '50' },
  { field: 'LeadClass9Display', title: 'Position', width: '50' },
  { field: 'VolumeShow', title: 'Gross Revenue', width: '50' },
  { field: 'WinProbability', title: 'Win Probability', width: '50' },
  { field: 'ProjectedNetShow', title: 'Projected Net', width: '50' },
  { field: 'StatusDisplay', title: 'Status', width: '50' },
  { field: 'dtModifiedDisplay', title: 'Modified', width: '50' },
  { field: 'dtCreatedDisplay', title: 'Created', width: '50' },
  ];
  reorderColumnName: string = 'LeadDesc,ContractLast,CompanyName,NextTask,NextTaskDateDisplay,UserName,dtStartShow,dtCustom1Show,dtEndShow,dtRevenueShow,LeadClass9Display,VolumeShow,RevenueShow,WinProbability,ProjectedNetShow,StatusDisplay,dtModifiedDisplay,dtCreatedDisplay';
  columnWidth: string = 'LeadDesc:50,ContactLast:50,CompanyName:50,NextTask:50,NextTaskDateDisplay:50,UserName:50,dtStartShow:50,dtCustom1Show:50,dtEndShow:50,dtRevenueShow:50,LeadClass9Display:50,VolumeShow:50,RevenueShow:50,WinProbability:50,ProjectedNetShow:50,StatusDisplay:50,dtModifiedDisplay:50,dtCreatedDisplay:50';
  arrColumnWidth: any[] = ['LeadDesc:50,ContactLast:50,CompanyName:50,NextTask:50,NextTaskDateDisplay:50,UserName:50,dtStartShow:50,dtCustom1Show:50,dtEndShow:50,dtRevenueShow:50,LeadClass9Display:50,VolumeShow:50,RevenueShow:50,WinProbability:50,ProjectedNetShow:50,StatusDisplay:50,dtModifiedDisplay:50,dtCreatedDisplay:50'];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;

  constructor(private fb: FormBuilder,
    private _reportService: ReportService,
    public _contactService: ContactService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _accountSetupService: AccountSetupService,
    private _officeCodeservice: OfficeSetupService,
    private _teamOfficeService: TeamOfficeSetupService,
    private route: ActivatedRoute,
    public _gridCnfgService: GridConfigurationService,
    private _router: Router) {
    this._localService.isMenu = true;
  }
  ngOnInit(): void {
    this.getTwoDimensionsForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getCompanyFilterInformation();
          this.getLeadTwoDimensionResponse();
          this.getRoutes();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
    this.getRoutes();
  }

  getRoutes() {
    this.route.queryParams.subscribe(params => {
      let id = params;
      this.strdim1 = id.dm1;
      this.strdim2 = id.dm2;
      this.strdim1val = id.dm1val;
      this.strdim2val = id.dm2val;
      this.strStart = this.datePipe.transform(id.st, 'yyyy/MM/dd');
      this.strEnd = this.datePipe.transform(id.ed, 'yyyy/MM/dd');
      this.ur = id.ur;
      this.rpt = id.rpt;
    })
  }
  prepareTrackingForm() {
    this.showSpinner = true;
    return this.fb.group({
      startDt: new FormControl(''),
      endDt: new FormControl(''),
      rows: new FormControl(0),
      columns: new FormControl(10),
      teamCode: new FormControl(0),
      dtFilter: new FormControl('dtCreated'),
      officeCode: new FormControl(0),
      userCode: new FormControl(this.user?.cLPUserID),
      measure: new FormControl(0),
    })
  }
  getGridConfiguration() {
    this._gridCnfgService.columns = this.leadSearchColumn;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'lead_two_dim_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('lead_two_dim_grid').subscribe((value) => this.getLeadSearchResult()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'lead_two_dim_grid').subscribe((value) => this.getGridConfiguration());
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
              this._gridCnfgService.user = this.user;
              this.getTwoDimensionsForm = this.prepareTrackingForm();
              if (this.user?.userRole <= eUserRole.Administrator) {
                this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
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
  async getLeadTwoDimensionResponse() {
    this.isShowLadSearch = false;
    this.showSpinner = true;
    if (this.getTwoDimensionsForm.value.rows != this.getTwoDimensionsForm.value.columns) {
      this.isSameRowCol = false;
      this.startDt = this.datePipe.transform(this.getTwoDimensionsForm.value.startDt, 'yyyy/MM/dd');
      this.endDt = this.datePipe.transform(this.getTwoDimensionsForm.value.endDt, 'yyyy/MM/dd');
      await this._reportService.getLeadTwoDimensionResponse(this.encryptedUser, this.user?.cLPCompanyID, this.getTwoDimensionsForm?.value.userCode, this.getTwoDimensionsForm?.value.rows, this.getTwoDimensionsForm?.value.columns, this.getTwoDimensionsForm?.value.measure, this.getTwoDimensionsForm?.value.dtFilter, this.strMeasure, this.startDt ? this.startDt : '', this.endDt ? this.startDt : '')
        .then(async (result: LeadTwoDimensionResponse) => {
          if (result) {
            let response = UtilityService.clone(result);
            this.leadTwoDimensionResponse = response?.leadTwoDimension;
            this.leadSearchUserList = response?.leadSearchUserList;
            this.ddRowsColumns = response?.ddRowsColumns;
            this.ddRows = response?.ddRows;
            this.ddMeasure = response?.ddMeasure;
            this.ddDateFilter = response?.ddDateFilter;
            this.userFilterData = response?.userFilterData;
            this.tableRowName = this.ddRowsColumns?.filter(item => item.value == this.getTwoDimensionsForm?.value?.rows)[0].text;
            this.tableColumnName = this.ddRows.filter(item => item.value == this.getTwoDimensionsForm?.value?.columns)[0].text;
            await this.setgrid();

            this.showSpinner = false;
          }
          else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
          this.showSpinner = false;
        });
    } else {
      this.isSameRowCol = true;
      this.showSpinner = false;
    }
  }

  async getLeadSearchResult() {
    this.showSpinner = true;
    this.isSameRowCol = false;
    await this._reportService.getLeadSearchResult(this.encryptedUser, this.user?.cLPCompanyID, this.ur, this.strdim1 ? this.strdim1 : '', this.strdim1val ? this.strdim1val : '', this.strdim2 ? this.strdim2 : '', this.strdim2val ? this.strdim2val : '', this.strStart ? this.strStart : '', this.strEnd ? this.strEnd : '', this.strDateFilter, this.rpt ? this.rpt : "", this.isMgrView)
      .then(async (result: LeadTwoDimensionResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.leadSearchUserList = response?.leadSearchUserList;
          this.showSpinner = false;
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

  setgrid() {
    this.showSpinner = true;
    var i = 0;
    this.columns = [];
    if (!isNullOrUndefined(this.leadTwoDimensionResponse)) {
      for (const property in this.leadTwoDimensionResponse[0]) {
        i++;
        if (property != 'Link')
          this.columns.push({ field: `field${i}`, title: property, width: '100' });
      }
    }
    this.showSpinner = false;
  }

  async getCompanyFilterInformation() {
    this.showSpinner = true;
    await this._accountSetupService.getClpCompany(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CompanyResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.companyResponse = result.company;
          this.contactUploadGetMoreFilters();
          if (this.user?.userRole > eUserRole.General) {
            if (this.companyResponse?.showTeamDD)
              this.onTeamDD();
            if (this.companyResponse?.showOfficeDD)
              this.onOfficeDD();
            this.showSpinner = false;
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
    this.showSpinner = false;
  }

  async getUserList() {
    this.showSpinner = true;
    await this._reportService.getUsersDD(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.getTwoDimensionsForm.value.officeCode, this.getTwoDimensionsForm.value.teamCode)
      .then(async (result: userListResponse) => {
        if (result) {
          this.isUserDD = [];
          let response = UtilityService.clone(result);
          response.userDD.forEach(item => {
            this.isUserDD.push({ value: item.key.toString(), text: item.value, lookupName: '' });
            this.showSpinner = false;
          })
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
    this.showSpinner = false;
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

  forSplit(link, id) {
    switch (id) {
      case 1:
        var ln = link.split('?')[1];
        return ln.split("'");
      case 2:
        if (!isNullOrUndefined(link))
          return link.split('?');
      case 3:
        var ln = link.split('>')[1];
        return ln.split("<");
      case 4:
        var ln = link.split('~')[1];
        return ln;
    }
  }
  async loadContactList(link) {
    await this._router.navigateByUrl('rpt2dim?' + link);
    this.isShowLadSearch = true
    if (!isNullOrUndefined(this.strdim1)) {
      this.isShowLadSearch = true
      this.getGridConfiguration();
    } else {
      this.isShowLadSearch = false;
    }
  }

  gotoLink(columnName, dataItem) {
    if (columnName) {
      switch (columnName) {
        case "address-card":
        case "name": {
          if (this.user.timeZoneWinId != 0)
            this._router.navigate(['/contact', dataItem.CLPUserID, dataItem.ContactID]);
          else {
            if (confirm("Please select your timezone to view contact detail."))
              this._router.navigate(['/edit-profile', dataItem.CLPUserID]);
            else
              return;
          }
          break;
        }
        case "userName": {
          this._router.navigate(['/edit-profile', dataItem.CLPUserID]);
          break;
        }
        case "lead": {
          this._router.navigate(['/lead-detail', dataItem.LeadID, dataItem.ULastName, dataItem.CompanyName, dataItem.ContactID]);
          break;
        }
        default: {
          break;
        }
      }
    }
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
    options.sheets[0].name = `Distribution By Two Dimensions List`;
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
