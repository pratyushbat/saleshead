import { Contact } from "./contact.model";
import { DropDownItem, SimpleResponse } from "./genericResponse.model";
import { ModelLink } from "./link-group.model";


export interface LinkContact {
  linkID: number;
  contactID: number;
  relationship: string;
  dtCreated: string;
}

export interface LinkContactExtWithCount extends ModelLink {
  firstName: string;
  lastName: string;
  numContacts: number;
}

export interface LinkContactExtended extends Contact {
  linkID: number;
  contactID: number;
  relationship: string;
  lastFirst: string;
  ufirstName: string;
  ulastName: string;
  companyType: number;
  dtCreated: string;
}

export interface LinkContactExtendedListResponse extends SimpleResponse {
  linkContactList: LinkContactExtended[];
}

export interface LinkContactWithCountExtListResponse extends SimpleResponse {
  linkContactList: LinkContactExtWithCount[];
  filter_Links: DropDownItem[];
}
