import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process , SortDescriptor } from '@progress/kendo-data-query';
import { isNullOrUndefined } from 'util';
import { CLPUserPref, CLPUserPrefList } from '../../../../models/accountInformation.model';
import { CLPUser, UserSetupResponse } from '../../../../models/clpuser.model';
import { ITeamOfficeCode } from '../../../../models/emailTemplate.model';
import { GenericRequest } from '../../../../models/genericRequest.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { SignupService } from '../../../../services/signup.service';
import { UserService } from '../../../../services/user.service';

@Component({
    selector: 'app-user-preference',
    templateUrl: './user-preference.component.html',
  styleUrls: ['./user-preference.component.css'],
  providers: [GridConfigurationService]
})

export class UserPreferenceComponent {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  cLPCompanyID: number;
  userPrefList: CLPUserPrefList[] = []
  initUserPrefList: CLPUserPrefList[] = []
  showSpinner: boolean = false;
  public skip = 0;
  public pageSize = 10;
  public sort: SortDescriptor[] = [];
  public formGroup: FormGroup;
  private editedRowIndex: number;
  genericRequest: GenericRequest
  teamCodeList: ITeamOfficeCode[];
  officeCodeList: ITeamOfficeCode[];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: 'userCode', title: 'User Code', width: '100' },
    { field: 'userDisplay', title: 'Name', width: '100' },
    { field: 'txtMsgLongCode', title: 'SMS Long Code', width: '100' },
    { field: 'isCallForwardingLine', title: 'Enable Call Forwarding', width: '150' },
    { field: 'callForwardAPID', title: 'Call Forward Prod Id', width: '150' },
    { field: 'isClickToCallLine', title: 'Enable Click-To-Call', width: '150' },
    { field: 'isVCREnabled', title: 'Call Recording', width: '100' },
    { field: 'isVoiceDropLine', title: 'Enable Voice Drop', width: '100' },
    { field: 'isKMLEnabled', title: 'Enable Map Creation', width: '150' },
    { field: 'isSOLeadGen', title: 'Lead Gen Services', width: '100' },
    { field: 'isSingleSignOn', title: 'Enable Single Sign-On', width: '150' },
    { field: 'isVIPEnabled', title: 'Enable Slidecast', width: '100' },
    { field: 'isSGVIPEnabled', title: 'Enable SG-Slidecast', width: '150' }];
  reorderColumnName: string = 'userCode,userDisplay,txtMsgLongCode,isCallForwardingLine,callForwardAPID,isClickToCallLine,isVCREnabled,isVoiceDropLine,isKMLEnabled,isSOLeadGen,isSingleSignOn,isVIPEnabled,isSGVIPEnabled';
  columnWidth: string = 'userCode:100,userDisplay:100,txtMsgLongCode:100,isCallForwardingLine:150,callForwardAPID:150,isClickToCallLine:150,isVCREnabled:100,isVoiceDropLine:100,isKMLEnabled:150,isSOLeadGen:100,isSingleSignOn:150,isVIPEnabled:100,isSGVIPEnabled:150';
  arrColumnWidth: any[] = ['userCode:100,userDisplay:100,txtMsgLongCode:100,isCallForwardingLine:150,callForwardAPID:150,isClickToCallLine:150,isVCREnabled:100,isVoiceDropLine:100,isKMLEnabled:150,isSOLeadGen:100,isSingleSignOn:150,isVIPEnabled:100,isSGVIPEnabled:150'];
    mobileColumnNames: string[];
  constructor(private _route: ActivatedRoute, public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, public _signupService: SignupService,
    private _accountSetupService: AccountSetupService, private _notifyService: NotificationService, private userSvc: UserService, public _gridCnfgService: GridConfigurationService) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this._localService.changedCompanyId.subscribe(id => {
      if (id !== this.cLPCompanyID) {
        this.cLPCompanyID = id;
        this.getTeamAndOfficeCodes()
        this.getGridConfiguration();
       }
    });
   
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'user_pref_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('user_pref_grid').subscribe((value) => this.getUserPrefList()));
    }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'user_pref_grid').subscribe((value) => this.getGridConfiguration());
  }

  public async getTeamAndOfficeCodes() {
    this.showSpinner = true;
    await this.userSvc.getUsersSetup(this.encryptedUser, this.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: UserSetupResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (response.filterTeam) {
            this.teamCodeList = this._localService.convertDictionaryToAnyType(response.filterTeam);
          }
          if (response.filterOffice) {
            this.officeCodeList = this._localService.convertDictionaryToAnyType(response.filterOffice);
          }
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

  async getUserPrefList() {
    this.showSpinner = true;
    let genericReq: GenericRequest = <GenericRequest>{};
    genericReq.messageString = '';
    await this._accountSetupService.getUserPreferenceList(this.encryptedUser, genericReq, this.cLPCompanyID, 0, 0, 0, true )
      .then(async (result: CLPUserPrefList[]) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.userPrefList = response;
          this.initUserPrefList = response;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('user_pref_grid');
          this._gridCnfgService.iterateConfigGrid(this.userPrefList, "user_pref_grid");
          }
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

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  onUserPrefListFilter(inputValue: string): void {
    this.userPrefList = process(this.initUserPrefList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'userCode', operator: 'contains', value: inputValue },
          { field: 'userDisplay', operator: 'contains', value: inputValue },
          { field: 'txtMsgLongCode', operator: 'contains', value: inputValue },
          { field: 'callForwardAPID', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }


  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.formGroup = null;
    this.closeEditor(sender, rowIndex);

  }

  async saveHandler({ sender, rowIndex, dataItem }) {
    this.showSpinner = true;
    let clpUserPref: CLPUserPref = <CLPUserPref>{};
    clpUserPref.cLPUserID = dataItem.userCode.substring(3)
    clpUserPref.callForwardAPID = dataItem.callForwardAPID
    clpUserPref.isCallForwardingLine = dataItem.isCallForwardingLine
    clpUserPref.isClickToCallLine = dataItem.isClickToCallLine
    clpUserPref.isKMLEnabled = dataItem.isKMLEnabled
    clpUserPref.isSGVIPEnabled = dataItem.isSGVIPEnabled
    clpUserPref.isSOLeadGen = dataItem.isSOLeadGen
    clpUserPref.isSingleSignOn = dataItem.isSingleSignOn
    clpUserPref.isVCREnabled = dataItem.isVCREnabled
    clpUserPref.isVIPEnabled = dataItem.isVIPEnabled
    clpUserPref.isVoiceDropLine = dataItem.isVoiceDropLine
    clpUserPref.txtMsgLongCode = dataItem.txtMsgLongCode
    clpUserPref.theme = "";
    clpUserPref.homePage = "";
    clpUserPref.calendarDefault = "";
    clpUserPref.contactListColumns = "";
    clpUserPref.companyListColumns = "";
    clpUserPref.leadListColumns = "";
    clpUserPref.txtMsgQCDNA = "";
    clpUserPref.txtMsgQCVM = "";
    await this._accountSetupService.updateUserPreferenceList(this.encryptedUser, clpUserPref)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "User Preference Updated Successfully.", "", 3000);
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
    sender.closeRow(rowIndex);
  }

}
