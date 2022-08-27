import { Component, OnInit, IterableDiffer, IterableDiffers, DoCheck, Input } from '@angular/core';
import { ContactExportRequest, ContactExportRequestResponse, ExportRequest } from '../../../../models/exportRequest.model';
import { Observable, Subscription, timer } from 'rxjs';
import { eExportRequestObjectType, eExportRequestStatus } from '../../../../models/enum.model';
import { NotificationService } from '../../../../services/notification.service';
import { ContactService } from '../../../../services/contact.service';
import { CLPUser } from '../../../../models/clpuser.model';
import { UtilityService } from '../../../../services/shared/utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { ReportService } from '../../../../services/report.service';
@Component({
    selector: 'contact-exports',
    templateUrl: './contact-exports.component.html',
    styleUrls: ['./contact-exports.component.css']
})
/** contact-exports component*/
export class ContactExportsComponent implements OnInit, DoCheck  {
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  mapRecentContact = [];
  existingLength: number;
  isExisting: boolean = true;
  subscription: Subscription;
  everyFiveSeconds: Observable<number> = timer(0, 5000);
  requestStatus = eExportRequestStatus;
  requestType = eExportRequestObjectType;
  private _differ: IterableDiffer<ContactExportRequest>;
  @Input() user: CLPUser;
  @Input() eStat: number = eExportRequestStatus.None;
  @Input() eType: number = eExportRequestObjectType.Unknown;
  @Input() selectedUserId: number;
  @Input() isContactReport: boolean =false;
  constructor(private _notifyService: NotificationService,
    public _contactService: ContactService,
    private _reportService: ReportService,
    private _utilityService: UtilityService,
    differs: IterableDiffers,) {
    this._differ = differs.find([]).create(null);
  }

  ngDoCheck() {
    var changes = this._differ.diff(this.mapRecentContact);
    if (changes) {
      changes.forEachAddedItem((record) => {
        if (this.mapRecentContact.length > this.existingLength) {
          this._notifyService.showSuccess('Mapping updated successfully', 'Contact Mapped', 3000);
        }

      });
    }
  }
  ngOnInit(): void {
    if (!isNullOrUndefined(this.user)) {
      this.existingLength = this.mapRecentContact.length;
      this.subscription = this.everyFiveSeconds.subscribe(() => {
        if (this.isContactReport)
          this.getContactExport();
        else
          this.getMapContactsHistory();
      });
    }
  }
  async getMapContactsHistory() {
    this.showSpinner = true;
    await this._contactService.getContactsMapList(this.encryptedUser, this.user?.cLPUserID, this.user?.cLPCompanyID)
      .then((result: ContactExportRequestResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.mapRecentContact = response.contactExportRequests;
          if (this.isExisting) {
            this.existingLength = this.mapRecentContact.length;
          }
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  async getContactExport() {
    this.showSpinner = true;
    let userId = this.selectedUserId ? this.selectedUserId : this.user?.cLPUserID;
      await this._reportService.getExportRequestsList(this.encryptedUser, this.user.cLPCompanyID, userId, this.eStat, this.eType)
      .then(async (result: ExportRequest[]) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.mapRecentContact = response;
          if (this.isExisting) {
            this.existingLength = this.mapRecentContact.length;
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
}
