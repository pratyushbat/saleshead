import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  private baseUrl: string;
  private api: string = "api/Authenticate";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async app_Redirect(r: string): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/app_Redirect/`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + r
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r= " + r, r, "AuthenticateService", "app_Redirect"); });
    return a;
  }

}
