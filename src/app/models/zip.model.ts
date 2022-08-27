import { GenericResponse } from "./genericResponse.model";

export interface ZipCode {
  zip: number;
  city: string;
  state: string;
}

export interface ZipCodeResponse extends GenericResponse
{
  zipCode: ZipCode;
}
