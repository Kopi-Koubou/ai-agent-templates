import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { loadProjectBrandThemeTokens } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentVault",
  description: "Marketplace MVP for production-ready AI agent templates"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandThemeTokens = await loadProjectBrandThemeTokens();
  const themeStyle = brandThemeTokens as CSSProperties | undefined;

  return (
    <html lang="en" style={themeStyle}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="page-shell">
          <header className="site-header">
            <Link href="/" className="brand">
              AgentVault
            </Link>
            <nav aria-label="Primary">
              <Link href="/templates">Templates</Link>
              <Link href="/bundles">Bundles</Link>
              <Link href="/checkout">Checkout</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/seller">Seller</Link>
            </nav>
          </header>

          <main id="main-content">{children}</main>

          <footer className="site-footer">
            <p>AgentVault MVP implementation for pipeline stage validation.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
