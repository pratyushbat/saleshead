import { GenericResponse, SimpleResponse } from "./genericResponse.model";

export interface SignupMsg {
  mobile: string;
  securityCode: string;
  sentToCarrier: boolean;
  countryCode: string;
  dtCreated: Date;
}

export interface SignupMsgResponse extends SimpleResponse {
  signupMsgId: number;
  verified: boolean;
}

export interface LongCodeResponse extends GenericResponse {
  longcodes: string[];
}

export interface SignupDuplicateCheck {
  mobile: string;
  email: string;
  /*  countryCode: string;*/
  country: string;
}


