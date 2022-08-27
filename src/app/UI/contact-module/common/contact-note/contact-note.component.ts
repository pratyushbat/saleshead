import { Component, HostBinding, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

import { filterAnimation, pageAnimations } from '../../../../animations/page.animation';

import { CLPUser } from '../../../../models/clpuser.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { Note, NoteFilterResponse, NoteListResponse } from '../../../../models/note.model';
import { NoteTypeCodeModel } from '../../../../models/noteTypeCode.model';

import { UtilityService } from '../../../../services/shared/utility.service';
import { LocalService } from '../../../../services/shared/local.service';
import { NotesService } from '../../../../services/notes.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-contact-note',
    templateUrl: './contact-note.component.html',
    styleUrls: ['./contact-note.component.css'],
    animations: [pageAnimations, filterAnimation]
})
/** contact-note component*/
export class ContactNoteComponent {
  /** contact-note ctor */
  @Input() loggedUser: CLPUser;
  @Input() ownerId: number = 0;
  @Input() isLeadTask: boolean = false;
  noteId: number = 0;
  noteForm: FormGroup;
  private encryptedUser: string = '';
  public datePickerformat = "MM/dd/yyyy HH:mm a";
  noteFilterResponse: NoteFilterResponse;
  noteTypeCodes: NoteTypeCodeModel[];
  note: Note = <Note>{};
  noteList: Note[];
  showNoteForm: boolean = false;
  isNoteSubmit: boolean = false;
  columns = [{ field: '$', title: '', width: '40' }
    , { field: 'noteSubject', title: 'Subject', width: '100' }
    , { field: 'noteDesc', title: 'Description', width: '40' }
    , { field: 'noteTypeCode', title: 'Type', width: '100' }
    , { field: 'dtCreated', title: 'Created Date', width: '40' }];
  reorderColumnName: string = 'noteSubject,noteDesc,noteTypeCode,dtCreated';
  //Animation
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  //Animation
  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    public _notesService: NotesService,
    public notifyService: NotificationService
  ) {
  }

  ngOnInit() {
    this.noteForm = this.prepareNoteForm();
    this.noteForm.reset();

    this._localService.getPristineForm().subscribe(res => {
      this._localService.genericFormValidationState(this.noteForm);
    });

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.getNoteFilters();
      this.getNoteList();
      }
      else
        this._router.navigate(['/unauthorized']);
   
  }

  private prepareNoteForm(): FormGroup {
    return this.fb.group({
      noteDateTime: [{ value: '' }],
      subject: [{ value: '' }, [Validators.required]],
      noteType: [{ value: '' }],
      note: [{ value: '' }, [Validators.required]]
    });
  }

  private formGroupPatchValue() {
    this.noteForm.patchValue({ noteDateTime: this.noteFilterResponse ? new Date(this.noteFilterResponse.currenTtime) : new Date() });
  }

  get noteFrm() {
    return this.noteForm.controls;
  }

  getNoteFilters() {
    this._notesService.getNoteFilters(this.encryptedUser, this.loggedUser?.cLPUserID, this.loggedUser?.cLPCompanyID)
      .then(async (result: NoteFilterResponse) => {
        if (result) {
          this.noteFilterResponse = UtilityService.clone(result);
          this.noteTypeCodes = this.noteFilterResponse.noteTypeCodes;
          this.formGroupPatchValue();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  getNoteList() {
    var ownerId = this.isLeadTask ? this.ownerId : 0;
    this._notesService.noteGetListByOwner(this.encryptedUser, this.loggedUser.cLPCompanyID, ownerId, 3, true)
      .then(async (result: NoteListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.noteList = response.notes;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  noteFormSubmit() {
    this._localService.validateAllFormFields(this.noteForm);
    if (this.noteForm.valid) {
      this.noteForm.markAsPristine();
      this.createNote();
    }
  }

  createNote() {
    this.copyDataObjectToNoteObject();
    this.isNoteSubmit = true;
    this._notesService.noteCreate(this.encryptedUser, this.note)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this.notifyService.showSuccess(this.noteId > 0 ? "Note updated successfully" : "Note created successfully", "", 5000);
          this.getNoteList();
          this.noteId = 0;
          this.noteForm.reset();
          this.noteForm.get('noteDateTime').setValue(this.noteFilterResponse ? new Date(this.noteFilterResponse.currenTtime) : new Date());
          this.prepareNoteForm();
          this.showNoteForm = false;
          this._localService.handledEventEmit(true);
        }
        this.isNoteSubmit = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.isNoteSubmit = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  onCloseNote() {
    this.noteForm.reset();
    this._localService.hideCommonComponentEmit('note');
    this.formGroupPatchValue();
    this._localService.showCommonComp = '';
  }

  copyDataObjectToNoteObject() {
    this.note.noteID = this.noteId > 0 ? this.noteId : 0;
    this.note.cLPUserID = this.loggedUser ? this.loggedUser.cLPUserID : 0;
    this.note.cLPCompanyID = this.loggedUser ? this.loggedUser.cLPCompanyID : 0;
    this.note.ownerID = this.ownerId ? this.ownerId : 0;
    this.note.ownerType = this.isLeadTask ? 3 : 2;
    this.note.noteTypeCode = this.noteForm.controls.noteType.value ? this.noteForm.controls.noteType.value : 0;
    this.note.noteSubject = this.noteForm.controls.subject.value ? this.noteForm.controls.subject.value : '';
    this.note.noteDesc = this.noteForm.controls.note.value ? this.noteForm.controls.note.value : '';
  }

  getType(value) {
    return this.noteTypeCodes.filter(x => x.noteTypeCode == value)[0].display;
  }

  noteGridCRUD(type, row, index) {
    if (type) {
      this.noteId = row.noteID;
      switch (type) {
        case "edit":
          this.showNoteForm = true;
          this.noteForm.patchValue({
            noteDateTime: new Date(row.dtCreated),
            subject: row.noteSubject,
            note: row.noteDesc,
            noteType: row.noteTypeCode > 0 ? row.noteTypeCode : null,
          });
          break;
        case "delete":
          break;
      }
    }
  }

  addNewHandler() {
    this.noteId = 0;
    this.noteForm.reset();
    this.prepareNoteForm();
    this.showNoteForm = true;
  }

  onCancel() {
    this.noteForm.reset();
    this.showNoteForm = false;
  }
}
