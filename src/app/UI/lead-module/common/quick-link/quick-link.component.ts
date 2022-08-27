import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { filterAnimation, pageAnimations } from '../../../../animations/page.animation';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../../models/enum.model';
import { DropDownItem } from '../../../../models/genericResponse.model';
import { LinkContactExtWithCount, LinkContactWithCountExtListResponse } from '../../../../models/link-contact.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { LinkGroupService } from '../../../../services/link-group.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'quick-link',
    templateUrl: './quick-link.component.html',
  styleUrls: ['./quick-link.component.css'],
  animations: [pageAnimations, filterAnimation]
})
/** quick-link component*/
export class QuickLinkComponent {
  @Input() loggedUser: CLPUser;
  @Input() ownerId: number = 0;
  linkId: number = 0;
  linkName: string = '';
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  isLinkContactSubmit: boolean = false;
  showEmailComponent: boolean = false;
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  linkContactList: LinkContactExtWithCount[];
  filterLinks: DropDownItem[] = [];
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  linkContactForm: FormGroup;
  columns = [{ field: '$', title: '', width: '40' }
    , { field: 'linkName', title: 'Link Name', width: '100' }
    , { field: 'numContacts', title: 'Contacts', width: '40' }];
  reorderColumnName: string = 'linkName,numContacts';
  //Animation
  constructor(
    private _router: Router,
    public _localService: LocalService,
    public _linkGroupSrvc: LinkGroupService,
    private _utilityService: UtilityService,
    private fb: FormBuilder,
    public notifyService: NotificationService
  ) {
  }

  ngOnInit() {
    this.linkContactForm = this.preparelinkContactForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.loggedUser)) {
          this.linkContactForm.reset();
          this.getQuickLinkLoad();
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
              this.loggedUser = this.userResponse.user;
              if (this.loggedUser?.userRole <= eUserRole.Administrator) {
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

  private preparelinkContactForm(): FormGroup {
    return this.fb.group({
      linkId: [{ value: '0' }, [Validators.required]],
      relationship: [{ value: '' }, [Validators.required]]
    });
  }

  get linkContactFrm() {
    return this.linkContactForm.controls;
  }

  linkContactFormSubmit() {
    this._localService.validateAllFormFields(this.linkContactForm);
    if (this.linkContactForm.valid) {
      this.linkContactForm.markAsPristine();
      this.createLinkContact();
    }
  }

  createLinkContact() {
    this.isLinkContactSubmit = true;
    this._linkGroupSrvc.quickLinkUpdate(this.encryptedUser, parseInt(this.linkContactForm.controls.linkId.value), this.ownerId, this.loggedUser.cLPUserID, this.linkContactForm.controls.relationship.value, 3)
      .then(async (result: LinkContactWithCountExtListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.linkContactList = response.linkContactList;
          this.filterLinks = response.filter_Links;
          this.notifyService.showSuccess("Link contact Created successfully", "", 5000);
          this.linkContactForm.reset();
          this.preparelinkContactForm();
        }
        this.isLinkContactSubmit = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.isLinkContactSubmit = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  onCloseLink() {
    this._localService.hideCommonComponentEmit('link');
    this._localService.showCommonComp = '';
  }

  getQuickLinkLoad() {
    this._linkGroupSrvc.quickLinkLoad(this.encryptedUser, this.ownerId, this.loggedUser?.cLPUserID, 3)
      .then(async (result: LinkContactWithCountExtListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.linkContactList = response.linkContactList;
          this.filterLinks = response.filter_Links;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  public viewHandler(dataItem) {
    this._router.navigate(['link-group', dataItem.dataItem.linkID]);
  }

  closeEmailBox(value) {
    this.showEmailComponent = value;
  }

  goToLink(dataItem) {
    this.resetChildForm();
    this.linkId = dataItem?.linkID;
    this.linkName = dataItem?.linkName;
   /* this.showEmailComponent = true;*/
  }

  resetChildForm() {
    this.showEmailComponent = false;

    setTimeout(() => {
      this.showEmailComponent = true
    }, 100);
  }
}
