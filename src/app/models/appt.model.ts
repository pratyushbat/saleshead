import { SimpleResponse } from "./genericResponse.model";
  export interface Appt {
    apptID: number;
    cLPUserID: number;
    cLPCompanyID: number;
    category: number;
    generalTypeCode: number;
    contactTypeCode: number;
    leadTypeCode: number;
    proposalTypeCode: number;
    projectTypeCode: number;
    typeID: number;
    strApptStartTime: string;
    apptStartTime: Date;
    apptEndTime: Date;
    isAllDay: boolean;
    isPhoneCall: boolean;
    isPrivate: boolean;
    subject: string;
    location: string;
    notes: string;
    leadID: number;
    contactID: number;
    projectID: number;
    proposalID: number;
    reminderCLP: boolean;
    reminderEmail: boolean;
    reminderTime: Date;
    reminderEmails: string;
    reminderSent: boolean;
    reminderNote: string;
    reminderEmailTemplateID: number;
    showNoteInUserReminder: boolean;
    inApptTemplateID: number;
    documentList: string;
    rApptID: number;
    check1: boolean;
    check2: boolean;
    check3: boolean;
    class1: number;
    status: number;
    campaignID: number;
    campaignEventID: number;
    runID: number;
    dtCreated: string;
    isTxtMsgReminder: boolean;
    isTxtMsgUserReminder: boolean;
    reminderTxtMsgTemplateID: number;
    isOverDue: boolean;
  }


  export interface ApptResponse extends SimpleResponse {
    appts: Appt[];
  }
