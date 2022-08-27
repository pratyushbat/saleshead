import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from 'oidc-client';
import { Observable } from 'rxjs';
import { CLPUser, UserResponse } from '../models/clpUser.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { CLPUserLock, CLPUserLockListResponse, CLPUserLockResponse } from '../models/clpUserLock.model';
import { AuditLog } from '../models/auditlog.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { catchError } from 'rxjs/operators';
import { promise } from 'protractor';
import { SignupDuplicateCheck, SignupMsg, SignupMsgResponse } from '../models/signupMsg.model';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  private baseUrl: string;
  private api: string = "api/SignupMsg";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async createSignupMsg(signupMsg: SignupMsg): Promise<SignupMsgResponse | void> {
    const a = await this.httpClient
      .post<SignupMsgResponse>(`${this.baseUrl}/SignupMsg_create`, signupMsg, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userMobile - " + signupMsg, "SignupMsg", "createSignupMsg"); });
    return a;
  }

  async verifySecurityCode(signupMsgId: number, securityCode: string): Promise<SignupMsgResponse | void> {
    const a = await this.httpClient
      .get<SignupMsgResponse>(`${this.baseUrl}/VerifySecurityCode/${signupMsgId}/${securityCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userName - " + signupMsgId + " securityCode - " + securityCode, "SignupMsg", "verifySecurityCode"); });
    return a;
  }

  async cLPUser_DuplicateCheck(signupDupicate: SignupDuplicateCheck): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/CLPUser_DuplicateCheck`, signupDupicate, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "signupDupicate - " + signupDupicate, "SignupMsg", "cLPUser_DuplicateCheck"); });
    return a;
  }

}
