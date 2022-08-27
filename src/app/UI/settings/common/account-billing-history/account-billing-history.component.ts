import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { BillingHistoryYearResponse, BillingInvoice, BillingInvoiceResponse } from '../../../../models/clpTxn.model';
import { CLPUser } from '../../../../models/clpuser.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { BilligService } from '../../../../services/billing.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { NotificationService } from '../../../../services/notification.service';
import { ContactService } from '../../../../services/contact.service';
import { UserEmailListResponse } from '../../../../models/contact.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { LocalService } from '../../../../services/shared/local.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER, FF_SEMICOLON } from '@angular/cdk/keycodes';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { AddUser_StepsResponse, VMAddUser_Mainview, VMAddUser_MainviewResponse } from '../../../../models/company.model';
import { eColor } from '../../../../models/enum.model';

declare var $: any;

@Component({
  selector: 'account-billing-history',
  templateUrl: './account-billing-history.component.html',
  styleUrls: ['./account-billing-history.component.css'],
  providers: [GridConfigurationService]
})

export class AccountBillingHistoryComponent implements OnInit {
  gridHeight;
  encryptedUser: string;
  @Input() user: CLPUser;
  @Input() companyIdBilling: number;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  showSpinner: boolean = false;
  invoiceEmail: string = '';
  emailsList: string[] = [];
  allEmails: string[] = [];
  emailCtrl = new FormControl();
  @ViewChild('emailInput') emailInput: ElementRef<HTMLInputElement>;
  filteredEmail: Observable<string[]>;
  emails: any[];
  dataItem: any;
  showSpinnerSendEmail: boolean = false;
  isUserAdded: number = 0;
  userCount: number;
  expandDetailsFee: boolean = false;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  columns = [
    { field: 'dtCreated', title: 'Date', width: '170' },
    { field: 'txnType', title: 'Type', width: '270' },
    { field: 'txnDescription', title: 'Description', width: '800' },
    { field: 'txnAmount', title: 'Amount', width: '250' },
    { field: 'status', title: 'Status', width: '270' },
  ];
  reorderColumnName: string = 'dtCreated,txnType,txnDescription,txnAmount,status';
  columnWidth: string = 'dtCreated:170,txnType:270,txnDescription:800,txnAmount:250,status:270';
  arrColumnWidth: any[] = ['dtCreated:170,txnType:270,txnDescription:800,txnAmount:250,status:270'];
  filterYears;
  selectedYear: number = -1;
  billingHistory: any[];
  initBillingHistory: any[];
  billingInvoice: BillingInvoice;
  showInvoiceEmailText: boolean = false;
  separatorKeysCodes: number[] = [ENTER, COMMA, FF_SEMICOLON];

  billingHistoryYearResponse: BillingHistoryYearResponse;
  billingMainView: VMAddUser_Mainview;
  messageDisplayOnAddStep: string;
  userView: boolean;
  initBillingMainView: VMAddUser_Mainview;
  isUgradeStatus: boolean = false;
  showUpgrade: boolean = false;
  isUpgradeAdded: number = 0;
  chooseCriteria = [
    { category: "Nimbus", id: 1, checked: false },
    { category: "Stratus", id: 2, checked: false }
  ];
  selectedOptions = [];
    mobileColumnNames: string[];

  constructor(public _gridCnfgService: GridConfigurationService, private _localService: LocalService, public _contactService: ContactService, private notifyService: NotificationService, private _billigService: BilligService, private _accountSetupService: AccountSetupService, private _utilityService: UtilityService, private ngZone: NgZone) {
    this._localService.isMenu = true;
    this.gridHeight = this._localService.getGridHeight('514px');
    this.filteredEmail = this.emailCtrl.valueChanges.pipe(
      startWith(null),
      map((email: string | null) => (email ? this._filterEmail(email) : this.allEmails.slice())),
    );
  }

