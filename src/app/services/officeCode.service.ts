import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ClpCompany, CompanyResponse } from '../models/company.model';
import { TeamCodeResponseIEnumerable, OfficeCodeResponseIEnumerable, TeamCodes, OfficeCodes } from '../models/clpuser.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class OfficeSetupService {

  private baseUrl: string;
  private api: string = 'api/OfficeCode';

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }


  async OfficeCode_GetList(encryptedUser: string, clpCompanyId: number): Promise<OfficeCodeResponseIEnumerable | void> {
    const a = await this.httpClient
      .get<OfficeCodeResponseIEnumerable>(`${this.baseUrl}/OfficeCode_GetList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "OfficeSetupService", "OfficeCode_GetList"); });
    return a;
  }
  
  async OfficeCode_Delete(encryptedUser: string, teamCode: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<TeamCodeResponseIEnumerable>(`${this.baseUrl}/OfficeCode_Delete/${teamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "teamCode - " + teamCode, "OfficeSetupService", "OfficeCode_Delete"); });
    return a;
  }
  async OfficeCode_List_Save(encryptedUser: string, clpOfficeCodes: OfficeCodes[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/OfficeCode_List_Save`, clpOfficeCodes, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpTeamCodes - " + clpOfficeCodes, "OfficeSetupService", "OfficeCode_List_Save"); });
    return a;

  }

}
