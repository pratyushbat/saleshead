import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eSectionLead, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { LeadSettingService } from '../../../services/leadSetting.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { LeadFields, LeadFieldsResponse } from '../../../models/lead.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { sectionDiplaySetting } from '../../../models/contact.model';
import { NotificationService } from '../../../services/notification.service';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { isNullOrEmptyString } from '@progress/kendo-angular-grid/dist/es2015/utils';
import { keyValue, Search, SearchListResponse } from '../../../models/search.model';
import { SearchContactService } from '../../../services/Searchcontact.service';
import { DatePipe } from '@angular/common';
declare var $: any;
@Component({
    selector: 'lead-create',
    templateUrl: './lead-create.component.html',
    styleUrls: ['./lead-create.component.css']
})
/** lead-create component*/
export class LeadCreateComponent implements OnInit {
  /** lead-create ctor */
  @Input() isShowClosed: boolean = false;
  isContactMandatory: boolean = false;
  @Input() leadId: number = 0;
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  leadFieldsResponse: LeadFieldsResponse;
  leadFields: LeadFields;
  updatedLeadFields: LeadFields;
  userList: keyValue;
  encryptedUser: string;
  showSpinner: boolean;
  contactName: string = '';
  contactSearchList: Search[] = [];
  leadForm = new FormGroup({
    userid: new FormControl(0),
    lastModified: new FormControl(new Date()),
    uniqueIdentifier: new FormControl(''),
    createdDt: new FormControl(new Date())
  });
  contactId: number;
  arrAllControls: any[] = [];
  arrGenCtrl: any[] = [];
  arrCustomDateCtrl: any[] = [];
  arrCustomTextCtrl: any[] = [];
  arrAddMultiTextCtrl: any[] = [];
  arrRevenueCtrl: any[] = [];
  arrCustomMoneyCtrl: any[] = [];
  arrCustomClassDropdownCtrl: any[] = [];
  arrCustomClassCheckboxCtrl: any[] = [];
  arrSortedBySection: any[] = [];
  arrSortedBySection1: any[] = [];
  public format = "MM/dd/yyyy HH:mm:ss";
  confirmText: string = '';
  searchTxt: string = '';
  constructor(private _localService: LocalService,
    private datepipe: DatePipe, private srchContactSrvc: SearchContactService, public notifyService: NotificationService, private _router: Router, private _utilityService: UtilityService, private leadSettingService: LeadSettingService) {
    this._localService.isMenu = true;
  }

