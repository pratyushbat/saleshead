import { DatePipe, formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { AgreementDashboardData } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-agreements-dashboard',
  templateUrl: './agreements-dashboard.component.html',
  styleUrls: ['./agreements-dashboard.component.css']
})

export class AgreementsDashboardComponent {
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  isCustomDate: boolean = false;
  isAgreementGridData: boolean = false;
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  agreementDashboardForm: FormGroup;
  agreementDashboardData: AgreementDashboardData = <AgreementDashboardData>{};
  date = new Date();
  datePipe = new DatePipe('en-US');
  startDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()), 'yyyy-MM-dd', 'en-US');
  endDt: string = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 3, 0), 'yyyy-MM-dd', 'en-US');

  finilized: any[] = [
    { value: 0, name: "This Month" },
    { value: 1, name: "Last Month" },
    { value: 2, name: "Fiscal YTD" },
    { value: 3, name: "Fiscal 2021" },
    { value: 4, name: "Fiscal 2020" },
    { value: 5, name: "Fiscal 2019" },
    { value: 6, name: "Fiscal 2018" },
    { value: 7, name: "Calender YTD" },
    { value: 8, name: "Custom" },
  ];

  constructor(private _router: Router,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    private _notifyService: NotificationService,
    private fb: FormBuilder) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.agreementDashboardForm = this.prepareAgreementTrackingForm();
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
  prepareAgreementTrackingForm() {
    return this.fb.group({
      startDt: new FormControl(''),
      endDt: new FormControl(''),
      finalized: new FormControl(0),
      franchise: new FormControl(0),
      location: new FormControl(0),
      contactOwner: new FormControl(0),
      referralSource: new FormControl(0),
      marketingChannel: new FormControl(0),
      agreementType: new FormControl(0),
      orderBy: new FormControl(0),
    })
  }
  copyAgreementDashboardFormValue() {
    this.agreementDashboardData.startDt = this.datePipe.transform(this.agreementDashboardForm?.value.startDt, 'yyyy-MM-dd');
    this.agreementDashboardData.endDt = this.datePipe.transform(this.agreementDashboardForm?.value.endDt, 'yyyy-MM-dd');
    this.agreementDashboardData.finalized = this.agreementDashboardForm?.value.finalized;
    this.agreementDashboardData.franchise = this.agreementDashboardForm?.value.franchise;
    this.agreementDashboardData.location = this.agreementDashboardForm?.value.location;
    this.agreementDashboardData.contactOwner = this.agreementDashboardForm?.value.contactOwner;
    this.agreementDashboardData.referralSource = this.agreementDashboardForm?.value.referralSource;
    this.agreementDashboardData.marketingChannel = this.agreementDashboardForm?.value.marketingChannel;
    this.agreementDashboardData.agreementType = this.agreementDashboardForm?.value.agreementType;
    this.agreementDashboardData.orderBy = this.agreementDashboardForm?.value.orderBy;
  }

  patchAgreementDashboardFormValue() {
    this.agreementDashboardData.finalized = 0;
    this.agreementDashboardData.franchise = 0;
    this.agreementDashboardData.location = 0;
    this.agreementDashboardData.contactOwner = 0;
    this.agreementDashboardData.referralSource = 0;
    this.agreementDashboardData.marketingChannel = 0;
    this.agreementDashboardData.agreementType = 0;
    this.agreementDashboardData.orderBy = 0;
    for (let key in this.agreementDashboardData) {
      let value = this.agreementDashboardData[key];
      this.prepareAgreementDashboardPatchFormValue(value, key);
    }
  }

  prepareAgreementDashboardPatchFormValue(key, value) {
    if (this.agreementDashboardForm.get(key))
      this.agreementDashboardForm.get(key).setValue(value)
  }

  agreementDashboardSubmit() {
    this._localService.validateAllFormFields(this.agreementDashboardForm)
    if (this.agreementDashboardForm.valid) {
      this.getAgreementDashboardResponse();
    }
    else
      this._notifyService.showError("Invalid BuzzScore Fields", "", 3000);   
  }
  getAgreementDashboardResponse() {
    this.isAgreementGridData = true;
  }

  onFinilizerFilter(finilizedValue: string) {
    switch (finilizedValue) {
      case '0': {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth(),1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() , 31), 'yyyy-MM-dd', 'en-US');
         
        break;
      }
      case '1': {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()-1,1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()-1,31), 'yyyy-MM-dd', 'en-US');         
        break;
      }
      case '2': {
        this.startDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()-1,1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), this.date.getMonth()-1,31 ), 'yyyy-MM-dd', 'en-US');         
        break;
      }
      case '3': {
        this.startDt = formatDate(new Date(this.date.getFullYear()-1,0,1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear() - 1, 11, 31), 'yyyy-MM-dd', 'en-US');         
        break;
      }
      case '4': {
        this.startDt = formatDate(new Date(this.date.getFullYear()-2, 0,1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear(), -2, 11,31), 'yyyy-MM-dd', 'en-US');         
        break;
      }
      case '5': {
        this.startDt = formatDate(new Date(this.date.getFullYear() - 3, 0,1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear() - 3, 11, 31), 'yyyy-MM-dd', 'en-US');         
        break;
      }
      case '6': {
        this.startDt = formatDate(new Date(this.date.getFullYear() - 4, 0,1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear() - 4, 11, 31), 'yyyy-MM-dd', 'en-US');
        break;
      }
      case '7': {
        this.startDt = formatDate(new Date(this.date.getFullYear() - 1, 0,1), 'yyyy-MM-dd', 'en-US');
        this.endDt = formatDate(new Date(this.date.getFullYear() - 1, 12, 31), 'yyyy-MM-dd', 'en-US');         
        break;
      }
      case '8': {
        this.isCustomDate = true;        
        break;
      }
      default: {
        break;
      }
    }
  }

}
