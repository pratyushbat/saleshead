export interface Ticket {
  ticketID: number;
  cLPCompanyID: number;
  cLPUserID: number;
  ticketDesc: string;
  ticketResponse: string;
  ticketCategory: number;
  ticketStatus: number;
  finder: string;
  fixer: string;
  unread: boolean;
  dtEntered: Date;
  dtLastModified: Date;
}

export interface TicketListResponse {
  tickets: Ticket[];
}

export interface TicketResponse {
  ticket: Ticket;
}
