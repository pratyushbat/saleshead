import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { isNullOrEmptyString } from '@progress/kendo-angular-grid/dist/es2015/utils';
import { isNullOrUndefined, isObject } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { CompanyFields, CompanyFieldsResponse } from '../../../models/company.model';
import { ContactFilters, sectionDiplaySetting } from '../../../models/contact.model';
import { eFeatures, eSectionCompany } from '../../../models/enum.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { ZipCodeResponse } from '../../../models/zip.model';
import { AccountSetupService } from '../../../services/accountSetup.service';
import { NotificationService } from '../../../services/notification.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { ZipService } from '../../../services/zip.service';
declare var $: any;

@Component({
  selector: 'company-create',
  templateUrl: './company-create.component.html',
  styleUrls: ['./company-create.component.css']
})
/** company-create component*/
export class CompanyCreateComponent implements OnInit, OnChanges {

  showSpinner: boolean = false;
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  private encryptedUser: string = '';

  companyFieldsResponse: CompanyFieldsResponse;
  companyFields: CompanyFields;
  updateCompanyFields: CompanyFields;
  companyForm = new FormGroup({});

  arrAllControls: any[] = [];
  arrGenCtrl: any[] = [];
  arrCommunicationCtrl: any[] = [];
  arrAddressCtrl: any[] = [];
  arrAddiInfoCtrl: any[] = [];
  arrClassiDropdownCtrl: any[] = [];
  arrClassiCheckboxCtrl: any[] = [];
  arrCommentsCtrl: any[] = [];
  arrImportantDatesCtrl: any[] = [];
  arrMoreFieldsCtrl: any[] = [];
  arrSystemCtrl: any[] = [];

  arrSortedBySection: any[] = [];
  isEditMode: boolean = false;
  /** company-create ctor */
  @Output() viewCompany = new EventEmitter<{ title: string, saved: boolean }>();
  @Input() companyId: number = 0;
  isMoreFields: boolean;
  companyUserList: ContactFilters[];

  placeHolder: string = '';
  mobile_mask: string = '(000) 000-0000';
  public format = "MM/dd/yyyy HH:mm:ss";
  currentUrl: string = '';

