import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found detail-panel empty-state">
      <h1>Template not found</h1>
      <p>The template you requested does not exist in this catalog.</p>
      <Link href="/templates" className="btn-ghost">
        Return to templates
      </Link>
    </section>
  );
}
