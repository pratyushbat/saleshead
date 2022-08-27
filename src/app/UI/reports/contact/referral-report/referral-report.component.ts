import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUserFilterResponse, ReferrerReport, ReferrerReportResponse, SendMailInfo, userListResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { Contact } from '../../../../models/contact.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { ContactService } from '../../../../services/contact.service';
import { OfficeSetupService } from '../../../../services/officeCode.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { TeamOfficeSetupService } from '../../../../services/teamoffice.service';
declare var $: any;

@Component({
  selector: 'app-referral-report',
  templateUrl: './referral-report.component.html',
  styleUrls: ['./referral-report.component.css'],
  providers: [GridConfigurationService]
})
export class ReferralReportComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;
  gridHeight;
  sendMailInfo: SendMailInfo = { isShow: false, contactId: 0 };

  referrerResponse: ReferrerReportResponse;
  referrerList: ReferrerReport[];
  referrerContact: Contact[];
  strisAdvanced: string = '%20';
  selectedType: string = 'both';
  searchBy: number = 3;

  isShowContactList: boolean = false;
  referralForm: FormGroup;
  startDate: string = '';
  endDate: string = '';
  responseDD: CLPUserFilterResponse;
  columns = [{ field: '$', title: '', width: '20' },
    { field: '$', title: ' ', width: '20' },
    { field: 'firstName', title: 'Referrer Contact Name', width: '300' },
    { field: 'count', title: '# Referrals', width: '60' },
    { field: 'email', title: '', width: '20' },
    { field: 'amazon', title: 'Amazon', width: '60' },
    { field: 'companyName', title: 'Company', width: '60' },
    { field: 'userName', title: 'User', width: '60' },
    { field: 'dtCreated', title: 'Date Created', width: '60' },];
  reorderColumnName: string = 'firstName,count,email,amazon,companyName,userName,dtCreated';
  columnWidth: string = 'firstName:300,count:60,email:20,amazon:60,companyName:60,userName:60,dtCreated:60';
  arrColumnWidth: string[] = ['firstName:300,count:60,email:20,amazon:60,companyName:60,userName:60,dtCreated:60'];

  constructor(private fb: FormBuilder,
    private _reportService: ReportService,
    public _contactService: ContactService,
    private _officeCodeservice: OfficeSetupService,
    private _teamOfficeService: TeamOfficeSetupService,
    private datepipe: DatePipe,
    public _gridCnfgService: GridConfigurationService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('493px');

  }

  ngOnInit(): void {
    this.referralForm = this.prepareReferralReportForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getGridConfiguration();
          this.referralReportDD();
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
              this.selectedUserId = this.user.cLPUserID;
              this.referralForm = this.prepareReferralReportForm();
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

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'referrer_report_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('referrer_report_grid').subscribe((value) => this.getReferrerList()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'referrer_report_grid').subscribe((value) => this.getGridConfiguration());
  }

  prepareReferralReportForm() {
    return this.fb.group({
      startDate: new FormControl(),
      endDate: new FormControl(),
      teamCode: new FormControl(this.user?.teamCode),
      officeCode: new FormControl(this.user?.officeCode),
      ddUser: new FormControl(this.user?.cLPUserID),
    });
  }

  async getUserList() {
    await this._reportService.getCompany2DUsers(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.referralForm.controls.officeCode.value, this.referralForm.controls.teamCode.value, false, false, false, false, false)
      .then(async (result: userListResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.responseDD.userDD = response.userDD;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async referralReportDD() {
    this.showSpinner = true;
    await this._reportService.getUserFilterResponse(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: CLPUserFilterResponse) => {
        if (result) {
          this.responseDD = UtilityService.clone(result);
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async getReferrerList() {
    this.showSpinner = true;
    this.startDate = this.datepipe.transform(this.referralForm.controls.startDate.value, 'MM/dd/yyyy')
    this.endDate = this.datepipe.transform(this.referralForm.controls.endDate.value, 'MM/dd/yyyy')
    this.selectedUserId = this.referralForm.controls.ddUser.value ? this.referralForm.controls.ddUser.value : this.user.cLPUserID;
    await this._reportService.getContactReferrerReport(this.encryptedUser, this.user.cLPCompanyID, this.selectedUserId, this.startDate ? this.startDate : '', this.endDate ? this.endDate : '')
      .then(async (result: ReferrerReportResponse) => {
        if (result) {
          this.referrerResponse = UtilityService.clone(result);
          this.referrerList = this.referrerResponse?.referrerReport;
          this.isShowContactList = false;
          this.selectedType = 'both';
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

  onChangeReferral(gridShow) {
    switch (gridShow) {
      case 'both':
        this.isShowContactList = false;
        break;
      case 'referrers':
        this.isShowContactList = false;
        this.searchBy = 3;
        setTimeout(() => { this.isShowContactList = true; }, 50);
        break;
      case 'referrals':
        this.isShowContactList = false;
        this.searchBy = 2;
        setTimeout(() => { this.isShowContactList = true; }, 50);
        break;
    }
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
        case "email": {
          $('#sendEmailModal').modal('show');
          this.sendMailInfo.isShow = true;
          this.sendMailInfo.contactId = dataItem?.contactID;
          break;
        }
        default: {
          break;
        }
      }
    }
  }
}
