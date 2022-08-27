import { DatePipe, formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { BuzzCoreFilterResponse, BuzzScore, BuzzScoreData, BuzzScoreResponse, ScoreHistory, ScoreHistoryResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { UtilityService } from '../../../../services/shared/utility.service';
import { process } from '@progress/kendo-data-query';
import { Inject } from '@angular/core';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { NotificationService } from '../../../../services/notification.service';
declare var $: any;

@Component({
    selector: 'app-buzz-score',
    templateUrl: './buzz-score.component.html',
  styleUrls: ['./buzz-score.component.css'],
  providers: [{ provide: 'GridConfigurationService', useClass: GridConfigurationService },
  { provide: 'GridConfigurationService1', useClass: GridConfigurationService }]
})
export class BuzzScoreComponent {
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  isShowSpinner: boolean = false;
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  buzzScoreResponse: BuzzCoreFilterResponse;
  buzzScoreList: BuzzScore[];
  public initBuzzScoreList: BuzzScore[];
  scoreHistoryResponse: ScoreHistory;
  buzzIndexCalcModal: BuzzScore;
  buzzScoreForm: FormGroup;
  isShowGridData: boolean = false;
  selectedUser: number = 0;
  datePipe = new DatePipe('en-US');
  buzzScoreData: BuzzScoreData= <BuzzScoreData>{};
  columns = [
    { field: '$', title: '', width: '40' },
    { field: '$$', title: ' ', width: '20' },
    { field: 'firstName', title: 'Name', width: '100' },
    { field: 'email', title: 'Email', width: '100' },
    { field: 'phone', title: 'Phone', width: '100' },
    { field: 'mobile', title: 'Mobile', width: '100' },
    { field: 'homePhone', title: 'Home Phone', width: '100' },
    { field: 'uFirstName', title: 'User', width: '50' },
    { field: 'score', title: 'Buzz', width: '50' },
    { field: 'events', title: 'Events', width: '50' },
  ];
  reorderColumnName: string = 'firstName,email,phone,mobile,homePhone,uFirstName,score,events';
  arrColumnWidth: any[] = ['firstName:100,email:100,phone:100,mobile:100,homePhone:100,uFirstName:50,score:50,events:50'];
  columnWidth: string = 'firstName:100,email:100,phone:100,mobile:100,homePhone:100,uFirstName:50,score:50,events:50';

  buzzScoreCalculationcolumns = [
    { field: '$', title: '', width: '40' },
    { field: 'score', title: 'Index', width: '100' },
    { field: 'type', title: 'Type', width: '100' },
    { field: 'dtCreated', title: 'Created', width: '100' },
    { field: 'delete', title: '', width: '30' },
  ];
  reorderColumnNameBuzzScoreCalculation: string = 'score,type,dtCreated,delete';
  arrColumnWidthBuzzScoreCalculation: any[] = ['score:100,type:100,dtCreated:100,delete:30'];
  columnWidthBuzzScoreCalculation: string = 'score:100,type:100,dtCreated:100,delete:30';

  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  
  constructor(private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    @Inject('GridConfigurationService') public _gridCnfgService: GridConfigurationService,
    @Inject('GridConfigurationService1') public _gridCnfgServiceBSC: GridConfigurationService,
    private _reportService: ReportService,
    private _notifyService: NotificationService,
    private fb: FormBuilder  ) {
    this._localService.isMenu = true;
  }
  ngOnInit(): void {
    this.buzzScoreForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getDDValues();
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
              this.selectedUser = this.user.cLPUserID;
              this._gridCnfgServiceBSC.user = this.user;
              this.buzzScoreForm = this.prepareTrackingForm();
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
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'buzz_score_grid')
      .subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('buzz_score_grid')
        .subscribe((value) => this.patchFormControlValue()));
  }
  getGridConfigurationBSC() {
    this._gridCnfgServiceBSC.columns = this.buzzScoreCalculationcolumns;
    this._gridCnfgServiceBSC.reorderColumnName = this.reorderColumnNameBuzzScoreCalculation;
    this._gridCnfgServiceBSC.columnWidth = this.columnWidthBuzzScoreCalculation;
    this._gridCnfgServiceBSC.arrColumnWidth = this.arrColumnWidthBuzzScoreCalculation;
    this._gridCnfgServiceBSC.getGridColumnsConfiguration(this.user.cLPUserID, 'buzz_score_calculation_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('buzz_score_calculation_grid').subscribe((value) => this.getBuzzScoreCalculation()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'buzz_score_grid').subscribe((value) => this.getGridConfiguration());
  }

  prepareTrackingForm() {
    const date = new Date();
    return this.fb.group({
      startDt: new FormControl(new Date(date.getFullYear(), date.getMonth(), date.getDate()- 7)),
      endDt: new Date(),
      userFilter: new FormControl(),
      scoreType: new FormControl(0),
      class1Code: new FormControl(0),
      class4Code: new FormControl(0),
     })
  }

  async getDDValues() {
    this.showSpinner = true;
    await this._reportService.getBuzzScoreResponse(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: BuzzCoreFilterResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (!isNullOrUndefined(response))
            this.buzzScoreResponse = response;
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
  copyBuzzScoreFormValue() {
    this.buzzScoreData.startDt = this.datePipe.transform(this.buzzScoreForm.value.startDt, 'yyyy-MM-dd');
    this.buzzScoreData.endDt = this.datePipe.transform(this.buzzScoreForm.value.endDt, 'yyyy-MM-dd');
    this.buzzScoreData.userFilter = this.buzzScoreForm?.value.userFilter;
    this.buzzScoreData.scoreType = this.buzzScoreForm?.value.scoreType;
    this.buzzScoreData.class1Code = this.buzzScoreForm?.value.class1Code;
    this.buzzScoreData.class4Code = this.buzzScoreForm?.value.class4Code;
  }

  patchFormControlValue() {  
    this.buzzScoreData.userFilter = this.user.cLPUserID
    this.buzzScoreData.scoreType = 0;
    this.buzzScoreData.class1Code = 0;
    this.buzzScoreData.class4Code = 0;
    for (let key in this.buzzScoreData) {
      let value = this.buzzScoreData[key];
      this.preparePatchFormControlValue(key, value);
    }
  }

  preparePatchFormControlValue(key, value) {
    if (this.buzzScoreForm.get(key))
      this.buzzScoreForm.get(key).setValue(value)
  }

  buzzFormSubmit() {
    this._localService.validateAllFormFields(this.buzzScoreForm);
    if (this.buzzScoreForm.valid) {     
      this.getBuzzScoreResponse();
    }
    else
      this._notifyService.showError("Invalid BuzzScore Fields", "", 3000);
  }

  async getBuzzScoreResponse() {
      if (this.buzzScoreForm.valid) {
        this.showSpinner = true
        this.isShowGridData = true;
        this.copyBuzzScoreFormValue();        
        await this._reportService.getBindBuzzScoreResponse(this.encryptedUser, this.user.cLPCompanyID, this.buzzScoreData.startDt, this.buzzScoreData.endDt, this.buzzScoreData.class1Code, this.buzzScoreData.class4Code, this.buzzScoreData.userFilter, this.buzzScoreData.scoreType)
          .then(async (result: BuzzScoreResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              this.buzzScoreList = response?.buzzScore;
              this.initBuzzScoreList = this.buzzScoreList;
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
  }

  onUserNameClick(buzzScoredata: BuzzScore) {
    this._router.navigate(['contact/' + this.user.cLPUserID, +buzzScoredata.contactID])
  }

  async onBuzzScore(buzzScoreData: BuzzScore) {
    $('#buzzScoreCalculation').modal('show');
    this.showSpinner = true;
    this.buzzIndexCalcModal = buzzScoreData;
    this.getGridConfigurationBSC();    
  }

  async getBuzzScoreCalculation() {
    this.isShowSpinner = true;
    await this._reportService.getScoreHistoryResponse(this.encryptedUser, this.buzzIndexCalcModal?.contactID, this.buzzScoreData.startDt, this.buzzScoreData.endDt, this. buzzScoreData.scoreType)
      .then(async (result: ScoreHistoryResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.scoreHistoryResponse = response?.scoreHistory;          
          this.isShowSpinner = false;
        }
        else
          this.isShowSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.isShowSpinner = false;
      });
  }

  closeModal() {
    $('#buzzScoreCalculation').modal('hide');
  }

  async resetScoreHistory() {
    this.showSpinner = true;
    await this._reportService.getResetScoreHistory(this.encryptedUser, this.buzzIndexCalcModal?.contactID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getBuzzScoreCalculation();
          this.showSpinner = false;
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

  async resetSingleScore(scoreHistoryData: ScoreHistory) {
    this.showSpinner = true;
    let dtCreated = this.datePipe.transform(scoreHistoryData.dtCreated, 'yyyy-MM-dd');
    await this._reportService.getDeleteScoreHistory(this.encryptedUser, scoreHistoryData.contactID, this.buzzScoreData.scoreType, dtCreated)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.getBuzzScoreCalculation();
          this.showSpinner = false;
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

  gotoLink(columnName, dataItem) {
    if (columnName) {
      switch (columnName) {
        case "address-card":
        case "name": {
          if (this.user.timeZoneWinId != 0)
            this._router.navigate(['/contact', dataItem.clpUserID, dataItem.contactID]);
          else {
            if (confirm("Please select your timezone to view contact detail."))
              this._router.navigate(['/edit-profile', dataItem.clpUserID]);
            else
              return;
          }
          break;
        }
        case "userName": {
          this._router.navigate(['/edit-profile', dataItem.clpUserID]);
          break;
        }     
        default: {
          break;
        }
      }
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Buzz Score List`;
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

  onBuzzScoreFilter(inputValue: string): void {
    this.buzzScoreList = process(this.initBuzzScoreList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'firstName', operator: 'contains', value: inputValue },
          { field: 'email', operator: 'contains', value: inputValue },
          { field: 'phone', operator: 'contains', value: inputValue },
          { field: 'mobile', operator: 'contains', value: inputValue },
          { field: 'homePhone', operator: 'contains', value: inputValue },
          { field: 'uLastName', operator: 'contains', value: inputValue },
          { field: 'score', operator: 'contains', value: inputValue },
          { field: 'events', operator: 'contains', value: inputValue },
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

}