  //ngOnChanges() {
  //  this.leadForm.reset();
  //  if (!isNullOrUndefined(localStorage.getItem("token"))) {
  //    this.encryptedUser = localStorage.getItem("token");
  //    this.authenticateR(() => {
  //      if (!isNullOrUndefined(this.user)) {
  //        this.leadForm.get('userid').setValue(this.user?.cLPUserID);
  //        this.getLeadConfigurationFields();
  //      }
  //      else
  //        this._router.navigate(['/login']);
  //    })
  //  }
  //  else
  //    this._router.navigate(['/login']);
  //}

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.leadForm.get('userid').setValue(this.user?.cLPUserID);
          this.getLeadConfigurationFields();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.LeadCreate)
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

  getLeadConfigurationFields() {
    this.showSpinner = true;
     this.leadSettingService.getLeadFields(this.encryptedUser, this.leadId, this.user.cLPCompanyID, this.user.cLPUserID)
        .then(async (result: LeadFieldsResponse) => {
          if (result) {
            this.leadFieldsResponse = UtilityService.clone(result);
            this.leadFields = this.leadFieldsResponse.leadFields;
            this.contactName = this.leadId > 0 ? (this.leadFields?.contact?.fieldValue.lastName + " " + "," + " " + this.leadFields?.contact?.fieldValue.firstName + " " + ":" + " " + this.leadFields?.contact?.fieldValue.companyName) : "";
            this.contactId = this.leadId > 0 ? (this.leadFields?.contact?.fieldValue.contactID) : 0;
            this.userList = this.leadFieldsResponse.filterUsers;
            this.renderFields();
            this.showSpinner = false;
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
  }

  getSearchData(txt) {
    let Search: Search = <Search>{};
    Search.searchText = txt;
    Search.searchValue = "";
    this.getContactSearch(Search);
  }

  getContactId(value) {
    this.contactId = parseInt(this.contactSearchList.find(item => item.searchText === value)?.searchValue);
    this.isContactMandatory = false;
  }

  getContactSearch(searchData: Search) {
    this.showSpinner = true;
    this.srchContactSrvc.getContactSearchData(this.encryptedUser, this.user?.cLPUserID, searchData)
      .then(async (result: SearchListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.contactSearchList = response.searchList.filter(i =>i.searchValue.includes("ct"));
          for (var i = 0; i < this.contactSearchList.length; i++) {
            this.contactSearchList[i].searchValue = this.contactSearchList[i].searchValue.split("ct")[1]
          }
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  renderFields() {
    var that = this;
    this.updatedLeadFields = JSON.parse(JSON.stringify(this.leadFields));
    if (!isNullOrUndefined(this.leadFields)) {
      this.setValidation();
      if (this.leadId > 0)
        this.patchLeadFormValue();
    }
    var leadsFields = this.leadFields;
    Object.keys(leadsFields).map(function (key) {
      var value = leadsFields[key];
      if (!isNullOrUndefined(value)) {
        value.fieldName = key;
        that.arrAllControls.push(value);
      }
    });
    this.arrGenCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.General);
    this.arrCustomDateCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomDateFields);
    this.arrCustomTextCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomTextFields);
    this.arrAddMultiTextCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.AdditionalMultilineTextFields);
    this.arrRevenueCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.RevenueRelatedFields);
    this.arrCustomMoneyCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomMoneyFields);
    this.arrCustomClassDropdownCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomClassificationDropDownFields);
    this.arrCustomClassCheckboxCtrl = this.arrAllControls.filter(i => i.sectionLead == eSectionLead.CustomClassificationCheckboxFields);

    this.arrGenCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCustomDateCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCustomTextCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrAddMultiTextCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrRevenueCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCustomMoneyCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCustomClassDropdownCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCustomClassCheckboxCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    if (!isNullOrUndefined(this.leadFieldsResponse.leadFields) && !isNullOrUndefined(this.leadFieldsResponse.leadFields.displaySetting) && !isNullOrUndefined(this.leadFieldsResponse.leadFields.displaySetting.fieldDiplaySettings.length > 0)) {
      let sectionDiplaySettings: sectionDiplaySetting[] = this.leadFieldsResponse.leadFields.displaySetting.sectionDiplaySettings;
      sectionDiplaySettings.sort((a, b) => (a.sectionDisplayOrder > b.sectionDisplayOrder) ? 1 : -1);
      for (var i = 0; i < sectionDiplaySettings.length; i++) {
        switch (eSectionLead[sectionDiplaySettings[i].sectionId]) {
          case eSectionLead[eSectionLead.General]: this.arrSortedBySection.push({ sectionName: 'General', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrGenCtrl }); break;
          case eSectionLead[eSectionLead.CustomDateFields], eSectionLead[eSectionLead.CustomTextFields]:
            {
              this.arrSortedBySection.push({ sectionName: 'Additional Information', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCustomDateCtrl });
              for (let j = 0; j < this.arrCustomTextCtrl.length; j++) {
                this.arrSortedBySection[this.arrSortedBySection.length-1]?.items.push(this.arrCustomTextCtrl[j]);
              }
              break;
            }
          case eSectionLead[eSectionLead.RevenueRelatedFields], eSectionLead[eSectionLead.CustomMoneyFields]:
            this.arrSortedBySection.push({ sectionName: 'Revenue Estimates', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrRevenueCtrl });
            for (let j = 0; j < this.arrCustomMoneyCtrl.length; j++) {
              this.arrSortedBySection[this.arrSortedBySection.length - 1]?.items.push(this.arrCustomMoneyCtrl[j]);
            }
            break;
          case eSectionLead[eSectionLead.CustomClassificationDropDownFields], eSectionLead[eSectionLead.CustomClassificationCheckboxFields]:
            this.arrSortedBySection.push({ sectionName: 'Classification', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCustomClassDropdownCtrl });
            for (let j = 0; j < this.arrCustomClassCheckboxCtrl.length; j++) {
              this.arrSortedBySection[this.arrSortedBySection.length - 1]?.items.push(this.arrCustomClassCheckboxCtrl[j]);
            }
            break;
          case eSectionLead[eSectionLead.AdditionalMultilineTextFields]: this.arrSortedBySection1.push({ sectionName: 'AdditionalMultilineTextFields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrAddMultiTextCtrl }); break;

        }
      }
    }
    this.arrSortedBySection.sort((a, b) => (a.sectionId > b.sectionId) ? 1 : -1);
  }

  setValidation() {
    var leadsFields = this.leadFields;
    for (let key in leadsFields) {
      let value = leadsFields[key];
      if (!isNullOrUndefined(value))
        this.prepareLeadForm(key, value);
    }
  }

  private prepareLeadForm(key, value) {
    this.leadForm.addControl(key, new FormControl((value.fieldType == 5 ? null : value.fieldType == 2 ? 0 : value.fieldType == 1 ? false : ""), (value.isShow == 1 ? { validators: [Validators.required], updateOn: 'blur' } : { updateOn: 'blur' })));
   }

  leadFormSubmit() {
    console.log(this.leadForm.controls)
    this.validateAllFormFields(this.leadForm);
    if (this.leadForm.valid) {
      this.leadForm.markAsPristine();
      this.leadFieldsUpdate(false);
    }
    else if (!this.leadForm.valid)
      this.notifyService.showError("Enter all mandatory fields", "Important fields Empty", 3000);
  }

  async leadFieldsUpdate(isConfirm: boolean) {
    if (this.contactId == 0) {
      this.notifyService.showError("select Contact is mandatory", "Important fields Empty", 3000);
      this.isContactMandatory = true;
    } else {
      this.showSpinner = true;
      this.isContactMandatory = false;
      this.copyLeadFormValuesToDataObject();
      await this.leadSettingService.update_LeadFields(this.encryptedUser, this.leadFields, this.user.cLPCompanyID, this.user.cLPUserID, this.contactId, isConfirm)
        .then(async (result: SimpleResponse) => {
          if (result) {
            console.log(result);
            if (result.messageString == "Changes have been saved.") {
              this.leadForm.reset();
              this.onCloseForm();
              this.leadId > 0 ? this.notifyService.showSuccess('Lead Updated Successfully', 'Saved', 3000) : this.notifyService.showSuccess('Lead Created Successfully', 'Saved', 3000);
              if (this.leadId == 0) {
                this._router.navigate(['/lead']);
              }
            } else {
              this.confirmText = result.messageString;
              $('#leadConfirmModal').modal('show');
            }
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
  }

  confirmOperation(isConfirm: true) {
    this.leadFieldsUpdate(isConfirm);
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.updateValueAndValidity();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  copyLeadFormValuesToDataObject() {
    var leadFormControl = this.leadForm.controls;
    for (let key in leadFormControl) {
      let value = leadFormControl[key].value;
      if (!(key == "userid" || key == "lastModified" || key == "uniqueIdentifier" || key == "createdDt")) {
        if (!isNullOrUndefined(value) && value != "") {
          if (key == "dtStart" || key == "dtEnd" || key == "dtRevenue" || key == "dtCustom1" || key == "dtCustom2" || key == "dtCustom3")
            this.leadFields[key].fieldValue = this.datepipe.transform(value, 'MM/dd/yyyy HH:mm:ss');
          else
            this.leadFields[key].fieldValue = value;
        }
      }
     
    }
    this.leadFields.cLPCompanyID.fieldValue = this.user.cLPCompanyID;
    this.leadFields.leadID.fieldValue = this.leadId;
    this.leadFields.leadNumber.fieldValue = 0;
    this.leadFields.clpuserID.fieldValue = this.leadForm.get('userid').value != 0 ? this.leadForm.get('userid').value : this.user.cLPUserID;
  }

  isShowFields(is) {
    var i;
    for (i = 0; i < this.arrSortedBySection[is].items.length; i++) {
      if ((this.arrSortedBySection[is].items[i].isShow == 2 && this.arrSortedBySection[is].items[i].fieldType == 0) ||
        (this.arrSortedBySection[is].items[i].isShow == 2 && this.arrSortedBySection[is].items[i].fieldType == 1) ||
        (this.arrSortedBySection[is].items[i].isShow == 2 && this.arrSortedBySection[is].items[i].fieldType == 2)) {
        return true;
      }
      else
        return false;
    }
  }

  patchLeadFormValue() {
    var leadFields = this.leadFields;
    for (let key in leadFields) {
      let value = leadFields[key];
      if (!isNullOrUndefined(value))
        this.preparePatchCompanyFormValue(key, value);
    }
    this.leadForm.get('userid').setValue(this.leadFields.clpuserID.fieldValue);
    this.leadForm.get('createdDt').setValue(this.leadFields.dtCreated.fieldValue);
    this.leadForm.get('lastModified').setValue(this.leadFields.dtModified.fieldValue);
    this.leadForm.get('uniqueIdentifier').setValue('SVR9' + this.leadId);
  }

  preparePatchCompanyFormValue(key, value) {
    if (value.fieldType == 5) {
      if (isNullOrEmptyString(value.fieldValue))
        this.leadForm.get(key).setValue(null);
      else
        this.leadForm.get(key).setValue(new Date(value.fieldValue));
    }
    else
      this.leadForm.get(key).setValue(value.fieldValue);
  }

  onCloseForm() {
    this.leadForm.reset();
    this._localService.hideCommonComponentEmit('lead-create');
    this._localService.showCommonComp = '';
  }
}
