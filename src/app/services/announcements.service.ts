import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CLPAnnounce, CLPAnnounceResponse } from '../models/announcements.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementsService { 
  private baseUrl: string;
  private api: string = "api/Announce";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getAnnouncements(encryptedUser: string): Promise<CLPAnnounceResponse | void> {
    const a = await this.httpClient
      .get<CLPAnnounceResponse>(`${this.baseUrl}/CLPAnnounce_LoadList`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null,  "AnnouncementsService", "CLPAnnounce_LoadList"); });
    return a;
  }
  async deleteAnnouncements(encryptedUser: string, clpAnnounceId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .delete<SimpleResponse>(`${this.baseUrl}/CLPAnnounce_Delete/${clpAnnounceId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpAnnounceId - " + clpAnnounceId, "AnnouncementsService", "deleteAnnouncements"); });
    return a;
  }

  async updateAnnouncements(encryptedUser: string, clpAnnounce: CLPAnnounce): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/CLPAnnounce_Update`, clpAnnounce, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpAnnounce - " + clpAnnounce, "AnnouncementsService", "updateAnnouncements") });
    return a;

  }


}
