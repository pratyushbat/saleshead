import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BulckAction, BulkActionResponse } from '../models/bulkActionContact';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class BulkActionContactService {
  private baseUrl: string;
  private api: string = "api/Account";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }
  async getBulkActionDropdown(encryptedUser: string): Promise<BulkActionResponse | void> {
    const a = await this.httpClient
      .get<BulkActionResponse>(`${this.baseUrl}/EditField_Get`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null,  "BulkActionContactService", "getCustomActionList"); });
    return a;
  }

  async updateBulkContacts(encryptedUser: string, clpUserID: number, syncCode: number, editType: number, clpCompanyID: number, bulckAction: BulckAction): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Contacts_Update?clpUserID=${clpUserID}&syncCode=${syncCode}&editType=${editType}&clpCompanyID=${clpCompanyID}`, bulckAction, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "BulkActionContactService", "updateBulkContacts"); });
    return a;
  }
  async getBulkContactsDelete(encryptedUser: string, clpUserID: number, clpCompanyID: number, supportLogin:number,clpSSID: number, bulckAction: BulckAction): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/ProcessDelete/${clpUserID}/${clpCompanyID}?supportLogin=${supportLogin}&clpSSID=${clpSSID}`, bulckAction, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "BulkActionContactService", "getBulkContactsDelete"); });
    return a;
  }
  async transferBulkContacts(encryptedUser: string, clpUserID: number, clpCompanyID: number, bulckAction: BulckAction): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/ProcessTransfer/${clpUserID}/${clpCompanyID}`, bulckAction, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "BulkActionContactService", "transferBulkContacts"); });
    return a;
  }
}
