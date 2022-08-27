import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from 'oidc-client';
import { Observable } from 'rxjs';
import { GridColumnsConfiguration, GridColumnsConfigurationByUserResponse, GridColumnsConfigurationResponse } from '../models/gridColumnsConfiguration.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { catchError } from 'rxjs/operators';
import { promise } from 'protractor';
import { SimpleResponse } from '../models/genericResponse.model';

@Injectable({
  providedIn: 'root'
})
export class GridColumnsConfigurationService {

  private baseUrl: string;
  private _baseUrl: string;
  private api: string = "api/GridColumnsConfiguration";
  private apiContact: string = "api/Contact";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
    this._baseUrl = _baseUrl + this.apiContact;
  }

  async createGridColumnsConfiguration(encryptedUser: string, gridColumnsConfiguration: GridColumnsConfiguration): Promise<GridColumnsConfigurationResponse | void> {
    const a = await this.httpClient.post<GridColumnsConfigurationResponse>(`${this.baseUrl}/GridColumnsConfiguration_Create/`, gridColumnsConfiguration, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, gridColumnsConfiguration, "", "GridColumnsConfigurationService", "createGridColumnsConfiguration"); });
    return a;
  }

  async getGridColumnsConfiguration(encryptedUser: string, clpUserId: number, tableName: string): Promise<GridColumnsConfigurationResponse | void> {
    const a = await this.httpClient
      .get<GridColumnsConfigurationResponse>(`${this.baseUrl}/GetGridColumnsConfiguration/${clpUserId}/${tableName}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "GridColumnsConfigurationService", "getGridColumnsConfiguration"); }); //toPromise();
    return a;
  }

  async getGridColumnsConfigurationUser(encryptedUser: string, clpUserId: number): Promise<GridColumnsConfigurationByUserResponse | void> {
    const a = await this.httpClient
      .get<GridColumnsConfigurationResponse>(`${this.baseUrl}/GetGridColumnsConfigurationByUser/${clpUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "GridColumnsConfigurationService", "getGridColumnsConfigurationUser"); }); //toPromise();
    return a;
  }

  async deleteGridColumnsConfiguration(encryptedUser: string, cLPUserID: number, tableName: string): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this._baseUrl}/GridColumnsConfiguration_Delete/${cLPUserID}/${tableName}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "GridColumnsConfigurationService", "deleteGridColumnsConfiguration"); }); //toPromise();
    return a;
  }
}
