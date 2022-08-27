import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApptTwoDimensionResponse, ApptTypeSummaryResponse, CallActionScreenResponse, CompanyTwoDimensionResponse, ContactDisByClassifictaionResponse, ContactDisByManagerResponse, ContactTwoDimensionResponse, DistributionResponse, EmailOpenRateReportResponse, NoteTypeSummaryResponse, QualCallReportResponse, RevenueByManagerResponse, userListResponse, TxtMsgLogResponse, VoiceCallRptResponse, RevenueByMonthResponse, LeadTwoDimensionResponse, LeadInvoiceResponse, ScoreHistoryResponse, ReferrerReportResponse, ReferralReportResponse, BuzzCoreFilterResponse, BuzzScoreResponse, CLPUserFilterResponse, ClickCountResponse, ScoreCardByCode, ScorecardFilter, ScoreCardByKeyword } from '../models/report.model';
import { Contact } from '../models/contact.model';
import { EmailTemplateResponse } from '../models/emailTemplate.model';
import { ExportRequest } from '../models/exportRequest.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl: string;
  private api: string = "api/Report";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getApptTypeSummary(encryptedUser: string, clpUserID: number, clpCompanyId: number, fromDate: string, toDate: string, calType: number, appCategory: number, ddField: number): Promise<ApptTypeSummaryResponse | void> {
    const a = await this.httpClient
      .get<ApptTypeSummaryResponse>(`${this.baseUrl}/GetAppointmentTypeSummary?clpUserId=${clpUserID}&clpCompanyId=${clpCompanyId}&fromDate=${fromDate}&toDate=${toDate}&calType=${calType}&appCategory=${appCategory}&ddField=${ddField}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getApptTypeSummary"); });
    return a;
  }

  async getApptTwoDimensionFields(encryptedUser: string, clpCompanyId: number, clpUserID: number, rows: number, column: number, startDate: string, endDate: string, status: number, ddUser: number): Promise<ApptTwoDimensionResponse | void> {
    const a = await this.httpClient
      .get<ApptTwoDimensionResponse>(`${this.baseUrl}/GetApptTwoDimensionData?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&rows=${rows}&column=${column}&startDate=${startDate}&endDate=${endDate}&status=${status}&ddUser=${ddUser}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getApptTwoDimensionFields"); });
    return a;
  }
  async getApptQualCallList(encryptedUser: string, clpCompanyId: number, clpUserID: number, startDate: string, endDate: string, weekView: boolean): Promise<QualCallReportResponse | void> {
    const a = await this.httpClient
      .get<QualCallReportResponse>(`${this.baseUrl}/GetApptQualCall?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&dtStart=${startDate}&dtEnd=${endDate}&weekView=${weekView}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getApptQualCallList"); });
    return a;
  }
  async getNoteTypeSummaryList(encryptedUser: string, clpCompanyId: number, clpUserID: number, date: string, value: number): Promise<NoteTypeSummaryResponse | void> {
    const a = await this.httpClient
      .get<NoteTypeSummaryResponse>(`${this.baseUrl}/GetNoteTypeSummaryData?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&date=${date}&value=${value}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getNoteTypeSummaryList"); });
    return a;
  }
  async getClickReportList(encryptedUser: string, clpCompanyId: number, clpUserID: number, date: string): Promise<CallActionScreenResponse | void> {
    const a = await this.httpClient
      .get<CallActionScreenResponse>(`${this.baseUrl}/GetClickReport?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&date=${date}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getClickReportList"); });
    return a;
  }
  async getEmaiOpenReportList(encryptedUser: string, clpCompanyId: number, clpUserID: number, startDate: string, endDate: string, category: string): Promise<EmailOpenRateReportResponse | void> {
    const a = await this.httpClient
      .get<EmailOpenRateReportResponse>(`${this.baseUrl}/GetListEmailOpenRateDS?companyId=${clpCompanyId}&userId=${clpUserID}&startDt=${startDate}&endDt=${endDate}&category=${category}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getEmaiOpenReportList"); });
    return a;
  }

  async getCompany2DList(encryptedUser: string, clpCompanyId: number, clpUserID: number, rows: number, column: number, startDate: string, endDate: string, ddUser: string): Promise<CompanyTwoDimensionResponse | void> {
    const a = await this.httpClient
      .get<CompanyTwoDimensionResponse>(`${this.baseUrl}/GetCompanyTwoDimensionData?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&rows=${rows}&column=${column}&startDate=${startDate}&endDate=${endDate}&ddUser=${ddUser}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getCompany2DList"); });
    return a;
  }
  async getCompany2DUsers(encryptedUser: string, clpCompanyId: number, clpUserID: number, officeCode: number, teamCode: number, isOfficeMy: boolean, isTeamMy: boolean, isOfficedChecked: boolean, isTeamChecked: boolean, blnSetUser: boolean): Promise<userListResponse | void> {
    const a = await this.httpClient
      .get<userListResponse>(`${this.baseUrl}/LoadUsers?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&officeCode=${officeCode}&teamCode=${teamCode}&isTeamMy=${isTeamMy}&isOfficedChecked=${isOfficedChecked}&isTeamChecked=${isTeamChecked}&isOfficeMy=${isOfficeMy}&blnSetUser=${blnSetUser}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getCompany2DUsers"); });
    return a;
  }
  async getCompany2dReport(encryptedUser: string, clpCompanyId: number, clpUserID: number, rows: number, column: number, startDate: string, endDate: string, ddUser: string): Promise<CompanyTwoDimensionResponse | void> {
    const a = await this.httpClient
      .get<CompanyTwoDimensionResponse>(`${this.baseUrl}/CompanyTwoDimensionBindReport?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&rows=${rows}&column=${column}&startDate=${startDate}&endDate=${endDate}&selectedUser=${ddUser}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getCompany2dReport"); });
    return a;
  }

  async getDistByManager(encryptedUser: string, clpCompanyId: number, clpUserID: number): Promise<ContactDisByManagerResponse | void> {
    const a = await this.httpClient
      .get<ContactDisByManagerResponse>(`${this.baseUrl}/GetContactDisByManager?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getDistByManager"); });
    return a;
  }
  // Common for  DistributionByClassification & DistributionByManager
  async getDistributionByClassificationBindReport(encryptedUser: string, clpCompanyId: number, clpUserID: number, includeZeroes: boolean, selectedUserId: number, startDt: string, endDt: string, ddClass: number): Promise<DistributionResponse | void> {
    const a = await this.httpClient
      .get<DistributionResponse>(`${this.baseUrl}/DistributionByClassificationBindReport?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&includeZeroes=${includeZeroes}&selectedUserId=${selectedUserId}&startDt=${startDt}&endDt=${endDt}&ddClass=${ddClass}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getDistributionByClassificationBindReport"); });
    return a;
  }
  async getDistByClassification(encryptedUser: string, clpCompanyId: number, clpUserID: number): Promise<ContactDisByClassifictaionResponse | void> {
    const a = await this.httpClient
      .get<ContactDisByClassifictaionResponse>(`${this.baseUrl}/GetContactDisByClassification?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getDistByClassification"); });
    return a;
  }

  async getContactDisTwoDimension(encryptedUser: string, clpCompanyId: number, clpUserID: number): Promise<ContactTwoDimensionResponse | void> {
    const a = await this.httpClient
      .get<ContactTwoDimensionResponse>(`${this.baseUrl}/GetContactDisTwoDimension?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getContactDisTwoDimension"); });
    return a;
  }

  async getContactTwoDimensionBindReport(encryptedUser: string, clpCompanyId: number, clpUserID: number, rows: number, column: number, startDate: string, endDate: string, ddUser: string, dateFilter: string, includeZeroes: boolean = false): Promise<ContactTwoDimensionResponse | void> {
    const a = await this.httpClient
      .get<ContactTwoDimensionResponse>(`${this.baseUrl}/ContactTwoDimensionBindReport?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&ddRows=${rows}&ddColumn=${column}&startDate=${startDate}&endDate=${endDate}&selectedUser=${ddUser}&dateFilter=${dateFilter}&includeZeroes=${includeZeroes}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getContactTwoDimensionBindReport"); });
    return a;
  }

  async getTextMsgLogReport(encryptedUser: string, clpCompanyId: number, clpUserID: number, startDate: string, endDate: string, rptType: string, msgStatus: number): Promise<TxtMsgLogResponse | void> {
    const a = await this.httpClient
      .get<TxtMsgLogResponse>(`${this.baseUrl}/GetMsgLogResponse_Rpt?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&startDate=${startDate}&endDate=${endDate}&rptType=${rptType}&msgStatus=${msgStatus}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getTextMsgLogReport"); });
    return a;
  }
  async getVoiceCallSummaryReport(encryptedUser: string, clpCompanyId: number, startDate: string, endDate: string, clpUserID: number, officeCode: string, teamCode: number, strGroupBy: string): Promise<VoiceCallRptResponse | void> {
    const a = await this.httpClient
      .get<VoiceCallRptResponse>(`${this.baseUrl}/GetVoiceCallSummary_Rpt?clpCompanyId=${clpCompanyId}&startDate=${startDate}&endDate=${endDate}&clpUserId=${clpUserID}&officeCode=${officeCode}&teamCode=${teamCode}&strGroupBy=${strGroupBy}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getVoiceCallSummaryReport"); });
    return a;
  }

  async getLeadInvoiceReport(encryptedUser: string, clpCompanyId: number, startDate: string, endDate: string, clpUserID: number, leadId: number, est: number, leadStatusCode: string): Promise<LeadInvoiceResponse | void> {
    const a = await this.httpClient
      .get<LeadInvoiceResponse>(`${this.baseUrl}/GetLeadInvoiceList/${clpCompanyId}/${clpUserID}/${leadId}/${est}/${leadStatusCode}?startDate=${startDate}&endDate=${endDate}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getLeadInvoiceReport"); });
    return a;
  }


  async getProjectRevenueManager(encryptedUser: string, clpCompanyId: number, split: number, dtStart: string, dtEnd: string, timeZone: string, filterBy: number, filterValue: number) {
    const a = await this.httpClient
      .get<RevenueByManagerResponse>(`${this.baseUrl}/Bind_ProjectRevenueByManager/${clpCompanyId}/${split}/${dtStart}/${dtEnd}?timeZone=${timeZone}&filterBy=${filterBy}&filterValue=${filterValue}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ReportService", "getprojectRevenueManager"); });
    return a;

  }

  async getUsersDD(encryptedUser: string, clpCompanyId: number, clpUserID: number, officeCode: number, teamCode: number): Promise<userListResponse | void> {
    const a = await this.httpClient
      .get<userListResponse>(`${this.baseUrl}/LoadUsers?clpCompanyId=${clpCompanyId}&clpUserId=${clpUserID}&officeCode=${officeCode}&teamCode=${teamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getCompany2DUsers"); });
    return a;
  }

  async getProjectRevenueByMonth(encryptedUser: string, clpCompanyId: number, dtStart: string, dtEnd: string, filterBy: number, filterValue: number): Promise<RevenueByMonthResponse|void> {
    const a = await this.httpClient
      .get<RevenueByMonthResponse>(`${this.baseUrl}/Lead_RptRevenueByMonth/${clpCompanyId}/${dtStart}/${dtEnd}/${filterBy}/${filterValue}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ReportService", "getProjectRevenueByMonth"); });
    return a;
  }

  async getLeadTwoDimensionResponse(encryptedUser: string, clpCompanyId: number, clpUserID: number, splt: number, splt1: number, emr: number, ddFilter: string, strMeasure: string,  strStart: string, strEnd: string): Promise<LeadTwoDimensionResponse|void> {
    const a = await this.httpClient.get<LeadTwoDimensionResponse>(`${this.baseUrl}/GetLeadTwoDimensionResponse/${clpCompanyId}/${clpUserID}/${splt}/${splt1}/${emr}/${ddFilter}?strMeasure=${strMeasure}&strStart=${strStart}&strEnd=${strEnd}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ReportService", "getLeadTwoDimensionResponse"); });
    return a;
  }

  async getLeadSearchResult(encryptedUser: string, clpCompanyId: number, ur: number, strdim1: string, strdim1val: string, strdim2: string, strdim2val: string, strStart: string, strEnd: string, strDateFilter: string, rpt: string, isMgrView: boolean): Promise<LeadTwoDimensionResponse | void> {
    const a = await this.httpClient.get<LeadTwoDimensionResponse>(`${this.baseUrl}/GetLeadSearchResult/${clpCompanyId}/${ur}?&strdim1=${strdim1}&strdim1val=${strdim1val}&strdim2=${strdim2}&strdim2val=${strdim2val}&strStart=${strStart}&strEnd=${strEnd}&strDateFilter=${strDateFilter}&rpt=${rpt}&isMgrView=${isMgrView}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ReportService", "getLeadSearchResult"); });
    return a;
  }

  async getBuzzScoreResponse(encryptedUser: string, clpCompanyId: number, clpUserId: number): Promise<BuzzCoreFilterResponse | void> {
    const a = await this.httpClient.get<BuzzCoreFilterResponse>(`${this.baseUrl}/BuzzScoreFilter/${clpCompanyId}/${clpUserId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ReportService", "getBuzzScoreResponse"); });
    return a;
  }

  async getBindBuzzScoreResponse(encryptedUser: string, clpCompanyId: number, startDate: string, endDate: string, class1Code: number, class4Code: number, clpUserId: number, scoreType: number): Promise<BuzzScoreResponse | void> {
    const a = await this.httpClient.get<BuzzScoreResponse>(`${this.baseUrl}/BuzzScore_Get/${clpCompanyId}/${startDate}/${endDate}/${class1Code}/${class4Code}?clpUserId=${clpUserId}&scoreType=${scoreType}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ReportService", "getBindBuzzScoreResponse"); });
    return a;
  }

  async getScoreHistoryResponse(encryptedUser: string, contactId : number, startDate: string, endDate: string, scoreType: number): Promise<ScoreHistoryResponse | void> {
    const a = await this.httpClient.get<ScoreHistoryResponse>(`${this.baseUrl}/ScoreHistoryResponse/${contactId}?startDate=${startDate}&endDate=${endDate}&scoreType=${scoreType}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "contactId - " + contactId, "ReportService", "getScoreHistoryResponse"); });
    return a;
  }

  async getResetScoreHistory(encryptedUser: string, contactId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient.get<SimpleResponse>(`${this.baseUrl}/ResetScoreHistory/${contactId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "contactId - " + contactId, "ReportService", "getResetScoreHistory"); });
    return a;
  }

  async getDeleteScoreHistory(encryptedUser: string, contactId: number, scoreType: number, dtCreated: string): Promise<SimpleResponse | void> {
    const a = await this.httpClient.get<SimpleResponse>(`${this.baseUrl}/DeleteScoreHistory/${contactId}/${scoreType}/${dtCreated}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "contactId - " + contactId, "ReportService", "getDeleteScoreHistory"); });
    return a;
  }

  async getContactReferrerReport(encryptedUser: string, clpCompanyId: number, clpUserID: number, startDate: string, endDate: string,): Promise<ReferrerReportResponse | void> {
    const a = await this.httpClient
      .get<ReferrerReportResponse>(`${this.baseUrl}/Referrer_Get/${clpCompanyId}/${clpUserID}?startDate=${startDate}&endDate=${endDate}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getContactReferrerReport"); });
    return a;
  }

  async getContactReferralReport(encryptedUser: string, clpCompanyId: number, clpUserID: number, contactId: number, startDate: string, endDate: string,): Promise<ReferralReportResponse | void> {
    const a = await this.httpClient
      .get<ReferralReportResponse>(`${this.baseUrl}/Referral_Get/${clpCompanyId}/${contactId}/${clpUserID}?startDate=${startDate}&endDate=${endDate}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getContactReferralReport"); });
    return a;
  }

  async getUserFilterResponse(encryptedUser: string, clpCompanyId: number, clpUserID: number): Promise<CLPUserFilterResponse | void> {
    const a = await this.httpClient
      .get<CLPUserFilterResponse>(`${this.baseUrl}/CLPUserFilterResponse/${clpCompanyId}/${clpUserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getUserFilterResponse"); });
    return a;
  }

  async getExportRequestsList(encryptedUser: string, clpCompanyId: number, clpUserID: number, eStat: number, eType: number): Promise<ExportRequest[] | void> {
    const a = await this.httpClient
      .get<ExportRequest[]>(`${this.baseUrl}/ExportRequests_GetList/${clpCompanyId}/${clpUserID}?eStat=${eStat}&eType=${eType}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getExportRequestsList"); });
    return a;
  }

  async getContactSearchResult(encryptedUser: string, clpCompanyId: number, clickId: number, clpUserID: number, tagSearchType: number, contactId: number, dtStart: string, dtEnd: string, searchBy: number, noteOwnerType: number, selectedTagIds:[]): Promise<Contact[] | void> {
    const a = await this.httpClient
      .post<Contact[]>(`${this.baseUrl}/Contact_SearchResult/${clpCompanyId}?clickId=${clickId}&tagSearchType=${tagSearchType}&contactId=${contactId}&dtStart=${dtStart}&dtEnd=${dtEnd}&selectedUserId=${clpUserID}&searchBy=${searchBy}&noteOwnerType=${noteOwnerType}`, selectedTagIds, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserId - " + clpUserID, "ReportService", "getContactSearchResult"); });
    return a;
  }

  async createExportRequest(encryptedUser: string, exportRequest: ExportRequest, createExportFor: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/ExportRequest_Create?createExportFor = ${createExportFor}`, exportRequest, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "exportRequest - " + exportRequest, "ReportService", "createExportRequest"); });
    return a;
  }

  async getClickCountData(encryptedUser: string, clpCompanyId: number, dtStart: string, dtEnd: string,): Promise<ClickCountResponse | void> {
    const a = await this.httpClient
      .get<ClickCountResponse>(`${this.baseUrl}/ClickCount_Get/${clpCompanyId}?dtStart=${dtStart}&dtEnd=${dtEnd}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId + " dtStart - " + dtStart, "ReportService", "getClickCountData"); });
    return a;
  }

  async getApptSetter(encryptedUser: string, clpCompanyId: number, dtStart: string, dtEnd: string,): Promise<[] | void> {
    const a = await this.httpClient
      .get<[]>(`${this.baseUrl}/GetApptSetter/${clpCompanyId}?dtStart=${dtStart}&dtEnd=${dtEnd}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ReportService", "getApptSetter"); });
    return a;
  }

  async getScoreCardByCode(encryptedUser: string, clpCompanyId: number, clpUserID: number, officeCode: number, dtStart: string, dtEnd: string,): Promise<ScoreCardByCode[] | void> {
    const a = await this.httpClient
      .get<ScoreCardByCode[]>(`${this.baseUrl}/GetScoreCardByCode/${clpCompanyId}?clpUserID=${clpUserID}&officeCode=${officeCode}&dtStart=${dtStart}&dtEnd=${dtEnd}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserID - " + clpUserID, "ReportService", "getScoreCardByCode"); });
    return a;
  }

  async getScoreCardByKeywordFilter(encryptedUser: string, clpCompanyId: number): Promise<ScorecardFilter | void> {
    const a = await this.httpClient
      .get<ScorecardFilter>(`${this.baseUrl}/ScoreCardByKeywordFilter/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ReportService", "getScoreCardByKeywordFilter"); });
    return a;
  }
  async getScoreCardByKeyword(encryptedUser: string, clpCompanyId: number, clpUserID: number, officeCode: number, class7Code: number, class8Code: number, dtStart: string, dtEnd: string,): Promise<ScoreCardByKeyword[] | void> {
    const a = await this.httpClient
      .get<ScoreCardByKeyword[]>(`${this.baseUrl}/GetScoreCardByKeyword/${clpCompanyId}?clpUserID=${clpUserID}&officeCode=${officeCode}&class7Code=${class7Code}&class8Code=${class8Code}&dtStart=${dtStart}&dtEnd=${dtEnd}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "clpUserID - " + clpUserID, "ReportService", "getScoreCardByKeyword"); });
    return a;
  }

}
