import { SimpleResponse } from "./genericResponse.model";
import { keyValue } from "./search.model";
import { SOImageDocument } from "./soImageDocument.model";

export interface TextMsgFilters extends SimpleResponse {
  toChoiceDropDown: keyValue[];
  templateFilter: keyValue[];
  imageFilter: SOImageDocument[];
  smsLongCode: string;
}

export interface TextMsgFiltersResponse extends SimpleResponse {
  txtMsgFilters: TextMsgFilters;
}
