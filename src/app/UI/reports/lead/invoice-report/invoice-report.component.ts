import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { LeadInvoiceResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { CompanyFieldsResponse, ContactFilters } from '../../../../models/company.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { ReportService } from '../../../../services/report.service';
import { ContactService } from '../../../../services/contact.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.component.html',
  styleUrls: ['./invoice-report.component.css'],
  providers: [GridConfigurationService]
})
export class InvoiceReportComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  userList: ContactFilters[];
  total: number = 0;
  invoiceLeadResponce: LeadInvoiceResponse;
  invoiceForm: FormGroup;
  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: 'LeadDesc', title: 'Lead', width: '60' },
    { field: 'FullName', title: 'Contact', width: '80' },
    { field: 'InvoiceNumber', title: 'Number', width: '100' },
    { field: 'dtInvoiceShow', title: 'Date', width: '100' },
    { field: 'InvoiceShortDesc', title: 'Description', width: '280' },
    { field: 'Amount', title: 'Amount', width: '60' },
    { field: 'MailMergeTemplateShow', title: 'Mail Merge Template', width: '150' },
    { field: 'UserName', title: 'User', width: '80' },
    { field: 'StatusDisplay', title: 'Status', width: '60' },
    { field: 'dtModifiedDisplay', title: 'Modified', width: '60' },
    { field: 'dtCreatedDisplay', title: 'Created', width: '60' },
  ];
  reorderColumnName: string = 'LeadDesc,FullName,InvoiceNumber,dtInvoiceShow,InvoiceShortDesc,Amount,MailMergeTemplateShow,UserName,StatusDisplay,dtModifiedDisplay,dtCreatedDisplay';
  columnWidth: string = 'LeadDesc:60,FullName:80,InvoiceNumber:100,dtInvoiceShow:100,InvoiceShortDesc:280,Amount:60,MailMergeTemplateShow:150,UserName:80,StatusDisplay:60,dtModifiedDisplay:60,dtCreatedDisplay:60';
  arrColumnWidth: any[] = ['LeadDesc:60,FullName:80,InvoiceNumber:100,dtInvoiceShow:100,InvoiceShortDesc:280,Amount:60,MailMergeTemplateShow:150,UserName:80,StatusDisplay:60,dtModifiedDisplay:60,dtCreatedDisplay:60'];

  constructor(private fb: FormBuilder,
    private _accountSetupService: AccountSetupService,
    public router: Router,
    private _reportService: ReportService,
    public _contactService: ContactService,
    private datepipe: DatePipe,
    public _gridCnfgService: GridConfigurationService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;

  }

  ngOnInit(): void {
    this.invoiceForm = this.prepareInvoiceForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getUserList();
          this.getGridConfiguration();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser,)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this._gridCnfgService.user = this.user;
              this.invoiceForm = this.prepareInvoiceForm();
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
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'invoice_report_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('invoice_report_grid').subscribe((value) => this.getInvoiceList()));
  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'invoice_report_grid').subscribe((value) => this.getGridConfiguration());
  }

  async getUserList() {
    this.showSpinner = true;
    await this._accountSetupService.companyFields_GetConfiguration(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: CompanyFieldsResponse) => {
        if (result) {
          const response = UtilityService.clone(result);
          this.userList = response.companyFields.cLPUserID.items;
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getInvoiceList() {
    this.showSpinner = true;
    this.total = 0;
    let startDate = this.invoiceForm.controls.startDate.value != '' && !isNullOrUndefined(this.invoiceForm.controls.startDate.value) ? this.datepipe.transform(this.invoiceForm.controls.startDate.value, 'yyyy-MM-dd') : '';
    let endDate = this.invoiceForm.controls.endDate.value != '' && !isNullOrUndefined(this.invoiceForm.controls.endDate.value) ? this.datepipe.transform(this.invoiceForm.controls.endDate.value, 'yyyy-MM-dd') : '';
    await this._reportService.getLeadInvoiceReport(this.encryptedUser, this.user.cLPCompanyID, startDate, endDate, this.user.cLPUserID, 0, this.invoiceForm.controls.invoiceStatus.value, this.invoiceForm.controls.leadStatus.value)
      .then(async (result: LeadInvoiceResponse) => {
        if (result) {
          this.invoiceLeadResponce = UtilityService.clone(result);
          if (!isNullOrUndefined(this.invoiceLeadResponce?.leadInvoiceList)) {
            this.invoiceLeadResponce.leadInvoiceList.forEach(item => {
              this.total = this.total + item?.Amount;
            });
          }
          this.showSpinner = false;
        } else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  prepareInvoiceForm() {
    return this.fb.group({
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      invoiceStatus: new FormControl(0),
      leadStatus: new FormControl(0),
      ddUser: new FormControl(this.user?.cLPUserID),
    });
  }


  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `InvoiceReport`;
    let rows = options.sheets[0].rows;
    Array.prototype.unshift.apply(rows);
    component.save(options);
  }

  public viewHandler(dataItem) {
    this.router.navigate(['lead-detail', dataItem.LeadID, dataItem.FullName, dataItem.CompanyName, dataItem.ContactID], { skipLocationChange: true });
  }
}
