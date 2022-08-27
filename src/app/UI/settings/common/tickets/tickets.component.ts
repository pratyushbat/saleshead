import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process } from '@progress/kendo-data-query';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../../models/clpuser.model';
import { eTicketCategory, eTicketStatus } from '../../../../models/enum.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { Ticket, TicketListResponse } from '../../../../models/ticket.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';

import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css'],
  providers: [GridConfigurationService]
})
/** tickets component*/
export class TicketsComponent implements OnInit {
  /** tickets ctor */
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  isShowDiv: string = 'grid';
  ticketForm = new FormGroup({});
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  @Input() user: CLPUser;
  ticket: Ticket;
  ticketListResponse: TicketListResponse;
  tickets: Ticket[] = [];
  initTickets: Ticket[] = [];
  deletedTicket: Ticket;

  filteredCategory: number = 0;
  filteredStatus: number = 0;

  isEdit: boolean = false;
  editTicketId: number = 0;

  categoryArr: { key: string; value: number }[] = [
    { key: 'Question', value: 1},
    { key: 'Need Help', value: 2},
    { key: 'Report a problem', value: 3},
    { key: 'Idea for a new feature', value: 4},
    { key: 'Urgent', value: 5},
  ];
  statusArr: { key: string; value: number }[] = [
    { key: 'All Open', value: 9 },
    { key: 'Active Only', value: 1 },
    { key: 'Being Handled Only', value: 2 },
    { key: 'User Feedback Required Only', value: 5 },
    { key: 'Under Consideration', value: 4 },
    { key: 'Resolved', value: 3 },
  ];