  constructor(private _accountSetupService: AccountSetupService,
    public _utilityService: UtilityService,
    public _localService: LocalService,
    public notifyService: NotificationService,
    private _zipService: ZipService,
    private _router: Router) {
    this._localService.isMenu = true;
    _router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        var currentUrl = event.url;
        if (currentUrl != null) {
          var splitUrl = currentUrl.split('/', 5);
          this.currentUrl = splitUrl.length > 0 ? splitUrl[1] : '';
        }
      };
    });
  } 

  ngOnInit() {
    this.loadCompanyDetails();
  }
  ngOnChanges() {
    this.companyId > 0 ? this.isEditMode = true : this.isEditMode = false;
    if (!isNullOrUndefined(this.user))
      this.initialCompanyData();
  }

  initialCompanyData() {
    var userId = this.user ? this.user.cLPUserID : 0;
    var companyId = this.companyId ? this.companyId : 0;
    var clpCompanyId = this.user ? this.user.cLPCompanyID : 0;
    this.getCompanyFields(companyId, userId, clpCompanyId);
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.CompanyList)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
            if (this.user?.userRole <= 3) {
              if (this.roleFeaturePermissions?.view == false)
                this._router.navigate(['/unauthorized', true]);
            }
          }
          else
            this._router.navigate(['/unauthorized']);
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

  loadCompanyDetails() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) 
              this.initialCompanyData();        
        else
          this._router.navigate(['/unauthorized']);
      })
    }
    else
      this._router.navigate(['/unauthorized']);
  }
  async getCompanyFields(companyId, userId, clpCompanyId) {
    var companyFormControlsArray = Object.keys(this.companyForm.controls);
    if (!isNullOrUndefined(companyFormControlsArray) && companyFormControlsArray.length > 0) {
      companyFormControlsArray.forEach(companyControl => {
        this.companyForm.removeControl(companyControl);
      });
      this.companyForm.reset();
      this.companyForm.markAsPristine();
    }

    if (companyId == 0) {
      this.showSpinner = true;
      await this._accountSetupService.companyFields_GetConfiguration(this.encryptedUser, clpCompanyId, userId)
        .then(async (result: CompanyFieldsResponse) => {
          if (result) {
            this.showSpinner = false;
            this.companyFieldsResponse = UtilityService.clone(result);
            this.companyFields = this.companyFieldsResponse.companyFields;
            this.renderCompanyFields();
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
    else {
      this.showSpinner = true;
      await this._accountSetupService.companyFields_Get(this.encryptedUser, companyId, clpCompanyId, userId)
        .then(async (result: CompanyFieldsResponse) => {
          if (result) {
            this.showSpinner = false;
            this.companyFieldsResponse = UtilityService.clone(result);
            this.companyFields = this.companyFieldsResponse.companyFields;
            this.renderCompanyFields();
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

  renderCompanyFields() {
    var that = this;
    if (!isNullOrUndefined(this.companyFields)) {
      var moreFields = this.companyFields;
      Object.keys(moreFields).map(function (key) {
        var value = moreFields[key];
        if (isObject(value)) {
          value.fieldName = key;
          that.companyFields[key] = value;
        }
        else
          delete moreFields[key];
      });
    }
    this.updateCompanyFields = JSON.parse(JSON.stringify(this.companyFields));
    if (!isNullOrUndefined(this.companyFields)) {
      this.companyUserList = this.companyFields.cLPUserID.items;
      this.setValidation();
      if (this.companyId > 0)
        this.patchCompanyFormValue();
    }

    var companyFields = this.companyFields;
    that.arrAllControls = [];
    Object.keys(companyFields).map(function (key) {
      var value = companyFields[key];
      if (!isNullOrUndefined(value)) {
        value.fieldName = key;
        that.arrAllControls.push(value);
      }
    });
    this.showSpinner = false;
    this.arrGenCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.General && i.fieldName != "companyName");
    this.arrCommunicationCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.Communication);
    this.arrAddiInfoCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.AddtionalInformation);
    this.arrClassiDropdownCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.ClassificationDropDown);
    this.arrClassiCheckboxCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.ClassificationCheckBox);
    this.arrCommentsCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.Comments);

    this.arrGenCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCommunicationCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrAddiInfoCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrClassiDropdownCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrClassiCheckboxCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCommentsCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);

    if (!isNullOrUndefined(this.companyFieldsResponse.companyFields) && !isNullOrUndefined(this.companyFieldsResponse.companyFields.displaySetting) && !isNullOrUndefined(this.companyFieldsResponse.companyFields.displaySetting.fieldDiplaySettings.length > 0)) {
      let sectionDiplaySettings: sectionDiplaySetting[] = this.companyFieldsResponse.companyFields.displaySetting.sectionDiplaySettings;
      sectionDiplaySettings.sort((a, b) => (a.sectionDisplayOrder > b.sectionDisplayOrder) ? 1 : -1);
      this.arrSortedBySection = [];
      for (var i = 0; i < sectionDiplaySettings.length; i++) {
        switch (eSectionCompany[sectionDiplaySettings[i].sectionId]) {
          case eSectionCompany[eSectionCompany.Communication]: this.arrSortedBySection.push({ sectionName: 'Communication', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCommunicationCtrl }); break;
          case eSectionCompany[eSectionCompany.AddtionalInformation]: this.arrSortedBySection.push({ sectionName: 'Addtional Information', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrAddiInfoCtrl }); break;
          case eSectionCompany[eSectionCompany.ClassificationDropDown]: this.arrSortedBySection.push({ sectionName: 'Classification DropDown', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrClassiDropdownCtrl }); break;
          case eSectionCompany[eSectionCompany.ClassificationCheckBox]: this.arrSortedBySection.push({ sectionName: 'Classification CheckBox', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrClassiCheckboxCtrl }); break;
          case eSectionCompany[eSectionCompany.Comments]: this.arrSortedBySection.push({ sectionName: 'Comments', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCommentsCtrl }); break;
          case eSectionCompany[eSectionCompany.General]: this.arrSortedBySection.push({ sectionName: 'Corporate Address', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrGenCtrl }); break;
        }
      }
    }
  }

  setValidation() {
    //Validation on fields according to isShow(!= 2);
    var companyFields = this.companyFields;
    for (let key in companyFields) {
      let value = companyFields[key];

      //Set the validation and render the control
      if (!isNullOrUndefined(value))
        this.prepareCompanyForm(key, value);
    }
    if (this.companyForm) {
      this.companyForm.patchValue({
        cLPUserID: this.user ? this.user.cLPUserID : 0
      })
    }
  }
  private prepareCompanyForm(key, value) {
    this.companyForm.addControl(key, new FormControl(key == 'customDate1' || key == 'customDate2' || key == 'customDate3' ? new Date() : value.fieldType == 1 ? false : '', value.isShow == 1 ? { validators: [Validators.required], updateOn: 'blur' } : { updateOn: 'blur' }))
  }

  patchCompanyFormValue() {
    var companyFields = this.companyFields;
    for (let key in companyFields) {
      let value = companyFields[key];
      //Set the validation and render the control
      if (!isNullOrUndefined(value))
        this.preparePatchCompanyFormValue(key, value);
    }
  }
  preparePatchCompanyFormValue(key, value) {
    if (key == 'customDate1' || key == 'customDate2' || key == 'customDate3') {
      if (isNullOrEmptyString(value.fieldValue))
        this.companyForm.get(key).setValue(null);
      else
        this.companyForm.get(key).setValue(new Date(value.fieldValue));
    }
    else
      this.companyForm.get(key).setValue(value.fieldValue);
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

  companyFormSubmit() {
    this.validateAllFormFields(this.companyForm);
    if (this.companyForm.valid) {
      this.companyForm.markAsPristine();
      this.companyFieldsUpdate();
    }
    else if (!this.companyForm.valid)
      this.notifyService.showError("Enter all mandatory fields", "Important fields Empty", 3000);
  }

  async companyFieldsUpdate() {
    this.copyCompanyFormValuesToDataObject();
    await this._accountSetupService.companyFields_Update(this.encryptedUser, this.updateCompanyFields, this.user.cLPCompanyID ? this.user.cLPCompanyID : 0, this.user.cLPUserID ? this.user.cLPUserID : 0, false,)
      .then(async (result: SimpleResponse) => {
        if (result) {
          if (this.currentUrl && this.currentUrl == 'company-create') {
            this._router.navigate(['/company']);
            this.notifyService.showSuccess("Company created successfully", "", 3000);
          }
          else {
            if (this.updateCompanyFields.companyID.fieldValue == 0) {             
              this.companyForm.reset();
              this.initialCompanyData();
              this.isEditMode = false
              this.viewCompany.emit({ title: 'view', saved: true });
            }
            else {
              this.companyFields = this.updateCompanyFields;
              this.renderCompanyFields();
              this.isEditMode = true;
              this.notifyService.showSuccess('Company Saved Successfully', 'Saved', 3000);
            }          
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

  copyCompanyFormValuesToDataObject() {
    this.isMoreFields = false;
    var companyFormControl = this.companyForm.controls;
    for (let key in companyFormControl) {
      let value = companyFormControl[key].value;
      this.updateCompanyFields[key].fieldValue = value;
    }
    this.updateCompanyFields.coClass1Code.fieldValue = -1;
    this.updateCompanyFields.coClass2Code.fieldValue = -1;
    this.updateCompanyFields.coClass3Code.fieldValue = -1;
    this.updateCompanyFields.coClass4Code.fieldValue = -1;
    this.updateCompanyFields.coClass5Code.fieldValue = -1;
    this.updateCompanyFields.coClass6Code.fieldValue = -1;
    this.updateCompanyFields.coClass7Code.fieldValue = -1;
    this.updateCompanyFields.coClass8Code.fieldValue = -1;
    this.updateCompanyFields.companyID.fieldValue = this.companyId;
  }

  get companyFrm() {
    return this.companyForm.controls;
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

  cancelCompanyCreate() {
    this.isEditMode = true;
  }

  showCompanyList() {
    this.viewCompany.emit({ title: 'view', saved: true });
  }

  gotoCompany() {
    this._router.navigateByUrl('/company');
  }


  getCityState(e) {

    var zipCode = this.companyForm.controls.zip.value;
    if (zipCode && zipCode.length >= 3) {
      this._zipService.zip_Get(this.encryptedUser, zipCode)
        .then(async (result: ZipCodeResponse) => {
          if (result) {
            var result = UtilityService.clone(result);
            var zipCode = result.zipCode;
            zipCode && zipCode.city ? this.companyForm.get('city')?.setValue(zipCode.city) : null;
            zipCode && zipCode.state ? this.companyForm.get('state')?.setValue(zipCode.state) : null;
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  changeCountry($event) {}

  onCheckboxChange(e, field?) {
    this.companyForm.get(field)?.setValue(e?.target.checked);
  }

  saveCompanyById() {
    $("#primarySaveCompany").click();
  }

  confirmCompanyDelete() {
    this.updateCompanyFields.companyID.fieldValue
  }
  deleteCompany() {
    console.log('delete')
  }
}
