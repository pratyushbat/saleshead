import { keyValue } from "./search.model";

export interface GenericResponse {
  statusCode: number,
  errorMsg: string
}

export interface SimpleResponse extends GenericResponse {
  messageString: string,
  messageString2: string,
  messageString3: string,
  messageString4: string,
  messageString5: string,
  messageInt: number,
  messageInt2: number,
  messageLong: number,
  messageBool: boolean,
  //contact-module
  list: keyValue[];
  dictionary: any[];
}

export interface GenericObject {
  messageString: string,
  messageInt: number,
  messageBool: boolean
}
export interface DropDownItem {
  value: string;
  text: string;
}

export interface UserDD {
  value: number;
  text: string;
    }

