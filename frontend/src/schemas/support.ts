export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'ACCOUNT' | 'LOGIN' | 'PROFILE' | 'JOBS' | 'APPLICATIONS' | 'MESSAGING' | 'PAYMENTS' | 'VERIFICATION' | 'SAFETY' | 'TECHNICAL' | 'OTHER';

export interface SupportMessage {
  messageId: string;
  senderUid: string;
  isInternalNote: boolean;
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  ticketId: string;
  ticketNumber: string;
  requesterUid: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAdminUid: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}
