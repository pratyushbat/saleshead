import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { c1443_CLPUserPref, CLPUser, TeamCodeResponse, TeamCodes, UserResponse } from '../../models/clpuser.model';
import { c1443_FBCET, c1443_FBCETPHItemLocation, c1443_FB_CodeBlock, c1443_FB_CodeBlockResponse, EmailTemplateLoad, FBCEmailTemplate, FBCEmailTemplateResponse } from '../../models/emailTemplate.model';
import { eFeatures, eUserRole } from '../../models/enum.model';
import { SimpleResponse } from '../../models/genericResponse.model';
import { c1443_Location, c1443_LocationResponse } from '../../models/location';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';
import { EmailTemplateService } from '../../services/email-template.service';
import { FbcEmailTemplateService } from '../../services/fbc-email-template.service';
import { GridColumnsConfigurationService } from '../../services/gridColumnsConfiguration.service';
import { NotificationService } from '../../services/notification.service';
import { GridConfigurationService } from '../../services/shared/gridConfiguration.service';
import { LocalService } from '../../services/shared/local.service';
import { UtilityService } from '../../services/shared/utility.service';
import { UserService } from '../../services/user.service';
declare var $: any;


@Component({
  selector: 'app-fbc-email-template',
  templateUrl: './fbc-email-template.component.html',
  styleUrls: ['./fbc-email-template.component.css'],
  providers: [GridConfigurationService]
})
export class FbcEmailTemplateComponent {
  gridHeight;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  showSpinner: boolean = false;
  excludeTeamCode: number = -1;
  public teamCodeList: TeamCodes[];
  public locationList: c1443_Location[];
  public fbcEmailTemplateList: FBCEmailTemplate[];
  public initEmailTemplateList: FBCEmailTemplate[];
  public codeBlockList: c1443_FB_CodeBlock[];
  public codeBlockData: c1443_FB_CodeBlock;
  public editLocationListFbc: c1443_FBCETPHItemLocation[];
  public initEditLocationListFbc: c1443_FBCETPHItemLocation[];
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  columns = [{ field: '$', title: '', width: '40' },
    { field: 'templateName', title: 'Template Name', width: '300' },
    { field: 'fBCETID:h', title: 'fBCETID', width: '300' },
    { field: 'emailTemplateID:h', title: 'fBCETID', width: '300' },
    { field: 'locationFBCETID:h', title: 'locationFBCETID', width: '300' },
    { field: 'locationisActive:h', title: 'locationisActive', width: '300' },
    { field: 'isActive:h', title: 'isActive', width: '300' },
    { field: 'previewTemplate', title: 'Preview Template', width: '100' },
    { field: 'status', title: 'Status', width: '100' }];
  columnsEditPanel = [{ field: '$', title: '', width: '40' },
    { field: 'pHDisplay', title: 'Placeholder', width: '100'},
    { field: 'valueType', title: 'Type', width: '100' },
    { field: 'pHValue', title: 'Value', width: '300' },
    { field: 'locationFBCETPHItemID', title: 'Uses', width: '70' },
    { field: 'fBCETPHItemID', title: '', width: '70'},
    { field: 'fBCETID', title: '', width: '70'},
    { field: 'pHName', title: '', width: '70'},
    { field: 'locationPHValue', title: '', width: '70'}
   ];
  reorderColumnName: string = 'templateName,previewTemplate,status';
  columnWidth: string = 'templateName:300,previewTemplate:100,status:100';
  arrColumnWidth: any[] = ['templateName:300,previewTemplate:100,status:100'];
  fbcEmailForm: FormGroup;
  defaultClass5Code: number;
  private editedRowIndex: number;
  fbcIdForActive: number;
  isShowTeamDd: boolean = false;
  isShowTeamLabel: boolean = false;
  isShowLocationByTeam: boolean = false;
  lblLocationText: string;
  lblTeamText: string;
  locationId: number;
  teamId: number = 0;
  activeDDValue: boolean = true;
  isAdmin: boolean = true;
  public formGroup: FormGroup;
  teamCode: number;
  class5Code: number;
  emailTemplateId: number;
  op: string = '';
  griTitle: string = '';
  confirmText: string = '';
  isShowActiveDd: boolean = false;
  showEditPanel: boolean = false;
  tempId: number = 0;
  fbcId: number = 0;
  btnText: string = '';
  htmlText: string = '';
  emailId: string = '';
  griTitleEdit: string = '';
  statusDisplay: string = '';
  activeTooltip: string = '';
  locationFbcId: number;
  operatedAt: string;
    mobileColumnNames: string[];
  constructor(public _gridCnfgService: GridConfigurationService,
    private _notifyService: NotificationService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _userService: UserService,
    private _router: Router,
    private _emailTemplateService: EmailTemplateService,
    private _fbcEmailTemplateService: FbcEmailTemplateService,
    public _gridColumnsConfigurationService: GridColumnsConfigurationService) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.operatedAt = 'initially';
          this.showEditPanel = false;
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
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.FbcEmailTemplates)
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

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'fbc_email_template_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('fbc_email_template_grid').subscribe((value) => this.setUpView()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'fbc_email_template_grid').subscribe((value) => this.setUpView());
  }

  getFbcclUserData() {
    this.showSpinner = true;
    return new Observable<c1443_CLPUserPref>(observer => {
      this._userService.getFbcclUserByUserId(this.encryptedUser, this.user.cLPUserID)
        .then((result: c1443_CLPUserPref) => {
          if (result) {
            var response = UtilityService.clone(result);
            observer.next(response);
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
    })
  }

  async getTeamList() {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.getTeamCode(this.encryptedUser, 1443)
      .then(async (result: TeamCodeResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.teamCodeList = response.teamCodes;
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

  getTeamData() {
    this.showSpinner = true;
    return new Observable<TeamCodes>(observer => {
      this._fbcEmailTemplateService.getTeamDataLoad(this.encryptedUser, this.user.teamCode)
        .then((result: TeamCodes) => {
          if (result) {
            var response = UtilityService.clone(result);
            observer.next(response);
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
    })
  }

  setLocationTeamDD(locationList) {
    if (locationList?.length > 1) {
      if (this.defaultClass5Code > 0) {
        var itm = this.locationList?.filter((data) => data.class5Code === this.defaultClass5Code)[0];
        this.locationId = itm.class5Code;
        this.lblLocationText = itm.location;
      }
      else {
        this.defaultClass5Code = this.locationList[0]?.class5Code
        var itm = this.locationList[0];
        this.locationId = itm.locationID;
        this.lblLocationText = itm.location;
      }
    } else if (locationList.length == 1) {
      if (this.defaultClass5Code != this.locationList[0]?.class5Code) {
        this.defaultClass5Code = this.locationList[0]?.class5Code
        this.lblLocationText = this.locationList[0]?.location;
        this.isShowTeamDd = true;
        this.isShowTeamLabel = false;
      }
      else {
        this.defaultClass5Code = 0;
        this.isShowTeamDd = true;
        this.isShowTeamLabel = true;
      }
    }
  }

  getLocationList(teamCode) {
    this.showSpinner = true;
    return new Observable<c1443_LocationResponse>(observer => {
      this._fbcEmailTemplateService.getLocation(this.encryptedUser, teamCode, this.excludeTeamCode)
        .then((result: c1443_LocationResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.locationList = response.c1443_Location;
            if (this.operatedAt == 'initially') {
              this.setLocationTeamDD(response.c1443_Location);
            }
            observer.next(response);
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
    })

  }

  async getFbcEmailTemplateList(classCode5, isActive, isAdmin) {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.getFbcEmailTemplateLoad(this.encryptedUser, this.user.cLPUserID, classCode5, isActive, null, isAdmin)
      .then(async (result: FBCEmailTemplateResponse) => {
        if (result) {
          this.showSpinner = false;
          var response = UtilityService.clone(result);
          this.fbcEmailTemplateList = response.fBCEmailTemplate;
          this.initEmailTemplateList = response.fBCEmailTemplate;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('fbc_email_template_grid');
            this._gridCnfgService.iterateConfigGrid(this.fbcEmailTemplateList, "fbc_email_template_grid");
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

  loadEmailTEmplateById(emailTemplateId, class5Code) {
    this.showSpinner = true;
    return new Observable<c1443_FBCET>(observer => {
      this._fbcEmailTemplateService.emailTemplateLoadById(this.encryptedUser, emailTemplateId, class5Code)
        .then((result: c1443_FBCET) => {
          if (result) {
            var response = UtilityService.clone(result);
            if (response.fBCETID > 0) {
              this.tempId = response.fBCETID;
              this.htmlText = response.hTMLText;
            }
            observer.next(response);
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
    })
  }

  async deleteFbcTemplate(fbcetid) {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.deleteFbcTemplate(fbcetid)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Template has been Reset Successfully.", "", 3000);
          this.getFbcEmailTemplateList(this.class5Code, this.activeDDValue, this.isAdmin);
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

  async deleteFbcetPhItemTemplate(fbcePhItmtid) {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.deleteFbcPhItemTemplate(fbcePhItmtid)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Placeholder has been deleted Successfully.", "", 3000);
          this.getLocationListByFbcId(this.fbcIdForActive, this.locationFbcId);
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

  async getLocationListByFbcId(fbcetid, locFbcId) {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.getLocationListByFbcIDLoad(this.encryptedUser, fbcetid, locFbcId)
      .then(async (result: c1443_FBCETPHItemLocation[]) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.editLocationListFbc = response;
          this.initEditLocationListFbc = response;
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

  loadEmailTemplateByEmailTemId(emailTemplateId) {
    this.showSpinner = true;
    return new Observable<EmailTemplateLoad>(observer => {
      this._emailTemplateService.getEmailTemplateById(this.encryptedUser, emailTemplateId)
        .then((result: EmailTemplateLoad) => {
          if (result) {
            var response = UtilityService.clone(result);
            observer.next(response);
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
    })
  }

  loadFbcData(fbcetid) {
    this.showSpinner = true;
    return new Observable<c1443_FBCET>(observer => {
      this._fbcEmailTemplateService.fbcTemplateLoadById(this.encryptedUser, fbcetid)
        .then((result: c1443_FBCET) => {
          if (result) {
            var response = UtilityService.clone(result);
            observer.next(response);
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
    })
  }

  operationPerformed(commandName, emailTemplateID, class5Code) {
    this.showSpinner = true;
    return new Observable<SimpleResponse>(observer => {
      this._fbcEmailTemplateService.overWriteAllUpdate(commandName, emailTemplateID, class5Code, this.user.cLPUserID, this.isAdmin, this.teamId)
        .then((result: SimpleResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.showSpinner = false;
            observer.next(response);
          }
          else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
          this.showSpinner = false;
        });
    })
  }
 
  gridSetUpView() {
    if (this.isAdmin == true) {
      this.griTitle = 'Base Email Templates';
      this.isShowActiveDd = true; //true selected bydefault----for admin
      this.getFbcEmailTemplateList(this.class5Code, this.activeDDValue, this.isAdmin);
    }
    else {
      if (this.class5Code > 0) {
        this.isShowActiveDd = false;
        var itm = this.locationList?.filter((data) => data.class5Code === this.defaultClass5Code)[0]
        this.teamCode = itm?.teamCode;
        this.griTitle = 'Email Templates for ' + itm?.location;
        this.getFbcEmailTemplateList(this.class5Code, this.activeDDValue, this.isAdmin);
      }
    }
  }

  setUpView() {
    this.getFbcclUserData().subscribe(response => {
      this.defaultClass5Code = response.class5Code;
      if (this.user?.cLPUserID == (5631 || 6204 || 5753)) {
        this.getTeamList();
        this.isShowTeamDd = true;
        this.isShowTeamLabel = false;
        this.lblLocationText = '-NA-';
        this.isAdmin = true;
        this.teamCode = 0;
        this.class5Code = 0;
        this.gridSetUpView();
      } else if (this.user?.teamCode > 0) {
        this.isShowTeamDd = false;
        this.isAdmin = false;
        this.isShowTeamLabel = true;
        this.teamCode = this.user?.teamCode;
        this.class5Code = this.defaultClass5Code;
        this.getTeamData().subscribe(response => {
          this.lblTeamText = response.display;
        });
        this.getLocationList(this.user?.teamCode).subscribe(response => {
          if (this.user?.userRole == 3) {
            if (this.defaultClass5Code > 0) {
              this.gridSetUpView();
            } else {
              /* this.showGrid = false;*/
              alert('not authorized');
            }
          } else {
            this.gridSetUpView();
          }
        });
      } else {
       /* this.showGrid = false;*/
        alert('not authorized');
      }
    })

  }

  setHtmlText(id) {
    var text = this.initEmailTemplateList.filter(item => {
      return item.fBCETID == id;
    })[0];
    localStorage.setItem('object', JSON.stringify(text.htmlText));
    const url = this._router.serializeUrl(
      this._router.createUrlTree([`/template-preview/${id}`])
    );
    window.open(url)
  }

  getFbcEmailListByLocation(e) {
    this.class5Code = e;
    this.gridSetUpView();
  }

  getFbcEmailListByTeam(e) {
    this.operatedAt = 'byTeam';
    if (e != 0) {
      this.getLocationList(e).subscribe(response => {
        if (this.locationList?.length > 0) {
          this.isShowLocationByTeam = true;
          this.class5Code = response.c1443_Location[0].class5Code;
          this.locationId = response.c1443_Location[0].class5Code;
          this.isAdmin = false;
          this.gridSetUpView();
        }
        else {
          alert("No locations exists for this team.")
        }
      });
    } else {
      this.isShowLocationByTeam = false;
      this.class5Code = 0;
      this.isAdmin = true;
      this.gridSetUpView();
    }
  }

  getStatus(dataItem) {
    if (!isNullOrUndefined(dataItem.fBCETID) && dataItem.fBCETID != 0) {
      this.btnText = 'Edit';
      if (this.isAdmin == true) {
        if (dataItem?.isActive == true) {
            return 'Active';
        } else {
          return 'Draft';
        }
      } else {
        if (!isNullOrUndefined(dataItem.locationFBCETID) && dataItem.locationFBCETID != 0) {
          if (dataItem?.locationisActive == true) {
              return 'Customized version in use';
          } else {
            return 'Draft (Default in use)';
          }

        } else {
          this.btnText = 'Customize';
          return 'Default in use';
        }
      }

    } else {
      this.btnText = 'Configure';
      return 'Not Configured';
    }
  }
  
  overwriteAll(emailTemplateId) {
    this.emailTemplateId = emailTemplateId;
    this.op = 'confirm overwrite';
    this.operationPerformed('OverwriteAll', emailTemplateId, this.class5Code).subscribe(response => {
      this.confirmText = response.messageString;
      $('#fbcConfirmModal').modal('show');
    });
  }

  onResetFbcTemplate(emailTemplateId) {
    this.emailTemplateId = emailTemplateId;
    this.op = 'reset';
    this.loadEmailTEmplateById(emailTemplateId, this.class5Code).subscribe(value => {
      if (value.fBCETID > 0) {
        this.confirmText = "Are you sure to reset this template."
        $('#fbcConfirmModal').modal('show');
      }
      else {
        alert('No template is in queue to reset template !!!')
      }
    });
  }

  onConfigure(dataItem) {
    this.emailTemplateId = dataItem.emailTemplateID;
    this.showEditPanel = true;
    this.operationPerformed('Configure', dataItem.emailTemplateID, this.class5Code).subscribe(response => {
      this.loadEmailTEmplateById(dataItem.emailTemplateID, this.class5Code).subscribe(value => {
        this.class5Code = value.class5CodeID;
        this.locationFbcId = value.fBCETID;
        var itm = this.locationList?.filter((data) => data.class5Code === this.defaultClass5Code)[0];
        this.griTitleEdit = dataItem.templateName + ' ' + 'Email Template Configuration:' + ' ' + dataItem.templateName + ' ' + 'Version for ' + ' ' + itm?.location;
        this.statusDisplay = value.isActive ? 'This template is Active' : 'This template is in Draft mode.';
        this.activeTooltip = value.isActive ? 'De-Activate' : 'Make Active';
        this.emailId = this.user.email;
        this.htmlText = value.hTMLText;
        this.loadEmailTEmplateById(dataItem.emailTemplateID, 0).subscribe(value => {
          this.fbcIdForActive = value.fBCETID;
          this.getLocationListByFbcId(value.fBCETID, this.locationFbcId);
        });
      })
    });
  }

  backToList(){
    this.showEditPanel = false;
    this.getFbcEmailTemplateList(this.class5Code, this.activeDDValue, this.isAdmin);
}

  confirmOperation() {
    if (this.op == 'confirm overwrite') {
      this.operationPerformed('ConfirmOverwrite', this.emailTemplateId, this.class5Code).subscribe(response => {
        this._notifyService.showSuccess(response?.messageString, "", 3000);
        this.gridSetUpView();
      });
    } else if (this.op == 'reset') {
      this.deleteFbcTemplate(this.tempId);
    } else {
      return;
    }
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);
    this.editedRowIndex = rowIndex;
    this.getCodeBlockList();
    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.formGroup = null;
    this.closeEditor(sender, rowIndex);

  }

  public saveHandler({ sender, rowIndex, dataItem }): void {
    this._fbcEmailTemplateService.saveFbcEmailTemplate(dataItem.pHValue, dataItem.fBCETPHItemID, dataItem.locationFBCETPHItemID, this.locationFbcId, dataItem.fBCETID, this.class5Code, this.emailTemplateId)
      .then( (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "", "", 3000);
          this.getLocationListByFbcId(dataItem.fBCETID, this.locationFbcId);
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

  public removeHandler({ dataItem }): void {
    this.deleteFbcetPhItemTemplate(dataItem.locationFBCETPHItemID);
  }

  async makeActiveDeactive(txt) {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.makeActiveDeactive(txt, this.locationFbcId, this.emailTemplateId, this.class5Code, this.fbcIdForActive)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (txt == "Make Active") {
            this.statusDisplay = 'This template is Active';
            this.activeTooltip = 'De-Activate';
          }
          else {
            this.statusDisplay = 'This template is in Draft mode.';
            this.activeTooltip = 'Make Active';
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

  async sendEmail() {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.sendEmailFbc(this.user.email, this.user.cLPUserID, this.class5Code, this.locationFbcId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response?.messageString, "", 3000);
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

  async getCodeBlockList() {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.getCodeBlockList(this.encryptedUser, 1)
      .then(async (result: c1443_FB_CodeBlockResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.codeBlockList = response.codeBlock;
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

  async getCodeBlockData(blockId, dataItem,rowIndex) {
    this.showSpinner = true;
    await this._fbcEmailTemplateService.codeBloadLoadById(this.encryptedUser, blockId)
      .then(async (result: c1443_FB_CodeBlock) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.codeBlockData = response;
            dataItem.locationPHValue = response.blockTest;
            dataItem.pHValue = response.blockTest;
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

}


