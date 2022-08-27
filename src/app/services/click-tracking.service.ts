import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delayedRetryHttp } from './shared/delayedRetry';
import { ClickTrackingResponse, Click, ClickModelView } from '../models/clickTracking.model';
import { UtilityService } from './shared/utility.service';
import { SimpleResponse } from '../models/genericResponse.model';

@Injectable({
  providedIn: 'root'
})
export class ClickTrackingService {
  private baseUrl: string;
  private api: string = "api/Click";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }
  async getClickTrackingList(encryptedUser: string, clpCompanyId: number, cLPUserId: number): Promise<ClickModelView[] | void> {
    const a = await this.httpClient
      .get<ClickModelView[]>(`${this.baseUrl}/BindClickData/${clpCompanyId}/${cLPUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ClickTrackingService", "getClickTrackingList"); });
    return a;
  }
  async getClickTrackingLoad(encryptedUser: string, clpCompanyId: number, cLPUserId: number, clickID: number): Promise<ClickTrackingResponse | void> {
    const a = await this.httpClient
      .get<ClickTrackingResponse>(`${this.baseUrl}/ClickTracking_Load/${clpCompanyId}/${cLPUserId}/${clickID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ClickTrackingService", "getClickTrackingLoad"); });
    return a;
  }

  async saveClickTrackingData(encryptedUser: string, Click: Click): Promise<ClickTrackingResponse | void> {
    const a = await this.httpClient.post<ClickTrackingResponse>(`${this.baseUrl}/ClickTracking_Save`, Click, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + Click, "ClickTrackingService", "saveClickTrackingData") });
    return a;
  }

  async deleteClickTrackingData(encryptedUser: string, clickID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/ClickTracking_Delete?clickId=${clickID}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clickID - " + clickID, "ClickTrackingService", "deleteClickTrackingData") });
    return a;
  }
}
