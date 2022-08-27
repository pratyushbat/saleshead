import { HttpErrorResponse } from '@angular/common/http';
import { AfterContentChecked, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { isNullOrUndefined, isObject } from 'util';

import { filterAnimation, pageAnimations } from '../../../animations/page.animation';

import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { ContactFields, ContactFieldsResponse, sectionDiplaySetting } from '../../../models/contact.model';
import { eFeatures, eSection, eUserRole } from '../../../models/enum.model';

import { ContactService } from '../../../services/contact.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';

import Sortable from 'sortablejs/modular/sortable.complete.esm.js';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ContactSearchService } from '../../../services/shared/contact-search.service';
import { NotificationService } from '../../../services/notification.service';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { ZipCodeResponse } from '../../../models/zip.model';
import { ZipService } from '../../../services/zip.service';
import { CountryService } from '../../../services/country.service';
import { Country, CountryListResponse } from '../../../models/country.model';
import { isNullOrEmptyString } from '@progress/kendo-angular-grid/dist/es2015/utils';
import { CountryCode } from 'libphonenumber-js/types';
declare var $: any;
@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.css'],
  animations: [pageAnimations, filterAnimation]
})
/** contact-detail component*/
export class ContactDetailComponent implements OnInit, AfterContentChecked {
  //Animation
  @HostBinding('@pageAnimations') public animatePage = true;
  @Input() resetDetailSubject: Subject<boolean> = new Subject<boolean>();
  showAnimation = -1;
  //Animation
  panelOpenState = false;
  private encryptedUser: string = '';
  @Input() contactId: number = 0;
  email2: string
  email3: string;
  email3blastaddress: boolean = false
  email2blastaddress: boolean = false;
  isMoreFields: boolean = false;
  isEditMode: boolean = false;
  showSpinner: boolean = false;
  isContactUpdated: boolean = false;
  confirmText: string = '';
  msg_blastaddress: string;
  user: CLPUser;
  contactFieldsResponse: ContactFieldsResponse;
  contactFields: ContactFields;
  updateContactFields: ContactFields;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  placeHolder: string = '';
  mobile_mask: string = '(000) 000-0000';
  show_countries: boolean = false;
  dialCode: number = 1;

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

  more: boolean = true;
  moreLabel: string = 'more...';
  currentUrl: string = '';

  countryCode: string = 'US';
  countryListResponse: CountryListResponse;
  countryList: Country[];
  countryCodeSent: string;

  public format = "MM/dd/yyyy HH:mm:ss";

  contactForm = new FormGroup({});
  /** contact-detail ctor */
  constructor(private fb: FormBuilder,
    public _contactService: ContactService,
    public _utilityService: UtilityService,
    public _localService: LocalService,
    public _contactSearchService: ContactSearchService,
    public notifyService: NotificationService,
    public _countryService: CountryService,
    private _zipService: ZipService,
    private _route: ActivatedRoute,
    private _router: Router,
    private cdRef: ChangeDetectorRef) {
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

  loadContactDetails() {

    this.removeControls();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          //this._contactSearchService.showSpinner = true;
          var contactId = this.contactId ? this.contactId : 0;
          var userId = this.user ? this.user.cLPUserID : 0;
          var companyId = this.user ? this.user.cLPCompanyID : 0;
          this.getContactFields(contactId, companyId, userId);

        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }


  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this._localService.getMoreOrLess().subscribe(res => {
      if (res) {
        this.more = true;
        this.moreLabel = 'more...';
      }
    });

    this.resetDetailSubject.subscribe(response => {
      if (response) {
        this.more = true;
        this.moreLabel = 'more...';
        this.clearCtrl();
        this._contactSearchService.showSpinner = true;
        this.loadContactDetails();
      }
    });
    this.loadContactDetails();
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ContactCreate)
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

  clearCtrl() {
    this.contactForm.reset();
    this.arrSystemCtrl = [];
    this.arrAllControls = [];
    this.arrSortedBySection = [];

    this.arrGenCtrl = [];
    this.arrCommunicationCtrl = [];
    this.arrAddressCtrl = [];
    this.arrAddiInfoCtrl = [];
    this.arrClassiDropdownCtrl = [];
    this.arrClassiCheckboxCtrl = [];
    this.arrCommentsCtrl = [];
    this.arrImportantDatesCtrl = [];
    this.arrMoreFieldsCtrl = [];
  }

