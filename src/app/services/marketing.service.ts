import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SimpleResponse } from '../models/genericResponse.model';
import { BEEResponse, MailMergeTemplateLoad, Marketing_MailMergeResponse } from '../models/marketing.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class MarketingService {
  private baseUrl: string;
  private api: string = "api/EmailTemplate";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getMailMergeTemplateList(encryptedUser: string, clpCompanyId: number, clpUserId: number, selectedUserId: number, strisAdvanced: string): Promise<Marketing_MailMergeResponse | void> {
    const a = await this.httpClient
      .get<Marketing_MailMergeResponse>(`${this.baseUrl}/MailMergeTemplateData_Get/${clpCompanyId}/${clpUserId}/${selectedUserId}/${strisAdvanced}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserId, "MarketingService", "getMailMergeTemplateList"); });
    return a;
  }

  async getBEEEmailConfig(encryptedUser: string): Promise<BEEResponse | void> {
    const a = await this.httpClient
      .get<BEEResponse>(`${this.baseUrl}/GetBEEEmailConfig`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "MarketingService", "getBEEEmailConfig"); });
    return a;
  }

  async saveMailMergeTemplate(mailMergeTemplateLoad: MailMergeTemplateLoad): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/MailMergeTemplate_Save`, mailMergeTemplateLoad, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "MarketingService", "saveMailMergeTemplate") });

    return http$;
  }

  async deleteMailMergeTemplate(mailMergeTemplateId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/MailMergeTemplate_Delete/${mailMergeTemplateId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "MarketingService", "deleteMailMergeTemplate") });

    return http$;
  }

  async loadMailMergeTemplate(encryptedUser: string, mailMergeTemplateId: number): Promise<MailMergeTemplateLoad | void> {
    const a = await this.httpClient
      .get<MailMergeTemplateLoad>(`${this.baseUrl}/MailMergeTemplate_Load/${mailMergeTemplateId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "mailMergeTemplateId - " + mailMergeTemplateId, "MarketingService", "loadMailMergeTemplateList"); });
    return a;
  }
}
