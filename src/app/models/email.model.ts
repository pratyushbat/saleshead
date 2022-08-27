import { CLPUser } from "./clpUser.model";
import { GenericResponse } from "./genericResponse.model";

export interface EmailDetails {
  subject: string,
  message: string,
  toList: string,
  from: string
}

export interface EmailResponse extends GenericResponse {
  emailDetails: EmailDetails;
  contactId?: number;
  emailStatus: boolean;
  currentUser: CLPUser;
}

