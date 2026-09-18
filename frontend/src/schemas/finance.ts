export type PlanInterval = 'MONTHLY' | 'YEARLY' | 'ONE_TIME';

export interface Plan {
  planId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: PlanInterval;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' | 'PAUSED';

export interface Subscription {
  subscriptionId: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  provider: string;
  providerCustomerId: string;
  providerSubscriptionId: string;
  renewalStatus: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Payment {
  paymentId: string;
  userId: string;
  planId: string;
  orderId: string;
  providerPaymentId: string;
  provider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  failureReason: string | null;
  metadata: Record<string, any>;
}

export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  userId: string;
  paymentId: string;
  subscriptionId: string;
  providerInvoiceId: string;
  amount: number;
  tax: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export type RefundStatus = 'REQUESTED' | 'PENDING' | 'PROCESSED' | 'FAILED' | 'CANCELLED';

export interface Refund {
  refundId: string;
  paymentId: string;
  userId: string;
  providerRefundId: string | null;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  requestedBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}
