import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, SFAResponse } from '../../../../models/clpuser.model';
import { GenericRequest } from '../../../../models/genericRequest.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { keyValue } from '../../../../models/search.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { SignupService } from '../../../../services/signup.service';

@Component({
  selector: 'transfer-user',
  templateUrl: './transfer-user.component.html',
  styleUrls: ['./transfer-user.component.css'],
  providers: [GridConfigurationService]
})

export class TransferUserComponent implements OnInit {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  hideUserData: boolean = false;
  cLPCompanyID: number;
  showSpinner: boolean = false;
  userList: keyValue[];
  userDataDisplay: string;
  showBtn: number = 0;
  fromUser: number = 0;
  toUser: number = 0;
  markData: string;
  userName: string;
  userToName: string;
  constructor(public _localService: LocalService, private _utilityService: UtilityService, private _router: Router, public _signupService: SignupService,
    private _accountSetupService: AccountSetupService, private _notifyService: NotificationService) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this._localService.changedCompanyId.subscribe(id => {
      if (id !== this.cLPCompanyID) {
        this.cLPCompanyID = id;
        this.getUserList()
      }
    });

  }

  async getUserList() {
    this.showSpinner = true;
    let genericReq: GenericRequest = <GenericRequest>{};
    genericReq.messageString = '';
    await this._accountSetupService.loadUsers(this.encryptedUser, this.cLPCompanyID)
      .then(async (result: SFAResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.userList = response.filterUser;
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

  getToUser(id) {
    this.userToName = this.userList.filter(i => i.key == id)[0]?.value
    console.log(this.userToName)
  }

  async getUserTransferData(e) {
    if (e != 0) {
      this.showSpinner = true;
      await this._accountSetupService.getUserResources(this.encryptedUser, e, this.cLPCompanyID)
        .then(async (result: SimpleResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this.userDataDisplay = response.messageString.split('\r').join('\n');
            this.userName = this.userList.filter(i => i.key == e)[0].value
            this.markData = 'Formerly' + ' '.repeat(2) + this.userName;
            this.hideUserData = true;
            this.showBtn = 1;
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
    } else {
      this.hideUserData = false;
      this.showBtn = 0;
      this.markData = null;
      this.fromUser = 0
      this.toUser = 0
    }

  }

  goToNext() {
    if ((this.fromUser != 0) && (this.toUser != 0) && !isNullOrUndefined(this.markData))
      this.showBtn = 2;
    else
      this.showBtn = 3;
  }

  cancel() {
    this.showBtn = 1;
  }

  async onConfirmOperation() {
    switch (this.showBtn) {
      case 2: {
        this.showSpinner = true;
        await this._accountSetupService.transferUser(this.encryptedUser, this.cLPCompanyID, this.fromUser, this.toUser, this.markData)
          .then(async (result: SimpleResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              this._notifyService.showSuccess(response.messageString ? response.messageString : "User Data Tranferred Successfully.", "", 3000);
              this.hideUserData = false;
              this.showBtn = 0;
              this.fromUser = 0
              this.toUser = 0
              this.markData = null;
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
        break;
      }
      case 3: {
        this.showSpinner = true;
        await this._accountSetupService.resetUser(this.encryptedUser, this.fromUser)
          .then(async (result: SimpleResponse) => {
            if (result) {
              var response = UtilityService.clone(result);
              this._notifyService.showSuccess(response.messageString ? response.messageString : "User Data Deleted Successfully.", "", 3000);
              this.hideUserData = false;
              this.showBtn = 0;
              this.markData = null;
              this.fromUser = 0
              this.toUser = 0
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
        break;
      }
      default: {
        break;
      }
    }
  }
}
