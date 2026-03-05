import { BundleCheckoutForm } from "@/components/bundle-checkout-form";
import { CheckoutForm } from "@/components/checkout-form";
import { templates } from "@/data/templates";
import { listPublishedBundleDetails } from "@/lib/bundles";

interface CheckoutPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const bundles = listPublishedBundleDetails();
  const resolvedSearchParams = await searchParams;
  const initialTemplateParam = resolvedSearchParams.template;
  const initialTemplateSlug = Array.isArray(initialTemplateParam)
    ? initialTemplateParam[0]
    : initialTemplateParam;
  const initialBundleParam = resolvedSearchParams.bundle;
  const initialBundleSlug = Array.isArray(initialBundleParam)
    ? initialBundleParam[0]
    : initialBundleParam;

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

      <CheckoutForm
        templates={templates}
        initialTemplateSlug={initialTemplateSlug}
      />
      <BundleCheckoutForm
        bundles={bundles}
        initialBundleSlug={initialBundleSlug}
      />
    </section>
  );
}
