import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

import { ConfigDetails } from '../../../../models/appConfig.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { ContactHistory } from '../../../../models/contactHistory.model';
import { ContactFields, ContactFieldsResponse } from '../../../../models/contact.model';

import { AppconfigService } from '../../../../services/shared/appconfig.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { ContactSearchService } from '../../../../services/shared/contact-search.service';
import { NotificationService } from '../../../../services/notification.service';
import { eFeatures } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ContactService } from '../../../../services/contact.service';

declare var $: any;

@Component({
    selector: 'app-contact-activity-history',
    templateUrl: './contact-activity-history.component.html',
    styleUrls: ['./contact-activity-history.component.css']
})
/** contact-activity-history component*/
export class ContactActivityHistoryComponent implements OnInit {
  routeUserId: number;
  routeContactId: number;

  /** contact-history ctor */
  mySOUrl: any;
  soUrl: any;
  soImageSite: any;
  slidecastModalImageData: any = {};
  private encryptedUser: string = '';
  user: CLPUser;

  @Input() contactHistory: ContactHistory[] = [];
  @Input() contactId: number = 0;
  @Output() viewLoaded = new EventEmitter();
 
  contactFields: ContactFields;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  initContactHistory: ContactHistory[] = [];

  //for skypeCalls: type-5
  blnIncludeUser: boolean = true;
  isAllActivityAppend: boolean = true;

  constructor(private _appConfigService: AppconfigService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router,
    private _route: ActivatedRoute,
    public _contactSearchService: ContactSearchService,
    public _ngZone: NgZone,
    public _contactService: ContactService,
    private notifyService: NotificationService,
  ) {
    this._contactSearchService.showSpinner = true;
    this._appConfigService.getAppConfigValue(this.encryptedUser, "SO_Site")
      .then(async (result: ConfigDetails) => {
        this.soUrl = result.configValue;
      })
    this._appConfigService.getAppConfigValue(this.encryptedUser, "MySO_URL").
      then(async (result: ConfigDetails) => {
        this.mySOUrl = result.configValue;
      })
    this._appConfigService.getAppConfigValue(this.encryptedUser, "SO_Image_Site")
      .then(async (result: ConfigDetails) => {
        this.soImageSite = result.configValue;
      })
    this.subscribeToEvents();
  }

  blnIncludeContact: boolean = false;
  blnIncludeCompany: boolean = false;

