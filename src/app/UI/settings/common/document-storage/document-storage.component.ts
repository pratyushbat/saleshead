import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { DocumentStorage, DocumentStorageResponse } from '../../../../models/storage.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-document-storage',
    templateUrl: './document-storage.component.html',
    styleUrls: ['./document-storage.component.css']
})
/** document-storage component*/
export class DocumentStorageComponent implements OnInit {
  /** document-storage ctor */
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  private encryptedUser: string = '';
  showSpinner: boolean = false;
  docStorageForm = new FormGroup({});

  documentStorageResponse: DocumentStorageResponse;
  documentStorage: DocumentStorage;

  constructor(
    public _router: Router,
    public fb: FormBuilder,
    public _localService: LocalService,
    public _notifyService: NotificationService,
    public _accountSetupService: AccountSetupService,
    public _utilityService: UtilityService,
  ) {

  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.docStorageForm = this.prepareDocStorageForm();
      this.docStorageForm.reset();
      this.getDocumentStorage();
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  prepareDocStorageForm() {
    return this.fb.group({
      companyStorageLimit: [{ value: 0 }],
      userStorageLimit: [{ value: 0 }, [Validators.required]]
    });
  }

  get docStorageFormFrm() {
    return this.docStorageForm.controls;
  }

  getDocumentStorage() {
    this.showSpinner = true;
    this._accountSetupService.getDocumentStorage(this.encryptedUser, this._localService.selectedAdminCompanyId)
      .then(async (result: DocumentStorageResponse) => {
      if (result) {
        this.documentStorageResponse = UtilityService.clone(result);
        this.documentStorage = this.documentStorageResponse.documentStorage;
        this.patchFormValue();
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

  patchFormValue() {
    if (!isNullOrUndefined(this.documentStorage)) {
      this.docStorageForm.get('companyStorageLimit').setValue(this.documentStorage.companyStorageLimit);
      this.docStorageForm.get('userStorageLimit').setValue(this.documentStorage.userStorageLimit);
    }
  }

  docStorageFormSubmit() {
    this._localService.validateAllFormFields(this.docStorageForm);
    if (this.docStorageForm.valid && this._localService.selectedAdminCompanyId >= 0) {
      this.docStorageForm.markAsPristine();
      $('#docStorageConfirmModal').modal('show');
    }
    else
      this._notifyService.showError("Invalid Apply credit transaction Fields.", "", 3000);
  }

  onConfirmDocStorage() {
    var companyStorageLimit: number = +this.docStorageForm?.controls?.companyStorageLimit?.value;
    var userStorageLimit: number = +this.docStorageForm?.controls?.userStorageLimit?.value;

    this.showSpinner = true;
    this._accountSetupService.updateDocumentStorage(this.encryptedUser, this._localService.selectedAdminCompanyId, companyStorageLimit, userStorageLimit)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (response.messageBool == false) {
            this._notifyService.showError(response.messageString ? response.messageString : 'Some error occured.', "", 3000);
            this.showSpinner = false;
            return;
          }
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Document storage saved successfully.", "", 3000);
          this.docStorageForm.reset();
          this.docStorageForm.markAsPristine();
          this.docStorageForm.markAsUntouched();
          this.showSpinner = false;
          this.getDocumentStorage();
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
