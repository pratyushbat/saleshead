import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input/esm2015/lib/ngx-mat-intl-tel-input.component';

import { UtilityService } from '../../../services/shared/utility.service';
import { NotificationService } from '../../../services/notification.service';
import { SignupService } from '../../../services/signup.service';
import { LocalService } from '../../../services/shared/local.service';

import { SignupDuplicateCheck, SignupMsg, SignupMsgResponse } from '../../../models/signupMsg.model';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { timer } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { CountryCode } from 'libphonenumber-js';
import { CountryService } from '../../../services/country.service';
import { Country, CountryListResponse } from '../../../models/country.model';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
/** sign-up component*/
export class SignUpComponent implements OnInit {
  /** sign-up ctor */
  step: number = 1;
  showSecurityCode: boolean = false;
  isShowSpinner: boolean = false;
  signupMsg: SignupMsg = <SignupMsg>{};
  signupMsgResponse: SignupMsgResponse;
  signup_submit: boolean = false;
  @ViewChild(NgxMatIntlTelInputComponent) phoneInput: NgxMatIntlTelInputComponent;

  placeHolder: string = '';
  mobile_mask: string = '(000) 000-0000';
  show_countries: boolean = false;
  countryList: Country[];
  dialCode: number = 1;

  shouldShowpwd: boolean = true;
  shouldShowRepwd: boolean = true;
  signupForm = new FormGroup({
    phone: new FormControl(undefined),
    countryId: new FormControl(undefined),
    securityCode: new FormControl(undefined, Validators.required),
  });

