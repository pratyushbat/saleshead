import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SimpleResponse } from '../models/genericResponse.model';
import { CLPRights, clpRightsResponse, OutlookRights } from '../models/securitySetting.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class SecuritySettingService {
  private baseUrl: string;
  private api: string = "api/SecuritySettings";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getUserRights(encryptedUser: string, clpCompanyId: number): Promise<CLPRights[] | void> {
    const a = await this.httpClient
      .get<CLPRights[]>(`${this.baseUrl}/SecuritySettingGet/clpCompanyId?clpCompanyId=${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "SecuritySettingService", "getUserRights"); });
    return a;
  }

  async createUserRights(clpRights: CLPRights[]): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/SecuritySettingCreate`, clpRights, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, clpRights, "SecuritySettingService", "createUserRights") });

    return http$;
  }

  async getOutlookRights(encryptedUser: string, clpCompanyId: number): Promise<OutlookRights[] | void> {
    const a = await this.httpClient
      .get<OutlookRights[]>(`${this.baseUrl}/OutlookRightsGet/clpCompanyId?clpCompanyId=${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "SecuritySettingService", "getOutlookRights"); });
    return a;
  }

  async saveOutlookRights(OutlookRights: OutlookRights[]): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/OutlookRightsSave`, OutlookRights, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, OutlookRights, "SecuritySettingService", "saveOutlookRights") });

    return http$;
  }
}
