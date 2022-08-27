import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Appt, ApptResponse } from '../models/appt.model';
import { eLeadSettings } from '../models/enum.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { LeadApptFilters, LeadDisplaySettingResponse, LeadFields, LeadFieldsResponse, LeadHistoryListResponse, LeadListResponse } from '../models/lead.model';
import { LeadSetting, LeadSettingListResponse } from '../models/leadSetting.model';
import { SearchQueryResponse } from '../models/search.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class LeadSettingService {

  private baseUrl: string;
  private api: string = "api/LeadSetting";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getLeadSettings(encryptedUser: string, clpCompanyId: number): Promise<LeadSettingListResponse | void> {
    const http$ = await this.httpClient
      .get<LeadSettingListResponse>(`${this.baseUrl}/LeadSetting_GetList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "LeadSettingService", "getLeadSettings") });

    return http$;
  }

  async updateLeadSetting(encryptedUser: string, leadSettings: LeadSetting[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/LeadSetting_Update`, leadSettings, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "leadSettings - " + leadSettings, "LeadSettingService", "updateLeadSetting") });
    return a;

  }

  async deleteLeadSetting(encryptedUser: string, code: number, eLeadSetting: eLeadSettings): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/LeadSetting_Delete/${code}/${eLeadSetting}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "code - " + code + "eLeadSetting - " + eLeadSetting, "LeadSettingService", "deleteLeadSetting"); });
    return a;
  }

  async getLeadFieldsConfiguration(encryptedUser: string, clpCompanyId: number, userId: number): Promise<LeadFieldsResponse | void> {
    const http$ = await this.httpClient
      .get<LeadFieldsResponse>(`${this.baseUrl}/LeadFields_Get_Configuration/${clpCompanyId}/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "userId - " + userId, "LeadSettingService", "getLeadFieldsConfiguration") });

    return http$;
  }

  async updateLeadFieldsConfiguration(encryptedUser: string, clpCompanyId: number, leadDisplaySettingResponse: LeadDisplaySettingResponse): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/LeadFields_UpdateConfiguration/${clpCompanyId}`, leadDisplaySettingResponse, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "leadDisplaySettingResponse - " + leadDisplaySettingResponse, "LeadSettingService", "updateLeadFieldsConfiguration") });
    return a;

  }

  async update_LeadFields(encryptedUser: string, leadFields: LeadFields, clpcompanyId: number, clpuserID: number, contactID: number, isTransferConfirm: boolean): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/LeadFields_Update/${clpcompanyId}/${clpuserID}/${contactID}/${isTransferConfirm}`, leadFields, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpcompanyId + "leadFields - " + leadFields, "LeadSettingService", "update_LeadFields") });
    return a;

  }

  async searchSaveLead(encryptedUser: string, searchQueryResponseLead: SearchQueryResponse, userId: number): Promise<LeadListResponse | void> {
    const a = await this.httpClient
      .post<any[]>(`${this.baseUrl}/Search/${userId}`, searchQueryResponseLead, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId" + userId, "LeadSettingService", "searchSaveLead"); });
    return a;
  }

  async getLeadFields(encryptedUser: string, leadId: number, clpCompanyId: number, userId: number): Promise<LeadFieldsResponse | void> {
    const http$ = await this.httpClient
      .get<LeadFieldsResponse>(`${this.baseUrl}/LeadFields_Get/${leadId}/${userId}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId + "userId - " + userId, "LeadSettingService", "getLeadFields") });

    return http$;
  }

  async getActiveLeads(encryptedUser: string, clpuserID: number, clpCompanyID: number): Promise<LeadListResponse | void> {
    const a = await this.httpClient
      .get<any[]>(`${this.baseUrl}/Lead_Get_MyActive/${clpuserID}/${clpCompanyID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId" + clpuserID, "LeadSettingService", "getActiveLeads"); });
    return a;
  }

  async getLeadHistory(encryptedUser: string, leadId: number, userId: number, clpCompanyId: number): Promise<LeadHistoryListResponse | void> {
    const a = await this.httpClient
      .get<LeadHistoryListResponse>(`${this.baseUrl}/LeadHistory_Get/${leadId}/${userId}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId" + userId, "LeadSettingService", "getLeadHistory"); });
    return a;
  }

  async leadApptFiltersGet(encryptedUser: string, clpCompanyId: number): Promise<LeadApptFilters | void> {
    const a = await this.httpClient
      .get<LeadApptFilters>(`${this.baseUrl}/Lead_QuickAppt_Get_Filters/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId" + clpCompanyId, "LeadSettingService", "leadApptFiltersGet"); });
    return a;
  }

  async leadQuickApptSave(encryptedUser: string, userId: number, clpCompanyId: number, leadId: number, appt: Appt): Promise<ApptResponse | void> {
    const a = await this.httpClient.post<ApptResponse>(`${this.baseUrl}/LeadQuickAppt_Save/${userId}/${clpCompanyId}/${leadId}`, appt, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "appt - " + appt, "LeadSettingService", "leadQuickApptSave") });
    return a;

  }

  async leadApptListGet(encryptedUser: string, userId: number, clpCompanyId: number, leadId: number): Promise<ApptResponse | void> {
    const a = await this.httpClient
      .get<ApptResponse>(`${this.baseUrl}/LeadQuickAppt_Get/${userId}/${clpCompanyId}/${leadId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId" + clpCompanyId, "LeadSettingService", "leadApptListGet"); });
    return a;
  }

  async leadFieldTitleUpdate(encryptedUser: string, clpCompanyID: number, classCodeTile: string, eLeadSetting: eLeadSettings): Promise<ApptResponse | void> {
    const a = await this.httpClient.get<ApptResponse>(`${this.baseUrl}/LeadField_ClassCodeTitle_Update/${clpCompanyID}/${classCodeTile}/${eLeadSetting}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "clpCompanyID - " + clpCompanyID + "classCodeTile - " + classCodeTile + "eLeadSetting - " + eLeadSetting, "AccountSetupService", "leadFieldTitleUpdate") });
    return a;

  }
}