  //set for grid configuration
  columns = [
    { field: '$', title: '', width: '40' },
    { field: 'ticketID', title: 'Ticket', width: '60' },
    { field: 'ticketDesc', title: 'Description/Response', width: '350' },
    { field: 'finder', title: 'Finder', width: '70' },
    { field: 'fixer', title: 'Reply By', width: '80' },
    { field: 'dtLastModified', title: 'Last Modified', width: '100' },
    { field: 'ticketCategory', title: 'Category', width: '80' },
    { field: 'ticketStatus', title: 'Status', width: '80' },
  ];
  reorderColumnName: string = 'ticketID,ticketDesc,finder,fixer,dtLastModified,ticketCategory,ticketStatus';
  columnWidth: string = 'ticketID:60,ticketDesc:350,finder:70,fixer:80,dtLastModified:100,ticketCategory:80,ticketStatus:80';
  arrColumnWidth: any[] = ['ticketID:60,ticketDesc:350,finder:70,fixer:80,dtLastModified:100,ticketCategory:80,ticketStatus:80'];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
    mobileColumnNames: string[];
  constructor(private fb: FormBuilder,
    public _router: Router,
    public _localService: LocalService,
    public _notifyService: NotificationService,
    public _utilityService: UtilityService,
    public _accountSetupService: AccountSetupService,
    public _gridCnfgService: GridConfigurationService,
  ) {
    this._localService.isMenu = true;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      //Set for grid configuration
      this.getGridConfiguration();
      //this.getTickets();
      this.ticketForm = this.prepareTicketForm();
      this.ticketForm.reset();
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'ticket_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('ticket_grid').subscribe((value) => this.getTickets()));
  }

  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'ticket_grid').subscribe((value) => this.getGridConfiguration());
  }

  getTicketCategory(cat) {
    return eTicketCategory[cat];
  }

  getTicketStatus(status) {
    return eTicketStatus[status];
  }

  showDiv(div) {
    switch (div) {
      case 'new': this.isShowDiv = 'new'; this.isEdit = false; this.editTicketId = 0; this.ticketForm.reset(); break;
      case 'cancel': this.isShowDiv = 'grid'; this.isEdit = false; this.editTicketId = 0; this.ticketForm.reset(); break;
      default: break
    }
  }

  onTicketListFilter(inputValue: string): void {
    this.tickets = process(this.initTickets, {
      filter: {
        logic: "or",
        filters: [
          { field: 'ticketID', operator: 'contains', value: inputValue },
          { field: 'ticketDesc', operator: 'contains', value: inputValue },
          { field: 'finder', operator: 'contains', value: inputValue },
          { field: 'fixer', operator: 'contains', value: inputValue },
          { field: 'ticketCategory', operator: 'contains', value: inputValue },
          { field: 'ticketStatus', operator: 'contains', value: inputValue }
        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }

  prepareTicketForm() {
    return this.fb.group({
      ticketDesc: [{ value: '' }, [Validators.required]],
      finder: [{ value: '' }],
      ticketResponse: [{ value: '' }],
      fixer: [{ value: '' }],
      ticketCategory: [{ value: '' }, [Validators.required]],
      ticketStatus: [{ value: '' }],
      sendMail: [{ value: true }],
      unread: [{ value: false }],
    });
  }

  ticketFrm() {
    return this.ticketForm.controls;
  }

  filterTickets(type, e?) {
    if (this.filteredCategory && this.filteredStatus && this._localService.selectedAdminCompanyId != -1) {
      this.showSpinner = true;
      this._accountSetupService.filterTickets(this.encryptedUser, this._localService.selectedAdminCompanyId, +this.filteredCategory, +this.filteredStatus)
        .then(async (result: TicketListResponse) => {
          if (result) {
            this.ticketListResponse = UtilityService.clone(result);
            this.tickets = this.ticketListResponse.tickets;
            this.showSpinner = false;
            this.isEdit = false;
            this.editTicketId = 0;
          }
          else
            this.showSpinner = false;
        }).catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
        });
    }
  }

  filterAllOpenStatus() {
    var that = this;
    if (this.filteredCategory == 0) {
      this.tickets = this.initTickets.filter(function (item) {
        if (item.ticketStatus == 1 || item.ticketStatus == 2 || item.ticketStatus == 5 || item.unread == true)
          return true;
      });
    }
    else {
      this.tickets = this.initTickets.filter(function (item) {
        if (item.ticketCategory == that.filteredCategory && item.ticketStatus == 1 || item.ticketStatus == 2 || item.ticketStatus == 5)
          return true;
      });
    }
  }

  async getTickets() {
    this.showSpinner = true;
    await this._accountSetupService.getTickets(this.encryptedUser, this._localService.selectedAdminCompanyId, this.user.cLPUserID)
      .then(async (result: TicketListResponse) => {
        if (result) {
          this.ticketListResponse = UtilityService.clone(result);
          this.tickets = this.ticketListResponse.tickets;
          this.initTickets = this.ticketListResponse.tickets;
          if (!isNullOrUndefined(this._gridCnfgService)) {
            this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('ticket_grid');
            this._gridCnfgService.iterateConfigGrid(this.ticketListResponse, "ticket_grid");
          }
        
          this.showSpinner = false;
          this.isEdit = false;
          this.editTicketId = 0;
          this.filteredStatus = 9;
          this.filterAllOpenStatus();
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  ticketFormSubmit() {
    this._localService.validateAllFormFields(this.ticketForm);
    if (this.ticketForm.valid) {
      this.ticketForm.markAsPristine();
      this.updateTicket();
    }
  }

  updateTicket() {
    this.copyTicketFormValueToDataObject();
    var sendMail = this.ticketForm.controls.sendMail.value ? this.ticketForm.controls.sendMail.value == true ? 1 : 0 : 0;
    this.showSpinner = true;
    if (this._localService.selectedAdminCompanyId >= 0) {
      this._accountSetupService.updateCreateTicket(this.encryptedUser, this.ticket, this.user?.cLPUserID, sendMail,  this._localService.selectedAdminCompanyId)
        .then(async (result: TicketListResponse) => {
          if (result) {
            var response = UtilityService.clone(result);
            this._notifyService.showSuccess("Ticket saved successfully.", "", 3000);
            this.ticketForm.reset();
            this.ticketForm.markAsPristine();
            this.ticketForm.markAsUntouched();
            this.getTickets();
            this.isShowDiv = 'grid';
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
  }

  copyTicketFormValueToDataObject() {
    this.ticket = <Ticket>{};
    this.ticket.ticketDesc = this.ticketForm.controls.ticketDesc.value ? this.ticketForm.controls.ticketDesc.value : '';
    this.ticket.ticketCategory = this.ticketForm.controls.ticketCategory.value ? +this.ticketForm.controls.ticketCategory.value : null;
    this.ticket.unread = this.ticketForm.controls.unread.value ? this.ticketForm.controls.unread.value : false;

    this.ticket.ticketResponse = '';
    this.ticket.ticketStatus = 1;
    this.ticket.fixer = '';
    this.ticket.ticketID = 0;

    this.ticket.cLPUserID = this.user ? this.user?.cLPUserID : -1;
    this.ticket.cLPCompanyID = this._localService.selectedAdminCompanyId ? this._localService.selectedAdminCompanyId : -1;

    if (this.isEdit) {
      this.ticket.finder = this.ticketForm.controls.finder.value ? this.ticketForm.controls.finder.value : '';
      this.ticket.ticketResponse = this.ticketForm.controls.ticketResponse.value ? this.ticketForm.controls.ticketResponse.value : '';
      this.ticket.fixer = this.ticketForm.controls.fixer.value ? this.ticketForm.controls.fixer.value : '';
      this.ticket.ticketStatus = this.ticketForm.controls.ticketStatus.value ? +this.ticketForm.controls.ticketStatus.value : 1;
      this.ticket.ticketID = this.editTicketId;
    }
  }

  public editHandler({ dataItem }): void {
    if (dataItem) {
      this.editTicketId = dataItem ? dataItem.ticketID : 0;
      this.isEdit = true;
      this.isShowDiv = 'new';
      this.patchFormValue(dataItem);
    }
  }

  public removeHandler({ dataItem }): void {
    this.deletedTicket = dataItem;
  }

  patchFormValue(dataItem) {
    this.ticketForm.reset();
    if (this.isEdit && !isNullOrUndefined(dataItem)) {
      this.ticketForm.get('ticketDesc').setValue(dataItem.ticketDesc);
     
      this.ticketForm.get('finder').setValue(dataItem.finder);
      this.ticketForm.get('ticketResponse').setValue(dataItem.ticketResponse);
      this.ticketForm.get('fixer').setValue(dataItem.fixer);
      this.ticketForm.get('ticketStatus').setValue(dataItem.ticketStatus);

      this.ticketForm.get('ticketCategory').setValue(dataItem.ticketCategory);
      this.ticketForm.get('sendMail').setValue(dataItem.sendMail);
      this.ticketForm.get('unread').setValue(dataItem.unread);
    }
  }

  async confirmDeleteTicket() {
    this.showSpinner = true;
    await this._accountSetupService.deleteTicket(this.encryptedUser, this.deletedTicket.ticketID)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.showSpinner = false;
          if (response.messageBool == false) {
            this._notifyService.showError(response.messageString ? response.messageString : 'Some error occured.', "", 3000);
            return;
          }
          this.getTickets();
          this._notifyService.showSuccess("Ticket deleted successfully", "", 3000);
        }
        else
          this.showSpinner = false;
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

}
