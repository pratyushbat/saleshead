import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LegendLabelsContentArgs } from '@progress/kendo-angular-charts';
import { isNullOrUndefined } from 'util';
import { ContactDisByClassifictaionResponse, ContactDisByManagerResponse, DistributionResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { ContactList, ContactListResponse } from '../../../../models/contact.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { ContactService } from '../../../../services/contact.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { UserService } from '../../../../services/user.service';
declare var $: any;
@Component({
  selector: 'app-distribution-by-classification',
  templateUrl: './distribution-by-classification.component.html',
  styleUrls: ['./distribution-by-classification.component.css']
})
export class DistributionByClassificationComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  public ddFieldsResponse: ContactDisByClassifictaionResponse;
  columns = [];
  public distClassificationList;
  public totalContacts: number = 0;
  public formGroup: FormGroup;
  distByClassificationForm: FormGroup;

  public isShowContactList: boolean = false;
  contactListResponse: ContactListResponse;
  contactListByClass: ContactList[];
  public queryParam = {};

  @ViewChild("chart", { read: ViewContainerRef, static: true })
  public chartContainer: ViewContainerRef;
  mobileColumnNames: string[];

  constructor(private fb: FormBuilder,
    private _decimalPipe: DecimalPipe,
    public _contactService: ContactService,
    private _userService: UserService,
    private _reportService: ReportService,
    private datepipe: DatePipe,
    private route: ActivatedRoute,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
    this.labelContent = this.labelContent.bind(this);
  }

  ngOnInit(): void {
    this.distByClassificationForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          if ($(window).width() >= 768 && $(window).width() <= 1024)
            this.mobileColumnNames = ['field1', 'field2', 'field3', 'field10'];
          else if ($(window).width() < 768)
            this.mobileColumnNames = ['field1', 'field2'];
          else
            this.mobileColumnNames = ['field1', 'field2'];
          this.getDistByClassification();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              this.selectedUserId = this.user.cLPUserID;
              this.getContacts();
              this.distByClassificationForm = this.prepareTrackingForm();
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

  prepareTrackingForm() {
    const now = new Date();
    return this.fb.group({
      ddUser: new FormControl(this.selectedUserId),
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(),
      includeZeroes: new FormControl(false),
      ddClass: new FormControl(11)
    });
  }

  async getDistByClassification() {
    this.showSpinner = true;
    await this._reportService.getDistByClassification(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: ContactDisByClassifictaionResponse) => {
        if (result) {
          this.ddFieldsResponse = UtilityService.clone(result);
          this.showSpinner = false;
          if (!isNullOrUndefined(this.ddFieldsResponse?.distributionByClassificationList?.distributionList)) {
            let sortedList = JSON.parse(JSON.stringify(this.ddFieldsResponse?.distributionByClassificationList?.distributionList));
            sortedList = sortedList.sort(function (a, b) {
              return b.Contacts - a.Contacts;
            });
            sortedList.forEach(item => {
              this.totalContacts = this.totalContacts + Number(item.Contacts);
            })
            this.distClassificationList = sortedList.slice(0, 10);
          }

          this.setGrid();

        } else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getDistByClassificationBindReport() {
    this.showSpinner = true;
    this.totalContacts = 0;
    let startDate = this.datepipe.transform(this.distByClassificationForm.controls.startDate.value, 'MM/dd/yyyy')
    let endDate = this.datepipe.transform(this.distByClassificationForm.controls.endDate.value, 'MM/dd/yyyy')
    await this._reportService.getDistributionByClassificationBindReport(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.distByClassificationForm.controls.includeZeroes.value, this.distByClassificationForm.controls.ddUser.value, startDate, endDate, this.distByClassificationForm.controls.ddClass.value)
      .then(async (result: DistributionResponse) => {
        if (result) {
          this.ddFieldsResponse.distributionByClassificationList = UtilityService.clone(result);
          this.showSpinner = false;
          if (!isNullOrUndefined(this.ddFieldsResponse?.distributionByClassificationList?.distributionList)) {
            let sortedList = JSON.parse(JSON.stringify(this.ddFieldsResponse?.distributionByClassificationList?.distributionList));
            sortedList = sortedList.sort(function (a, b) {
              return b.Contacts - a.Contacts;
            });
            sortedList.forEach(item => {
              this.totalContacts = this.totalContacts + Number(item.Contacts);
            })
            this.distClassificationList = sortedList.slice(0, 10);
          }

          this.setGrid();
        } else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  async getContacts() {
    this.showSpinner = true;
    await this._contactService.getContacts(this.encryptedUser, this.user.cLPUserID)
      .then(async (result: ContactListResponse) => {
        if (result) {
          this.contactListResponse = UtilityService.clone(result);
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

  setGrid() {
    var i = 0;
    this.columns = [];
    for (const property in this.ddFieldsResponse.distributionByClassificationList?.distributionList[0]) {
      i++;
      if (property != 'Link')
        this.columns.push({ field: `field${i}`, title: property, width: '100' });
    }
  }

  addNewContact() {
    this._router.navigate(['/contact-create']);
  }

  async loadContactList(link) {
    this.isShowContactList = false;
    await this._router.navigateByUrl('/contact/rptdist_class?' + link);
    this.route.queryParams.subscribe(params => {
      this.queryParam = params;
      this.isShowContactList = true;
      this.contactListByClass = this.contactListResponse.contactList.filter((item) => item.class1Code == params.dm1val);
    })
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Distribution By Classification`;
    let rows = options.sheets[0].rows;
    rows.forEach((row, index) => {
      if (row && row.type == "data") {
        for (const property in component.data[index - 1]) {
          var i = 0;
          rows[0].cells.forEach((cell) => {
            if (property == cell.value) {
              row.cells[i].value = component.data[index - 1][property];
              if (row.cells[i] && row.cells[i].value && row.cells[i].value.includes("<br>"))
                row.cells[i].value = row.cells[i].value.replace(/<br\s*\/?>/gi, ' ');
            }
            i++;
          });
        }
      }
    });
    Array.prototype.unshift.apply(rows);
    component.save(options);
  }

  public labelContent(e: LegendLabelsContentArgs): string {
    let a = (Number(e?.dataItem?.Contacts) / this.totalContacts) * 100
    return this._decimalPipe.transform(a, "1.0-0") + '%';
  }
}
