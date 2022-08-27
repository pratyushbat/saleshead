import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, TeamCodes, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { SOSCContract, SOSCContractData, SOSCContractResponse, SOSCResponse } from '../../../models/repSettings.model';
import { process } from '@progress/kendo-data-query';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { NotificationService } from '../../../services/notification.service';
import { RepSettingService } from '../../../services/repSettings.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { SignupService } from '../../../services/signup.service';
import { eSOSCStatus } from '../../../models/enum.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { DatePipe } from '@angular/common'
import { DomSanitizer } from '@angular/platform-browser';
import { GridColumnsConfigurationService } from '../../../services/gridColumnsConfiguration.service';
import { GridConfigurationService } from '../../../services/shared/gridConfiguration.service';
import { DataBindingDirective } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.css'],
  providers: [GridConfigurationService]
})
/** contract component*/
export class ContractComponent {
  user: CLPUser;
  sOSCID: number = 0;
  sOSCContractID: number = 0;
  mailMergeTemplateID: number = 0;
  cLPCompanyID: number = 0;
  teamCode: number = 0;
  showSpinner: boolean = false;
  public isPreview: boolean = false;
  userResponse: UserResponse;
  htmlText: any;
  roleFeaturePermissions: RoleFeaturePermissions;
  private encryptedUser: string = '';
  public soscContract: any;
  public soscContractt: SOSCContract;
  public soscContractData: SOSCContractData[];
  public initSoscContractData: SOSCContractData[];
  contractResponse: SOSCContractResponse
  columns = [
    { field: '$', title: '', width: '40' },
    { field: 'companyName', title: 'Company Name', width: '60' },
    { field: 'contractName', title: 'Contract Name', width: '60' },
    { field: 'dtCreated', title: 'Created Date', width: '60' },
    { field: 'dtExpires', title: 'Expiry Date', width: '60' },
    { field: 'dtSigned', title: 'Date Signed', width: '60' },
    { field: 'pH_Spot1', title: 'PH Spot 1', width: '300' }];
  reorderColumnName: string = 'companyName,contractName,dtCreated,dtExpires,dtSigned,pH_Spot1';
  contractSettingForm = new FormGroup({});
  isShowEditPanel: boolean = false;
  isShowOnEdit: boolean = false;
  public teamCodes: TeamCodes[];
  public clpUser: CLPUser[];
  operationPerformed: string = '';
  public format = "MM/dd/yyyy HH:mm:ss";
  type: string;
  status: string;
  isCompanyId: boolean = false;
  companyName: string;
  teamDisplay: string;
  userFullName: string;
  sortingColumn: string = '';
  columnWidth: string = 'companyName:60,contractName:60,dtCreated:60,dtExpires:60,dtSigned:60,pH_Spot1:300';
  arrColumnWidth: any[] = ['companyName:60,contractName:60,dtCreated:60,dtExpires:60,dtSigned:60,pH_Spot1:300'];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  mobileColumnNames: string[];
  constructor(private _route: ActivatedRoute, private fb: FormBuilder, public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, private _notifyService: NotificationService, public _signupService: SignupService,
    private _repSettingService: RepSettingService, public datepipe: DatePipe, private _sanitizer: DomSanitizer
    , public _gridColumnsConfigurationService: GridColumnsConfigurationService, public _gridCnfgService: GridConfigurationService) {
    this._localService.isMenu = true;
    this._route.paramMap.subscribe(async params => {
      if (params.has('sOSCID') || params.has('sOSCContractID') || params.has('mailMergeTemplateID') || params.has('cLPCompanyID') || params.has('teamCode')) {
        this.sOSCID = +params.get('sOSCID');
        this.sOSCContractID = +params.get('sOSCContractID');
        this.mailMergeTemplateID = +params.get('mailMergeTemplateID');
        this.cLPCompanyID = +params.get('cLPCompanyID');
        this.teamCode = +params.get('teamCode');
      }
    });
  }