  moreLess() {
    this.more = !this.more;
    if (this.more) {
      this.moreLabel = 'more...';
    }
    else {
      this.moreLabel = 'less...';
    }
  }
  blastItem(e) {
    this.copyContactFormValuesToDataObject();
    if (e == 2) {
      if (this.updateContactFields.email2.fieldValue == "") {
        this.email2blastaddress = true;
        this.msg_blastaddress = "Please enter your Email ID in Email 2 field"
      } else {
        this.email2blastaddress = false;
        this.msg_blastaddress = "";
        return;
      }

    } else if (e == 3) {
      if (this.updateContactFields.email3.fieldValue == "") {
        this.email3blastaddress = true;
        this.msg_blastaddress = "Please enter your Email ID in Email 3 field"
      } else {
        this.email3blastaddress = false;
        this.msg_blastaddress = "";
        return;
      }
    } else {
      this.email2blastaddress = false;
      this.email3blastaddress = false;
      this.msg_blastaddress = "";
      return;
    }
  }

  getContactFields(contactId, companyID, userId) {
    if (contactId == 0) {
      this._contactService.contactFields_Get_Configuration(this.encryptedUser, companyID, userId)
        .then(async (result: ContactFieldsResponse) => {
          if (result) {
            this.contactFieldsResponse = UtilityService.clone(result);
            this.contactFields = this.contactFieldsResponse.contactFields;
            this._contactSearchService.showSpinner = false;
            this.renderFields();
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._contactSearchService.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    } else {
      this._localService.showCommonComp = 'contact-detail';
      if ((!isNullOrUndefined(this._localService.contactFields)) && (this._localService.contactFields.contactID.fieldValue == this.contactId))
        this.loadInitData();
      else {
        this._localService.getContactFields(this.encryptedUser, contactId, companyID, userId, true)
          .subscribe((value) =>
            this.loadInitData()
          );
      }

    }
  }

  loadInitData() {
    this.contactFieldsResponse = this._localService.contactFieldsResponse;
    this.contactFields = this._localService.contactFields;
    this._contactSearchService.showSpinner = false;
    this.renderFields();
  }

  renderFields() {
    var that = this;
    if (!isNullOrUndefined(this.contactFields.contactMoreFields)) {
      var moreFields = this.contactFields.contactMoreFields;
      Object.keys(moreFields).map(function (key) {
        var value = moreFields[key];
        if (isObject(value)) {
          value.fieldName = key;
          that.contactFields[key] = value;
        }
        else
          delete moreFields[key];
      });
    }
    this.updateContactFields = JSON.parse(JSON.stringify(this.contactFields));
    if (!isNullOrUndefined(this.contactFields)) {
      this.setValidation();
      this._contactSearchService.showSpinner = false;
      if (this._localService.showCommonComp == 'contact-detail') {
        this.patchContactFormValue();
      }
    }

    var contactsFields = this.contactFields;
    Object.keys(contactsFields).map(function (key) {
      var value = contactsFields[key];

      if (!isNullOrUndefined(value)) {
        value.fieldName = key;
        that.arrAllControls.push(value);
      }
    });
    this.showSpinner = false;
    this.arrGenCtrl = this.arrAllControls.filter(i => i.section == eSection.General && i.fieldName != "firstName" && i.fieldName != "lastName");
    this.arrCommunicationCtrl = this.arrAllControls.filter(i => i.section == eSection.Communication && i.fieldName != "email" && i.fieldName != "mobile");
    this.arrAddressCtrl = this.arrAllControls.filter(i => i.section == eSection.Address);

    this.arrAddiInfoCtrl = this.arrAllControls.filter(i => i.section == eSection.AddtionalInformation);

    this.arrClassiDropdownCtrl = this.arrAllControls.filter(i => i.section == eSection.ClassificationDropDown);
    this.arrClassiCheckboxCtrl = this.arrAllControls.filter(i => i.section == eSection.ClassificationCheckBox);
    this.arrCommentsCtrl = this.arrAllControls.filter(i => i.section == eSection.Comments);
    this.arrImportantDatesCtrl = this.arrAllControls.filter(i => i.section == eSection.ImportantDates);
    this.arrMoreFieldsCtrl = this.arrAllControls.filter(i => i.section == eSection.MoreFields);
    this.arrSystemCtrl = this.arrAllControls.filter(i => i.section == eSection.System);

    this.arrGenCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCommunicationCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrAddressCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrAddiInfoCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrClassiDropdownCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrClassiCheckboxCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrCommentsCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrImportantDatesCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrMoreFieldsCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    this.arrSystemCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);

    if (!isNullOrUndefined(this.contactFieldsResponse.contactFields) && !isNullOrUndefined(this.contactFieldsResponse.contactFields.displaySetting) && !isNullOrUndefined(this.contactFieldsResponse.contactFields.displaySetting.fieldDiplaySettings.length > 0)) {
      let sectionDiplaySettings: sectionDiplaySetting[] = this.contactFieldsResponse.contactFields.displaySetting.sectionDiplaySettings;
      sectionDiplaySettings.sort((a, b) => (a.sectionDisplayOrder > b.sectionDisplayOrder) ? 1 : -1);
      for (var i = 0; i < sectionDiplaySettings.length; i++) {
        switch (eSection[sectionDiplaySettings[i].sectionId]) {
          case eSection[eSection.Communication]: this.arrSortedBySection.push({ sectionName: 'Communication', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCommunicationCtrl }); break;
          case eSection[eSection.Address]: this.arrSortedBySection.push({ sectionName: 'Address', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrAddressCtrl }); break;
          case eSection[eSection.AddtionalInformation]: this.arrSortedBySection.push({ sectionName: 'AddtionalInformation', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrAddiInfoCtrl }); break;
          case eSection[eSection.ClassificationDropDown]: this.arrSortedBySection.push({ sectionName: 'ClassificationDropDown', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrClassiDropdownCtrl }); break;
          case eSection[eSection.ClassificationCheckBox]: this.arrSortedBySection.push({ sectionName: 'ClassificationCheckBox', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrClassiCheckboxCtrl }); break;
          case eSection[eSection.Comments]: this.arrSortedBySection.push({ sectionName: 'Comments', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCommentsCtrl }); break;
          case eSection[eSection.ImportantDates]: this.arrSortedBySection.push({ sectionName: 'ImportantDates', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrImportantDatesCtrl }); break;
          case eSection[eSection.MoreFields]: this.arrSortedBySection.push({ sectionName: 'MoreFields', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrMoreFieldsCtrl }); break;
          case eSection[eSection.General]: this.arrSortedBySection.push({ sectionName: 'General', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrGenCtrl }); break;
        }
      }
    }
    if (this.arrSystemCtrl.length > 0)
      this.arrSortedBySection.push({ sectionName: 'System', sectionId: 0, items: this.arrSystemCtrl });

    this.initialCountryCode();
  }

  private async handleChangeCountry(code2: string, codeType: boolean) {
    this.countryCode = code2;
    window.localStorage.setItem('sc_country', code2.toLowerCase());
    if (code2) {
      let code2Lower: string = code2.toLowerCase();
      let found: boolean = false;
      if (this.countryList) {
        this.countryList.forEach((c) => {
          if (codeType) {
            if (c.code2Lower == code2Lower) {
              found = true;
              this.placeHolder = c.placeholder ? this._countryService.parseSimplePhone(c.placeholder, c.code2 as CountryCode) : '';
              this.mobile_mask = this._countryService.replaceZero(this.placeHolder);
              this.dialCode = c.dialCode;
            }
          }
          else {
            if (c.code.toLowerCase() == code2Lower) {
              found = true;
              this.placeHolder = c.placeholder ? this._countryService.parseSimplePhone(c.placeholder, c.code2 as CountryCode) : '';
              this.mobile_mask = this._countryService.replaceZero(this.placeHolder);
              this.dialCode = c.dialCode;
            }
          }
        });

        if (!found) {
          this.placeHolder = '001234567890';
          this.dialCode = 1;
          this.mobile_mask = '';
        }
      }
    }
  }

  async initialCountryCode() {
    this._countryService.loadIpApi()
      .subscribe(
        (res: any) => {
          if (res) {
            this.countryCode = res.countrycode;
            this.loadCountries();
          }
          else
            console.log('user-profile-component.initialCountryCode', '[ENV] user-profile-component.initialCountryCode null response socid: ');
        },
        (error) => {
          this._utilityService.handleErrorResponse(error);
        }
      );
  }

  loadCountries() {
    this._countryService.getCountryList()
      .then((response: CountryListResponse) => {
        this.countryListResponse = UtilityService.clone(response);
        this.countryList = UtilityService.clone(this.countryListResponse.countries);
        this.countryList.map(val => {
          val.code2Lower = val.code2.toLowerCase();
        });
        var cObj = this.countryList.find(i => i.code2 == this.countryCode);
        if (!isNullOrUndefined(this.contactFields) && (this.contactFields.country.fieldValue == null || !this.contactFields.country.fieldValue))
          this.contactForm.controls.country.setValue(cObj.code);

        this.countryList.forEach((c) => {
          if (c.code2 == this.countryCode) {
            this.countryCodeSent = c.code;
            this.handleChangeCountry(this.countryCode, true);
          }
        });
      },
        (error) => {
          this._utilityService.handleErrorResponse(error);
        }
      );
  }

  changeCountry($event) {
    this.contactForm.controls.mobile.reset();
    this.handleChangeCountry($event.target.options[$event.target.selectedIndex].getAttribute("value"), false);
  }

  setValidation() {
    //Validation on fields according to isShow(!= 2);
    var conatctsFields = this.contactFields;
    for (let key in conatctsFields) {
      let value = conatctsFields[key];

      //Set the validation and render the control
      if (!isNullOrUndefined(value))
        this.prepareContactForm(key, value);
    }
    if (this.contactForm) {
      this.contactForm.patchValue({
        cLPUserID: this.user ? this.user.cLPUserID : 0
      })
    }
  }

  private prepareContactForm(key, value) {
    this.contactForm.addControl(key, new FormControl(key == 'customDate1' || key == 'customDate2' || key == 'customDate3' ? null : key == 'eBlastAddress' ? this.contactFields?.eBlastAddress?.items[0]?.value : value.fieldType == 1 ? false : '', value.isShow == 1 ? { validators: [Validators.required], updateOn: 'blur' } : { updateOn: 'blur' }))
  }

  removeControls() {
    if (!isNullOrUndefined(this.contactFields)) {
      for (let key in this.contactFields)
        this.contactForm.removeControl(key);
    }

  }

  get contactFrm() {
    return this.contactForm.controls;
  }

  onCheckboxChange(e, field?) {
    this.contactForm.get(field)?.setValue(e?.target.checked);
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

  patchContactFormValue() {
    var conatctsFields = this.contactFields;
    for (let key in conatctsFields) {
      let value = conatctsFields[key];
      //Set the validation and render the control
      if (!isNullOrUndefined(value))
        this.preparePatchContactFormValue(key, value);
    }
  }

  preparePatchContactFormValue(key, value) {
    if (key == 'customDate1' || key == 'customDate2' || key == 'customDate3') {
      if (isNullOrEmptyString(value.fieldValue))
        this.contactForm.get(key).setValue(null);
      else
        this.contactForm.get(key).setValue(new Date(value.fieldValue));
    }
    else
      this.contactForm.get(key).setValue(value.fieldValue);
  }

  ////changeContactUser(e) {
  ////  this.transferConfirm = true;
  ////  if (this.user.cLPUserID != this.contactForm.get('cLPUserID').value)
  ////    this.transferConfirm = true;
  ////}

  contactFormSubmit() {
    this.validateAllFormFields(this.contactForm);
    if (this.contactForm.valid) {
      this.contactForm.markAsPristine();
      this.contactFieldsUpdate();
    }
    else if (!this.contactForm.valid)
      this.notifyService.showError("Enter all mandatory fields", "Important fields Empty", 3000);
  }

  copyContactFormValuesToDataObject() {
    this.isMoreFields = false;
    var contactFormControl = this.contactForm.controls;
    for (let key in contactFormControl) {
      let value = contactFormControl[key].value;
      this.updateContactFields[key].fieldValue = value;
    }

    if ((this._localService.showCommonComp == 'contact-new') || (this.currentUrl && this.currentUrl == 'contact-create')) {
      this.updateContactFields.cLPUserID.fieldValue = this.contactForm.get('cLPUserID').value === '' ? 0 : this.updateContactFields.cLPUserID.fieldValue;
      this.updateContactFields.salutation.fieldValue = this.contactForm.get('salutation').value === '' ? '' : this.updateContactFields.salutation.fieldValue;
      this.updateContactFields.eVID.fieldValue = this.contactForm.get('eVID').value === '' ? 0 : this.updateContactFields.eVID.fieldValue;
      this.updateContactFields.cLPCompanyID.fieldValue = this.contactForm.get('cLPCompanyID').value === '' ? 0 : this.updateContactFields.cLPCompanyID.fieldValue;
      this.updateContactFields.check1.fieldValue = this.contactForm.get('check1').value === '' ? false : this.updateContactFields.check1.fieldValue;
      this.updateContactFields.check2.fieldValue = this.contactForm.get('check2').value === '' ? false : this.updateContactFields.check2.fieldValue;
      this.updateContactFields.check3.fieldValue = this.contactForm.get('check3').value === '' ? false : this.updateContactFields.check3.fieldValue;
      this.updateContactFields.check4.fieldValue = this.contactForm.get('check4').value === '' ? false : this.updateContactFields.check4.fieldValue;
      this.updateContactFields.check5.fieldValue = this.contactForm.get('check5').value === '' ? false : this.updateContactFields.check5.fieldValue;
      this.updateContactFields.check6.fieldValue = this.contactForm.get('check6').value === '' ? false : this.updateContactFields.check6.fieldValue;
      this.updateContactFields.class1Code.fieldValue = this.contactForm.get('class1Code').value === '' ? 0 : this.updateContactFields.class1Code.fieldValue;
      this.updateContactFields.class2Code.fieldValue = this.contactForm.get('class2Code').value === '' ? 0 : this.updateContactFields.class2Code.fieldValue;
      this.updateContactFields.class3Code.fieldValue = this.contactForm.get('class3Code').value === '' ? 0 : this.updateContactFields.class3Code.fieldValue;
      this.updateContactFields.class4Code.fieldValue = this.contactForm.get('class4Code').value === '' ? 0 : this.updateContactFields.class4Code.fieldValue;
      this.updateContactFields.class5Code.fieldValue = this.contactForm.get('class5Code').value === '' ? 0 : this.updateContactFields.class5Code.fieldValue;
      this.updateContactFields.class6Code.fieldValue = this.contactForm.get('class6Code').value === '' ? 0 : this.updateContactFields.class6Code.fieldValue;
      this.updateContactFields.class7Code.fieldValue = this.contactForm.get('class7Code').value === '' ? 0 : this.updateContactFields.class7Code.fieldValue;
      this.updateContactFields.class8Code.fieldValue = this.contactForm.get('class8Code').value === '' ? 0 : this.updateContactFields.class8Code.fieldValue;
      this.updateContactFields.companyID.fieldValue = this.contactForm.get('companyID').value === '' ? 0 : this.updateContactFields.companyID.fieldValue;
      this.updateContactFields.contactID.fieldValue = this.contactForm.get('contactID').value === '' ? 0 : this.updateContactFields.contactID.fieldValue;
      this.updateContactFields.dtCreated.fieldValue = this.contactForm.get('dtCreated').value === '' ? new Date() : this.updateContactFields.dtCreated.fieldValue;
      this.updateContactFields.dtModified.fieldValue = this.contactForm.get('dtModified').value === '' ? new Date() : this.updateContactFields.dtModified.fieldValue;
      this.updateContactFields.eBlastAddress.fieldValue = this.contactForm.get('eBlastAddress').value === '' ? 0 : this.updateContactFields.eBlastAddress.fieldValue;
      this.updateContactFields.hasBeenEdited.fieldValue = this.contactForm.get('hasBeenEdited').value === '' ? false : this.updateContactFields.hasBeenEdited.fieldValue;
      this.updateContactFields.isOptOutEmail.fieldValue = this.contactForm.get('isOptOutEmail').value === '' ? false : this.updateContactFields.isOptOutEmail.fieldValue;
      this.updateContactFields.isOptOutTxtMsg.fieldValue = this.contactForm.get('isOptOutTxtMsg').value === '' ? 0 : this.updateContactFields.isOptOutTxtMsg.fieldValue;
      this.updateContactFields.outlookSync.fieldValue = this.contactForm.get('outlookSync').value === '' ? false : this.updateContactFields.outlookSync.fieldValue;
      this.updateContactFields.referralID.fieldValue = this.contactForm.get('referralID').value === '' ? 0 : this.updateContactFields.referralID.fieldValue;
      this.updateContactFields.shareable.fieldValue = this.contactForm.get('shareable').value === '' ? false : this.updateContactFields.shareable.fieldValue;

    }
    if (!isNullOrUndefined(this.contactFields.contactMoreFields)) {
      this.isMoreFields = true;

      this.updateContactFields.contactMoreFields.customDate1.fieldValue = this.contactForm.get('customDate1').value === '' ? '' : this.contactForm.get('customDate1').value;
      this.updateContactFields.contactMoreFields.customDate2.fieldValue = this.contactForm.get('customDate2').value === '' ? '' : this.contactForm.get('customDate2').value;
      this.updateContactFields.contactMoreFields.customDate3.fieldValue = this.contactForm.get('customDate3').value === '' ? '' : this.contactForm.get('customDate3').value;

      this.updateContactFields.contactMoreFields.customText1.fieldValue = this.contactForm.get('customText1').value === '' ? '' : this.contactForm.get('customText1').value;
      this.updateContactFields.contactMoreFields.customText2.fieldValue = this.contactForm.get('customText2').value === '' ? '' : this.contactForm.get('customText2').value;
      this.updateContactFields.contactMoreFields.customText3.fieldValue = this.contactForm.get('customText3').value === '' ? '' : this.contactForm.get('customText3').value;
      this.updateContactFields.cLPCompanyID.fieldValue = this.user && this.user.cLPCompanyID ? this.user.cLPCompanyID : this.contactForm.get('cLPCompanyID').value === '' ? 0 : this.updateContactFields.cLPCompanyID.fieldValue;

    }
  }

  contactFieldsSubmit(transferConfirm) {
    this._contactService.updateContactFields(this.encryptedUser, this.updateContactFields, this.user.cLPCompanyID, this.contactFields.contactID.fieldValue, this.user.cLPUserID, transferConfirm, this.isMoreFields)
      .then(async (result: ContactFieldsResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (response && !response.messageBool) {
            this.isContactUpdated = false;
            this.notifyService.showError(response.messageString ? response.messageString : "some error occurred", "", 3000);

          }
          else {
            if (isNullOrUndefined(response.errorMsg)) {
              if (this.currentUrl && this.currentUrl == 'contact-create') {
                this.notifyService.showSuccess("Contact created successfully", "", 3000);
                setTimeout(() => {
                  this._router.navigate(['/contacts']);
                  this.isContactUpdated = false;
                }, 1000);
              }
              else {
                var msg = this._localService.showCommonComp == 'contact-new' ? "created" : "updated";
                this.notifyService.showSuccess("Contact " + msg + " successfully", "", 3000);
                if (this._localService.showCommonComp == 'contact-new')
                  this.contactForm.reset();
                this._contactSearchService.getContacts();
                this.sendemaildatato_sendemail();
                this.isContactUpdated = false;
              }
            } else {
              this.confirmText = result.errorMsg;
              $('#contactConfirmModal').modal('show');
            }

          }

        }
        else
          this.isContactUpdated = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.isContactUpdated = false;
        this._utilityService.handleErrorResponse(err);
      });
  }
  contactFieldsUpdate() {
    this.isContactUpdated = true;
    this.copyContactFormValuesToDataObject();
    this.contactFieldsSubmit(false);
  }

  confirmOperation(isConfirm: true) {
    this.contactFieldsSubmit(true);
  }

  onemail2Change(value) {
    this.email2 = value;
    if (this.email2 != '') {
      this.msg_blastaddress = ""
    } else {
      this.msg_blastaddress = "Please enter your Email ID in Email 2 field"
    }

  }

  onemail3Change(value) {
    this.email3 = value;
    if (this.email3 != '') {
      this.msg_blastaddress = ""
    } else {
      this.msg_blastaddress = "Please enter your Email ID in Email 3 field"
    }

  }

  sendemaildatato_sendemail() {
    if (this.contactForm.controls.eBlastAddress.value == 0 || this.contactForm.controls.eBlastAddress.value == 1) {
      this._localService.sendEmlIdToEmail(this.contactForm.controls.email.value);
    } else if (this.contactForm.controls.eBlastAddress.value == 2) {
      this._localService.sendEmlIdToEmail(this.contactForm.controls.email2.value);
    } else {
      this._localService.sendEmlIdToEmail(this.contactForm.controls.email3.value);
    }
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

  getCityState(e) {
    var zipCode = this.contactForm.controls.zip.value;
    if (zipCode && zipCode.length >= 3) {
      this._zipService.zip_Get(this.encryptedUser, zipCode)
        .then(async (result: ZipCodeResponse) => {
          if (result) {
            var result = UtilityService.clone(result);
            var zipCode = result.zipCode;
            zipCode && zipCode.city ? this.contactForm.get('city')?.setValue(zipCode.city) : null;
            zipCode && zipCode.state ? this.contactForm.get('state')?.setValue(zipCode.state) : null;
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

}




