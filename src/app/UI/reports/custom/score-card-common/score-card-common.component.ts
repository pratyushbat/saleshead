import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';

@Component({
    selector: 'app-score-card-common',
    templateUrl: './score-card-common.component.html',
  styleUrls: ['./score-card-common.component.css'],
  providers: [GridConfigurationService]
})
export class ScoreCardCommonComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  gridHeight;

  @Input() user: CLPUser;
  @Input() data: [] =[];
  @Input() hiddenColumns: string[]=[];
  inChooserColoumns: string[]=[];

  columns = [{ field: '$', title: '', width: '20' },
  { field: 'code', title: 'Code', width: '100' },
  { field: 'desc', title: 'Description', width: '200' },
  { field: 'projectedContactsAdded', title: 'Projected Contacts', width: '40' },
  { field: 'contactsAdded', title: 'Contacts Added', width: '40' },
  { field: 'callCount', title: 'Call Count', width: '40' },
  { field: 'bipCreated', title: 'BIP Created', width: '40' },
  { field: 'bipScheduled', title: 'BIP Scheduled', width: '40' },
  { field: 'bipRate', title: 'BIP Rate', width: '40' },
  { field: 'bipShow', title: 'BIP Show', width: '40' },
  { field: 'bipShowRate', title: 'BIP Show Rate', width: '40' },
  { field: 'showsPerLead', title: 'Shows Per Lead', width: '40' },
  { field: 'bipSold', title: 'BIP Sold', width: '40' },
  { field: 'subSold', title: 'SUB Sold', width: '40' },
  { field: 'contracted', title: 'Contracted', width: '40' },
  { field: 'downPayment', title: 'Down Payment', width: '40' },];
  reorderColumnName: string = 'code,desc,projectedContactsAdded,contactsAdded,callCount,bipCreated,bipScheduled,bipRate,bipShow,bipShowRate,showsPerLead,bipSold,subSold,contracted,downPayment';
  columnWidth: string = 'code:100,desc:200,projectedContactsAdded:40,contactsAdded:40,callCount:40,bipCreated:40,bipScheduled:40,bipRate:40,bipShow:40,bipShowRate:40,showsPerLead:40,bipSold:40,subSold:40,contracted:40,downPayment:40';
  arrColumnWidth: string[] = ['code:100,desc:200,projectedContactsAdded:20,contactsAdded:40,callCount:40,bipCreated:40,bipScheduled:40,bipRate:40,bipShow:40,bipShowRate:40,showsPerLead:40,bipSold:40,subSold:40,contracted:40,downPayment:40'];
  constructor(
    public _gridCnfgService: GridConfigurationService,
    public _localService: LocalService,
    private _router: Router,) {
    this.gridHeight = this._localService.getGridHeight('493px');
  }

  ngOnInit(): void {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      if (!isNullOrUndefined(this.user)) {
        this.getGridConfiguration();
        this._gridCnfgService.user = this.user;
      }        
      else
        this._router.navigate(['/login']);
    }
    else
      this._router.navigate(['/login']);
  }


  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'score_card_code_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('score_card_code_grid').subscribe((value) => this.hideColoumns()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'score_card_code_grid').subscribe((value) => this.getGridConfiguration());
  }

  hideColoumns() {
    this.hiddenColumns.forEach(item => {
      this._gridCnfgService.hiddenColumns.push(item);
    });    
  }
}
