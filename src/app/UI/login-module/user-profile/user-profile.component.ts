import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { CLPUser, CLPUserProfile, UserResponse, UserSetupResponse } from '../../../models/clpuser.model';
import { EmailDropDownsResponse, EmailTemplate, ITeamOfficeCode } from '../../../models/emailTemplate.model';
import { eFeatures } from '../../../models/enum.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { Country, CountryListResponse } from '../../../models/country.model';
import { ZipCodeResponse } from '../../../models/zip.model';
import { CountryService } from '../../../services/country.service';
import { NotificationService } from '../../../services/notification.service';
import { OutBoundEmailService } from '../../../services/outBoundEmail.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { UserService } from '../../../services/user.service';
import { ZipService } from '../../../services/zip.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  userProfileForm = new FormGroup({});
  timezoneFilterList: Array<any> = [];
  dateFormatList: Array<any> = [];
  private encryptedUser: string = '';
  showSpinner: boolean;
  userId: number = 0;

  user: CLPUser;
  emailDropDownsResponse: EmailDropDownsResponse;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  public userProfile: CLPUserProfile;
  emailTemplates: EmailTemplate[] = [];

  countryCode: string = 'US';
  countryListResponse: CountryListResponse;
  countryList: Country[];
  teamCodeList: ITeamOfficeCode[];
  officeCodeList: ITeamOfficeCode[];
  defaultItem: { key: number; value: string } = { key: -1, value: "None Selected" };
  defaultItemEmail = { emailTemplateID: 0, cLPCompanyID: 0, cLPUserid: 0, templateName: "-None Selected-", shareable: false, dtModified: '', dtCreated: '', isUseBee: '', userLastFirst: '', fBCETID: 0, class5CodeID: 0, isActive: false };
  userThemeOriginal: number;

  constructor(private fb: FormBuilder,
    public _localService: LocalService,
    private _router: Router,
    private _route: ActivatedRoute,
    public _utilityService: UtilityService,
    private _outBoundEmailService: OutBoundEmailService,
    private _notifyService: NotificationService,
    private _zipService: ZipService,
    public _countryService: CountryService,
    private userSvc: UserService
  ) {
    this.timezoneFilterList = this._localService.timezoneFilterList;
    this._localService.isMenu = true;
    //Get route Parameters
    this._route.paramMap.subscribe(async params => {
      if (params.has('userId')) {
        this.userId = +params.get('userId');
      }
    });
    //Get route Parameters
  }

  ngOnInit(): void {
    this.userProfileForm = this.prepareUserProfileForm();
    this.userProfileForm.reset();

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {        
          this.getUserProfile();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.None)
      .then(async (result: UserResponse) => {
        if (result) {
        this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
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

  async getUserProfile() {
    this.showSpinner = true;
    var userId = this.userId != 0 ? this.userId : this.user.cLPUserID;
    await this.userSvc.getUserByUserId(this.encryptedUser, userId)
      .then(async (result: CLPUserProfile) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.userProfile = response;
          this.userThemeOriginal = this.userProfile.theme ? +this.userProfile.theme : 1;
          this._localService.changeTheme(this.userThemeOriginal);
          await this.getTeamAndOfficeCodes();
          this.getEmailDropDowns();
          this.initialCountryCode();
          if (this.userProfile.theme == 0)
            this.userProfileForm.get('selectedTheme').setValue(this.userProfile.theme ? this.userProfile.theme + 1 : 1);
          else
            this.userProfileForm.get('selectedTheme').setValue(this.userProfile.theme ? this.userProfile.theme : 1);
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

  getEmailDropDowns() {
    this.showSpinner = true;
    var cLPCompanyID = this.userProfile ? this.userProfile.cLPCompanyID : this.user.cLPCompanyID;
    var cLPUserID = this.userProfile ? this.userProfile.cLPUserID : this.user.cLPUserID;
    var teamCode = this.userProfile ? this.userProfile.teamCode : this.user.teamCode
    this._outBoundEmailService.getEmailDropDowns(this.encryptedUser, cLPCompanyID, cLPUserID, teamCode)
      .then(async (result: EmailDropDownsResponse) => {
        if (result) {
          this.showSpinner = false;
          this.emailDropDownsResponse = UtilityService.clone(result);
          this.emailTemplates = this.emailDropDownsResponse.emailTemplates;
          this.patchProfileFormValue();
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
        if (!isNullOrUndefined(this.userProfile) && (this.userProfile.country == null || !this.userProfile.country))
          this.userProfileForm.controls.country.setValue(cObj.code2);
      },
        (error) => {
          this._utilityService.handleErrorResponse(error);
        }
      );
  }

  prepareUserProfileForm() {
    return this.fb.group({
      firstName: [{ value: '' }, [Validators.required]],
      lastName: [{ value: '' }, [Validators.required]],
      title: [{ value: '' }],
      companyName: [{ value: '' }],
      add1: [{ value: '' }],
      add2: [{ value: '' }],
      add3: [{ value: '' }],
      city: [{ value: '' }],
      state: [{ value: '' }],
      zip: [{ value: '' }, [Validators.pattern(/^[a-zA-Z0-9\s]{3,10}$/), Validators.max(2147483647)]],
      country: [{ value: '' }],
      facebookURL: [{ value: '' }],
      twitterURL: [{ value: '' }],
      linkedInURL: [{ value: '' }],
      emailFormat: [{ value: '' }],
      timeZoneWinId: [{ value: null }, [Validators.required]],
      cLPUserID: [{ value: '' }],
      userRole: [{ value: '' }],
      status: [{ value: 0 }],
      changePW: [{ value: false }],
      mobile: [{ value: '' }, [Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)]],
      phone: [{ value: '' }, [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)]],
      altPhone: [{ value: '' }, [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)]],
      fax: [{ value: '' }],
      //txtMsgLongCode: [{ value: '' }],
      enableSkype: [{ value: false }],
      fax2EmailFrom: [{ value: false }],
      //accountType: [{ value: '' }],
      //accEmailAdd: [{ value: '' }],

      email: [{ value: '' }],
      otherEmail: [{ value: '' }],
      useBothEmail: [{ value: false }],
      defaultSignature: [{ value: '' }],
      hTMLSignature: [{ value: '' }],
      emailTemplateID: [{ value: '' }],  //Bind
      fromDisplayName: [{ value: '' }],
      officeCode: [{ value: 0 }],
      teamCode: [{ value: 0 }],
      dateFormatId: [{ value: null }, [Validators.required]],
      employeeID: [{ value: '' }],
      selectedTheme: [{ value: 0 }]
    },
      { updateOn: "blur" });
  }

  patchProfileFormValue() {
    this.showSpinner = true;
    var userProfile = this.userProfile;
    for (let key in userProfile) {
      let value = userProfile[key];
      //Set the validation and render the control
      this.preparePatchFormControlValue(key, value);
      //}
    }
    var timeZoneObj = this.timezoneFilterList?.filter((data) => data.id === this.userProfile.timeZoneWinId)[0];
    if (!isNullOrUndefined(timeZoneObj))
      this.userProfileForm.get('timeZoneWinId').setValue(timeZoneObj.id);
    else
      this.userProfileForm.get('timeZoneWinId').setValue("");

    var dateFormatObj = this.dateFormatList?.filter((data) => data.id === this.userProfile.dateFormatId)[0];
    if (!isNullOrUndefined(dateFormatObj))
      this.userProfileForm.get('dateFormatId').setValue(dateFormatObj.id);
    else
      this.userProfileForm.get('dateFormatId').setValue("");

    var emailTemplateObj = this.emailTemplates?.filter((data) => data.emailTemplateID === this.userProfile.emailTemplateID)[0];
    if (!isNullOrUndefined(emailTemplateObj))
      this.userProfileForm.get('emailTemplateID').setValue(emailTemplateObj);
    else
      this.userProfileForm.get('emailTemplateID').setValue(this.defaultItemEmail);

    var teamCodeObj: ITeamOfficeCode = this.teamCodeList?.filter((data) => data.key === this.userProfile.teamCode)[0];
    if (!isNullOrUndefined(teamCodeObj))
      this.userProfileForm.get('teamCode').setValue(teamCodeObj.key);
    else
      this.userProfileForm.get('teamCode').setValue(0);

    var officeCodeObj: ITeamOfficeCode = this.officeCodeList?.filter((data) => data.key === this.userProfile.officeCode)[0];
    if (!isNullOrUndefined(officeCodeObj))
      this.userProfileForm.get('officeCode').setValue(officeCodeObj.key);
    else
      this.userProfileForm.get('officeCode').setValue(0);

      if (this.userProfile.theme == 0)
        this.userProfileForm.get('selectedTheme').setValue(this.userProfile.theme + 1);
      else
        this.userProfileForm.get('selectedTheme').setValue(this.userProfile.theme);
      this.showSpinner = false;
  }

  preparePatchFormControlValue(key, value) {
    if (this.userProfileForm.get(key))
      this.userProfileForm.get(key).setValue(value);
  }

  copyFormValueToData() {
    this.userProfile.firstName = this.userProfileForm.controls.firstName.value;
    this.userProfile.lastName = this.userProfileForm.controls.lastName.value;
    this.userProfile.title = this.userProfileForm.controls.title.value;
    this.userProfile.companyName = this.userProfileForm.controls.companyName.value;
    this.userProfile.add1 = this.userProfileForm.controls.add1.value;
    this.userProfile.add2 = this.userProfileForm.controls.add2.value;
    this.userProfile.add3 = this.userProfileForm.controls.add3.value;
    this.userProfile.city = this.userProfileForm.controls.city.value;
    this.userProfile.state = this.userProfileForm.controls.state.value;
    this.userProfile.zip = this.userProfileForm.controls.zip.value;
    this.userProfile.country = this.userProfileForm.controls.country.value;
    this.userProfile.facebookURL = this.userProfileForm.controls.facebookURL.value;
    this.userProfile.twitterURL = this.userProfileForm.controls.twitterURL.value;
    this.userProfile.linkedInURL = this.userProfileForm.controls.linkedInURL.value;
    this.userProfile.emailFormat = this.userProfileForm.controls.emailFormat.value;
    this.userProfile.timeZoneWinId = this.userProfileForm.controls.timeZoneWinId.value;
    this.userProfile.cLPUserID = this.userProfileForm.controls.cLPUserID.value;
    this.userProfile.userRole = this.userProfileForm.controls.userRole.value;
    this.userProfile.status = this.userProfileForm.controls.status.value;
    this.userProfile.changePW = this.userProfileForm.controls.changePW.value ? 1 : 0;
    this.userProfile.mobile = this.userProfileForm.controls.mobile.value;
    this.userProfile.phone = this.userProfileForm.controls.phone.value;
    this.userProfile.altPhone = this.userProfileForm.controls.altPhone.value;
    this.userProfile.fax = this.userProfileForm.controls.fax.value;
    this.userProfile.enableSkype = this.userProfileForm.controls.enableSkype.value;
    this.userProfile.fax2EmailFrom = this.userProfileForm.controls.fax2EmailFrom.value;
    this.userProfile.email = this.userProfileForm.controls.email.value;
    this.userProfile.otherEmail = this.userProfileForm.controls.otherEmail.value;
    this.userProfile.useBothEmail = this.userProfileForm.controls.useBothEmail.value;
    this.userProfile.defaultSignature = this.userProfileForm.controls.defaultSignature.value;
    this.userProfile.hTMLSignature = this.userProfileForm.controls.hTMLSignature.value;
    this.userProfile.emailTemplateID = this.userProfileForm.controls.emailTemplateID.value.emailTemplateID;
    this.userProfile.fromDisplayName = this.userProfileForm.controls.fromDisplayName.value;
    this.userProfile.officeCode = this.userProfileForm.controls.officeCode.value;
    this.userProfile.teamCode = this.userProfileForm.controls.teamCode.value;
    this.userProfile.dateFormatId = this.userProfileForm.controls.dateFormatId.value;
    this.userProfile.employeeID = this.userProfileForm.controls.employeeID.value;
    this.userProfile.theme = +this.userProfileForm.controls.selectedTheme.value;
    this.userProfile.password = '';
  }

  userProfileFormSubmit() {
    this.showSpinner = true;
    this._localService.validateAllFormFields(this.userProfileForm);
    if (this.userProfileForm.valid) {
      this.userProfileForm.markAsPristine();
      this.copyFormValueToData();
      var updatedTheme: number = +this.userProfileForm?.value?.selectedTheme;
      this.userSvc.Clpuser_Update(this.encryptedUser, this.userProfile)
        .then(async (result: SimpleResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            if (response.messageBool) {
              this._notifyService.showSuccess(response.messageString ? response.messageString : "Profile updated Successfully.", "", 3000);
            }
            else {
              this._notifyService.showError("Duplicate mobile number found", "Mobile number exists", 3000);
              if (this.userThemeOriginal != updatedTheme)
                this._notifyService.showError("Theme Could not be updated.", "", 3000);
            }

            this.showSpinner = false;
          }
          else {
            if (this.userThemeOriginal != updatedTheme)
              this._notifyService.showError("Theme Could not be updated.", "", 3000);
            this.showSpinner = false;
          }
          this.userProfileForm.reset();
          this.getUserProfile();
        })
        .catch((err: HttpErrorResponse) => {
          this.userProfileForm.reset();
          this.getUserProfile();
          console.log(err);

          this.showSpinner = false;
          if (this.userProfile.theme != updatedTheme)
            this._notifyService.showError("Theme Could not be updated.", "", 3000);

          this._utilityService.handleErrorResponse(err);
        });
    }
    else{
      this._notifyService.showError("Enter all mandatory fields", "Important fields Empty", 3000);
      this.showSpinner = false;
    }
  }
  onreset() {
    this.getUserProfile();
  }

  updateDropDownFormValue(value, checkType) {
    if (checkType == "dateFormatId")
      this.userProfileForm.get('dateFormatId').setValue(value == "" ? "" : +value);
    else if (checkType == "timeZoneWinId")
      this.userProfileForm.get('timeZoneWinId').setValue(value == "" ? "" : +value);
  }

  getCityState(e) {
    var zipCode = this.userProfileForm.controls.zip.value;
    if (zipCode && zipCode.length >= 3) {
      this._zipService.zip_Get(this.encryptedUser, zipCode)
        .then(async (result: ZipCodeResponse) => {
          if (result) {
            var result = UtilityService.clone(result);
            var zipCode = result.zipCode;
            zipCode && zipCode.city ? this.userProfileForm.get('city').setValue(zipCode.city) : null;
            zipCode && zipCode.state ? this.userProfileForm.get('state').setValue(zipCode.state) : null;
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    }
  }
  get usrProfileForm() {
    return this.userProfileForm.controls;
  }

  public async getTeamAndOfficeCodes() {
    this.showSpinner = true;
    var cLPCompanyID = this.userProfile ? this.userProfile.cLPCompanyID : this.user.cLPCompanyID;
    var cLPUserID = this.userProfile ? this.userProfile.cLPUserID : this.user.cLPUserID;
    await this.userSvc.getUsersSetup(this.encryptedUser, cLPCompanyID, cLPUserID)
      .then(async (result: UserSetupResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (response.filterTeam) {
            this.teamCodeList = this._localService.convertDictionaryToAnyType(response.filterTeam);
          }
          if (response.filterOffice) {
            this.officeCodeList = this._localService.convertDictionaryToAnyType(response.filterOffice);
          }
          this.timezoneFilterList = response.timeZoneWin;
          this.dateFormatList = response.dateFormat;
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

}
