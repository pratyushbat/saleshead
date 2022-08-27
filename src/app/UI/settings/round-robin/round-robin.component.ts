import { Component, Input, ViewChild } from '@angular/core';
import { RoundRobin, RoundRobinItem, WebFormResponse } from '../../../models/webForm.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CLPUser } from '../../../models/clpuser.model';
import { HttpErrorResponse } from '@angular/common/http';
import { WebformService } from '../../../services/webform.service';
import { LocalService } from '../../../services/shared/local.service';
import { Router } from '@angular/router';
import { UtilityService } from '../../../services/shared/utility.service';
import { NotificationService } from '../../../services/notification.service';
import { isNull, isNullOrUndefined } from 'util';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process } from '@progress/kendo-data-query';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RoundRobinListReponse } from '../../../models/roundRobin.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';

@Component({
  selector: 'round-robin',
  templateUrl: './round-robin.component.html',
  styleUrls: ['./round-robin.component.css'],
  providers: [GridConfigurationService]
})
/** round-robin component*/
export class RoundRobinComponent {
  pageSize: number = 10;
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  clpUserList: any;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  showSpinner: boolean = false;
  roundRobinId: number = 0;
  initRoundRobinList: RoundRobin[] = [];
  roundRobinList: RoundRobin[] = [];
  roundRobinResponse: RoundRobinListReponse
  roundRobinData: RoundRobin;
  deleteRoundRobinItems: any[] = [];
  roundRobinState: number = 0;
  roundRobinForm = new FormGroup({});
  initRoundRobinSave: boolean = false;
  isPreview: boolean = false;
  clpUserDisplay: string = '';
  deletedRoundRobin: any;
  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: 'roundRobinName', title: 'Round Robin Name', width: '250' },
    { field: 'currentPositionID', title: 'Current Position', width: '50' }
  ];
  reorderColumnName: string = 'roundRobinName,currentPositionID';
  columnWidth: string = 'roundRobinName:250,currentPositionID:50';
  arrColumnWidth: any[] = ['roundRobinName:250,currentPositionID:50']
  gridHeight;
  isSuccessRobin: boolean = false;
  assignedItemPosition: number = 0;
  mobileColumnNames: string[];
  /** round-robin ctor */
  constructor(private webFormService: WebformService, private fb: FormBuilder, private _localService: LocalService, private _router: Router, private _utilityService: UtilityService, private _notifyService: NotificationService, public _gridCnfgService: GridConfigurationService) {
    this.gridHeight = this._localService.getGridHeight('464px');
    this._localService.isMenu = true;
  }
  public ngOnInit(): void {
    this.getGridConfiguration();
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'round_robin_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('round_robin_grid').subscribe((value) => this.getRoundRobinData()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'round_robin_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getRoundRobinData() {
    this.showSpinner = true;
    await this.webFormService.getRoundRobin(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: RoundRobinListReponse) => {
        if (result) {
          this.roundRobinResponse = UtilityService.clone(result);
          this.initRoundRobinList = result.roundRobins;
          this.roundRobinList = result.roundRobins;
          this.clpUserList = result.filterUsers;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.roundRobinResponse, "round_robin_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('round_robin_grid');
          }
          this.roundRobinForm = this.prepareRoundRobinForm();
          this.isSuccessRobin = true;
          this.roundRobinForm.reset();
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
  prepareRoundRobinForm() {
    return this.fb.group({
      roundRobinID: [{ value: '' }],
      roundRobinName: [{ value: '' }, [Validators.required]],
      cLPCompanyID: [{ value: '' }],
      currentPositionID: [{ value: '' }],
    });
  }

  addRoundRobin() {
    this.isPreview = true;
    this.assignedItemPosition = -1;
    this.clpUserDisplay = '';
    this.roundRobinState = 1;
    this.roundRobinData = {
      roundRobinID: 0,
      cLPCompanyID: this.user.cLPCompanyID,
      roundRobinName: 'New Lead Distribution',
      currentPositionID: 1,
      roundRobinItems: []
    }
    this.roundRobinForm.enable();
    this.patchRoundRobinFormValue();
  }

  patchRoundRobinFormValue() {
    var roundRobinData = this.roundRobinData;
    for (let key in roundRobinData) {
      let value = roundRobinData[key];
      this.preparePatchFormControlValue(key, value);
    }
    var roundRobinObj = this.roundRobinList?.filter((data) => data.roundRobinID === this.roundRobinData.roundRobinID)[0];
    this.roundRobinForm.get('roundRobinID').setValue(!isNullOrUndefined(roundRobinObj) ? roundRobinObj.roundRobinID : "");
    this.roundRobinId = this.roundRobinForm.controls.roundRobinID.value == "" ? 0 : this.roundRobinForm.controls.roundRobinID.value;
  }
  preparePatchFormControlValue(key, value) {
    if (this.roundRobinForm.get(key))
      this.roundRobinForm.get(key).setValue(value);
  }

  moveNext() {
    if (this.roundRobinData.roundRobinItems.length >= 1) {
      this.assignedItemPosition = this.assignedItemPosition < this.roundRobinData.roundRobinItems.length - 1 ? ++this.assignedItemPosition : 0;
      this.setRoundobinAssigned();
    }
    this.updateRoundRobin()
  }

  roundRobinFormSubmit() {
    this._localService.validateAllFormFields(this.roundRobinForm);
    if (this.roundRobinForm.valid) {
      this.roundRobinForm.markAsPristine();
      this.updateRoundRobin();
    }
  }

  async updateRoundRobin() {
    this.roundRobinData.roundRobinID = isNullOrUndefined(this.roundRobinId) ? 0 : this.roundRobinId;
    this.roundRobinData.roundRobinName = this.roundRobinForm.controls.roundRobinName.value;
    this.showSpinner = true;
    this.saveUpdatedRoundrobin();
    //if (this.deleteRoundRobinItems.length > 0) {
    //  var that = this;
    //  this.deleteRoundRobinItems.forEach(function (obj) {
    //    that.roundRobinData.roundRobinItems.push(obj);
    //  });
    //}
  }

  async saveUpdatedRoundrobin() {
    await this.webFormService.updateRoundRobinData(this.encryptedUser, this.roundRobinData)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          if (result.messageString) {
            this._notifyService.showError(result.messageString, '', 3000);
            return;
          }
          this.roundRobinData.roundRobinID = result.messageInt;
          this.roundRobinId = result.messageInt;
          this._notifyService.showSuccess("Round Robin Saved Successfully", '', 3000);
          this.deleteRoundRobinItems = [];
          this.initRoundRobinSave = true;
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
        console.log(err);
      });
  }

  get roundRobinFrm() {
    return this.roundRobinForm.controls;
  }

  updateDropDownFormValue(userId) {
    var currentUser = this.clpUserList.filter(data => data.key == parseInt(userId))[0];
    var currentItemLength = this.roundRobinData.roundRobinItems ? this.roundRobinData.roundRobinItems.length : 0;
    var roundRobinItem = <RoundRobinItem>{ cLPUserDisplay: currentUser.value, cLPUserID: currentUser.key, positionID: currentItemLength <= 0 ? 1 : currentItemLength + 1, roundRobinID: this.roundRobinData.roundRobinID, roundRobinListID: 0 };
    this.roundRobinData.roundRobinItems?.push(roundRobinItem);
    this.updateRoundRobin();;
  }

  dropRoundRobin(event: CdkDragDrop<string[]>) {
    if (this.roundRobinData.roundRobinItems.length >= 1) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
      this.setRoundobinAssigned();
      this.saveUpdatedRoundrobin();
    }
  }

  setRoundobinAssigned() {
    if (this.assignedItemPosition < this.roundRobinData.roundRobinItems.length) {
      var roundRobinTop: RoundRobinItem = this.roundRobinData.roundRobinItems[this.assignedItemPosition];
      this.roundRobinData.currentPositionID = roundRobinTop.positionID;
      var clpUserIdToShow = roundRobinTop.cLPUserID;
      this.clpUserDisplay = this.clpUserList.filter(data => data.key === clpUserIdToShow)[0].value;
    }
    else {
      this.assignedItemPosition = 0;
      this.clpUserDisplay = '';
    }
  }

  showList() {
    this.roundRobinState = 0;
    this.clpUserDisplay = '';
    this.initRoundRobinSave = false;
  }

  deleteRoundRobinItem(item, index) {
    if (item.roundRobinListID != 0) {
      item.roundRobinListID = -item.roundRobinListID;
      this.deleteRoundRobinItems.push(item)
    }
    this.roundRobinData.roundRobinItems.splice(index, 1);
    for (let i = index; i <= this.roundRobinData.roundRobinItems.length; i++) {
      if (!isNullOrUndefined(this.roundRobinData?.roundRobinItems[i]?.positionID))
        this.roundRobinData.roundRobinItems[i].positionID = this.roundRobinData.roundRobinItems[i]?.positionID - 1;
    }
    this.setRoundobinAssigned();
  }

  public removeHandler({ dataItem }): void {
    this.deletedRoundRobin = dataItem;
  }

  async deleteRoundRobinConfirm() {
    this.showSpinner = true;
    await this.webFormService.deleteRoundRobin(this.encryptedUser, this.deletedRoundRobin ? this.deletedRoundRobin?.roundRobinID : this.roundRobinData?.roundRobinID)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.refreshRoundRobinList();
          this.showSpinner = false;
          this._notifyService.showSuccess("Round Robin deleted successfully", "", 3000);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('error in delete office code' + err);
      });
  }

  editRoundRobin(dataItem) {
    this.isPreview = true;
    this.initRoundRobinSave = true;
    this.roundRobinState = 1;
    dataItem.roundRobinItems ? dataItem.roundRobinItems : dataItem.roundRobinItems = [];
    this.roundRobinData = dataItem;
    this.roundRobinForm.enable();
    this.patchRoundRobinFormValue();

    if (this.roundRobinData?.roundRobinItems.length >= this.roundRobinData.currentPositionID) {
      var roundRobinTop: RoundRobinItem = this.roundRobinData?.roundRobinItems[this.roundRobinData.currentPositionID - 1];
      this.clpUserDisplay = this.clpUserList?.filter(i => i.key === roundRobinTop?.cLPUserID)[0]?.value;
      this.assignedItemPosition = this.roundRobinData.currentPositionID - 1;
    }
  }

  roundRobinFilter(inputValue: string): void {
    this.roundRobinList = process(this.initRoundRobinList, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'roundRobinName',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'currentPositionID',
            operator: 'contains',
            value: inputValue
          }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  getCurrentPositionName(dataItem) {
    var currentPosition: string = 'Not Set';
    currentPosition = dataItem?.roundRobinItems && dataItem?.roundRobinItems.length > 0 ? dataItem?.roundRobinItems.find(i => i.positionID == dataItem.currentPositionID) ? dataItem.currentPositionID + ':' + dataItem?.roundRobinItems.find(i => i.positionID == dataItem.currentPositionID)?.cLPUserDisplay : 'Not Set' : 'Not Set';
    return currentPosition;
  }

  refreshRoundRobinList() {
    this.isPreview = false;
    this.initRoundRobinSave = false;
    this.showList();
    this.getRoundRobinData();
  }

  showPostion(i) {
    this.roundRobinData.roundRobinItems[i].positionID = i + 1;
    return i + 1;
  }

  cancelRoundRobin() {
    if (this.roundRobinData.roundRobinID == 0) {
      this.roundRobinState = 0;
      this.initRoundRobinSave = false;
    }
    else {
      this.roundRobinState = 1;
      this.initRoundRobinSave = true;
    }
  }
}
