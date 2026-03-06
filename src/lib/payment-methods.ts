export const PAYMENT_METHODS = ["card", "apple-pay", "google-pay"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "Credit card",
  "apple-pay": "Apple Pay",
  "google-pay": "Google Pay"
};

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method];
}
