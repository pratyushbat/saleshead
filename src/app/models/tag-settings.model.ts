import { SimpleResponse } from "./genericResponse.model";

export interface TagsMgmt {
  tagID: number;
  tag: string;
  contact: number;
}

export interface TagsListResponse extends SimpleResponse {
  tags: TagsMgmt[];
}

export interface TagsFields {
  cLPCompanyID: number;
  ownerType: number;
  tag: string;
  tagID: number;
	}
