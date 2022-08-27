import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CompanyModuleResponse } from '../../../../models/accountInformation.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'app-company-module',
    templateUrl: './company-module.component.html',
    styleUrls: ['./company-module.component.css']
})
/** company-module component*/
export class CompanyModuleComponent implements OnInit {
  /** company-module ctor */
  private encryptedUser: string = '';
  showSpinner: boolean = false;

  companyModuleResponse: CompanyModuleResponse;

  constructor(
    public _router: Router,
    public _localService: LocalService,
    public _notifyService: NotificationService,
    public _accountSetupService: AccountSetupService,
    public _utilityService: UtilityService,
  ) {

  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token")) && this._localService.selectedAdminCompanyId != -1) {
      this.encryptedUser = localStorage.getItem("token");
      this.getCompany_SearchCountMsg();
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  getCompany_SearchCountMsg() {
    this.showSpinner = true;
    this._accountSetupService.getCompany_SearchCountMsg(this.encryptedUser, this._localService.selectedAdminCompanyId)
      .then(async (result: CompanyModuleResponse) => {
        if (result) {
          this.companyModuleResponse = UtilityService.clone(result);
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

  onConfirm() {
    this.showSpinner = true;
    var flag = this.companyModuleResponse?.messageString3.includes('Un-install') ? 1 : 2;
    this._accountSetupService.updateCompanyModule(this.encryptedUser, this._localService.selectedAdminCompanyId, flag)
    .then(async (result: CompanyModuleResponse) => {
      if (result) {
        var response = UtilityService.clone(result);
        if (response.messageBool == false) {
          this._notifyService.showError(response.messageString ? response.messageString : 'Some error occured.', "", 3000);
          this.showSpinner = false;
          return;
        }
        this._notifyService.showSuccess(response.messageString ? response.messageString : "Company module updated successfully.", "", 3000);
        this.showSpinner = false;
        this.getCompany_SearchCountMsg();
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
}
