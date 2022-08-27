import { DropDownItem } from "./genericResponse.model";

export interface ModelLink {
  linkID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  linkName: string;
  isShareable: boolean;
  dtModified: string;
  dtCreated: string;
}

export interface LinkEmailFilterResponse {
  filterEmailTemplates: DropDownItem[];
  filterLinks: DropDownItem[];
  toLink: string;
  fromEmail: string;
  emailBody: string;
}
