import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../models/clpuser.model';
import { ClpCompany, CompanyResponse } from '../../../models/company.model';
import { Contact, ContactList } from '../../../models/contact.model';
import { CreateExportFor, eExportRequestObjectType, eExportRequestStatus, SearchContactBy } from '../../../models/enum.model';
import { ExportRequest } from '../../../models/exportRequest.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { AccountSetupService } from '../../../services/accountSetup.service';
import { ReportService } from '../../../services/report.service';
import { UtilityService } from '../../../services/shared/utility.service';

@Component({
    selector: 'app-search-result-common',
    templateUrl: './search-result-common.component.html',
    styleUrls: ['./search-result-common.component.css']
})
export class SearchResultCommonComponent {
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  referrerContact: Contact[];
  isExportDownload: boolean = false;
  exportRequest: ExportRequest;
  companyResponse: ClpCompany;
  includeMetrics: boolean = false;
  @Output() contactLength: EventEmitter<number> = new EventEmitter<number>();
  @Input() contactsMapData: ContactList[] = [];
  @Input() user: CLPUser;
  @Input() startDate: string='';
  @Input() endDate: string ='';
  @Input() selectedUserId: number;
  @Input() searchBy: number = SearchContactBy.Referral;
  @Input() contactId: number = 0;
  @Input() clickId: number = 0;
  @Input() tagSearchType: number = 0;
  @Input() noteOwnerType: number=0;
  @Input() selectedTagIds: [] = [];
  @Input() eStat: number = eExportRequestStatus.None;
  @Input() eType: number = eExportRequestObjectType.Unknown;
  @Input() createExportFor: number = CreateExportFor.Unknown;
  @Input() isShowSearchGrid: boolean = false;

  // For Score Card Common Grid
  @Input() isScoreCardGrid: boolean = false;
  @Input() scoreCardData: [] = [];
  @Input() hiddenColumns: string[] = [];
  @Input() headerTitle: string='';
  constructor(
    private _reportService: ReportService,
    private datepipe: DatePipe,
    private _utilityService: UtilityService,
    private _accountSetupService: AccountSetupService,
    private _router: Router) {

  }

  ngOnInit(): void {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      if (!isNullOrUndefined(this.user)) {
        this.getCompanyInformation();
        this.getContactSearchList();
      }
    }
    else
      this._router.navigate(['/login']);
  }

  async getContactSearchList() {
    this.showSpinner = true;
    await this._reportService.getContactSearchResult(this.encryptedUser, this.user.cLPCompanyID, this.clickId, this.selectedUserId ? this.selectedUserId : this.user.cLPUserID, this.tagSearchType, this.contactId, this.startDate ? this.startDate : '', this.endDate ? this.endDate : '', this.searchBy ? this.searchBy : null, this.noteOwnerType, this.selectedTagIds)
      .then(async (result: Contact[]) => {
        if (result) {
          this.referrerContact = UtilityService.clone(result);
          this.contactLength.emit(this.referrerContact.length);
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

  async getCompanyInformation() {
    await this._accountSetupService.getClpCompany(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: CompanyResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.companyResponse = response.company;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  setExportRequest() {
    this.exportRequest = <ExportRequest>{};
    this.exportRequest.cLPUserID = this.selectedUserId ? this.selectedUserId : this.user.cLPUserID;
    this.exportRequest.whereClause = '';
    this.exportRequest.orderBy = '';
    this.exportRequest.objectType = this.eType;
    this.exportRequest.cLPCompanyID = this.user.cLPCompanyID;
    this.exportRequest.fileName = eExportRequestObjectType[this.eType];
    this.exportRequest.includeMetrics = this.includeMetrics;
  }
  async createExportRequest() {
    this.showSpinner = true;
    this.setExportRequest();
    await this._reportService.createExportRequest(this.encryptedUser, this.exportRequest, this.createExportFor)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
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

  addNewContact() {
    this._router.navigate(['/contact-create']);
  }

  downloadExport() {
    if (this.user.userRole >= 3 || this.user.slurpyUserId >0) {
        if (this.isExportDownload) {
          this.createExportRequest();
          this.isExportDownload = false;
          this.includeMetrics = false;
        }
        else {
          this.isExportDownload = true;
          this.includeMetrics = false;
        }
    }
    else
      this.createExportRequest();
  }
}
