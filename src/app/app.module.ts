import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
//contact-Module
import { DatePipe, DecimalPipe } from '@angular/common';
import { AngularFileUploaderModule } from "angular-file-uploader";

import { MatTableExporterModule } from 'mat-table-exporter';
import { GridModule, PDFModule, ExcelModule } from '@progress/kendo-angular-grid';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from "@progress/kendo-angular-label";
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { IconsModule } from '@progress/kendo-angular-icons';
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';
import { SVGIcon } from '@progress/kendo-svg-icons';
import { ListViewModule } from "@progress/kendo-angular-listview";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { EditorModule } from "@progress/kendo-angular-editor";
import { IntlModule } from "@progress/kendo-angular-intl";
import { SortableModule } from "@progress/kendo-angular-sortable";
//contact-module
import { SchedulerModule, ToolbarService } from '@progress/kendo-angular-scheduler';

import { SortablejsModule } from 'ngx-sortablejs';
import { MenusModule } from '@progress/kendo-angular-menu';

//material and custom controls
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

import { AppComponent } from './app.component';

import { MissingCredentialsComponent } from './UI/login-module/shared/missing-credentials/missing-credentials.component';
import { LoginComponent } from './UI/login-module//login/login.component';
import { PasswordPolicyComponent } from './UI/login-module//password-policy/password-policy.component';
import { AdminUserAcctComponent } from './UI/login-module//admin-user-acct/admin-user-acct.component';
import { SignUpComponent } from './UI/login-module/sign-up/sign-up.component';
import { AuthenticateComponent } from './shared/authenticate.component';

//contact-module components
import { ContactListComponent } from './UI/contact-module/contactList/contactList.component';
import { ContactComponent } from './UI/contact-module/contact/contact.component';
import { SearchComponent } from './UI/contact-module/shared/search/search.component';
import { ContactCallComponent } from './UI/contact-module/common/contact-call/contact-call.component';
import { ContactEmailComponent } from './UI/contact-module/common/contact-email/contact-email.component';
import { PaginationComponent } from './UI/contact-module/common/pagination/pagination.component';
import { ContactSearchComponent } from './UI/contact-module/common/contact-search/contact-search.component';
import { ContactSmsComponent } from './UI/contact-module/common/contact-sms/contact-sms.component';
import { ContactActivityHistoryComponent } from './UI/contact-module/common/contact-activity-history/contact-activity-history.component';
import { ContactTaskComponent } from './UI/contact-module/common/contact-task/contact-task.component';
import { ContactNoteComponent } from './UI/contact-module/common/contact-note/contact-note.component';
import { ContactSettingsComponent } from './UI/contact-module/common/contact-settings/contact-settings.component';
import { ContactMeetingComponent } from './UI/contact-module/common/contact-meeting/contact-meeting.component';
import { ContactDetailComponent } from './UI/contact-module/contact-detail/contact-detail.component';
import { ContactCreateComponent } from './UI/contact-module/contact-create/contact-create.component';

import { TextMsgSettingComponent } from './UI/settings/text-msg-setting/text-msg-setting.component';
import { UserSetupComponent } from './UI/settings/user-setup/user-setup.component';
import { AccountSetupComponent } from './UI/settings/account-setup/account-setup.component';
import { RoleSetupComponent } from './UI/settings/role-setup/role-setup.component';
import { CompanySetupComponent } from './UI/settings/company-setup/company-setup.component';
import { ApptSettingsComponent } from './UI/settings/appt-settings/appt-settings.component';

import { ContactService } from './services/contact.service';
import { LocalService } from './services/shared/local.service';
import { SearchContactService } from './services/Searchcontact.service';
import { ContactSearchService } from './services/shared/contact-search.service';
import { OutBoundEmailService } from './services/outBoundEmail.service';
import { TaskService } from './services/task.service';
import { NotesService } from './services/notes.service';
import { OutBoundTextMsgService } from './services/outBoundTextMsg.service';
import { SignupService } from './services/signup.service';
import { AccountSetupService } from './services/accountSetup.service';
import { BilligService } from './services/billing.service';
import { TxtMsgService } from './services/textmsg.service';
import { htmlEmailPricingService } from './services/htmlEmailPricing.service';
import { ZipService } from './services/zip.service';
import { ClassCodeService } from './services/classCode.service';
import { AppointmentSettingService } from './services/appointmentSetting.service';
import { CompanySettingService } from './services/companySetting.service';
import { ServicesStatusService } from './services/services-status.service';
import { MenuService } from './services/menu.service';

