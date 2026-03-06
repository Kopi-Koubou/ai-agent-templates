import { describe, expect, test } from "vitest";

import { getPaymentMethodLabel, PAYMENT_METHODS } from "@/lib/payment-methods";

describe("payment method helpers", () => {
  test("exposes supported payment methods", () => {
    expect(PAYMENT_METHODS).toEqual(["card", "apple-pay", "google-pay"]);
  });

  test("returns readable labels", () => {
    expect(getPaymentMethodLabel("card")).toBe("Credit card");
    expect(getPaymentMethodLabel("apple-pay")).toBe("Apple Pay");
    expect(getPaymentMethodLabel("google-pay")).toBe("Google Pay");
  });
});
