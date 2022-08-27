import { KeyValue } from "@angular/common";
import { keyValue } from "./search.model";

export interface CLPAnnounce {
  cLPAnnounceID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  cLPRole: number;
  userRole: number;
  announceTitle: string;
  announceDesc: string;
  announceType: number;
  learnMoreLink: string;
  takeMeThereLink: string;
  learnMoreLinkImgURL: string;
  takeMeThereLinkImgURL: string;
  actionBy: number;
  showDismiss: boolean;
  sOrder: number;
  status: number;
  dtModified: Date;
  dtCreated: Date;
  dtExpires: Date;


}

export interface CLPAnnounceResponse {
  clpAnnounce: CLPAnnounce[];
  filter_Account: keyValue[];
}
