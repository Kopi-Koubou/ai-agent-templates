import { CheckoutForm } from "@/components/checkout-form";
import { templates } from "@/data/templates";

export default function CheckoutPage() {
  return (
    <section>
      <header className="catalog-header">
        <p className="eyebrow">Checkout</p>
        <h1>Mock payment and download flow</h1>
        <p>
          Stripe/Supabase hooks are intentionally mocked for local implementation testing,
          while keeping route contracts ready for production integrations.
        </p>
      </header>

      <CheckoutForm templates={templates} />
    </section>
  );
}
