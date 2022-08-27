import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ClassCodes, ClassCodesDictionaryResponse, ClassCodesListResponse } from '../models/classCodes.model';
import { eClassCodes } from '../models/enum.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class ClassCodeService {

  private baseUrl: string;
  private api: string = "api/ClassCodes";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

/* service is to be replaced*/
  async getClassCodes(encryptedUser: string, clpCompanyId: number): Promise<ClassCodesListResponse | void> {
    const http$ = await this.httpClient
      .get<ClassCodesListResponse>(`${this.baseUrl}/ClassCodes_GetList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "ClassCodeService", "getClassCodes") });

    return http$;
  }

  async getClassCodesListDictionary(encryptedUser: string, clpCompanyId: number): Promise<ClassCodesDictionaryResponse | void> {
    const http$ = await this.httpClient
      .get<ClassCodesDictionaryResponse>(`${this.baseUrl}/ClassCodes_GetListDictionary/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "ClassCodeService", "getClassCodesListDictionary") });

    return http$;
  }

  async updateClassCodes(encryptedUser: string, classCodes: ClassCodes[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/ClassCodes_Update`, classCodes, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "classCodes - " + classCodes, "ClassCodeService", "updateClassCodes") });
    return a;

  }

  async deleteClassCodes(encryptedUser: string, code: number, eClassCode: eClassCodes): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/ClassCodes_Delete/${code}/${eClassCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "code - " + code + "eClassCode - " + eClassCode, "ClassCodeService", "deleteClassCodes"); });
    return a;
  }

}
