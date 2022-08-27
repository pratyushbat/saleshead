import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { TeamCodeResponse, TeamCodes } from '../models/clpuser.model';
import { c1443_FBCET, c1443_FBCETPHItemLocation, c1443_FB_CodeBlock, c1443_FB_CodeBlockResponse, FBCEmailTemplateResponse } from '../models/emailTemplate.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { c1443_LocationResponse } from '../models/location';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class FbcEmailTemplateService {
  private baseUrl: string;
  private api: string = "api/EmailTemplate";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getTeamCode(encryptedUser: string, clpCompanyId: number): Promise<TeamCodeResponse | void> {
    const a = await this.httpClient
      .get<TeamCodeResponse>(`${this.baseUrl}/TeamCode_Get?clpCompanyId=${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "FbcEmailTemplateService", "getTeamCode"); });
    return a;
  }

  async getLocation(encryptedUser: string, teamCode: number, excludeTeamCode: number): Promise<c1443_LocationResponse | void> {
    const a = await this.httpClient
      .get<c1443_LocationResponse>(`${this.baseUrl}/Location_LoadByTeamCode?teamCode=${teamCode}&excludeTeamCode=${excludeTeamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "teamCode - " + teamCode, "FbcEmailTemplateService", "getLocation"); });
    return a;
  }

  async getFbcEmailTemplateLoad(encryptedUser: string, clpuserId: number, class5CodeID: number, isActive: boolean, search: string, isAdmin: boolean): Promise<FBCEmailTemplateResponse | void> {
    const a = await this.httpClient
      .get<FBCEmailTemplateResponse>(`${this.baseUrl}/FBCEmailTemplate_Load/${class5CodeID}?isActive=${isActive}&clpuserId=${clpuserId}&search=${search}&isAdmin=${isAdmin}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpuserId - " + clpuserId, "FbcEmailTemplateService", "getFbcEmailTemplateLoad"); });
    return a;
  }

  async getTeamDataLoad(encryptedUser: string, teamCode: number): Promise<TeamCodes | void> {
    const a = await this.httpClient
      .get<TeamCodes>(`${this.baseUrl}/TeamCode_Load/?teamCode=${teamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "teamCode - " + teamCode, "FbcEmailTemplateService", "getTeamDataLoad"); });
    return a;
  }

  async emailTemplateLoadById(encryptedUser: string, emailTemplateID: number, class5CodeID: number): Promise<c1443_FBCET | void> {
    const a = await this.httpClient
      .get<c1443_FBCET>(`${this.baseUrl}/LoadByEmailTemplateID/${emailTemplateID}/${class5CodeID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "emailTemplateID - " + emailTemplateID, "FbcEmailTemplateService", "emailTemplateLoadById"); });
    return a;
  }

  async deleteFbcTemplate(fbcetId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/FBCEmailTemplate_Delete/${fbcetId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "FbcEmailTemplateService", "deleteFbcTemplate") });

    return http$;
  }
async overWriteAllUpdate(CommandName: string, emailTemplateID: number, class5Code: number, clpUserid: number, isAdmin: boolean, teamCode: number): Promise < SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Configure_OverwriteAll_Update?CommandName=${CommandName}&emailTemplateID=${emailTemplateID}&class5Code=${class5Code}&clpUserid=${clpUserid}&isAdmin=${isAdmin}&teamCode=${teamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "FbcEmailTemplateService", "overWriteAllUpdate") });

    return http$;
  }

  async fbcTemplateLoadById(encryptedUser: string, fbcId: number): Promise<c1443_FBCET | void> {
    const a = await this.httpClient
      .get<c1443_FBCET>(`${this.baseUrl}/c1443_FBCET_Load/${fbcId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "fbcId - " + fbcId, "FbcEmailTemplateService", "fbcTemplateLoadById"); });
    return a;
  }

  async getLocationListByFbcIDLoad(encryptedUser: string, fbcId: number, locFbcId: number): Promise<c1443_FBCETPHItemLocation[] | void> {
    const a = await this.httpClient
      .get<c1443_FBCETPHItemLocation[]>(`${this.baseUrl}/GetLocationListData/${fbcId}/${locFbcId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "fbcId - " + fbcId, "FbcEmailTemplateService", "getLocationListByFbcIDLoad"); });
    return a;
  }

  async saveFbcEmailTemplate(strValue: string, FBCETPHItemID: number, LocationFBCETPHItemID: number, LocationFBCETID: number, FBCETID: number, class5Code: number, emailTemplateID: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/FBCEmailTemplate_Update?strValue=${strValue}&FBCETPHItemID=${FBCETPHItemID}&LocationFBCETPHItemID=${LocationFBCETPHItemID}&LocationFBCETID=${LocationFBCETID}&FBCETID=${FBCETID}&class5Code=${class5Code}&emailTemplateID=${emailTemplateID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "FbcEmailTemplateService", "saveFbcEmailTemplate") });

    return http$;
  }

 async makeActiveDeactive(txt: string, fbcId: number, emailTemplateId: number, class5Code: number, intDefaultFBCETID: number): Promise < SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Template_Active_Draft?txt=${txt}&fbcId=${fbcId}&emailTemplateId=${emailTemplateId}&class5Code=${class5Code}&intDefaultFBCETID=${intDefaultFBCETID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "FbcEmailTemplateService", "makeActiveDeactive") });

    return http$;
  }

  async deleteFbcPhItemTemplate(fbcePhItemtId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/FBCETPHItem_Delete/${fbcePhItemtId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "FbcEmailTemplateService", "deleteFbcPhItemTemplate") });

    return http$;
  }

  async sendEmailFbc(toEmailid: string, clpUserID: number, class5Code: number, locationFbcId: number): Promise<SimpleResponse | void> {
    const http$ = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/SendTestEmailSample?toEmailid=${toEmailid}&clpUserID=${clpUserID}&class5Code=${class5Code}&locationFbcId=${locationFbcId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "FbcEmailTemplateService", "sendEmailFbc") });

    return http$;
  }

  async getCodeBlockList(encryptedUser: string, blockType: number): Promise<c1443_FB_CodeBlockResponse | void> {
    const a = await this.httpClient
      .get<c1443_FB_CodeBlockResponse>(`${this.baseUrl}/c1443_FBCCodeBlockDD/${blockType}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "blockType - " + blockType, "FbcEmailTemplateService", "getCodeBlockList"); });
    return a;
  }

  async codeBloadLoadById(encryptedUser: string, codeBloackId: number): Promise<c1443_FB_CodeBlock | void> {
    const a = await this.httpClient
      .get<c1443_FB_CodeBlock>(`${this.baseUrl}/c1443_FBCCodeBlockLoad/${codeBloackId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "codeBloackId - " + codeBloackId, "FbcEmailTemplateService", "codeBloadLoadById"); });
    return a;
  }
}
