import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ScoreCardByTeamFilterResponse } from '../models/scoreCardByTeam.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class ScoreCardTeamService {
  private baseUrl: string;
  private api: string = "api/ScoreCardByTeam";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getScoreCardTeamFilter(encryptedUser: string, clpUserID: number, clpCompanyId: number, eType: number, eStat: number): Promise<ScoreCardByTeamFilterResponse | void> {
    const a = await this.httpClient
      .get<ScoreCardByTeamFilterResponse>(`${this.baseUrl}/ScoreCardByTeamFilters_Get/${clpCompanyId}/${clpUserID}/${eStat}/${eType}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ScoreCardTeamService", "getScoreCardTeamFilter"); });
    return a;
  }
} 
