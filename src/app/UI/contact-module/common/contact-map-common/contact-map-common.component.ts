import { HttpErrorResponse } from '@angular/common/http';
import { Component, DoCheck, Input, IterableDiffer, IterableDiffers, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../../models/clpuser.model';
import { ContactList } from '../../../../models/contact.model';
import { ContactService } from '../../../../services/contact.service';
import { NotificationService } from '../../../../services/notification.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { process } from '@progress/kendo-data-query';
declare var $: any;

@Component({
  selector: 'app-contact-map-common',
  templateUrl: './contact-map-common.component.html',
  styleUrls: ['./contact-map-common.component.css'],
  providers: [GridConfigurationService]
})
export class ContactMapCommonComponent implements OnInit {
  showSpinner: boolean = false;
  initContactsMapData: ContactList[] = [];
  @Input() contactsMapData: ContactList[] = [];
  @Input() user: CLPUser;
  @Input() isDownload: boolean = false;
  @Input() isSearch: boolean = false;
  @Input() isContactReport: boolean = false;
  sendMailInfo: any = { isShow: false, contactId: 0 };

  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: '$', title: '  ', width: '40' },
    { field: 'name', title: 'Name', width: '250' },
    { field: 'email', title: 'Email', width: '70' },
    { field: 'companyName', title: 'Company', width: '350' },
    { field: 'address', title: 'Address', width: '120' },
    { field: 'city', title: 'City', width: '80' },
    { field: 'state', title: 'State', width: '80' },
    { field: 'country', title: 'Country', width: '80' },
    { field: 'zip', title: 'Zip', width: '60' },
    { field: 'emailAddress', title: 'Email Address', width: '140' },
    { field: 'phone', title: 'Phone', width: '120' },
    { field: 'userName', title: 'User', width: '120' },
    { field: 'dtModifiedDisplay', title: 'Modified', width: '100' },
    { field: 'dtCreatedDisplay', title: 'Created', width: '90' },
  ];
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  reorderColumnName: string = 'name,email,companyName,address:h,city:h,state:h,country:h,zip:h,emailAddress:h,phone,userName,dtModifiedDisplay,dtCreatedDisplay';
  columnWidth: string = 'name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90';
  arrColumnWidth: any[] = ['name:250,email:70,companyName:350,address:120,city:80,state:80,country:80,zip:60,emailAddress:140,phone:120,userName:120,dtModifiedDisplay:100,dtCreatedDisplay:90'];
  gridHeight;
  soUrl: any;
  mobileColumnNames: string[];

  constructor(public _localService: LocalService,
    private _notifyService: NotificationService,
    private _router: Router,
    public _contactService: ContactService,
    differs: IterableDiffers,
    public _gridCnfgService: GridConfigurationService) {
    this.gridHeight = this._localService.getGridHeight('499px');
  }

  ngOnInit() {
    if (!isNullOrUndefined(this.contactsMapData))
      this.initContactsMapData = this.contactsMapData;
    if (!isNullOrUndefined(this.user))
      this.getGridConfiguration();
  }

  getGridConfiguration() {
    this._gridCnfgService.columns = this.columns;
    this._gridCnfgService.reorderColumnName = this.reorderColumnName;
    this._gridCnfgService.columnWidth = this.columnWidth;
    this._gridCnfgService.arrColumnWidth = this.arrColumnWidth;
    this._gridCnfgService.user = this.user;
    this._gridCnfgService.getGridColumnsConfiguration(this.user.cLPUserID, 'contact_map_grid').subscribe((value) => this._gridCnfgService.createGetGridColumnsConfiguration('contact_map_grid').subscribe((value) => this.getMapContacts()));

  }
  resetGridSetting() {
    this._gridCnfgService.deleteColumnsConfiguration(this.user.cLPUserID, 'contact_map_grid').subscribe((value) => this.getGridConfiguration());
  }

  getMapContacts() {
    if (!isNullOrUndefined(this._gridCnfgService)) {
      this._gridCnfgService.iterateConfigGrid(true, "contact_map_grid");
      this.mobileColumnNames = this._gridCnfgService.getResponsiveGridColums('contact_map_grid');
    }
  }

  gotoLink(columnName, dataItem) {
    var url = this.soUrl;
    if (columnName) {
      switch (columnName) {
        case "address-card":
        case "name": {
          if (this.user.timeZoneWinId != 0)
            this._router.navigate(['/contact', dataItem.clpUserId, dataItem.contactID]);
          else {
            if (confirm("First , Please select your timezone!!!"))
              this._router.navigate(['/edit-profile', dataItem.clpUserId]);
            else
              return;
          }
          break;
        }
        case "userName": {
          this._router.navigate(['/edit-profile', dataItem.clpUserId]);
          break;
        }
        case "email": {
          $('#sendEmailModal').modal('show');
          this.sendMailInfo.isShow = true;
          this.sendMailInfo.contactId = dataItem?.contactID;
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Contact List`;
    let rows = options.sheets[0].rows;
    rows.forEach((row) => {
      if (row && row.type == "data") {
        row.cells.forEach((cell) => {
          if (cell && cell.value && cell.value.includes("<br>")) {
            cell.value = cell.value.replace(/<br\s*\/?>/gi, ' ');
          }
        });
      }
    });
    Array.prototype.unshift.apply(rows);
    component.save(options);
  }

  showColumn(columnDef): boolean {
    var value = true;
    if (columnDef) {
      (columnDef == 'email') || (columnDef == 'phone') ? value = false : value = true;
    }
    return value;
  }

  onContactMapListFilter(inputValue: string): void {
    this.contactsMapData = process(this.initContactsMapData, {
      filter: {
        logic: "or",
        filters: [
          { field: 'name', operator: 'contains', value: inputValue },
          { field: 'email', operator: 'contains', value: inputValue }

        ],
      }
    }).data;
    this.dataBinding.skip = 0;
  }
}
