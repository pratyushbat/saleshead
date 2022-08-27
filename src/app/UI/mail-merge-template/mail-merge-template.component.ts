import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../models/clpuser.model';
import { MailMergeTemplate } from '../../models/emailTemplate.model';
import { eFeatures, eUserRole } from '../../models/enum.model';
import { SimpleResponse, UserDD } from '../../models/genericResponse.model';
import { process } from '@progress/kendo-data-query';
import { BEEResponse, MailMergeTemplateLoad, Marketing_MailMergeResponse } from '../../models/marketing.model';
import { RoleFeaturePermissions } from '../../models/roleContainer.model';
import { GridColumnsConfigurationService } from '../../services/gridColumnsConfiguration.service';
import { MarketingService } from '../../services/marketing.service';
import { NotificationService } from '../../services/notification.service';
import { GridConfigurationService } from '../../services/shared/gridConfiguration.service';
import { LocalService } from '../../services/shared/local.service';
import { UtilityService } from '../../services/shared/utility.service';
import Bee from '@mailupinc/bee-plugin';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'mail-merge-template',
  templateUrl: './mail-merge-template.component.html',
  styleUrls: ['./mail-merge-template.component.css'],
  providers: [GridConfigurationService]
})
/** mail-merge-template component*/
export class MailMergeTemplateComponent {

  gridHeight;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  showSpinner: boolean = false;
  userId: number;
  selectedUserId: number;
  public mailMergeTemplateList: MailMergeTemplate[];
  public initMailMergeTemplateList: MailMergeTemplate[];
  mailMergeTemplateResponse: MailMergeTemplateLoad;
  public userList: UserDD[];
  roleFeaturePermissions: RoleFeaturePermissions;
  mailMergeResponse: MailMergeTemplate[];
  private beeResponse: BEEResponse;
  isShowView: boolean = false;
  isShow: string = '';
  isShowEditPanel: boolean = false;
  isScratch: boolean = false;
  isOwnHtml: boolean = false;
  isHtmlEditor: boolean = false;
  user: CLPUser;
  beeClientId: string = '';
  templateName: string = '';
  orgTempName: string = '';
  mailMergeId: number = 0;
  htmlDisplay: any;
  isShareable: boolean;
  owner: number;
  userLastFirst: string = '';
  templateJson: string;
  isUseBee: string = "";
  beeSecret: string = '';
  isNewTemplate: boolean = false;
  isShowDelete: boolean = false;
  @ViewChild('beeContainer', { static: false }) beeContainer: ElementRef;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;

  columns = [{ field: '$', title: '', width: '40' },
  { field: 'mailMergeTemplateID:h', title: 'ID', width: '200' },
  { field: 'templateName', title: 'Template Name', width: '200' },
  { field: 'previewTemplate', title: 'Preview Template', width: '100' },
  { field: 'userLastFirst', title: 'User', width: '100' },
  { field: 'shareable', title: 'Sharing', width: '100' },
  { field: 'isUseBee', title: 'Editor', width: '100' },
  { field: 'dtCreated', title: 'Created', width: '100' }];
  reorderColumnName: string = 'templateName,previewTemplate,userLastFirst,shareable,isUseBee,dtCreated';
  columnWidth: string = 'templateName:200,previewTemplate:100,userLastFirst:100,shareable:100,isUseBee:100,dtCreated:100';
  arrColumnWidth: any[] = ['templateName:200,previewTemplate:100,userLastFirst:100,shareable:100,isUseBee:100,dtCreated:100'];
  mobileColumnNames: string[];
  /** mail-merge-template ctor */
  constructor(public _gridCnfgService: GridConfigurationService,
    private _notifyService: NotificationService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router,
    private _marketingService: MarketingService,
    public _gridColumnsConfigurationService: GridColumnsConfigurationService, private _sanitizer: DomSanitizer) {

    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('493px');
  }

