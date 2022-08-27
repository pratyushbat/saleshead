import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { SearchQueryResponse } from '../../../models/search.model';
import { ContactService } from '../../../services/contact.service';
import { LeadSettingService } from '../../../services/leadSetting.service';
import { NotificationService } from '../../../services/notification.service';
import { ContactCommonSearchService } from '../../../services/shared/contact-common-search.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';

@Component({
    selector: 'lead',
    templateUrl: './lead.component.html',
    styleUrls: ['./lead.component.css']
})
/** lead-list component*/
export class LeadComponent {
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  roleFeaturePermissions: RoleFeaturePermissions;
  userResponse: UserResponse;
  queryDataLoaded: SearchQueryResponse;
  private _leftPanelSize: string = '20%';
  private _rightPanelSize: string = '15%';
  panelsSize: string = 'left:20%,right:15%';
  showTaskComponent: boolean = false;
  showNoteComponent: boolean = false;
  showApptComponent: boolean = false;
  showLinkComponent: boolean = false;
  showLeadCreateComponent: boolean = false;
  showUploadComponent: boolean = false;
  leadId: number = 0;
  contactId: number = 0;
  userName: string = '';
  companyName: string = '';
  isLeadEdit: boolean = false;
  constructor(public _contactService: ContactService,
    private _utilityService: UtilityService,
    private _route: ActivatedRoute,
    private _ngZone: NgZone,
    public _localService: LocalService,
    private _router: Router,
    public _contactCommonSearchService: ContactCommonSearchService,
    public notifyService: NotificationService) {
    this._localService.isMenu = true;
    this._route.paramMap.subscribe(async params => {
      if (params.has('leadId') || params.has('userName') || params.has('companyName') || params.has('contactId')) {
        this.leadId = +params.get('leadId');
        this.userName = params.get('userName');
        this.companyName = params.get('companyName');
        this.contactId = +params.get('contactId');
      }
    });
    this.subscribeToEvents();
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.MyLead)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              if (this.user?.userRole <= eUserRole.Administrator) {
                this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
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

  public get leftPanelSize(): string {
    return this._leftPanelSize;
  }

  public set leftPanelSize(newSize: string) {
    this._leftPanelSize = newSize;
  }

  public get rightPanelSize(): string {
    return this._rightPanelSize;
  }

  public set rightPanelSize(newSize: string) {
    this._rightPanelSize = newSize;
  }

  panelSizeChange(panelName, size) {
    if (panelName == 'left') {
      var leftPanelSize = this._leftPanelSize.slice(0, 5);
      this._leftPanelSize = leftPanelSize.includes('%') ? leftPanelSize : leftPanelSize + '%';
    }
    else if (panelName == 'right') {
      var rightPanelSize = this._rightPanelSize.slice(0, 5);
      this._rightPanelSize = rightPanelSize.includes('%') ? rightPanelSize : rightPanelSize + '%';
    }
    var gridType = 'contact_panel_size';
    this.panelsSize = 'left:' + this._leftPanelSize + ',' + 'right:' + this.rightPanelSize;
  }

  closeTaskComponent(event) {
    this.showTaskComponent = event;
  }

  private subscribeToEvents(): void {
    this._localService.hideCommonComponent.subscribe((value: string) => {
      this._ngZone.run(() => {
        switch (value) {
          case 'task':
            this.showTaskComponent = false;
            break;
          case 'note':
            this.showNoteComponent = false;
            break;
          case 'appt':
            this.showApptComponent = false;
            break;
          case 'link':
            this.showLinkComponent = false;
            break;
          case 'lead-create':
            this.showLeadCreateComponent = false;
            break;
          case 'upload':
            this.showUploadComponent = false;
            break;
          default:
            break;
        }
      });
    });
  }

  showCommonComponent() {
    this.showNoteComponent = false; this.showApptComponent = false; this.showTaskComponent = false;
    var commonComponent = this._localService.showCommonComp;
    switch (commonComponent) {
      case 'appt':
        this.showNoteComponent = false;
        this.showTaskComponent = false;
        this.showLinkComponent = false;
        this.showUploadComponent = false;
        this.showLeadCreateComponent = false;

        this.showApptComponent = true;

        break;
      case 'note':
        this.showApptComponent = false;
        this.showTaskComponent = false;
        this.showLinkComponent = false;
        this.showUploadComponent = false;
        this.showLeadCreateComponent = false;

        this.showNoteComponent = true;
        break;
      case 'task':
        this.showApptComponent = false;
        this.showNoteComponent = false;
        this.showLinkComponent = false;
        this.showUploadComponent = false;
        this.showLeadCreateComponent = false;

        this.showTaskComponent = true;
        break;
      case 'link':
        this.showApptComponent = false;
        this.showNoteComponent = false;
        this.showTaskComponent = false;
        this.showUploadComponent = false;
        this.showLeadCreateComponent = false;

        this.showLinkComponent = true;
        break;
      case 'lead-create':
        this.showApptComponent = false;
        this.showNoteComponent = false;
        this.showTaskComponent = false;
        this.showUploadComponent = false;
        this.showLinkComponent = false;
        this.resetChildForm();
      /*  this.showLeadCreateComponent = true;*/
        break;
      case 'upload':
        this.showApptComponent = false;
        this.showNoteComponent = false;
        this.showTaskComponent = false;
        this.showLeadCreateComponent = false;
        this.showLinkComponent = false;

        this.showUploadComponent = true;
        break;
      default:
        break;
    }
  }

  resetChildForm() {
    this.showLeadCreateComponent = false;

    setTimeout(() => {
      this.showLeadCreateComponent = true
    }, 100);
  }
}