  ngOnInit() {
    this._contactSearchService.showSpinner = true;
    
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
        this.authenticateR(() => {
          if (!isNullOrUndefined(this.user)) {
            this.routeUserId = this._contactSearchService.routeUserId;
            this.routeContactId = this._contactSearchService.routeContactId;

            if ((!isNullOrUndefined(this._localService.contactFields)) && (this._localService.contactFields.contactID.fieldValue == this.contactId))
              this.loadInitData();
            else
              this.getContactFields(this.contactId, this.user.cLPCompanyID, this.user.cLPUserID);


          }
          else {
            this._router.navigate(['/unauthorized']);
          }
        })
      }
      else {
        this._router.navigate(['/unauthorized']);
      }
  }

  ngOnChanges() {
    $("#AllActivity").prop("checked", true);
    var activityDiv = document.getElementById('activityDiv');
    $("#allActivityHtml").append(activityDiv);
    this.initContactHistory = this.contactHistory;
    this.contactHistory.sort((x, y) => +new Date(y.dtToSort) - +new Date(x.dtToSort));
  }

  ngAfterViewInit() {
    this.viewLoaded.next(true);
    this._contactSearchService.showSpinner = false;
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ContactList)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            if (this.user?.userRole <= 3) {
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              if (this.roleFeaturePermissions?.view == false)
                this._router.navigate(['/unauthorized', true]);
            }
          }
          else
            this._router.navigate(['/unauthorized']);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  getContactFields(contactId, companyID, userId) {

    this._localService.getContactFields(this.encryptedUser, contactId, companyID, userId, true)
      .subscribe((value) =>
        this.loadInitData()
      );

  }

  private subscribeToEvents(): void {
    this._localService.reloadData.subscribe((value: boolean) => {
      this._ngZone.run(() => {
        this._contactSearchService.showSpinner = false;
      });
    });
  }

  loadInitData() {
    this.contactFields = this._localService.contactFields;
    this._contactSearchService.showSpinner = false;
  }

  public onTabSelect(e) {
    var activityType = -1;
    var activityType2 = -1;

    if (e) {
      var title = e.target.id;
      if (title) {
        var activityDiv = document.getElementById('activityDiv');
        switch (title) {
          case "AllActivity": activityType = -1; activityType2 = -1; $("#allActivityHtml").append(activityDiv);  break;
          case "Notes": activityType = 1; activityType2 = -1; $("#notesHtml").append(activityDiv); break;
          case "Mailings": activityType = 4; activityType2 = 6; $("#mailingsHtml").append(activityDiv); break;
          case "Calls": activityType = 11; activityType2 = -1; $("#callsHtml").append(activityDiv); break;
          case "Texts": activityType = 8; activityType2 = -1; $("#textsHtml").append(activityDiv); break;
          case "Appointments": activityType = 2; activityType2 = -1; $("#appointmentsHtml").append(activityDiv); break;
          case "Tasks": activityType = 3; activityType2 = -1; $("#tasksHtml").append(activityDiv); break;
          case "InboundTexts": activityType = 9; activityType2 = -1; $("#inboundTextsHtml").append(activityDiv); break;
          case "VoiceDrops": activityType = 10; activityType2 = -1; $("#voiceDropsHtml").append(activityDiv); break;
          case "SkypeCalls": activityType = 5; activityType2 = -1; $("#skypeCallsHtml").append(activityDiv); break;
          case "Slidecast": activityType = 12; activityType2 = -1; $("#slidecastHtml").append(activityDiv); break;
        }
        this.filterContactHistoryByType(activityType, activityType2);
      }
    }

  }

  ngAfterViewChecked() {
    if (this.isAllActivityAppend) {
      var activityDiv = document.getElementById('activityDiv');
      if (activityDiv != null) {
        $("#allActivityHtml").append(activityDiv);
        this.isAllActivityAppend = false;
        this._contactSearchService.showSpinner = false;
      }
    }
  }

  filterContactHistoryByType(type?, type2?) {
      this.contactHistory = [];
      if (type == -1 && type2 == -1) {
        this.contactHistory = this.initContactHistory;
        return this.contactHistory;
      }

      if (type2 != -1) {
        this.contactHistory = this.initContactHistory.filter(function (v, i) {
          return ((v["type"] == type || v["type"] == type2));
        })
      }
      else {
        this.contactHistory = this.initContactHistory.filter(x => x.type == type);
      }
      return this.contactHistory;
  }

  changeContactActivitySort(event) {
    if (event && this.contactHistory.length > 0) {
      var selectedValue = event.target.value;
      var result = [];
      switch (selectedValue) {
        case "newest":
          result = this.contactHistory.sort((x, y) => +new Date(y.dtToSort) - +new Date(x.dtToSort));
          this.contactHistory = result;
          this.notifyService.showSuccess("Activity filtered on " + selectedValue + "!", "", 3000);
          break;
        case "oldest":
          result = this.contactHistory.sort((x, y) => +new Date(x.dtToSort) - +new Date(y.dtToSort));
          this.contactHistory = result;
          this.notifyService.showSuccess("Activity filtered on " + selectedValue + "!", "", 3000);
          break;
        default:
          this.contactHistory = this.contactHistory;
          break;
      }
    }
  }

  goToApptContact(type,id?) {
    if (type) {
      switch (type) {
        case "contact": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/view.aspx?cid=" + id);
          window.open(mContactUrl, '');
          break;
        }
        case "company": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/company/view.aspx?coid=" + id);
          window.open(mContactUrl, '');
          break;
        }
        case "lead": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/lead/view.aspx?lid=" + id);
          window.open(mContactUrl, '');
          break;
        }
      }
    }
  }

  gotoAppointment(apptId, catId, blnEditMode: boolean = false, blnIncludeQuotes: boolean = true, intMessageID: number = 0, strRedirectCode: string = "", blnOpenCallForm: boolean = false, blnForceGeneralTab: boolean = false, intCASID: number = 0, intBCKID: number = 0, intOwnerID: number = 0) {
    var url = this.soUrl;
    var strEditMode = '';
    var strMsgID = '';
    var strRDT = '';
    var strCF = '';
    var strFGT = '';
    var strCASID = '';
    var strBCKID = '';
    var strWinID = '';

    blnEditMode == true ? strEditMode = "&mde=e" : strEditMode = '';
    intMessageID == 0 ? strMsgID = "" : strMsgID = "&msgid=" + intMessageID.toString();
    strRedirectCode == "" ? strRDT = "" : strRDT = "&rdt=" + strRedirectCode;
    blnOpenCallForm == true ? strCF = "&cf=1" : strCF = "";
    blnForceGeneralTab == true ? strFGT = "&fgt=1" : strFGT = "";
    intCASID > 0 ? strCASID = "&casid=" + intCASID.toString() : strCASID = "";
    apptId == 0 ? strWinID = "clpapt" + Date.now() : strWinID = "clpapt" + apptId.toString();
    intBCKID > 0 ? strBCKID = "&bckid=" + intBCKID.toString() : strBCKID = "";

    var goTo = '';
    if(catId != 4 && intOwnerID > 0)
      goTo = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/calendar/clpappt.aspx?flr=1" + "&cat=" + catId + "&id=0" + "&aid=" + apptId.toString() + strEditMode + strMsgID + strRDT + strCF + strFGT + strCASID + strBCKID);
    else
      goTo = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/calendar/clpappt.aspx?flr=1" + "&aid=" + apptId.toString() + strEditMode + strMsgID + strRDT + strCF + strFGT + strCASID + strBCKID );
    window.open(goTo, '', 'width=900,height=700,left=1, right=1');
  }

  voiceCallLink(vCall_VoiceCallID, vCall_dtStart) {
    var url = this.soUrl;
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    const d = new Date(vCall_dtStart);
    var day = weekday[d.getDay()];

    if (day && day != '' && day != null) {
      var vCallUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/voice/makevoicecall.aspx?vid=" + vCall_VoiceCallID.toString() + "");
      window.open(vCallUrl, '_blank');
    }

  }

  voiceCallRecording(vCall_VoiceCallID) {
    if (vCall_VoiceCallID && vCall_VoiceCallID != '' && vCall_VoiceCallID != null) {
      var url = this.soUrl;
      var vCallUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/voice/playaudio.aspx?tpe=vc&id=" + vCall_VoiceCallID.toString());
      window.open(vCallUrl, '_blank');
    }
  }

  VoiceCallLogWindowLink(vCall_VoiceCallID) {
    if (vCall_VoiceCallID && vCall_VoiceCallID != '' && vCall_VoiceCallID != null) {
      var url = this.soUrl;
      var vLogUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "//voice/voicecalllog.aspx?vid=" + vCall_VoiceCallID.toString());
      window.open(vLogUrl, '', 'width=500,height=600,left=1, right=1');
    }
  }

  mailingContactLink(type, mailingId?) {

    if (type) {
      switch (type) {
        case "contact": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/view.aspx?cid=" + this.routeContactId);
          window.open(mContactUrl, '');
          break;
        }
        case "company": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/company/view.aspx?coid=" + mailingId);
          window.open(mContactUrl, '');
          break;
        }
        case "template": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/ext/mgetpreview.aspx?mgid=" + mailingId + "&cid=" + this.routeContactId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "image": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/marketing/mailing.aspx?mid=" + mailingId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "day": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/marketing/mailing.aspx?mid=" + mailingId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "status": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/marketing/mailing.aspx?mid=" + mailingId);
          window.open(mContactUrl, '');
          break;
        }
      }
    }
  }

  notesLink(type, noteLinkId?, ownerType?) {
    if (type) {
      switch (type) {
        case "dayTime": {
          var url = this.soUrl;
          var mContactUrl = '';
          if (ownerType == 2)
            mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/history.aspx?ntid=" + noteLinkId);
          else if (ownerType == 3)
            mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/lead/history.aspx?ntid=" + noteLinkId);
          else if (ownerType == 6)
            mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/link/history.aspx?ntid=" + noteLinkId);
          else
            mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/profile/Notes.aspx?tkid=" + noteLinkId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "contact": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/view.aspx?cid=" + noteLinkId);
          window.open(mContactUrl, '');
          break;
        }
        case "attachment": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/document/filedownload.aspx?did=" + noteLinkId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "emailTemplate": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/ext/ntetpreview.aspx?ntid=" + noteLinkId.toString());
          window.open(mContactUrl, '_blank');
          break;
        }
        case "mailMergeTemplate": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/ext/ntmmtpreview.aspx?ntid=" + noteLinkId.toString());
          window.open(mContactUrl, '_blank');
          break;
        }
      }
    }
  }

  taskLink(type, noteLinkId?) {
    if (type) {
      switch (type) {
        case "viewTask": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/tasks.aspx?tkid=" + noteLinkId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "contact": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/view.aspx?cid=" + noteLinkId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "company": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/company/view.aspx?coid=" + noteLinkId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "leadCompany": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/view.aspx?cid=" + this.routeContactId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "lead": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/lead/view.aspx?lid=" + this.routeContactId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "leadcompany2": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/company/view.aspx?coid=" + noteLinkId);
          window.open(mContactUrl, '_blank');
          break;
        }
      }
    }
  }

  skypeCallLink(type, skypeId?) {
    if (type) {
      switch (type) {
        case "contact": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/contact/view.aspx?cid=" + skypeId.toString());
          window.open(mContactUrl, '');
          break;
        }
        case "company": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/company/view.aspx?coid=" + skypeId.toString());
          window.open(mContactUrl, '');
          break;
        }
      }
    }
  }

  slidecastLink(type, slidecastLinkId?) {
    if (type) {
      switch (type) {
        case "title": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/vip/vip.aspx?vid=" + slidecastLinkId);
          window.open(mContactUrl, '_blank');
          break;
        }
        case "logImage": {
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/ext/vipslidepreview.aspx?vsid=" + slidecastLinkId);
          window.open(mContactUrl, '_blank');
          break;
        }
      }
    }
  }

  showSlideCastImageModal(data) {
    this.slidecastModalImageData = data;
  }

  trackByFn(index, item) {
    return (item.type);
  }

}
