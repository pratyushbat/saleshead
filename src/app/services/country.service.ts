import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from 'oidc-client';
import { Observable } from 'rxjs';
import { CLPUser, CLPUserProfile, UserResponse, UserSetupResponse } from '../models/clpUser.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { CLPUserLock, CLPUserLockListResponse, CLPUserLockResponse } from '../models/clpUserLock.model';
import { AuditLog } from '../models/auditlog.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { catchError } from 'rxjs/operators';
import { promise } from 'protractor';
import { CountryListResponse } from '../models/country.model';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';

@Injectable({
  providedIn: 'root'
})
export class CountryService {


  private baseUrl: string;
  private api: string = "api/Country";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }


  async getCountryList(): Promise<CountryListResponse | void> {
    const http$ = await this.httpClient
      .get<CountryListResponse>(`${this.baseUrl}/Country_Get`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'

        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + "," + "clpUser - " + "CountryService", "getCountryList") });

    return http$;
  }

  loadIpApi(): Observable<any | void> {
    const http$ = this.httpClient
      .get<any>('https://iplist.cc/api').pipe(
        delayedRetryHttp(),
        catchError(error => this._utilityService.handleErrors(error, "CountryService", "loadIpApi"))
      );

    return http$;
  }

  replaceZero(value) {
    let final = '';

    for (let i = 0; i < value.length; i++) {
      if (value[i] == ' ') {
        final += ' ';
      }
      else {
        if (!isNaN(+value[i])) {
          final += '0';
        }
        else {
          final += value[i];
        }
      }
    }

    return final;
  }
  parseSimplePhone(phone: string, dialCode: CountryCode) {
    if (phone && phone != '') {
      try {
        const phoneNumber = parsePhoneNumber(phone, dialCode);
        let value = phoneNumber.formatNational();
        if (value.startsWith('0'))
          value = value.replace('0', '');
        return value;
      }
      catch {
        return phone;
      }
    }
    else
      return '';
  }

}