  ngOnInit(): void {
    this.soscContractt = <SOSCContract>{};
    this.contractSettingForm = this.prepareContractSettingForm();
    this.soscContract = this.soscContract;
    this.contractSettingForm.reset();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getGridConfiguration();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'contract_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('contract_grid').subscribe((value) => this.getContractList()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'contract_grid').subscribe((value) => this.getGridConfiguration());
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.SORepSettings)
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
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  public viewHandler(dataItem) {
    this.isPreview = true;
    this.soscContract = dataItem.dataItem;
    this.operationPerformed = 'edit'
    this.sOSCID = this.soscContract.sOSCID,
      this.status = eSOSCStatus[this.soscContract.status],
      this.type = this.soscContract.contractName,
      this.soscContract.dtSigned = this.datepipe.transform(new Date(this.soscContract.dtSigned), 'MM/dd/yyyy HH:mm:ss');

    this.sOSCContractID = this.soscContract.sOSCContractID,
      this.mailMergeTemplateID = this.soscContract.mailMergeTemplateID,
      this.cLPCompanyID = this.soscContract.cLPCompanyID,
      this.teamCode = this.soscContract.teamCode
    this.getContractList();

  }

  async getContractList() {
    this.showSpinner = true;
    await this._repSettingService.getContractList(this.encryptedUser, this.sOSCID, this.sOSCContractID, this.mailMergeTemplateID, this.cLPCompanyID, this.teamCode)
      .then(async (result: SOSCContractResponse) => {
        if (result) {
          this.contractResponse = UtilityService.clone(result);
          this.soscContractData = this.contractResponse.sOSCContractData;
          this.initSoscContractData = this.contractResponse.sOSCContractData;
          this.teamCodes = this.contractResponse.teamCodes;
          this.clpUser = this.contractResponse.cLPUsers;
          if ((Object.keys(this.teamCodes).length === 0)) {
            this.isCompanyId = false;

          } else {
            this.isCompanyId = true;
          }
          this.htmlText = this._sanitizer.bypassSecurityTrustHtml(this.contractResponse.hTMLText);
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.contractResponse, "contract_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('contract_grid');
          }
          this.isShowEditPanel = false
          this.isShowOnEdit = false;
          this.showSpinner = false;
          switch (this.operationPerformed) {
            case 'edit': {
              this.isShowEditPanel = true;
              this.isShowOnEdit = true;
              this.patchContractSettingFormValue();
              break;
            }
            case 'addNew': {
              if (this.soscContractData.length != 0)
                this.type = this.soscContractData[0].contractName;
              else {
                this._localService.getContractName().subscribe(name => {
                  this.type = name;
                });
              }
              this.status = eSOSCStatus[0]
              this.contractSettingForm = this.prepareContractSettingForm();
              this.isShowEditPanel = true
              this.isShowOnEdit = false;
              break;
            }
            case 'search': {
              this.isShowEditPanel = true
              this.isShowOnEdit = false;
              break;
            }
            default: {
              break;
            }
          }
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


  patchContractSettingFormValue() {
    var soscContract = this.soscContract;
    for (let key in soscContract) {
      let value = soscContract[key];
      this.preparePatchContractSettingFormControlValue(key, value);
    }
  }

  preparePatchContractSettingFormControlValue(key, value) {
    if (this.contractSettingForm.get(key)) {
      if (key == 'dtStart' || key == 'dtExpires')
        this.contractSettingForm.get(key).setValue(new Date(value));
      else
        this.contractSettingForm.get(key).setValue(value);
    }

  }

  prepareContractSettingForm() {
    return this.fb.group({
      cLPCompanyID: [0, [Validators.required]],
      cLPUserID: [0],
      dtExpires: [new Date()],
      dtStart: [new Date()],
      pH_Spot1: [''],
      pH_Spot2: [''],
      pH_Spot3: [''],
      pH_Spot4: [''],
      pH_Spot5: [''],
      pH_Spot6: [''],
      pH_Spot7: [''],
      pH_Spot8: [''],
      pH_Spot9: [''],
      pH_Spot10: [''],
      pH_Spot11: [''],
      pH_Spot12: [''],
      teamCode: [0],
    });
  }


  async contractSettingFormSubmit() {
    this.cLPCompanyID = this.contractSettingForm.get('cLPCompanyID').value;
    if (this.isCompanyId) {
      switch (this.operationPerformed) {
        case 'edit': {
          this.soscContract.cLPUserID = this.contractSettingForm.get('cLPUserID').value
          this.soscContract.dtStart = this.contractSettingForm.get('dtStart').value
          this.soscContract.dtExpires = this.contractSettingForm.get('dtExpires').value
          this.soscContract.pH_Spot1 = this.contractSettingForm.get('pH_Spot1').value
          this.soscContract.pH_Spot2 = this.contractSettingForm.get('pH_Spot2').value
          this.soscContract.pH_Spot3 = this.contractSettingForm.get('pH_Spot3').value
          this.soscContract.pH_Spot4 = this.contractSettingForm.get('pH_Spot4').value
          this.soscContract.pH_Spot5 = this.contractSettingForm.get('pH_Spot5').value
          this.soscContract.pH_Spot6 = this.contractSettingForm.get('pH_Spot6').value
          this.soscContract.pH_Spot7 = this.contractSettingForm.get('pH_Spot7').value
          this.soscContract.pH_Spot8 = this.contractSettingForm.get('pH_Spot8').value
          this.soscContract.pH_Spot9 = this.contractSettingForm.get('pH_Spot9').value
          this.soscContract.pH_Spot10 = this.contractSettingForm.get('pH_Spot10').value
          this.soscContract.pH_Spot11 = this.contractSettingForm.get('pH_Spot11').value
          this.soscContract.pH_Spot12 = this.contractSettingForm.get('pH_Spot12').value
          this.companyName = this.getCompanyName(this.contractSettingForm.get('cLPCompanyID').value)
          this.teamDisplay = this.getTeamName(this.contractSettingForm.get('teamCode').value)
          this.userFullName = this.type
          this.showSpinner = true;

          this._repSettingService.updateContractList(this.encryptedUser, this.soscContract, this.soscContract.companyName, this.soscContract.team, this.soscContract.contractName)
            .then(async (result: SimpleResponse) => {
              if (result) {
                var response = UtilityService.clone(result);
                this.operationPerformed = ''
                this.showSpinner = false;
                this.getContractList()
                this._notifyService.showSuccess(response.messageString ? response.messageString : "Contract updated Successfully.", "", 3000);
              }
              else
                this.showSpinner = false;
            })
            .catch((err: HttpErrorResponse) => {
              this.showSpinner = false;
              console.log(err);
              this._utilityService.handleErrorResponse(err);
            });
          break;
        }
        default: {
          this.soscContractt.cLPUserID = parseInt(this.contractSettingForm.get('cLPUserID').value)
          this.soscContractt.dtStart = this.contractSettingForm.get('dtStart').value
          this.soscContractt.dtExpires = this.contractSettingForm.get('dtExpires').value
          this.soscContractt.pH_Spot1 = this.contractSettingForm.get('pH_Spot1').value
          this.soscContractt.pH_Spot2 = this.contractSettingForm.get('pH_Spot2').value
          this.soscContractt.pH_Spot3 = this.contractSettingForm.get('pH_Spot3').value
          this.soscContractt.pH_Spot4 = this.contractSettingForm.get('pH_Spot4').value
          this.soscContractt.pH_Spot5 = this.contractSettingForm.get('pH_Spot5').value
          this.soscContractt.pH_Spot6 = this.contractSettingForm.get('pH_Spot6').value
          this.soscContractt.pH_Spot7 = this.contractSettingForm.get('pH_Spot7').value
          this.soscContractt.pH_Spot8 = this.contractSettingForm.get('pH_Spot8').value
          this.soscContractt.pH_Spot9 = this.contractSettingForm.get('pH_Spot9').value
          this.soscContractt.pH_Spot10 = this.contractSettingForm.get('pH_Spot10').value
          this.soscContractt.pH_Spot11 = this.contractSettingForm.get('pH_Spot11').value
          this.soscContractt.pH_Spot12 = this.contractSettingForm.get('pH_Spot12').value
          this.soscContractt.sOSCContractID = 0
          if (this.soscContractData.length != 0)
            this.soscContractt.sOSCID = this.soscContractData[0].sOSCID
          else
            this.soscContractt.sOSCID = this.sOSCID
          this.soscContractt.sigLegalName = ''
          this.soscContractt.sigName = ''
          this.soscContractt.sigEmail = ''
          this.soscContractt.sigLast4 = ''
          this.soscContractt.dtSigned = new Date()
          this.soscContractt.cLPCompanyID = parseInt(this.contractSettingForm.get('cLPCompanyID').value)
          this.soscContractt.teamCode = parseInt(this.contractSettingForm.get('teamCode').value)
          this.companyName = this.getCompanyName(this.contractSettingForm.get('cLPCompanyID').value)
          this.teamDisplay = this.getTeamName(this.contractSettingForm.get('teamCode').value)
          this.userFullName = this.type
          this.soscContractt.status = 2
          this.showSpinner = true;
          this._repSettingService.updateContractList(this.encryptedUser, this.soscContractt, this.companyName, this.teamDisplay, this.userFullName)
            .then(async (result: SimpleResponse) => {
              if (result) {
                var response = UtilityService.clone(result);
                this.operationPerformed = ''
                this.showSpinner = false;
                this.getContractList()
                /*if (result == 'undefined') {
  
                }*/
                this._notifyService.showSuccess(response.messageString ? response.messageString : "Contract Added Successfully.", "", 3000);
              }
              else
                this.showSpinner = false;
            })
            .catch((err: HttpErrorResponse) => {
              this.showSpinner = false;
              console.log(err);
              this._utilityService.handleErrorResponse(err);
            });
          break;
        }
      }
    } else
      this._notifyService.showError("Please Enter Valid Account", "", 3000);
  }

  public getCompanyName(cLPCompanyID) {
    let companyName = this.teamCodes.filter((data) => data.cLPCompanyID == cLPCompanyID)[0];
    return companyName ? companyName.companyName : null;
  }

  public getTeamName(teamcode) {
    let teamName = this.teamCodes.filter((data) => data.teamCode == teamcode)[0];
    return teamName ? teamName.display : null;
  }

  public cancel() {
    this.isShowEditPanel = false
    this.isShowOnEdit = false;
  }

  public addNew() {
    this.operationPerformed = 'addNew'
    this.sOSCContractID = 0
    this.mailMergeTemplateID = 0
    this.cLPCompanyID = 0
    this.teamCode = 0
    this.getContractList();
  }

  searchUser() {
    this.operationPerformed = 'search'
    this.sOSCContractID = 0
    this.mailMergeTemplateID = 0
    this.cLPCompanyID = this.contractSettingForm.get('cLPCompanyID').value
    this.teamCode = 0
    this.getContractList();
  }

  onChangeTeam(teamcode) {
    this.operationPerformed = 'search'
    this.teamCode = teamcode
    this.getContractList();
  }

  async deleteContractList() {
    this.showSpinner = true;
    await this._repSettingService.deleteContractList(this.encryptedUser, this.soscContract.sOSCContractID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.operationPerformed = ''
          this.showSpinner = false;
          this.getContractList()
          this._notifyService.showSuccess('Contract deleted successfuly', "", 3000);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  backToRepSetting() {
    this._router.navigate(['/rep-settings']);
  }

  downloadFile(contractId, companyName) {
    this.showSpinner = true;
    this._repSettingService.downloadContractPdf(this.encryptedUser, contractId, companyName)
      .then(async (result: any) => {
        if (result) {
          var response = UtilityService.clone(result);
          let file = new Blob([result], { type: 'application/pdf' });
          let fileURL = URL.createObjectURL(file);
          let fileLink = document.createElement('a');
          fileLink.href = fileURL;
          fileLink.download = companyName;
          fileLink.click();
          this.showSpinner = false;

        } else {
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);

      });
  }

  goToLink(url: string) {
    window.open(url, "_blank");
  }

  onContractSettingFilter(inputValue: string): void {
    this.soscContractData = process(this.initSoscContractData, {
      filter: {
        logic: "or",
        filters: [
          { field: 'companyName', operator: 'contains', value: inputValue },
          { field: 'contractName', operator: 'contains', value: inputValue },
          { field: 'dtCreated', operator: 'contains', value: inputValue },
          { field: 'dtExpires', operator: 'contains', value: inputValue },
          { field: 'dtSigned', operator: 'contains', value: inputValue },
          { field: 'pH_Spot1', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
}
