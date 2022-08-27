import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from 'oidc-client';
import { Observable } from 'rxjs';
import { c1443_CLPUserPref, CLPUser, CLPUserProfile, UserListResponse, UserResponse, UserSetupResponse, IPLog } from '../models/clpUser.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { CLPUserLock, CLPUserLockListResponse, CLPUserLockResponse } from '../models/clpUserLock.model';
import { AuditLog } from '../models/auditlog.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { catchError } from 'rxjs/operators';
import { promise } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl: string;
  private api: string = "api/User";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async authenticate(user: CLPUser): Promise<UserResponse | void> {

    const a = await this.httpClient
      .post<UserResponse>(`${this.baseUrl}/AuthenticateUser`, user, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, user, "UserService", "Authenticate"); });
    return a;
  }

  async resetPassword(user: CLPUser, r: string = ""): Promise<UserResponse | void> {
    const a = await this.httpClient
      .post<UserResponse>(`${this.baseUrl}/ResetPassword/`, user, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + r
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, user, "r = " + r, "UserService", "ResetPassword"); });
    return a;
  }

  async forgotPassword(userName: string): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/ForgotPassword/${userName}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userName - " + userName, "UserService", "ForgotPassword"); });
    return a;
  }

  async validateMobile(simpleResponse: SimpleResponse): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/ValidateMobile`, simpleResponse, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userMobile - " + simpleResponse.messageString, "UserService", "validateMobile"); });
    return a;
  }

  async authenticateR(r: string): Promise<UserResponse | void> {
    const a = await this.httpClient
      .get<UserResponse>(`${this.baseUrl}/AuthenticateR`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + r
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + r, "UserService", "AuthenticateR"); });
    return a;
  }

  sendCode(userId: number): Observable<SimpleResponse | void> {
    const http$ = this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/SendCode/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(
        delayedRetryHttp(),
        catchError(error => this._utilityService.handleErrors(error, null, "userId - " + userId, "UserService", "sendCode")),
      );
    return http$;
  }

  setDeviceId(userId: number): Observable<SimpleResponse | void> {
    const http$ = this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/SetDeviceId/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(
        delayedRetryHttp(),
        catchError(error => this._utilityService.handleErrors(error, null, "userId - " + userId, "UserService", "setDeviceId")),
      );
    return http$;
  }

  auditLog(actiontype: number, userId: number, message: string, beforeValue: string, afterValue: string) {
    let log: AuditLog = {
      actionType: actiontype,
      userId: userId,
      message: message,
      beforeValue: beforeValue,
      afterValue: afterValue
    }
    this.auditLog_Create(log);
  }

  async auditLog_Create(AuditLog): Promise<any | void> {
    const a = await this.httpClient.post<AuditLog>(`${this.baseUrl}/AuditLog/`, AuditLog, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic '
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "AuditLog - " + AuditLog, "UserService", "auditLog_Create") });
  }

  async validateDevice(userId: number, deviceId: string): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/ValidateDevice/${userId}/${deviceId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId - " + userId + "," + "deviceId - " + deviceId, "UserService", "validateDevice") });

    return http$;
  }

  async updateRWithDeviceId(r: string, deviceId: string): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/UpdateRWithDeviceId/${r}/${deviceId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + r + "," + "deviceId - " + deviceId, "UserService", "UpdateRWithDeviceId") });

    return http$;
  }

  async clpuser_Create(clpuser: CLPUser): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Clpuser_Create`, clpuser, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, clpuser, "UserService", "clpuser_Create") });

    return http$;
  }

  async getUsersSetup(encryptedUser: string, clpCompanyId: number, clpUserId: number): Promise<UserSetupResponse | void> {
    const http$ = await this.httpClient
      .get<UserSetupResponse>(`${this.baseUrl}/GetUsersSetup/${clpCompanyId}/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUserId - " + clpUserId, "UserService", "UpdateRWithDeviceId") });

    return http$;
  }

  async updateUser(encryptedUser: string, clpUser: CLPUser, clpCompanyId: number, loggedUserId: number): Promise<UserSetupResponse | void> {
    const http$ = await this.httpClient
      .post<UserSetupResponse>(`${this.baseUrl}/UserSetup_Update/${clpCompanyId}/${loggedUserId}`, clpUser, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "loggedUserId - " + loggedUserId, "UserService", "updateUser") });

    return http$;
  }

  async createUser(encryptedUser: string, clpUser: CLPUser, clpCompanyId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/UserSetup_Create/${clpCompanyId}`, clpUser, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + ",", "UserService", "createUser") });

    return http$;
  }

  async deleteUser(encryptedUser: string, clpUserId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<UserSetupResponse>(`${this.baseUrl}/Process_CLPUser_Delete/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + ",", "UserService", "deleteUser") });

    return http$;
  }

  async clpuser_GetList_Lite(encryptedUser: string, clpCompanyId: number, officideCode: number = 0, teamCode: number = 0): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/CLPUser_GetList_Lite/${clpCompanyId}/${officideCode}/${teamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "officideCode - " + officideCode + ", teamcode" + teamCode) });

    return http$;
  }

  async authenticateWelcomeR(r: string): Promise<UserResponse | void> {
    const a = await this.httpClient
      .get<UserResponse>(`${this.baseUrl}/AuthenticateWelcomeR`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + r
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + r, "UserService", "AuthenticateWelcomeR"); });
    return a;
  }


  async getUserProfile(encryptedUser: string, clpUserName: string): Promise<CLPUserProfile | void> {
    const http$ = await this.httpClient
      .get<CLPUserProfile>(`${this.baseUrl}/GetUserByUserName/${clpUserName}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUserName - " + clpUserName, "UserService", "getUserForPofileEdit") });

    return http$;
  }

  async Clpuser_Update(encryptedUser: string, clpUser: CLPUserProfile): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Clpuser_Update`, clpUser, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + clpUser , "UserService", "Clpuser_Update") });

    return http$;
  }

  async clpuser_update_signup(encryptedUser: string, clpUser: CLPUser): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Clpuser_Update_Signup`, clpUser, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + clpUser, "UserService", "Clpuser_Signup") });

    return http$;
  }

  async getUserByUserId(encryptedUser: string, clpUserId: number): Promise<CLPUserProfile | void> {
    const http$ = await this.httpClient
      .get<CLPUserProfile>(`${this.baseUrl}/GetUserByUserId/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUserId - " + clpUserId, "UserService", "getUserForPofileEdit") });

    return http$;
  }
  async getNewUserList(encryptedUser: string, clpCompanyId: number): Promise<UserListResponse | void> {
    const http$ = await this.httpClient
      .get<UserListResponse>(`${this.baseUrl}/GetNewUserList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUserId - " , "UserService", "UpdateRWithDeviceId") });

    return http$;
  }

  async getFbcclUserByUserId(encryptedUser: string, clpUserId: number): Promise<c1443_CLPUserPref | void> {
    const http$ = await this.httpClient
      .get<c1443_CLPUserPref>(`${this.baseUrl}/FBCLClpUserPref_Load/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUserId - " + clpUserId, "UserService", "getFbcclUserByUserId") });

    return http$;
  }


  createIPLog(ip: string, page: string, countryCode: string, spam: boolean, tor: boolean, city: string, detail: string): Observable<SimpleResponse | void> {
    let l: IPLog;

    l = {
      ip: ip,
      page: page,
      countryCode: countryCode,
      spam: spam,
      tor: tor,
      city: city,
      detail: detail
    };
    const httpErrorResponse = new HttpErrorResponse({});
    const http$ = this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/CreateIPLog`, l, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(
        delayedRetryHttp(),
        catchError(error => this._utilityService.handleErrors(httpErrorResponse,'User',
          'ip:' + ip
          + '<br/>page:' + page
          + '<br/>countryCode:' + countryCode
          + '<br/>spam:' + spam
          + '<br/>tor:' + tor
          + '<br/>city:' + city
          + '<br/>detail:' + detail,
          error))
      );

    return http$;
  }
}
