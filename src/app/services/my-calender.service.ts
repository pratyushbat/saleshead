import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CalenderResponse, CalenderFiltersResponse } from '../models/calender.model';
import { eCalenderView, eMailingStatus, eApptStatus, eTaskStatus } from '../models/enum.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable()
export class MyCalenderService {
  private baseUrl: string;
  private api: string = "api/Calender";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async calenderDataByMonth(encryptedUser: string, clpCompanyId: number, userId: number, forMonth: number, eMailingStatus, eApptStatus, dtStart): Promise<CalenderResponse | void> {
    const a = await this.httpClient
      .get<CalenderResponse>(`${this.baseUrl}/CalenderData_timeWise/${clpCompanyId}/${userId}/${forMonth}?mailStatus=${eMailingStatus}&&apptStatus=${eApptStatus}&&dtEnd=''&&dtStart=${dtStart}&&taskStatus=0`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser + ":UA"
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId + "userId - " + userId + "forMonth - " + forMonth + "forMonth - " + eMailingStatus + "eApptStatus - " + eApptStatus, "MyCalenderService", "calenderDataByMonth"); });

    return a;
  }

  async calenderFilters(encryptedUser: string, clpuserID: number, clpCompanyId: number): Promise<CalenderFiltersResponse | void> {
    const a = await this.httpClient.get<CalenderFiltersResponse>(`${this.baseUrl}/Calender_Get_Filters/${clpCompanyId}/${clpuserID}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "r - " + encryptedUser + "," + "clpUser - " + "MyCalenderService", "calenderFilters") });
    return a;
  }

  async calenderDataGet(encryptedUser: string, clpuserID: number, clpCompanyId: number, selectedTeamCode: number, selectedofficeCode: number, selectedMonth: string, calenderView: eCalenderView, selectedUserID: number, mailStatus: eMailingStatus, apptStatus: eApptStatus, taskStatus: eTaskStatus, selectCalDate: SimpleResponse): Promise<CalenderResponse | void> {
    const a = await this.httpClient.post<CalenderResponse>(`${this.baseUrl}/CalenderData_Get/${clpuserID}/${clpCompanyId}/${selectedTeamCode}/${selectedofficeCode}/${selectedMonth}/${calenderView}/${selectedUserID}/${mailStatus}/${apptStatus}/${taskStatus}`, selectCalDate, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId + "clpuserID - " + clpuserID + "selectedTeamCode - " + selectedTeamCode + "selectedofficeCode - " + selectedofficeCode + "selectedMonth - " + selectedMonth + "calenderView - " + calenderView + "selectedUserID - " + selectedUserID + "mailStatus - " + mailStatus + "apptStatus - " + apptStatus + "taskStatus - " + taskStatus + "selectCalDate - " + selectCalDate, "MyCalenderService", "calenderDataGet"); });
    return a;

  }


}

