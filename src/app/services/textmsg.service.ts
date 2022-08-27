import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { SimpleResponse } from '../models/genericResponse.model';
import { TxtMsgSettings, TxtMsgSettingsResponse } from '../models/txtMsg.model';

@Injectable({
  providedIn: 'root'
})
export class TxtMsgService {

  private baseUrl: string;
  private api: string = "api/TxtMsgSettings";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }
  async txtMsgSettings_Load(encryptedUser: string, clpcompnayId: number, clpuserId : number): Promise<TxtMsgSettingsResponse | void> {
    const a = await this.httpClient
      .get<TxtMsgSettingsResponse>(`${this.baseUrl}/TxtMsgSettings_Load/${clpcompnayId}/${clpuserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpcompnayId, "TxtMsgService", "TxtMsgSettings_Load"); });
    return a;
  } 
  
  async txtMsgSettings_Save(encryptedUser: string, TxtMsgSettingsData: TxtMsgSettings): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/TxtMsgSettings_Save`, TxtMsgSettingsData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + TxtMsgSettingsData, "TxtMsgService", "TxtMsgSettings_Save") });
    return a;

  }

  async textMsgSettingDelete(encryptedUser: string, clpcompnayId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/TxtMsgSetting_Delete/${clpcompnayId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + "TxtMsgService", "textMsgSettingDelete") });
    return a;

  }

}
