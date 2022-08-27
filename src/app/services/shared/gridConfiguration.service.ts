import { Injectable, Inject, EventEmitter, NgZone, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { UtilityService } from './utility.service';
import { GridColumnsConfiguration, GridColumnsConfigurationResponse } from '../../models/gridColumnsConfiguration.model';
import { SortDescriptor } from '@progress/kendo-data-query';
import { GridColumnsConfigurationService } from '../gridColumnsConfiguration.service';
import { isNullOrUndefined } from 'util';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CLPUser } from '../../models/clpuser.model';
import { take } from 'rxjs/operators';
declare var $: any;
@Injectable()
export class GridConfigurationService implements OnInit {

  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;

  private baseUrl: string;
  private api: string = "api/Authentication";

  columns: any;
  gridColumnsConfigurationResponse: GridColumnsConfigurationResponse;
  gridColumnsConfig: GridColumnsConfiguration;
  gridColumnsConfiguration: GridColumnsConfiguration;
  sortingColumn: string = '';
  reorderColumnName: string = '';
  columnWidth: string = '';
  arrColumnWidth: any[] = [];
  hiddenColumns: string[] = [];
  arrSortingColumn: any[] = [];
  gridColumnMenuRemovedArr: any[] = [];
  mobileView: number = 768;

