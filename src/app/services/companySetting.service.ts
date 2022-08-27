import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CompanySetting, CompanySettingListResponse } from '../models/companySetting.model';
import { eClassCodes, eCompanySettings } from '../models/enum.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class CompanySettingService {

  private baseUrl: string;
  private api: string = "api/CompanySetting";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getCompanySettings(encryptedUser: string, clpCompanyId: number): Promise<CompanySettingListResponse | void> {
    const http$ = await this.httpClient
      .get<CompanySettingListResponse>(`${this.baseUrl}/CompanySetting_GetList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "CompanySettingService", "getCompanySettings") });

    return http$;
  }

  async updateCompanySetting(encryptedUser: string, companySettings: CompanySetting[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/CompanySetting_Update`, companySettings, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "companySettings - " + companySettings, "CompanySettingService", "updateCompanySetting") });
    return a;

  }
 
  async deleteCompanySetting(encryptedUser: string, code: number, eCompanySetting: eCompanySettings): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/CompanySetting_Delete/${code}/${eCompanySetting}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "code - " + code + "eCompanySetting - " + eCompanySetting, "CompanySettingService", "deleteCompanySetting"); });
    return a;
  }

}
