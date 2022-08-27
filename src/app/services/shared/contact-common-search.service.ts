import { EventEmitter, Injectable } from '@angular/core';
import { ContactList } from '../../models/contact.model';
import { SearchQueryResponse } from '../../models/search.model';

@Injectable({ providedIn:'root' })
export class ContactCommonSearchService {

  contactListChanged: EventEmitter<ContactList[]> = new EventEmitter<ContactList[]>();
  queryListChanged: EventEmitter<SearchQueryResponse> = new EventEmitter<SearchQueryResponse>();
  queryLeadListChanged: EventEmitter<SearchQueryResponse> = new EventEmitter<SearchQueryResponse>();

  constructor() {

  }

  emitcontactListChangeEvent(contactList:ContactList[]) {
    this.contactListChanged.emit(contactList);
  }
  getcontactListChangeEmitter() {
    return this.contactListChanged;
  }

  emitQueryListChangedChangeEvent(searchQueryResponse: SearchQueryResponse) {
    this.queryListChanged.emit(searchQueryResponse);
  }

  getqueryListChangedChangeEmitter() {
    return this.queryListChanged;
  }
  emitqueryLeadListChangedChangeEvent(searchQueryResponse: SearchQueryResponse) {
    this.queryLeadListChanged.emit(searchQueryResponse);
  }

  getqueryLeadListChangedChangeEmitter() {
    return this.queryLeadListChanged;
  }
}