  public sort: SortDescriptor[] = [];
  public skip = 0;
  public pageSize = 10;
  mobileCompanyNames: string[] = [];
  

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string,
    public ngZone: NgZone,
    private _router: Router,
    private _utilityService: UtilityService,
    public _gridColumnsConfigurationService: GridColumnsConfigurationService,
  ) {
    this.baseUrl = _baseUrl + this.api;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token")))
      this.encryptedUser = localStorage.getItem("token");
    else
      this._router.navigate(['/unauthorized']);
  }

  getResponsiveGridColums(tableName: string): string[] {
    switch (tableName) {
      case 'webform_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['formName', 'cTCampaignTemplateID', 'cLPUserID', 'status'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['formName', 'cLPUserID','status'];
        else
          this.mobileCompanyNames = ['formName', 'cLPUserID','status'];
      break;

      case 'repSettingGrid':
         this.mobileCompanyNames = ['contractName', 'mailMergeTemplateID'];
      break;

      case 'rep_setting_grid':      
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['contractName', 'mailMergeTemplateID', 'sOSCID'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['mailMergeTemplateID', 'contractName'];
        else
          this.mobileCompanyNames = ['contractName', 'mailMergeTemplateID'];
      break;

      case 'email_open_rate_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['emailType', 'sentDate', 'opened', 'all', 'subject'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['subject','emailType', 'sentDate', 'opened'];
        else
          this.mobileCompanyNames = ['subject','emailType', 'sentDate','opened'];
      break;

      case 'contact_excel_process_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['name', 'owner', 'email', 'classification'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['name', 'owner'];
        else
          this.mobileCompanyNames = ['name', 'owner'];
        break;

      case 'company_excel_process_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['companyName', 'clpUserDisplay', 'webSite', 'systemNote'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['companyName', 'clpUserDisplay'];
        else
          this.mobileCompanyNames = ['companyName', 'clpUserDisplay'];
        break;

      case 'email_template_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['templateName', 'dtCreated', 'previewTemplate', 'userLastFirst'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['templateName', 'dtCreated', 'previewTemplate', 'userLastFirst'];
        else
          this.mobileCompanyNames = ['templateName', 'dtCreated', 'previewTemplate', 'userLastFirst'];
        break;

      case 'mail_merge_template_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['templateName', 'userLastFirst', 'mailMergeTemplateID', 'dtCreated'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['templateName', 'userLastFirst', 'shareable', 'dtCreated'];
        else
          this.mobileCompanyNames = ['templateName', 'userLastFirst', 'shareable', 'dtCreated'];
        break;

      case 'custom_action_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024 )
          this.mobileCompanyNames = ['formName', 'user', 'showEditContactLink', 'dtCreated'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['formName', 'user'];
        else
          this.mobileCompanyNames = ['formName', 'user'];
      break;

      case 'fbc_email_template_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['templateName', 'emailTemplateID', 'locationisActive', 'status'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['templateName', 'status'];
        else
          this.mobileCompanyNames = ['templateName', 'status'];
      break;


      case 'ticket_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['ticketID', 'userLastFirst', 'ticketCategory', 'ticketStatus'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['ticketID', 'ticketCategory'];
        else
          this.mobileCompanyNames = ['ticketID', 'ticketCategory'];
      break;

      case 'admin_company_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['clpCompanyID', 'companyName', 'clpRole', 'status'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['clpCompanyID', 'companyName'];
        else
          this.mobileCompanyNames = ['clpCompanyID', 'companyName'];
      break;

      case 'user_pref_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['userDisplay', 'userCode', 'txtMsgLongCode', 'callForwardAPID'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['userDisplay', 'userCode'];
        else
          this.mobileCompanyNames = ['userDisplay', 'userCode'];
      break;

      case 'contact_restore_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['userDisplay', 'userCode', 'txtMsgLongCode', 'callForwardAPID'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['userDisplay', 'userCode'];
        else
          this.mobileCompanyNames = ['companyName', 'phone'];
      break;

      case 'text_msg_template_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['templateName', 'userName', 'messageText', 'dtCreated'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['templateName', 'userName'];
        else
          this.mobileCompanyNames = ['templateName', 'userName'];
      break;

      case 'my_documents_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['userName', 'documentType', 'documentCategory', 'dtCreated'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['userName', 'documentType'];
        else
          this.mobileCompanyNames = ['userName', 'documentType'];
      break;

      case 'outlook_addin_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['userRole', 'lastFirst', 'userCode', 'adminStatus'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['lastFirst', 'status'];
        else
          this.mobileCompanyNames = ['lastFirst', 'status'];
      break;

      case 'email_dropbox_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['cLPUserID', 'cLPCompanyID', 'username', 'status'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['cLPUserID', 'cLPCompanyID'];
        else
          this.mobileCompanyNames = ['cLPUserID', 'cLPCompanyID'];
      break;

      case 'announcement_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['announceTitle', 'cLPCompanyID', 'dtCreated', 'status'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['announceTitle', 'cLPCompanyID'];
        else
        this.mobileCompanyNames = ['announceTitle', 'cLPCompanyID'];
      break;

      case 'contact_map_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['name', 'phone', 'username', 'dtCreatedDisplay'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['name', 'phone'];
        else
          this.mobileCompanyNames = ['phone', 'name'];
      break;

      case 'user_setup_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['userName', 'firstName', 'cLPUserID', 'status'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['userName', 'userRole', '','lastName', 'firstName'];
        else
          this.mobileCompanyNames = ['userName', 'userRole', '', 'lastName', 'firstName'];
      break;

      case 'lead_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['companyName', 'ufirstName', 'dtModified', 'dtCreated'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['companyName', 'ufirstName','leadDesc'];
        else
          this.mobileCompanyNames = ['companyName', 'ufirstName','leadDesc'];
      break;

      case 'active_lead_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['companyName', 'ufirstName', 'dtModified', 'dtCreated'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['companyName', 'ufirstName'];
        else
          this.mobileCompanyNames = ['companyName', 'ufirstName'];
      break;

      case 'click_tracking_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['click', 'replacementURL', 'sfaSettings', 'score'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['click', 'replacementURL'];
        else
          this.mobileCompanyNames = ['click', 'replacementURL'];
      break;

      case 'company_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['companyName', 'phone', 'dtCreated', 'dtModified'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['companyName', 'phone'];
        else
          this.mobileCompanyNames = ['companyName', 'phone'];
      break;

      case 'email_mailing_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['phone', 'companyName', 'userName', 'dtModifiedDisplay'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['phone', 'companyName'];
        else
          this.mobileCompanyNames = ['phone', 'companyName'];
      break;

      case 'contact_bulk_action_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['companyName', 'phone', 'dtCreatedDisplay', 'dtModifiedDisplay'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['companyName', 'phone'];
        else
          this.mobileCompanyNames = ['companyName', 'phone'];
      break;

      case 'contactGrid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['companyName', 'phone', 'name', 'dtModifiedDisplay'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['name', 'phone'];
        else
          this.mobileCompanyNames = ['name', 'phone'];
      break;

      case 'contract_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['companyName', 'contractName', 'dtCreated', 'dtSigned'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['companyName', 'contractName'];
        else
          this.mobileCompanyNames = ['companyName', 'contractName'];
      break;

      case 'activity_log_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['userName', 'cLPSSID', 'clpLogType', 'note'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['userName', 'cLPSSID'];
        else
          this.mobileCompanyNames = ['userName', 'cLPSSID'];
      break;

      case 'billing_history_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['txnAmount', 'txnType', 'dtCreated', 'status'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['txnAmount', 'status'];
        else
          this.mobileCompanyNames = ['txnAmount', 'status'];
      break;

      case 'contractGrid':       
        this.mobileCompanyNames = ['companyName', 'contractName'];
      break;

      case 'appt_type_summary_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['display', 'pending', 'completed', 'cancelled'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['display', 'pending'];
        else
          this.mobileCompanyNames = ['display', 'pending'];
      break;

      case 'appt_type_summary_YTD_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['display', 'pending', 'completed', 'cancelled'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['display', 'completed'];
        else
          this.mobileCompanyNames = ['display', 'completed'];
      break;

      case 'project_manager_revenue_grid':
        if ($(window).width() >= 768 && $(window).width() <= 1024)
          this.mobileCompanyNames = ['revenue', 'leads', 'probability', 'split'];
        else if ($(window).width() < 768)
          this.mobileCompanyNames = ['leads', 'revenue'];
        else
          this.mobileCompanyNames = ['leads', 'revenue'];
        break;

      default:
        this.mobileCompanyNames = ['phone'];
      break;
    }
    return this.mobileCompanyNames;
  }
  iterateConfigGrid(response, gridType) {
    var columnWidths = this.gridColumnsConfig.columnWidth;
    var columnWidthsArr = columnWidths.split(',');
    var sortingColumns = this.gridColumnsConfig.sortingColumn;
    var sortingColumnsArr = [];
    if (sortingColumns)
      sortingColumnsArr = sortingColumns.split(',');
    if (!isNullOrUndefined(response)) {
      if (this.gridColumnsConfig) {
        if (this.gridColumnsConfig.reorderColumnName) {
          var reorderColumns = this.gridColumnsConfig.reorderColumnName;
          var reorderColumnsArr = reorderColumns.split(',');
          this.hiddenColumns = [];
          var isHiddenColumn: boolean = false;
          if (reorderColumnsArr.length > 0) {
            for (var i = 0; i < reorderColumnsArr.length; i++) {
              if (reorderColumnsArr[i].includes(':h')) {
                isHiddenColumn = true;
                var field = reorderColumnsArr[i].split(':')[0];
                this.hiddenColumns.push(field);
              }
            }
          }
          this.reorderColumnConfig(isHiddenColumn, reorderColumnsArr, columnWidthsArr, gridType);
        }
        else if (this.gridColumnsConfig.actualColumns) {
          var actualColumn = this.gridColumnsConfig.actualColumns;
          var actualColumnsArr = actualColumn.split(',');
          this.reorderColumnConfig(false, actualColumnsArr, columnWidthsArr, gridType);
        }
        if (sortingColumnsArr.length > 0) {
          for (var k = 0; k < sortingColumnsArr.length; k++) {
            var dir: any = sortingColumnsArr[k].split(':')[1];
            if (dir == 'undefined')
              dir = undefined;
            this.sort.push({ field: sortingColumnsArr[k].split(':')[0], dir: dir });
          }
        }
      }
      this.showSpinner = false;
      this.gridColumnMenuRemovedArr = this.columns;
    } else {
      this.showSpinner = false;
      this.gridColumnMenuRemovedArr = this.columns;
    }
  }


  reorderColumnConfig(isHiddenColumn, reorderColumnsArr, columnWidthsArr, gridType) {
    switch (gridType) {
      case "admin_company_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '50' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'clpCompanyID' ? width = '70' : reorderColumnsArr[i] == 'companyName' ? width = '870' : reorderColumnsArr[i] == 'status' ? width = '150' : reorderColumnsArr[i] == 'clpRole' ? width = '150' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'clpCompanyID' ? 'Id' : reorderColumnsArr[i] == 'companyName' ? 'Account' : reorderColumnsArr[i] == 'clpRole' ? 'Version' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '50' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'clpCompanyID' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '870' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'clpRole' ? width = '150' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'clpCompanyID' ? 'Id' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Account' : reorderColumnsArr[i].split(':')[0] == 'clpRole' ? 'Version' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "account_storage_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            /* { field: '$', title: '', width: '50' },*/
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'firstName' ? width = '70' : reorderColumnsArr[i] == 'spaceUsed' ? width = '800' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'firstName' ? 'User' : reorderColumnsArr[i] == 'spaceUsed' ? 'Space Used (in MBs)' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            /* { field: '$', title: '', width: '50' },*/
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'firstName' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'spaceUsed' ? width = '800' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'firstName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'spaceUsed' ? 'Space Used (in MBs)' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "webform_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'formName' ? width = '150' : reorderColumnsArr[i] == 'link' ? width = '100' : reorderColumnsArr[i] == 'cTCampaignTemplateID' ? width = '200' : reorderColumnsArr[i] == 'allowDuplicates' ? width = '25' : reorderColumnsArr[i] == 'cLPUserID' ? width = '60' : reorderColumnsArr[i] == 'status' ? width = '60' : reorderColumnsArr[i] == 'dtCreated' ? width = '60' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'formName' ? 'Form Name' : reorderColumnsArr[i] == 'link' ? 'Link Code' : reorderColumnsArr[i] == 'cTCampaignTemplateID' ? 'Campaign Trigger Settings' : reorderColumnsArr[i] == 'allowDuplicates' ? 'Dupicates' : reorderColumnsArr[i] == 'cLPUserID' ? 'Default Owners' : reorderColumnsArr[i] == 'status' ? 'Status' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'formName' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'link' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'cTCampaignTemplateID' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'allowDuplicates' ? width = '25' : reorderColumnsArr[i].split(':')[0] == 'cLPUserID' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '60' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'formName' ? 'Form Name' : reorderColumnsArr[i].split(':')[0] == 'link' ? 'Link Code' : reorderColumnsArr[i].split(':')[0] == 'cTCampaignTemplateID' ? 'Campaign Trigger Settings' : reorderColumnsArr[i].split(':')[0] == 'allowDuplicates' ? 'Dupicates' : reorderColumnsArr[i].split(':')[0] == 'cLPUserID' ? 'Default Owners' : reorderColumnsArr[i].split(':')[0] == 'status' ? 'Status' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }

        break;
      }
      case "announcement_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'announceTitle' ? width = '500' : reorderColumnsArr[i] == 'dtCreated' ? width = '40' : reorderColumnsArr[i] == 'dtExpires' ? width = '40' : reorderColumnsArr[i] == 'status' ? width = '40' : reorderColumnsArr[i] == 'cLPCompanyID' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'announceTitle' ? 'Announcement' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i] == 'dtExpires' ? 'Expires' : reorderColumnsArr[i] == 'status' ? 'Status' : reorderColumnsArr[i] == 'cLPCompanyID' ? 'Account' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
          this.columns.push({ field: '$$', title: 'Action', width: '100' });
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'announceTitle' ? width = '500' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'dtExpires' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'cLPCompanyID' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'announceTitle' ? 'Announcement' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0] == 'dtExpires' ? 'Email Address' : reorderColumnsArr[i].split(':')[0] == 'status' ? 'Status' : reorderColumnsArr[i].split(':')[0] == 'cLPCompanyID' ? 'Account' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
          this.columns.push({ field: '$$', title: 'Action', width: '100' });
        }

        break;
      }
      case "user_setup_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$$', title: ' ', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'cLPUserID' ? width = '50' : reorderColumnsArr[i] == 'lastName' ? width = '70' : reorderColumnsArr[i] == 'firstName' ? width = '70' : reorderColumnsArr[i] == 'officeCode' ? width = '110' : reorderColumnsArr[i] == 'teamCode' ? width = '110' : reorderColumnsArr[i] == 'userName' ? width = '70' : reorderColumnsArr[i] == 'timeZone' ? width = '70' : reorderColumnsArr[i] == 'dateFormat' ? width = '70' : reorderColumnsArr[i] == 'userRole' ? width = '70' : reorderColumnsArr[i] == 'status' ? width = '200' : reorderColumnsArr[i] == 'changePW' ? width = '200' : reorderColumnsArr[i] == 'isShowCP' ? width = '200' : reorderColumnsArr[i] == 'isAllowDownload' ? width = '200' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'cLPUserID' ? 'User Code' : reorderColumnsArr[i] == 'lastName' ? 'Last Name' : reorderColumnsArr[i] == 'firstName' ? 'First Name' : reorderColumnsArr[i] == 'officeCode' ? 'Office' : reorderColumnsArr[i] == 'teamCode' ? 'Team' : reorderColumnsArr[i] == 'userName' ? 'User Name' : reorderColumnsArr[i] == 'timeZone' ? 'Time Zone' : reorderColumnsArr[i] == 'dateFormat' ? 'Date Format' : reorderColumnsArr[i] == 'userRole' ? 'Type' : reorderColumnsArr[i] == 'status' ? 'Status' : reorderColumnsArr[i] == 'changePW' ? 'Change PW' : reorderColumnsArr[i] == 'isShowCP' ? ' Show CP ' : reorderColumnsArr[i] == 'isAllowDownload' ? 'Allow Download' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$$', title: ' ', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'cLPUserID' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'lastName' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'firstName' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'officeCode' ? width = '110' : reorderColumnsArr[i].split(':')[0] == 'teamCode' ? width = '110' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'timeZone' ? width = '70' : reorderColumnsArr[i] == 'dateFormat' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'userRole' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'changePW' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'isShowCP' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'isAllowDownload' ? width = '200' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'cLPUserID' ? 'User Code' : reorderColumnsArr[i].split(':')[0] == 'lastName' ? 'Last Name' : reorderColumnsArr[i].split(':')[0] == 'firstName' ? 'First Name' : reorderColumnsArr[i].split(':')[0] == 'officeCode' ? 'Office' : reorderColumnsArr[i].split(':')[0] == 'teamCode' ? 'Team' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User Name' : reorderColumnsArr[i].split(':')[0] == 'timeZone' ? 'Time Zone' : reorderColumnsArr[i].split(':')[0] == 'dateFormat' ? 'Date Format' : reorderColumnsArr[i].split(':')[0] == 'userRole' ? 'Type' : reorderColumnsArr[i].split(':')[0] == 'status' ? 'Status' : reorderColumnsArr[i].split(':')[0] == 'changePW' ? 'Change PW' : reorderColumnsArr[i].split(':')[0] == 'isShowCP' ? 'Show CP' : reorderColumnsArr[i].split(':')[0] == 'isAllowDownload' ? 'Allow Download' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }

        break;
      }
      case "billing_history_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '70' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'dtCreated' ? width = '170' : reorderColumnsArr[i] == 'txnType' ? width = '270' : reorderColumnsArr[i] == 'txnDescription' ? width = '800' : reorderColumnsArr[i] == 'txnAmount' ? width = '250' : reorderColumnsArr[i] == 'status' ? width = '270' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'dtCreated' ? 'Date' : reorderColumnsArr[i] == 'txnType' ? 'Type' : reorderColumnsArr[i] == 'txnDescription' ? 'Description' : reorderColumnsArr[i] == 'txnAmount' ? 'Amount' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '70' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '170' : reorderColumnsArr[i].split(':')[0] == 'txnType' ? width = '270' : reorderColumnsArr[i].split(':')[0] == 'txnDescription' ? width = '800' : reorderColumnsArr[i].split(':')[0] == 'txnAmount' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '270' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Date' : reorderColumnsArr[i].split(':')[0] == 'txnType' ? 'Type' : reorderColumnsArr[i].split(':')[0] == 'txnDescription' ? 'Description' : reorderColumnsArr[i].split(':')[0] == 'txnAmount' ? 'Amount' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }

        break;
      }
      case "tag_setting_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'tag' ? width = '800' : reorderColumnsArr[i] == 'contact' ? width = '250' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'tag' ? 'Tag' : reorderColumnsArr[i] == 'contact' ? 'Contact' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'tag' ? width = '800' : reorderColumnsArr[i].split(':')[0] == 'contact' ? width = '250' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'tag' ? 'Tag' : reorderColumnsArr[i].split(':')[0] == 'contact' ? 'Contact' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "contract_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'companyName' ? width = '60' : reorderColumnsArr[i] == 'contractName' ? width = '60' : reorderColumnsArr[i] == 'dtCreated' ? width = '60' : reorderColumnsArr[i] == 'dtExpires' ? width = '60' : reorderColumnsArr[i] == 'dtSigned' ? width = '60' : reorderColumnsArr[i] == 'pH_Spot1' ? width = '300' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company Name' : reorderColumnsArr[i] == 'contractName' ? 'Contract Name' : reorderColumnsArr[i] == 'dtCreated' ? 'Created Date' : reorderColumnsArr[i] == 'dtExpires' ? 'Expiry Date' : reorderColumnsArr[i] == 'dtSigned' ? 'Date Signed' : reorderColumnsArr[i] == 'pH_Spot1' ? 'PH Spot 1' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'contractName' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'dtExpires' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'dtSigned' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'pH_Spot1' ? width = '300' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company Name' : reorderColumnsArr[i].split(':')[0] == 'contractName' ? 'Contract Name' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created Date' : reorderColumnsArr[i].split(':')[0] == 'dtExpires' ? 'Expiry Date' : reorderColumnsArr[i].split(':')[0] == 'dtSigned' ? 'Date Signed' : reorderColumnsArr[i].split(':')[0] == 'pH_Spot1' ? 'PH Spot 1' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "rep_setting_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'contractName' ? width = '200' : reorderColumnsArr[i] == 'mailMergeTemplateID' ? width = '200' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'contractName' ? 'Contract' : reorderColumnsArr[i] == 'mailMergeTemplateID' ? 'Mail Merge Template' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'contractName' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'mailMergeTemplateID' ? width = '200' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'contractName' ? 'Contract' : reorderColumnsArr[i].split(':')[0] == 'mailMergeTemplateID' ? 'Mail Merge Template' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "click_tracking_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'destinationURL' ? width = '200' : reorderColumnsArr[i] == 'clickURL' ? width = '200' : reorderColumnsArr[i] == 'sfaSettings' ? width = '40' : reorderColumnsArr[i] == 'score' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'destinationURL' ? 'Click' : reorderColumnsArr[i] == 'clickURL' ? 'Replacement URL' : reorderColumnsArr[i] == 'sfaSettings' ? 'SFA' : reorderColumnsArr[i] == 'score' ? 'Score' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'destinationURL' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'clickURL' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'sfaSettings' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'score' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'destinationURL' ? 'Click' : reorderColumnsArr[i].split(':')[0] == 'clickURL' ? 'Replacement URL' : reorderColumnsArr[i].split(':')[0] == 'sfaSettings' ? 'SFA' : reorderColumnsArr[i].split(':')[0] == 'score' ? 'Score' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "appt_type_summary_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'display' ? width = '200' : reorderColumnsArr[i] == 'pending' ? width = '40' : reorderColumnsArr[i] == 'completed' ? width = '40' : reorderColumnsArr[i] == 'cancelled' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'display' ? 'Type' : reorderColumnsArr[i] == 'pending' ? 'Pending' : reorderColumnsArr[i] == 'completed' ? 'Completed' : reorderColumnsArr[i] == 'cancelled' ? 'Cancelled' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'display' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'pending' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'completed' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'cancelled' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'display' ? 'Type' : reorderColumnsArr[i].split(':')[0] == 'pending' ? 'Pending' : reorderColumnsArr[i].split(':')[0] == 'completed' ? 'Completed' : reorderColumnsArr[i].split(':')[0] == 'cancelled' ? 'Cancelled' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "appt_type_summary_YTD_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'display' ? width = '200' : reorderColumnsArr[i] == 'pending' ? width = '40' : reorderColumnsArr[i] == 'completed' ? width = '40' : reorderColumnsArr[i] == 'cancelled' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'display' ? 'Type' : reorderColumnsArr[i] == 'pending' ? 'Pending' : reorderColumnsArr[i] == 'completed' ? 'Completed' : reorderColumnsArr[i] == 'cancelled' ? 'Cancelled' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'display' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'pending' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'completed' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'cancelled' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'display' ? 'Type' : reorderColumnsArr[i].split(':')[0] == 'pending' ? 'Pending' : reorderColumnsArr[i].split(':')[0] == 'completed' ? 'Completed' : reorderColumnsArr[i].split(':')[0] == 'cancelled' ? 'Cancelled' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "email_open_rate_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'subject' ? width = '100' : reorderColumnsArr[i] == 'emailType' ? width = '90' : reorderColumnsArr[i] == 'all' ? width = '40' : reorderColumnsArr[i] == 'opened' ? width = '40' : reorderColumnsArr[i] == 'openRate' ? width = '40' : reorderColumnsArr[i] == 'sentDate' ? width = '60' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'subject' ? 'Subject' : reorderColumnsArr[i] == 'emailType' ? 'Email Type' : reorderColumnsArr[i] == 'all' ? 'All' : reorderColumnsArr[i] == 'opened' ? 'Opened' : reorderColumnsArr[i] == 'openRate' ? 'Open Rate' : reorderColumnsArr[i] == 'sentDate' ? 'Sent Date' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'subject' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'emailType' ? width = '90' : reorderColumnsArr[i].split(':')[0] == 'all' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'opened' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'openRate' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'sentDate' ? width = '60' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'subject' ? 'Subject' : reorderColumnsArr[i].split(':')[0] == 'emailType' ? 'Email Type' : reorderColumnsArr[i].split(':')[0] == 'all' ? 'All' : reorderColumnsArr[i].split(':')[0] == 'opened' ? 'Opened' : reorderColumnsArr[i].split(':')[0] == 'openRate' ? 'Open Rate' : reorderColumnsArr[i].split(':')[0] == 'sentDate' ? 'Sent Date' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "custom_action_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'formName' ? width = '170' : reorderColumnsArr[i] == 'showEditContactLink' ? width = '60' : reorderColumnsArr[i] == 'showAddToComments' ? width = '60' : reorderColumnsArr[i] == 'showAddToHistory' ? width = '60' : reorderColumnsArr[i] == 'bulkAppt' ? width = '30' : reorderColumnsArr[i] == 'user' ? width = '30' : reorderColumnsArr[i] == 'dtCreated' ? width = '30' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'formName' ? 'Name' : reorderColumnsArr[i] == 'showEditContactLink' ? 'Show Edit Contact Button' : reorderColumnsArr[i] == 'showAddToComments' ? 'Show Add To Comments Text Box' : reorderColumnsArr[i] == 'showAddToHistory' ? 'Show Add To History Button' : reorderColumnsArr[i] == 'bulkAppt' ? 'Bulk Appt' : reorderColumnsArr[i] == 'user' ? 'User' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'formName' ? width = '170' : reorderColumnsArr[i].split(':')[0] == 'showEditContactLink' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'showAddToComments' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'showAddToHistory' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'bulkAppt' ? width = '30' : reorderColumnsArr[i].split(':')[0] == 'user' ? width = '30' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '30' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'formName' ? 'Name' : reorderColumnsArr[i].split(':')[0] == 'showEditContactLink' ? 'Show Edit Contact Button' : reorderColumnsArr[i].split(':')[0] == 'showAddToComments' ? 'Show Add To Comments Text Box' : reorderColumnsArr[i].split(':')[0] == 'showAddToHistory' ? 'Show Add To History Button' : reorderColumnsArr[i].split(':')[0] == 'bulkAppt' ? 'Bulk Appt' : reorderColumnsArr[i].split(':')[0] == 'user' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "text_msg_template_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'templateName' ? width = '120' : reorderColumnsArr[i] == 'messageText' ? width = '300' : reorderColumnsArr[i] == 'userName' ? width = '40' : reorderColumnsArr[i] == 'shareable' ? width = '40' : reorderColumnsArr[i] == 'dtCreated' ? width = '30' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'templateName' ? 'Template Name' : reorderColumnsArr[i] == 'messageText' ? 'Message Text' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'shareable' ? 'Sharing' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'templateName' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'messageText' ? width = '300' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'shareable' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '30' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'templateName' ? 'Template Name' : reorderColumnsArr[i].split(':')[0] == 'messageText' ? 'Message Text' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'shareable' ? 'Sharing' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "referrer_report_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'firstName' ? width = '300' : reorderColumnsArr[i] == 'count' ? width = '60' : reorderColumnsArr[i] == 'email' ? width = '30' : reorderColumnsArr[i] == 'amazon' ? width = '60' : reorderColumnsArr[i] == 'companyName' ? width = '60' : reorderColumnsArr[i] == 'userName' ? width = '60': reorderColumnsArr[i] == 'dtCreated' ? width = '30' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'firstName' ? 'Referrer Contact Name' : reorderColumnsArr[i] == 'count' ? '# Referrals' : reorderColumnsArr[i] == 'email' ? '' : reorderColumnsArr[i] == 'amazon' ? 'Amazon' : reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'dtCreated' ? 'Date Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'firstName' ? width = '300' : reorderColumnsArr[i].split(':')[0] == 'count' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '30' : reorderColumnsArr[i].split(':')[0] == 'amazon' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '30' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'firstName' ? 'Referrer Contact Name' : reorderColumnsArr[i].split(':')[0] == 'count' ? '# Referrals' : reorderColumnsArr[i].split(':')[0] == 'email' ? '' : reorderColumnsArr[i].split(':')[0] == 'amazon' ? 'Amazon' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Date Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "user_pref_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'userCode' ? width = '100' : reorderColumnsArr[i] == 'userDisplay' ? width = '100' : reorderColumnsArr[i] == 'txtMsgLongCode' ? width = '100' : reorderColumnsArr[i] == 'isCallForwardingLine' ? width = '150' : reorderColumnsArr[i] == 'callForwardAPID' ? width = '150' :
                reorderColumnsArr[i] == 'isClickToCallLine' ? width = '150' : reorderColumnsArr[i] == 'isVCREnabled' ? width = '100' : reorderColumnsArr[i] == 'isVoiceDropLine' ? width = '100' : reorderColumnsArr[i] == 'isKMLEnabled' ? width = '150' : reorderColumnsArr[i] == 'isSOLeadGen' ? width = '100' :
                  reorderColumnsArr[i] == 'isSingleSignOn' ? width = '150' : reorderColumnsArr[i] == 'isVIPEnabled' ? width = '100' : reorderColumnsArr[i] == 'isSGVIPEnabled' ? width = '150' : '';
            this.columns.push({
              field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'userCode' ? 'User Code' : reorderColumnsArr[i] == 'userDisplay' ? 'Name' : reorderColumnsArr[i] == 'txtMsgLongCode' ? 'SMS Long Code' :
                reorderColumnsArr[i] == 'isCallForwardingLine' ? 'Enable Call Forwarding' : reorderColumnsArr[i] == 'callForwardAPID' ? 'Call Forward Prod Id' : reorderColumnsArr[i] == 'isClickToCallLine' ? 'Enable Click-To-Call' :
                  reorderColumnsArr[i] == 'isVCREnabled' ? 'Call Recording' : reorderColumnsArr[i] == 'isVoiceDropLine' ? 'Enable Voice Drop' : reorderColumnsArr[i] == 'isKMLEnabled' ? 'Enable Map Creation' :
                    reorderColumnsArr[i] == 'isSOLeadGen' ? 'Lead Gen Services' : reorderColumnsArr[i] == 'isSingleSignOn' ? 'Enable Single Sign-One' : reorderColumnsArr[i] == 'isVIPEnabled' ? 'Enable Slidecast' :
                      reorderColumnsArr[i] == 'isSGVIPEnabled' ? 'Enable SG-Slidecast' : reorderColumnsArr[i], width: width != '' ? width : ''
            });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'userCode' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'userDisplay' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'txtMsgLongCode' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'isCallForwardingLine' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'callForwardAPID' ? width = '150' :
                reorderColumnsArr[i].split(':')[0] == 'isClickToCallLine' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'isVCREnabled' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'isVoiceDropLine' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'isKMLEnabled' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'isSOLeadGen' ? width = '100' :
                  reorderColumnsArr[i].split(':')[0] == 'isSingleSignOn' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'isVIPEnabled' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'isSGVIPEnabled' ? width = '150' : '';
            this.columns.push({
              field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'userCode' ? 'User Code' : reorderColumnsArr[i].split(':')[0] == 'userDisplay' ? 'Name' : reorderColumnsArr[i].split(':')[0] == 'txtMsgLongCode' ? 'SMS Long Code' :
                reorderColumnsArr[i].split(':')[0] == 'isCallForwardingLine' ? 'Enable Call Forwarding' : reorderColumnsArr[i].split(':')[0] == 'callForwardAPID' ? 'Call Forward Prod Id' : reorderColumnsArr[i].split(':')[0] == 'isClickToCallLine' ? 'Enable Click-To-Call' :
                  reorderColumnsArr[i].split(':')[0] == 'isVCREnabled' ? 'Call Recording' : reorderColumnsArr[i].split(':')[0] == 'isVoiceDropLine' ? 'Enable Voice Drop' : reorderColumnsArr[i].split(':')[0] == 'isKMLEnabled' ? 'Enable Map Creation' :
                    reorderColumnsArr[i].split(':')[0] == 'isSOLeadGen' ? 'Lead Gen Services' : reorderColumnsArr[i].split(':')[0] == 'isSingleSignOn' ? 'Enable Single Sign-One' : reorderColumnsArr[i].split(':')[0] == 'isVIPEnabled' ? 'Enable Slidecast' :
                      reorderColumnsArr[i].split(':')[0] == 'isSGVIPEnabled' ? 'Enable SG-Slidecast' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : ''
            });
          }
        }
        break;
      }
      case "ticket_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'ticketID' ? width = '60' : reorderColumnsArr[i] == 'ticketDesc' ? width = '350' : reorderColumnsArr[i] == 'finder' ? width = '70' : reorderColumnsArr[i] == 'fixer' ? width = '80' : reorderColumnsArr[i] == 'dtLastModified' ? width = '100' : reorderColumnsArr[i] == 'ticketCategory' ? width = '80' : reorderColumnsArr[i] == 'ticketStatus' ? width = '80' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'ticketID' ? 'Ticket' : reorderColumnsArr[i] == 'ticketDesc' ? 'Description/Response' : reorderColumnsArr[i] == 'finder' ? 'Finder' : reorderColumnsArr[i] == 'fixer' ? 'Reply By' : reorderColumnsArr[i] == 'dtLastModified' ? 'Last Modified' : reorderColumnsArr[i] == 'ticketCategory' ? 'Category' : reorderColumnsArr[i] == 'ticketStatus' ? 'Status' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'ticketID' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'ticketDesc' ? width = '350' : reorderColumnsArr[i].split(':')[0] == 'finder' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'fixer' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'dtLastModified' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'ticketCategory' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'ticketStatus' ? width = '80' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'ticketID' ? 'Ticket' : reorderColumnsArr[i].split(':')[0] == 'ticketDesc' ? 'Description/Response' : reorderColumnsArr[i].split(':')[0] == 'finder' ? 'Finder' : reorderColumnsArr[i].split(':')[0] == 'fixer' ? 'Reply By' : reorderColumnsArr[i].split(':')[0] == 'dtLastModified' ? 'Last Modified' : reorderColumnsArr[i].split(':')[0] == 'ticketCategory' ? 'Category' : reorderColumnsArr[i].split(':')[0] == 'ticketStatus' ? 'Status' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "outlook_addin_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'userCode' ? width = '90' : reorderColumnsArr[i] == 'lastFirst' ? width = '90' : reorderColumnsArr[i] == 'userRole' ? width = '66' : reorderColumnsArr[i] == 'primaryAddMap' ? width = '110' : reorderColumnsArr[i] == 'otherAddMap' ? width = '100' : reorderColumnsArr[i] == 'outlookPluginVersion' ? width = '80' : reorderColumnsArr[i] == 'allowSyncContact' ? width = '130' : reorderColumnsArr[i] == 'allowSyncAppt' ? width = '115' : reorderColumnsArr[i] == 'allowSyncEmail' ? width = '115' : reorderColumnsArr[i] == 'adminStatus' ? width = '66' : reorderColumnsArr[i] == 'status' ? width = '75' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'userCode' ? 'User Code' : reorderColumnsArr[i] == 'lastFirst' ? 'User' : reorderColumnsArr[i] == 'userRole' ? 'Type' : reorderColumnsArr[i] == 'primaryAddMap' ? 'Primary Address Map' : reorderColumnsArr[i] == 'otherAddMap' ? 'Other Address Map' : reorderColumnsArr[i] == 'outlookPluginVersion' ? 'Version' : reorderColumnsArr[i] == 'allowSyncContact' ? 'Allow Contact Sync' : reorderColumnsArr[i] == 'allowSyncAppt' ? 'Allow Appt Sync' : reorderColumnsArr[i] == 'allowSyncEmail' ? 'Allow Email Sync' : reorderColumnsArr[i] == 'adminStatus' ? 'Status' : reorderColumnsArr[i] == 'status' ? 'Status' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'userCode' ? width = '90' : reorderColumnsArr[i].split(':')[0] == 'lastFirst' ? width = '90' : reorderColumnsArr[i].split(':')[0] == 'userRole' ? width = '66' : reorderColumnsArr[i].split(':')[0] == 'primaryAddMap' ? width = '110' : reorderColumnsArr[i].split(':')[0] == 'otherAddMap' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'outlookPluginVersion' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'allowSyncContact' ? width = '130' : reorderColumnsArr[i].split(':')[0] == 'allowSyncAppt' ? width = '115' : reorderColumnsArr[i].split(':')[0] == 'allowSyncEmail' ? width = '115' : reorderColumnsArr[i].split(':')[0] == 'adminStatus' ? width = '66' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '75' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'userCode' ? 'User Code' : reorderColumnsArr[i].split(':')[0] == 'lastFirst' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'userRole' ? 'Type' : reorderColumnsArr[i].split(':')[0] == 'primaryAddMap' ? 'Primary Address Map' : reorderColumnsArr[i].split(':')[0] == 'otherAddMap' ? 'Other Address Map' : reorderColumnsArr[i].split(':')[0] == 'outlookPluginVersion' ? 'Version' : reorderColumnsArr[i].split(':')[0] == 'allowSyncContact' ? 'Allow Contact Sync' : reorderColumnsArr[i].split(':')[0] == 'allowSyncAppt' ? 'Allow Appt Sync' : reorderColumnsArr[i].split(':')[0] == 'allowSyncEmail' ? 'Allow Email Sync' : reorderColumnsArr[i].split(':')[0] == 'adminStatus' ? 'Status' : reorderColumnsArr[i].split(':')[0] == 'status' ? 'Status' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "activity_log_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'dtCreated' ? width = '100' : reorderColumnsArr[i] == 'userName' ? width = '60' : reorderColumnsArr[i] == 'clpLogType' ? width = '40' : reorderColumnsArr[i] == 'cLPSSID' ? width = '40' : reorderColumnsArr[i] == 'isSupportLogin' ? width = '60' : reorderColumnsArr[i] == 'note' ? width = '300' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'dtCreated' ? 'Log Time' : reorderColumnsArr[i] == 'clpLogType' ? 'User Name' : reorderColumnsArr[i] == 'clpLogType' ? 'Type' : reorderColumnsArr[i] == 'cLPSSID' ? 'CLPSSID' : reorderColumnsArr[i] == 'isSupportLogin' ? 'By Support' : reorderColumnsArr[i] == 'note' ? 'Note' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'clpLogType' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'cLPSSID' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'isSupportLogin' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'note' ? width = '300' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Log Time' : reorderColumnsArr[i].split(':')[0] == 'clpLogType' ? 'User Name' : reorderColumnsArr[i].split(':')[0] == 'clpLogType' ? 'Type' : reorderColumnsArr[i].split(':')[0] == 'cLPSSID' ? 'CLPSSID' : reorderColumnsArr[i].split(':')[0] == 'isSupportLogin' ? 'By Support' : reorderColumnsArr[i].split(':')[0] == 'note' ? 'Note' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "round_robin_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'roundRobinName' ? width = '250' : reorderColumnsArr[i] == 'currentPositionID' ? width = '50' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'roundRobinName' ? 'Round Robin Name' : reorderColumnsArr[i] == 'currentPositionID' ? 'Current Position' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'roundRobinName' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'currentPositionID' ? width = '50' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'roundRobinName' ? 'Round Robin Name' : reorderColumnsArr[i].split(':')[0] == 'currentPositionID' ? 'Current Position' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "email_dropbox_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'name' ? width = '60' : reorderColumnsArr[i] == 'username' ? width = '100' : reorderColumnsArr[i] == 'cLPEmailDropBoxID' ? width = '60' : reorderColumnsArr[i] == 'cLPCompanyID' ? width = '60' : reorderColumnsArr[i] == 'cLPUserID' ? width = '60' : reorderColumnsArr[i] == 'dropBox' ? width = '200' : reorderColumnsArr[i] == 'processor' ? width = '60' : reorderColumnsArr[i] == 'status' ? width = '60' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'name' ? 'Name' : reorderColumnsArr[i] == 'username' ? 'User Name' : reorderColumnsArr[i] == 'cLPEmailDropBoxID' ? 'Email Dropbox ID' : reorderColumnsArr[i] == 'cLPCompanyID' ? 'Company ID' : reorderColumnsArr[i] == 'cLPUserID' ? 'User ID' : reorderColumnsArr[i] == 'dropBox' ? 'Dropbox' : reorderColumnsArr[i] == 'processor' ? 'Processor' : reorderColumnsArr[i] == 'status' ? 'Status' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'name' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'username' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'cLPEmailDropBoxID' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'cLPCompanyID' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'cLPUserID' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'dropBox' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'processor' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '60' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'name' ? 'Name' : reorderColumnsArr[i].split(':')[0] == 'username' ? 'User Name' : reorderColumnsArr[i].split(':')[0] == 'cLPEmailDropBoxID' ? 'Email Dropbox ID' : reorderColumnsArr[i].split(':')[0] == 'cLPCompanyID' ? 'Company ID' : reorderColumnsArr[i].split(':')[0] == 'cLPUserID' ? 'User ID' : reorderColumnsArr[i].split(':')[0] == 'dropBox' ? 'Dropbox' : reorderColumnsArr[i].split(':')[0] == 'processor' ? 'Processor' : reorderColumnsArr[i].split(':')[0] == 'status' ? 'Status' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "contact_restore_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'name' ? width = '250' : reorderColumnsArr[i] == 'email' ? width = '70' : reorderColumnsArr[i] == 'companyName' ? width = '350' : reorderColumnsArr[i] == 'address' ? width = '120' : reorderColumnsArr[i] == 'city' ? width = '80' : reorderColumnsArr[i] == 'state' ? width = '80' : reorderColumnsArr[i] == 'country' ? width = '80' : reorderColumnsArr[i] == 'zip' ? width = '60' : reorderColumnsArr[i] == 'emailAddress' ? width = '140' : reorderColumnsArr[i] == 'phone' ? width = '120' : reorderColumnsArr[i] == 'userName' ? width = '120' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'name' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '350' : reorderColumnsArr[i].split(':')[0] == 'address' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'city' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'state' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'country' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'zip' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? width = '140' : reorderColumnsArr[i].split(':')[0] == 'phone' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "contact_bulk_action_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'name' ? width = '250' : reorderColumnsArr[i] == 'email' ? width = '70' : reorderColumnsArr[i] == 'companyName' ? width = '350' : reorderColumnsArr[i] == 'address' ? width = '120' : reorderColumnsArr[i] == 'city' ? width = '80' : reorderColumnsArr[i] == 'state' ? width = '80' : reorderColumnsArr[i] == 'country' ? width = '80' : reorderColumnsArr[i] == 'zip' ? width = '60' : reorderColumnsArr[i] == 'emailAddress' ? width = '140' : reorderColumnsArr[i] == 'phone' ? width = '120' : reorderColumnsArr[i] == 'userName' ? width = '120' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'name' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '350' : reorderColumnsArr[i].split(':')[0] == 'address' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'city' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'state' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'country' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'zip' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? width = '140' : reorderColumnsArr[i].split(':')[0] == 'phone' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "email_mailing_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'name' ? width = '250' : reorderColumnsArr[i] == 'email' ? width = '70' : reorderColumnsArr[i] == 'companyName' ? width = '350' : reorderColumnsArr[i] == 'phone' ? width = '120' : reorderColumnsArr[i] == 'userName' ? width = '120' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'name' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '350' : reorderColumnsArr[i].split(':')[0] == 'phone' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "contact_map_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'name' ? width = '250' : reorderColumnsArr[i] == 'email' ? width = '70' : reorderColumnsArr[i] == 'companyName' ? width = '350' : reorderColumnsArr[i] == 'address' ? width = '120' : reorderColumnsArr[i] == 'city' ? width = '80' : reorderColumnsArr[i] == 'state' ? width = '80' : reorderColumnsArr[i] == 'country' ? width = '80' : reorderColumnsArr[i] == 'zip' ? width = '60' : reorderColumnsArr[i] == 'emailAddress' ? width = '140' : reorderColumnsArr[i] == 'phone' ? width = '120' : reorderColumnsArr[i] == 'userName' ? width = '120' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'name' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '350' : reorderColumnsArr[i].split(':')[0] == 'address' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'city' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'state' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'country' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'zip' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? width = '140' : reorderColumnsArr[i].split(':')[0] == 'phone' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'emailAddress' ? 'Email Address' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "text_msg_log_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'name' ? width = '200' : reorderColumnsArr[i] == 'mobileNumber' ? width = '100' : reorderColumnsArr[i] == 'email' ? width = '40' : reorderColumnsArr[i] == 'text' ? width = '40' : reorderColumnsArr[i] == 'msg' ? width = '200' : reorderColumnsArr[i] == 'comments' ? width = '100' : reorderColumnsArr[i] == 'action' ? width = '40' : reorderColumnsArr[i] == 'kEYWORD' ? width = '80' : reorderColumnsArr[i] == 'cONTENTS' ? width = '300' : reorderColumnsArr[i] == 'user' ? width = '100' : reorderColumnsArr[i] == 'dtReceived' ? width = '100' : reorderColumnsArr[i] == 'dtSend' ? width = '100' : reorderColumnsArr[i] == 'status' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'name' ? 'Name' : reorderColumnsArr[i] == 'mobileNumber' ? 'Mobile' : reorderColumnsArr[i] == 'email' ? 'Email' : reorderColumnsArr[i] == 'text' ? 'Text' : reorderColumnsArr[i] == 'msg' ? 'Message' : reorderColumnsArr[i] == 'comments' ? 'Comment' : reorderColumnsArr[i] == 'action' ? 'Action' : reorderColumnsArr[i] == 'kEYWORD' ? 'Keyword' : reorderColumnsArr[i] == 'cONTENTS' ? 'Contents' : reorderColumnsArr[i] == 'user' ? 'User' : reorderColumnsArr[i] == 'dtReceived' ? 'Received' : reorderColumnsArr[i] == 'dtSend' ? 'Sent' : reorderColumnsArr[i] == 'status' ? 'Status' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'name' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'mobileNumber' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'text' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'msg' ? width = '280' : reorderColumnsArr[i].split(':')[0] == 'comments' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'action' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'kEYWORD' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'cONTENTS' ? width = '300' : reorderColumnsArr[i].split(':')[0] == 'user' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtReceived' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtSend' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'name' ? 'Name' : reorderColumnsArr[i].split(':')[0] == 'mobileNumber' ? 'Mobile' : reorderColumnsArr[i].split(':')[0] == 'email' ? 'Email' : reorderColumnsArr[i].split(':')[0] == 'text' ? 'Text' : reorderColumnsArr[i].split(':')[0] == 'msg' ? 'Message' : reorderColumnsArr[i].split(':')[0] == 'comments' ? 'Comment' : reorderColumnsArr[i].split(':')[0] == 'action' ? 'Action' : reorderColumnsArr[i].split(':')[0] == 'kEYWORD' ? 'Keyword' : reorderColumnsArr[i].split(':')[0] == 'cONTENTS' ? 'Contents' : reorderColumnsArr[i].split(':')[0] == 'user' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'dtReceived' ? 'Received' : reorderColumnsArr[i].split(':')[0] == 'dtSend' ? 'Sent' : reorderColumnsArr[i].split(':')[0] == 'status' ? 'Status' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "score_card_code_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'code' ? width = '100' : reorderColumnsArr[i] == 'desc' ? width = '200' : reorderColumnsArr[i] == 'projectedContactsAdded' ? width = '40' : reorderColumnsArr[i] == 'contactsAdded' ? width = '40' : reorderColumnsArr[i] == 'callCount' ? width = '40' : reorderColumnsArr[i] == 'bipCreated' ? width = '40' : reorderColumnsArr[i] == 'bipScheduled' ? width = '40' : reorderColumnsArr[i] == 'bipRate' ? width = '40' : reorderColumnsArr[i] == 'bipShow' ? width = '40' : reorderColumnsArr[i] == 'bipShowRate' ? width = '40' : reorderColumnsArr[i] == 'showsPerLead' ? width = '40' : reorderColumnsArr[i] == 'bipSold' ? width = '40' : reorderColumnsArr[i] == 'subSold' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'code' ? 'Code' : reorderColumnsArr[i] == 'desc' ? 'Description' : reorderColumnsArr[i] == 'projectedContactsAdded' ? 'Projected Contacts' : reorderColumnsArr[i] == 'contactsAdded' ? 'Contacts Added' : reorderColumnsArr[i] == 'callCount' ? 'Call Count' : reorderColumnsArr[i] == 'bipCreated' ? 'BIP Created' : reorderColumnsArr[i] == 'bipScheduled' ? 'BIP Scheduled' : reorderColumnsArr[i] == 'bipRate' ? 'BIP Rate' : reorderColumnsArr[i] == 'bipShow' ? 'BIP Show' : reorderColumnsArr[i] == 'bipShowRate' ? 'BIP Show Rate' : reorderColumnsArr[i] == 'showsPerLead' ? 'Shows Per Lead' : reorderColumnsArr[i] == 'bipSold' ? 'BIP Sold' : reorderColumnsArr[i] == 'subSold' ? 'SUB Sold' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'code' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'desc' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'projectedContactsAdded' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'contactsAdded' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'callCount' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bipCreated' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bipScheduled' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bipRate' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bipShow' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bipShowRate' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'showsPerLead' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bipSold' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'subSold' ? width = '40' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'code' ? 'Code' : reorderColumnsArr[i].split(':')[0] == 'desc' ? 'Description' : reorderColumnsArr[i].split(':')[0] == 'projectedContactsAdded' ? 'Projected Contacts' : reorderColumnsArr[i].split(':')[0] == 'contactsAdded' ? 'Contacts Added' : reorderColumnsArr[i].split(':')[0] == 'callCount' ? 'Call Count' : reorderColumnsArr[i].split(':')[0] == 'bipCreated' ? 'BIP Created' : reorderColumnsArr[i].split(':')[0] == 'bipScheduled' ? 'BIP Scheduled' : reorderColumnsArr[i].split(':')[0] == 'bipRate' ? 'BIP Rate' : reorderColumnsArr[i].split(':')[0] == 'bipShow' ? 'BIP Show' : reorderColumnsArr[i].split(':')[0] == 'bipShowRate' ? 'BIP Show Rate' : reorderColumnsArr[i].split(':')[0] == 'showsPerLead' ? 'Shows Per Lead' : reorderColumnsArr[i].split(':')[0] == 'bipSold' ? 'BIP Sold' : reorderColumnsArr[i].split(':')[0] == 'subSold' ? 'SUB Sold' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "voice_call_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'user' ? width = '100' : reorderColumnsArr[i] == 'team' ? width = '100' : reorderColumnsArr[i] == 'office' ? width = '80' : reorderColumnsArr[i] == 'contacts' ? width = '40' : reorderColumnsArr[i] == 'calls' ? width = '40' : reorderColumnsArr[i] == 'noRing' ? width = '40' : reorderColumnsArr[i] == 'connected' ? width = '40' : reorderColumnsArr[i] == 'less2min' ? width = '40' : reorderColumnsArr[i] == 'bt2to5min' ? width = '40' : reorderColumnsArr[i] == 'bt5to15min' ? width = '40' : reorderColumnsArr[i] == 'bt15to30min' ? width = '40' : reorderColumnsArr[i] == 'greater30min' ? width = '40' : reorderColumnsArr[i] == 'answerRate' ? width = '60' : reorderColumnsArr[i] == 'pitchRate' ? width = '60' : reorderColumnsArr[i] == 'minutes' ? width = '60' : reorderColumnsArr[i] == 'cpd' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'user' ? 'User' : reorderColumnsArr[i] == 'team' ? 'Team' : reorderColumnsArr[i] == 'office' ? 'Office' : reorderColumnsArr[i] == 'contacts' ? 'Contacts' : reorderColumnsArr[i] == 'calls' ? 'Calls' : reorderColumnsArr[i] == 'noRing' ? 'No Ring' : reorderColumnsArr[i] == 'connected' ? 'Connected' : reorderColumnsArr[i] == 'less2min' ? '< 2 min' : reorderColumnsArr[i] == 'bt2to5min' ? '2 to 5 min' : reorderColumnsArr[i] == 'bt5to15min' ? '5 to 15 min' : reorderColumnsArr[i] == 'bt15to30min' ? '15 to 30 min' : reorderColumnsArr[i] == 'greater30min' ? '> 30 min' : reorderColumnsArr[i] == 'answerRate' ? 'Answer Rate' : reorderColumnsArr[i] == 'pitchRate' ? 'Pitch Rate' : reorderColumnsArr[i] == 'minutes' ? 'Avg Call' : reorderColumnsArr[i] == 'cpd' ? 'Connected Per Day' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' },
            { field: '$', title: '  ', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'user' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'team' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'office' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'contacts' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'calls' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'noRing' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'connected' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'less2min' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bt2to5min' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bt5to15min' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'bt15to30min' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'greater30min' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'answerRate' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'pitchRate' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'minutes' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'cpd' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'user' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'team' ? 'Team' : reorderColumnsArr[i].split(':')[0] == 'office' ? 'Office' : reorderColumnsArr[i].split(':')[0] == 'contacts' ? 'Contacts' : reorderColumnsArr[i].split(':')[0] == 'calls' ? 'Calls' : reorderColumnsArr[i].split(':')[0] == 'noRing' ? 'No Ring' : reorderColumnsArr[i].split(':')[0] == 'connected' ? 'Connected' : reorderColumnsArr[i].split(':')[0] == 'less2min' ? '< 2 min' : reorderColumnsArr[i].split(':')[0] == 'bt2to5min' ? '2 to 5 min' : reorderColumnsArr[i].split(':')[0] == 'bt5to15min' ? '5 to 15 min' : reorderColumnsArr[i].split(':')[0] == 'bt15to30min' ? '15 to 30 min' : reorderColumnsArr[i].split(':')[0] == 'greater30min' ? '> 30 min' : reorderColumnsArr[i].split(':')[0] == 'answerRate' ? 'Answer Rate' : reorderColumnsArr[i].split(':')[0] == 'pitchRate' ? 'Pitch Rate' : reorderColumnsArr[i].split(':')[0] == 'minutes' ? 'Avg Call' : reorderColumnsArr[i].split(':')[0] == 'cpd' ? 'Connected Per Day' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "mailing_queue_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '60' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'user' ? width = '510' : reorderColumnsArr[i] == 'account' ? width = '510' : reorderColumnsArr[i] == 'mailing' ? width = '640' : reorderColumnsArr[i] == 'cnt' ? width = '110' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'cnt' ? 'Count' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '60' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'user' ? width = '510' : reorderColumnsArr[i].split(':')[0] == 'account' ? width = '510' : reorderColumnsArr[i].split(':')[0] == 'mailing' ? width = '640' : reorderColumnsArr[i].split(':')[0] == 'cnt' ? width = '110' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'cnt' ? 'Count' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "mail_merge_template_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'templateName' ? width = '200' : reorderColumnsArr[i] == 'previewTemplate' ? width = '100' : reorderColumnsArr[i] == 'userLastFirst' ? width = '100' : reorderColumnsArr[i] == 'shareable' ? width = '100' : reorderColumnsArr[i] == 'isUseBee' ? width = '100' : reorderColumnsArr[i] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'templateName' ? 'Template Name' : reorderColumnsArr[i] == 'previewTemplate' ? 'Preview Template' : reorderColumnsArr[i] == 'userLastFirst' ? 'User' : reorderColumnsArr[i] == 'shareable' ? 'Sharing' : reorderColumnsArr[i] == 'isUseBee' ? 'Editor' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'templateName' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'previewTemplate' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'userLastFirst' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'shareable' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'isUseBee' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'templateName' ? 'Template Name' : reorderColumnsArr[i].split(':')[0] == 'previewTemplate' ? 'Preview Template' : reorderColumnsArr[i].split(':')[0] == 'userLastFirst' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'shareable' ? 'Sharing' : reorderColumnsArr[i].split(':')[0] == 'isUseBee' ? 'Editor' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "email_template_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'templateName' ? width = '200' : reorderColumnsArr[i] == 'previewTemplate' ? width = '100' : reorderColumnsArr[i] == 'userLastFirst' ? width = '100' : reorderColumnsArr[i] == 'shareable' ? width = '100' : reorderColumnsArr[i] == 'isUseBee' ? width = '100' : reorderColumnsArr[i] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'templateName' ? 'Template Name' : reorderColumnsArr[i] == 'previewTemplate' ? 'Preview Template' : reorderColumnsArr[i] == 'userLastFirst' ? 'User' : reorderColumnsArr[i] == 'shareable' ? 'Sharing' : reorderColumnsArr[i] == 'isUseBee' ? 'Editor' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'templateName' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'previewTemplate' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'userLastFirst' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'shareable' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'isUseBee' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'templateName' ? 'Template Name' : reorderColumnsArr[i].split(':')[0] == 'previewTemplate' ? 'Preview Template' : reorderColumnsArr[i].split(':')[0] == 'userLastFirst' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'shareable' ? 'Sharing' : reorderColumnsArr[i].split(':')[0] == 'isUseBee' ? 'Editor' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "contact_excel_process_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'name' ? width = '250' : reorderColumnsArr[i] == 'address' ? width = '250' : reorderColumnsArr[i] == 'email' ? width = '70' : reorderColumnsArr[i] == 'classification' ? width = '250' : reorderColumnsArr[i] == 'owner' ? width = '120' : reorderColumnsArr[i] == 'statusCode' ? width = '120' : reorderColumnsArr[i] == 'actionToTake' ? width = '120' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'name' ? 'Name' : reorderColumnsArr[i] == 'address' ? 'Address' : reorderColumnsArr[i] == 'email' ? 'Email' : reorderColumnsArr[i] == 'classification' ? 'Classification' : reorderColumnsArr[i] == 'owner' ? 'Owner' : reorderColumnsArr[i] == 'statusCode' ? 'System Message' : reorderColumnsArr[i] == 'actionToTake' ? 'Action' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'name' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'address' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'classification' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'owner' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'statusCode' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'actionToTake' ? width = '120' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'name' ? 'Name' : reorderColumnsArr[i].split(':')[0] == 'address' ? 'Address' : reorderColumnsArr[i].split(':')[0] == 'email' ? 'Email' : reorderColumnsArr[i].split(':')[0] == 'classification' ? 'Classification' : reorderColumnsArr[i].split(':')[0] == 'owner' ? 'Owner' : reorderColumnsArr[i].split(':')[0] == 'statusCode' ? 'System Message' : reorderColumnsArr[i].split(':')[0] == 'actionToTake' ? 'Action' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "company_excel_process_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'companyName' ? width = '250' : reorderColumnsArr[i] == 'addressDisplay' ? width = '250' : reorderColumnsArr[i] == 'webSite' ? width = '70' : reorderColumnsArr[i] == 'clpUserDisplay' ? width = '250' : reorderColumnsArr[i] == 'systemNote' ? width = '120' : reorderColumnsArr[i] == 'actionToTake' ? width = '120' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'addressDisplay' ? 'Address' : reorderColumnsArr[i] == 'webSite' ? 'Website' : reorderColumnsArr[i] == 'clpUserDisplay' ? 'Created By' : reorderColumnsArr[i] == 'systemNote' ? 'System Message' : reorderColumnsArr[i] == 'actionToTake' ? 'Action' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: ' ', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'addressDisplay' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'webSite' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'clpUserDisplay' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'systemNote' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'actionToTake' ? width = '120' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'addressDisplay' ? 'Address' : reorderColumnsArr[i].split(':')[0] == 'webSite' ? 'Website' : reorderColumnsArr[i].split(':')[0] == 'clpUserDisplay' ? 'Created By' : reorderColumnsArr[i].split(':')[0] == 'systemNote' ? 'System Message' : reorderColumnsArr[i].split(':')[0] == 'actionToTake' ? 'Action' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "fbc_email_template_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'templateName' ? width = '300' : reorderColumnsArr[i] == 'previewTemplate' ? width = '100' : reorderColumnsArr[i] == 'status' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'templateName' ? 'Template Name' : reorderColumnsArr[i] == 'previewTemplate' ? 'Preview Template' : reorderColumnsArr[i] == 'status' ? 'Status' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'templateName' ? width = '300' : reorderColumnsArr[i].split(':')[0] == 'previewTemplate' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'status' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'templateName' ? 'Template Name' : reorderColumnsArr[i].split(':')[0] == 'previewTemplate' ? 'Preview Template' : reorderColumnsArr[i].split(':')[0] == 'status' ? 'Status' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "my_documents_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'documentType' ? width = '40' : reorderColumnsArr[i] == 'documentName' ? width = '250' : reorderColumnsArr[i] == 'documentCategory' ? width = '70' : reorderColumnsArr[i] == 'location' ? width = '250' : reorderColumnsArr[i] == 'documentLength' ? width = '120' : reorderColumnsArr[i] == 'userName' ? width = '120' : reorderColumnsArr[i] == 'dtCreated' ? width = '150' : reorderColumnsArr[i] == 'isShared' ? width = '90' : reorderColumnsArr[i] == 'update' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'documentType' ? 'Type' : reorderColumnsArr[i] == 'documentName' ? '' : reorderColumnsArr[i] == 'documentCategory' ? '' : reorderColumnsArr[i] == 'location' ? 'Location' : reorderColumnsArr[i] == 'documentLength' ? 'Size' : reorderColumnsArr[i] == 'userName' ? 'User' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i] == 'isShared' ? 'Shared' : reorderColumnsArr[i] == 'update' ? '' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'documentType' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'documentName' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'documentCategory' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'location' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'documentLength' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'userName' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'isShared' ? width = '90' : reorderColumnsArr[i].split(':')[0] == 'update' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'documentType' ? 'Type' : reorderColumnsArr[i].split(':')[0] == 'documentName' ? '' : reorderColumnsArr[i].split(':')[0] == 'documentCategory' ? '' : reorderColumnsArr[i].split(':')[0] == 'location' ? 'Location' : reorderColumnsArr[i].split(':')[0] == 'documentLength' ? 'Size' : reorderColumnsArr[i].split(':')[0] == 'userName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0] == 'isShared' ? 'Shared' : reorderColumnsArr[i].split(':')[0] == 'update' ? '' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "company_grid": {
        if (!isHiddenColumn) {
          this.columns = [
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'companyName' ? width = '40' : reorderColumnsArr[i] == 'webSite' ? width = '250' : reorderColumnsArr[i] == 'phone' ? width = '70' : reorderColumnsArr[i] == 'companyID' ? width = '250' : reorderColumnsArr[i] == 'city' ? width = '120' : reorderColumnsArr[i] == 'state' ? width = '120' : reorderColumnsArr[i] == 'dtCreated' ? width = '150' : reorderColumnsArr[i] == 'dtModified' ? width = '90' : reorderColumnsArr[i] == 'cLPUserID' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'webSite' ? 'webSite' : reorderColumnsArr[i] == 'phone' ? 'phone' : reorderColumnsArr[i] == 'companyID' ? '# of Contacts' : reorderColumnsArr[i] == 'city' ? 'city' : reorderColumnsArr[i] == 'state' ? 'state' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i] == 'dtModified' ? 'Modified' : reorderColumnsArr[i] == 'cLPUserID' ? 'User' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '40' : reorderColumnsArr[i].split(':')[0] == 'webSite' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'phone' ? width = '70' : reorderColumnsArr[i].split(':')[0] == 'companyID' ? width = '250' : reorderColumnsArr[i].split(':')[0] == 'city' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'state' ? width = '120' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'dtModified' ? width = '90' : reorderColumnsArr[i].split(':')[0] == 'cLPUserID' ? width = '90' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'webSite' ? 'webSite' : reorderColumnsArr[i].split(':')[0] == 'phone' ? '' : reorderColumnsArr[i].split(':')[0] == 'companyID' ? '# of Contacts' : reorderColumnsArr[i].split(':')[0] == 'city' ? 'city' : reorderColumnsArr[i].split(':')[0] == 'state' ? 'state' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0] == 'dtModified' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'cLPUserID' ? 'User' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "lead_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'leadDesc' ? width = '100' : reorderColumnsArr[i] == 'lastFirst' ? width = '100' : reorderColumnsArr[i] == 'companyName' ? width = '100' : reorderColumnsArr[i] == 'ufirstName' ? width = '100' : reorderColumnsArr[i] == 'dtStart' ? width = '100' : reorderColumnsArr[i] == 'dtEndShow' ? width = '100' : reorderColumnsArr[i] == 'revenue' ? width = '100' : reorderColumnsArr[i] == 'winProbability' ? width = '100' : reorderColumnsArr[i] == 'leadStatusCode' ? width = '100' : reorderColumnsArr[i] == 'dtModified' ? width = '100' : reorderColumnsArr[i] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'leadDesc' ? 'Lead' : reorderColumnsArr[i] == 'lastFirst' ? 'Contact' : reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'ufirstName' ? 'User' : reorderColumnsArr[i] == 'dtStart' ? 'Start' : reorderColumnsArr[i] == 'dtEndShow' ? 'Close' : reorderColumnsArr[i] == 'revenue' ? 'Net Revenue' : reorderColumnsArr[i] == 'winProbability' ? 'Win Probability' : reorderColumnsArr[i] == 'leadStatusCode' ? 'Status' : reorderColumnsArr[i] == 'dtModified' ? 'Modified' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'leadDesc' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'lastFirst' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'ufirstName' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtStart' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtEndShow' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'revenue' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'winProbability' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'leadStatusCode' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtModified' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'leadDesc' ? 'Lead' : reorderColumnsArr[i].split(':')[0] == 'lastFirst' ? 'Contact' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'ufirstName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'dtStart' ? 'Start' : reorderColumnsArr[i].split(':')[0] == 'dtEndShow' ? 'Close' : reorderColumnsArr[i].split(':')[0] == 'revenue' ? 'Net Revenue' : reorderColumnsArr[i].split(':')[0] == 'winProbability' ? 'Win Probability' : reorderColumnsArr[i].split(':')[0] == 'leadStatusCode' ? 'Status' : reorderColumnsArr[i].split(':')[0] == 'dtModified' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "invoice_report_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'leadDesc' ? width = '60' : reorderColumnsArr[i] == 'FullName' ? width = '80' : reorderColumnsArr[i] == 'InvoiceNumber' ? width = '100' : reorderColumnsArr[i] == 'dtInvoiceShow' ? width = '100' : reorderColumnsArr[i] == 'InvoiceShortDesc' ? width = '280' : reorderColumnsArr[i] == 'Amount' ? width = '60' : reorderColumnsArr[i] == 'MailMergeTemplateShow' ? width = '150' : reorderColumnsArr[i] == 'UserName' ? width = '80' : reorderColumnsArr[i] == 'StatusDisplay' ? width = '60' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? width = '60' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? width = '60' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'leadDesc' ? 'Lead' : reorderColumnsArr[i] == 'FullName' ? 'Contact' : reorderColumnsArr[i] == 'InvoiceNumber' ? 'Number' : reorderColumnsArr[i] == 'dtInvoiceShow' ? 'Date' : reorderColumnsArr[i] == 'InvoiceShortDesc' ? 'Description' : reorderColumnsArr[i] == 'Amount' ? 'Amount' : reorderColumnsArr[i] == 'MailMergeTemplateShow' ? 'Mail Merge Template' : reorderColumnsArr[i] == 'UserName' ? 'User' : reorderColumnsArr[i] == 'StatusDisplay' ? 'Status' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'leadDesc' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'FullName' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'InvoiceNumber' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtInvoiceShow' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'InvoiceShortDesc' ? width = '280' : reorderColumnsArr[i].split(':')[0] == 'Amount' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'MailMergeTemplateShow' ? width = '150' : reorderColumnsArr[i].split(':')[0] == 'UserName' ? width = '80' : reorderColumnsArr[i].split(':')[0] == 'StatusDisplay' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? width = '60' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? width = '60' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'leadDesc' ? 'Lead' : reorderColumnsArr[i].split(':')[0] == 'FullName' ? 'Contact' : reorderColumnsArr[i].split(':')[0] == 'InvoiceNumber' ? 'Number' : reorderColumnsArr[i].split(':')[0] == 'dtInvoiceShow' ? 'Date' : reorderColumnsArr[i].split(':')[0] == 'InvoiceShortDesc' ? 'Description' : reorderColumnsArr[i].split(':')[0] == 'Amount' ? 'Amount' : reorderColumnsArr[i].split(':')[0] == 'MailMergeTemplateShow' ? 'Mail Merge Template' : reorderColumnsArr[i].split(':')[0] == 'UserName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'StatusDisplay' ? 'Status' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "active_lead_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'leadDesc' ? width = '100' : reorderColumnsArr[i] == 'lastFirst' ? width = '100' : reorderColumnsArr[i] == 'companyName' ? width = '100' : reorderColumnsArr[i] == 'ufirstName' ? width = '100' : reorderColumnsArr[i] == 'dtStart' ? width = '100' : reorderColumnsArr[i] == 'dtEnd' ? width = '100' : reorderColumnsArr[i] == 'revenue' ? width = '100' : reorderColumnsArr[i] == 'winProbability' ? width = '100' : reorderColumnsArr[i] == 'leadStatusCode' ? width = '100' : reorderColumnsArr[i] == 'dtModified' ? width = '100' : reorderColumnsArr[i] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'leadDesc' ? 'Lead' : reorderColumnsArr[i] == 'lastFirst' ? 'Contact' : reorderColumnsArr[i] == 'companyName' ? 'Company' : reorderColumnsArr[i] == 'ufirstName' ? 'User' : reorderColumnsArr[i] == 'dtStart' ? 'Start' : reorderColumnsArr[i] == 'dtEnd' ? 'Close' : reorderColumnsArr[i] == 'revenue' ? 'Net Revenue' : reorderColumnsArr[i] == 'winProbability' ? 'Win Probability' : reorderColumnsArr[i] == 'leadStatusCode' ? 'Status' : reorderColumnsArr[i] == 'dtModified' ? 'Modified' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'leadDesc' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'lastFirst' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'ufirstName' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtStart' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtEnd' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'revenue' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'winProbability' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'leadStatusCode' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtModified' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'leadDesc' ? 'Lead' : reorderColumnsArr[i].split(':')[0] == 'lastFirst' ? 'Contact' : reorderColumnsArr[i].split(':')[0] == 'companyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'ufirstName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'dtStart' ? 'Start' : reorderColumnsArr[i].split(':')[0] == 'dtEnd' ? 'Close' : reorderColumnsArr[i].split(':')[0] == 'revenue' ? 'Net Revenue' : reorderColumnsArr[i].split(':')[0] == 'winProbability' ? 'Win Probability' : reorderColumnsArr[i].split(':')[0] == 'leadStatusCode' ? 'Status' : reorderColumnsArr[i].split(':')[0] == 'dtModified' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "project_manager_revenue_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'split' ? width = '250' : reorderColumnsArr[i] == 'leads' ? width = '80' : reorderColumnsArr[i] == 'revenue' ? width = '100' : reorderColumnsArr[i] == 'probability' ? width = '100': reorderColumnsArr[i] == 'projected' ? width = '100':'';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'split' ? 'Manager' : reorderColumnsArr[i] == 'leads' ? '# Leads' : reorderColumnsArr[i] == 'revenue' ? 'Estimated Revenue' : reorderColumnsArr[i] == 'probability' ? 'Win Probability' : reorderColumnsArr[i] == 'projected' ? 'Projected Revenue' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'split' ? width = '250' : reorderColumnsArr[i] == 'leads' ? width = '80' : reorderColumnsArr[i] == 'revenue' ? width = '100' : reorderColumnsArr[i] == 'probability' ? width = '100' : reorderColumnsArr[i] == 'projected' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'split' ? 'Manager' : reorderColumnsArr[i].split(':')[0] == 'leads' ? '# Leads' : reorderColumnsArr[i].split(':')[0] == 'revenue' ? ' Estimated Revenue' : reorderColumnsArr[i].split(':')[0] == 'probability' ? 'Win Probability' : reorderColumnsArr[i].split(':')[0] == 'projected' ? 'Projected Revenue' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "project_revenue_classification_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'split' ? width = '250' : reorderColumnsArr[i] == 'leads' ? width = '80' : reorderColumnsArr[i] == 'revenue' ? width = '100' : reorderColumnsArr[i] == 'probability' ? width = '100' : reorderColumnsArr[i] == 'projected' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'split' ? '' : reorderColumnsArr[i] == 'leads' ? '# Leads' : reorderColumnsArr[i] == 'revenue' ? 'Estimated Revenue' : reorderColumnsArr[i] == 'probability' ? 'Win Probability' : reorderColumnsArr[i] == 'projected' ? 'Projected Revenue' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'split' ? width = '250' : reorderColumnsArr[i] == 'leads' ? width = '80' : reorderColumnsArr[i] == 'revenue' ? width = '100' : reorderColumnsArr[i] == 'probability' ? width = '100' : reorderColumnsArr[i] == 'projected' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'split' ? '' : reorderColumnsArr[i].split(':')[0] == 'leads' ? '# Leads' : reorderColumnsArr[i].split(':')[0] == 'revenue' ? 'Projected Revenue' : reorderColumnsArr[i].split(':')[0] == 'probability' ? 'Win Probability' : reorderColumnsArr[i].split(':')[0] == 'projected' ? 'Projected Revenue' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "project_revenue_month_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'displayMonth' ? width = '250' : reorderColumnsArr[i] == 'leads' ? width = '80' : reorderColumnsArr[i] == 'projected' ? width = '100' : reorderColumnsArr[i] == 'revenue' ? width = '100' : reorderColumnsArr[i] == 'volume' ? width = '100' : reorderColumnsArr[i] == 'probability' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'displayMonth' ? '' : reorderColumnsArr[i] == 'leads' ? 'Leads' : reorderColumnsArr[i] == 'projected' ? 'Projected Revenue' : reorderColumnsArr[i] == 'revenue' ? 'Net Revenue' : reorderColumnsArr[i] == 'volume' ? 'Gross revenue' : reorderColumnsArr[i] == 'probability' ? 'Win Probability' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'displayMonth' ? width = '250' : reorderColumnsArr[i] == 'leads' ? width = '80' : reorderColumnsArr[i] == 'projected' ? width = '100' : reorderColumnsArr[i] == 'revenue' ? width = '100' : reorderColumnsArr[i] == 'volume' ? width = '100' : reorderColumnsArr[i] == 'probability' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'displayMonth' ? '' : reorderColumnsArr[i].split(':')[0] == 'leads' ? 'Leads' : reorderColumnsArr[i].split(':')[0] == 'projected' ? 'Projected Revenue' : reorderColumnsArr[i].split(':')[0] == 'revenue' ? 'Net Revenue' : reorderColumnsArr[i].split(':')[0] == 'volume' ? 'Gross revenue' : reorderColumnsArr[i].split(':')[0] == 'probability' ? 'Win Probability' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "lead_two_dim_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
            { field: '$$', title: ' ', width: '30' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'LeadDesc' ? width = '50' : reorderColumnsArr[i] == 'ContactLast' ? width = '50' : reorderColumnsArr[i] == 'CompanyName' ? width = '50' : reorderColumnsArr[i] == 'UserName' ? width = '50' : reorderColumnsArr[i] == 'RevenueShow' ? width = '50' : reorderColumnsArr[i] == 'WinProbability' ? width = '50' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? width = '50' : reorderColumnsArr[i] == 'dtCreated' ? width = '50' : reorderColumnsArr[i] == 'NextTask' ? width = '50' : reorderColumnsArr[i] == 'NextTaskDateDisplay' ? width = '50' : reorderColumnsArr[i] == 'dtCustom1Show' ? width = '50' : reorderColumnsArr[i] == 'dtRevenueShow' ? width = '50' : reorderColumnsArr[i] == 'LeadClass9Display' ? width = '50' : reorderColumnsArr[i] == 'VolumeShow' ? width = '50' : reorderColumnsArr[i] == 'ProjectedNetShow' ? width = '50' : reorderColumnsArr[i] == 'dtEndShow' ? width = '50' : reorderColumnsArr[i] == 'dtCustom1Show' ? width = '50' : reorderColumnsArr[i] == 'dtStartShow' ? width = '50' : reorderColumnsArr[i] == 'StatusDisplay' ? width = '50' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? width = '50' :'';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'LeadDesc' ? 'Lead' : reorderColumnsArr[i] == 'ContractLast' ? 'Contract' : reorderColumnsArr[i] == 'CompanyName' ? 'Company' : reorderColumnsArr[i] == 'UserName' ? 'User' : reorderColumnsArr[i] == 'RevenueShow' ? 'Net Revenue' : reorderColumnsArr[i] == 'WinProbability' ? 'Win Probability' : reorderColumnsArr[i] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i] == 'NextTask' ? 'Next Task' : reorderColumnsArr[i] == 'NextTaskDateDisplay' ? 'Due Date' : reorderColumnsArr[i] == 'dtCustom1Show' ? 'Proposal' : reorderColumnsArr[i] == 'dtRevenueShow' ? 'Receive Revenue' : reorderColumnsArr[i] == 'LeadClass9Display' ? 'Position' : reorderColumnsArr[i] == 'VolumeShow' ? 'Gross Revenue' : reorderColumnsArr[i] == 'ProjectedNetShow' ? 'Projected Net' : reorderColumnsArr[i] == 'dtEndShow' ? 'Close' : reorderColumnsArr[i] == 'dtCustom1Show' ? 'Proposal' : reorderColumnsArr[i] == 'dtStartShow' ? 'Start' : reorderColumnsArr[i] == 'StatusDisplay' ? 'Status' : reorderColumnsArr[i] == 'dtCreatedDisplay' ? 'Created' :reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
            { field: '$$', title: ' ', width: '30' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'LeadDesc' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'ContractLast' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'CompanyName' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'UserName' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'RevenueShow' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'WinProbability' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'NextTask' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'NextTaskDateDisplay' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'dtCustom1Show' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'dtRevenueShow' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'LeadClass9Display' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'VolumeShow' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'ProjectedNetShow' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'dtEndShow' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'dtCustom1Show' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'dtStartShow' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'StatusDisplay' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? width = '50' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i].split(':')[0] == 'LeadDesc' ? 'Lead' : reorderColumnsArr[i].split(':')[0] == 'ContractLast' ? 'Contract' : reorderColumnsArr[i].split(':')[0] == 'CompanyName' ? 'Company' : reorderColumnsArr[i].split(':')[0] == 'UserName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'RevenueShow' ? 'Net Revenue' : reorderColumnsArr[i].split(':')[0] == 'WinProbability' ? 'Win Probability' : reorderColumnsArr[i].split(':')[0] == 'dtModifiedDisplay' ? 'Modified' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0] == 'NextTask' ? 'Next Task' : reorderColumnsArr[i].split(':')[0] == 'NextTaskDateDisplay' ? 'Due Date' : reorderColumnsArr[i].split(':')[0] == 'dtCustom1Show' ? 'Proposal' : reorderColumnsArr[i].split(':')[0] == 'dtRevenueShow' ? 'Receive Revenue' : reorderColumnsArr[i].split(':')[0] == 'LeadClass9Display' ? 'Position' : reorderColumnsArr[i].split(':')[0] == 'VolumeShow' ? 'Gross Revenue' : reorderColumnsArr[i].split(':')[0] == 'ProjectedNetShow' ? 'Projected Net' : reorderColumnsArr[i].split(':')[0] == 'dtEndShow' ? 'Close' : reorderColumnsArr[i].split(':')[0] == 'dtCustom1Show' ? 'Proposal' : reorderColumnsArr[i].split(':')[0] == 'dtStartShow' ? 'Start' : reorderColumnsArr[i].split(':')[0] == 'StatusDisplay' ? 'Status' : reorderColumnsArr[i].split(':')[0] == 'dtCreatedDisplay' ? 'Created': reorderColumnsArr[i].split(':')[0] , width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "buzz_score_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'firstName' ? width = '100' : reorderColumnsArr[i] == 'email' ? width = '100' : reorderColumnsArr[i] == 'phone' ? width = '100' : reorderColumnsArr[i] == 'mobile' ? width = '100' : reorderColumnsArr[i] == 'homePhone' ? width = '100' : reorderColumnsArr[i] == 'uFirstName' ? width = '100' : reorderColumnsArr[i] == 'score' ? width = '50' : reorderColumnsArr[i] == 'events' ? width = '50' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'firstName' ? 'Name' : reorderColumnsArr[i] == 'email' ? 'Email' : reorderColumnsArr[i] == 'phone' ? 'Phone' : reorderColumnsArr[i] == 'mobile' ? 'Mobile' : reorderColumnsArr[i] == 'homePhone' ? 'Home Phone' : reorderColumnsArr[i] == 'uFirstName' ? 'User' : reorderColumnsArr[i] == 'score' ? 'Buzz' : reorderColumnsArr[i] == 'event' ? 'Events': reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'firstName' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'email' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'phone' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'mobile' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'homePhone' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'uFirstName' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'score' ? width = '50' : reorderColumnsArr[i].split(':')[0] == 'events' ? width = '50' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'firstName' ? 'Name' : reorderColumnsArr[i].split(':')[0] == 'email' ? 'Email' : reorderColumnsArr[i].split(':')[0] == 'phone' ? 'Phone' : reorderColumnsArr[i].split(':')[0] == 'mobile' ? 'Mobile' : reorderColumnsArr[i].split(':')[0] == 'homePhone' ? 'Home Phone' : reorderColumnsArr[i].split(':')[0] == 'uFirstName' ? 'User' : reorderColumnsArr[i].split(':')[0] == 'score' ? 'Buzz' : reorderColumnsArr[i].split(':')[0] == 'event' ? 'Events' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "buzz_score_calculation_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
            { field: '$$', title: ' ', width: '30' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'score' ? width = '100' : reorderColumnsArr[i] == 'type ' ? width = '100' : reorderColumnsArr[i] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'score' ? 'Index' : reorderColumnsArr[i] == 'type' ? 'Type' : reorderColumnsArr[i] == 'dtCreated' ? 'Created' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
            { field: '$$', title: ' ', width: '30' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'score' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'type' ? width = '100' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? width = '100' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'score' ? 'Index' : reorderColumnsArr[i].split(':')[0] == 'type' ? 'Type' : reorderColumnsArr[i].split(':')[0] == 'dtCreated' ? 'Created' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      case "click_tracking_report_grid": {
        if (!isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' },
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i] == 'destinationUrl' ? width = '200' : reorderColumnsArr[i] == 'count ' ? width = '50'  : '';
            this.columns.push({ field: reorderColumnsArr[i], title: reorderColumnsArr[i] == 'destinationUrl' ? 'Destination Url' : reorderColumnsArr[i] == 'count' ? 'Clicks' : reorderColumnsArr[i], width: width != '' ? width : '' });
          }
        }
        else if (isHiddenColumn) {
          this.columns = [
            { field: '$', title: '', width: '40' }
          ];
          for (var i = 0; i < reorderColumnsArr.length; i++) {
            var width: string = '';
            for (var j = 0; j < columnWidthsArr.length; j++) {
              if (columnWidthsArr[j].split(':')[0] === reorderColumnsArr[i]) {
                width = columnWidthsArr[j].split(':')[1];
              }
            }
            if (width == '')
              reorderColumnsArr[i].split(':')[0] == 'destinationUrl' ? width = '200' : reorderColumnsArr[i].split(':')[0] == 'count' ? width = '50' : '';
            this.columns.push({ field: reorderColumnsArr[i].split(':')[0], title: reorderColumnsArr[i].split(':')[0] == 'destinationUrl' ? 'Destination Url' : reorderColumnsArr[i].split(':')[0] == 'count' ? 'Clicks' : reorderColumnsArr[i].split(':')[0], width: width != '' ? width : '' });
          }
        }
        break;
      }
      default:
        break;

    }


  }
  getGridColumnsConfiguration(clpUserId, tableName) {
    return new Observable(observer => {
      this.showSpinner = true;
      this._gridColumnsConfigurationService.getGridColumnsConfiguration(this.encryptedUser, clpUserId, tableName)
        .then(result => {
          if (result) {
            switch (tableName) {
              case "admin_company_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "account_storage_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "webform_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "announcement_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "user_setup_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "billing_history_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "tag_setting_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "contract_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "rep_setting_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "click_tracking_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "appt_type_summary_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "appt_type_summary_YTD_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "email_open_rate_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "custom_action_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "text_msg_template_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "referrer_report_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "user_pref_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "ticket_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "outlook_addin_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "activity_log_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "round_robin_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "email_dropbox_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "contact_restore_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "contact_bulk_action_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "email_mailing_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "contact_map_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "text_msg_log_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "score_card_code_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "voice_call_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "mailing_queue_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "mail_merge_template_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "email_template_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "contact_excel_process_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "company_excel_process_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "fbc_email_template_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "my_documents_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "company_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "lead_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "invoice_report_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "active_lead_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "project_manager_revenue_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "project_revenue_classification_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "project_revenue_month_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "lead_two_dim_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "buzz_score_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "buzz_score_calculation_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              case "click_tracking_report_grid": {
                this.getGidColumnsConfigDynamic(result);
                break;
              }
              default:
                break;

            }
            this.showSpinner = false;
          }
          else
            this.showSpinner = false;
          observer.next("success");
        }).catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
        });
    });
  }

  getGidColumnsConfigDynamic(result) {
    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
    if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
      this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
    if (this.gridColumnsConfig && this.gridColumnsConfig.sortingColumn)
      this.sortingColumn = this.gridColumnsConfig.sortingColumn;
    if (this.gridColumnsConfig && this.gridColumnsConfig.columnWidth)
      this.columnWidth = this.gridColumnsConfig.columnWidth;
    if (this.gridColumnsConfig && this.gridColumnsConfig.pageSize)
      this.pageSize = this.gridColumnsConfig.pageSize;
  }

  createGetGridColumnsConfiguration(gridType) {
    return new Observable(observer => {
      this.copyDataObjectToAPIObject(gridType);
      this.showSpinner = true;
      this._gridColumnsConfigurationService.createGridColumnsConfiguration(this.encryptedUser, this.gridColumnsConfiguration)
        .then(result => {
          if (result) {
            this._gridColumnsConfigurationService.getGridColumnsConfiguration(this.encryptedUser, this.user.cLPUserID, gridType)
              .then(result => {
                if (result) {
                  switch (gridType) {
                    case "admin_company_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "account_storage_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "webform_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "announcement_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "user_setup_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "billing_history_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "tag_setting_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "contract_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "rep_setting_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "click_tracking_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "appt_type_summary_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "appt_type_summary_YTD_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "email_open_rate_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "custom_action_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "text_msg_template_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "referrer_report_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "user_pref_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "ticket_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "outlook_addin_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "activity_log_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "round_robin_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "email_dropbox_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "contact_restore_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "contact_bulk_action_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "email_mailing_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "contact_map_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "text_msg_log_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "score_card_code_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "voice_call_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "mailing_queue_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "mail_merge_template_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "email_template_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "contact_excel_process_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "company_excel_process_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "fbc_email_template_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "my_documents_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "company_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "lead_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "invoice_report_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "active_lead_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "project_manager_revenue_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "project_revenue_classification_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "project_revenue_month_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "lead_two_dim_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "buzz_score_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "buzz_score_calculation_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    case "click_tracking_report_grid": {
                      this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                      this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                      break;
                    }
                    default:
                      break;
                  }
                  this.showSpinner = false;
                }
                else
                  this.showSpinner = false;
                observer.next("success");
              }).catch((err: HttpErrorResponse) => {
                this.showSpinner = false;
                console.log(err);
              });
            this.showSpinner = false;
          }
          else
            this.showSpinner = false;
        }).catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          console.log(err);
        });
    });
  }

  copyDataObjectToAPIObject(Action: string) {
    switch (Action) {

      case "admin_company_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'admin_company_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "clpCompanyID,companyName,status,clpRole",
          panelsSize: ''
        }
        break;
      }

      case "account_storage_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'account_storage_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "firstName,spaceUsed",
          panelsSize: ''
        }
        break;
      }

      case "webform_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'webform_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "formName,link,cTCampaignTemplateID,allowDuplicates,cLPUserID,status,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "announcement_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'announcement_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "announceTitle,dtCreated,dtExpires,status,cLPCompanyID",
          panelsSize: ''
        }
        break;
      }
      case "user_setup_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'user_setup_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "cLPUserID,lastName,firstName,officeCode,teamCode,userName,timeZone,dateFormat,userRole,status,changePW,isShowCP,isAllowDownload",
          panelsSize: ''
        }
        break;
      }
      case "billing_history_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'billing_history_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "dtCreated,txnType,txnDescription,txnAmount,status",
          panelsSize: ''
        }
        break;
      }
      case "tag_setting_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'tag_setting_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "tag,contact",
          panelsSize: ''
        }
        break;
      }
      case "contract_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'contract_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "companyName,contractName,dtCreated,dtExpires,dtSigned,pH_Spot1",
          panelsSize: ''
        }
        break;
      }
      case "rep_setting_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'rep_setting_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "contractName,mailMergeTemplateID",
          panelsSize: ''
        }
        break;
      }
      case "click_tracking_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'click_tracking_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "click,replacementURL,sfaSettings,score",
          panelsSize: ''
        }
        break;
      }
      case "appt_type_summary_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'appt_type_summary_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "display,pending,completed,cancelled",
          panelsSize: ''
        }
        break;
      }
      case "appt_type_summary_YTD_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'appt_type_summary_YTD_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "display,pending,completed,cancelled",
          panelsSize: ''
        }
        break;
      }
      case "email_open_rate_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'email_open_rate_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "subject,emailType,all,opened,openRate,sentDate",
          panelsSize: ''
        }
        break;
      }
      case "custom_action_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'custom_action_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "formName,showEditContactLink,showAddToComments,showAddToHistory,bulkAppt,user,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "text_msg_template_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'text_msg_template_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "templateName,messageText,userName,shareable,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "referrer_report_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'referrer_report_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,count,email,amazon,companyName,userName,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "user_pref_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'user_pref_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "userCode,userDisplay,txtMsgLongCode,isCallForwardingLine,callForwardAPID,isClickToCallLine,isVCREnabled,isVoiceDropLine,isKMLEnabled,isSOLeadGen,isSingleSignOn,isVIPEnabled,isSGVIPEnabled",
          panelsSize: ''
        }
        break;
      }
      case "ticket_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'ticket_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "ticketID,ticketDesc,finder,fixer,dtLastModified,ticketCategory,ticketStatus",
          panelsSize: ''
        }
        break;
      }
      case "outlook_addin_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'outlook_addin_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "userCode,lastFirst,userRole,primaryAddMap,otherAddMap,outlookPluginVersion,allowSyncContact,allowSyncAppt,allowSyncEmail,adminStatus,status",
          panelsSize: ''
        }
        break;
      }
      case "activity_log_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'activity_log_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "dtCreated,userName,clpLogType,cLPSSID,isSupportLogin,note",
          panelsSize: ''
        }
        break;
      }
      case "round_robin_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'round_robin_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "roundRobinName,currentPositionID",
          panelsSize: ''
        }
        break;
      }
      case "email_dropbox_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'email_dropbox_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,username,cLPEmailDropBoxID,cLPCompanyID,cLPUserID,dropBox,processor,status",
          panelsSize: ''
        }
        break;
      }
      case "contact_restore_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'contact_restore_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,email,companyName,address:h,city:h,state:h,country:h,zip:h,emailAddress:h,phone,userName,dtModifiedDisplay,dtCreatedDisplay",
          panelsSize: ''
        }
        break;
      }
      case "contact_bulk_action_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'contact_bulk_action_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,email,companyName,address:h,city:h,state:h,country:h,zip:h,emailAddress:h,phone,userName,dtModifiedDisplay,dtCreatedDisplay",
          panelsSize: ''
        }
        break;
      }
      case "email_mailing_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'email_mailing_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,email,companyName,phone,userName,dtModifiedDisplay",
          panelsSize: ''
        }
        break;
      }
      case "contact_map_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'contact_map_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,email:h,companyName:h,address,city:h,state:h,country:h,zip:h,emailAddress:h,phone:h,userName:h,dtModifiedDisplay,dtCreatedDisplay",
          panelsSize: ''
        }
        break;
      }
      case "text_msg_log_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'text_msg_log_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,mobileNumber,email,text,msg,comments,action,kEYWORD,cONTENTS,user,dtReceived,dtSend,status",
          panelsSize: ''
        }
        break;
      }
      case "score_card_code_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'score_card_code_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "code,desc,projectedContactsAdded,contactsAdded,callCount,bipCreated,bipScheduled,bipRate,bipShow,bipShowRate,showsPerLead,bipSold,subSold,contracted,downPayment",
          panelsSize: ''
        }
        break;
      }
      case "voice_call_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'voice_call_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "user,team,office,contacts,calls,noRing,connected,less2min,bt2to5min,bt5to15min,bt15to30min,greater30min,answerRate,pitchRate,minutes,cpd",
          panelsSize: ''
        }
        break;
      }
      case "mailing_queue_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'mailing_queue_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "user,account,mailing,cnt",
          panelsSize: ''
        }
        break;
      }
      case "mail_merge_template_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'mail_merge_template_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "templateName,previewTemplate,userLastFirst,shareable,isUseBee,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "email_template_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'email_template_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "templateName,previewTemplate,userLastFirst,shareable,isUseBee,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "contact_excel_process_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'contact_excel_process_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "name,address,email,classification,owner,statusCode,actionToTake",
          panelsSize: ''
        }
        break;
      }
      case "company_excel_process_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'company_excel_process_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "companyName,addressDisplay,webSite,clpUserDisplay,systemNote,actionToTake",
          panelsSize: ''
        }
        break;
      }
      case "fbc_email_template_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'fbc_email_template_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "templateName,previewTemplate,status",
          panelsSize: ''
        }
        break;
      }
      case "my_documents_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'my_documents_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "documentType,documentName,documentCategory,location,documentLength,userName,dtCreated,isShared,update",
          panelsSize: ''
        }
        break;
      }
      case "company_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'company_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "companyName,webSite,phone,numContacts,city,state,cLPUserID,dtModified,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "lead_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'lead_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "leadDesc,lastFirst,companyName,ufirstName,dtStart,dtEnd,revenue,winProbability,leadStatusCode,dtModified,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "invoice_report_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'invoice_report_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "LeadDesc,FullName,InvoiceNumber,dtInvoiceShow,InvoiceShortDesc,Amount,MailMergeTemplateShow,UserName,StatusDisplay,dtModifiedDisplay,dtCreatedDisplay",
          panelsSize: ''
        }
        break;
      }
      case "active_lead_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'active_lead_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "leadDesc,lastFirst,companyName,ufirstName,dtStart,dtEnd,revenue,winProbability,leadStatusCode,dtModified,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "project_manager_revenue_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'project_manager_revenue_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "split,lead,revenue,probability,projected",
          panelsSize: ''
        }
        break;
      }
      case "project_revenue_classification_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'project_revenue_classification_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "split,lead,revenue,probability,projected",
          panelsSize: ''
        }
        break;
      }
      case "project_revenue_month_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'project_revenue_month_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "displayMonth,lead,projected,revenue,volume,probability",
          panelsSize: ''
        }
        break;
      }
      case "lead_two_dim_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'lead_two_dim_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "LeadDesc,ContractLast,CompanyName,NextTask,NextTaskDateDisplay,UserName,dtStartShow,dtCustom1Show,dtEndShow,dtRevenueShow,LeadClass9Display,VolumeShow,RevenueShow,WinProbability,ProjectedNetShow,StatusDisplay,dtModifiedDisplay,dtCreatedDisplay",
          panelsSize: ''
        }
        break;
      }
      case "buzz_score_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'buzz_score_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "firstName,email,phone,mobile,homePhone,uFirstName,score,event",
          panelsSize: ''
        }
        break;
      }
      case "buzz_score_calculation_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'buzz_score_calculation_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "score,type,dtCreated",
          panelsSize: ''
        }
        break;
      }
      case "click_tracking_report_grid": {
        this.gridColumnsConfiguration = {
          clpUserID: this.user ? this.user.cLPUserID : -1,
          tableName: 'click_tracking_report_grid',
          sortingColumn: this.sortingColumn,
          reorderColumnName: this.reorderColumnName,
          columnWidth: this.columnWidth,
          pageSize: this.pageSize,
          actualColumns: "destinationUrl,count",
          panelsSize: ''
        }
        break;
      }

      default:
        break;
    }
  }

  gridColumnsConfigurationCreate(gridType) {
    this.copyDataObjectToAPIObject(gridType);
    this._gridColumnsConfigurationService.createGridColumnsConfiguration(this.encryptedUser, this.gridColumnsConfiguration)
      .then(result => {
        if (result) {
          this._gridColumnsConfigurationService.getGridColumnsConfiguration(this.encryptedUser, this.user.cLPUserID, gridType)
            .then(result => {
              if (result) {
                switch (gridType) {
                  case "admin_company_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "account_storage_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "webform_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "announcement_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "user_setup_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "billing_history_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "tag_setting_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "contract_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "rep_setting_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "click_tracking_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "appt_type_summary_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "appt_type_summary_YTD_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "email_open_rate_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "custom_action_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "text_msg_template_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "referrer_report_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "user_pref_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "ticket_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "outlook_addin_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "activity_log_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "round_robin_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "email_dropbox_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "contact_restore_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "contact_bulk_action_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "email_mailing_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "contact_map_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "text_msg_log_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "score_card_code_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "voice_call_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "mailing_queue_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "mail_merge_template_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "email_template_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "contact_excel_process_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "company_excel_process_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "fbc_email_template_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "my_documents_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "company_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "lead_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "invoice_report_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "active_lead_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "project_manager_revenue_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "project_revenue_classification_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "project_revenue_month_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "lead_two_dim_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "buzz_score_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "buzz_score_calculation_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  case "click_tracking_report_grid": {
                    this.gridColumnsConfigurationResponse = UtilityService.clone(result);
                    this.gridColumnsConfig = this.gridColumnsConfigurationResponse.gridColumnsConfiguration;
                    this.showSpinner = false;
                    break;
                  }
                  default:
                    break;
                }
              }
              else
                this.showSpinner = false;
            }).catch((err: HttpErrorResponse) => {
              this.showSpinner = false;
              console.log(err);
            });
        }
      }).catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
      });

  }

  columnsOrderChanged(gridType, e) {
    switch (gridType) {
      case "admin_company_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "account_storage_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "webform_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "announcement_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "user_setup_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "billing_history_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "tag_setting_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "contract_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "rep_setting_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "click_tracking_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "appt_type_summary_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "appt_type_summary_YTD_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "email_open_rate_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "custom_action_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "text_msg_template_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "referrer_report_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "user_pref_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "ticket_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "outlook_addin_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "activity_log_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "round_robin_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "email_dropbox_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "contact_restore_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "contact_bulk_action_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "email_mailing_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "contact_map_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "text_msg_log_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "score_card_code_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "voice_call_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "mailing_queue_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "mail_merge_template_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "email_template_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "contact_excel_process_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "company_excel_process_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "fbc_email_template_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "my_documents_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "company_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "lead_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "invoice_report_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "active_lead_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "project_manager_revenue_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "project_revenue_classification_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "project_revenue_month_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "lead_two_dim_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "buzz_score_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "buzz_score_calculation_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      case "click_tracking_report_grid": {
        this.orderChangeDynamic(e);
        break;
      }
      default:
        break;
    }
    this.gridColumnsConfigurationCreate(gridType);

  }
  orderChangeDynamic(e) {

    var columnsArr = this.columns;

    var initColumnsArr = this.columns;
    var mappedinitColumnsArr = initColumnsArr.map(a => a.field);
    var self = this;
    var array3 = mappedinitColumnsArr.filter(function (obj) { return self.hiddenColumns.indexOf(obj) == -1; });
    var oldField = array3[e.oldIndex];
    var newField = array3[e.newIndex];
    var oldIndex = columnsArr.findIndex(obj => obj.field == oldField);
    var newIndex = columnsArr.findIndex(obj => obj.field == newField);

    if (oldIndex == -1 || newIndex == -1)
      e.preventDefault();
    else {
      this.showSpinner = true;
      var element = columnsArr[oldIndex];
      columnsArr.splice(oldIndex, 1);
      columnsArr.splice(newIndex, 0, element);
      var mappedArr = columnsArr.map(a => a.field);
      if (this.hiddenColumns.length > 0) {
        for (var i = 0; i < this.hiddenColumns.length; i++) {
          for (var j = 0; j < mappedArr.length; j++) {
            if (mappedArr[j] == this.hiddenColumns[i]) {
              mappedArr[j] = mappedArr[j] + ':h';
            }
          }
        }
      }
      var result = mappedArr.filter(e => !e.includes('$'));
      var reorderStr = result.join();

      var columnWidthArr = [];
      var widthColumnArr = this.columns;
      for (var i = 0; i < widthColumnArr.length; i++) {
        if (widthColumnArr[i].field && widthColumnArr[i].field != '$')
          columnWidthArr.push(widthColumnArr[i].field + ':' + widthColumnArr[i].width);
      }
      var widthColumnsStr = columnWidthArr.join();

      this.columnWidth = widthColumnsStr;
      this.reorderColumnName = reorderStr;

    }

  }

  sortChange(gridType, e) {
    this.arrSortingColumn = [];
    switch (gridType) {
      case "admin_company_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "account_storage_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "webform_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "announcement_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "user_setup_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "billing_history_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "tag_setting_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "contract_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "rep_setting_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "click_tracking_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "appt_type_summary_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "appt_type_summary_YTD_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "email_open_rate_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "custom_action_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "text_msg_template_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "referrer_report_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "user_pref_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "ticket_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "outlook_addin_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "activity_log_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "round_robin_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "email_dropbox_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "contact_restore_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "contact_bulk_action_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "email_mailing_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "contact_map_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "text_msg_log_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "score_card_code_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "voice_call_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "mailing_queue_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "mail_merge_template_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "email_template_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "contact_excel_process_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "company_excel_process_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "fbc_email_template_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "my_documents_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "company_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "lead_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "invoice_report_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "active_lead_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "project_manager_revenue_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "project_revenue_classification_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "project_revenue_month_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "lead_two_dim_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "buzz_score_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "buzz_score_calculation_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      case "click_tracking_report_grid": {
        this.sortChangeDynamic(e);
        break;
      }
      default:
        break;
    }
    this.gridColumnsConfigurationCreate(gridType);
  }

  sortChangeDynamic(e) {
    this.showSpinner = true;
    if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
      this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
    if (this.gridColumnsConfig && this.gridColumnsConfig.pageSize)
      this.pageSize = this.gridColumnsConfig.pageSize;
    if (e.length > 0) {
      for (var i = 0; i < e.length; i++) {
        if (e[i].field != '$')
          this.arrSortingColumn.push(e[i].field + ':' + e[i].dir);
      }
      var result = this.arrSortingColumn.filter(e => !e.includes('$'));
      result = result.filter((a, b) => result.indexOf(a) === b)
      var sortingStr = result.join();
      this.sortingColumn = sortingStr;
    }
  }

  pageChange(gridType, event: PageChangeEvent): void {
    this.showSpinner = true;
    if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
      this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
    if (this.gridColumnsConfig && this.gridColumnsConfig.sortingColumn)
      this.sortingColumn = this.gridColumnsConfig.sortingColumn
    if (this.gridColumnsConfig && this.gridColumnsConfig.columnWidth)
      this.columnWidth = this.gridColumnsConfig.columnWidth;

    var gridType = gridType;
    this.pageSize = event.take;
    this.gridColumnsConfigurationCreate(gridType);
  }

  columnResize(noColumns: number = 0, gridType: string, e) {
    var diffColWidth = 0;
    var hiddenColLen = this.hiddenColumns.length;
    var totalColumns = noColumns - (hiddenColLen ? hiddenColLen : 0);
    if (e.length > 0) {
      var diff = e[0].newWidth - e[0].oldWidth;
      diffColWidth = Math.floor(diff / totalColumns);
    }

    switch (gridType) {
      case "admin_company_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }

      case "account_storage_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "webform_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "announcement_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "user_setup_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "billing_history_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "tag_setting_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "contract_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "rep_setting_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "click_tracking_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "appt_type_summary_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "appt_type_summary_YTD_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "email_open_rate_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "custom_action_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "text_msg_template_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "referrer_report_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "user_pref_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "ticket_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "outlook_addin_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "activity_log_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "round_robin_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "email_dropbox_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "contact_restore_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "contact_bulk_action_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "email_mailing_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "contact_map_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "text_msg_log_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "score_card_code_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "voice_call_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "mailing_queue_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "mail_merge_template_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "email_template_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "contact_excel_process_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "company_excel_process_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "fbc_email_template_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "my_documents_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "company_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "lead_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "invoice_report_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "active_lead_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "project_manager_revenue_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "project_revenue_classification_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "project_revenue_month_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "lead_two_dim_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "buzz_score_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "buzz_score_calculation_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      case "click_tracking_report_grid": {
        this.reSizeColumnDynamic(diffColWidth, e);
        break;
      }
      default:
        break;
    }
    this.gridColumnsConfigurationCreate(gridType);
  }

  reSizeColumnDynamic(diffColWidth, e) {
    this.showSpinner = true;
    if (this.gridColumnsConfig && this.gridColumnsConfig.reorderColumnName)
      this.reorderColumnName = this.gridColumnsConfig.reorderColumnName;
    if (this.gridColumnsConfig && this.gridColumnsConfig.pageSize)
      this.pageSize = this.gridColumnsConfig.pageSize;
    if (this.gridColumnsConfig.columnWidth) {
      var columnWidths = this.gridColumnsConfig.columnWidth;
      var columnWidthsArr = columnWidths.split(',');
      for (var j = 0; j < columnWidthsArr.length; j++) {
        var splitField = columnWidthsArr[j].split(':');
        if (splitField.length > 0 && splitField[0] == e[0].column.field)
          columnWidthsArr[j] = e[0].column.field + ':' + e[0].newWidth;
        else {
          var field: any = columnWidthsArr[j].split(':')[0];
          var width = columnWidthsArr[j].split(':')[1];
          var diffWidth: any = Math.floor(Number(width) - diffColWidth);
          columnWidthsArr[j] = field + ":" + diffWidth;
        }

      }
      var result = columnWidthsArr.filter(x => !x.includes('$'));
      result = result.filter((a, b) => result.indexOf(a) === b)
      var resizeStr = result.join();
      this.columnWidth = resizeStr;
    }
    else {
      for (var j = 0; j < this.arrColumnWidth.length; j++) {
        var arrSplitField = this.arrColumnWidth[j].split(':');
        if (arrSplitField.length > 0 && arrSplitField[0] == e[0].column.field)
          this.arrColumnWidth[j] = e[0].column.field + ':' + e[0].newWidth;
        else {
          var field: any = this.arrColumnWidth[j].split(':')[0];
          var widthR = this.arrColumnWidth[j].split(':')[1];
          var diffWidth: any = Math.floor(Number(widthR) - diffColWidth);
          this.arrColumnWidth[j] = field + ":" + diffWidth;
        }
      }
      var columnWidthresult = this.arrColumnWidth.filter(x => !x.includes('$'));
      columnWidthresult = columnWidthresult.filter((a, b) => columnWidthresult.indexOf(a) === b)
      var resizeStrResult = columnWidthresult.join();
      this.columnWidth = resizeStrResult;
    }
  }

  public onVisibilityChange(e: any, gridType, grid): void {
    switch (gridType) {
      case "admin_company_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "account_storage_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "webform_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "announcement_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "user_setup_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "billing_history_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "tag_setting_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "contract_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "rep_setting_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "click_tracking_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "appt_type_summary_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "appt_type_summary_YTD_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "email_open_rate_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "custom_action_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "text_msg_template_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "referrer_report_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "user_pref_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "ticket_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "outlook_addin_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "activity_log_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "round_robin_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "email_dropbox_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "contact_restore_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "contact_bulk_action_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "email_mailing_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "mailing_queue_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "mail_merge_template_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "email_template_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "contact_excel_process_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "company_excel_process_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "fbc_email_template_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "my_documents_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "company_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "lead_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "invoice_report_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "active_lead_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "project_manager_revenue_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "project_revenue_classification_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "project_revenue_month_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "lead_two_dim_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "buzz_score_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "buzz_score_calculation_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      case "click_tracking_report_grid": {
        this.visibilityChangeDynamic(e);
        break;
      }
      default:
        break;
    }
    this.gridColumnsConfigurationCreate(gridType);
    this.ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      grid.autoFitColumns();
      grid.resizeColumn;
    });
  }

  visibilityChangeDynamic(e: any) {
    this.showSpinner = true;

    e.columns.forEach(column => {
      if (column.hidden == true) {
        var obj = this.gridColumnMenuRemovedArr.find(col => col.field === column.field);
        this.hiddenColumns.push(obj.field);
        obj.field = obj.field + ':h';

      }
      else if (column.hidden == false) {
        for (var j = 0; j < this.columns.length; j++) {
          if (this.columns[j].title.charAt(0).toUpperCase() + this.columns[j].title.slice(1) == column.title) {
            var splitValueArr = this.gridColumnMenuRemovedArr[j].field.split(':');
            if (splitValueArr.length > 0) {
              this.gridColumnMenuRemovedArr[j].field = this.gridColumnMenuRemovedArr[j].field.split(':')[0];

              var index = this.hiddenColumns.indexOf(this.gridColumnMenuRemovedArr[j].field);
              this.hiddenColumns.splice(index, 1);
            }
          }
        }

      }

      if (this.hiddenColumns.length > 0) {
        for (var i = 0; i < this.hiddenColumns.length; i++) {
          for (var j = 0; j < this.gridColumnMenuRemovedArr.length; j++) {
            if (this.gridColumnMenuRemovedArr[j].field === this.hiddenColumns[i]) {
              var field = this.hiddenColumns[i];
              this.gridColumnMenuRemovedArr[j].field = field + ':h';
            }
          }
        }
      }

    });

    var mappedArr = this.gridColumnMenuRemovedArr.map(a => a.field);
    var result = mappedArr.filter(e => !e.includes('$'));
    var reorderStr = result.join();

    if (this.hiddenColumns.length > 0) {
      this.hiddenColumns.forEach(column => {
        for (var j = 0; j < this.columns.length; j++) {
          var splitField = this.columns[j].field.split(':');
          if (splitField.length > 0 && splitField[0] == column) {
            this.columns[j].field = column;
          }
        }
      });
    }

    var columnWidthArr = [];
    var widthColumnArr = this.gridColumnMenuRemovedArr;
    for (var i = 0; i < widthColumnArr.length; i++) {
      if (widthColumnArr[i].field)
        columnWidthArr.push(widthColumnArr[i].field + ':' + widthColumnArr[i].width);
    }
    var result = columnWidthArr.filter(e => !e.includes('$'));
    var widthColumnsStr = result.join();

    this.columnWidth = widthColumnsStr;
    this.reorderColumnName = reorderStr;

  }

  deleteColumnsConfiguration(clpUserId, tableName) {
    return new Observable(observer => {
      this.showSpinner = true;
      this._gridColumnsConfigurationService.deleteGridColumnsConfiguration(this.encryptedUser, clpUserId, tableName)
        .then(result => {
          observer.next("success");
        }).catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
        });
    });
  }
}