import { MatNativeDateModule } from '@angular/material/core';

//pipes
import { PhoneFormatePipe } from './pipes/phone-format';
import { safehtmlpipe } from './pipes/safeHtml.pipe';
//End Contact-module

import { PasswordPolicyService } from './services/password-policy.service';
import { EncryptionService } from './services/shared/encryption.service';
import { GlobalService } from './services/global.service';
import { UtilityService } from './services/shared/utility.service';
import { AuthenticateService } from './services/authenticate.service';

//Shared component
import { NavMenuComponent } from './UI/shared/nav-menu/nav-menu.component';
import { LiveConnectComponent } from './UI/live-connect/live-connect.component';
import { AutomationProcessComponent } from './UI/automation-process/automation-process.component';
import { ConfigurationComponent } from './UI/configuration/configuration.component';
//Shared component


import { NgxMatIntlTelInputModule } from 'ngx-mat-intl-tel-input';

import { OnlyNumberDirective } from './directive/only-number.directive';
import { NgxtForDirective } from './directive/ngxtFor.directive';
import { UserProfileComponent } from './UI/login-module/user-profile/user-profile.component';
import { TeamofficeSetupComponent } from './UI/settings/teamoffice-setup/teamoffice-setup.component';
import { TeamOfficeSetupService } from './services/teamoffice.service';
import { OfficeSetupService } from './services/officeCode.service';
import { VoiceSettingComponent } from './UI/settings/voice-setting/voice-setting.component';
import { TagSettingComponent } from './UI/settings/tag-setting/tag-setting.component';
import { RepSettingsComponent } from './UI/settings/rep-settings/rep-settings.component';
import { ContractComponent } from './UI/settings/contract/contract.component';
import { WebformManagerComponent } from './UI/settings/webform-manager/webform-manager.component';
import { WorkflowComponent } from './UI/settings/workflow/workflow.component';
import { WebformComponent } from './UI/settings/webform/webform.component';
import { RoundRobinComponent } from './UI/settings/round-robin/round-robin.component';
import { PagerModule } from '@progress/kendo-angular-pager';
import { CompanyConfigurationComponent } from './UI/settings/common/company-configuration/company-configuration.component';
import { AnnouncementsComponent } from './UI/settings/so-admin/announcements/announcements.component';
import { AccountSettingComponent } from './UI/settings/so-admin/account-setting/account-setting.component';
import { LeadConfigurationComponent } from './UI/settings/common/lead-configuration/lead-configuration.component';
import { AdminPasswordFormComponent } from './UI/settings/common/admin-password-form/admin-password-form.component';
import { AdminCompanyListComponent } from './UI/settings/common/admin-company-list/admin-company-list.component';
import { ApplyCreditComponent } from './UI/settings/common/apply-credit/apply-credit.component';
import { TicketsComponent } from './UI/settings/common/tickets/tickets.component';
import { ServicesStatusComponent } from './UI/settings/so-admin/services-status/services-status.component';
import { AccountCreditCardComponent } from './UI/settings/common/account-credit-card/account-credit-card.component';
import { AccountBillingHistoryComponent } from './UI/settings/common/account-billing-history/account-billing-history.component';
import { AccountHtmlEmailComponent } from './UI/settings/common/account-html-email/account-html-email.component';
import { DocumentStorageComponent } from './UI/settings/common/document-storage/document-storage.component';
import { CompanyModuleComponent } from './UI/settings/common/company-module/company-module.component';
import { AccountStorageSummaryComponent } from './UI/settings/common/account-storage-summary/account-storage-summary.component';
import { AccountInfoComponent } from './UI/settings/common/account-info/account-info.component';
import { OutlookAddinComponent } from './UI/settings/common/outlook-addin/outlook-addin.component';
import { UserPreferenceComponent } from './UI/settings/common/user-preference/user-preference.component';
import { ApiSettingComponent } from './UI/settings/common/api-setting/api-setting.component';
import { ActivityLogComponent } from './UI/settings/common/activity-log/activity-log.component';
import { IphoneSettingComponent } from './UI/settings/common/iphone-setting/iphone-setting.component';
import { EmailDropboxSettingComponent } from './UI/settings/common/email-dropbox-setting/email-dropbox-setting.component';
import { TransferUserComponent } from './UI/settings/common/transfer-user/transfer-user.component';
import { SmtpsettingComponent } from './UI/settings/common/smtpsetting/smtpsetting.component';
import { ContactArchiveComponent } from './UI/contact-module/common/contact-archive/contact-archive.component';
import { ContactCommonSearchComponent } from './UI/contact-module/common/contact-common-search/contact-common-search.component';
import { SecuritySettingComponent } from './UI/settings/security-setting/security-setting.component';
import { OutlookSecurityComponent } from './UI/settings/outlook-security/outlook-security.component';
import { ContactMapComponent } from './UI/contact-module/common/contact-map/contact-map.component';
import { ContactMapCommonComponent } from './UI/contact-module/common/contact-map-common/contact-map-common.component';
import { ImportSfaComponent } from './UI/settings/common/import-sfa/import-sfa.component'
import { ClickTrackingComponent } from './UI/click-tracking/click-tracking.component';
import { MyCalenderComponent } from './UI/contact-module/common/my-calender/my-calender.component';
import { CustomActionComponent } from './UI/custom-action/custom-action.component';
import { ContactUploadExcelComponent } from './UI/contact-module/contact-upload-excel/contact-upload-excel.component';
import { BulkContactActionsComponent } from './UI/contact-module/bulk-contact-actions/bulk-contact-actions.component';
import { MyCalenderService } from './services/my-calender.service';
import { BulkContactCommonComponent } from './UI/contact-module/common/bulk-contact-common/bulk-contact-common.component';
import { MailMergeTemplateComponent } from './UI/mail-merge-template/mail-merge-template.component';
import { EmailTemplateComponent } from './UI/email-template/email-template.component';
import { TemplatePreviewComponent } from './UI/template-preview/template-preview.component';
import { FbcEmailTemplateComponent } from './UI/fbc-email-template/fbc-email-template.component';
import { TextMsgTemplateComponent } from './UI/text-msg-template/text-msg-template.component';
import { ImageBankComponent } from './UI/image-bank/image-bank.component';
import { ManageDuplicateComponent } from './UI/contact-module/manage-duplicate/manage-duplicate.component';
import { ContactDuplicateComponent } from './UI/contact-module/common/contact-duplicate/contact-duplicate.component';
import { MyDocumentsComponent } from './UI/my-documents/my-documents.component';
import { AppointmentCommonComponent } from './UI/contact-module/common/appointment-common/appointment-common.component';
import { EmailBlastComponent } from './UI/email-blast/email-blast.component';
import { ApptTypeSummaryComponent } from './UI/reports/activity/appt-type-summary/appt-type-summary.component';
import { ApptTwoDimensionsComponent } from './UI/reports/activity/appt-two-dimensions/appt-two-dimensions.component';
import { CompanyComponent } from './UI/company-module/company/company.component';
import { CompanyListComponent } from './UI/company-module/company-list/company-list.component';
import { QualificationCallReportComponent } from './UI/reports/activity/qualification-call-report/qualification-call-report.component';
import { NoteTypeSummaryComponent } from './UI/reports/activity/note-type-summary/note-type-summary.component';
import { CallClickReportComponent } from './UI/reports/activity/call-click-report/call-click-report.component';
import { EmailOpenRateReportComponent } from './UI/reports/activity/email-open-rate-report/email-open-rate-report.component';
import { TextMsgLogComponent } from './UI/reports/activity/text-msg-log/text-msg-log.component';
import { CoachCornerComponent } from './UI/reports/activity/coach-corner/coach-corner.component';
import { DistTwoDimensionsComponent } from './UI/reports/activity/dist-two-dimensions/dist-two-dimensions.component';
import { DistributionByManagerComponent } from './UI/reports/activity/distribution-by-manager/distribution-by-manager.component';
import { DistributionByClassificationComponent } from './UI/reports/contact/distribution-by-classification/distribution-by-classification.component';
import { DistributionTwoDimensionsComponent } from './UI/reports/contact/distribution-two-dimensions/distribution-two-dimensions.component';
import { VoiceCallReportComponent } from './UI/reports/activity/voice-call-report/voice-call-report.component';
import { ReferralReportComponent } from './UI/reports/contact/referral-report/referral-report.component';
import { CompanyCreateComponent } from './UI/company-module/company-create/company-create.component';
import { LeadCreateComponent } from './UI/lead-module/lead-create/lead-create.component';
import { ContactExportsComponent } from './UI/contact-module/common/contact-exports/contact-exports.component';
import { LeadListComponent } from './UI/lead-module/lead-list/lead-list.component';
import { ProjectRevenueManagerComponent } from './UI/reports/lead/project-revenue-manager/project-revenue-manager.component';
import { ProjectRevenueClassificationComponent } from './UI/reports/lead/project-revenue-classification/project-revenue-classification.component';
import { LeadComponent } from './UI/lead-module/lead/lead.component';
import { LeadHistoryComponent } from './UI/lead-module/lead-history/lead-history.component';
import { LeadApptComponent } from './UI/lead-module/common/lead-appt/lead-appt.component';
import { LinkGroupComponent } from './UI/lead-module/common/link-group/link-group.component';
import { QuickLinkComponent } from './UI/lead-module/common/quick-link/quick-link.component';
import { LinkGroupService } from './services/link-group.service';
import { LeadSettingService } from './services/leadSetting.service';
import { InvoiceReportComponent } from './UI/reports/lead/invoice-report/invoice-report.component';
import { ProjectRevenueByMonthComponent } from './UI/reports/lead/project-revenue-by-month/project-revenue-by-month.component';
import { UploadDocumentComponent } from './UI/lead-module/common/upload-document/upload-document.component';
import { DistributionByTwoDimensionsComponent } from './UI/reports/lead/distribution-by-two-dimensions/distribution-by-two-dimensions.component';
import { LeadEmailComponent } from './UI/lead-module/common/lead-email/lead-email.component';
import { BuzzScoreComponent } from './UI/reports/contact/buzz-score/buzz-score.component';
import { ReferralReportCommonComponent } from './UI/reports/contact/referral-report-common/referral-report-common.component';
import { ClickTrackingReportComponent } from './UI/reports/contact/click-tracking-report/click-tracking-report.component';
import { TagCloudComponent } from './UI/reports/contact/tag-cloud/tag-cloud.component';
import { GoalsComponent } from './UI/goals-module/goals/goals.component';
import { GoalsListComponent } from './UI/goals-module/goals-list/goals-list.component';
import { GoalsSetupComponent } from './UI/goals-module/goals-setup/goals-setup.component';
import { GoalComponent } from './UI/goals-module/common/goal/goal.component';
import { SearchResultCommonComponent } from './UI/reports/search-result-common/search-result-common.component';
import { GoalSetupListComponent } from './UI/goals-module/common/goal-setup-list/goal-setup-list.component';
import { ScoreCardCommonComponent } from './UI/reports/custom/score-card-common/score-card-common.component';
import { ApptSettersActivityComponent } from './UI/reports/custom/appt-setters-activity/appt-setters-activity.component';
import { AgreementsDashboardComponent } from './UI/reports/custom/agreements-dashboard/agreements-dashboard.component';
import { ScorecardByCodeComponent } from './UI/reports/custom/scorecard-by-code/scorecard-by-code.component';
import { ScorecardByKeywordComponent } from './UI/reports/custom/scorecard-by-keyword/scorecard-by-keyword.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserProfileComponent,
    PasswordPolicyComponent,
    MissingCredentialsComponent,
    AdminUserAcctComponent,
    SignUpComponent,
    AuthenticateComponent,
    //contact-module component
    ContactListComponent,
    PhoneFormatePipe,
    safehtmlpipe,
    ContactComponent,
    MissingCredentialsComponent,
    SearchComponent,
    ContactCallComponent,
    ContactEmailComponent,
    PaginationComponent,
    ContactSearchComponent,
    ContactSmsComponent,
    ContactActivityHistoryComponent,
    ContactTaskComponent,
    ContactNoteComponent,
    ContactSettingsComponent,
    ContactMeetingComponent,
    ContactDetailComponent,
    ContactCreateComponent,
    //End Contact-module
    //Shared
    NavMenuComponent,
    LiveConnectComponent,
    AutomationProcessComponent,
    ConfigurationComponent,
    //Shared

    //directive
    OnlyNumberDirective,
    NgxtForDirective,
    //End directive

    UserSetupComponent,
    TextMsgSettingComponent,
    RoleSetupComponent,
    AccountSetupComponent,
    CompanySetupComponent,
    ApptSettingsComponent,
    TagSettingComponent,
    TeamofficeSetupComponent,
    VoiceSettingComponent,
    RepSettingsComponent,
    ContractComponent,
    WebformManagerComponent,
    WebformComponent,
    RoundRobinComponent,
    WorkflowComponent,
    CompanyConfigurationComponent,
    LeadConfigurationComponent,
    AdminPasswordFormComponent,
    AdminCompanyListComponent,
    ApplyCreditComponent,
    TicketsComponent,
    AnnouncementsComponent,
    AccountSettingComponent,
    ServicesStatusComponent,
    AccountInfoComponent,
    OutlookAddinComponent,
    UserPreferenceComponent,
    ApiSettingComponent,
    ActivityLogComponent,
    AccountCreditCardComponent,
    AccountBillingHistoryComponent,
    AccountHtmlEmailComponent,
    DocumentStorageComponent,
    CompanyModuleComponent,
    AccountStorageSummaryComponent,
    IphoneSettingComponent,
    EmailDropboxSettingComponent,
    TransferUserComponent,
    SmtpsettingComponent,
    ContactArchiveComponent,
    ContactCommonSearchComponent,
    SecuritySettingComponent,
    OutlookSecurityComponent,
    ContactMapComponent,
    ContactMapCommonComponent,
    ImportSfaComponent,
    ClickTrackingComponent,
    MyCalenderComponent,
    CustomActionComponent,
    ContactUploadExcelComponent,
    BulkContactActionsComponent,
    BulkContactCommonComponent,
    MailMergeTemplateComponent,
    EmailTemplateComponent,
    TemplatePreviewComponent,
    FbcEmailTemplateComponent,
    TextMsgTemplateComponent,
    ImageBankComponent,
    ManageDuplicateComponent,
    ContactDuplicateComponent,
    MyDocumentsComponent,
    AppointmentCommonComponent,
    EmailBlastComponent,
    ApptTypeSummaryComponent,
    ApptTwoDimensionsComponent,
    CompanyListComponent,
    CompanyComponent,
    QualificationCallReportComponent,
    NoteTypeSummaryComponent,
    CallClickReportComponent,
    EmailOpenRateReportComponent,
    TextMsgLogComponent,
    CoachCornerComponent,
    DistTwoDimensionsComponent,
    CompanyCreateComponent,
    LeadCreateComponent,
    LeadListComponent,
    LeadComponent,
    DistributionByManagerComponent,
    DistributionByClassificationComponent,
    DistributionTwoDimensionsComponent,
    ContactExportsComponent,
    ProjectRevenueManagerComponent,
    ProjectRevenueClassificationComponent,
    VoiceCallReportComponent,
    LeadHistoryComponent,
    LeadApptComponent,
    LinkGroupComponent,
    InvoiceReportComponent,
    ProjectRevenueByMonthComponent,
    QuickLinkComponent,
    UploadDocumentComponent,
    ReferralReportComponent,
    ReferralReportCommonComponent,
    DistributionByTwoDimensionsComponent,
    LeadEmailComponent,
    BuzzScoreComponent,
    ClickTrackingReportComponent,
    TagCloudComponent,
    GoalComponent,
    GoalsComponent,
    GoalsListComponent,
    GoalsSetupComponent,
    SearchResultCommonComponent,
    GoalSetupListComponent,
    ApptSettersActivityComponent,
    AgreementsDashboardComponent,
    ScorecardByCodeComponent,
    ScoreCardCommonComponent,
    ScorecardByKeywordComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    SchedulerModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MenusModule,
    NgxMatIntlTelInputModule,

    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSortModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatGridListModule,
    MatListModule,
    MatSidenavModule,
    MatSliderModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatProgressBarModule,
    MatRippleModule,
    MatDividerModule,
    PagerModule,
    ScrollingModule,
    ToastrModule.forRoot(),
    NgxMaskModule.forRoot(options),

    SortablejsModule.forRoot({
      animation: 150
    }),

    //contact-module
    BrowserAnimationsModule,
    GridModule,
    ChartsModule,
    InputsModule,
    LabelModule,
    PDFModule,
    ExcelModule,
    PDFExportModule,
    ExcelExportModule,
    ListViewModule,
    ButtonsModule,
    EditorModule,
    SortableModule,
    IntlModule,
    DropDownsModule,
    DateInputsModule,
    LayoutModule,
    IconsModule,
    MatTableExporterModule,
    DragDropModule,
    MatNativeDateModule,
    AngularFileUploaderModule,
    //contact-module

    RouterModule.forRoot([
      { path: '', component: LoginComponent },
      { path: 'login', component: LoginComponent },
      { path: 'AdminPassPolicy', component: PasswordPolicyComponent },
      { path: 'unauthorized', component: MissingCredentialsComponent },
      { path: 'AdminUserAcct', component: AdminUserAcctComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'authenticate', component: AuthenticateComponent },
      //contact-module
      { path: 'search', component: SearchComponent },
      { path: 'archive-contacts', component: ContactArchiveComponent },
      { path: 'upload-contacts', component: ContactUploadExcelComponent },
      { path: 'manage-duplicates', component: ManageDuplicateComponent },
      { path: 'bulk-contacts', component: BulkContactActionsComponent },
      { path: 'map-contacts', component: ContactMapComponent },
      { path: 'contacts', component: ContactListComponent },
      { path: 'recent-contacts', component: ContactListComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'contact/:clpUserId/:contactID', component: ContactComponent },
      { path: 'contact-create', component: ContactDetailComponent },
      //contact-module
      { path: 'live-connect', component: LiveConnectComponent },
      { path: 'automation-process', component: AutomationProcessComponent },
      { path: 'configuration', component: ConfigurationComponent },
      //settings
      { path: 'account-setup', component: AccountSetupComponent },
      { path: 'role-setup', component: RoleSetupComponent },
      { path: 'user-setup', component: UserSetupComponent },
      { path: 'text-msg-settings', component: TextMsgSettingComponent },
      { path: 'voice-settings', component: VoiceSettingComponent },
      { path: 'rep-settings', component: RepSettingsComponent },
      { path: 'company-setup', component: CompanySetupComponent },
      { path: 'edit-profile/:userId', component: UserProfileComponent },
      { path: 'teamoffice-setup', component: TeamofficeSetupComponent },
      { path: 'appt-settings', component: ApptSettingsComponent },
      { path: 'company-settings', component: ApptSettingsComponent },
      { path: 'contact-settings', component: ApptSettingsComponent },
      { path: 'lead-settings', component: ApptSettingsComponent },
      { path: 'tag-settings', component: TagSettingComponent },
      { path: 'webform', component: WebformManagerComponent },
      { path: 'workflow', component: WorkflowComponent },
      { path: 'announcements', component: AnnouncementsComponent },
      { path: 'account-setting', component: AccountSettingComponent },
      { path: 'services-status', component: ServicesStatusComponent },
      { path: 'security-setting', component: SecuritySettingComponent },
      { path: 'outlook-security-setting', component: OutlookSecurityComponent },
      { path: 'contract/:sOSCID/:sOSCContractID/:mailMergeTemplateID/:cLPCompanyID/:teamCode', component: ContractComponent },
      { path: 'click-tracking', component: ClickTrackingComponent },
      { path: 'mail-merge-template', component: MailMergeTemplateComponent },
      { path: 'email-template', component: EmailTemplateComponent },
      { path: 'custom-action', component: CustomActionComponent },
      { path: 'template-preview/:mid', component: TemplatePreviewComponent },
      { path: 'fbc-template', component: FbcEmailTemplateComponent },
      { path: 'text-template', component: TextMsgTemplateComponent },
      { path: 'image-bank', component: ImageBankComponent },
      { path: 'my-documents', component: MyDocumentsComponent },
      { path: 'calender', component: MyCalenderComponent },
      { path: 'appointment', component: AppointmentCommonComponent },
      { path: 'email-blast', component: EmailBlastComponent },
      //Reports Section
      { path: 'report/appttype', component: ApptTypeSummaryComponent },
      { path: 'report/appt2dim', component: ApptTwoDimensionsComponent },
      { path: 'calendar/rptqualcall', component: QualificationCallReportComponent },
      { path: 'report/notetype', component: NoteTypeSummaryComponent },
      { path: 'workflow/rptcasclick', component: CallClickReportComponent },
      { path: 'report/emailopenreport', component: EmailOpenRateReportComponent },
      { path: 'txtmsg/txtmsglist', component: TextMsgLogComponent },
      { path: 'report/rptuseractivity', component: CoachCornerComponent },
      { path: 'voice/rptvoicecall', component: VoiceCallReportComponent },
      { path: 'company/rpt2dim', component: DistTwoDimensionsComponent },
      { path: 'contact/rptdist_mng', component: DistributionByManagerComponent },
      { path: 'contact/rptdist_mng/:df/:dtCreated/:incZero/:dm1/:dm1val', component: DistributionByManagerComponent },
      { path: 'contact/rptdist_class', component: DistributionByClassificationComponent },
      { path: 'contact/rptdist_class/:df/:dtCreated/:incZero/:dm1/:dm1val', component: DistributionByManagerComponent },
      { path: 'contact/rpt2dim', component: DistributionTwoDimensionsComponent },
      { path: 'lead/rptinvoice', component: InvoiceReportComponent },
      { path: 'report/rptreferral', component: ReferralReportComponent },
      { path: 'company', component: CompanyListComponent },
      { path: 'bulk-company', component: CompanyListComponent },
      { path: 'lead-create', component: LeadCreateComponent },
      { path: 'lead', component: LeadListComponent },
      { path: 'active-leads', component: LeadListComponent },
      { path: 'project-revenue-manager', component: ProjectRevenueManagerComponent },
      { path: 'project-revenue-classification', component: ProjectRevenueClassificationComponent },
      { path: 'project-revenue-month', component: ProjectRevenueByMonthComponent },
      { path: 'company-create', component: CompanyCreateComponent },
      { path: 'lead-detail/:leadId/:userName/:companyName/:contactId', component: LeadComponent },
      { path: 'link-group/:linkId', component: LinkGroupComponent },
      { path: 'rpt2dim', component: DistributionByTwoDimensionsComponent },
      { path: 'rpt2dim/:dm1val/:dm2val/:ms/:st/:ed/:ur/:dm1/:dm2', component: DistributionByTwoDimensionsComponent },
      { path: 'buzz-score', component: BuzzScoreComponent },
      { path: 'click-tracking-rpt', component: ClickTrackingReportComponent },
      { path: 'tag-cloud', component: TagCloudComponent },
      {
        path: 'goal', component: GoalsComponent, children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: GoalsListComponent },
          { path: 'setup', component: GoalsSetupComponent}
        ]
      },
      { path: 'custom/rpt_ihapptsetters', component: ApptSettersActivityComponent },
      { path: 'custom/agreement-dashboard', component: AgreementsDashboardComponent },
      { path: 'custom/rpt_ihscorecardbycode', component: ScorecardByCodeComponent },
      { path: 'custom/rpt_ihscorecardbykeyword', component: ScorecardByKeywordComponent },
      
      


      //Default Route. (declare route before default Route)
      { path: '**', redirectTo: '/contacts' }
    ]),

  ],
  providers: [PasswordPolicyService, EncryptionService, GlobalService, UtilityService, AuthenticateService,
    ContactService, LocalService, SearchContactService, ContactSearchService, OutBoundEmailService,
    TaskService, NotesService, OutBoundTextMsgService, SignupService, AccountSetupService,
    TeamOfficeSetupService, BilligService, ZipService, ClassCodeService, AppointmentSettingService,
    CompanySettingService, OfficeSetupService, DatePipe, TxtMsgService, ServicesStatusService, MenuService,
    htmlEmailPricingService, MyCalenderService, ToolbarService, Title, DecimalPipe, LinkGroupService, LeadSettingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
