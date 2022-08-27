import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SimpleResponse } from '../models/genericResponse.model';
import { TagsMgmt, TagsFields } from '../models/tag-settings.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class TagSettingService {
  private baseUrl: string;
  private api: string = "api/Tag";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }
  async tagGetListByCLPCompanyWithCount(encryptedUser: string, cLPCompanyID: number, ownerType: number): Promise<TagsMgmt | void> {
    const a = await this.httpClient
      .get<TagsMgmt>(`${this.baseUrl}/Tag_GetListByCLPCompanyWithCount/${cLPCompanyID}/${ownerType}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + cLPCompanyID, "TagSettingService", "Tag_GetListByCLPCompanyWithCount"); });
    return a;
  }

  async tagUpdate(encryptedUser: string, TagsFields: TagsFields): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/Tag_Update`, TagsFields, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + TagsFields, "TagSettingService", "Tag_Update") });
    return a;

  }

  async tagDelete(encryptedUser: string, tagID: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/Tag_Delete/${tagID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + ",", "TagSettingService", "Tag_Delete") });

    return http$;
  }


  }

