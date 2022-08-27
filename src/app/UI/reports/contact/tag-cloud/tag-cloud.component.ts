import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eNoteOwnerType, eUserRole, SearchContactBy } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { TagsFields, TagsMgmt } from '../../../../models/tag-settings.model';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { TagSettingService } from '../../../../services/tag-setting.service';

@Component({
  selector: 'app-tag-cloud',
  templateUrl: './tag-cloud.component.html',
  styleUrls: ['./tag-cloud.component.css']
})
export class TagCloudComponent {
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  isShowSelectedTags: boolean = false;
  isShowContactList: boolean = false;
  isShowSearchGrid: boolean = true;
  contactLength: number = 0;
  radioSelected: number = 1;
  searchBy: number = 0;
  tagSearchType: number = 0;
  selectedTags: TagsFields[] = [];
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  tagSettingsResponse: TagsMgmt;

  constructor(private _utilityService: UtilityService,
    public _localService: LocalService,
    private _router: Router,
    private _tagsettingsrvc: TagSettingService,
    private _notifyService: NotificationService) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {

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
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser,)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse?.user;
              this.roleFeaturePermissions = this.userResponse?.roleFeaturePermissions;
              this.tagGetListByCLPCompanyWithCount();
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
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
    this.showSpinner = false;
  }

  async tagGetListByCLPCompanyWithCount() {
    this.showSpinner = true;
    await this._tagsettingsrvc.tagGetListByCLPCompanyWithCount(this.encryptedUser, this.user?.cLPCompanyID, eNoteOwnerType.Contact)
      .then(async (result: TagsMgmt) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.tagSettingsResponse = response
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

  deleteSelectedUser(itemTagName: TagsFields) {
    if (itemTagName.tagID !== 0) {
      this.selectedTags?.splice(this.selectedTags.indexOf(itemTagName), 1);
      if (this.selectedTags.length === 0) {
        this.isShowSelectedTags = false
        this.isShowContactList = false
      }
    }
  }

  onViewResultTagCloud(title:string) {
    this.isShowContactList = false;
    this.isShowSearchGrid = true;
      setTimeout(() => {
        this.isShowContactList = true;
      }, 50);
    this.searchBy = SearchContactBy.TagCloud;
    if (title=='showGrid') {
      this.isShowSearchGrid = false;
    }
   }

  onTagCloudName(itemTagName: TagsMgmt) {    
    this.isShowSelectedTags = true;
    if (isNullOrUndefined(this.selectedTags?.filter(item => itemTagName.tagID == item.tagID)[0])) {
      this.selectedTags.push({ cLPCompanyID: this.user?.cLPCompanyID, ownerType: eNoteOwnerType.Contact, tag: itemTagName?.tag, tagID: itemTagName?.tagID, })
    }
    else
      this._notifyService.showError('Tag Name is already Selected.', "", 3000);
  }

  contactLengths(length) {
    this.contactLength = length;
  }
}
