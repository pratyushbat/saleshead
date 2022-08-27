import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {  VoiceRecordingResponseIEnumerable, VoiceRecordingType } from '../models/clpuser.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class VoiceSettingService {

  private baseUrl: string;
  private api: string = 'api/VoiceRecording';

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async voiceRecording_GetList(encryptedUser: string, clpCompanyId: number): Promise<VoiceRecordingResponseIEnumerable | void> {
    const a = await this.httpClient
      .get<VoiceRecordingResponseIEnumerable>(`${this.baseUrl}/VoiceRecordingType_GetList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "VoiceSettingService", "VoiceRecording_GetList"); });
    return a;
  }

  async voiceRecording_Delete(encryptedUser: string, voiceRecordingTypeID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<VoiceRecordingResponseIEnumerable>(`${this.baseUrl}/VoiceRecordingType_Delete/${voiceRecordingTypeID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "voiceRecordingTypeID - " + voiceRecordingTypeID, "VoiceSettingService", "VoiceRecordingType_Delete"); });
    return a;
  }


  async voiceRecording_Save(encryptedUser: string, voiceRecordings: VoiceRecordingType[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/VoiceRecordingType_List_Save`, voiceRecordings, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpTeamCodes - " + voiceRecordings, "VoiceSettingService", "VoiceRecording_List_Save"); });
    return a;
  }
}
