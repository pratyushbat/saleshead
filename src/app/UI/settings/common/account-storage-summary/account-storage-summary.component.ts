import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SortDescriptor } from '@progress/kendo-data-query';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../../models/clpuser.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { StorageSummary, StorageSummaryResponse } from '../../../../models/storage.model';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { StorageService } from '../../../../services/storage.service';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';

@Component({
    selector: 'account-storage-summary',
    templateUrl: './account-storage-summary.component.html',
    styleUrls: ['./account-storage-summary.component.css'],
    providers: [GridConfigurationService]
})

export class AccountStorageSummaryComponent implements OnInit {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  showSpinner: boolean = false;
  storageSum: boolean = false;
  storageSummary: StorageSummary[] = [];
  public initStorageSummary: StorageSummary[] = [];
  totalSpaceUsed: number;
  totalCapacity: number;
  columns = [
    { field: 'firstName', title: 'User', width: '10' },
    { field: 'spaceUsed', title: 'Space Used (in MBs)', width: '500' },
  ];
  reorderColumnName: string = 'firstName,spaceUsed';
  columnWidth: string = 'firstName:10,spaceUsed:50';
  arrColumnWidth: any[] = ['firstName:10,spaceUsed:50'];

  pageSize: number = 10;
  accountStorageResponse: StorageSummaryResponse;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
    mobileColumnNames: string[];
  constructor(private _storageService: StorageService,
    private _localService: LocalService,
    private _utilityService: UtilityService,
    public _notifyService: NotificationService,
    public _gridCnfgService: GridConfigurationService,) {
    this._localService.isMenu = true;
 
    
  }

  ngOnInit() {
    if (!isNullOrUndefined(this.user)) {
      this.getGridConfiguration();
    }
  }
  getGridConfiguration() {
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'account_storage_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('account_storage_grid').subscribe((value) => this.getStorageSummary()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'account_storage_grid').subscribe((value) => this.getGridConfiguration());
    
  }

  getStorageSummary() {
    this.showSpinner = true;
    this._storageService.getStorageList(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: StorageSummaryResponse) => {
        if (result) {
          this.accountStorageResponse = UtilityService.clone(result);
          this.storageSummary = this.accountStorageResponse.storageSummary;
          this.initStorageSummary = this.accountStorageResponse.storageSummary;
          this.totalSpaceUsed = this.accountStorageResponse.companySpaceUsed;
          this.totalSpaceUsed = (this.totalSpaceUsed / 1024) / 1024;
          if (!isNullOrUndefined(this._gridCnfgService)) {
          this._gridCnfgService.iterateConfigGrid(this.accountStorageResponse, "account_storage_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('account_storage_grid');
          }
          if (isNaN(this.totalSpaceUsed))
            this.totalSpaceUsed = 0;
          else {
            var totalSpace = Number(this.totalSpaceUsed).toFixed(1);
            this.totalSpaceUsed = +totalSpace;
          }

          this.totalCapacity = this.accountStorageResponse.totalStorageCapacity;
          this.totalCapacity = (this.totalCapacity / 1024) / 1024;
          if (isNaN(this.totalCapacity))
            this.totalCapacity = 0;
          else {
            var spaceCapacity = Number(this.totalCapacity).toFixed(1);
            this.totalCapacity = +spaceCapacity;
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
  }

  onStorageSummaryFilter(inputValue: string): void {
    this.storageSummary = process(this.initStorageSummary, {
      filter: {
        logic: "or",
        filters: [
          { field: 'firstName', operator: 'contains', value: inputValue },
          { field: 'lastName', operator: 'contains', value: inputValue },
          { field: 'spaceUsed', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
}
