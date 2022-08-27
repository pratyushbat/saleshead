import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { ContactUploadMoreFilters, LookUpItem } from '../../../models/contactExcelUpload';
import { eDDField, eFeatures, eGoalType, eGoalTypeCategory, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { ContactService } from '../../../services/contact.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';

@Component({
  selector: 'goals-list',
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.css']
})

export class GoalsListComponent implements OnInit {

  private encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  /*General*/
  eGoalGeneral: eGoalTypeCategory = eGoalTypeCategory.General;
  eDDFieldsGeneral: eDDField = eDDField.Unknown;

  /*General Appointment*/
  eGoalApptGeneral: eGoalTypeCategory = eGoalTypeCategory.ApptGeneralType;
  eDDFieldsAppGeneral: eDDField = eDDField.ApptGeneralTypeCode;

  /*Contact Appointment*/
  eContactApptType: eGoalTypeCategory = eGoalTypeCategory.ApptContactType;
  eDDFieldContactAppt: eDDField = eDDField.ApptContactTypeCode;

  /*Contact Status*/
  eContactApptSta: eGoalTypeCategory = eGoalTypeCategory.Class1Code;
  eDDFieldContactSta: eDDField = eDDField.Class1Code;


  /*Contact Prospect  Status*/
  eContactApptProsSta: eGoalTypeCategory = eGoalTypeCategory.Class2Code;
  eDDFieldContactProsSta: eDDField = eDDField.Class2Code;


  /*Contact: Agreement Type*/
  eContactAggr: eGoalTypeCategory = eGoalTypeCategory.Class3Code;
  eDDFieldContactAggr: eDDField = eDDField.Class3Code;


  /*Contact: Referral Source Type*/
  eContactRef: eGoalTypeCategory = eGoalTypeCategory.Class4Code;
  eDDFieldContactRef: eDDField = eDDField.Class4Code;


  /*Contact: Location of Interest*/
  eContactLOI: eGoalTypeCategory = eGoalTypeCategory.Class5Code;
  eDDFieldContactLOI: eDDField = eDDField.Class5Code;


  /*Contact: Objections*/
  eContactObject: eGoalTypeCategory = eGoalTypeCategory.Class6Code;
  eDDFieldContactObject: eDDField = eDDField.Class6Code;

  /*Contact: Ad/Marketing Channel*/
  eContactMarket: eGoalTypeCategory = eGoalTypeCategory.Class7Code;
  eDDFieldContactMarket: eDDField = eDDField.Class7Code;


  /*Lead Appointment*/
  eLeadApptType: eGoalTypeCategory = eGoalTypeCategory.ApptLeadType;
  eDDFieldLeadAppt: eDDField = eDDField.ApptLeadTypeCode;


  /*Lead Status*/
  eLeadStatus: eGoalTypeCategory = eGoalTypeCategory.LeadClass1Code;
  eDDFieldLeadSta: eDDField = eDDField.LeadClass1Code;


  /*Lead: Rollout Phases 1 */
  eLeadRollOut: eGoalTypeCategory = eGoalTypeCategory.LeadClass2Code;
  eDDFieldLeadRollOut: eDDField = eDDField.LeadClass2Code;



  selectedUser: number;
  selectedMonth: number = (new Date()).getMonth() + 1;
  selectedYear: number = (new Date()).getFullYear();
  userList: LookUpItem[] = [];
  yearList: LookUpItem[] = [];
  monthList: { key: number, value: string }[] = [{ key: 1, value: 'January' }, { key: 2, value: 'February' }, { key: 3, value: 'March' }, { key: 4, value: 'April' }, { key: 5, value: 'May' }, { key: 6, value: 'June' }, { key: 7, value: 'July' }, { key: 8, value: 'August' }, { key: 9, value: 'September' }, { key: 10, value: 'October' }, { key: 11, value: 'November' }, { key: 12, value: 'December' },];
  listVisible: boolean = true;
  showSpinner: boolean = false;

  isShowSectionLead: boolean = true;
  isShowSectionContact: boolean = true;
  isShowSectionGeneral: boolean = true;
  showGeneralArray: boolean[] = [];
  showLeadArray: boolean[] = [];
  showContactArray: boolean[] = [];

  constructor(private _router: Router,
    public _localService: LocalService,
    public _contactService: ContactService,
    private _utilityService: UtilityService) {
  }
  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.selectedUser = this.user.cLPUserID;
          this.onUsersDDGoals();
          this.getYearRangeDD();
        }
        else
          this._router.navigate(['/login']);
      });
    }
    else
      this._router.navigate(['/login']);
  }

  getYearRangeDD() {
    const currentYear = (new Date()).getFullYear();
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
    const dateRange: string[] = range(currentYear + 4, currentYear - 4, -1);
    dateRange.sort((a, b) => +a - +b);

    dateRange.forEach((indiDate, idx) => {
      var lookupDate: LookUpItem = <LookUpItem>{};
      lookupDate.lookupName = '';
      var selectedIndex = idx + 1;
      lookupDate.value = selectedIndex.toString();
      lookupDate.text = indiDate;
      this.yearList.push(lookupDate);
    });
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ContactList)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
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
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async onUsersDDGoals() {
    this.showSpinner = true;
    await this._contactService.contactUploadGetMoreFilters(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: ContactUploadMoreFilters) => {
        if (result) {
          var res = UtilityService.clone(result);
          this.userList = res.filter_Manager;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  refreshGoalList() {
    this.listVisible = false;
    setTimeout(() => { this.listVisible = true; }, 50);
  }


  genericSection(ev) {

  }

  showSectionLead(ev) {
    this.showLeadArray.push(ev);
    if (this.showLeadArray.length >= 3) {
      var valueCheck: boolean[] = this.showLeadArray.filter(val => val);
      if (valueCheck.length <= 0)
        this.isShowSectionLead = false;
    }
  }

  showSectionContact(ev) {
    this.showContactArray.push(ev);
    if (this.showLeadArray.length >= 8) {
      var valueCheck: boolean[] = this.showContactArray.filter(val => val);
      if (valueCheck.length <= 0)
        this.isShowSectionContact = false;
    }
  }

  showSectionGeneral(ev) {
    this.showGeneralArray.push(ev);
    if (this.showLeadArray.length >= 2) {
      var valueCheck: boolean[] = this.showGeneralArray.filter(val => val);
      if (valueCheck.length <= 0)
        this.isShowSectionGeneral = false;
    }
  }


}
