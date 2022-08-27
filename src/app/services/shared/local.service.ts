import { Injectable, Inject, EventEmitter, NgZone } from '@angular/core';
import { Observable, BehaviorSubject, throwError, ReplaySubject, Subject } from 'rxjs';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as $ from "jquery";
import { CLPUser, UserResponse } from '../../models/clpuser.model';
import { FormControl, FormGroup } from '@angular/forms';
import { SimpleResponse } from '../../models/genericResponse.model';
import { ContactService } from '../contact.service';
import { ContactFields, ContactFieldsResponse } from '../../models/contact.model';
import { UtilityService } from './utility.service';
import { isNullOrUndefined } from 'util';
import { SomythemeService } from './somytheme.service';
import { table } from 'console';

@Injectable()
export class LocalService {

  public showCommonComp: string = '';

  activityClicked: boolean = false;
  contactClicked: boolean = false;
  leadClicked: boolean = false;
  customClicked: boolean = false;

  //Admin Account setup varibales
  isAdminPassFrmValid: boolean = false;
  isShowAdminTabs: boolean = false;
  selectedAdminCompanyId: number = -1;
  private sendCompanyId = new BehaviorSubject<number>(-1);
  changedCompanyId = this.sendCompanyId.asObservable();
  private companyName = new BehaviorSubject<string>("");
  //Admin Account setup varibales

  public selectedSubMenu: string = '';
  public selectedSubMenuSub: string = '';
  public menuSelected: any = {};
  public selectedMenuIndex: number = 0;

  public isShowRptCommon: boolean = true;
  public rptCommonMenu: string = '';

  isChartRedraw = new EventEmitter();

  currentUrl: string = '';
  isReport: string = '';
  previousId: string = "";

  private baseUrl: string;
  private api: string = "api/Authentication";
  private emailSubject = new BehaviorSubject<string>("");
  private contractName = new BehaviorSubject<string>("");
  private contactIdSubject = new ReplaySubject<number>(1);

  currentUser: CLPUser;

  isMenu: boolean = false;
  handledReceived = new EventEmitter<boolean>();
  reloadData = new EventEmitter<boolean>();
  hideCommonComponent = new BehaviorSubject<string>("");
  handleContactSettings = new EventEmitter<any>();

  contactFields: ContactFields;
  contactFieldsResponse: ContactFieldsResponse;

  matTooltipSetting = {
    msg: "Drag and Drop the sequence to change the order of the list.",
    position: "below",
    delay: "500"
  }

  matTooltipConfig = {
    msg: "Drag, Drop and Swap the sequence to change the order of the list.",
    position: "below",
    delay: "500"
  }

  timezoneFilterList: Array<any> = [
    { key: 'Eastern Time', value: 0 },
    { key: 'GMT +4: Bermuda', value: 1 },
    { key: 'Central Time', value: 2 },
    { key: 'Mountain Time.', value: 4 },
    { key: 'Pacific Time ', value: 6 },
    { key: 'Arizona Time', value: 7 },
    { key: 'GMT -9: Alaska', value: 9 },
    { key: 'GMT -10: Hawaii ', value: 10 },
    { key: 'GMT -11: Midway Island, Samoa', value: 11 },
    { key: 'GMT -12: International Date Line West', value: 12 },
    { key: 'GMT -3: Greenland, Buenos Aires', value: 13 },
    { key: 'GMT -2: Mid-Atlantic.', value: 14 },
    { key: 'GMT -1: Azores, Cape Verde Is.', value: 15 },
    { key: 'GMT: London, Dublin', value: 16 },
    { key: 'GMT +1: Paris, Berlin, Rome', value: 17 },
    { key: 'GMT +2: Athens, Cairo', value: 18 },
    { key: 'GMT +3: Kuwait, Moscow', value: 19 },
    { key: 'GMT +4: Abu Dhabi, Tbilsi', value: 20 },
    { key: 'GMT +5: Islamabad, Karachi.', value: 21 },
    { key: 'GMT +6: Dhaka, Astana ', value: 22 },
    { key: 'GMT +7: Bangkok, Hanoi, Jakarta.', value: 23 },
    { key: 'GMT +8: Beijing, Hong Kong, Singapore ', value: 24 },
    { key: 'GMT +9: Tokyo, Seoul', value: 25 },
    { key: 'GMT +10: Melbourne, Sydney ', value: 26 },
    { key: 'GMT +11: Magadon, Solomon Is.', value: 27 },
    { key: 'GMT +12: Auckland, Wellington, Fiji.', value: 28 }
  ];

  showMoreLess: Subject<boolean> = new Subject<boolean>();
  showAsPristineForm: Subject<boolean> = new Subject<boolean>();


  gridHeighCommon = {
    'max-height': '463px',
  };
  mobileCompanyNames: string[] = [];

  constructor(private _router: Router, private readonly _somyThemeService: SomythemeService, public _contactService: ContactService, private _utilityService: UtilityService, private _route: ActivatedRoute, private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _ngZone: NgZone) {
    this.baseUrl = _baseUrl + this.api;

  }

  changeCompanyId(id: number) {
    this.sendCompanyId.next(id)
  }

  sendCompanyName(name: string) {
    this.companyName.next(name)
  }

  getCompanyName() {
    return this.companyName.asObservable();
  }

