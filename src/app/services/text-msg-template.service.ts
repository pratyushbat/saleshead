import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SimpleResponse } from '../models/genericResponse.model';
import { TxtMsgTemplateResponse, TxtMsgTemplate } from '../models/textMsgTemplate.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class TextMsgTemplateService {
  private baseUrl: string;
  private api: string = "api/TxtMsgTemplate";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;

  }
  async getTextMsgTemplateList(encryptedUser: string, clpCompanyId: number, cLPUserId: number, strisAdvanced: string): Promise<TxtMsgTemplateResponse | void> {
    const a = await this.httpClient
      .get<TxtMsgTemplateResponse>(`${this.baseUrl}/TxtMsgTemplateData_Get/${clpCompanyId}/${cLPUserId}/${strisAdvanced}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "TextMsgTemplateService", "getTextMsgTemplateList"); });
    return a;
  }
  async saveTextMsgTemplate(encryptedUser: string, selectedValue: number, txtMsgTemplate: TxtMsgTemplate): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/TxtMsgTemplate_Update`, txtMsgTemplate, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + txtMsgTemplate, "TextMsgTemplateService", "saveTextMsgTemplate") });
    return a;
  }
  async textMsgTemplateDelete(encryptedUser: string, txtMsgTemplateID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/TxtMsgTemplate_Delete/${txtMsgTemplateID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser 
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "txtMsgTemplateID - " + txtMsgTemplateID, "TextMsgTemplateService", "textMsgTemplateDelete"); });
    return a;
  }
}
