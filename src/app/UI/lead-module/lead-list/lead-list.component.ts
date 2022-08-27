import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { Lead, LeadListResponse } from '../../../models/lead.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SearchQuery, SearchQueryResponse } from '../../../models/search.model';
import { AccountSetupService } from '../../../services/accountSetup.service';
import { LeadSettingService } from '../../../services/leadSetting.service';
import { NotificationService } from '../../../services/notification.service';
import { ContactCommonSearchService } from '../../../services/shared/contact-common-search.service';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
@Component({
  selector: 'lead-list',
  templateUrl: './lead-list.component.html',
  styleUrls: ['./lead-list.component.css'],
  providers: [GridConfigurationService]
})
/** lead-list component*/
export class LeadListComponent {
  userResponse: UserResponse;
  user: CLPUser;
  roleFeaturePermissions: RoleFeaturePermissions;
  queryDataLoaded: SearchQueryResponse = <SearchQueryResponse>{};
  leadList: Lead[];
  initLeadList: Lead[];
  private encryptedUser: string = '';
  subscriptionQueryList: any;
  showSpinner: boolean;
  gridHeight;
  baseUrl: string;
  leadId: number;
  columns = [{ field: '$', title: '', width: '40' },
  { field: 'leadDesc', title: 'Lead', width: '100' },
  { field: 'lastFirst', title: 'Contact', width: '100' },
  { field: 'companyName', title: 'Company', width: '100' },
  { field: 'ufirstName', title: 'User', width: '100' },
  { field: 'dtStart', title: 'Start', width: '100' },
  { field: 'dtEnd', title: 'Close', width: '100' },
  { field: 'revenue', title: 'Net Revenue', width: '100' },
  { field: 'winProbability', title: 'Win Probability', width: '100' },
  { field: 'leadStatusCode', title: 'Status', width: '100' },
  { field: 'dtModified', title: 'Modified', width: '100' },
  { field: 'dtCreated', title: 'Created', width: '100' }];
  reorderColumnName: string = 'leadDesc,lastFirst,companyName,ufirstName,dtStart,dtEnd,revenue,winProbability,leadStatusCode,dtModified,dtCreated';
  columnWidth: string = 'leadDesc:100,lastFirst:100,companyName:100,ufirstName:100,dtStart:100,dtEnd:100,revenue:100,winProbability:100,leadStatusCode:100,dtModified:100,dtCreated:100';
  arrColumnWidth: any[] = ['leadDesc:100,lastFirst:100,companyName:100,ufirstName:100,dtStart:100,dtEnd:100,revenue:100,winProbability:100,leadStatusCode:100,dtModified:100,dtCreated:100'];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  currentUrl: string;
  mobileColumnNames: string[];
  /** lead-list ctor */
  constructor(@Inject('BASE_URL') _baseUrl: string, public router: Router, public _gridCnfgService: GridConfigurationService, private _router: Router, private _localService: LocalService, private leadSettingService: LeadSettingService, private _utilityService: UtilityService, public notifyService: NotificationService, public _contactCommonSearchService: ContactCommonSearchService, private _ngZone: NgZone, private _accountSetupService: AccountSetupService) {
    this.gridHeight = this._localService.getGridHeight('464px');
    this._localService.isMenu = true;
    this.baseUrl = _baseUrl;
    this.currentUrl = window.location.pathname;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.defaultSearch();
          this.getGridConfiguration();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  defaultSearch() {
    var searchQuery: SearchQuery = <SearchQuery>{};
    searchQuery.cLPUserID = this.user.cLPUserID;
    searchQuery.controlType = "md";
    searchQuery.operator = "IN";
    searchQuery.searchItem = "CLPUserID";
    searchQuery.searchItemValue = this.user.cLPUserID.toString();
    searchQuery.tableName = "lead";
    this.queryDataLoaded.searchQueryList = [];
    this.queryDataLoaded.searchQueryList.push(searchQuery);
    this.currentUrl == '/active-leads' ? this.getActiveLeads() : this.getQueryData();
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, (this.currentUrl == '/active-leads') ? 'active_lead_grid' : 'lead_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration((this.currentUrl == '/active-leads') ? 'active_lead_grid' : 'lead_grid').subscribe((value) => {
      this.subscriptionQueryList = this._contactCommonSearchService.getqueryLeadListChangedChangeEmitter().subscribe((data) => {
        this._ngZone.run(() => {
          this.queryDataLoaded = data;
          this.currentUrl == '/active-leads' ? this.getActiveLeads() : this.getQueryData();
        })
      });
    }));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, (this.currentUrl == '/active-leads') ? 'active_lead_grid' : 'lead_grid').subscribe((value) => this.getGridConfiguration());
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.MyLead)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this._gridCnfgService.user = this.user;
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

  async getQueryData() {
    this.showSpinner = true;
    await this.leadSettingService.searchSaveLead(this.encryptedUser, this.queryDataLoaded, this.user.cLPUserID)
      .then(async (result: LeadListResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.leadList = res.leads;
          this.initLeadList = res.leads;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.leadList, "lead_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('lead_grid');
          }
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getActiveLeads() {
    this.showSpinner = true;
    await this.leadSettingService.getActiveLeads(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID)
      .then(async (result: LeadListResponse) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.leadList = res.leads;
          this.initLeadList = res.leads;

          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.leadList, "active_lead_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('active_lead_grid');
          }
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  onLeadSearchFilter(inputValue: string): void {
    this.leadList = process(this.initLeadList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'leadDesc', operator: 'contains', value: inputValue },
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  public viewHandler(dataItem) {
    this.leadId = dataItem.leadID;
    this.router.navigate(['lead-detail', dataItem.leadID, dataItem.lastFirst, dataItem.companyName, dataItem.contactID], { skipLocationChange: true });
  }
}
