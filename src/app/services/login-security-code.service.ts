import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { LoginSecurityCodeResponse } from '../models/loginSecurityCode.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class LoginSecurityCodeService {

  private baseUrl: string;
  private api: string = "api/LoginSecurityCode";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getLoginSecurityCode(loginSecurityCodeId: string, securityCode: string): Promise<LoginSecurityCodeResponse | void> {
    const a = await this.httpClient
      .get<LoginSecurityCodeResponse>(`${this.baseUrl}/VerifySecurityCode/${loginSecurityCodeId}/${securityCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "LoginSecurityCodeService", "getLoginSecurityCode"); });
    return a;
  }
}
