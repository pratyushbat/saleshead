import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AppointmentSetting, AppointmentSettingListResponse } from '../models/appointmentSetting.model';
import { eAppointmentSettings } from '../models/enum.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from '../shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentSettingService {

  private baseUrl: string;
  private api: string = "api/AppointmentSetting";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getAppointmentSettings(encryptedUser: string, clpCompanyId: number): Promise<AppointmentSettingListResponse | void> {
    const http$ = await this.httpClient
      .get<AppointmentSettingListResponse>(`${this.baseUrl}/AppointmentSetting_GetList/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpCompanyId - " + clpCompanyId, "AppointmentSettingService", "getAppointmentSettings") });

    return http$;
  }

  async updateAppointment(encryptedUser: string, appointmentSettings: AppointmentSetting[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/Appointment_Update`, appointmentSettings, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "appointmentSettings - " + appointmentSettings, "AppointmentSettingService", "updateAppointment") });
    return a;

  }

  async deleteAppointment(encryptedUser: string, code: number, eAppointmentSettings: eAppointmentSettings): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/Appointment_Delete/${code}/${eAppointmentSettings}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "code - " + code + "eAppointmentSettings - " + eAppointmentSettings, "AppointmentSettingService", "deleteAppointment"); });
    return a;
  }

}
