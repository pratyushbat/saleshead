import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { eDDField, eGoalType, eGoalTypeCategory } from '../models/enum.model';
import { GoalData, GoalDisplay, GoalSetupRespnose } from '../models/goalSetup.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private baseUrl: string;
  private api: string = "api/Goal";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getGeneralData(encryptedUser: string, clpUserId: number, eGType: eGoalType): Promise<GoalSetupRespnose | void> {
    const a = await this.httpClient
      .get<GoalSetupRespnose>(`${this.baseUrl}/GetGeneralData/${clpUserId}/${eGType}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpUserId - " + clpUserId + " eGType - " + eGType, "GoalsService", "getGeneralData"); });
    return a;
  }

  async getApptGeneral(encryptedUser: string, clpUserId: number, clpCompanyId: number, _eddfld: eDDField, eGT: eGoalType): Promise<GoalSetupRespnose | void> {
    const a = await this.httpClient
      .get<GoalSetupRespnose>(`${this.baseUrl}/GetApptGeneral/${clpUserId}/${clpCompanyId}/${_eddfld}/${eGT}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpUserId - " + clpUserId + "clpCompanyId - " + clpCompanyId + "_eddfld - " + _eddfld + " eGT - " + eGT, "GoalsService", "getApptGeneral"); });
    return a;
  }

  async saveGoal(encryptedUser: string, listGoal: GoalData[]): Promise<boolean | void> {
    const a = await this.httpClient
      .post<boolean>(`${this.baseUrl}/SaveGoal`, listGoal, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, " ", "GoalsService", "saveGoal"); });
    return a;
  }

  async getGoalList(encryptedUser: string, clpUserId: number, ownerId: number = 0, eGT: eGoalTypeCategory, _eddfld: eDDField = eDDField.Unknown, reportMonth: number, reportYear: number): Promise<GoalDisplay[] | void> {
    const a = await this.httpClient
      .get<GoalDisplay[]>(`${this.baseUrl}/GetGoalList/${clpUserId}/${ownerId}/${eGT}/${_eddfld}/${reportMonth}/${reportYear}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpUserId - " + clpUserId + "ownerId - " + ownerId + "_eddfld - " + _eddfld + " eGT - " + eGT + " reportMonth - " + reportMonth + " reportYear - " + reportYear, "GoalsService", "getGoalList"); });
    return a;
  }

}
