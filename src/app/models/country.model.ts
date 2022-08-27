import { GenericResponse } from "./genericResponse.model";

export interface Country {
  id: number;
  name: string;
  code: string;
  code2: string;
  code2Lower: string;
  dialCode: number;
  placeholder: string;
}


export interface CountryListResponse extends GenericResponse {
  countries: Country[];
}
