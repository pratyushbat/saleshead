import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { NoteTypeSummaryResponse } from '../../../../models/report.model';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { eUserRole } from '../../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { ReportService } from '../../../../services/report.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
declare var $: any;
@Component({
  selector: 'app-note-type-summary',
  templateUrl: './note-type-summary.component.html',
  styleUrls: ['./note-type-summary.component.css']
})
export class NoteTypeSummaryComponent {

  showSpinner: boolean = false;
  roleFeaturePermissions: RoleFeaturePermissions;
  user: CLPUser;
  private encryptedUser: string = '';
  userResponse: UserResponse;
  selectedUserId: number;

  columns = [];
  noteTypeSummaryList: {}[];
  userList: CLPUser[];
  spanTitleText: string;
  public formGroup: FormGroup;
  noteTypeSummaryForm: FormGroup;
  mobileColumnNames: string[];

  constructor(private fb: FormBuilder,
    private datepipe: DatePipe,
    private _reportService: ReportService,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private _router: Router) {
    this._localService.isMenu = true;
  }

  ngOnInit(): void {
    this.noteTypeSummaryForm = this.prepareNoteTypeSummaryForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this.getNoteTypeSummaryList();
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
              this.selectedUserId = this.user.cLPUserID;
              this.noteTypeSummaryForm = this.prepareNoteTypeSummaryForm();
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
      }).catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  prepareNoteTypeSummaryForm() {
    const now = new Date();
    return this.fb.group({
      date: new FormControl(new Date(), [Validators.required]),
      ddUser: new FormControl(this.selectedUserId),
      type: new FormControl(1)
    });
  }

  async getNoteTypeSummaryList() {
    this.showSpinner = true;
    let date = this.datepipe.transform(this.noteTypeSummaryForm.controls.date.value, 'MM/dd/yyyy');
    await this._reportService.getNoteTypeSummaryList(this.encryptedUser, this.user.cLPCompanyID, this.noteTypeSummaryForm.controls.ddUser.value, date, this.noteTypeSummaryForm.controls.type.value)
      .then(async (result: NoteTypeSummaryResponse) => {
        if (result) {
          let response = UtilityService.clone(result);
          this.noteTypeSummaryList = response.noteTypeSummaryList;
          this.spanTitleText = response.spanTitleText;
          this.userList = response.filterUserList;
          this.showSpinner = false;
          this.setGrid();
          if ($(window).width() >= 768 && $(window).width() <= 1024)
            this.mobileColumnNames = ['field1', 'field2', 'field3', 'field10'];
          else if ($(window).width() < 768)
            this.mobileColumnNames = ['field1', 'field2'];
          else
            this.mobileColumnNames = ['field1', 'field2'];
        } else
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
    for (const property in this.noteTypeSummaryList[0]) {
      i++;
      this.columns.push({ field: `field${i}`, title: property, width: '100' });
    }
  }

  public saveExcel(component): void {
    const options = component.workbookOptions();
    options.sheets[0].name = `Note Summary`;
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
}
