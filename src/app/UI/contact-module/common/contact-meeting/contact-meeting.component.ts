import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { isNullOrUndefined } from 'util';

import { filterAnimation, pageAnimations } from '../../../../animations/page.animation';

import { CLPUser } from '../../../../models/clpuser.model';
import { ContactFields } from '../../../../models/contact.model';
import { EmailDropDownsResponse } from '../../../../models/emailTemplate.model';

import { OutBoundEmailService } from '../../../../services/outBoundEmail.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'app-contact-meeting',
    templateUrl: './contact-meeting.component.html',
    styleUrls: ['./contact-meeting.component.css'],
    animations: [pageAnimations, filterAnimation]
})
/** contact-meeting component*/
export class ContactMeetingComponent {
  /** contact-meeting ctor */
  @Input() loggedUser: CLPUser;
  @Input() contactFields: ContactFields;
  emailDropDownsResponse: EmailDropDownsResponse;
  users: any;
  private encryptedUser: string = '';
  generalForm: FormGroup;
  reminderForm: FormGroup;
  newTaskForm: FormGroup;
  attendeesForm: FormGroup;
  customActionForm: FormGroup;
  public datePickerformat = "MM/dd/yyyy HH:mm a";

  //Sortable
  public userList: string[] = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];
  public attendeesList: string[] = ["SteelBlue", "CornflowerBlue", "RoyalBlue", "MediumBlue"];
  //Sortable

  //Animation
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  //Animation
  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _utilityService: UtilityService,
    private _outBoundEmailService: OutBoundEmailService,
    public _localService: LocalService) {

  }

  ngOnInit() {
    console.log(this.contactFields);
    this.generalForm = this.prepareGeneralForm();
    this.generalForm.reset();

    this.reminderForm = this.prepareReminderForm();
    this.reminderForm.reset();

    this.newTaskForm = this.prepareNewTaskForm();
    this.newTaskForm.reset();

    this.attendeesForm = this.prepareAttendeesForm();
    this.attendeesForm.reset();

    this.customActionForm = this.prepareCustomActionForm();
    this.customActionForm.reset();

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
        if (this.loggedUser)
          this.getEmailDropDowns().subscribe((value) => console.log(value));
      }
      else
        this._router.navigate(['/unauthorized']);
  
  }

  private prepareGeneralForm(): FormGroup {
    return this.fb.group({
      subject: [{ value: '' }, [Validators.required]],
      start: [{ value: '' }],
      end: [{ value: '' }],
      contact: [{ value: '' }],
      chkPhoneCall: [{ value: false }],
      type: [{ value: '' }],
      location: [{ value: '' }],
      user: [{ value: '' }],
      notes: [{ value: '' }],
      chkUserReminder: [{ value: false }],
    });
  }

  private prepareReminderForm(): FormGroup {
    return this.fb.group({
      scheduleReminder: [{ value: '' }],
      viaMessageCenter: [{ value: '' }],
      chkViaEmail: [{ value: false }],
      viaAdditionalEmail: [{ value: '' }],
      reminderTextTemplate: [{ value: false }],
      reminderHtmlTemplate: [{ value: '' }],
      reminderNotes: [{ value: '' }],
      chkReminderNotes: [{ value: false }],
    });
  }

  private prepareNewTaskForm(): FormGroup {
    return this.fb.group({
      task: [{ value: '' }, [Validators.required]],
      taskDate: [{ value: '' }],
    });
  }

  private prepareAttendeesForm(): FormGroup {
    return this.fb.group({
      team: [{ value: '' }],
      office: [{ value: '' }],
    });
  }

  private prepareCustomActionForm(): FormGroup {
    return this.fb.group({
      emailTemplate: [{ value: '' }],
    });
  }

  get generalFrm() {
    return this.generalForm.controls;
  }

  get newTaskFrm() {
    return this.newTaskForm.controls;
  }

  getEmailDropDowns() {
    return new Observable(observer => {
      this._outBoundEmailService.getEmailDropDowns(this.encryptedUser, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID, this.loggedUser.teamCode)
        .then(async (result: EmailDropDownsResponse) => {
          if (result) {
            this.emailDropDownsResponse = UtilityService.clone(result);
            this.users = this.emailDropDownsResponse.userToList;

            var usersArray = this.users.map(x => Object.assign({}, x));
            var manipulatedArr = [];
            usersArray.map(function (e) {
              var splittedArr = e.value.split(/[:(]/, 2);
              e.value = splittedArr.length == 2 ? splittedArr[1] + ', ' + splittedArr[0] : splittedArr.length == 1 ? splittedArr[0] : e.value;
              manipulatedArr.push(e);
            })
            this.users = manipulatedArr;
            this.generalFormPatchValueByField('user');
            this.generalFormPatchValueByField('start');
            this.reminderFormPatchValueByField('viaAdditionalEmail');
            observer.next("success");
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    });
  }

  generalFormPatchValueByField(field) {

    if (field) {
      switch (field) {
        case "user":
          if (this.users.length > 0) {
            var user = this.users.find(x => x.key === this.loggedUser.cLPUserID);
            this.generalForm.patchValue({ user: user.key });
          }
          break;
        case "start": this.generalForm.patchValue({ start: new Date() }); break;
      }
    }

  }

  reminderFormPatchValueByField(field) {

    if (field) {
      switch (field) {
        case "viaAdditionalEmail": this.reminderForm.patchValue({ viaAdditionalEmail: this.contactFields.email.fieldValue }); break;
      }
    }

  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.updateValueAndValidity();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  public onTabSelect(e) {
  }

  //Sortable
  drop(event: CdkDragDrop<string[]>) {
    if (this.attendeesList.length > 1) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
    }
  }
  //Sortable

  generalFormSubmit() {
    this.validateAllFormFields(this.generalForm);
    if (this.generalForm.valid) {
      this.generalForm.markAsPristine();
    }
  }

  reminderFormSubmit() {
    this.validateAllFormFields(this.reminderForm);
    if (this.reminderForm.valid) {
      this.reminderForm.markAsPristine();
    }
  }

  newTaskFormSubmit() {
    this.validateAllFormFields(this.newTaskForm);
    if (this.newTaskForm.valid) {
      this.newTaskForm.markAsPristine();
    }
  }

  attendeesFormSubmit() {
    this.validateAllFormFields(this.attendeesForm);
    if (this.attendeesForm.valid) {
      this.attendeesForm.markAsPristine();
    }
  }

  customActionFormSubmit() {
    this.validateAllFormFields(this.customActionForm);
    if (this.customActionForm.valid) {
      this.customActionForm.markAsPristine();
    }
  }

}
