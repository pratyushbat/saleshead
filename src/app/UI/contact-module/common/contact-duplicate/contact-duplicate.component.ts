import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CLPUser } from '../../../../models/clpuser.model';
import { DuplicateContactChild, DuplicateContactsContainer, DuplicateContactsHeader, MergeDuplicateContacts } from '../../../../models/contact.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { SearchQueryResponse } from '../../../../models/search.model';
import { ContactService } from '../../../../services/contact.service';
import { NotificationService } from '../../../../services/notification.service';
import { ContactCommonSearchService } from '../../../../services/shared/contact-common-search.service';
import { UtilityService } from '../../../../services/shared/utility.service';
declare var $: any;
@Component({
  selector: 'contact-duplicate',
  templateUrl: './contact-duplicate.component.html',
  styleUrls: ['./contact-duplicate.component.css']

})
export class ContactDuplicateComponent implements OnInit, OnDestroy {
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  queryDataLoaded: SearchQueryResponse;
  duplicateContacts: DuplicateContactsHeader[];
  step: number = 1;
  isShowConfigure: boolean = false;
  isRecordDuplicates: boolean = false;

  columns = [
    { field: '$', title: ' ', width: '40' },
    { field: 'emailORMobile', title: 'Name', width: '250' },
    { field: 'count', title: 'Email', width: '70' },
    { field: 'select', title: 'Company', width: '350' },

  ];

  columnChild = [
    { field: '$', title: ' ', width: '40' },
    { field: 'lastFirst', title: 'Name', width: '70' },
    { field: 'mobile', title: 'Mobile', width: '350' },
    { field: 'email', title: 'Email', width: '350' },
    { field: 'companyName', title: 'Company', width: '350' },
    { field: 'contactID', title: 'Owner', width: '350' },
    { field: 'dtCreated', title: 'Date Created', width: '150' },

  ];

  columnChildStep2 = [
    { field: '$', title: ' ', width: '40' },
    { field: 'lastFirst', title: 'Name', width: '150' },
    { field: 'mobile', title: 'Mobile', width: '150' },
    { field: 'email', title: 'Email', width: '100' },
    { field: 'companyName', title: 'Company', width: '100' },
    { field: 'contactID', title: 'Owner', width: '100' },
    { field: 'dtCreated', title: 'Date Created', width: '100' },
    { field: 'keep', title: 'Keep', width: '70' },
    { field: 'merge', title: 'Merge', width: '70' },
    { field: 'ignore', title: 'Ignore', width: '70' },

  ];
  selectedContactsToMerge: DuplicateContactChild[] = [];
  mergeDuplicateContacts: MergeDuplicateContacts = { keepContactID:0,MergeContactIDs:[] } as MergeDuplicateContacts;
  showDefaultMergeWarning: boolean;
  subscriptionQueryList: any;
    mobileColumnNames: string[];
    mobileColumnChildNames: string[];

  constructor(private cd: ChangeDetectorRef, private _contactService: ContactService, private _utilityService: UtilityService, public notifyService: NotificationService, public _contactCommonSearchService: ContactCommonSearchService, private _ngZone: NgZone) {    }

  ngOnInit() {
    this.subscriptionQueryList = this._contactCommonSearchService.getqueryListChangedChangeEmitter().subscribe((data) => {
      this._ngZone.run(() => {
        this.queryDataLoaded = data;
        this.getQueryData();
      })
    });
  }

  ngOnDestroy() {
    this.subscriptionQueryList.unsubscribe();
  }

