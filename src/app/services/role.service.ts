import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SimpleResponse } from '../models/genericResponse.model';
import { RoleListResponse, RoleResponse } from '../models/roleContainer.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl: string;
  private api: string = "api/Roles";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async soRoles_get(encryptedUser: string,clpcompanyId:number): Promise<RoleListResponse | void> {
    const a = await this.httpClient
      .get<RoleListResponse>(`${this.baseUrl}/SORoles_Get/${clpcompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "RoleService", "soRoles_get"); }); //toPromise();
    return a;
  }

  async SORoles_Update(encryptedUser: string, roleResponse: RoleResponse): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<RoleResponse>(`${this.baseUrl}/SORoles_Update/`, roleResponse, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "RoleService", "SORoles_Update"); }); //toPromise();
    return a;
  }
}
