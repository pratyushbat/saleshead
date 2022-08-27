import { isFakeMousedownFromScreenReader } from '@angular/cdk/a11y';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { element, utils } from 'protractor';
import { isNull, isNullOrUndefined } from 'util';
import { async } from 'rxjs/internal/scheduler/async';
import { version } from 'package.json';

import { ConfigDetails } from '../../../models/appConfig.model';
import { CLPUser, ResetPassword, UserResponse } from '../../../models/clpuser.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { LoginSecurityCodeResponse } from '../../../models/loginSecurityCode.model';
import { AuditLog, ActionType } from '../../../models/auditlog.model';
import { PasswordPolicy } from '../../../models/passwordPolicy.model';

import { GlobalService } from '../../../services/global.service';
import { AppconfigService } from '../../../services/shared/appconfig.service';
import { EncryptionService } from '../../../services/shared/encryption.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { LoginSecurityCodeService } from '../../../services/login-security-code.service';
import { LocalService } from '../../../services/shared/local.service';
import { MatRadioChange } from '@angular/material/radio';
import { CountryService } from '../../../services/country.service';
import { Country, CountryListResponse } from '../../../models/country.model';
import { CountryCode } from 'libphonenumber-js';
import { Title } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  showApp: boolean = true;
  isNewMenu: boolean = false;
  showLogin: boolean = true;
  showReset: boolean = false;
  showRelogin: boolean = false;
  isForget: boolean = false;
  deviceInfo: string = null;
  hide_security: boolean = true;
  loginSecurityCodeId: string;
  mfaMethod: string = "";
  isValidDevice: boolean = false;
  btnForgotSpinner: boolean = false;
  returnURL: string = "";
  isResetSubmit: boolean = false;
  errorMsg: string = "";
  encryptedToken: string;
  encryptedPass: string;
  isLoginCodeVerified: boolean = false;
  _actiontype: String;
  public version: string = version;

  resetForm: FormGroup;
  loginForm: FormGroup;
  verifyForm: FormGroup;

  userResponse: UserResponse;
  userPasswordPolicy: PasswordPolicy;
  user: CLPUser = <CLPUser>{};
  private simpleResponse: SimpleResponse;
  isLogin: boolean = false;

  show_countries: boolean = false;
  mobile_mask: string = '(000) 000-0000';
  usernameType: string = 'Email';
  @ViewChild('email', { static: true }) email_element;
  @ViewChild('imobile', { static: true }) mobile_element;
  pref: string = 'Email';
  countryListResponse: CountryListResponse;
  countryList: Country[];
  countryCode: string;
  countryCodeSent: string;
  placeHolder: string = '';
  dialCode: number = 1;
  ip: string = '';
  spam: boolean = false;
  tor: boolean = false;
  city: string = '';
  detail: string = '';

  constructor(private _userService: UserService, private cdr: ChangeDetectorRef, private fb: FormBuilder, private _appConfigService: AppconfigService, private _router: Router,
    private _route: ActivatedRoute,
    private titleService: Title,
    private _encryptionService: EncryptionService,
    private _globalService: GlobalService,
    private _utilityService: UtilityService,
    private notifyService: NotificationService,
    private _localService: LocalService,
    private loginSecurityCodeService: LoginSecurityCodeService,
    private _countryService: CountryService,

  ) {
    this._localService.isMenu = false;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Sales Optima');
    localStorage.setItem("title", 'Sales Optima');
    this.loginForm = this.prepareLoginForm();
    this.loginForm.reset();
    this.resetForm = this.prepareResetForm();
    this.resetForm.reset();
    this.verifyForm = this.prepareVerifyForm();
    this.verifyForm.reset();

    this.fnIsNewMenu();

    this._route.queryParamMap.subscribe(params => {
      if (params.has('r')) {
        this.encryptedToken = params.get('r');
        this.authenticateR(() => {
          if (this.userResponse && this.userResponse.user) {
            if (this.userResponse.isvalid) {
              this.errorMsg = "<span>A password reset is required</span>" + ((this.userResponse.msg != "<ul></ul>" && this.userResponse.msg != null) ? "<span> - </span>" + this.userResponse.msg : "<span>.</span>");
              this.showLogin = false;
              this.showReset = true;
              this.isForget = true;
              this.resetForm.get("CurrentPassword").disable();
            }
          }
          else
            this._router.navigate(['/unauthorized']);
        });
      }
    });

    this.log('init login');
    let country = window.localStorage.getItem('sc_country');
    if (country) {
      this.countryCode = country.toUpperCase();
      this.loadCountries();
    }
    else
    this.initialCountryCode();

    this.chooseLoginType();
    $(".show-password").click(function () {
      $(this).toggleClass("fa-eye fa-eye-slash");
      var input = $($(this).attr("toggle"));
      if (input.attr("type") == "password") {
        input.attr("type", "text");
      }
      else {
        input.attr("type", "password");
      }
    });
  }

  ngAfterViewChecked() {
    var emailInputValue = $('#email').val();
    if (emailInputValue)
      this.loginForm.patchValue({ email: emailInputValue });
    var pwdInputValue = $('#pwd').val();
    if (pwdInputValue)
      this.loginForm.patchValue({ password: pwdInputValue });
  }

  async fnIsNewMenu() {
    await this._appConfigService.getAppConfigValue(this.encryptedToken, "IsNewMenu").
      then(async (result: ConfigDetails) => {
        if (!isNullOrUndefined(result) && !isNullOrUndefined(result.configValue)) {
          this.isNewMenu = result.configValue == "1" ? true : false;
        }
        else
          this.isNewMenu = false;
      }).catch((err: HttpErrorResponse) => {
        this._userService.auditLog(ActionType.LoginError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "Error During Setting New Menu - " + err.message, "", "")
        console.log(err);
        this.isNewMenu = false;
      });
  }

  private async authenticateR(callback) {
    await this._userService.authenticateR(this.encryptedToken)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = result;
          this.user = this.userResponse.user;
          if (isNullOrUndefined(this.userResponse.user)) {
            this.showApp = true;
          }
          if (!this.userResponse.isvalid) {
            localStorage.removeItem("token");
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
      });
    callback();
  }

  copyUserFormValuesToDataObject() {
    this.user = <CLPUser>{};
    if (this.usernameType == 'Email')
      this.user.userName = this.loginForm.get("email").value;
    else if (this.usernameType == 'Mobile')
      this.user.userName = this.loginForm.get("mobile").value;
  }

  public async forgetPassword() {
    const passwordText = this.loginForm.get("password");
    if (!isNullOrUndefined(passwordText))
      passwordText.clearValidators();

    if (this.usernameType == 'Email') {
      this.loginForm.get("mobile").clearValidators();
      this.loginForm.controls.email.setValidators([Validators.required, Validators.pattern(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/)]);
    }
    else if (this.usernameType == 'Mobile') {
      this.loginForm.get("email").clearValidators();
      this.loginForm.controls.mobile.setValidators([Validators.required]);
    }

    this.validateAllFormFields(this.loginForm);
    if (this.loginForm.valid) {
      this.loginForm.markAsPristine();
      this.copyUserFormValuesToDataObject();
      if (!isNullOrUndefined(this.user) && !isNullOrUndefined(this.user.userName)) {
        this.btnForgotSpinner = true;
        await this._userService.forgotPassword(this.user.userName)
          .then(async (result: SimpleResponse) => {
            if (result) {
              this.btnForgotSpinner = false;
              if (result.messageBool)
                this.notifyService.showSuccess(result.messageString, "");
              else
                this.notifyService.showError(result.messageString, "", 8000);
            }
          })
          .catch((err: HttpErrorResponse) => {
            this._userService.auditLog(ActionType.ForgetError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, err.message, "", "")
            console.log(err);
            this.btnForgotSpinner = false;
          });
      }
      this.loginForm.controls.password.setValidators([Validators.required]);
    }
  }

  public login() {
    this.loginForm.controls.password.setValidators([Validators.required]);
    var loginFormValid;
    if (this.usernameType == 'Email') {
      this.loginForm.controls.mobile.setValue('');
      loginFormValid = this.loginForm.get('email').valid && this.loginForm.get('password').valid;
    }
    else {
      loginFormValid = this.loginForm.get('mobile').valid && this.loginForm.get('password').valid;
      this.loginForm.controls.email.setValue('');
    }

    this.validateAllFormFields(this.loginForm);
    if (loginFormValid) {
      this.loginForm.markAsPristine();
      this.encyryptCred();
      this.authenticateUser();
    }
  }

  disabledSubmit() {
    let username = this.loginForm.get("email").value;
    let pass = this.loginForm.get("password").value;

    if (username != null && username != '' && pass != null && pass != '') {
      return false;
    }
    else
      return true;
  }

  //Not calling as of now
  loginByrememberMe() {
    var cred = localStorage.getItem('encryptedCred');
    if (cred) {
      this.user.userName = cred.split(",")[0];
      this.user.encryptedPassword = cred.split(",")[1];
      this.authenticateUser();
    }
  }

  public btnRelogin_click() {
    this.showLogin = true;
    this.showRelogin = false;
    this.errorMsg = "";
    this.loginForm.reset();
    this.resetForm.reset();
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

  encyryptCred() {
    this.encryptedPass = this.loginForm.get("password").value;
    this.user = <CLPUser>{};          
    if (this.usernameType == 'Email') {
      this.user.mobile = "";
      this.user.userName = this.loginForm.get("email").value;
    }
    else {
      this.user.userName = "";
      this.user.mobile = this.loginForm.get("mobile").value;    
    }
    this.user.encryptedPassword = this.encryptedPass;      
  }

  private async authenticateUser() {
    if (!isNullOrUndefined(this.user)) {
      this.isLogin = true;
      await this._userService.authenticate(this.user)
        .then(async (result: UserResponse) => {
          if (result) {
            this.userResponse = UtilityService.clone(result);
            let userName: string = this.user ? this.user.userName : '';
            this.user = this.userResponse.user;
            this._globalService.user = this.userResponse.user;
            this.userPasswordPolicy = this.userResponse.passwordPolicy;
            this.encryptedToken = this.userResponse.encryptedToken;
            if (!this.userResponse.exists) {
              this.notifyService.showError(this.userResponse.msg, "Login", 7000);
              this._userService.auditLog(ActionType.LoginError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "Login.Error for - " + userName, "", "")
            }
            else if (!this.userResponse.isvalid) {

              if (!isNullOrUndefined(this.userResponse.passwordPolicy))
                this.errorMsg = "<span>A password reset is required</span>" + (!isNullOrUndefined(this.userResponse.passwordPolicy.pwdSummary) ? "<span> - </span>" + this.userResponse.passwordPolicy.pwdSummary : "<span>.</span>");

              this.showLogin = false;
              this.showReset = true;
              this.isForget = false;
              this._userService.auditLog(ActionType.LoginError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "Reset.Info - Reset is Required", "", "")
            }
            if (this.userResponse.passwordPolicy && this.userResponse.passwordPolicy.isMFAEnabled) { // check for MFA

              if (this.userResponse.isvalid) {
                this.validateDevice(() => {
                  if (this.isValidDevice)
                    this.redirectToContact();
                  else { //send code             
                    this._userService.sendCode(this.user.cLPUserID)
                      .subscribe(
                        (response: SimpleResponse) => {
                          if (response) {
                            this.simpleResponse = UtilityService.clone(response);
                            if (this.simpleResponse) {
                              if (this.simpleResponse.messageBool)
                                this.notifyService.showError(this.simpleResponse.messageString, "Login", 7000);
                              else {
                                this.loginSecurityCodeId = this.simpleResponse.messageInt.toString();
                                this.hide_security = false;
                                this.showLogin = false;
                                this.showReset = false;
                                this.mfaMethod = this.userPasswordPolicy ? this.userPasswordPolicy.mfaMethod == 0 ? 'mobile number.' : this.userPasswordPolicy.mfaMethod == 1 ? 'email.' : 'email and mobile number.' : 'mobile number.';
                                this.notifyService.showInfo('Please enter the security code sent to your ' + this.mfaMethod, 'Verification', 7000, 600, true, 'toast-top-right');
                                this.loginForm.reset();
                              }
                            }
                          }
                          else {
                            this._utilityService.handleErrorEmail('[ENV] login-component.logIn.sendCode - no connection', 'userId: ' + this.user.cLPUserID + this.deviceInfo);
                          }
                        },
                        (error) => {
                          this._utilityService.handleErrors(error, null, 'userId: ' + this.user.cLPUserID + this.deviceInfo, "", "login-component", "sendCode");
                        }
                      );
                  }
                });
              }
            }
            else if (this.userResponse.isvalid && this.encryptedToken)
              this.redirectToContact();
          }
          this.isLogin = false;
        }).catch((err: HttpErrorResponse) => { console.log(err); this.isLogin = false; });
    } else {
      this.notifyService.showError("Issue Encountered, Please try again!", "Login", 8000);
    }
  }

  async validateDevice(callback) {
    let device: string = this._globalService.getValidDevice();
    await this._userService.validateDevice(this.userResponse.userId, device).then(
      (response: SimpleResponse) => {
        if (response) {
          this.simpleResponse = UtilityService.clone(response);
          if (this.simpleResponse) {
            this.isValidDevice = this.simpleResponse.messageBool;
            this.encryptedToken = this.simpleResponse.messageString;

            if (!this.isValidDevice)
              this._globalService.removeDevice();

          }
        }
        else {
          this._utilityService.handleErrorEmail('[ENV] login-component.authenticateUser.validateDevice - no connection', 'userId: ' + this.user.cLPUserID + this.deviceInfo);
        }
      },
      (error) => {
        this._utilityService.handleErrors(error, null, 'userId: ' + this.user.cLPUserID + this.deviceInfo, "", "login-component", "validateDevice");
      }
    );
    callback();
  }

  confirm() {
    this.verifyLoginSecurityCode(() => {
      if (this.isLoginCodeVerified) {
        this._userService.setDeviceId(this.user.cLPUserID)
          .subscribe(
            (response: SimpleResponse) => {
              if (response) {
                this.simpleResponse = UtilityService.clone(response);
                if (this.simpleResponse && this.simpleResponse.messageBool) {
                  this._globalService.user.currentDeviceId = this.simpleResponse.messageString;
                  this._globalService.setValidDevice();
                  this._globalService.setExpiration(this.userPasswordPolicy.expiration > 0 ? this.userPasswordPolicy.expiration : 3);
                  this.encryptedToken = response.messageString2;
                  this.redirectToContact();
                  this._userService.auditLog(ActionType.ConfirmSuccess, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "confirm.Success", "", "")
                }
              }
              else {
                this._utilityService.handleErrorEmail('[ENV] login-component.logIn.confirm - no connection', 'userId: ' + this.user.cLPUserID + this.deviceInfo);
                this._userService.auditLog(ActionType.ConfirmError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "[ENV] login-component.logIn.confirm - no connection" + this.user.cLPUserID + this.deviceInfo, "", "")
              }
            },
            (error) => {
              this._utilityService.handleErrors(error, null, 'userId: ' + this.user.cLPUserID + this.deviceInfo, "", "login-component", "confirm");
              this._userService.auditLog(ActionType.ConfirmError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "login-component" + error, "", "")
            }
          );
      }
      else {
        this.notifyService.showError("Please enter valid Security Code.", "Verify", 5000);
        this._userService.auditLog(ActionType.ConfirmError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "Confirm.Error - Invalid securityCode", "", "")
      }
    });
  }

  private async verifyLoginSecurityCode(callback) {
    await this.loginSecurityCodeService.getLoginSecurityCode(this.loginSecurityCodeId, this.verifyform.securityCode.value)
      .then(async (result: LoginSecurityCodeResponse) => {
        if (result) {
          this.isLoginCodeVerified = result.verified;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
      });

    callback();
  }

  confirmEnabled() {
    if (!this.verifyform.securityCode.value)
      return true;
    else {
      if (this.verifyform.securityCode.errors && (this.verifyform.securityCode.touched || this.verifyform.securityCode.dirty))
        return true;
    }
    return false;
  }

  resendCode() {
    this._userService.sendCode(this.user.cLPUserID)
      .subscribe(
        (response: SimpleResponse) => {
          if (response) {
            this.simpleResponse = UtilityService.clone(response);
            if (this.simpleResponse) {
              this.loginSecurityCodeId = this.simpleResponse.messageInt.toString();
              this.hide_security = false;
              this.notifyService.showInfo('Your security code has been resent.', 'Verification', 7000, 600, true, 'toast-top-right');
            }
          }
          else {
            this._utilityService.handleErrorEmail('[ENV] login-component.logIn.resendCode - no connection', 'userId: ' + this.user.cLPUserID + this.deviceInfo);
          }
        },
        (error) => {
          this._utilityService.handleErrors(error, null, 'userId: ' + this.user.cLPUserID + this.deviceInfo, "", "login-component", "resendCode");
        }
      );
  }

  redirectToContact() {
    if (this.userResponse.isvalid && this.encryptedToken) {
      localStorage.setItem("token", this.encryptedToken);
      this._router.navigate(['/contacts']);
      this._localService.themeChangeHandler(this.userResponse.user.theme == 1 ? 'main' : this.userResponse.user.theme == 2 ? 'silk' : this.userResponse.user.theme == 3 ? 'dark' : 'main');
    }
  }

  private async redirectToMySO() {
    this._userService.auditLog(ActionType.LoginSuccess, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "Login.Success", "", "")
    await this._appConfigService.getAppConfigValue(this.encryptedToken, "MySO_URL").
      then(async (result: any) => {
        if (this.userResponse.isvalid && this.encryptedToken) {
          localStorage.setItem("token", this.encryptedToken);
        }
        var url = result.configValue;
        if (isNullOrUndefined(this.userResponse.passwordPolicy) ||
          (!isNullOrUndefined(this.userResponse.passwordPolicy.isMFAEnabled) && !this.userResponse.passwordPolicy.isMFAEnabled)) {
          if (this.userResponse.isvalid && this.encryptedToken) {

            if (this.isNewMenu) {
              if (!isNullOrUndefined(this.returnURL) && this.returnURL != "")
                $(location).attr('href', url + this.encryptedToken + this.returnURL);
              else
                this._router.navigate(['/default'], { queryParams: { r: this.encryptedToken } });
            }
            else
              $(location).attr('href', url + this.encryptedToken + this.returnURL);
          }
          else 
            console.log('invalid user');          
        }
        else {
          let currentDevice: string = this._globalService.getValidDevice();
          await this._userService.updateRWithDeviceId(this.encryptedToken, currentDevice).
            then(async (result: SimpleResponse) => {
              this.encryptedToken = result.messageString;

              if (this.isNewMenu) {
                if (!isNullOrUndefined(this.returnURL) && this.returnURL != "")
                  $(location).attr('href', url + this.encryptedToken + this.returnURL);
                else
                  this._router.navigate(['/default'], { queryParams: { r: this.encryptedToken } });
              }
              else
                $(location).attr('href', url + this.encryptedToken + this.returnURL);

            })
        }
      })
  }

  public async resetPassword() {
    if (!this.isResetSubmit) {
      this.validateAllFormFields(this.resetForm);
      if (this.resetForm.valid) {
        this.resetForm.markAsPristine();

        this.isResetSubmit = true;

        var resetPassword: ResetPassword = <ResetPassword>{};
        resetPassword.currentPassword = this.resetForm.get("CurrentPassword").value;
        resetPassword.newPassword = this.resetForm.get("NewPassword").value;
        resetPassword.isForget = this.isForget ? 1 : 0;

        this.user.resetPassword = resetPassword;

        await this._userService.resetPassword(this.user, this.encryptedToken)
          .then(async (result: UserResponse) => {
            if (result) {
              this.userResponse = UtilityService.clone(result);
              if (!this.userResponse.exists) {
                this.notifyService.showError("Please enter a valid password.", "Reset Password", 5000);
                this._userService.auditLog(ActionType.ReSetError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "ResetPassword.Error - Invalid Credentials.", "", "")
              }
              if (this.userResponse.isvalid) {
                this.errorMsg = ''
                this.notifyService.showSuccess(this.userResponse.msg, "Reset Password");
                this.showLogin = false;
                this.showReset = false;
                this.showRelogin = true;
                this._userService.auditLog(ActionType.ReSetSuccess, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "ResetPassword.Success", "", "")
              }
              else {
                this.notifyService.showError(this.userResponse.msg, "Reset Password", 5000);
                this._userService.auditLog(ActionType.ReSetError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "ResetPassword.Info - " + this.errorMsg, "", "")
              }
            }
            this.isResetSubmit = false;
          })
          .catch((err: HttpErrorResponse) => {
            this._userService.auditLog(ActionType.ReSetError, isNullOrUndefined(this.user) ? 0 : this.user.cLPUserID, "ResetPassword.Error" + err, "", "");
            this.isResetSubmit = false;
            console.log(err)
          });
      }
      else {
        this.isResetSubmit = false;
      }
    }
  }

  disabledSubmitPassword() {
    let newpass = this.resetForm.get("NewPassword").value;
    let confirmpass = this.resetForm.get("ConfirmPassword").value;

    if (newpass != null && newpass != '' && confirmpass != null && confirmpass != '') {
      if (confirmpass == newpass) {
        return this.isResetSubmit;
      }
      else {
        return true;
      }
    }
    else
      return true;

  }

  get loginFrm() {
    return this.loginForm.controls;
  }

  get resetfrm() {
    return this.resetForm.controls;
  }

  get verifyform() { return this.verifyForm.controls; }

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  private prepareLoginForm(): FormGroup {
    return this.fb.group({
      email: [{ value: '' }, [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/)]],
      countryId: [{ value: -1 }],
      mobile: [{ value: '' }, [Validators.required]],
      password: [{ value: '' }, [Validators.required]],
      rememberMe: [{ value: false }]
    });
  }

  private prepareResetForm(): FormGroup {
    return this.fb.group({
      CurrentPassword: [{ value: '' }, [Validators.required]],
      NewPassword: [{ value: '' }, [Validators.required]],
      ConfirmPassword: [{ value: '' }, [Validators.required]]
    }, {
      validator: this.ConfirmedValidator('NewPassword', 'ConfirmPassword')
    });
  }

  private prepareVerifyForm(): FormGroup {
    return this.fb.group({
      securityCode: [{ value: '' }]
    });
  }

  changeRadio(event: MatRadioChange) {
    this.usernameType = event.value;
    this._globalService.setLoginPref(this.usernameType);
    setTimeout(() => {
      if (this.usernameType == 'Email') 
        this.email_element.nativeElement.focus();      
      else 
        this.mobile_element.nativeElement.focus();      
    }, 200);
  }

  chooseLoginType() {
    let pref_store = this._globalService.getLoginPref();
    if (pref_store) {
      this.pref = pref_store;
      this.usernameType = pref_store;
      this.cdr.detectChanges();
      setTimeout(() => {
        if (this.pref == 'Email') {
          this.email_element.nativeElement.focus();
          this.cdr.detectChanges();
        }
        else {
          this.mobile_element.nativeElement.focus();
          this.cdr.detectChanges();
        }
      }, 200);
    }
    else {
    }
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
/*Below API is to be implemented*/
  /*         
            this._userService.createIPLog(this.ip, 'login', this.countryCode, this.spam, this.tor, this.city, this.detail)
              .subscribe(
                (response: SimpleResponse) => {
                  if (response) {
                    response = UtilityService.clone(response);
                    if (response) {
                      this.log('logged origin');
                    }
                  }
                },
                (error) => {
                  this.countryCode = 'US';
                  this.loadCountries();
                  this.log('loadIpApi.error');
                  this.log(error);
                }
              );*/
          }
          else {
            this.countryCode = 'US';
            this.loadCountries();
            this.log('loadIpApi.error.2 no res');
            console.log('_countryService.loadIpApi', '[ENV] login-component.loadIpApi null response socid: ');
          }
        },
        (error) => {
          this.countryCode = 'US';
          this.loadCountries();
          this.log('loadIpApi.error.3');
          this.log(error);
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

        this.countryList.forEach((c) => {
          if (c.code2 == this.countryCode) {
            this.countryCodeSent = c.code;
            this.loginForm.controls.countryId.setValue(c.code2);
            this.handleChangeCountry(this.countryCode);
          }
        });
      },
        (error) => {
          this._utilityService.handleErrorResponse(error);
        }
      );
  }

  changeCountry($event) {
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

  logInEnabled() {
    if (this.usernameType == 'Mobile') {
      if (!this.loginFrm.mobile.value)
        return true;
      else {
        if (this.loginFrm.mobile.errors && (this.loginFrm.mobile.touched || this.loginFrm.mobile.dirty))
          return true;
      }
    }
    else {
      if (!this.loginFrm.email.value)
        return true;
      else {
        if (this.loginFrm.email.errors && (this.loginFrm.email.touched || this.loginFrm.email.dirty))
          return true;
      }
    }

    if (!this.loginFrm.password.value)
      return true;

    return false;
  }

  log(message: string) {
    this._globalService.log('login', message);
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
}