  ngOnInit(): void {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getGridConfiguration();
          this.userId = this.user.cLPUserID;
          this.selectedUserId = this.user.cLPUserID;
          this.loadBee();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.MailMergeTemplates)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this._gridCnfgService.user = this.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              if (this.user?.userRole <= eUserRole.Administrator) {
                if (this.roleFeaturePermissions?.view == false)
                  this._router.navigate(['/unauthorized'], { state: { isMenu: true } });
              }
              this.showSpinner = false;
            }
          }
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'mail_merge_template_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('mail_merge_template_grid').subscribe((value) => this.getMailMergeTemplateList()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'mail_merge_template_grid').subscribe((value) => this.getGridConfiguration());
  }

  async loadBee() {
    this.showSpinner = true;
    await this._marketingService.getBEEEmailConfig(this.encryptedUser)
      .then(async (result: BEEResponse) => {
        if (result) {
          this.beeResponse = UtilityService.clone(result);
          this.beeClientId = this.beeResponse.beeDetails.clientId;
          this.beeSecret = this.beeResponse.beeDetails.secret;
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async getMailMergeTemplateList() {
    this.showSpinner = true;
    await this._marketingService.getMailMergeTemplateList(this.encryptedUser, this.user.cLPCompanyID, this.userId, this.selectedUserId, null)
      .then(async (result: Marketing_MailMergeResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.mailMergeTemplateList = response.mailMergeList;
          this.initMailMergeTemplateList = response.mailMergeList;
          var mailMergeResponse = response.mailMergeList.length;
          this.userList = response.UserList;
          if (!isNullOrUndefined(this.mailMergeTemplateList) && mailMergeResponse > 0) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('mail_merge_template_grid');
            this._gridCnfgService.iterateConfigGrid(mailMergeResponse, "mail_merge_template_grid");
          }

          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async loadMailMergeTemplate(mailMergeTemplateId) {
    this.showSpinner = true;
    await this._marketingService.loadMailMergeTemplate(this.encryptedUser, mailMergeTemplateId)
      .then(async (result: MailMergeTemplateLoad) => {
        if (result) {
          this.mailMergeTemplateResponse = UtilityService.clone(result);
          this.templateName = this.mailMergeTemplateResponse.templateName;
          this.htmlDisplay = this.mailMergeTemplateResponse.hTMLText;
          this.templateJson = this.mailMergeTemplateResponse.jsonText;
          this.isUseBee = this.mailMergeTemplateResponse.isUseBee ? 'Advanced' : 'Basic';
          this.isShareable = this.mailMergeTemplateResponse.shareable == true;
          this.owner = this.mailMergeTemplateResponse.cLPUserid;
          this.userLastFirst = this.mailMergeTemplateResponse.userLastFirst;
          this.mailMergeId = this.mailMergeTemplateResponse.mailMergeTemplateID;
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  getTemplatesByUser(userId) {
    this.selectedUserId = userId;
    this.getMailMergeTemplateList();
  }

  getTemplatesByEditor(editorId) {
    var editorText;
    if (editorId == 1) {
      editorText = "Advanced"
    } else {
      editorText = "Basic"
    }
    if (editorId == -1) {
      this.mailMergeTemplateList = this.initMailMergeTemplateList;
    } else if (editorText == "Advanced") {
      this.mailMergeTemplateList = this.initMailMergeTemplateList.filter(item => {
        return item.isUseBee == editorText;
      });
    } else if ((editorText == "Basic")) {
      this.mailMergeTemplateList = this.initMailMergeTemplateList.filter(item => {
        return item.isUseBee == editorText;
      });
    }
  }

  onMailMergeTemplateFilter(inputValue: string): void {
    this.mailMergeTemplateList = process(this.initMailMergeTemplateList, {
      filter: {
        logic: "or",
        filters: [
          { field: 'templateName', operator: 'contains', value: inputValue },
          { field: 'userLastFirst', operator: 'contains', value: inputValue },
          { field: 'isUseBee', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  fillDataAndLoad(t, op) {

    this.isNewTemplate = false;
    switch (op) {
      case "viewPanel": {
        this.loadMailMergeTemplate(t);
        this.isShowView = true;
        this.isShow = 'editMailMerge';
        break;
      }
      case "editPanel": {
        this.isShowView = true;
        this.isShowDelete = false;
        this.templateName = this.mailMergeTemplateResponse.templateName;
        this.owner = this.mailMergeTemplateResponse.cLPUserid;
        this.isShow = 'editMailMerge';
        this.isShowEditPanel = true;
        if (this.isUseBee == "Advanced") {
          this.loadTemplateEditor(this.mailMergeId, this.isUseBee);
        }

        break;
      }
      case "copyPanel": {
        this.mailMergeId = 0;
        this.isShowDelete = true;
        this.templateName = "Copy of" + this.mailMergeTemplateResponse.templateName;
        this.owner = this.user.cLPUserID;
        this.isShowView = true;
        this.isShow = 'editMailMerge';
        this.isShowEditPanel = true;
        if (this.isUseBee == "Advanced") {
          this.loadTemplateEditor(this.mailMergeId, this.isUseBee);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  startFromScratch() {
    this.isNewTemplate = false;
    this.isScratch = true;
    this.isOwnHtml = false;
    this.isShowView = true;
    this.isShow = 'addNew';
    this.isShowEditPanel = true;
    this.loadTemplateEditor(0, 'Advanced');
  }

  useOwnHtml() {
    this.isNewTemplate = false;
    this.isScratch = false;
    this.isOwnHtml = true;
    this.isShowView = true;
    this.isShow = 'addNew';
    this.isShowEditPanel = true;
  }

  addNew() {
    this.isNewTemplate = true;
    this.orgTempName = '';
    this.templateName = 'New Template';
    this.htmlDisplay = '';
    this.templateJson = JSON.stringify(
      { "page": { "body": { "container": { "style": { "background-color": "#FFFFFF" } }, "content": { "computedStyle": { "linkColor": "#0000FF", "messageBackgroundColor": "transparent", "messageWidth": "500px" }, "style": { "color": "#000000", "font-family": "Arial, Helvetica Neue, Helvetica, sans-serif" } }, "type": "mailup-bee-page-proprerties" }, "description": "", "rows": [{ "columns": [{ "grid-columns": 6, "modules": [], "style": { "background-color": "transparent", "border-bottom": "0px solid transparent", "border-left": "0px solid transparent", "border-right": "0px solid transparent", "border-top": "0px solid transparent", "padding-bottom": "15px", "padding-left": "0px", "padding-right": "0px", "padding-top": "15px" }, "uuid": "81ec888a-7b23-48b0-a2cb-a6562c1ce4b1" }, { "grid-columns": 6, "modules": [], "style": { "background-color": "transparent", "border-bottom": "0px solid transparent", "border-left": "0px solid transparent", "border-right": "0px solid transparent", "border-top": "0px solid transparent", "padding-bottom": "15px", "padding-left": "0px", "padding-right": "0px", "padding-top": "15px" }, "uuid": "120da050-4c6e-4bb4-bc76-eb3c167b5dbf" }], "container": { "style": { "background-color": "#D9D9D9" } }, "content": { "style": { "background-color": "transparent", "color": "#333", "width": "500px" } }, "name": "Two Columns (Text and Text)", "type": "two-columns-text", "widgets": [{ "items": [{ "configuration": { "label": "mailup-bee-common-widgets-background-color-row.label" }, "context": "container.style", "type": "mailup-bee-common-widgets-background-color" }, { "configuration": { "label": "mailup-bee-common-widgets-background-color-content.label" }, "context": "content.style", "type": "mailup-bee-common-widgets-background-color" }], "type": "row" }, { "items": [{ "configuration": { "label": "mailup-bee-common-widgets-background-color-column.label" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-background-color" }, { "configuration": { "label": "mailup-bee-common-widgets-padding.label", "label-all-sides": "mailup-bee-common-widgets-padding.all-sides", "label-bottom": "mailup-bee-common-widgets-padding.bottom", "label-left": "mailup-bee-common-widgets-padding.left", "label-more-options": "mailup-bee-common-widgets-padding.more-options", "label-right": "mailup-bee-common-widgets-padding.right", "label-top": "mailup-bee-common-widgets-padding.top" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-padding" }, { "configuration": { "label": "mailup-bee-common-widgets-border.label", "label-all-sides": "mailup-bee-common-widgets-border.all-sides", "label-bottom": "mailup-bee-common-widgets-border.bottom", "label-left": "mailup-bee-common-widgets-border.left", "label-more-options": "mailup-bee-common-widgets-border.more-options", "label-right": "mailup-bee-common-widgets-border.right", "label-top": "mailup-bee-common-widgets-border.top" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-border" }], "name": "column-property-titles.1", "type": "column" }, { "items": [{ "configuration": { "label": "mailup-bee-common-widgets-background-color-column.label" }, "context": "columns[1].style", "type": "mailup-bee-common-widgets-background-color" }, { "configuration": { "label": "mailup-bee-common-widgets-padding.label", "label-all-sides": "mailup-bee-common-widgets-padding.all-sides", "label-bottom": "mailup-bee-common-widgets-padding.bottom", "label-left": "mailup-bee-common-widgets-padding.left", "label-more-options": "mailup-bee-common-widgets-padding.more-options", "label-right": "mailup-bee-common-widgets-padding.right", "label-top": "mailup-bee-common-widgets-padding.top" }, "context": "columns[1].style", "type": "mailup-bee-common-widgets-padding" }, { "configuration": { "label": "mailup-bee-common-widgets-border.label", "label-all-sides": "mailup-bee-common-widgets-border.all-sides", "label-bottom": "mailup-bee-common-widgets-border.bottom", "label-left": "mailup-bee-common-widgets-border.left", "label-more-options": "mailup-bee-common-widgets-border.more-options", "label-right": "mailup-bee-common-widgets-border.right", "label-top": "mailup-bee-common-widgets-border.top" }, "context": "columns[1].style", "type": "mailup-bee-common-widgets-border" }], "name": "column-property-titles.2", "type": "column" }], "uuid": "7dd462c9-04ab-4f52-88e1-c2ebd1694047" }, { "columns": [{ "grid-columns": 12, "modules": [{ "descriptor": { "computedStyle": { "align": "center" }, "divider": { "style": { "border-top": "10px solid transparent", "width": "100%" } }, "style": { "padding-bottom": "10px", "padding-left": "10px", "padding-right": "10px", "padding-top": "10px" } }, "name": "mailup-bee-newsletter-modules-divider.name", "type": "mailup-bee-newsletter-modules-divider", "widgets": [{ "items": [{ "configuration": { "label": "mailup-bee-common-widgets-padding.label", "label-all-sides": "mailup-bee-common-widgets-padding.all-sides", "label-bottom": "mailup-bee-common-widgets-padding.bottom", "label-left": "mailup-bee-common-widgets-padding.left", "label-more-options": "mailup-bee-common-widgets-padding.more-options", "label-right": "mailup-bee-common-widgets-padding.right", "label-top": "mailup-bee-common-widgets-padding.top" }, "context": "descriptor.style", "type": "mailup-bee-common-widgets-padding" }], "name": "widget-groups.module-options" }, { "items": [{ "configuration": { "label": "mailup-bee-common-widgets-divider-mode.label", "label-align": "mailup-bee-common-widgets-divider-mode.align", "label-height": "mailup-bee-common-widgets-divider-mode.height", "label-line": "mailup-bee-common-widgets-divider-mode.line", "label-spacer-mode": "mailup-bee-common-widgets-divider-mode.spacer-mode", "label-width": "mailup-bee-common-widgets-divider-mode.width" }, "context": "descriptor", "type": "mailup-bee-common-widgets-divider-mode" }], "name": "widget-groups.divider-options" }], "uuid": "160d672d-4111-4c16-a5f5-2b768c4acf46" }], "style": { "background-color": "transparent", "border-bottom": "0px solid transparent", "border-left": "0px solid transparent", "border-right": "0px solid transparent", "border-top": "0px solid transparent", "padding-bottom": "5px", "padding-left": "0px", "padding-right": "0px", "padding-top": "5px" }, "uuid": "978995a4-de27-4aae-adfd-b0bbac791865" }], "container": { "style": { "background-color": "transparent" } }, "content": { "style": { "background-color": "transparent", "color": "#333", "width": "500px" } }, "name": "One Column (Text)", "type": "one-column-text", "widgets": [{ "items": [{ "configuration": { "label": "mailup-bee-common-widgets-background-color-row.label" }, "context": "container.style", "type": "mailup-bee-common-widgets-background-color" }, { "configuration": { "label": "mailup-bee-common-widgets-background-color-content.label" }, "context": "content.style", "type": "mailup-bee-common-widgets-background-color" }], "type": "row" }, { "items": [{ "configuration": { "label": "mailup-bee-common-widgets-background-color-column.label" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-background-color" }, { "configuration": { "label": "mailup-bee-common-widgets-padding.label", "label-all-sides": "mailup-bee-common-widgets-padding.all-sides", "label-bottom": "mailup-bee-common-widgets-padding.bottom", "label-left": "mailup-bee-common-widgets-padding.left", "label-more-options": "mailup-bee-common-widgets-padding.more-options", "label-right": "mailup-bee-common-widgets-padding.right", "label-top": "mailup-bee-common-widgets-padding.top" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-padding" }, { "configuration": { "label": "mailup-bee-common-widgets-border.label", "label-all-sides": "mailup-bee-common-widgets-border.all-sides", "label-bottom": "mailup-bee-common-widgets-border.bottom", "label-left": "mailup-bee-common-widgets-border.left", "label-more-options": "mailup-bee-common-widgets-border.more-options", "label-right": "mailup-bee-common-widgets-border.right", "label-top": "mailup-bee-common-widgets-border.top" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-border" }], "name": "column-property-titles.1", "type": "column" }], "uuid": "d30c4f4c-8dba-4326-88b4-cb41ccb9b891" }, { "columns": [{ "grid-columns": 12, "modules": [{ "descriptor": { "computedStyle": { "align": "center" }, "divider": { "style": { "border-top": "1px solid #dddddd", "width": "100%" } }, "style": { "padding-bottom": "20px", "padding-left": "10px", "padding-right": "10px", "padding-top": "10px" } }, "name": "mailup-bee-newsletter-modules-divider.name", "type": "mailup-bee-newsletter-modules-divider", "widgets": [{ "items": [{ "configuration": { "label": "mailup-bee-common-widgets-padding.label", "label-all-sides": "mailup-bee-common-widgets-padding.all-sides", "label-bottom": "mailup-bee-common-widgets-padding.bottom", "label-left": "mailup-bee-common-widgets-padding.left", "label-more-options": "mailup-bee-common-widgets-padding.more-options", "label-right": "mailup-bee-common-widgets-padding.right", "label-top": "mailup-bee-common-widgets-padding.top" }, "context": "descriptor.style", "type": "mailup-bee-common-widgets-padding" }], "name": "widget-groups.module-options" }, { "items": [{ "configuration": { "label": "mailup-bee-common-widgets-divider-mode.label", "label-align": "mailup-bee-common-widgets-divider-mode.align", "label-height": "mailup-bee-common-widgets-divider-mode.height", "label-line": "mailup-bee-common-widgets-divider-mode.line", "label-spacer-mode": "mailup-bee-common-widgets-divider-mode.spacer-mode", "label-width": "mailup-bee-common-widgets-divider-mode.width" }, "context": "descriptor", "type": "mailup-bee-common-widgets-divider-mode" }], "name": "widget-groups.divider-options" }], "uuid": "a35e4069-3406-4d5c-bec6-c6c1b9361ceb" }], "style": { "background-color": "transparent", "border-bottom": "0px solid transparent", "border-left": "0px solid transparent", "border-right": "0px solid transparent", "border-top": "0px solid transparent", "padding-bottom": "5px", "padding-left": "0px", "padding-right": "0px", "padding-top": "5px" }, "uuid": "d86eab2e-5643-4f0c-b4f5-d340db6b80d3" }], "container": { "style": { "background-color": "transparent" } }, "content": { "style": { "background-color": "transparent", "color": "#000000", "width": "500px" } }, "name": "One Column (Empty)", "type": "one-column-empty", "widgets": [{ "items": [{ "configuration": { "label": "mailup-bee-common-widgets-background-color-row.label" }, "context": "container.style", "type": "mailup-bee-common-widgets-background-color" }, { "configuration": { "label": "mailup-bee-common-widgets-background-color-content.label" }, "context": "content.style", "type": "mailup-bee-common-widgets-background-color" }], "type": "row" }, { "items": [{ "configuration": { "label": "mailup-bee-common-widgets-background-color-column.label" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-background-color" }, { "configuration": { "label": "mailup-bee-common-widgets-padding.label", "label-all-sides": "mailup-bee-common-widgets-padding.all-sides", "label-bottom": "mailup-bee-common-widgets-padding.bottom", "label-left": "mailup-bee-common-widgets-padding.left", "label-more-options": "mailup-bee-common-widgets-padding.more-options", "label-right": "mailup-bee-common-widgets-padding.right", "label-top": "mailup-bee-common-widgets-padding.top" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-padding" }, { "configuration": { "label": "mailup-bee-common-widgets-border.label", "label-all-sides": "mailup-bee-common-widgets-border.all-sides", "label-bottom": "mailup-bee-common-widgets-border.bottom", "label-left": "mailup-bee-common-widgets-border.left", "label-more-options": "mailup-bee-common-widgets-border.more-options", "label-right": "mailup-bee-common-widgets-border.right", "label-top": "mailup-bee-common-widgets-border.top" }, "context": "columns[0].style", "type": "mailup-bee-common-widgets-border" }], "name": "column-property-titles.1", "type": "column" }], "uuid": "991308fe-6ff9-40ea-a33f-cd9c61d0089a" }], "template": { "name": "template-base", "type": "basic", "version": "0.0.1" }, "title": "" }, "comments": {} }
    );
    this.isUseBee = '';
    this.isShareable = false;
    this.owner = this.user.cLPUserID;
    this.userLastFirst = '';
    this.mailMergeId = 0;
    this.isShowView = true;
    this.isShow = 'addNew';
    this.isShowEditPanel = false;
  }

  backToList() {
    this.isShowView = false;
    this.isShowEditPanel = false;
    this.isShow = '';
    this.isScratch = false;
    this.isOwnHtml = false;
    this.getMailMergeTemplateList();
  }

  backFromEditPanel() {
    this.isShowView = true;
    this.isShowEditPanel = false;
  }

  openHtmlEditor() {
    this.isHtmlEditor = true;
  }

  openTextEditor() {
    this.isHtmlEditor = false;
  }

  public loadTemplateEditor(mailMergeId, isUseBee) {
    const beeEditor = new Bee();
    const beeConfig = {
      uid: 'sc_' + this.user.cLPUserID,
      container: 'bee-plugin-container',
      autosave: 360,
      language: 'en-US',
      editorFonts: {
        showDefaultFonts: true,
        customFonts: [{
          name: "Raleway",
          fontFamily: "'Raleway', Georgia, Times, serif",
          url: "https://fonts.googleapis.com/css?family=Raleway"
        },
        {
          name: "Avenir",
          fontFamily: "'Avenir', Montserrat, Arial, serif",
          url: "https://fonts.googleapis.com/css?family=Avenir"
        },
        {
          name: "AvenirNext",
          fontFamily: "'AvenirNext', Montserrat, Arial, serif",
          url: "https://dev.slidecast.com/assets/fonts/AvenirNext/avenir_next.css"
        },
        {
          name: "AvenirDemi",
          fontFamily: "'AvenirDemi', Montserrat, Arial, serif",
          url: "https://dev.slidecast.com/assets/fonts/AvenirNext/avenir_demi.css"
        }]
      },
      onLoad: () => {

      },
      onSave: (jsonFile, htmlFile) => {
        this.saveMailMergeTemplate(mailMergeId, jsonFile, htmlFile);
      },
      onSaveAsTemplate: (jsonFile) => {
      },
      onSend: (htmlFile) => {
      },
      onError: (errorMessage) => {
      }
    };

    beeEditor.getToken(this.beeClientId, this.beeSecret).then(() => beeEditor.start(beeConfig, JSON.parse(this.templateJson)));
  }

  async deleteMailMerge() {
    await this._marketingService.deleteMailMergeTemplate(this.mailMergeId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Mail Merge Template Deleted Successfully.", "", 3000);
          this.restartForm();
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  async saveMailMergeTemplate(id, jsonFile, htmlFile) {
    let mailMergeTemplateField: MailMergeTemplateLoad = <MailMergeTemplateLoad>{};
    mailMergeTemplateField.cLPCompanyID = this.user.cLPCompanyID;
    mailMergeTemplateField.cLPUserid = this.owner;
    mailMergeTemplateField.hTMLText = htmlFile;
    mailMergeTemplateField.isUseBee = jsonFile == '' ? false : jsonFile == 'Basic' ? false : true;
    mailMergeTemplateField.jsonText = jsonFile;
    mailMergeTemplateField.mailMergeTemplateID = id;
    mailMergeTemplateField.shareable = this.isShareable;
    mailMergeTemplateField.templateName = this.templateName;
    await this._marketingService.saveMailMergeTemplate(mailMergeTemplateField)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Mail Merge Template Saved Successfully.", "", 3000);
          this.isShowView = true;
          this.isNewTemplate = false;
          this.isShowEditPanel = false;
          this.isShow = 'editMailMerge';
          this.loadMailMergeTemplate(result.messageInt);
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });
  }

  restartForm() {
    this.isShowView = false;
    this.isShow = '';
    this.isShowEditPanel = false;
    this.isScratch = false;
    this.isOwnHtml = false;
    this.isHtmlEditor = false;
    this.getMailMergeTemplateList();
  }

  setHtmlText(id) {
    var text = this.initMailMergeTemplateList.filter(item => {
      return item.mailMergeTemplateID == id;
    })[0];
    localStorage.setItem('object', JSON.stringify(text.hTMLText));
    const url = this._router.serializeUrl(
      this._router.createUrlTree([`/template-preview/${id}`])
    );
    window.open(url)
  }

  setHtmlTextForNewTemp(id) {
    localStorage.setItem('object', JSON.stringify(this.htmlDisplay));
    const url = this._router.serializeUrl(
      this._router.createUrlTree([`/template-preview/${id}`])
    );
    window.open(url)
  }
  showEditFields() {
    if ((this.isShow == 'editMailMerge' || 'addNew') && this.isShowEditPanel == true) {
      return true;
    } else {
      return false;
    }
  }

  showEditFieldsBasic() {
    if (this.isOwnHtml == true || this.isUseBee == 'Basic') {
      return true;
    } else {
      return false;
    }
  }

  showEditFieldsAdvanced() {
    if (this.isScratch == true || this.isUseBee == 'Advanced') {
      return true;
    } else {
      return false;
    }
  }
}
