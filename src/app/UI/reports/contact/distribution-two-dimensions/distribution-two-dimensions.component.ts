import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { ContactTwoDimensionResponse, userListResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { ContactList, ContactListResponse } from '../../../../models/contact.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { ContactService } from '../../../../services/contact.service';
import { GridConfigurationService } from '../../../../services/shared/gridConfiguration.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
declare var $: any;
@Component({
  selector: 'app-distribution-two-dimensions',
  templateUrl: './distribution-two-dimensions.component.html',
  styleUrls: ['./distribution-two-dimensions.component.css']
})
export class DistributionTwoDimensionsComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  ddFieldsResponse: ContactTwoDimensionResponse;
  isSameRowCol: boolean = false;
  contactListResponse: ContactListResponse;
  contactListBy2D: ContactList[];
  public isShowContactList: boolean = false;
  public queryParam = {};
  columns = [];
  public formGroup: FormGroup;
  contactDist2DForm: FormGroup;
  mobileColumnNames: any;

  constructor(private fb: FormBuilder,
    private _reportService: ReportService,
    public _contactService: ContactService,
    private datepipe: DatePipe,
    private route: ActivatedRoute,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.contactDist2DForm = this.prepareTrackingForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getContactDisTwoDimension();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  prepareTrackingForm() {
    return this.fb.group({
      startDate: new Date(),
      endDate: new Date(),
      rows: new FormControl(0),
      column: new FormControl(11),
      officeCode: new FormControl(0),
      teamCode: new FormControl(0),
      dateFilter: new FormControl('dtCreated'),
      includeZero: new FormControl(false),
      enableSort: new FormControl(false),
      isTeamChecked: new FormControl(false),
      isOfficedChecked: new FormControl(false),
      ddUser: new FormControl(this.user?.cLPUserID),
    });
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
              this.contactDist2DForm = this.prepareTrackingForm();
              this.getContacts();
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

  async getContactDisTwoDimension() {
    this.showSpinner = true;
    await this._reportService.getContactDisTwoDimension(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: ContactTwoDimensionResponse) => {
        if (result) {
          this.ddFieldsResponse = UtilityService.clone(result);
          this.setGrid();
          if ($(window).width() >= 768 && $(window).width() <= 1024)
            this.mobileColumnNames = ['field1', 'field2', 'field3', 'field10'];
          else if ($(window).width() < 768)
            this.mobileColumnNames = ['field1', 'field2'];
          else
            this.mobileColumnNames = ['field1', 'field2'];
          if (this.contactDist2DForm.controls.rows.value == this.contactDist2DForm.controls.column.value)
            this.isSameRowCol = true;
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

  async getContactTwoDimensionBindReport() {
    if (this.contactDist2DForm.controls.rows.value != this.contactDist2DForm.controls.column.value) {
      this.showSpinner = true;
      this.isSameRowCol = false;
      let startDate = this.datepipe.transform(this.contactDist2DForm.controls.startDate.value, 'MM/dd/yyyy')
      let endDate = this.datepipe.transform(this.contactDist2DForm.controls.endDate.value, 'MM/dd/yyyy')
      await this._reportService.getContactTwoDimensionBindReport(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.contactDist2DForm.controls.rows.value, this.contactDist2DForm.controls.column.value, startDate, endDate, (this.contactDist2DForm.controls.ddUser.value).toString(), this.contactDist2DForm.controls.dateFilter.value, this.contactDist2DForm.controls.includeZero.value)
        .then(async (result: ContactTwoDimensionResponse) => {
          if (result) {
            let response = UtilityService.clone(result);
            this.ddFieldsResponse.contactTwoDimension = response.contactTwoDimension;
            this.setGrid();
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
    else {
      this.isSameRowCol = true;
    }
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

  addNewContact() {
    this._router.navigate(['/contact-create']);
  }

  async getUserList() {
    await this._reportService.getCompany2DUsers(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID, this.contactDist2DForm.controls.officeCode.value, this.contactDist2DForm.controls.teamCode.value, this.ddFieldsResponse?.userFilterData?.isMyOffice, this.ddFieldsResponse?.userFilterData?.isMyTeam, this.contactDist2DForm.controls.isOfficedChecked.value, this.contactDist2DForm.controls.isTeamChecked.value, false)
      .then(async (result: userListResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.ddFieldsResponse.userFilterData.userDD = response.userDD;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  async loadContactList(link) {
    this.isShowContactList = false;
    await this._router.navigateByUrl('/contact/rpt2dim?' + link);
    this.route.queryParams.subscribe(params => {
      this.queryParam = params;
      this.isShowContactList = true;
      this.contactListBy2D = this.contactListResponse.contactList.filter((item) => item.class1Code == params.dm2val);
    })
  }

  setGrid() {
    var i = 0;
    this.columns = [];
    if (!isNullOrUndefined(this.ddFieldsResponse?.contactTwoDimension)) {
      for (const property in this.ddFieldsResponse?.contactTwoDimension[0]) {
        i++;
        if (property != 'Link')
          this.columns.push({ field: `field${i}`, title: property, width: '100' });
      }
    }
  }

  forSplit(link) {
    return link.split('>');
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Contact Distribution 2d`;
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
}
