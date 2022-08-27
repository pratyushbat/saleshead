import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { TxtMsgLogResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { CompanyFieldsResponse, ContactFilters } from '../../../../models/company.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { ReportService } from '../../../../services/report.service';
import { ContactService } from '../../../../services/contact.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-text-msg-log',
  templateUrl: './text-msg-log.component.html',
  styleUrls: ['./text-msg-log.component.css'],
  providers: [GridConfigurationService]
})
export class TextMsgLogComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  userList: ContactFilters[];
  textMsgLogResponse: TxtMsgLogResponse;
  texMsgList = [];
  public inChooserColoumns = [];
  isOutBound: boolean = false;
  textMsgLogForm: FormGroup;
  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: '$', title: '  ', width: '40' },
    { field: 'name', title: 'Name', width: '200' },
    { field: 'mobileNumber', title: 'Mobile', width: '100' },
    { field: 'email', title: 'Email', width: '40' },
    { field: 'text', title: 'Text', width: '40' },
    { field: 'msg', title: 'Message', width: '280' },
    { field: 'comments', title: 'Comment', width: '100' },
    { field: 'action', title: 'Action', width: '40' },
    { field: 'kEYWORD', title: 'Keyword', width: '80' },
    { field: 'cONTENTS', title: 'Contents', width: '300' },
    { field: 'user', title: 'User', width: '100' },
    { field: 'dtReceived', title: 'Received', width: '100' },
    { field: 'dtSend', title: 'Sent', width: '100' },
    { field: 'status', title: 'Status', width: '100' },
  ];
  reorderColumnName: string = 'name,mobileNumber,email,text,msg,comments,action,kEYWORD,cONTENTS,user,dtReceived,dtSend,status';
  columnWidth: string = 'name:200,mobileNumber:100,email:40,text:40,msg:280,comments:100,action:40,kEYWORD:80,cONTENTS:300,user:100,dtReceived:100,dtSend:100,status:100';
  arrColumnWidth: any[] = ['name:200,mobileNumber:100,email:40,text:40,msg:280,comments:100,action:40,kEYWORD:80,cONTENTS:300,user:100,dtReceived:100,dtSend:100,status:100'];
  mobileColumnNames: string[];

  constructor(private fb: FormBuilder,
    private _accountSetupService: AccountSetupService,
    private _reportService: ReportService,
    public _contactService: ContactService,
    private datepipe: DatePipe,
    public _gridCnfgService: GridConfigurationService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;

  }

  ngOnInit(): void {
    this.textMsgLogForm = this.prepareTextMsgLogForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getGridConfiguration();
          this.getUserList();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }


  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser,)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this._gridCnfgService.user = this.user;
              this.textMsgLogForm = this.prepareTextMsgLogForm();
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
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }


  async getUserList() {
    this.showSpinner = true;
    await this._accountSetupService.companyFields_GetConfiguration(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: CompanyFieldsResponse) => {
        if (result) {
          const response = UtilityService.clone(result);
          this.userList = response.companyFields.cLPUserID.items;
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


  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'text_msg_log_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('text_msg_log_grid').subscribe((value) => this.getTextMsgList()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'text_msg_log_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getTextMsgList() {
    this.showSpinner = true;
    let startDate = this.datepipe.transform(this.textMsgLogForm.controls.startDate.value, 'MM/dd/yyyy')
    let endDate = this.datepipe.transform(this.textMsgLogForm.controls.endDate.value, 'MM/dd/yyyy')
    await this._reportService.getTextMsgLogReport(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, startDate, endDate, this.textMsgLogForm.controls.type.value, this.textMsgLogForm.controls.status.value)
      .then(async (result: TxtMsgLogResponse) => {
        if (result) {
          this.textMsgLogResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.textMsgLogResponse, "text_msg_log_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('text_msg_log_grid');
          }
          if (this.textMsgLogForm.controls.type.value == 'out') {
            this.texMsgList = this.textMsgLogResponse._txtMasgList;
            this._gridCnfgService.hiddenColumns = ['text', 'action', 'kEYWORD', 'cONTENTS', 'dtReceived'];
            this.inChooserColoumns = ['name', 'mobileNumber', 'email', 'msg', 'comments', 'user', 'dtSend', 'status'];
            this.isOutBound = true;
          } else {
            this.texMsgList = this.textMsgLogResponse._txtMasgIBList;
            this._gridCnfgService.hiddenColumns = ['msg', 'comments', 'dtSend', 'status'];
            this.inChooserColoumns = ['name', 'mobileNumber', 'email', 'text', 'action', 'kEYWORD', 'cONTENTS', 'user', 'dtReceived'];
            this.isOutBound = false;
          }
          this.showSpinner = false;
        } else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  prepareTextMsgLogForm() {
    return this.fb.group({
      startDate: new FormControl(new Date(new Date().setDate(new Date().getDate() - 7)), [Validators.required]),
      endDate: new FormControl(new Date(), [Validators.required]),
      type: new FormControl('Inbound'),
      status: new FormControl(-1),
      ddUser: new FormControl(this.user?.cLPUserID),
    });
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `TextMessage List`;
    let rows = options.sheets[0].rows;
    rows.forEach((row) => {
      if (row && row.type == "data") {
        row.cells.forEach((cell) => {
          if (cell && cell.value && cell.value.includes("<br>")) {
            cell.value = cell.value.replace(/<br\s*\/?>/gi, ' ');
          }
        });
      }
    });
    Array.prototype.unshift.apply(rows);
    component.save(options);
  }
}
