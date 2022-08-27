import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { EmailTemplateBase, EmailTemplateBaseDropdownResponse, EmailTemplateBaseIndustriesResponse, EmailTemplateBaseSeasonalResponse, EmailTemplateBaseUsageResponse, EmailTemplateLoad, EmailTemplateResponse, TagListResponse } from '../models/emailTemplate.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {
  private baseUrl: string;
  private api: string = "api/EmailTemplate";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getEmailTemplateList(encryptedUser: string, clpCompanyId: number, clpUserID: number, includeShared: boolean, isUseBee: boolean, srch: string): Promise<EmailTemplateResponse | void> {
    const a = await this.httpClient
      .get<EmailTemplateResponse>(`${this.baseUrl}/EmailTemplate_Load?includeShared=${includeShared}&clpUserID=${clpUserID}&srch=${srch}&isUseBee=${isUseBee}&clpCompanyId=${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "EmailTemplateService", "getEmailTemplateList"); });
    return a;
  }

  async getUsageIndusSeason_DropdownList(encryptedUser: string): Promise<EmailTemplateBaseDropdownResponse | void> {
    const a = await this.httpClient
      .get<EmailTemplateBaseDropdownResponse>(`${this.baseUrl}/EmailTemplateBase_Get`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "getUsageIndusSeason_DropdownList"); });
    return a;
  }

  async showEmailTemplates(encryptedUser: string, tags: string, usage: string, industries: string, seasonal: string): Promise<EmailTemplateBase[] | void> {
    const a = await this.httpClient
      .get<EmailTemplateBase[]>(`${this.baseUrl}/Template_Search?tags=${tags}&usage=${usage}&industries=${industries}&seasonal=${seasonal}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "showEmailTemplates"); });
    return a;
  }

  async loadUsageDd(encryptedUser: string, usage: string): Promise<EmailTemplateBaseUsageResponse | void> {
    const a = await this.httpClient
      .get<EmailTemplateBaseUsageResponse>(`${this.baseUrl}/Load_Usage?usage=${usage}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "loadUsageDd"); });
    return a;
  }

  async loadIndustriesDd(encryptedUser: string, usage: string): Promise<EmailTemplateBaseIndustriesResponse | void> {
    const a = await this.httpClient
      .get<EmailTemplateBaseIndustriesResponse>(`${this.baseUrl}/Load_IndustriesByUsage?usage=${usage}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "loadIndustriesDd"); });
    return a;
  }

  async loadSeasonalDd(encryptedUser: string, usage: string): Promise<EmailTemplateBaseSeasonalResponse | void> {
    const a = await this.httpClient
      .get<EmailTemplateBaseSeasonalResponse>(`${this.baseUrl}/Load_SeasonalByIndustries?usage=${usage}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "loadSeasonalDd"); });
    return a;
  }

  async saveEmailTemplate(emailTemplate: EmailTemplateLoad): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/EmailTemplate_Update`, emailTemplate, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "saveEmailTemplate") });

    return http$;
  }

  async deleteEmailTemplate(emailTemplateId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/EmailTemplate_Delete/${emailTemplateId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "deleteEmailTemplate") });

    return http$;
  }

  async getEmailTemplateById(encryptedUser: string, emailTemplateId: number): Promise<EmailTemplateLoad | void> {
    const a = await this.httpClient
      .get<EmailTemplateLoad>(`${this.baseUrl}/EmailTemplate_LoadByID/${emailTemplateId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "emailTemplateId - " + emailTemplateId, "EmailTemplateService", "getEmailTemplateById") });
    return a;
  }

  async getTagsList(encryptedUser: string): Promise<TagListResponse | void> {
    const a = await this.httpClient
      .get<TagListResponse>(`${this.baseUrl}/GetTagList`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "getTagsList"); });
    return a;
  }

  async showBaseEmailTemplates(encryptedUser: string, isMailMergeTemplate: boolean): Promise<EmailTemplateBase[] | void> {
    const a = await this.httpClient
      .get<EmailTemplateBase[]>(`${this.baseUrl}/Get_TemplateBaseInit?isMailMergeTemplate=${isMailMergeTemplate}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "EmailTemplateService", "Get_TemplateBaseInit"); });
    return a;
  }
}