  loadBillingHistory() {
    if (!isNullOrUndefined(this.user)) {
      if (!isNullOrUndefined(localStorage.getItem("token"))) {
        this.encryptedUser = localStorage.getItem("token");
        this.companyIdBilling = (!isNullOrUndefined(this.companyIdBilling) && this.companyIdBilling > 0) ? this.companyIdBilling : this.user.cLPCompanyID;
        this.getGridConfiguration();
        this.getBillingSetup();
         }
    }
  }

  getGridConfiguration() {
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'billing_history_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('billing_history_grid').subscribe((value) => this.getBillingHistoryYear()));
      }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'billing_history_grid').subscribe((value) => this.getGridConfiguration());
  }

/*  ngOnChanges() {    
    this.isInit = true;
    this.loadBillingHistory();
  }*/

  ngOnInit() {
    /*    if (!this.isInit)*/
      this.loadBillingHistory();
  }

  getColor(num) {
    return eColor[num];
  }

  getBillingSetup() {
    this.showSpinner = true;
    this._accountSetupService.getBillingSetup_MainView(this.encryptedUser, this.companyIdBilling, this.user.cLPUserID)
      .then(async (result: VMAddUser_MainviewResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.showSpinner = false;
          this.billingMainView = result.mainViewDetails;
          this.removeEmptyObjects();
          this.initBillingMainView = this.billingMainView;
          if (this.billingMainView.clpRoleDisplay?.fieldText != 'Nimbus')
            this.showUpgrade = true;
          this.isUserAdded = 0;
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

  cancelBillingSetup() {
    this.isUserAdded = 0;
    this.billingMainView = this.initBillingMainView;
  }

  cancelUpgradeSetup() {
    this.isUgradeStatus = false;
    this.isUpgradeAdded = 0;
    this.cancelBillingSetup();

  }
  removeEmptyObjects() {
    Object.keys(this.billingMainView).forEach(key => {
      if (this.billingMainView[key] === null) {
        delete this.billingMainView[key];
      }
    });
  }

  addUserBillingAdd() {

    this.showSpinner = true;
    this._accountSetupService.addUserBillingAddStep(this.encryptedUser, this.companyIdBilling)
      .then(async (result: AddUser_StepsResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.showSpinner = false;
          this.messageDisplayOnAddStep = result.messageString;
          this.isUserAdded = 1;
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

  addUserBillingAddContinue() {
    this.showSpinner = true;
    this._accountSetupService.addUserBillingContinueStep(this.encryptedUser, this.userCount, this.companyIdBilling)
      .then(async (result: AddUser_StepsResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.billingMainView = result.mainViewDetails;
          this.removeEmptyObjects();
          this.messageDisplayOnAddStep = result.messageString;
          this.isUserAdded = 2;
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

  placeOrderBilling() {
    this.showSpinner = true;
    this._accountSetupService.placeOrderBilling(this.encryptedUser, this.companyIdBilling, this.user.cLPUserID, this.userCount)
      .then(async (result: AddUser_StepsResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.userView = true;
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

  upgradeStart() {
    this.showSpinner = true;
    this._accountSetupService.upgradeStartStep(this.encryptedUser, this.companyIdBilling, this.user.cLPUserID)
      .then(async (result: AddUser_StepsResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.billingMainView = result.mainViewDetails;
          this.removeEmptyObjects();
          this.isUpgradeAdded = 1;
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

  public showBillingInvoice(dataItem) {
    this.invoiceEmail = '';
    this.emailsList = [];
    this.dataItem = dataItem;
    this.showSpinner = true;
    this._billigService.getBillingInvoice(this.encryptedUser, dataItem.cLPTxnID, this.companyIdBilling, this.user.cLPUserID)
      .then(async (result: BillingInvoiceResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.billingInvoice = result.billingInvoice;
          this.showSpinner = false;
          if (!this.billingInvoice?.html) {
            this.notifyService.showError("No data found of this invoice", "", 3000);
            return;
          }
          $('#billingInvoiceModal').modal('show');
          this.invoiceEmail = this.user.email;
          this.emailsList.push(this.user.email);
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

  getEmailList() {
    if (this.showInvoiceEmailText) {
      this.allEmails = [];
      this._contactService.getEmailList(this.encryptedUser, this.companyIdBilling)
        .then(async (result: UserEmailListResponse) => {
          if (result) {
            var result = UtilityService.clone(result);
            this.emails = result.userEmailList;
            var that = this;
            this.emails.forEach(function (obj) {
              that.allEmails.push(obj.email);
            })
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  private _filterEmail(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allEmails.filter(email => email.toLowerCase().includes(filterValue));
  }


  addEmail(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && this._localService.validateEmail(value)) {
      // Add our email
      if (value)
        this.emailsList.push(value);
      // Clear the input value
      event.input.value = '';
      this.emailCtrl.setValue(null);
    }
    else if (value)
      this.notifyService.showError("Please enter valid email address.", "", 3000);
  }

  removeEmail(email: string): void {
    const index = this.emailsList.indexOf(email);
    if (index >= 0)
      this.emailsList.splice(index, 1);
  }

  selectedEmail(event: MatAutocompleteSelectedEvent): void {
    this.emailsList.push(event.option.viewValue);
    this.emailInput.nativeElement.value = '';
    this.emailCtrl.setValue(null);
  }

  clearEmail() {
    this.emailsList = [];
    this.emailsList.push(this.user.email);
  }

  sendInvoiceEmail() {
    var emailIds: string = this.emailsList?.length > 0 ? this.emailsList.join() : '';
    this.showSpinnerSendEmail = true;
    this._billigService.sendInvoiceReceiptEmail(this.encryptedUser, emailIds, this.dataItem.cLPTxnID, this.companyIdBilling, this.user.cLPUserID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.showInvoiceEmailText = false;
          this.invoiceEmail = this.user.email;
          this.clearEmail();
          this.showSpinnerSendEmail = false;
          this.notifyService.showSuccess("Email sent successfully", "", 3000);
        }
        else
          this.showSpinnerSendEmail = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinnerSendEmail = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  print() {
    const printContent = this.billingInvoice.html;
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt.document.write(printContent);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }

  async getBillingHistoryYear() {
    this.showSpinner = true;
    await this._billigService.getBillingHistoryYear(this.encryptedUser, this.companyIdBilling, 0, 0)
      .then(async (result: BillingHistoryYearResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.billingHistoryYearResponse = response;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this._gridCnfgService.iterateConfigGrid(this.billingHistoryYearResponse, "billing_history_grid");
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('billing_history_grid');
          }
         
          this.billingHistory = this.billingHistoryYearResponse.billingHistory;
          this.initBillingHistory = this.billingHistoryYearResponse.billingHistory;
          this.filterYears = response.filterYear;
          var currentYear = new Date().getFullYear();
          this.selectedYear = this.filterYears.length > 0 ? this.filterYears.find(i => i.key == currentYear)?.key : -1;
          this.billingYearFilterChange();
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

  billingYearFilterChange(e?) {
    var value: number = e ? e.target.value : this.selectedYear ? this.selectedYear : - 1;
    if (value && +value == -1)
      this.billingHistory = this.initBillingHistory;
    else
      this.getBillingHistory(+value);
  }

  getBillingHistory(year: number = 0) {
    this._billigService.getBillingHistory(this.encryptedUser, this.companyIdBilling, year, 0)
      .then(async (result: BillingHistoryYearResponse) => {
        if (result) {
          var result = UtilityService.clone(result);
          this.billingHistory = result.billingHistory;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  public onBillingHistoryFilter(inputValue: string): void {
    this.billingHistory = process(this.initBillingHistory, {
      filter: {
        logic: "or",
        filters: [
          {
            field: 'txnType',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'txnDescription',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'txnAmount',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'status',
            operator: 'contains',
            value: inputValue
          },
          {
            field: 'dtCreated',
            operator: 'contains',
            value: inputValue
          }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

}
