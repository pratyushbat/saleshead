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

@Injectable({
  providedIn: 'root'
})
export class ManageUserAccessService {

  private baseUrl: string;
  private api: string = "api/ManageUserAccess";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getClpUsers_Lock(encryptedUser: string, clpCompanyId: number): Promise<CLPUserLockListResponse | void> {
    const a = await this.httpClient
      .get<CLPUserLockListResponse>(`${this.baseUrl}/GetClpUsers_Lock/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser + ":UA"
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ManageUserAccessService", "GetClpUsers_Lock"); });

    return a;
  }

  async clpuser_Update_Lock(encryptedUser: string, clpUserLock: CLPUserLock): Promise<CLPUserLockResponse | void> {
    const a = await this.httpClient.post<CLPUserLock>(`${this.baseUrl}/CLPUser_Update_Lock/`, clpUserLock, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser + ":UA"
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, clpUserLock, "", "ManageUserAccessService", "CLPUser_Update_Lock"); });
    return a;
  }

  async userlock_Notification(encryptedUser: string, userName: string): Promise<any | void> {
    const a = await this.httpClient
      .get<any>(`${this.baseUrl}/UserLock_Notification/${userName}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser + ":UA"
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userName - " + userName, "ManageUserAccessService", "UserLock_Notification"); });
    return a;
  }

}