  userForm = new FormGroup({
    firstName: new FormControl(undefined, Validators.required), 
    lastName: new FormControl(undefined, Validators.required),
    email: new FormControl('', { validators: Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/), Validators.required]), updateOn: "blur" })
  });

  passwordForm = new FormGroup({
    password: new FormControl(undefined, Validators.compose([Validators.required, Validators.minLength(6), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=.*[$@$!%*?&])(?=[^A-Z]*[A-Z]).{8,30}$/)])),
    rePassword: new FormControl(undefined, Validators.compose([Validators.required, Validators.minLength(6)])),
    checkSignup: new FormControl(undefined, Validators.requiredTrue)
  }, { validators: this.pwdMatchValidator });

  welcomeToken: string = "";
  user: CLPUser;
  countryCode: string = 'US';

  ip: string = '';
  spam: boolean = false;
  tor: boolean = false;
  city: string = '';
  detail: string = '';

  mobile: string = '';
  isMobileValidate: number = 0;
  isSignupFinish: boolean=false;
  countryListResponse: CountryListResponse;
  countryCodeSent: string;
    
  constructor(private fb: FormBuilder,
    private _utilityService: UtilityService,
    public _signupService: SignupService,
    public _localService: LocalService,
    public notifyService: NotificationService,
    public _userService: UserService,
    public _countryService: CountryService,
    private _router: Router,
    private _route: ActivatedRoute, private cdRef: ChangeDetectorRef
  ) {
    this.showSecurityCode = false;
  }

  ngOnInit() {   
    this.loadHomeCountries(); 
    this._route.queryParamMap.subscribe(params => {
      if (params.has('wr')) {
        this.welcomeToken = params.get('wr');
        if (!isNullOrUndefined(this.welcomeToken)) {
          this.authenticateWelcomeR(() => {
            if (!isNullOrUndefined(this.user)) {  
              this.patchFormValue();            
            }
            else
              this._router.navigate(['/unauthorized']);
          })
        }
      }
    });
  }
  async loadHomeCountries() {
    await this.initialCountryCode();
  }

  ngAfterViewChecked() {
    if (this.isMobileValidate > 0 && this.signupForm.controls['phone'].value == null)
      this.isMobileValidate = 0;
    this.cdRef.detectChanges();
  }
 
  pwdMatchValidator(frm: FormGroup) {
    return frm.controls.password.value === frm.controls.rePassword.value
      ? null : { 'mismatch': true };
  }

  private async authenticateWelcomeR(callback) {
    await this._userService.authenticateWelcomeR(this.welcomeToken)
      .then(async (result: UserResponse) => {
        if (result) {
          var userResponse = result;
          if (!isNullOrUndefined(userResponse.user)) {
            this.user = userResponse.user;
          }
          else
            console.log('default.authenticateWelcomeR - this.userResponse', userResponse);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  patchFormValue() {
    this.userForm.patchValue({
      firstName: this.user.firstName ? this.user.firstName : '',
      lastName: this.user.lastName ? this.user.lastName : '',
      email: this.user.userName ? this.user.userName : ''
    });
  }

  async validateMobile() {
    
    await this.checkDuplicate('isEmail');
    if (this.isMobileValidate == 2) {
      this.signupMsg.mobile = '+' + this.dialCode + this.signupForm.controls.phone.value;
      this.signupMsg.countryCode = this.signupForm.controls.countryId.value;

      if (this.signupForm.controls.phone.value) {
        //this.showSecurityCode = false;
        this.isShowSpinner = true;
        await this._signupService.createSignupMsg(this.signupMsg)
          .then((result: SignupMsgResponse) => {
            if (result) {
              this.signupMsgResponse = UtilityService.clone(result);
              if (this.signupMsgResponse.messageBool) {
                this.notifyService.showSuccess(this.signupMsgResponse.messageString, "", 3000);
                this.showSecurityCode = true;
              }
              else
                this.notifyService.showError(this.signupMsgResponse.messageString, "", 3000);
            }
            this.isShowSpinner = false;
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this.isShowSpinner = false;
            this._utilityService.handleErrorResponse(err);
          });
      }

    }
    else {

      return;
    }    
  }

  async confirmSecurityCode() {
    this.signupMsg.securityCode = this.signupForm.controls.securityCode.value;
    if (this.signupForm.controls.securityCode.value) {
      this.isShowSpinner = true;
      await this._signupService.verifySecurityCode(this.signupMsgResponse.signupMsgId, this.signupMsg.securityCode)
        .then((result: SignupMsgResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            if (response.verified) {
              //this.signupForm.reset();
              this.notifyService.showSuccess("Mobile number verified successfully.", "", 3000);
              this.step = 2;
            }
            else
              this.notifyService.showSuccess("Mobile number not verified.", "", 3000);
            this.isMobileValidate = 0;
          }
          this.isShowSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.isShowSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  changeMobile() {
    this.step = 1;
    this.signupForm.reset();
    this.showSecurityCode = false;
  }

  goBackToInitialStep() {
    this.step = 2;
    this.passwordForm.reset();
  }

  onSubmit() {
    console.log('onSubmit', this.signupForm);
  }

  onReset() {
    this.signupForm.reset();
  }

  removeFirstOccurrence(str, replaceStr) {
    var index = str.indexOf(replaceStr);
    if (index === -1) {
      return str;
    }
    return str.slice(0, index) + str.slice(index + replaceStr.length);
  }

  async userFormSubmit() {
    await this.checkDuplicate('isEmail');
    this._localService.validateAllFormFields(this.userForm);
    if (this.userForm.valid && this.isMobileValidate == 2) {
      this.userForm.markAsPristine();
      this.step = 3
      this.signup_submit = false;
    }
    else {
      console.log('form invalid');
      this.signup_submit = false;
    }
  }

   async createUser() {    
    if (this.userForm.valid && this.passwordForm.valid) {
      this.isShowSpinner = true;
      this.isSignupFinish=true;
      let clpuser: CLPUser = <CLPUser>{};
      if (!isNullOrUndefined(this.user) && !isNullOrUndefined(this.welcomeToken))
        clpuser = this.user
      clpuser.email = this.userForm.controls["email"].value;
      clpuser.firstName = this.userForm.controls["firstName"].value;
      clpuser.lastName = this.userForm.controls["lastName"].value;
      clpuser.password = this.passwordForm.controls["password"].value;
      clpuser.phone = this.mobile ? this.mobile : '';
      clpuser.mobile = this.mobile ? this.mobile : '';
      clpuser.country = this.countryCodeSent ? this.countryCodeSent : '';
      if (clpuser.cLPUserID > 0) {
          await this._userService.clpuser_update_signup(this.welcomeToken, clpuser)
          .then((result: SimpleResponse) => {          
            if (result) {
              var response = UtilityService.clone(result);
              if (response.messageBool)
                this.notifyService.showSuccess("User registration done successfully.", "", 3000);
              else
                this.notifyService.showError("Duplicate mobile number found.User could not be registered", "Mobile number exists", 3000);

              this.isSignupFinish = false;
              setTimeout(() => { this._router.navigate(['/login']); }, 500);
            }
            else {
              this.isShowSpinner = false;
              this.isSignupFinish = false;
              }
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this.isShowSpinner = false;
            this._utilityService.handleErrorResponse(err);
          });
      }
      else {
        clpuser.userRole = 3;
        await this._userService.clpuser_Create(clpuser)
          .then((result: SignupMsgResponse) => {
            if (result) {           
              var response = UtilityService.clone(result);
              if (response.messageBool)
                this.notifyService.showSuccess("User registration done successfully.", "", 3000);
              else
                this.notifyService.showError("Duplicate mobile number found", "Mobile number exists", 3000);
              
              setTimeout(() => { this._router.navigate(['/login']); }, 500);
              this.isSignupFinish = false
            }
            else {
              this.isSignupFinish = false;
              this.isShowSpinner = false;
            }
           
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this.isShowSpinner = false;
            this._utilityService.handleErrorResponse(err);
          });
      }
    }
  }

  changeInputType(input: any): any {
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  async checkDuplicate(type?) {

    //if (!isNullOrUndefined(this.user) && !isNullOrUndefined(this.welcomeToken)) {
    //  this.isMobileValidate = 2;
    //  return;
    //}

    if (!isNullOrUndefined(this.user) && !isNullOrUndefined(this.welcomeToken) && (type == 'isEmail')) {
      this.isMobileValidate = 2;
      return;
    }

    if (this.userForm.controls["email"].value == '' && this.step == 2)
      return;
    let signupDuplicate: SignupDuplicateCheck = <SignupDuplicateCheck>{};
    signupDuplicate.email = this.userForm.controls["email"].value ? this.userForm.controls["email"].value : "";
    signupDuplicate.mobile = this.mobile ? this.mobile : "";
    signupDuplicate.country = this.countryCode ? this.countryCode : "";
    if (type == 'isEmail') { signupDuplicate.mobile = ""; signupDuplicate.country = ""; }
    if (type == 'isMobile') signupDuplicate.email = "";
    this.isMobileValidate = 0;
    await this._signupService.cLPUser_DuplicateCheck(signupDuplicate)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (response && response.statusCode == 201 && response.messageInt > 0) {
            this.isMobileValidate = 1; //is exist
            if (signupDuplicate.email) {
              this.notifyService.showError("Duplicate email found", "Email exists", 3000);
            }
            else
            this.notifyService.showError("Duplicate mobile number found", "Mobile number exists", 3000);
          }
          else
            this.isMobileValidate = 2; //not exist
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.isMobileValidate = 0;
        this._utilityService.handleErrorResponse(err);
      });
  }

  loadCountries() {
    this._countryService.getCountryList()
      .then((response: CountryListResponse) => {
        this.countryListResponse = UtilityService.clone(response);
        this.countryList = UtilityService.clone(this.countryListResponse.countries);      
        this.countryList.map(val => {
          val.code2Lower = val.code2.toLowerCase();
        });

          this.countryList.forEach((c) => {
            if (c.code2 == this.countryCode) {
              this.countryCodeSent = c.code;
              this.signupForm.controls.countryId.setValue(c.code2);             
              this.handleChangeCountry(this.countryCode);
              this.makeFormChanges();
            }
          });      
        },
        (error) => {
          this._utilityService.handleErrorResponse(error);
        }
      );
  }

  changeCountry($event) {
    this.signupForm.controls.phone.reset();
    this.showSecurityCode = false;
    this.handleChangeCountry($event.target.options[$event.target.selectedIndex].getAttribute("data-code2")); 
  }

  private async handleChangeCountry(code2: string) {
    this.countryCode = code2;
    window.localStorage.setItem('sc_country', code2.toLowerCase());
    if (code2) {
      let code2Lower: string = code2.toLowerCase();
      let found: boolean = false;
      if (this.countryList) {
        this.countryList.forEach((c) => {
          if (c.code2Lower == code2Lower) {
            found = true;
            this.placeHolder = c.placeholder ? this._countryService.parseSimplePhone(c.placeholder, c.code2 as CountryCode) : '';
            this.mobile_mask = this._countryService.replaceZero(this.placeHolder);
            this.dialCode = c.dialCode;         
            this.makeFormChanges();
          }
        });

        if (!found) {
          this.placeHolder = '001234567890';
          this.dialCode = 1;
          this.mobile_mask = '';
          this.makeFormChanges();
        }
      }
    }
  }

    makeFormChanges() {     
      this.isMobileValidate = 0;
      timer(1)
        .pipe(debounceTime(5000))
        .subscribe(_ => {         
          this.mobile = this.signupForm.controls["phone"].value;        
          this.signupForm.controls["phone"].value ? this.checkDuplicate('isMobile') : null;         
        });
  }
  public changeMobileNumber() {
    this.isMobileValidate = 0;
    if (this.signupForm.controls['phone'].status=='VALID')
      this.makeFormChanges();
   
  }
  async initialCountryCode() {
    this._countryService.loadIpApi()
      .subscribe(
        (res: any) => {
          if (res) {
            this.ip = res.ip;
            this.countryCode = res.countrycode;
            this.spam = res.spam;
            this.tor = res.tor;
            this.city = res.city;
            this.detail = res.detail;
            this.loadCountries();
          }
          else {
            console.log('_countryService.loadIpApi', '[ENV] home-component.loadIpApi null response socid: ');
          }
        },
        (error) => {
          this._utilityService.handleErrorResponse(error);
        }
      );
  }


}
