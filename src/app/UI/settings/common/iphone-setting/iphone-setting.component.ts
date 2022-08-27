import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { CLPUserDetails, UsersListsResponse } from '../../../../models/accountInformation.model';
import { CLPUser } from '../../../../models/clpuser.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'iphone-setting',
  templateUrl: './iphone-setting.component.html',
  styleUrls: ['./iphone-setting.component.css']
})

export class IphoneSettingComponent implements OnInit {

  @Input() user: CLPUser;
  @Input() companyIdIphone: number;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  encryptedUser: string;
  showSpinner: boolean = false;
  activeIphoneList: any[] = [];
  inactiveIphoneList: any[] = [];
  iphoneSettngResponse: UsersListsResponse;
  iphoneToUpdate;

  constructor(private _accountSetupService: AccountSetupService, public _localService: LocalService, private _utilityService: UtilityService) {

  }

  loadIphoneSettings() {
    if (!isNullOrUndefined(this.user)) {
      if (!isNullOrUndefined(localStorage.getItem("token"))) {
        this.encryptedUser = localStorage.getItem("token");
        this.getIphoneSettings();
      }
    }
  }

  ngOnInit() {

      this.loadIphoneSettings();
  }

  async getIphoneSettings() {
    this.showSpinner = true;
    this.companyIdIphone = (!!this.companyIdIphone && this.companyIdIphone > 0) ? this.companyIdIphone : this.user.cLPCompanyID;
    await this._accountSetupService.iphoneUserGetList(this.encryptedUser, this.companyIdIphone)
      .then(async (result: UsersListsResponse) => {
        if (result) {
          this.iphoneSettngResponse = UtilityService.clone(result);
          this.activeIphoneList = this.iphoneSettngResponse.iPhoneEnableUsers;
          this.inactiveIphoneList = this.iphoneSettngResponse.iPhoneDisableUsers;
          this.showSpinner = false;
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  fromList_Onclick(e: any) {
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      switch (event.container.id) {
        case 'iphone-active': {
          this.activeIphoneList[event.currentIndex].enableiPhone = true;
          this.iphoneToUpdate = this.activeIphoneList[event.currentIndex];
          this.saveIphone(this.iphoneToUpdate.clpUserId, this.iphoneToUpdate.enableiPhone ? 1 : 0);
          break;
        }
        case 'iphone-inactive': {
          this.inactiveIphoneList[event.currentIndex].enableiPhone = false;
          this.iphoneToUpdate = this.inactiveIphoneList[event.currentIndex];
          this.saveIphone(this.iphoneToUpdate.clpUserId, this.iphoneToUpdate.enableiPhone ? 1 : 0)
          break;
        }
        default:
          break;
      }
    }
  }
  selectAll() {
    for (var i = 0; i < this.activeIphoneList.length; i++) {
      if (!this.inactiveIphoneList.includes(i => i.clpUserId == this.activeIphoneList[i].clpUserId)) {
        this.activeIphoneList[i].enableiPhone = false;
        this.inactiveIphoneList.push(this.activeIphoneList[i]);
      }
    }
    this.activeIphoneList = [];
    this.saveIphoneSettings(this.inactiveIphoneList);
  }

  unSelectAll() {
    for (var i = 0; i < this.inactiveIphoneList.length; i++) {
      if (!this.activeIphoneList.includes(i => i.clpUserId == this.inactiveIphoneList[i].clpUserId)) {
        this.inactiveIphoneList[i].enableiPhone = true;
        this.activeIphoneList.push(this.inactiveIphoneList[i]);
      }
    }
    this.inactiveIphoneList = [];
    this.saveIphoneSettings(this.activeIphoneList);
  }
  async saveIphoneSettings(cLPUserList: CLPUserDetails[]) {
    this.showSpinner = true;
    await this._accountSetupService.iphoneUserSaveList(this.encryptedUser, cLPUserList)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this.showSpinner = false;
          var response = UtilityService.clone(result);
          this.getIphoneSettings();
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }
  async saveIphone(cLPUserID: number, enableIPhone: number) {
    this.showSpinner = true;
    await this._accountSetupService.iphoneUserSave(this.encryptedUser, cLPUserID, enableIPhone)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this.showSpinner = false;
          var response = UtilityService.clone(result);
          this.getIphoneSettings();
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }
}
