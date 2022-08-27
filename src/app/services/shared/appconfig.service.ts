import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppConfig, ConfigDetails, ConfigDetailsWithKey } from '../../models/appConfig.model';
import { delayedRetryHttp } from '../../shared/delayedRetry';

@Injectable({
  providedIn: 'root'
})
export class AppconfigService {

  private baseUrl: string = '';
  private api: string = "api/AppConfig";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string) {
    this.baseUrl = _baseUrl + this.api;
  }

  private handleErrors(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('App Config Service Client Side Error: ', errorResponse.error.message);
    } else {
      console.error('App Config Service Server Side Error: ', errorResponse);
    }

    return throwError("There is a problem with the service. We are notified & working on it. Please try again later.");
  }

  getAppConfig(encryptedUser: string): Observable<AppConfig> {
    return this.httpClient
      .get<AppConfig>(this.baseUrl, {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + encryptedUser
        })
      })
      .pipe(
        delayedRetryHttp(),
        catchError(error => this.handleErrors(error))
      );
  }

  async getAppConfigValue(encryptedUser: string, configValue: string): Promise<ConfigDetails | void> {
    const a = await this.httpClient
      .get<ConfigDetails>(`${this.baseUrl}/GetConfigKeyValue/${configValue}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { });
    return a;
  }

  async getAppConfigValues(encryptedUser: string, configValues: string[]): Promise<ConfigDetails | void> {
    const a = await this.httpClient
      .post<ConfigDetailsWithKey[]>(`${this.baseUrl}/GetConfigKeyValues/`, configValues, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { });
    return a;
  }
}
