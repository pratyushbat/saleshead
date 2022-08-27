import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { AccountSetup, AccountSetupListResponse } from '../../../../models/accountInformation.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eCLPCompanyStatus, eCLPRole, eFeatures } from '../../../../models/enum.model';
import { GenericRequest } from '../../../../models/genericRequest.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'app-admin-company-list',
    templateUrl: './admin-company-list.component.html',
    styleUrls: ['./admin-company-list.component.css'],
     providers: [GridConfigurationService]
})
/** admin-company-list component*/
export class AdminCompanyListComponent implements OnInit {
  /** admin-company-list ctor */
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  public deletedItem: any = {};
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  genericRequest: GenericRequest;
  accountSetupListResponse: AccountSetupListResponse;
  accountSetup: AccountSetup[];

  searchBy: string = 'CompanyID';
  searchInput: string = '';
  accountType: any[] = [{ key: 'Company ID', value: 'CompanyID' }, { key: 'Company Name', value: 'CompanyName' }, { key: 'User Email', value: 'Useremail' }
    , { key: 'User Last Name', value: 'Userlastname' }, { key: 'Ticket ID', value: 'TicketID' }, { key: 'Show All', value: 'ShowAll' }, { key: 'Active Tickets', value: 'ActiveTickets' }  ]

  //set for grid configuration
  columns = [
    { field: '$', title: '', width: '50' },
    { field: 'clpCompanyID', title: 'Id', width: '70' },
    { field: 'companyName', title: 'Account', width: '870' },
    { field: 'status', title: 'Status', width: '150' },
    { field: 'clpRole', title: 'Version', width: '150' }
  ];
  reorderColumnName: string = 'clpCompanyID,companyName,status,clpRole';
  columnWidth: string = 'clpCompanyID:70,companyName:870,status:150,clpRole:150';
  arrColumnWidth: any[] = ['clpCompanyID:70,companyName:870,status:150,clpRole:150'];

  @Output() selectedTab = new EventEmitter<any>();
  @Output() selectedTabName = new EventEmitter<any>();
  gridHeight;
    mobileColumnNames: string[];
  constructor(
    private _router: Router,
    public _utilityService: UtilityService,
    public _localService: LocalService,
    public _notifyService: NotificationService,
    public _gridCnfgService: GridConfigurationService,
    public _accountSetupService: AccountSetupService
  ) {
    this.gridHeight = this._localService.getGridHeight('514px');
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          //Set for grid configuration
          this.getGridConfiguration();
            }
        else {
          this._router.navigate(['/unauthorized']);
        }
      })
    }
    else 
      this._router.navigate(['/unauthorized']);
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this.copyDataToObject(false);
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'admin_company_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('admin_company_grid').subscribe((value) => this.getAccountList()));
      }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'admin_company_grid').subscribe((value) => this.getGridConfiguration());
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.SOAccountSetup)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            this._gridCnfgService.user = this.user;
            if (this.user?.userRole <= 3) {
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              if (this.roleFeaturePermissions?.view == false)
                this._router.navigate(['/unauthorized', true]);
            }
            this.showSpinner = false;
          }
          else {
            this._router.navigate(['/unauthorized']);
            this.showSpinner = false;
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async getAccountList() {
    this.showSpinner = true;
    await this._accountSetupService.getAccountList(this.encryptedUser, this.genericRequest)
      .then(async (result: AccountSetupListResponse) => {
      if (result) {
        this.accountSetupListResponse = UtilityService.clone(result);
        this.accountSetup = this.accountSetupListResponse.accountSetup;
        if (!isNullOrUndefined(this._gridCnfgService)) {
          this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('admin_company_grid');
          this._gridCnfgService.iterateConfigGrid(this.accountSetupListResponse, "admin_company_grid");
        }
        this.showSpinner = false;
      }
      else
        this.showSpinner = false;
    }).catch((err: HttpErrorResponse) => {
      console.log(err);
      this.showSpinner = false;
    });
  }

  async filterAccount() {
    if (this.searchBy == 'ShowAll') {
      this.searchInput = '';
      this.copyDataToObject(true);
      this.getAccountList();
    }
    else if (this.searchBy != '' && this.searchInput != '') {
      this.copyDataToObject(true);
      this.getAccountList();
    }
    else { console.log("Not search here", this.searchBy); }
  }

  copyDataToObject(isFilter?) {
    this.genericRequest = <GenericRequest>{};
    this.genericRequest.messageString = isFilter ? this.searchBy : '';
    this.genericRequest.messageString2 = isFilter ? this.searchInput : '';
  }

  public removeHandler({ dataItem }): void {
    this.deletedItem.clpCompanyID = dataItem ? dataItem?.clpCompanyID : -1;
    this.deletedItem.companyName = dataItem ? dataItem?.companyName : '';
  }

  getStatus(status) {
    var returnStatus: string = '--';
    if (status) {
      switch (status) {
        case 0: returnStatus = eCLPCompanyStatus[status]; break
        case 1: returnStatus = eCLPCompanyStatus[status]; break
        case 2: returnStatus = eCLPCompanyStatus[status]; break
        case 3: returnStatus = eCLPCompanyStatus[status]; break
        case 4: returnStatus = eCLPCompanyStatus[status]; break
        case 5: returnStatus = eCLPCompanyStatus[status]; break
        default: returnStatus = 'Unknown'; break
      }
    }
    return returnStatus;
  }

  getClpRole(role) {
    var returnRole: string = '--';
    if (role) {
      switch (role) {
        case 0: returnRole = eCLPRole[role]; break
        case 1: returnRole = eCLPRole[role]; break
        case 2: returnRole = eCLPRole[role]; break
        case 3: returnRole = eCLPRole[role]; break
        default: returnRole = 'Unknown'; break
      }
    }
    return returnRole;
  }

  async confirmDeleteAccount() {
    this.showSpinner = true;
    await this._accountSetupService.deleteAccount(this.encryptedUser, this.deletedItem.clpCompanyID, this.user.cLPUserID)
      .then(async (result: AccountSetupListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.showSpinner = false;
          if (response.messageBool == false) {
            this._notifyService.showError(response.messageString ? response.messageString : 'Some error occured.', "", 3000);
            return;
          }
          this._notifyService.showSuccess("Account deleted successfully", "", 3000);
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  selectedCompany(dataItem) {
    this._localService.changeCompanyId(dataItem ? dataItem?.clpCompanyID : -1);
    this._localService.selectedAdminCompanyId = dataItem ? dataItem?.clpCompanyID : -1;
    this._localService.isShowAdminTabs = true;
    this.selectedTab.emit(this._localService.selectedAdminCompanyId);
    this.selectedTabName.emit(dataItem?.companyName);

  }

}