  async authenticate(encryptedUser: string): Promise<CLPUser | void> {

    const a = await this.httpClient
      .get<CLPUser>(`${this.baseUrl}/Authenticate`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).toPromise().catch(err => { this.handleErrors(err) });
    return a;
  }

  async authenticateUser(encryptedUser: string, featureId: number = 0): Promise<UserResponse | void> {

    const a = await this.httpClient
      .get<UserResponse>(`${this.baseUrl}/Authenticate/${featureId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).toPromise().catch(err => { this.handleErrors(err) });
    return a;
  }

  async userToken_Signout(encryptedUser: string): Promise<SimpleResponse | void> {

    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/UserToken_Signout`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).toPromise().catch(err => { this.handleErrors(err) });
    return a;
  }

  private handleErrors(errorResponse: HttpErrorResponse) {

    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Report Agreement Summary Service Client Side Error: ', errorResponse.error.message);
    } else {
      throw errorResponse;
    }
  }

  scrollTop(el: HTMLElement) {
    $([document.documentElement, document.body]).animate({ scrollTop: el.scrollIntoView() }, 100);
  }

  handledEventEmit(value: boolean) {
    this.handledReceived.emit(value);
    this.reloadData.emit(value);
  }

  hideCommonComponentEmit(value: string) {
    this.hideCommonComponent.next(value);
  }

  handleContactSettingsEmit(value: string, settingName: string = '') {
    this.handleContactSettings.emit({ value: value, settingName: settingName });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control && field == "creditCard" && control.value != null && control.value.length >= 14) {
        control.clearValidators();
      }
      if (formGroup.status == "INVALID") {
        if (formGroup.controls.creditCard) {
          if ((formGroup.controls.creditCard.status == "INVALID") && (formGroup.controls.creditCard.value != null) && (formGroup.controls.creditCard.value.length < 14)) {
            //code here
          }
        }
      }
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.updateValueAndValidity();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  convertDictionaryToAnyType(dictionary: any[]): any[] {
    let toList: any[] = [];
    for (let key in dictionary) {
      let value = dictionary[key];
      let anyTypeObject: any = { key: parseInt(key), value: value }
      toList.push(anyTypeObject);
    }
    return toList;
  }
  convertAnyDictionaryToAnyType(dictionary: any[]): any[] {
    let toList: any[] = [];
    for (let key in dictionary) {
      let value = dictionary[key];
      let anyTypeObject: any = { key: key, value: value }
      toList.push(anyTypeObject);
    }
    return toList;
  }

  sendEmlIdToEmail(emailRec: string) {
    this.emailSubject.next(emailRec);
  }
  getEmail() {
    return this.emailSubject.asObservable();
  }
  getContactsId() {
    return this.contactIdSubject.asObservable();
  }
  sendcontactId(contactId: number) {
    this.contactIdSubject.next(contactId);
  }

  validateEmail(email) {
    const regularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var validateEmail = regularExpression.test(String(email).toLowerCase());
    if (!validateEmail)
      return false;
    else
      return true;
  }

  getContactFields(encryptedUser, contactId, companyID, userId, isLoad: boolean = false) {
    return new Observable(observer => {
      if (isLoad) {
        this._contactService.contactFields_Get(encryptedUser, contactId, companyID, userId)
          .then(async (result: ContactFieldsResponse) => {
            if (result) {
              this.contactFieldsResponse = UtilityService.clone(result);
              this.contactFields = this.contactFieldsResponse.contactFields;
              observer.next(this.contactFields);
            }
          })
          .catch((err: HttpErrorResponse) => {
            console.log(err);
            this._utilityService.handleErrorResponse(err);
          });
      }
      else
        observer.next(this.contactFields);
    });

  }

  onPaste(event) {
    const allowedRegex = /^\d*\.?\d*$/;
    if (!event.clipboardData.getData('Text').match(allowedRegex)) {
      event.preventDefault();
    }
  }

  onKeyDown(event) {
    const allowedRegex = /^\d*\.?\d*$/;
    if (!event.key.match(allowedRegex)) {
      event.preventDefault();
    }
  }

  sendContractName(name: string) {
    this.contractName.next(name);
  }

  getContractName() {
    return this.contractName.asObservable();
  }

  showMoreOrLess() {
    this.showMoreLess.next(true);
  }
  getMoreOrLess() {
    return this.showMoreLess.asObservable();
  }
  showPristneForm() {
    this.showAsPristineForm.next(true);
  }
  getPristineForm() {
    return this.showAsPristineForm.asObservable();
  }
  genericFormValidationState(formGeneric) {
    if (!isNullOrUndefined(formGeneric)) {
      formGeneric.markAsUntouched();
      formGeneric.markAsPristine();
    }
  }
  getGridHeight(height: string) {
    if (isNullOrUndefined(height)) {
      return this.gridHeighCommon;
    }
    else {
      this.gridHeighCommon = {
        'max-height': height,
      };
      return this.gridHeighCommon;
    }

  }

  changeTheme(index) {
    if (index == 1)
      this.themeChangeHandler('main');
    else if (index === 2)
      this.themeChangeHandler('silk');
    else if (index === 3)
      this.themeChangeHandler('dark');
    else
      this.themeChangeHandler('main');
  }

  themeChangeHandler(themeToSet) {
    this._somyThemeService.setTheme(themeToSet);
  }

}
