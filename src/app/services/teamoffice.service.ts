import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ClpCompany, CompanyResponse } from '../models/company.model';
import { TeamCodeResponseIEnumerable, OfficeCodeResponseIEnumerable, TeamCodes, TeamOfficeSetting } from '../models/clpuser.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class TeamOfficeSetupService {

  private baseUrl: string;
  private api: string = 'api/TeamCode';

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async teamCode_GetList(encryptedUser: string, clpCompanyId: number): Promise<TeamCodeResponseIEnumerable | void> {
    const a = await this.httpClient
      .get<TeamCodeResponseIEnumerable>(`${this.baseUrl}/TeamCode_GetList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "TeamOfficeSetupService", "TeamCode_GetList"); });
    return a;
  }

  async teamCode_Delete(encryptedUser: string, teamCode: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/TeamCode_Delete/${teamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "teamCode - " + teamCode, "TeamOfficeSetupService", "TeamCode_Delete"); });
    return a;
  }
  async teamCode_List_Save(encryptedUser: string, clpTeamCodes: TeamCodes[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/TeamCode_List_Save`, clpTeamCodes, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpTeamCodes - " + clpTeamCodes, "TeamOfficeSetupService", "TeamCode_List_Save"); });
    return a;
  }

  async teamOfficeSetting_Get(encryptedUser: string, clpCompanyId: number): Promise<TeamOfficeSetting | void> {
    const a = await this.httpClient
      .get<TeamOfficeSetting>(`${this.baseUrl}/TeamOfficeSetting_Get/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "TeamOfficeSetupService", "TeamOfficeSetting"); });
    return a;
  }

  async teamOfficeSetting_Update(encryptedUser: string, cLPCompanyID: number, flag: number, value: boolean): Promise<TeamOfficeSetting | void> {
    const a = await this.httpClient
      .post<TeamOfficeSetting>(`${this.baseUrl}/TeamOfficeSetting_Update?cLPCompanyID=${cLPCompanyID}&flag=${flag}&value=${value}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + cLPCompanyID, "TeamOfficeSetupService", "TeamOfficeSetting_Update"); });
    return a;
  }

}