  cbClick(event, type: string, index: number) {
    if (type == 'merge') {
      if (event.target.checked) {
        var inputValue = (<HTMLInputElement>document.getElementById(event.target.id));
        inputValue.checked = true;
        if (this.mergeDuplicateContacts.keepContactID == this.selectedContactsToMerge[index].contactID) {
          this.mergeDuplicateContacts.keepContactID = 0;
        }
        this.mergeDuplicateContacts.MergeContactIDs.push(this.selectedContactsToMerge[index].contactID);
       
        var keepValue = (<HTMLInputElement>document.getElementById('keepId' + index));
        keepValue.checked = false;

        var ignoreValue = (<HTMLInputElement>document.getElementById('ignoreId' + index));
        ignoreValue.checked = false;

      } else {
        var indexMergeIds = this.mergeDuplicateContacts.MergeContactIDs.indexOf(this.selectedContactsToMerge[index].contactID);
        if (indexMergeIds !== -1) {
          this.mergeDuplicateContacts.MergeContactIDs.splice(indexMergeIds, 1);
        }
      }
    }
    else if (type == 'keep') {
      if (event.target.checked) {
        var mergeValue = (<HTMLInputElement>document.getElementById('mergeId' + index));
        mergeValue.checked = false;

        var ignoreValue = (<HTMLInputElement>document.getElementById('ignoreId' + index));
        ignoreValue.checked = false;

        this.selectedContactsToMerge.forEach((val, indx) => {
          var keepValue = (<HTMLInputElement>document.getElementById('keepId' + indx));
          if (indx == index) {
            keepValue.checked = true;

            var indexMergeIds = this.mergeDuplicateContacts.MergeContactIDs.indexOf(this.selectedContactsToMerge[indx].contactID);
            if (indexMergeIds !== -1) {
              this.mergeDuplicateContacts.MergeContactIDs.splice(indexMergeIds, 1);
            }
            this.mergeDuplicateContacts.keepContactID = this.selectedContactsToMerge[indx].contactID;
          }
          else
            keepValue.checked = false;
        }
        );
      } else {
        if (this.mergeDuplicateContacts.keepContactID == this.selectedContactsToMerge[index].contactID) {
          this.mergeDuplicateContacts.keepContactID = 0;
        }
      }
    }
    else if (type == 'ignore') {
      if (event.target.checked) {
        var keepValue = (<HTMLInputElement>document.getElementById('keepId' + index));
        keepValue.checked = false;

        var mergeValue = (<HTMLInputElement>document.getElementById('mergeId' + index));
        mergeValue.checked = false;

        var indexMergeIds = this.mergeDuplicateContacts.MergeContactIDs.indexOf(this.selectedContactsToMerge[index].contactID);
        if (indexMergeIds !== -1) {
          this.mergeDuplicateContacts.MergeContactIDs.splice(indexMergeIds, 1);
        }


        if (this.mergeDuplicateContacts.keepContactID == this.selectedContactsToMerge[index].contactID) {
          this.mergeDuplicateContacts.keepContactID = 0;
        }


      } else {
        console.log('ignore unchecked: ' + event.target.id);
      }
    }
  }


  async getQueryData() {
    this.showSpinner = true;
    await this._contactService.duplicateContactSearch(this.encryptedUser, this.queryDataLoaded, this.user.cLPUserID, this.user.cLPCompanyID)
      .then(async (result: DuplicateContactsContainer) => {
        if (result) {

          var res = UtilityService.clone(result);
          this.duplicateContacts = res.duplicateContactsHeaders;
          this.mobileColumnNames = ['emailORMobile', 'count'];
          this.mobileColumnChildNames = ['lastFirst', 'contactID'];
          if (this.duplicateContacts?.length > 0) {
            this.isRecordDuplicates = false;
            this.step = 2;
          }
          else {
            this.isRecordDuplicates = true;         
            this.step = 1;
          }      
        }
        this.showSpinner = false
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  setSelectedContacts(event, dataItem, index) {
    if (event.target.checked) {
      this.selectedContactsToMerge = dataItem.subItems;
      this.isShowConfigure = true;
      this.duplicateContacts.forEach((val, indx) => {
        var companyValue = (<HTMLInputElement>document.getElementById('companyId' + indx));
        if (indx == index)
          companyValue.checked = true;
        else
          companyValue.checked = false;
      });
    } else {
      this.isShowConfigure = false;
      console.log('ignore unchecked: ' + event.target.id);
    }
  }

  configureMerge() {      
    if (this.isShowConfigure)
      this.step = 3;
    else
      this.notifyService.showError('Please select one set of duplicates to configure by selecting one of the checkboxes below.', 'Select atlease one checkbox', 1000);
  }

  checkbxCompareCheck() {
    
    this.showDefaultMergeWarning = false;
    this.selectedContactsToMerge.forEach((val, indx) => {
      var keepValue = (<HTMLInputElement> document.getElementById('keepId' + indx));
      var mergeValue = (<HTMLInputElement> document.getElementById('mergeId' + indx));
      var ignoreValue = (<HTMLInputElement> document.getElementById('ignoreId' + indx));
      if (!keepValue.checked && !mergeValue.checked && !ignoreValue.checked)
        this.showDefaultMergeWarning = true;
    });
  }

  executeMerge() {
    this.checkbxCompareCheck();
    if (this.showDefaultMergeWarning) {
      this.showDefaultMergeWarning = true;
      this.notifyService.showError('Please select at one action for each contact.', 'Select atlease one action', 3000);
    }
    else {
      this.step = 4;
    }

  }
  confirmExecuteMerge() {
    this.mergeContactApi();
  }

  async mergeContactApi() {
    this.showSpinner = true;
    await this._contactService.duplicateMergeContacts(this.encryptedUser, this.mergeDuplicateContacts, this.user.cLPUserID, this.user.slurpyUserId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this.notifyService.showSuccess('Contact Merged successfully', 'Merge Action Completed', 3000);
          this.showSpinner = false;
          this.duplicateContacts = [];
          this.step = 1;
          this.mergeDuplicateContacts.keepContactID = 0;
          this.mergeDuplicateContacts.MergeContactIDs = [];
          this.isShowConfigure = false

        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

}
