import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { TaskListResponse, Task, TaskResponse, TaskDocListResponse } from '../models/task.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { TextMsgFiltersResponse } from '../models/textMsgFilters.model';
import { TxtMsg, TxtMsgResponse } from '../models/txtMsg.model';

@Injectable({
  providedIn: 'root'
})
export class OutBoundTextMsgService {

  private baseUrl: string;
  private api: string = "api/OutBoundTextMsg";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getTextMsgFilters(encryptedUser: string, clpCompanyId: number, cLPUserID: number, contactId: number): Promise<TextMsgFiltersResponse | void> {
    const a = await this.httpClient
      .get<TextMsgFiltersResponse>(`${this.baseUrl}/Get_TextMsg_Filters/${clpCompanyId}/${cLPUserID}/${contactId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundTextMsgService", "getTextMsgFilters"); });
    return a;
  }

  async sendMessage(encryptedUser: string, txtMsg: TxtMsg): Promise<TxtMsgResponse | void> {    
    const a = await this.httpClient.post<TxtMsgResponse>(`${this.baseUrl}/SendMessage`, txtMsg, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundTextMsgService", "sendMessage"); });
    return a;
  }
}
